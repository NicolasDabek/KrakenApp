import { supertrend } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalSupertrend(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = bot.params.atrPeriod ?? 10;
  const mult = bot.params.atrMult ?? 3;
  if (!candles || candles.length < period + 5) return { fills: [], runtime, note: "Chandeliers insuffisants pour Supertrend." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Supertrend ${runtime.lastTrend ?? "—"}` };
  }
  const st = supertrend(candles, period, mult);
  const d = st.dir[st.dir.length - 1];
  const pd = st.dir[st.dir.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastTrend = d ?? undefined;
  runtime.lastSupertrend = st.line[st.line.length - 1] ?? undefined;
  if (!d || !pd) return { fills: [], runtime, note: "Supertrend en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pd === "down" && d === "up") {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Supertrend haussier" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pd === "up" && d === "down") {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Supertrend baissier" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Tendance ${d} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
