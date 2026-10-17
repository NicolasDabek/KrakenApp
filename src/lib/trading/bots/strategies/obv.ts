import { ema, obv } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalObv(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.fast ?? 20);
  if (!candles || candles.length < period + 6) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour l’OBV." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `OBV · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = obv(candles);
  const mean = ema(series, period);
  const o = series[series.length - 1]!;
  const e = mean[mean.length - 1];
  const po = series[series.length - 2]!;
  const pe = mean[mean.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = e ?? undefined;
  if (e == null || pe == null) return { fills: [], runtime, note: "OBV en chauffe." };
  const fills: BotFill[] = [];
  const crossUp = po <= pe && o > e;
  const crossDown = po >= pe && o < e;
  if (!runtime.inPosition && crossUp) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "OBV croise au-dessus de l’EMA" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && crossDown) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "OBV croise sous l’EMA" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `OBV ${o >= e ? "haussier" : "baissier"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
