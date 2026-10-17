import { stochastic } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { fmt, markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalStoch(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const n = Math.max(5, bot.params.stochN ?? 14);
  const os = bot.params.oversold ?? 20;
  const ob = bot.params.overbought ?? 80;
  if (!candles || candles.length < n + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le Stochastic." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Stoch ${fmt(runtime.lastStochK)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const s = stochastic(candles, n, 3);
  const k = s.k[s.k.length - 1];
  const d = s.d[s.d.length - 1];
  const pk = s.k[s.k.length - 2];
  const pd = s.d[s.d.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastStochK = k ?? undefined;
  if (k == null || d == null || pk == null || pd == null) return { fills: [], runtime, note: "Stoch en chauffe." };
  const fills: BotFill[] = [];
  const crossUp = pk <= pd && k > d;
  const crossDown = pk >= pd && k < d;
  if (!runtime.inPosition && crossUp && k < os + 10) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Stoch croise haussier (${k.toFixed(0)})` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && crossDown && k > ob - 10) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `Stoch croise baissier (${k.toFixed(0)})` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `K ${k.toFixed(0)} / D ${d.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
