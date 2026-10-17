import { vwap } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px, roundSmart } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalVwap(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  if (!candles || candles.length < 20) return { fills: [], runtime, note: "Chandeliers insuffisants pour la VWAP." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long sous/sur VWAP" : "Flat · VWAP" };
  }
  const series = vwap(candles);
  const v = series[series.length - 1];
  const pv = series[series.length - 2];
  const close = lastCandle.close;
  const prev = candles[candles.length - 2]!.close;
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastVwap = v ?? undefined;
  if (v == null || pv == null) return { fills: [], runtime, note: "VWAP en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev >= pv && close < v) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Prix sous VWAP" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev <= pv && close > v) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Retour au-dessus VWAP" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `VWAP ${roundSmart(v)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
