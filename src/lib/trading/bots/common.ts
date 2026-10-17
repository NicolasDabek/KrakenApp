import { atr } from "../indicators.ts";
import type { Bot, BotParams, BotRuntime, BotStats, Candle, Ticker } from "../types.ts";

export const EMPTY_STATS: BotStats = {
  trades: 0,
  wins: 0,
  closes: 0,
  feesPaid: 0,
  realizedPnl: 0,
  volume: 0,
};

/** Drop the current Kraken OHLC frame if it has not closed yet. */
export function dropFormingCandle(candles: Candle[] | undefined, intervalMin: number, nowMs: number): Candle[] | undefined {
  if (!candles?.length || !(intervalMin > 0) || !(nowMs > 0)) return candles;
  const last = candles[candles.length - 1]!;
  const closeAt = last.time + intervalMin * 60;
  if (nowMs / 1000 + 0.5 < closeAt) return candles.slice(0, -1);
  return candles;
}

export function botInventoryQty(runtime: BotRuntime): number {
  const pos = runtime.positionQty ?? 0;
  if (pos > 0) return pos;
  return (runtime.gridOwned ?? []).reduce((s, g) => s + (g.qty > 0 ? g.qty : 0), 0);
}

export function botMark(runtime: BotRuntime, last: number): { qty: number; avg: number; exposure: number; unrealized: number } {
  const qty = botInventoryQty(runtime);
  const avg = runtime.positionAvg ?? 0;
  const exposure = qty > 0 && last > 0 ? qty * last : 0;
  const unrealized = qty > 0 && avg > 0 && last > 0 ? (last - avg) * qty : 0;
  return { qty, avg, exposure, unrealized };
}

/** Cash actually tied up in open lots (entry × qty), not marked value. */
export function botDeployed(runtime: BotRuntime): number {
  const lots = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
  if (lots.length) return lots.reduce((s, g) => s + g.qty * g.entry, 0);
  const qty = runtime.positionQty ?? 0;
  const avg = runtime.positionAvg ?? 0;
  return qty > 0 && avg > 0 ? qty * avg : 0;
}

/** Remaining EUR this bot may still spend. `undefined` = unlimited. */
export function remainingQuoteBudget(params: BotParams, runtime: BotRuntime, available?: number): number | undefined {
  const cap = params.budgetQuote ?? 0;
  const leftover = cap > 0 ? Math.max(0, cap - botDeployed(runtime)) : undefined;
  if (available == null && leftover == null) return undefined;
  if (available == null) return leftover;
  if (leftover == null) return Math.max(0, available);
  return Math.max(0, Math.min(available, leftover));
}

export function tradingDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}

export function roundSmart(n: number): number {
  if (!(n > 0)) return 0;
  if (n >= 1000) return Math.round(n);
  if (n >= 100) return Math.round(n * 10) / 10;
  if (n >= 1) return Math.round(n * 100) / 100;
  return Number(n.toPrecision(4));
}

export type BotFill = {
  side: "buy" | "sell";
  qty: number;
  price: number;
  note: string;
  /** Lot purchase price, so a grid sell is not marked at the blended average. */
  entry?: number;
};

export type BotEvalCtx = {
  now: number;
  ticker: Ticker;
  candles?: Candle[];
  /** Extra closed OHLC series by interval minutes (for mtf). */
  multiCandles?: Record<number, Candle[]>;
  equity?: number;
  barHigh?: number;
  barLow?: number;
  quoteBudget?: number;
  baseBudget?: number;
  feeRate?: number;
  maxFills?: number;
  /** Drop the uncommitted Kraken OHLC frame (live eval). Backtests keep the bar. */
  closedOnly?: boolean;
};

export function px(ctx: BotEvalCtx, side: "buy" | "sell"): number {
  const last = ctx.ticker.last;
  const quoted = side === "buy" ? ctx.ticker.ask : ctx.ticker.bid;
  if (quoted > 0 && last > 0 && Math.abs(quoted - last) / last < 0.02) return quoted;
  return last || quoted;
}

export function qtyFromQuote(sizeQuote: number, price: number): number {
  if (!(price > 0) || !(sizeQuote > 0)) return 0;
  return sizeQuote / price;
}

export function sizeQuoteOf(bot: Bot, ctx: BotEvalCtx): number {
  const risk = bot.params.atrRiskPct;
  if (risk && risk > 0 && ctx.equity && ctx.equity > 0 && ctx.candles && ctx.candles.length > 16) {
    const series = atr(ctx.candles, 14);
    const av = series[series.length - 1];
    const last = ctx.ticker.last;
    if (av != null && av > 0 && last > 0) {
      return Math.max(0, ((ctx.equity * (risk / 100)) / av) * last);
    }
  }
  const pct = bot.params.sizePct;
  if (pct && pct > 0 && ctx.equity && ctx.equity > 0) {
    return Math.max(0, ctx.equity * (pct / 100));
  }
  return bot.sizeQuote;
}

export function orderQty(bot: Bot, ctx: BotEvalCtx, price: number): number {
  return qtyFromQuote(sizeQuoteOf(bot, ctx), price);
}

export function markLong(runtime: BotRuntime, qty: number, px: number) {
  runtime.inPosition = true;
  runtime.positionQty = qty;
  runtime.positionAvg = px;
}

export function markFlat(runtime: BotRuntime) {
  runtime.inPosition = false;
  runtime.positionQty = 0;
  runtime.positionAvg = 0;
}

export function fmt(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}

export function formatWait(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h`;
  return `${Math.floor(h / 24)} j`;
}
