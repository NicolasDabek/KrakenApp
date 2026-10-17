import { williamsR } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalWilliams(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const n = Math.max(5, bot.params.wrPeriod ?? 14);
  const os = bot.params.oversold ?? -80;
  const ob = bot.params.overbought ?? -20;
  if (!candles || candles.length < n + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Williams %R." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `%R ${fmt(runtime.lastWr)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = williamsR(candles, n);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastWr = r ?? undefined;
  if (r == null || prev == null) return { fills: [], runtime, note: "%R en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev <= os && r > os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `%R ${r.toFixed(0)} sort de survente` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev >= ob && r < ob) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `%R ${r.toFixed(0)} quitte le surachat` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `%R ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
