import { roc } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalRoc(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(2, bot.params.rocPeriod ?? 12);
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le ROC." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `ROC ${fmt(runtime.lastRoc)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = roc(candles.map((c) => c.close), period);
  const v = series[series.length - 1];
  const pv = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRoc = v ?? undefined;
  if (v == null || pv == null) return { fills: [], runtime, note: "ROC en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pv <= 0 && v > 0) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `ROC +${v.toFixed(2)} %` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pv >= 0 && v < 0) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `ROC ${v.toFixed(2)} %` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `ROC ${v >= 0 ? "+" : ""}${v.toFixed(2)} % · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
