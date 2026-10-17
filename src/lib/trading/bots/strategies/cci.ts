import { cci } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalCci(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.cciPeriod ?? 20);
  const os = bot.params.oversold ?? -100;
  const ob = bot.params.overbought ?? 100;
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le CCI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `CCI ${fmt(runtime.lastCci)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = cci(candles, period);
  const v = series[series.length - 1];
  const pv = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastCci = v ?? undefined;
  if (v == null || pv == null) return { fills: [], runtime, note: "CCI en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pv <= os && v > os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `CCI ${v.toFixed(0)} sort de survente` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pv >= ob && v < ob) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `CCI ${v.toFixed(0)} sort de surachat` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `CCI ${v.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
