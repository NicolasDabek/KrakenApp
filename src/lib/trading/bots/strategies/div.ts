import { rsi } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalDiv(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.rsiPeriod ?? 14);
  const look = 12;
  const os = bot.params.oversold ?? 40;
  const ob = bot.params.overbought ?? 70;
  if (!candles || candles.length < period + look + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour la divergence RSI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Div RSI ${fmt(runtime.lastRsi)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const closes = candles.map((c) => c.close);
  const series = rsi(closes, period);
  const i = closes.length - 1;
  const r = series[i];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = r ?? undefined;
  runtime.lastClose = lastCandle.close;
  if (r == null) return { fills: [], runtime, note: "RSI en chauffe." };
  const windowCloses = closes.slice(i - look, i);
  const windowRsi = series.slice(i - look, i).filter((v): v is number => v != null);
  const fills: BotFill[] = [];
  if (windowCloses.length >= look && windowRsi.length >= 4) {
    const minP = Math.min(...windowCloses);
    const minR = Math.min(...windowRsi);
    const bullDiv = lastCandle.close <= minP && r > minR && r < os + 10;
    if (!runtime.inPosition && bullDiv) {
      const fillPx = px(ctx, "buy");
      const qty = orderQty(bot, ctx, fillPx);
      if (qty > 0) {
        fills.push({ side: "buy", qty, price: fillPx, note: `Divergence haussière RSI ${r.toFixed(0)}` });
        markLong(runtime, qty, fillPx);
      }
    } else if (runtime.inPosition && runtime.positionQty && r > ob) {
      const fillPx = px(ctx, "sell");
      fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `RSI ${r.toFixed(0)} > ${ob}` });
      markFlat(runtime);
    }
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `RSI ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
