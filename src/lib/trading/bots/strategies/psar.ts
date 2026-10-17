import { psar } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalPsar(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const step = bot.params.psarAf ?? 0.02;
  const maxAf = bot.params.psarMax ?? 0.2;
  if (!candles || candles.length < 8) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le SAR." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `SAR ${runtime.lastTrend ?? "—"}` };
  }
  const s = psar(candles, step, maxAf);
  const d = s.dir[s.dir.length - 1];
  const pd = s.dir[s.dir.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastTrend = d ?? undefined;
  runtime.lastSar = s.sar[s.sar.length - 1] ?? undefined;
  if (!d || !pd) return { fills: [], runtime, note: "SAR en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pd === "down" && d === "up") {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "SAR haussier" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pd === "up" && d === "down") {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "SAR baissier" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `SAR ${d} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
