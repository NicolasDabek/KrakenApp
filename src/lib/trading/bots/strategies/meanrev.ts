import { zscore } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalMeanRev(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const n = Math.max(8, bot.params.zWindow ?? 20);
  const zEntry = bot.params.zEntry ?? 1.6;
  if (!candles || candles.length < n + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le z-score." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Z ${fmt(runtime.lastZ)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const closes = candles.map((c) => c.close);
  const zs = zscore(closes, n);
  const z = zs[zs.length - 1];
  const pz = zs[zs.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastZ = z ?? undefined;
  if (z == null || pz == null) return { fills: [], runtime, note: "Z-score en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pz > -zEntry && z <= -zEntry) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Z-score ${z.toFixed(2)}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && ((pz < 0 && z >= 0) || z >= zEntry)) {
    const fillPx = px(ctx, "sell");
    fills.push({
      side: "sell",
      qty: runtime.positionQty,
      price: fillPx,
      note: z >= zEntry ? `Z excessif ${z.toFixed(2)}` : "Retour à la moyenne",
    });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Z ${z.toFixed(2)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
