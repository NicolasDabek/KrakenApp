import { ichimoku } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px, roundSmart } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalIchimoku(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const tenkanN = Math.max(2, bot.params.tenkan ?? 9);
  const kijunN = Math.max(tenkanN + 1, bot.params.kijun ?? 26);
  if (!candles || candles.length < kijunN + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Ichimoku." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Ichimoku · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const cloud = ichimoku(candles, tenkanN, kijunN);
  const i = candles.length - 1;
  const t = cloud.tenkan[i];
  const k = cloud.kijun[i];
  const pt = cloud.tenkan[i - 1];
  const pk = cloud.kijun[i - 1];
  const sa = cloud.senkouA[i];
  const sb = cloud.senkouB[i];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = t ?? undefined;
  runtime.lastEmaSlow = k ?? undefined;
  if (t == null || k == null || pt == null || pk == null) {
    return { fills: [], runtime, note: "Ichimoku en chauffe." };
  }
  const cloudTop = sa != null && sb != null ? Math.max(sa, sb) : null;
  const cloudBot = sa != null && sb != null ? Math.min(sa, sb) : null;
  const aboveCloud = cloudTop == null || lastCandle.close > cloudTop;
  const belowCloud = cloudBot == null || lastCandle.close < cloudBot;
  const fills: BotFill[] = [];
  const crossUp = pt <= pk && t > k;
  const crossDown = pt >= pk && t < k;
  if (!runtime.inPosition && crossUp && aboveCloud) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Tenkan croise au-dessus du Kijun" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && (crossDown || belowCloud)) {
    const fillPx = px(ctx, "sell");
    fills.push({
      side: "sell",
      qty: runtime.positionQty,
      price: fillPx,
      note: crossDown ? "Tenkan croise sous le Kijun" : "Clôture sous le nuage",
    });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Tenkan ${roundSmart(t)} / Kijun ${roundSmart(k)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
