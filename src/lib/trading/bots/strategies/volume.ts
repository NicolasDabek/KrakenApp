import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalVolume(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const mult = bot.params.volMult ?? 2;
  if (!candles || candles.length < 24) return { fills: [], runtime, note: "Chandeliers insuffisants pour le volume." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long spike" : "En attente d’un spike" };
  }
  const look = candles.slice(-21, -1);
  const avg = look.reduce((s, c) => s + c.volume, 0) / look.length;
  runtime.lastCandleTime = lastCandle.time;
  const spike = avg > 0 && lastCandle.volume > avg * mult;
  const bull = lastCandle.close >= lastCandle.open;
  const fills: BotFill[] = [];
  if (!runtime.inPosition && spike && bull) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Volume ×${(lastCandle.volume / avg).toFixed(1)}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && spike && !bull) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Spike vendeur" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Vol ${spike ? "élevé" : "calme"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
