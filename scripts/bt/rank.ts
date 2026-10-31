/**
 * Classement de toutes les stratégies (réglages par défaut actuels), IS et OOS, net de frais.
 *   node --experimental-strip-types scripts/bt/rank.ts [--kinds=rsi,ema]
 * grid exclu (fourchette fixe autour d'un prix : sans sens sur un an de données).
 * Écrit scripts/bt/results/rank.json et rank.md.
 */
import { Worker } from "node:worker_threads";
import { cpus } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";
import { BOT_KINDS, defaultParams } from "../../src/lib/trading/bots.ts";
import type { BotKind } from "../../src/lib/trading/types.ts";
import { DATASETS, agg, type DsResult } from "./lib.ts";

const arg = process.argv.find((a) => a.startsWith("--kinds="))?.split("=")[1];
const kinds = (arg?.split(",") ?? BOT_KINDS.map((k) => k.id)).filter((k) => k !== "grid") as BotKind[];
const N = Math.max(1, Math.min(7, cpus().length - 1));
const workers = Array.from({ length: N }, () => new Worker(new URL("./worker.ts", import.meta.url), { execArgv: ["--experimental-strip-types", "--no-warnings"], resourceLimits: { maxOldGenerationSizeMb: 600 } }));
let seq = 0;
const pending = new Map<number, (r: DsResult) => void>();
const queue: unknown[] = [];
const idle = [...workers];
for (const w of workers) w.on("message", (m: { id: number; res?: DsResult; err?: string }) => {
  if (m.err) throw new Error(m.err);
  pending.get(m.id)!(m.res!); pending.delete(m.id); idle.push(w); pump();
});
function pump() { while (idle.length && queue.length) idle.pop()!.postMessage(queue.shift()); }

const rows = await Promise.all(kinds.map(async (kind) => {
  const params = defaultParams(kind, 100);
  const res = await Promise.all(DATASETS.map((d) => new Promise<DsResult>((r) => { const id = ++seq; pending.set(id, r); queue.push({ id, kind, params, ds: d.id }); pump(); })));
  const oos = agg(res, "oos");
  return { kind, is: agg(res, "is"), oos, positive: res.filter((x) => x.oos.pnl > 0).length, perDataset: res };
}));
rows.sort((a, b) => b.oos.pnl - a.oos.pnl);
mkdirSync(new URL("./results/", import.meta.url), { recursive: true });
writeFileSync(new URL("./results/rank.json", import.meta.url), JSON.stringify(rows, null, 1));
const f = (n: number) => n.toFixed(0);
const md = ["| # | bot | OOS PnL | trades | DD max % | win % | jeux OOS > 0 | IS PnL | IS trades |", "|---|---|---|---|---|---|---|---|---|"];
rows.forEach((r, i) => md.push(`| ${i + 1} | ${r.kind} | ${f(r.oos.pnl)} | ${r.oos.trades} | ${r.oos.dd.toFixed(2)} | ${f(r.oos.win)} | ${r.positive}/${DATASETS.length} | ${f(r.is.pnl)} | ${r.is.trades} |`));
writeFileSync(new URL("./results/rank.md", import.meta.url), md.join("\n") + "\n");
console.log(md.join("\n"));
await Promise.all(workers.map((w) => w.terminate()));
