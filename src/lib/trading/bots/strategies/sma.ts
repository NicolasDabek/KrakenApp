import { sma } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalSma(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const fastN = Math.max(2, bot.params.fast ?? 50);
  const slowN = Math.max(fastN + 1, bot.params.slow ?? 200);
  if (!candles || candles.length < slowN + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour les SMA." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `SMA ${fastN}/${slowN} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const closes = candles.map((c) => c.close);
  const fast = sma(closes, fastN);
  const slow = sma(closes, slowN);
  const f = fast[fast.length - 1];
  const s = slow[slow.length - 1];
  const pf = fast[fast.length - 2];
  const ps = slow[slow.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = f ?? undefined;
  runtime.lastEmaSlow = s ?? undefined;
  if (f == null || s == null || pf == null || ps == null) {
    return { fills: [], runtime, note: "SMA en chauffe." };
  }
  const fills: BotFill[] = [];
  const crossUp = pf <= ps && f > s;
  const crossDown = pf >= ps && f < s;
  if (!runtime.inPosition && crossUp) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Golden cross SMA ${fastN}/${slowN}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && crossDown) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `Death cross SMA ${fastN}/${slowN}` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `SMA ${fmt(f)} / ${fmt(s)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
