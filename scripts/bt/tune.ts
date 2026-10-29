/**
 * Iterative, out-of-sample-gated tuning of every bot strategy (grid/dca excluded).
 *   node scripts/bt/fetch-data.mjs                      # once: 8 pairs × (1h·365j, 15m·90j)
 *   node --experimental-strip-types scripts/bt/tune.ts [--kinds=ema,rsi] [--rounds=2] [--check]
 * Base = current defaultParams(kind). Candidates are ranked on IN-SAMPLE PnL; a candidate
 * is kept only if OUT-OF-SAMPLE it also beats the base (net of 0.4% fees) on the sum AND on
 * most datasets, without a meaningfully worse max drawdown. Writes scripts/bt/results/.
 */
import { Worker } from "node:worker_threads";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { BOT_KINDS, defaultParams, paramVariants } from "../../src/lib/trading/bots.ts";
import type { BotKind, BotParams } from "../../src/lib/trading/types.ts";
import { DATASETS, agg, type DsResult } from "./lib.ts";

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}`))?.split("=")[1];
const ROUNDS = Number(arg("rounds") ?? 2);
const TOP = 4; // IS-best candidates tried out-of-sample per round
const CHECK = process.argv.includes("--check");
const kinds = (arg("kinds")?.split(",") ?? BOT_KINDS.map((k) => k.id)).filter((k) => k !== "grid" && k !== "dca") as BotKind[];

// ---- worker pool
const N = Math.max(1, Math.min(7, cpus().length - 1));
const workers = Array.from({ length: N }, () => new Worker(new URL("./worker.ts", import.meta.url), { execArgv: ["--experimental-strip-types", "--no-warnings"], resourceLimits: { maxOldGenerationSizeMb: 600 } }));
let seq = 0;
const pending = new Map<number, (r: DsResult) => void>();
const queue: { id: number; kind: BotKind; params: BotParams; ds: string }[] = [];
const idle = [...workers];
for (const w of workers) w.on("message", (m: { id: number; res?: DsResult; err?: string }) => {
  if (m.err) throw new Error(m.err);
  pending.get(m.id)!(m.res!); pending.delete(m.id); idle.push(w); pump();
});
function pump() { while (idle.length && queue.length) idle.pop()!.postMessage(queue.shift()); }
function evalAll(kind: BotKind, params: BotParams): Promise<DsResult[]> {
  return Promise.all(DATASETS.map((d) => new Promise<DsResult>((res) => {
    const id = ++seq; pending.set(id, res); queue.push({ id, kind, params, ds: d.id }); pump();
  })));
}

// ---- candidates
function candidates(kind: BotKind, base: BotParams): { label: string; params: BotParams }[] {
  const out: { label: string; params: BotParams }[] = [];
  const add = (label: string, p: Partial<BotParams>) => out.push({ label, params: { ...base, ...p } });
  for (const v of paramVariants(kind, base).slice(1)) if (!v.label.startsWith("tendance")) out.push(v);
  out.splice(10);
  add("trend off", { trendFilter: "off" });
  add("trend strict", { trendFilter: "strict" });
  add("stop ATR×1.5", { slAtr: 1.5, slPct: 0 });
  add("stop ATR×3", { slAtr: 3, slPct: 0 });
  add("stop 2%", { slPct: 2, slAtr: 0 });
  add("trailing 2%", { trailingPct: 2 });
  add("trailing 4%", { trailingPct: 4 });
  add("TP 4%", { tpPct: 4 });
  add("TP 8%", { tpPct: 8 });
  add("BE off", { beAfterPct: 0 });
  add("BE 2.5%", { beAfterPct: 2.5 });
  add("cooldown 4h", { cooldownSec: 4 * 3600 });
  add("ADX ≥ 22", { adxFloor: 22 });
  add("ADX ≤ 25", { adxCeil: 25 });
  add("hold ≤ 48h", { maxHoldMin: 48 * 60 });
  add("EMA200 regime", { trendEma: 200 });
  add("EMA100 regime", { trendEma: 100 });
  // signal-parameter candidates for the kinds paramVariants doesn't cover
  if (kind === "volume") for (const v of [2, 3]) add(`volume ×${v}`, { volMult: v });
  if (kind === "roc") for (const n of [9, 21]) add(`ROC ${n}`, { rocPeriod: n });
  if (kind === "williams") for (const n of [21, 28]) add(`%R ${n}`, { wrPeriod: n });
  if (kind === "obv") add("EMA 21", { fast: 21 });
  // drop no-op candidates (same params as base)
  const key = (p: BotParams) => JSON.stringify(Object.entries(p).sort());
  const seen = new Set([key(base)]);
  // Reject a degenerate ADX window (floor and ceiling < 10 apart): it only "wins" by almost never trading.
  const sane = (p: BotParams) => !((p.adxFloor ?? 0) > 0 && (p.adxCeil ?? 0) > 0 && (p.adxCeil ?? 0) - (p.adxFloor ?? 0) < 10);
  return out.filter((c) => sane(c.params) && !seen.has(key(c.params)) && (seen.add(key(c.params)), true));
}

function accept(base: DsResult[], cand: DsResult[]): { ok: boolean; why: string } {
  const b = agg(base, "oos"), c = agg(cand, "oos"), bi = agg(base, "is"), ci = agg(cand, "is");
  if (ci.pnl <= bi.pnl) return { ok: false, why: "IS pas meilleur" };
  const margin = Math.max(25, 0.05 * Math.abs(b.pnl));
  if (c.pnl < b.pnl + margin) return { ok: false, why: `OOS ${c.pnl.toFixed(0)} vs ${b.pnl.toFixed(0)}` };
  let better = 0, worse = 0;
  cand.forEach((r, i) => { const d = r.oos.pnl - base[i]!.oos.pnl; if (d > 1) better++; else if (d < -1) worse++; });
  if (better < worse * 1.5 || better < 5) return { ok: false, why: `OOS datasets +${better}/-${worse}` };
  if (c.dd > b.dd * 1.15 + 0.5) return { ok: false, why: `DD ${c.dd.toFixed(1)} vs ${b.dd.toFixed(1)}` };
  if (c.trades < Math.max(16, 0.3 * b.trades)) return { ok: false, why: "trop peu de trades" };
  return { ok: true, why: `OOS +${(c.pnl - b.pnl).toFixed(0)}, datasets +${better}/-${worse}` };
}

mkdirSync(new URL("./results/", import.meta.url), { recursive: true });
const summary: Record<string, unknown> = {};
for (const kind of kinds) {
  const t0 = Date.now();
  const out = new URL(`./results/${kind}.json`, import.meta.url);
  if (!CHECK && !process.argv.includes("--force") && existsSync(out)) { summary[kind] = JSON.parse(readFileSync(out, "utf8")); continue; } // resumable
  const defaults = defaultParams(kind, 100);
  let base = defaults;
  let baseRes = await evalAll(kind, base);
  const before = { is: agg(baseRes, "is"), oos: agg(baseRes, "oos") };
  const kept: string[] = [], rejected: string[] = [];
  for (let round = 0; !CHECK && round < ROUNDS; round++) {
    const cands = candidates(kind, base);
    const scored = await Promise.all(cands.map(async (c) => ({ ...c, res: await evalAll(kind, c.params) })));
    // Rank on in-sample only; drop candidates that mostly stop trading (a silent bot "wins" by doing nothing).
    const minIs = Math.max(16, 0.3 * agg(baseRes, "is").trades);
    const eligible = scored.filter((c) => agg(c.res, "is").trades >= minIs);
    eligible.sort((a, b) => agg(b.res, "is").pnl - agg(a.res, "is").pnl);
    let took = false;
    for (const c of eligible.slice(0, TOP)) {
      const v = accept(baseRes, c.res);
      if (v.ok) { kept.push(`${c.label} (${v.why})`); base = c.params; baseRes = c.res; took = true; break; }
      rejected.push(`${c.label}: ${v.why}`);
    }
    if (!took) break;
  }
  const after = { is: agg(baseRes, "is"), oos: agg(baseRes, "oos") };
  const diff = Object.fromEntries(Object.entries(base).filter(([k, v]) => JSON.stringify((defaults as Record<string, unknown>)[k]) !== JSON.stringify(v)));
  summary[kind] = { before, after, kept, rejected, diff, perDataset: baseRes };
  console.log(kind, `${((Date.now() - t0) / 1000).toFixed(0)}s`, "OOS", before.oos.pnl.toFixed(0), "→", after.oos.pnl.toFixed(0), JSON.stringify(diff));
  if (!CHECK) writeFileSync(out, JSON.stringify(summary[kind], null, 1));
}
const f = (a: { pnl: number; trades: number; dd: number; win: number }) => `${a.pnl.toFixed(0)} / ${a.trades} / ${a.dd.toFixed(1)} / ${a.win.toFixed(0)}`;
const md = ["| bot | IS avant (PnL, trades, DD%, win%) | IS après | OOS avant | OOS après | changement |", "|---|---|---|---|---|---|"];
for (const [k, s] of Object.entries(summary) as [string, { before: any; after: any; diff: object }][]) md.push(`| ${k} | ${f(s.before.is)} | ${f(s.after.is)} | ${f(s.before.oos)} | ${f(s.after.oos)} | ${JSON.stringify(s.diff)} |`);
writeFileSync(new URL(`./results/${CHECK ? "check" : "summary"}-${kinds.length === 26 ? "all" : kinds.join("_")}.md`, import.meta.url), md.join("\n") + "\n");
console.log(md.join("\n"));
await Promise.all(workers.map((w) => w.terminate()));
