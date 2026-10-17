import { rsi } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalRsi(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(2, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 30;
  const ob = bot.params.overbought ?? 70;
  if (!candles || candles.length < period + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le RSI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? `En position · RSI ${fmt(runtime.lastRsi)}` : `Hors marché · RSI ${fmt(runtime.lastRsi)}` };
  }
  const closes = candles.map((c) => c.close);
  const series = rsi(closes, period);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = r ?? undefined;
  runtime.lastClose = lastCandle.close;
  if (r == null || prev == null) return { fills: [], runtime, note: "RSI en chauffe." };

  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev >= os && r < os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `RSI ${r.toFixed(1)} < ${os}` });
      runtime.inPosition = true;
      runtime.positionQty = qty;
      runtime.positionAvg = fillPx;
    }
  } else if (runtime.inPosition && runtime.positionQty && prev <= ob && r > ob) {
    const fillPx = px(ctx, "sell");
    fills.push({
      side: "sell",
      qty: runtime.positionQty,
      price: fillPx,
      note: `RSI ${r.toFixed(1)} > ${ob}`,
    });
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `RSI ${r.toFixed(1)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
