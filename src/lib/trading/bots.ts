import { adx, bollinger, cci, donchian, ema, heikinAshi, ichimoku, keltner, macd, psar, roc, rsi, sma, stochastic, supertrend, vwap, williamsR, zscore } from "./indicators";
import { uid } from "./format";
import { PAIR_BY_ID } from "./pairs";
import type {
  Bot,
  BotKind,
  BotParams,
  BotRuntime,
  BotStats,
  Candle,
  GridLevelState,
  PaperAccount,
  PaperTrade,
  Ticker,
} from "./types";

export const BOT_KINDS: {
  id: BotKind;
  title: string;
  blurb: string;
  needsCandles: boolean;
}[] = [
  {
    id: "grid",
    title: "Grille",
    blurb: "Achète bas, vend haut dans une fourchette de prix.",
    needsCandles: false,
  },
  {
    id: "dca",
    title: "Accumulateur",
    blurb: "Achète un montant fixe à intervalle régulier.",
    needsCandles: false,
  },
  {
    id: "rsi",
    title: "Reversion RSI",
    blurb: "Achète en survente, revend en surachat.",
    needsCandles: true,
  },
  {
    id: "ema",
    title: "Croisement EMA",
    blurb: "Suit la tendance au croisement de deux moyennes.",
    needsCandles: true,
  },
  {
    id: "bollinger",
    title: "Bandes de Bollinger",
    blurb: "Rebond sur la bande basse, allègement sur la haute.",
    needsCandles: true,
  },
  {
    id: "macd",
    title: "Momentum MACD",
    blurb: "Entre au passage de l’histogramme en positif.",
    needsCandles: true,
  },
  {
    id: "stoch",
    title: "Stochastic",
    blurb: "Croisement %K/%D en zone de survente.",
    needsCandles: true,
  },
  {
    id: "vwap",
    title: "Reversion VWAP",
    blurb: "Achète sous la VWAP, revend au-dessus.",
    needsCandles: true,
  },
  {
    id: "breakout",
    title: "Breakout Donchian",
    blurb: "Suit la cassure du plus haut / plus bas.",
    needsCandles: true,
  },
  {
    id: "supertrend",
    title: "Supertrend",
    blurb: "Flip de tendance basé sur l’ATR.",
    needsCandles: true,
  },
  {
    id: "volume",
    title: "Spike volume",
    blurb: "Entre sur un volume anormal dans le sens de la bougie.",
    needsCandles: true,
  },
  {
    id: "scalp",
    title: "Scalp EMA+RSI",
    blurb: "Micro-tendance 5/13 filtrée par le RSI.",
    needsCandles: true,
  },
  {
    id: "cci",
    title: "CCI",
    blurb: "Reversion sur le Commodity Channel Index.",
    needsCandles: true,
  },
  {
    id: "meanrev",
    title: "Z-score",
    blurb: "Achète les écarts extrêmes à la moyenne.",
    needsCandles: true,
  },
  {
    id: "keltner",
    title: "Keltner",
    blurb: "Rebond sur le canal ATR autour de l’EMA.",
    needsCandles: true,
  },
  {
    id: "roc",
    title: "Momentum ROC",
    blurb: "Suit le taux de variation du prix.",
    needsCandles: true,
  },
  {
    id: "adx",
    title: "ADX + DI",
    blurb: "Entre quand la tendance est confirmée.",
    needsCandles: true,
  },
  {
    id: "williams",
    title: "Williams %R",
    blurb: "Reversion sur le %R, cousin du Stochastic.",
    needsCandles: true,
  },
  {
    id: "ichimoku",
    title: "Ichimoku",
    blurb: "Croisement Tenkan / Kijun filtré par le nuage.",
    needsCandles: true,
  },
  {
    id: "psar",
    title: "Parabolic SAR",
    blurb: "Suit le flip de la parabole de Wilder.",
    needsCandles: true,
  },
  {
    id: "sma",
    title: "Croisement SMA",
    blurb: "Golden / death cross des moyennes simples.",
    needsCandles: true,
  },
  {
    id: "ha",
    title: "Heikin-Ashi",
    blurb: "Entre au retournement des bougies lissées.",
    needsCandles: true,
  },
];

export const BOT_KIND_BY_ID = Object.fromEntries(BOT_KINDS.map((k) => [k.id, k]));

export const DCA_INTERVALS = [
  { id: 60_000, label: "1 min" },
  { id: 300_000, label: "5 min" },
  { id: 900_000, label: "15 min" },
  { id: 3_600_000, label: "1 h" },
  { id: 86_400_000, label: "1 j" },
] as const;

export const BOT_CANDLE_INTERVALS = [
  { id: 5, label: "5m" },
  { id: 15, label: "15m" },
  { id: 30, label: "30m" },
  { id: 60, label: "1h" },
  { id: 240, label: "4h" },
  { id: 1440, label: "1j" },
] as const;

export const EMPTY_STATS: BotStats = {
  trades: 0,
  wins: 0,
  feesPaid: 0,
  realizedPnl: 0,
  volume: 0,
};

export const DEFAULT_PAPER: PaperAccount = {
  startingBalance: 10_000,
  cash: 10_000,
  holdings: {},
  feesPaid: 0,
  realizedPnl: 0,
  feeRate: 0.0026,
  trades: [],
  equityCurve: [],
};

export function defaultParams(kind: BotKind, last: number): BotParams {
  if (kind === "grid") {
    return {
      lower: roundSmart(last * 0.96),
      upper: roundSmart(last * 1.04),
      levels: 8,
    };
  }
  if (kind === "dca") return { intervalMs: 300_000 };
  if (kind === "rsi") return { rsiPeriod: 14, oversold: 30, overbought: 70 };
  if (kind === "ema") return { fast: 9, slow: 21 };
  if (kind === "bollinger") return { bbPeriod: 20, bbMult: 2 };
  if (kind === "stoch") return { stochN: 14, oversold: 20, overbought: 80 };
  if (kind === "vwap") return {};
  if (kind === "breakout") return { donchian: 20 };
  if (kind === "supertrend") return { atrPeriod: 10, atrMult: 3 };
  if (kind === "volume") return { volMult: 2 };
  if (kind === "scalp") return { fast: 5, slow: 13, rsiPeriod: 7 };
  if (kind === "cci") return { cciPeriod: 20, oversold: -100, overbought: 100 };
  if (kind === "meanrev") return { zWindow: 20, zEntry: 1.6 };
  if (kind === "keltner") return { kcPeriod: 20, kcMult: 1.5 };
  if (kind === "roc") return { rocPeriod: 12 };
  if (kind === "adx") return { adxPeriod: 14, adxMin: 20 };
  if (kind === "williams") return { wrPeriod: 14, oversold: -80, overbought: -20 };
  if (kind === "ichimoku") return { tenkan: 9, kijun: 26 };
  if (kind === "psar") return { psarAf: 0.02, psarMax: 0.2 };
  if (kind === "sma") return { fast: 50, slow: 200 };
  if (kind === "ha") return {};
  return { macdFast: 12, macdSlow: 26, macdSignal: 9 };
}

export function defaultSize(kind: BotKind): number {
  if (kind === "dca") return 50;
  if (kind === "grid") return 80;
  return 200;
}

function roundSmart(n: number): number {
  if (!(n > 0)) return 0;
  if (n >= 1000) return Math.round(n);
  if (n >= 100) return Math.round(n * 10) / 10;
  if (n >= 1) return Math.round(n * 100) / 100;
  return Number(n.toPrecision(4));
}

export type BotFill = {
  side: "buy" | "sell";
  qty: number;
  price: number;
  note: string;
};

export type BotEvalCtx = {
  now: number;
  ticker: Ticker;
  candles?: Candle[];
  equity?: number;
};

export function evaluateBot(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const raw = evaluateRaw(bot, ctx);
  return applyRisk(bot, ctx, raw);
}

function evaluateRaw(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  switch (bot.kind) {
    case "grid":
      return evalGrid(bot, ctx);
    case "dca":
      return evalDca(bot, ctx);
    case "rsi":
      return evalRsi(bot, ctx);
    case "ema":
      return evalEma(bot, ctx);
    case "bollinger":
      return evalBb(bot, ctx);
    case "macd":
      return evalMacd(bot, ctx);
    case "stoch":
      return evalStoch(bot, ctx);
    case "vwap":
      return evalVwap(bot, ctx);
    case "breakout":
      return evalBreakout(bot, ctx);
    case "supertrend":
      return evalSupertrend(bot, ctx);
    case "volume":
      return evalVolume(bot, ctx);
    case "scalp":
      return evalScalp(bot, ctx);
    case "cci":
      return evalCci(bot, ctx);
    case "meanrev":
      return evalMeanRev(bot, ctx);
    case "keltner":
      return evalKeltner(bot, ctx);
    case "roc":
      return evalRoc(bot, ctx);
    case "adx":
      return evalAdx(bot, ctx);
    case "williams":
      return evalWilliams(bot, ctx);
    case "ichimoku":
      return evalIchimoku(bot, ctx);
    case "psar":
      return evalPsar(bot, ctx);
    case "sma":
      return evalSma(bot, ctx);
    case "ha":
      return evalHa(bot, ctx);
  }
}

function px(ctx: BotEvalCtx, side: "buy" | "sell"): number {
  const last = ctx.ticker.last;
  const quoted = side === "buy" ? ctx.ticker.ask : ctx.ticker.bid;
  if (quoted > 0 && last > 0 && Math.abs(quoted - last) / last < 0.02) return quoted;
  return last || quoted;
}

function qtyFromQuote(sizeQuote: number, price: number): number {
  if (!(price > 0) || !(sizeQuote > 0)) return 0;
  return sizeQuote / price;
}

function sizeQuoteOf(bot: Bot, ctx: BotEvalCtx): number {
  const pct = bot.params.sizePct;
  if (pct && pct > 0 && ctx.equity && ctx.equity > 0) {
    return Math.max(0, ctx.equity * (pct / 100));
  }
  return bot.sizeQuote;
}

function orderQty(bot: Bot, ctx: BotEvalCtx, price: number): number {
  return qtyFromQuote(sizeQuoteOf(bot, ctx), price);
}

function linspace(lo: number, hi: number, n: number): number[] {
  const levels = Math.max(2, Math.min(24, Math.round(n)));
  const step = (hi - lo) / (levels - 1);
  return Array.from({ length: levels }, (_, i) => lo + step * i);
}

function evalGrid(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const lower = bot.params.lower ?? 0;
  const upper = bot.params.upper ?? 0;
  const n = bot.params.levels ?? 8;
  const runtime: BotRuntime = { ...bot.runtime };
  if (!(lower > 0) || !(upper > lower)) {
    return { fills: [], runtime, note: "Fourchette de grille invalide." };
  }
  const prices = linspace(lower, upper, n);
  const owned: GridLevelState[] = runtime.gridOwned?.length === prices.length
    ? runtime.gridOwned.map((g) => ({ ...g }))
    : prices.map((price) => ({ price, qty: 0, entry: 0 }));
  const last = ctx.ticker.last;
  const prev = runtime.lastPrice;
  const fills: BotFill[] = [];

  if (prev == null || !(prev > 0)) {
    runtime.lastPrice = last;
    runtime.gridOwned = owned;
    return { fills, runtime, note: "Grille armée — en attente d’un croisement." };
  }

  for (let i = 0; i < prices.length - 1; i++) {
    const lvl = prices[i]!;
    if (owned[i]!.qty <= 0 && prev > lvl && last <= lvl) {
      const fillPx = px(ctx, "buy");
      const qty = orderQty(bot, ctx, fillPx);
      if (qty > 0) {
        fills.push({ side: "buy", qty, price: fillPx, note: `Grille achat @ ${roundSmart(lvl)}` });
        owned[i] = { price: lvl, qty, entry: fillPx };
      }
    }
  }
  for (let i = 1; i < prices.length; i++) {
    const lvl = prices[i]!;
    const below = owned[i - 1]!;
    if (below.qty > 0 && prev < lvl && last >= lvl) {
      const fillPx = px(ctx, "sell");
      fills.push({
        side: "sell",
        qty: below.qty,
        price: fillPx,
        note: `Grille vente @ ${roundSmart(lvl)}`,
      });
      owned[i - 1] = { price: below.price, qty: 0, entry: 0 };
    }
  }

  runtime.lastPrice = last;
  runtime.gridOwned = owned;
  const held = owned.filter((g) => g.qty > 0).length;
  return {
    fills,
    runtime,
    note: fills.length
      ? fills.map((f) => f.note).join(" · ")
      : `En attente · ${held}/${prices.length - 1} niveaux chargés`,
  };
}

function evalDca(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const every = bot.params.intervalMs ?? 300_000;
  const due = runtime.nextDcaAt ?? ctx.now;
  if (ctx.now < due) {
    const wait = Math.max(0, due - ctx.now);
    return {
      fills: [],
      runtime,
      note: `Prochain achat dans ${formatWait(wait)}`,
    };
  }
  const fillPx = px(ctx, "buy");
  const qty = orderQty(bot, ctx, fillPx);
  runtime.nextDcaAt = ctx.now + every;
  runtime.lastPrice = ctx.ticker.last;
  if (!(qty > 0)) return { fills: [], runtime, note: "Taille trop faible." };
  return {
    fills: [{ side: "buy", qty, price: fillPx, note: `DCA ${roundSmart(sizeQuoteOf(bot, ctx))} EUR` }],
    runtime,
    note: `Achat DCA @ ${roundSmart(fillPx)}`,
  };
}

function evalRsi(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(2, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 30;
  const ob = bot.params.overbought ?? 70;
  if (!candles || candles.length < period + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le RSI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? `En position · RSI ${fmt(runtime.lastRsi)}` : `Hors marché · RSI ${fmt(runtime.lastRsi)}` };
  }
  const closes = candles.map((c) => c.close);
  const series = rsi(closes, period);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = r ?? undefined;
  runtime.lastClose = lastCandle.close;
  if (r == null || prev == null) return { fills: [], runtime, note: "RSI en chauffe." };

  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev >= os && r < os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `RSI ${r.toFixed(1)} < ${os}` });
      runtime.inPosition = true;
      runtime.positionQty = qty;
      runtime.positionAvg = fillPx;
    }
  } else if (runtime.inPosition && runtime.positionQty && prev <= ob && r > ob) {
    const fillPx = px(ctx, "sell");
    fills.push({
      side: "sell",
      qty: runtime.positionQty,
      price: fillPx,
      note: `RSI ${r.toFixed(1)} > ${ob}`,
    });
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `RSI ${r.toFixed(1)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalEma(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const fastN = Math.max(2, bot.params.fast ?? 9);
  const slowN = Math.max(fastN + 1, bot.params.slow ?? 21);
  if (!candles || candles.length < slowN + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour les EMA." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `EMA ${fastN}/${slowN} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const closes = candles.map((c) => c.close);
  const fast = ema(closes, fastN);
  const slow = ema(closes, slowN);
  const f = fast[fast.length - 1];
  const s = slow[slow.length - 1];
  const pf = fast[fast.length - 2];
  const ps = slow[slow.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = f ?? undefined;
  runtime.lastEmaSlow = s ?? undefined;
  if (f == null || s == null || pf == null || ps == null) {
    return { fills: [], runtime, note: "EMA en chauffe." };
  }
  const fills: BotFill[] = [];
  const crossUp = pf <= ps && f > s;
  const crossDown = pf >= ps && f < s;
  if (!runtime.inPosition && crossUp) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `EMA ${fastN} croise au-dessus` });
      runtime.inPosition = true;
      runtime.positionQty = qty;
      runtime.positionAvg = fillPx;
    }
  } else if (runtime.inPosition && runtime.positionQty && crossDown) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `EMA ${fastN} croise en-dessous` });
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `EMA ${fmt(f)} / ${fmt(s)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalBb(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.bbPeriod ?? 20);
  const mult = bot.params.bbMult ?? 2;
  if (!candles || candles.length < period + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Bollinger." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long · bande médiane" : "Flat · en attente d’un toucher" };
  }
  const closes = candles.map((c) => c.close);
  const bands = bollinger(closes, period, mult);
  const i = closes.length - 1;
  const close = closes[i]!;
  const prevClose = closes[i - 1]!;
  const lower = bands.lower[i];
  const upper = bands.upper[i];
  const prevLower = bands.lower[i - 1];
  const prevUpper = bands.upper[i - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastClose = close;
  if (lower == null || upper == null || prevLower == null || prevUpper == null) {
    return { fills: [], runtime, note: "Bandes en chauffe." };
  }
  const fills: BotFill[] = [];
  const touchLow = prevClose > prevLower && close <= lower;
  const touchHigh = prevClose < prevUpper && close >= upper;
  if (!runtime.inPosition && touchLow) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Toucher bande basse" });
      runtime.inPosition = true;
      runtime.positionQty = qty;
      runtime.positionAvg = fillPx;
    }
  } else if (runtime.inPosition && runtime.positionQty && touchHigh) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Toucher bande haute" });
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Close ${roundSmart(close)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalMacd(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalStoch(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalVwap(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  if (!candles || candles.length < 20) return { fills: [], runtime, note: "Chandeliers insuffisants pour la VWAP." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long sous/sur VWAP" : "Flat · VWAP" };
  }
  const series = vwap(candles);
  const v = series[series.length - 1];
  const pv = series[series.length - 2];
  const close = lastCandle.close;
  const prev = candles[candles.length - 2]!.close;
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastVwap = v ?? undefined;
  if (v == null || pv == null) return { fills: [], runtime, note: "VWAP en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev >= pv && close < v) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Prix sous VWAP" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev <= pv && close > v) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Retour au-dessus VWAP" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `VWAP ${roundSmart(v)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalBreakout(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const n = Math.max(5, bot.params.donchian ?? 20);
  if (!candles || candles.length < n + 3) return { fills: [], runtime, note: "Chandeliers insuffisants pour Donchian." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long breakout" : "En attente de cassure" };
  }
  const prior = candles.slice(0, -1);
  const bands = donchian(prior, n);
  const hi = bands.upper[bands.upper.length - 1];
  const lo = bands.lower[bands.lower.length - 1];
  runtime.lastCandleTime = lastCandle.time;
  if (hi == null || lo == null) return { fills: [], runtime, note: "Canal Donchian en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && lastCandle.close > hi) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Cassure ${roundSmart(hi)}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && lastCandle.close < lo) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `Rupture basse ${roundSmart(lo)}` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Canal ${roundSmart(lo)}–${roundSmart(hi)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalSupertrend(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = bot.params.atrPeriod ?? 10;
  const mult = bot.params.atrMult ?? 3;
  if (!candles || candles.length < period + 5) return { fills: [], runtime, note: "Chandeliers insuffisants pour Supertrend." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `Supertrend ${runtime.lastTrend ?? "—"}` };
  }
  const st = supertrend(candles, period, mult);
  const d = st.dir[st.dir.length - 1];
  const pd = st.dir[st.dir.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastTrend = d ?? undefined;
  runtime.lastSupertrend = st.line[st.line.length - 1] ?? undefined;
  if (!d || !pd) return { fills: [], runtime, note: "Supertrend en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pd === "down" && d === "up") {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Supertrend haussier" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pd === "up" && d === "down") {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Supertrend baissier" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Tendance ${d} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalVolume(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const mult = bot.params.volMult ?? 2;
  if (!candles || candles.length < 24) return { fills: [], runtime, note: "Chandeliers insuffisants pour le volume." };
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long spike" : "En attente d’un spike" };
  }
  const look = candles.slice(-21, -1);
  const avg = look.reduce((s, c) => s + c.volume, 0) / look.length;
  runtime.lastCandleTime = lastCandle.time;
  const spike = avg > 0 && lastCandle.volume > avg * mult;
  const bull = lastCandle.close >= lastCandle.open;
  const fills: BotFill[] = [];
  if (!runtime.inPosition && spike && bull) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `Volume ×${(lastCandle.volume / avg).toFixed(1)}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && spike && !bull) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Spike vendeur" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Vol ${spike ? "élevé" : "calme"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalScalp(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalCci(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.cciPeriod ?? 20);
  const os = bot.params.oversold ?? -100;
  const ob = bot.params.overbought ?? 100;
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le CCI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `CCI ${fmt(runtime.lastCci)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = cci(candles, period);
  const v = series[series.length - 1];
  const pv = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastCci = v ?? undefined;
  if (v == null || pv == null) return { fills: [], runtime, note: "CCI en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pv <= os && v > os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `CCI ${v.toFixed(0)} sort de survente` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pv >= ob && v < ob) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `CCI ${v.toFixed(0)} sort de surachat` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `CCI ${v.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalMeanRev(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalKeltner(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.kcPeriod ?? 20);
  const mult = bot.params.kcMult ?? 1.5;
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Keltner." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long Keltner" : "Flat · Keltner" };
  }
  const bands = keltner(candles, period, mult);
  const i = candles.length - 1;
  const close = lastCandle.close;
  const prev = candles[i - 1]!.close;
  const lower = bands.lower[i];
  const upper = bands.upper[i];
  const prevLower = bands.lower[i - 1];
  const prevUpper = bands.upper[i - 1];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastClose = close;
  if (lower == null || upper == null || prevLower == null || prevUpper == null) {
    return { fills: [], runtime, note: "Keltner en chauffe." };
  }
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev > prevLower && close <= lower) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Toucher Keltner bas" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev < prevUpper && close >= upper) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Toucher Keltner haut" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `Close ${roundSmart(close)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalRoc(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(2, bot.params.rocPeriod ?? 12);
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le ROC." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `ROC ${fmt(runtime.lastRoc)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = roc(candles.map((c) => c.close), period);
  const v = series[series.length - 1];
  const pv = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRoc = v ?? undefined;
  if (v == null || pv == null) return { fills: [], runtime, note: "ROC en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pv <= 0 && v > 0) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `ROC +${v.toFixed(2)} %` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pv >= 0 && v < 0) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `ROC ${v.toFixed(2)} %` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `ROC ${v >= 0 ? "+" : ""}${v.toFixed(2)} % · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalAdx(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalWilliams(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const n = Math.max(5, bot.params.wrPeriod ?? 14);
  const os = bot.params.oversold ?? -80;
  const ob = bot.params.overbought ?? -20;
  if (!candles || candles.length < n + 3) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Williams %R." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `%R ${fmt(runtime.lastWr)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = williamsR(candles, n);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastWr = r ?? undefined;
  if (r == null || prev == null) return { fills: [], runtime, note: "%R en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev <= os && r > os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `%R ${r.toFixed(0)} sort de survente` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev >= ob && r < ob) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `%R ${r.toFixed(0)} quitte le surachat` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `%R ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalIchimoku(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalPsar(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const step = bot.params.psarAf ?? 0.02;
  const maxAf = bot.params.psarMax ?? 0.2;
  if (!candles || candles.length < 8) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le SAR." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `SAR ${runtime.lastTrend ?? "—"}` };
  }
  const s = psar(candles, step, maxAf);
  const d = s.dir[s.dir.length - 1];
  const pd = s.dir[s.dir.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastTrend = d ?? undefined;
  runtime.lastSar = s.sar[s.sar.length - 1] ?? undefined;
  if (!d || !pd) return { fills: [], runtime, note: "SAR en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && pd === "down" && d === "up") {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "SAR haussier" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && pd === "up" && d === "down") {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "SAR baissier" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `SAR ${d} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalSma(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalHa(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  if (!candles || candles.length < 8) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour Heikin-Ashi." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `HA · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const ha = heikinAshi(candles);
  const cur = ha[ha.length - 1]!;
  const prev = ha[ha.length - 2]!;
  const bull = cur.close >= cur.open;
  const prevBull = prev.close >= prev.open;
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastTrend = bull ? "up" : "down";
  const fills: BotFill[] = [];
  if (!runtime.inPosition && bull && !prevBull) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Heikin-Ashi vert" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && !bull && prevBull) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Heikin-Ashi rouge" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `HA ${bull ? "haussier" : "baissier"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function markLong(runtime: BotRuntime, qty: number, px: number) {
  runtime.inPosition = true;
  runtime.positionQty = qty;
  runtime.positionAvg = px;
}

function markFlat(runtime: BotRuntime) {
  runtime.inPosition = false;
  runtime.positionQty = 0;
  runtime.positionAvg = 0;
}

function applyRisk(
  bot: Bot,
  ctx: BotEvalCtx,
  raw: { fills: BotFill[]; runtime: BotRuntime; note: string },
): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime = { ...raw.runtime };
  let fills = [...raw.fills];
  let note = raw.note;
  const now = ctx.now;
  const last = ctx.ticker.last;
  const day = new Date(now).toISOString().slice(0, 10);
  if (runtime.dayStamp !== day) {
    runtime.dayStamp = day;
    runtime.dayPnl = 0;
    runtime.dayTrades = 0;
  }

  const spreadPct =
    ctx.ticker.ask > 0 && ctx.ticker.bid > 0 && last > 0
      ? ((ctx.ticker.ask - ctx.ticker.bid) / last) * 100
      : 0;
  const maxSpread = bot.params.maxSpreadPct ?? 0;
  if (maxSpread > 0 && spreadPct > maxSpread) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) note = `Spread ${spreadPct.toFixed(2)} % trop large`;
  }

  const cooldownMs = (bot.params.cooldownSec ?? 0) * 1000;
  if (cooldownMs > 0 && bot.lastActionAt && now - bot.lastActionAt < cooldownMs) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) note = `Cooldown ${Math.ceil((cooldownMs - (now - bot.lastActionAt)) / 1000)}s`;
  }

  const cap = bot.params.maxDailyLoss ?? 0;
  if (cap > 0 && (runtime.dayPnl ?? 0) <= -cap) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) {
      note = `Stop journalier (${cap} EUR)`;
      return { fills, runtime, note };
    }
  }

  const maxTrades = bot.params.maxTradesDay ?? 0;
  if (maxTrades > 0 && (runtime.dayTrades ?? 0) >= maxTrades) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) note = `Quota ${maxTrades} trades / jour`;
  }

  const maxLosses = bot.params.maxConsecutiveLoss ?? 0;
  if (maxLosses > 0 && (runtime.consecutiveLosses ?? 0) >= maxLosses) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) note = `Pertes consécutives (${maxLosses})`;
  }

  if (runtime.inPosition && runtime.positionQty && runtime.positionAvg) {
    runtime.peakPrice = Math.max(runtime.peakPrice ?? runtime.positionAvg, last);
  } else if (!runtime.inPosition) {
    runtime.peakPrice = undefined;
  }

  if (runtime.inPosition && runtime.positionQty && runtime.positionAvg && !fills.some((f) => f.side === "sell")) {
    const pct = ((last - runtime.positionAvg) / runtime.positionAvg) * 100;
    const sl = bot.params.slPct;
    const tp = bot.params.tpPct;
    const trail = bot.params.trailingPct;
    const peak = runtime.peakPrice ?? runtime.positionAvg;
    if (sl && sl > 0 && pct <= -sl) {
      fills.push({
        side: "sell",
        qty: runtime.positionQty,
        price: px(ctx, "sell"),
        note: `Stop-loss ${pct.toFixed(2)} %`,
      });
      markFlat(runtime);
      note = fills[fills.length - 1]!.note;
    } else if (tp && tp > 0 && pct >= tp) {
      fills.push({
        side: "sell",
        qty: runtime.positionQty,
        price: px(ctx, "sell"),
        note: `Take-profit ${pct.toFixed(2)} %`,
      });
      markFlat(runtime);
      note = fills[fills.length - 1]!.note;
    } else if (trail && trail > 0 && peak > runtime.positionAvg && last <= peak * (1 - trail / 100)) {
      fills.push({
        side: "sell",
        qty: runtime.positionQty,
        price: px(ctx, "sell"),
        note: `Trailing ${trail} % depuis ${roundSmart(peak)}`,
      });
      markFlat(runtime);
      note = fills[fills.length - 1]!.note;
    }
  }
  return { fills, runtime, note };
}

export function kindTitle(kind: BotKind): string {
  return BOT_KIND_BY_ID[kind]?.title ?? kind;
}

export type BacktestResult = {
  trades: number;
  buys: number;
  sells: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  pnlPct: number;
  realizedPnl: number;
  fees: number;
  equity: number;
  startEquity: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  buyHoldPnl: number;
  buyHoldPct: number;
  bars: number;
  from: number;
  to: number;
  interval: number;
  requestedDays: number;
  exposurePct: number;
  equityCurve: { t: number; v: number }[];
  tradeLog: { time: number; side: "buy" | "sell"; price: number; pnl: number; note: string }[];
};

export type BacktestOpts = {
  startingBalance?: number;
  slippageBps?: number;
  warmup?: number;
  interval?: number;
  requestedDays?: number;
};

export function backtestBot(
  kind: BotKind,
  params: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair = "XBTEUR",
  opts: BacktestOpts = {},
): BacktestResult | null {
  if (candles.length < 30) return null;
  const meta = PAIR_BY_ID[pair];
  const base = meta?.base ?? "BTC";
  const startEquity = Math.max(100, opts.startingBalance ?? 10_000);
  const slip = Math.max(0, (opts.slippageBps ?? 0) / 10_000);
  const warmup = Math.max(20, Math.min(opts.warmup ?? 40, candles.length - 5));
  let bot: Bot = {
    id: "bt",
    name: "bt",
    kind,
    venue: "paper",
    status: "running",
    pair,
    interval: opts.interval ?? 15,
    sizeQuote,
    params,
    createdAt: 0,
    lastNote: "",
    stats: { ...EMPTY_STATS },
    runtime: {},
  };
  let paper = resetPaperAccount(startEquity, feeRate);
  const curve: { t: number; v: number }[] = [{ t: candles[warmup]!.time * 1000, v: startEquity }];
  let barsInPos = 0;
  const firstPx = candles[warmup]!.close;

  for (let i = warmup; i < candles.length; i++) {
    const c = candles[i]!;
    const slice = candles.slice(0, i + 1);
    const ticker = {
      id: pair,
      last: c.close,
      bid: c.close * (1 - slip),
      ask: c.close * (1 + slip),
      open: c.open,
      high: c.high,
      low: c.low,
      volume: c.volume,
      vwap: c.close,
      change: 0,
      changePct: 0,
      trades: 0,
      quoteVolume: 0,
    };
    const { fills, runtime } = evaluateBot(bot, {
      now: c.time * 1000,
      ticker,
      candles: slice,
      equity: paperEquity(paper, { [pair]: ticker }),
    });
    bot = { ...bot, runtime };
    if (runtime.inPosition) barsInPos += 1;
    for (const fill of fills) {
      const px = fill.side === "buy" ? fill.price * (1 + slip) : fill.price * (1 - slip);
      const res = applyPaperFill(paper, {
        botId: "bt",
        pair,
        base,
        side: fill.side,
        qty: fill.qty,
        price: px,
        note: fill.note,
        time: c.time * 1000,
      });
      if (res.ok) {
        paper = res.paper;
        bot = { ...bot, lastActionAt: c.time * 1000 };
      }
    }
    if (i === candles.length - 1 || i % 3 === 0 || fills.length) {
      const mark = paper.cash + Object.values(paper.holdings).reduce((s, h) => s + h.qty * c.close, 0);
      curve.push({ t: c.time * 1000, v: mark });
    }
  }

  const last = candles[candles.length - 1]!.close;
  const eq = paper.cash + Object.values(paper.holdings).reduce((s, h) => s + h.qty * last, 0);
  const sells = paper.trades.filter((t) => t.side === "sell");
  const winsList = sells.filter((t) => t.pnl > 0);
  const lossList = sells.filter((t) => t.pnl <= 0);
  const grossWin = winsList.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(lossList.reduce((s, t) => s + t.pnl, 0));
  let peak = startEquity;
  let maxDd = 0;
  for (const p of curve) {
    peak = Math.max(peak, p.v);
    maxDd = Math.max(maxDd, peak - p.v);
  }
  const qtyBh = startEquity / firstPx;
  const buyHold = qtyBh * last - startEquity;
  const tested = candles.length - warmup;

  return {
    trades: paper.trades.length,
    buys: paper.trades.filter((t) => t.side === "buy").length,
    sells: sells.length,
    wins: winsList.length,
    losses: lossList.length,
    winRate: sells.length ? (winsList.length / sells.length) * 100 : 0,
    pnl: eq - startEquity,
    pnlPct: ((eq - startEquity) / startEquity) * 100,
    realizedPnl: paper.realizedPnl,
    fees: paper.feesPaid,
    equity: eq,
    startEquity,
    maxDrawdown: maxDd,
    maxDrawdownPct: peak > 0 ? (maxDd / peak) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0,
    avgWin: winsList.length ? grossWin / winsList.length : 0,
    avgLoss: lossList.length ? -(grossLoss / lossList.length) : 0,
    expectancy: sells.length ? (grossWin - grossLoss) / sells.length : 0,
    buyHoldPnl: buyHold,
    buyHoldPct: (buyHold / startEquity) * 100,
    bars: tested,
    from: candles[0]!.time,
    to: candles[candles.length - 1]!.time,
    interval: opts.interval ?? 15,
    requestedDays: opts.requestedDays ?? 0,
    exposurePct: tested ? (barsInPos / tested) * 100 : 0,
    equityCurve: curve.slice(-240),
    tradeLog: paper.trades
      .slice()
      .reverse()
      .map((t) => ({ time: t.time, side: t.side, price: t.price, pnl: t.pnl, note: t.note })),
  };
}

function fmt(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}

export function formatWait(ms: number): string {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h`;
  return `${Math.floor(h / 24)} j`;
}

export function assetPx(asset: string, tickers: Record<string, Ticker>): number {
  if (asset === "EUR") return 1;
  if (asset === "USD") return 1;
  const aliases: Record<string, string> = { BTC: "XBTEUR", XBT: "XBTEUR", DOGE: "XDGEUR", XDG: "XDGEUR" };
  const direct = tickers[aliases[asset] ?? `${asset}EUR`];
  if (direct?.last) return direct.last;
  const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "EUR");
  return t?.last ?? 0;
}

export function paperEquity(paper: PaperAccount, tickers: Record<string, Ticker>): number {
  let v = paper.cash;
  for (const [asset, h] of Object.entries(paper.holdings ?? {})) {
    v += h.qty * assetPx(asset, tickers);
  }
  return v;
}

export function applyPaperFill(
  paper: PaperAccount,
  input: {
    botId: string;
    pair: string;
    base: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    note: string;
    time?: number;
  },
): { ok: true; paper: PaperAccount; trade: PaperTrade } | { ok: false; message: string } {
  const feeRate = paper.feeRate;
  if (!(input.qty > 0) || !(input.price > 0)) return { ok: false, message: "Quantité ou prix invalide." };
  const notional = input.qty * input.price;
  const fee = notional * feeRate;
  const holdings = { ...paper.holdings };
  const pos = holdings[input.base] ?? { qty: 0, avg: 0 };
  let cash = paper.cash;
  let realized = paper.realizedPnl;
  let pnl = 0;

  if (input.side === "buy") {
    const spend = notional + fee;
    if (cash < spend) return { ok: false, message: `Solde papier insuffisant (${spend.toFixed(2)} EUR requis).` };
    const newQty = pos.qty + input.qty;
    const newAvg = newQty > 0 ? (pos.avg * pos.qty + notional) / newQty : 0;
    holdings[input.base] = { qty: newQty, avg: newAvg };
    cash -= spend;
  } else {
    if (pos.qty + 1e-12 < input.qty) {
      return { ok: false, message: `Position ${input.base} insuffisante.` };
    }
    pnl = notional - fee - pos.avg * input.qty;
    const newQty = pos.qty - input.qty;
    if (newQty <= 1e-12) delete holdings[input.base];
    else holdings[input.base] = { qty: newQty, avg: pos.avg };
    cash += notional - fee;
    realized += pnl;
  }

  const trade: PaperTrade = {
    id: uid("pt"),
    botId: input.botId,
    pair: input.pair,
    side: input.side,
    amount: input.qty,
    price: input.price,
    fee,
    pnl,
    note: input.note,
    time: input.time ?? Date.now(),
  };

  const next: PaperAccount = {
    ...paper,
    cash,
    holdings,
    feesPaid: paper.feesPaid + fee,
    realizedPnl: realized,
    trades: [trade, ...paper.trades].slice(0, 250),
  };
  return { ok: true, paper: next, trade };
}

export function snapshotEquity(paper: PaperAccount, equity: number): PaperAccount {
  const curve = [...paper.equityCurve, { t: Date.now(), v: equity }].slice(-180);
  return { ...paper, equityCurve: curve };
}

export function resetPaperAccount(startingBalance: number, feeRate: number): PaperAccount {
  const start = Math.max(0, startingBalance);
  return {
    startingBalance: start,
    cash: start,
    holdings: {},
    feesPaid: 0,
    realizedPnl: 0,
    feeRate,
    trades: [],
    equityCurve: [{ t: Date.now(), v: start }],
  };
}

export function flattenPaper(
  paper: PaperAccount,
  tickers: Record<string, Ticker>,
): { paper: PaperAccount; sold: number } {
  let next = paper;
  let sold = 0;
  for (const [asset, h] of Object.entries(paper.holdings)) {
    if (!(h.qty > 0)) continue;
    const pair = Object.values(PAIR_BY_ID).find((p) => p.base === asset && p.quote === "EUR");
    const t = pair ? tickers[pair.id] : undefined;
    const price = t?.bid || t?.last || 0;
    if (!pair || !(price > 0)) continue;
    const res = applyPaperFill(next, {
      botId: "flatten",
      pair: pair.id,
      base: asset,
      side: "sell",
      qty: h.qty,
      price,
      note: "Liquidation papier",
    });
    if (res.ok) {
      next = res.paper;
      sold += 1;
    }
  }
  return { paper: next, sold };
}

export function kindNeedsCandles(kind: BotKind): boolean {
  return BOT_KIND_BY_ID[kind]?.needsCandles ?? false;
}
