import { mfi } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalMfi(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 20;
  const ob = bot.params.overbought ?? 80;
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le MFI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `MFI ${fmt(runtime.lastRsi)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = mfi(candles, period);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = r ?? undefined;
  if (r == null || prev == null) return { fills: [], runtime, note: "MFI en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev >= os && r < os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `MFI ${r.toFixed(1)} < ${os}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev <= ob && r > ob) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `MFI ${r.toFixed(1)} > ${ob}` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `MFI ${r.toFixed(1)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
