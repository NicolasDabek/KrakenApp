import { macd } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalMacd(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const fastN = bot.params.macdFast ?? 12;
  const slowN = bot.params.macdSlow ?? 26;
  const sigN = bot.params.macdSignal ?? 9;
  if (!candles || candles.length < slowN + sigN + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le MACD." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `MACD · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const closes = candles.map((c) => c.close);
  const m = macd(closes, fastN, slowN, sigN);
  const h = m.hist[m.hist.length - 1];
  const ph = m.hist[m.hist.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastMacdHist = h ?? undefined;
  if (h == null || ph == null) return { fills: [], runtime, note: "MACD en chauffe." };
  const fills: BotFill[] = [];
  const crossUp = ph <= 0 && h > 0;
  const crossDown = ph >= 0 && h < 0;
  if (!runtime.inPosition && crossUp) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Histogramme MACD positif" });
      runtime.inPosition = true;
      runtime.positionQty = qty;
      runtime.positionAvg = fillPx;
    }
  } else if (runtime.inPosition && runtime.positionQty && crossDown) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Histogramme MACD négatif" });
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Hist ${h >= 0 ? "+" : ""}${h.toFixed(4)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
