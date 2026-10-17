import { ema, rsi } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalScalp(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const fastN = bot.params.fast ?? 5;
  const slowN = bot.params.slow ?? 13;
  const rsiN = bot.params.rsiPeriod ?? 7;
  if (!candles || candles.length < slowN + rsiN + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le scalp." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Scalp · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const closes = candles.map((c) => c.close);
  const f = ema(closes, fastN);
  const s = ema(closes, slowN);
  const r = rsi(closes, rsiN);
  const fv = f[f.length - 1];
  const sv = s[s.length - 1];
  const pf = f[f.length - 2];
  const ps = s[s.length - 2];
  const rv = r[r.length - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = fv ?? undefined;
  runtime.lastRsi = rv ?? undefined;
  if (fv == null || sv == null || pf == null || ps == null || rv == null) {
    return { fills: [], runtime, note: "Scalp en chauffe." };
  }
  const fills: BotFill[] = [];
  const crossUp = pf <= ps && fv > sv;
  const crossDown = pf >= ps && fv < sv;
  if (!runtime.inPosition && crossUp && rv < 70) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Scalp long · RSI ${rv.toFixed(0)}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && (crossDown || rv > 80)) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: crossDown ? "Scalp exit EMA" : "Scalp RSI chaud" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `EMA ${fastN}/${slowN} RSI ${rv.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
