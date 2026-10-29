import { PAIR_BY_ID } from "../pairs.ts";
import type { Bot, BotKind, BotParams, Candle } from "../types.ts";
import { BOT_KINDS, defaultParams } from "./catalog.ts";
import { EMPTY_STATS } from "./common.ts";
import type { BotEvalCtx } from "./common.ts";
import { evaluateBot } from "./evaluate.ts";
import { applyPaperFill, paperEquity, resetPaperAccount } from "./paper.ts";
import { riskRatios } from "./stats.ts";

export type BacktestResult = {
  trades: number;
  buys: number;
  sells: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  pnlPct: number;
  realizedPnl: number;
  fees: number;
  equity: number;
  startEquity: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  buyHoldPnl: number;
  buyHoldPct: number;
  bars: number;
  from: number;
  to: number;
  interval: number;
  requestedDays: number;
  exposurePct: number;
  equityCurve: { t: number; v: number }[];
  tradeLog: { time: number; side: "buy" | "sell"; price: number; pnl: number; note: string }[];
  openQty: number;
  calmar: number;
  sharpe: number;
  sortino: number;
  avgHoldMin: number;
};

export type BacktestOpts = {
  startingBalance?: number;
  slippageBps?: number;
  warmup?: number;
  interval?: number;
  requestedDays?: number;
};

export function backtestBot(
  kind: BotKind,
  params: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair = "XBTEUR",
  opts: BacktestOpts = {},
): BacktestResult | null {
  if (candles.length < 30) return null;
  const meta = PAIR_BY_ID[pair];
  const base = meta?.base ?? "BTC";
  const startEquity = Math.max(100, opts.startingBalance ?? 10_000);
  const slip = Math.max(0, (opts.slippageBps ?? 0) / 10_000);
  const need = backtestWarmup(kind, params);
  const warmup = Math.max(need, Math.min(opts.warmup ?? need, candles.length - 8));
  if (candles.length < warmup + 8) return null;
  let bot: Bot = {
    id: "bt",
    name: "bt",
    kind,
    venue: "paper",
    status: "running",
    pair,
    interval: opts.interval ?? 15,
    sizeQuote,
    params,
    createdAt: 0,
    lastNote: "",
    stats: { ...EMPTY_STATS },
    runtime: {},
  };
  let paper = resetPaperAccount(startEquity, feeRate);
  const curve: { t: number; v: number }[] = [{ t: candles[warmup]!.time * 1000, v: startEquity }];
  let barsInPos = 0;
  const firstPx = candles[warmup]!.close;

  for (let i = warmup; i < candles.length; i++) {
    const c = candles[i]!;
    const slice = candles.slice(0, i + 1);
    const ticker = {
      id: pair,
      last: c.close,
      bid: c.close * (1 - slip),
      ask: c.close * (1 + slip),
      open: c.open,
      high: c.high,
      low: c.low,
      volume: c.volume,
      vwap: c.close,
      change: 0,
      changePct: 0,
      trades: 0,
      quoteVolume: 0,
    };
    const { fills, runtime } = evaluateBot(bot, {
      now: c.time * 1000,
      ticker,
      candles: slice,
      equity: paperEquity(paper, { [pair]: ticker }),
      barHigh: c.high,
      barLow: c.low,
      quoteBudget: paper.cash,
      baseBudget: paper.holdings[base]?.qty ?? 0,
      feeRate,
    });
    bot = { ...bot, runtime };
    if (runtime.inPosition) barsInPos += 1;
    for (const fill of fills) {
      const px = fill.side === "buy" ? fill.price * (1 + slip) : fill.price * (1 - slip);
      const res = applyPaperFill(paper, {
        botId: "bt",
        pair,
        base,
        side: fill.side,
        qty: fill.qty,
        price: px,
        note: fill.note,
        time: c.time * 1000,
        costBasis: fill.entry,
      });
      if (res.ok) {
        paper = res.paper;
        bot = { ...bot, lastActionAt: c.time * 1000 };
        const compound = params.compoundPct ?? 0;
        if (compound > 0 && fill.side === "sell" && res.trade.pnl > 0) {
          bot = { ...bot, sizeQuote: Math.max(5, bot.sizeQuote + res.trade.pnl * (compound / 100)) };
        }
      }
    }
    if (i === candles.length - 1 || i % 3 === 0 || fills.length) {
      const mark = paper.cash + Object.values(paper.holdings).reduce((s, h) => s + h.qty * c.close, 0);
      curve.push({ t: c.time * 1000, v: mark });
    }
  }

  const last = candles[candles.length - 1]!.close;
  const eq = paper.cash + Object.values(paper.holdings).reduce((s, h) => s + h.qty * last, 0);
  const sells = paper.trades.filter((t) => t.side === "sell");
  const winsList = sells.filter((t) => t.pnl > 0);
  const lossList = sells.filter((t) => t.pnl <= 0);
  const grossWin = winsList.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(lossList.reduce((s, t) => s + t.pnl, 0));
  let peak = startEquity;
  let maxDd = 0;
  for (const p of curve) {
    peak = Math.max(peak, p.v);
    maxDd = Math.max(maxDd, peak - p.v);
  }
  const qtyBh = startEquity / firstPx;
  const buyHold = qtyBh * last - startEquity;
  const tested = candles.length - warmup;
  const { sharpe, sortino } = riskRatios(curve, candles[warmup]!.time, candles[candles.length - 1]!.time);
  const chrono = [...paper.trades].reverse();
  const holds: number[] = [];
  let opened: number | null = null;
  for (const t of chrono) {
    if (t.side === "buy" && opened == null) opened = t.time;
    if (t.side === "sell" && opened != null) {
      holds.push((t.time - opened) / 60_000);
      opened = null;
    }
  }

  return {
    trades: paper.trades.length,
    buys: paper.trades.filter((t) => t.side === "buy").length,
    sells: sells.length,
    wins: winsList.length,
    losses: lossList.length,
    winRate: sells.length ? (winsList.length / sells.length) * 100 : 0,
    pnl: eq - startEquity,
    pnlPct: ((eq - startEquity) / startEquity) * 100,
    realizedPnl: paper.realizedPnl,
    fees: paper.feesPaid,
    equity: eq,
    startEquity,
    maxDrawdown: maxDd,
    maxDrawdownPct: peak > 0 ? (maxDd / peak) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0,
    avgWin: winsList.length ? grossWin / winsList.length : 0,
    avgLoss: lossList.length ? -(grossLoss / lossList.length) : 0,
    expectancy: sells.length ? (grossWin - grossLoss) / sells.length : 0,
    buyHoldPnl: buyHold,
    buyHoldPct: (buyHold / startEquity) * 100,
    bars: tested,
    from: candles[0]!.time,
    to: candles[candles.length - 1]!.time,
    interval: opts.interval ?? 15,
    requestedDays: opts.requestedDays ?? 0,
    exposurePct: tested ? (barsInPos / tested) * 100 : 0,
    equityCurve: curve.slice(-240),
    tradeLog: paper.trades
      .slice()
      .reverse()
      .map((t) => ({ time: t.time, side: t.side, price: t.price, pnl: t.pnl, note: t.note })),
    openQty: Object.values(paper.holdings).reduce((s, h) => s + h.qty, 0),
    calmar: maxDd > 0 ? (eq - startEquity) / maxDd : eq > startEquity ? 99 : 0,
    sharpe,
    sortino,
    avgHoldMin: holds.length ? holds.reduce((s, n) => s + n, 0) / holds.length : 0,
  };
}

export function backtestWarmup(kind: BotKind, params: BotParams): number {
  const base = kindWarmup(kind, params);
  // trendQuality needs EMA50 + 5 bars of slope; only extend the warmup when the filter is on.
  return params.trendFilter && params.trendFilter !== "off" && kind !== "grid" && kind !== "dca" ? Math.max(base, 60) : base;
}

function kindWarmup(kind: BotKind, params: BotParams): number {
  const n = (v: number | undefined, d: number) => Math.max(2, Math.round(v ?? d));
  switch (kind) {
    case "sma":
      return n(params.slow, 200) + 8;
    case "ema":
    case "scalp":
      return n(params.slow, 21) + 8;
    case "ichimoku":
      return n(params.kijun, 26) * 2 + 8;
    case "macd":
      return n(params.macdSlow, 26) + n(params.macdSignal, 9) + 8;
    case "adx":
      return n(params.adxPeriod, 14) * 3 + 8;
    case "supertrend":
      return n(params.atrPeriod, 10) + 16;
    case "breakout":
      return n(params.donchian, 20) + 6;
    case "obv":
      return n(params.fast, 20) + 8;
    case "div":
      return n(params.rsiPeriod, 14) + 20;
    case "confirm":
      return Math.max(n(params.slow, 21), n(params.macdSlow, 26) + n(params.macdSignal, 9), n(params.rsiPeriod, 14)) + 8;
    case "mtf":
      return n(params.rsiPeriod, 14) + 8;
    default:
      return 48;
  }
}

export function previewSignal(
  kind: BotKind,
  params: BotParams,
  sizeQuote: number,
  ctx: BotEvalCtx,
  pair = "XBTEUR",
): { note: string; side: "buy" | "sell" | "hold" } {
  const bot: Bot = {
    id: "pv",
    name: "pv",
    kind,
    venue: "paper",
    status: "running",
    pair,
    interval: 60,
    sizeQuote,
    params,
    createdAt: 0,
    lastNote: "",
    stats: { ...EMPTY_STATS },
    runtime: {},
  };
  const { fills, note } = evaluateBot(bot, ctx);
  const side = fills.some((f) => f.side === "buy") ? "buy" : fills.some((f) => f.side === "sell") ? "sell" : "hold";
  return { note, side };
}

export type OptRow = { params: BotParams; label: string; result: BacktestResult };

export function paramVariants(kind: BotKind, base: BotParams): { params: BotParams; label: string }[] {
  const rows: { params: BotParams; label: string }[] = [{ params: base, label: "Actuel" }];
  const add = (label: string, p: Partial<BotParams>) => rows.push({ params: { ...base, ...p }, label });
  if (kind === "rsi" || kind === "mfi" || kind === "stoch" || kind === "div" || kind === "confirm" || kind === "mtf") {
    for (const os of [20, 25, 30, 35]) {
      for (const ob of [65, 70, 75, 80]) add(`os ${os} / ob ${ob}`, { oversold: os, overbought: ob });
    }
    if (kind === "confirm") {
      add("EMA 8/21", { fast: 8, slow: 21 });
      add("EMA 12/26", { fast: 12, slow: 26 });
    }
    if (kind === "mtf") {
      add("majority 15/60/240", { mtfIntervals: [60, 240], mtfMode: "majority" });
      add("higherAgree 15/60/240", { mtfIntervals: [60, 240], mtfMode: "higherAgree" });
      add("majority 5/15/60", { mtfIntervals: [15, 60], mtfMode: "majority" });
    }
  } else if (kind === "williams") {
    for (const os of [-90, -80, -70]) {
      for (const ob of [-30, -20, -10]) add(`os ${os} / ob ${ob}`, { oversold: os, overbought: ob });
    }
  } else if (kind === "cci") {
    for (const os of [-150, -100, -80]) {
      for (const ob of [80, 100, 150]) add(`os ${os} / ob ${ob}`, { oversold: os, overbought: ob });
    }
  } else if (kind === "ema" || kind === "scalp" || kind === "sma" || kind === "obv") {
    for (const fast of [5, 8, 9, 12, 21]) {
      for (const slow of [13, 21, 50, 200]) {
        if (kind === "obv") {
          add(`EMA ${fast}`, { fast });
          break;
        }
        if (slow > fast) add(`${fast}/${slow}`, { fast, slow });
      }
    }
  } else if (kind === "macd") {
    add("8/17/9", { macdFast: 8, macdSlow: 17, macdSignal: 9 });
    add("12/26/9", { macdFast: 12, macdSlow: 26, macdSignal: 9 });
    add("5/35/5", { macdFast: 5, macdSlow: 35, macdSignal: 5 });
  } else if (kind === "bollinger") {
    for (const p of [14, 20, 30]) for (const m of [1.5, 2, 2.5]) add(`n${p} ×${m}`, { bbPeriod: p, bbMult: m });
  } else if (kind === "breakout") {
    for (const d of [10, 20, 55]) add(`Donchian ${d}`, { donchian: d });
  } else if (kind === "supertrend") {
    for (const a of [7, 10, 14]) for (const m of [2, 3]) add(`ATR${a} ×${m}`, { atrPeriod: a, atrMult: m });
  } else if (kind === "meanrev") {
    for (const z of [1.2, 1.6, 2, 2.5]) add(`|Z| ${z}`, { zEntry: z });
  } else if (kind === "grid") {
    const lo = base.lower ?? 100;
    const hi = base.upper ?? 110;
    const mid = (lo + hi) / 2;
    const tightLo = mid * 0.99;
    const tightHi = mid * 1.01;
    if (tightLo < tightHi) add("serrée 2%", { lower: tightLo, upper: tightHi, levels: 6 });
    add("large 8%", { lower: mid * 0.96, upper: mid * 1.04, levels: 8 });
    add("12 lots", { lower: lo, upper: hi, levels: 12 });
    add("revente 0.8% / rachat 0.5%", { gridSellPct: 0.8, gridBuyPct: 0.5 });
    add("revente 1.5% / rachat 1%", { gridSellPct: 1.5, gridBuyPct: 1 });
    add("revente 2.5% / rachat 1.5%", { gridSellPct: 2.5, gridBuyPct: 1.5 });
    add("stop lot 3%", { gridSlPct: 3 });
    add("suivi de fourchette", { gridFollow: true });
    add("premier lot marché", { gridSeed: true });
    add("revente brute", { gridNetFees: false });
    add("pause 30 min après stop", { gridSlPct: 3, gridSlCooldownMin: 30 });
  }
  if (kind !== "grid" && kind !== "dca") {
    const extra: { params: BotParams; label: string }[] = [];
    for (const mode of ["off", "soft", "strict"] as const) {
      if ((base.trendFilter ?? "off") !== mode) extra.push({ params: { ...base, trendFilter: mode }, label: `tendance ${mode}` });
    }
    return [...rows.slice(0, 18 - extra.length), ...extra];
  }
  return rows.slice(0, 18);
}

export function optimizeBot(
  kind: BotKind,
  base: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair: string,
  opts: BacktestOpts = {},
): OptRow[] {
  const scored: OptRow[] = [];
  for (const row of paramVariants(kind, base)) {
    const result = backtestBot(kind, row.params, sizeQuote, candles, feeRate, pair, opts);
    if (!result || result.sells < 1) continue;
    scored.push({ params: row.params, label: row.label, result });
  }
  scored.sort((a, b) => {
    const sa = a.result.calmar !== 99 ? a.result.calmar : a.result.pnlPct;
    const sb = b.result.calmar !== 99 ? b.result.calmar : b.result.pnlPct;
    return sb - sa;
  });
  return scored.slice(0, 6);
}

export type StrategyScore = {
  kind: BotKind;
  title: string;
  result: BacktestResult;
};

export function compareStrategies(
  candles: Candle[],
  feeRate: number,
  pair: string,
  sizeQuote: number,
  opts: BacktestOpts = {},
): StrategyScore[] {
  const last = candles[candles.length - 1]?.close ?? 100;
  const rows: StrategyScore[] = [];
  for (const kind of BOT_KINDS) {
    const result = backtestBot(kind.id, defaultParams(kind.id, last), sizeQuote, candles, feeRate, pair, opts);
    if (!result || result.sells < 1) continue;
    rows.push({ kind: kind.id, title: kind.title, result });
  }
  rows.sort((a, b) => {
    const sa = a.result.calmar !== 99 ? a.result.calmar : a.result.pnlPct;
    const sb = b.result.calmar !== 99 ? b.result.calmar : b.result.pnlPct;
    return sb - sa;
  });
  return rows;
}

export type WalkForwardResult = {
  inSample: BacktestResult | null;
  outSample: BacktestResult | null;
};

export function walkForward(
  kind: BotKind,
  params: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair: string,
  opts: BacktestOpts = {},
): WalkForwardResult {
  const split = Math.max(40, Math.floor(candles.length * 0.7));
  const warmup = backtestWarmup(kind, params);
  const is = backtestBot(kind, params, sizeQuote, candles.slice(0, split), feeRate, pair, opts);
  const oosStart = Math.max(0, split - warmup);
  const oos = backtestBot(kind, params, sizeQuote, candles.slice(oosStart), feeRate, pair, opts);
  return { inSample: is, outSample: oos };
}

/** Stress overlays for Lab (copies closes; OHLC high/low widened to the new close). */
export type StressScenarioId = "crash" | "flash" | "spike";

export function applyStressScenario(candles: Candle[], id: StressScenarioId): Candle[] {
  if (candles.length < 10) return candles.slice();
  const out = candles.map((c) => ({ ...c }));
  if (id === "crash") {
    const start = Math.floor(out.length * 0.7);
    const base = out[start]!.close;
    const drop = base * 0.3;
    for (let i = 0; i < 5 && start + i < out.length; i++) {
      const c = out[start + i]!;
      const next = c.close - drop / 5;
      out[start + i] = { ...c, close: next, low: Math.min(c.low, next), high: Math.max(c.high, next) };
    }
  } else if (id === "flash") {
    const idx = Math.min(out.length - 2, Math.floor(out.length * 0.8));
    const c = out[idx]!;
    const drop = c.close * 0.2;
    const down = c.close - drop;
    out[idx] = { ...c, close: down, low: Math.min(c.low, down), high: Math.max(c.high, down) };
    const n = out[idx + 1]!;
    const up = n.close + drop;
    out[idx + 1] = { ...n, close: up, high: Math.max(n.high, up), low: Math.min(n.low, up) };
  } else {
    const idx = Math.floor(out.length * 0.75);
    const c = out[idx]!;
    const up = c.close * 1.2;
    out[idx] = { ...c, close: up, high: Math.max(c.high, up), low: Math.min(c.low, up) };
  }
  return out;
}

export const STRESS_SCENARIOS: { id: StressScenarioId; label: string }[] = [
  { id: "crash", label: "Krach −30 % / 5 barres" },
  { id: "flash", label: "Flash crash −20 % + rebond" },
  { id: "spike", label: "Spike +20 %" },
];

export type GatedOptResult = {
  ok: boolean;
  reason: string;
  params?: BotParams;
  label?: string;
  oosSharpe?: number;
  inSharpe?: number;
};

/**
 * Optimize params then accept only if walk-forward out-of-sample Sharpe ≥ threshold.
 * Uses Lab math (fees, calmar ranking) — not the old Bot fee-less argmax.
 */
export function gatedOptimizeBot(
  kind: BotKind,
  base: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair: string,
  opts: BacktestOpts & { minOosSharpe?: number } = {},
): GatedOptResult {
  const minOos = opts.minOosSharpe ?? 0;
  const ranked = optimizeBot(kind, base, sizeQuote, candles, feeRate, pair, opts);
  if (!ranked.length) return { ok: false, reason: "Aucune variante rentable sur l’échantillon." };
  const best = ranked[0]!;
  const wf = walkForward(kind, best.params, sizeQuote, candles, feeRate, pair, opts);
  const oos = wf.outSample?.sharpe ?? Number.NEGATIVE_INFINITY;
  const ins = wf.inSample?.sharpe ?? 0;
  if (!(wf.outSample && wf.outSample.sells >= 1)) {
    return { ok: false, reason: "Walk-forward OOS sans trade clôturé.", oosSharpe: oos, inSharpe: ins };
  }
  if (oos < minOos) {
    return {
      ok: false,
      reason: `OOS Sharpe ${oos.toFixed(2)} < seuil ${minOos.toFixed(2)}`,
      oosSharpe: oos,
      inSharpe: ins,
      label: best.label,
    };
  }
  return {
    ok: true,
    reason: `Accepté · ${best.label} · OOS Sharpe ${oos.toFixed(2)}`,
    params: best.params,
    label: best.label,
    oosSharpe: oos,
    inSharpe: ins,
  };
}
