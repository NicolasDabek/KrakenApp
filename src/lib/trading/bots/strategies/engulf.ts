import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalEngulf(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  if (!candles || candles.length < 6) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour l’engloutissement." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long engulf" : "En attente d’un engulf" };
  }
  const cur = lastCandle;
  const prev = candles[candles.length - 2]!;
  runtime.lastCandleTime = lastCandle.time;
  const prevBear = prev.close < prev.open;
  const prevBull = prev.close > prev.open;
  const bullEngulf = prevBear && cur.close > cur.open && cur.close >= prev.open && cur.open <= prev.close;
  const bearEngulf = prevBull && cur.close < cur.open && cur.close <= prev.open && cur.open >= prev.close;
  const fills: BotFill[] = [];
  if (!runtime.inPosition && bullEngulf) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Engloutissement haussier" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && bearEngulf) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Engloutissement baissier" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `PA ${bullEngulf ? "bull" : bearEngulf ? "bear" : "neutre"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
