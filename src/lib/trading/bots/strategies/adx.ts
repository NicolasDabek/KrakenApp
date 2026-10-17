import { adx } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalAdx(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.adxPeriod ?? 14);
  const min = bot.params.adxMin ?? 20;
  if (!candles || candles.length < period * 2 + 5) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour l’ADX." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `ADX ${fmt(runtime.lastAdx)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const a = adx(candles, period);
  const i = candles.length - 1;
  const av = a.adx[i];
  const pdi = a.plusDI[i];
  const mdi = a.minusDI[i];
  const pp = a.plusDI[i - 1];
  const pm = a.minusDI[i - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastAdx = av ?? undefined;
  if (av == null || pdi == null || mdi == null || pp == null || pm == null) {
    return { fills: [], runtime, note: "ADX en chauffe." };
  }
  const fills: BotFill[] = [];
  const strong = av >= min;
  const crossUp = pp <= pm && pdi > mdi;
  const crossDown = pp >= pm && pdi < mdi;
  if (!runtime.inPosition && strong && crossUp) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `ADX ${av.toFixed(0)} +DI haussier` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && (crossDown || av < min * 0.6)) {
    const fillPx = px(ctx, "sell");
    fills.push({
      side: "sell",
      qty: runtime.positionQty,
      price: fillPx,
      note: crossDown ? "−DI prend le dessus" : "Tendance trop faible",
    });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `ADX ${av.toFixed(0)} +DI ${pdi.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
