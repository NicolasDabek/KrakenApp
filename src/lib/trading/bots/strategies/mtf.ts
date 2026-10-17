import { rsi } from "../../indicators.ts";
import type { Bot, BotRuntime, Candle } from "../../types.ts";
import { dropFormingCandle, fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

/** Intervals used by an mtf bot: primary first, then extras (deduped, max 3). */
export function mtfIntervalsOf(bot: Pick<Bot, "interval" | "params">): number[] {
  const primary = Math.max(1, Math.round(bot.interval || 15));
  const extra = (bot.params.mtfIntervals ?? [60, 240])
    .map((n) => Math.round(n))
    .filter((n) => n > 0 && n !== primary);
  return [primary, ...[...new Set(extra)].sort((a, b) => a - b)].slice(0, 3);
}

/** Aggregate lower-TF candles into a higher TF (backtest fallback when multi OHLC missing). */
export function resampleCandles(candles: Candle[], fromMin: number, toMin: number): Candle[] {
  if (!(fromMin > 0) || !(toMin > 0) || toMin <= fromMin || candles.length === 0) return candles.slice();
  const ratio = Math.max(2, Math.round(toMin / fromMin));
  const out: Candle[] = [];
  for (let i = 0; i < candles.length; i += ratio) {
    const chunk = candles.slice(i, i + ratio);
    if (!chunk.length) continue;
    const first = chunk[0]!;
    const last = chunk[chunk.length - 1]!;
    let high = first.high;
    let low = first.low;
    let volume = 0;
    for (const c of chunk) {
      high = Math.max(high, c.high);
      low = Math.min(low, c.low);
      volume += c.volume;
    }
    out.push({ time: first.time, open: first.open, high, low, close: last.close, volume });
  }
  return out;
}

type RsiCross = "BUY" | "SELL" | "HOLD";

function rsiCrossOnCandles(
  candles: Candle[] | undefined,
  period: number,
  os: number,
  ob: number,
): { action: RsiCross; rsi: number | null } {
  if (!candles || candles.length < period + 3) return { action: "HOLD", rsi: null };
  const closes = candles.map((c) => c.close);
  const series = rsi(closes, period);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  if (r == null || prev == null) return { action: "HOLD", rsi: r ?? null };
  if (prev >= os && r < os) return { action: "BUY", rsi: r };
  if (prev <= ob && r > ob) return { action: "SELL", rsi: r };
  return { action: "HOLD", rsi: r };
}

function resolveMtfVote(
  votes: { BUY: number; SELL: number; HOLD: number },
  mode: "majority" | "higherAgree",
  primaryAction: RsiCross,
  highestAction: RsiCross,
): RsiCross {
  if (mode === "higherAgree") {
    if (primaryAction === "BUY" && highestAction === "BUY") return "BUY";
    if (primaryAction === "SELL" && highestAction === "SELL") return "SELL";
    return "HOLD";
  }
  if (votes.BUY > votes.SELL && votes.BUY > votes.HOLD) return "BUY";
  if (votes.SELL > votes.BUY && votes.SELL > votes.HOLD) return "SELL";
  return "HOLD";
}

export function evalMtf(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const period = Math.max(2, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 30;
  const ob = bot.params.overbought ?? 70;
  const mode = bot.params.mtfMode === "higherAgree" ? "higherAgree" : "majority";
  const intervals = mtfIntervalsOf(bot);
  const primary = intervals[0]!;

  const seriesByTf: { tf: number; candles: Candle[] }[] = [];
  for (const tf of intervals) {
    let series = ctx.multiCandles?.[tf];
    if ((!series || series.length < period + 3) && ctx.candles && tf === primary) series = ctx.candles;
    if ((!series || series.length < period + 3) && ctx.candles && tf !== primary) {
      series = resampleCandles(ctx.candles, primary, tf);
    }
    if (ctx.closedOnly && series) series = dropFormingCandle(series, tf, ctx.now) ?? series;
    if (series && series.length >= period + 3) seriesByTf.push({ tf, candles: series });
  }

  if (seriesByTf.length < 2) {
    return { fills: [], runtime, note: "Multi-TF : chandeliers insuffisants sur ≥2 intervalles." };
  }

  const primarySeries = seriesByTf.find((s) => s.tf === primary)?.candles ?? seriesByTf[0]!.candles;
  const lastCandle = primarySeries[primarySeries.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return {
      fills: [],
      runtime,
      note: runtime.inPosition ? `Long · MTF ${fmt(runtime.lastRsi)}` : `Hors marché · MTF ${fmt(runtime.lastRsi)}`,
    };
  }

  const votes = { BUY: 0, SELL: 0, HOLD: 0 };
  const details: string[] = [];
  let highestTf = -1;
  let highestAction: RsiCross = "HOLD";
  let primaryAction: RsiCross = "HOLD";
  let primaryRsi: number | null = null;
  for (const { tf, candles } of seriesByTf) {
    const { action, rsi: r } = rsiCrossOnCandles(candles, period, os, ob);
    votes[action] += 1;
    details.push(`${tf}m:${action === "HOLD" ? "·" : action[0]}${r != null ? r.toFixed(0) : "?"}`);
    if (tf === primary) {
      primaryAction = action;
      primaryRsi = r;
    }
    if (tf >= highestTf) {
      highestTf = tf;
      highestAction = action;
    }
  }

  const action = resolveMtfVote(votes, mode, primaryAction, highestAction);
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = primaryRsi ?? undefined;
  runtime.lastClose = lastCandle.close;

  const fills: BotFill[] = [];
  if (action === "BUY" && !runtime.inPosition) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `MTF BUY · ${details.join(" ")}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (action === "SELL" && runtime.inPosition && runtime.positionQty) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `MTF SELL · ${details.join(" ")}` });
    markFlat(runtime);
  }

  return {
    fills,
    runtime,
    note: fills.length
      ? fills[0]!.note
      : `MTF ${mode} · ${details.join(" ")} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
