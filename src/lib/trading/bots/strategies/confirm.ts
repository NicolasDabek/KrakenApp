import { ema, macd, rsi } from "../../indicators.ts";
import type { Bot, BotRuntime } from "../../types.ts";
import { markFlat, markLong, orderQty, px } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalConfirm(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const fastN = Math.max(2, bot.params.fast ?? 9);
  const slowN = Math.max(fastN + 1, bot.params.slow ?? 21);
  const rsiN = Math.max(2, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 35;
  const ob = bot.params.overbought ?? 70;
  const macdFast = bot.params.macdFast ?? 12;
  const macdSlow = bot.params.macdSlow ?? 26;
  const macdSig = bot.params.macdSignal ?? 9;
  const need = Math.max(slowN, rsiN, macdSlow + macdSig) + 4;
  if (!candles || candles.length < need) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour la confirmation." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return {
      fills: [],
      runtime,
      note: runtime.inPosition ? "Long · confirmation" : "Hors marché · en attente des 3 filtres",
    };
  }
  const closes = candles.map((c) => c.close);
  const fast = ema(closes, fastN);
  const slow = ema(closes, slowN);
  const rSeries = rsi(closes, rsiN);
  const m = macd(closes, macdFast, macdSlow, macdSig);
  const i = closes.length - 1;
  const f = fast[i];
  const s = slow[i];
  const r = rSeries[i];
  const pr = rSeries[i - 1];
  const h = m.hist[i];
  const ph = m.hist[i - 1];
  const pf = fast[i - 1];
  const ps = slow[i - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = f ?? undefined;
  runtime.lastEmaSlow = s ?? undefined;
  runtime.lastRsi = r ?? undefined;
  runtime.lastMacdHist = h ?? undefined;
  if (f == null || s == null || r == null || pr == null || h == null || ph == null) {
    return { fills: [], runtime, note: "Confirmation en chauffe." };
  }
  const trendUp = f > s;
  const macdUp = h > 0;
  const rsiRecover = pr < os && r >= os;
  const rsiDrop = pr <= ob && r > ob;
  const macdDown = ph >= 0 && h < 0;
  const deathCross = pf != null && ps != null && pf >= ps && f < s;
  const fills: BotFill[] = [];
  if (!runtime.inPosition && trendUp && macdUp && rsiRecover) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Confirmé · RSI ${r.toFixed(0)} + MACD + EMA` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && (rsiDrop || macdDown || deathCross)) {
    const why = deathCross ? "EMA croise à la baisse" : macdDown ? "MACD négatif" : `RSI ${r.toFixed(0)} > ${ob}`;
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `Sortie · ${why}` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length
      ? fills[0]!.note
      : `EMA ${trendUp ? "haussier" : "baissier"} · MACD ${macdUp ? "pos" : "neg"} · RSI ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}
