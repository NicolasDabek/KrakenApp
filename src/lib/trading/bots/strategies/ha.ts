import { heikinAshi } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalHa(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  if (!candles || candles.length < 8) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Heikin-Ashi." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `HA · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const ha = heikinAshi(candles);
  const cur = ha[ha.length - 1]!;
  const prev = ha[ha.length - 2]!;
  const bull = cur.close >= cur.open;
  const prevBull = prev.close >= prev.open;
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastTrend = bull ? "up" : "down";
  const fills: BotFill[] = [];
  if (!runtime.inPosition && bull && !prevBull) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Heikin-Ashi vert" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && !bull && prevBull) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Heikin-Ashi rouge" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `HA ${bull ? "haussier" : "baissier"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
