import { donchian } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px, roundSmart } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalBreakout(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const n = Math.max(5, bot.params.donchian ?? 20);
  if (!candles || candles.length < n + 3) return { fills: [], runtime, note: "Chandeliers insuffisants pour Donchian." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long breakout" : "En attente de cassure" };
  }
  const prior = candles.slice(0, -1);
  const bands = donchian(prior, n);
  const hi = bands.upper[bands.upper.length - 1];
  const lo = bands.lower[bands.lower.length - 1];
  runtime.lastCandleTime = lastCandle.time;
  if (hi == null || lo == null) return { fills: [], runtime, note: "Canal Donchian en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && lastCandle.close > hi) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Cassure ${roundSmart(hi)}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && lastCandle.close < lo) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `Rupture basse ${roundSmart(lo)}` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Canal ${roundSmart(lo)}–${roundSmart(hi)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
