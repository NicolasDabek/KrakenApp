import { keltner } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px, roundSmart } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalKeltner(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.kcPeriod ?? 20);
  const mult = bot.params.kcMult ?? 1.5;
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Keltner." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long Keltner" : "Flat · Keltner" };
  }
  const bands = keltner(candles, period, mult);
  const i = candles.length - 1;
  const close = lastCandle.close;
  const prev = candles[i - 1]!.close;
  const lower = bands.lower[i];
  const upper = bands.upper[i];
  const prevLower = bands.lower[i - 1];
  const prevUpper = bands.upper[i - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastClose = close;
  if (lower == null || upper == null || prevLower == null || prevUpper == null) {
    return { fills: [], runtime, note: "Keltner en chauffe." };
  }
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev > prevLower && close <= lower) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Toucher Keltner bas" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev < prevUpper && close >= upper) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Toucher Keltner haut" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Close ${roundSmart(close)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
