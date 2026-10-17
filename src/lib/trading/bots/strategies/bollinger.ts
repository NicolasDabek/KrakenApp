import { bollinger } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { orderQty, px, roundSmart } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalBb(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.bbPeriod ?? 20);
  const mult = bot.params.bbMult ?? 2;
  if (!candles || candles.length < period + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Bollinger." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long · bande médiane" : "Flat · en attente d’un toucher" };
  }
  const closes = candles.map((c) => c.close);
  const bands = bollinger(closes, period, mult);
  const i = closes.length - 1;
  const close = closes[i]!;
  const prevClose = closes[i - 1]!;
  const lower = bands.lower[i];
  const upper = bands.upper[i];
  const prevLower = bands.lower[i - 1];
  const prevUpper = bands.upper[i - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastClose = close;
  if (lower == null || upper == null || prevLower == null || prevUpper == null) {
    return { fills: [], runtime, note: "Bandes en chauffe." };
  }
  const fills: BotFill[] = [];
  const touchLow = prevClose > prevLower && close <= lower;
  const touchHigh = prevClose < prevUpper && close >= upper;
  if (!runtime.inPosition && touchLow) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Toucher bande basse" });
      runtime.inPosition = true;
      runtime.positionQty = qty;
      runtime.positionAvg = fillPx;
    }
  } else if (runtime.inPosition && runtime.positionQty && touchHigh) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Toucher bande haute" });
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Close ${roundSmart(close)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
