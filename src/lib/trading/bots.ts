import { adx, atr, bollinger, cci, donchian, ema, heikinAshi, ichimoku, keltner, macd, mfi, obv, psar, roc, rsi, sma, stochastic, supertrend, vwap, williamsR, zscore } from "./indicators.ts";
import { uid } from "./format.ts";
import { PAIR_BY_ID } from "./pairs.ts";
import type {
  Bot,
  BotKind,
  BotParams,
  BotRuntime,
  BotStats,
  BotVenue,
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
    blurb: "Lots mémorisés : revente à +X % du prix d’achat, nouvel achat plus bas, rachat au prix d’origine après une vente.",
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
  {
    id: "mfi",
    title: "Money Flow",
    blurb: "RSI pondéré par le volume : entre en sous-flux, sort en sur-flux.",
    needsCandles: true,
  },
  {
    id: "engulf",
    title: "Engulfing",
    blurb: "Entre sur une bougie d’engloutissement haussière, sort à la baissière.",
    needsCandles: true,
  },
  {
    id: "obv",
    title: "OBV",
    blurb: "Suit le flux de volume : entre quand l’OBV croise au-dessus de son EMA.",
    needsCandles: true,
  },
  {
    id: "div",
    title: "Divergence RSI",
    blurb: "Achète une divergence haussière prix / RSI, sort en surachat.",
    needsCandles: true,
  },
  {
    id: "confirm",
    title: "Confirmation",
    blurb: "N’entre que si EMA, MACD et RSI sont d’accord — moins de faux signaux.",
    needsCandles: true,
  },
  {
    id: "mtf",
    title: "Multi-TF RSI",
    blurb: "Vote RSI croisé sur 2–3 intervalles réels (pas le même tick recopié).",
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
  closes: 0,
  feesPaid: 0,
  realizedPnl: 0,
  volume: 0,
};

/** Drop the current Kraken OHLC frame if it has not closed yet. */
export function dropFormingCandle(candles: Candle[] | undefined, intervalMin: number, nowMs: number): Candle[] | undefined {
  if (!candles?.length || !(intervalMin > 0) || !(nowMs > 0)) return candles;
  const last = candles[candles.length - 1]!;
  const closeAt = last.time + intervalMin * 60;
  if (nowMs / 1000 + 0.5 < closeAt) return candles.slice(0, -1);
  return candles;
}

export function botInventoryQty(runtime: BotRuntime): number {
  const pos = runtime.positionQty ?? 0;
  if (pos > 0) return pos;
  return (runtime.gridOwned ?? []).reduce((s, g) => s + (g.qty > 0 ? g.qty : 0), 0);
}

export function botMark(runtime: BotRuntime, last: number): { qty: number; avg: number; exposure: number; unrealized: number } {
  const qty = botInventoryQty(runtime);
  const avg = runtime.positionAvg ?? 0;
  const exposure = qty > 0 && last > 0 ? qty * last : 0;
  const unrealized = qty > 0 && avg > 0 && last > 0 ? (last - avg) * qty : 0;
  return { qty, avg, exposure, unrealized };
}

/** Cash actually tied up in open lots (entry × qty), not marked value. */
export function botDeployed(runtime: BotRuntime): number {
  const lots = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
  if (lots.length) return lots.reduce((s, g) => s + g.qty * g.entry, 0);
  const qty = runtime.positionQty ?? 0;
  const avg = runtime.positionAvg ?? 0;
  return qty > 0 && avg > 0 ? qty * avg : 0;
}

/** Remaining EUR this bot may still spend. `undefined` = unlimited. */
export function remainingQuoteBudget(params: BotParams, runtime: BotRuntime, available?: number): number | undefined {
  const cap = params.budgetQuote ?? 0;
  const leftover = cap > 0 ? Math.max(0, cap - botDeployed(runtime)) : undefined;
  if (available == null && leftover == null) return undefined;
  if (available == null) return leftover;
  if (leftover == null) return Math.max(0, available);
  return Math.max(0, Math.min(available, leftover));
}

export type GridChartLevel = { price: number; kind: "buy" | "sell" | "entry" | "band"; title: string };

export function gridChartLevels(
  bot: { params: BotParams; runtime: BotRuntime },
  feeRate?: number,
): GridChartLevel[] {
  const pad = gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
  const sellPct = (bot.params.gridSellPct ?? 1.5) + pad;
  const out: GridChartLevel[] = [];
  const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
  const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
  if (lo > 0) out.push({ price: lo, kind: "band", title: "Plancher" });
  if (hi > 0) out.push({ price: hi, kind: "band", title: "Plafond" });
  for (const g of bot.runtime.gridOwned ?? []) {
    if (g.pending && g.price > 0) out.push({ price: g.price, kind: "buy", title: "Achat" });
    else if (g.qty > 0 && g.entry > 0) {
      out.push({ price: g.entry, kind: "entry", title: "Lot" });
      out.push({ price: g.entry * (1 + sellPct / 100), kind: "sell", title: "Vente" });
    }
  }
  return out.slice(0, 16);
}

export type DeskLimits = {
  deskDailyLoss?: number;
  deskDrawdownPct?: number;
  deskMaxExposurePct?: number;
};

export type DeskSnapshot = {
  equity: number;
  peak: number;
  dayPnl: number;
  exposure: number;
  drawdownPct: number;
  halt: "daily" | "drawdown" | null;
  blockBuys: boolean;
  note: string | null;
};

export function evaluateDesk(input: {
  equity: number;
  peak: number;
  dayPnl: number;
  exposure: number;
  limits: DeskLimits;
}): DeskSnapshot {
  const peak = Math.max(input.peak, input.equity, 0);
  const drawdownPct = peak > 0 ? Math.max(0, ((peak - input.equity) / peak) * 100) : 0;
  const daily = input.limits.deskDailyLoss ?? 0;
  const dd = input.limits.deskDrawdownPct ?? 0;
  const exp = input.limits.deskMaxExposurePct ?? 0;
  let halt: DeskSnapshot["halt"] = null;
  let note: string | null = null;
  if (daily > 0 && input.dayPnl <= -daily) {
    halt = "daily";
    note = `Stop bureau · perte jour ${daily} EUR`;
  } else if (dd > 0 && drawdownPct >= dd) {
    halt = "drawdown";
    note = `Stop bureau · drawdown ${dd} %`;
  }
  const overExp = exp > 0 && input.equity > 0 && (input.exposure / input.equity) * 100 >= exp;
  const blockBuys = halt != null || overExp;
  if (!note && overExp) note = `Exposition max ${exp} %`;
  return {
    equity: input.equity,
    peak,
    dayPnl: input.dayPnl,
    exposure: input.exposure,
    drawdownPct,
    halt,
    blockBuys,
    note,
  };
}

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
  return { ...baseParams(kind, last), ...profitDefaults(kind) };
}

const MEAN_REVERSION = new Set<BotKind>([
  "rsi",
  "bollinger",
  "stoch",
  "vwap",
  "cci",
  "meanrev",
  "keltner",
  "williams",
  "mfi",
  "div",
  "mtf",
]);

const RANGE_BREAK = new Set<BotKind>(["breakout", "volume", "engulf"]);

/** Defaults that cut the two usual ways these bots lose money: knife-catches and fee churn. */
export function profitDefaults(kind: BotKind): Partial<BotParams> {
  if (kind === "grid" || kind === "dca") return {};
  if (RANGE_BREAK.has(kind)) return { slPct: 2.5, slAtr: 0, beAfterPct: 1.2, adxCeil: 0, adxFloor: 0 };
  if (MEAN_REVERSION.has(kind)) {
    return { adxCeil: 32, adxFloor: 0, slPct: 3.5, slAtr: 0, beAfterPct: 1.2, crashPct: 2.5 };
  }
  return { adxFloor: 18, adxCeil: 0, slPct: 0, slAtr: 2, beAfterPct: 1.2 };
}

/** Risk chips must not arm the overlay stop on a grid — that flattens every lot. */
export function riskPresetFor(kind: BotKind, preset: { params: Partial<BotParams> }): Partial<BotParams> {
  if (kind !== "grid") return preset.params;
  const { slPct, tpPct, trailingPct, slAtr, partialTp, maxHoldMin, trendEma, ...rest } = preset.params;
  return {
    ...rest,
    slPct: 0,
    tpPct: 0,
    trailingPct: 0,
    slAtr: 0,
    partialTp: 0,
    maxHoldMin: 0,
    trendEma: 0,
    gridSlPct: slPct && slPct > 0 ? slPct : 0,
  };
}

function tradingDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}

function baseParams(kind: BotKind, last: number): BotParams {
  if (kind === "grid") {
    return {
      lower: roundSmart(last * 0.96),
      upper: roundSmart(last * 1.04),
      levels: 8,
      gridSellPct: 1.5,
      gridBuyPct: 1,
      gridSlPct: 0,
      gridFollow: false,
      compoundPct: 0,
      gridNetFees: true,
      gridSeed: false,
      budgetQuote: 0,
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
  if (kind === "mfi") return { rsiPeriod: 14, oversold: 20, overbought: 80 };
  if (kind === "engulf") return {};
  if (kind === "obv") return { fast: 20 };
  if (kind === "div") return { rsiPeriod: 14, oversold: 40, overbought: 70 };
  if (kind === "confirm") return { fast: 9, slow: 21, rsiPeriod: 14, oversold: 35, overbought: 70, macdFast: 12, macdSlow: 26, macdSignal: 9 };
  if (kind === "mtf") {
    return {
      rsiPeriod: 14,
      oversold: 30,
      overbought: 70,
      mtfIntervals: [60, 240],
      mtfMode: "majority",
    };
  }
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
  /** Lot purchase price, so a grid sell is not marked at the blended average. */
  entry?: number;
};

export type BotEvalCtx = {
  now: number;
  ticker: Ticker;
  candles?: Candle[];
  /** Extra closed OHLC series by interval minutes (for mtf). */
  multiCandles?: Record<number, Candle[]>;
  equity?: number;
  barHigh?: number;
  barLow?: number;
  quoteBudget?: number;
  baseBudget?: number;
  feeRate?: number;
  maxFills?: number;
  /** Drop the uncommitted Kraken OHLC frame (live eval). Backtests keep the bar. */
  closedOnly?: boolean;
};

export function evaluateBot(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const candles = ctx.closedOnly ? dropFormingCandle(ctx.candles, bot.interval, ctx.now) : ctx.candles;
  const next = {
    ...ctx,
    candles,
    quoteBudget: remainingQuoteBudget(bot.params, bot.runtime, ctx.quoteBudget),
  };
  const raw = evaluateRaw(bot, next);
  return applyRisk(bot, next, raw);
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
    case "mfi":
      return evalMfi(bot, ctx);
    case "engulf":
      return evalEngulf(bot, ctx);
    case "obv":
      return evalObv(bot, ctx);
    case "div":
      return evalDiv(bot, ctx);
    case "confirm":
      return evalConfirm(bot, ctx);
    case "mtf":
      return evalMtf(bot, ctx);
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
  const risk = bot.params.atrRiskPct;
  if (risk && risk > 0 && ctx.equity && ctx.equity > 0 && ctx.candles && ctx.candles.length > 16) {
    const series = atr(ctx.candles, 14);
    const av = series[series.length - 1];
    const last = ctx.ticker.last;
    if (av != null && av > 0 && last > 0) {
      return Math.max(0, ((ctx.equity * (risk / 100)) / av) * last);
    }
  }
  const pct = bot.params.sizePct;
  if (pct && pct > 0 && ctx.equity && ctx.equity > 0) {
    return Math.max(0, ctx.equity * (pct / 100));
  }
  return bot.sizeQuote;
}

function orderQty(bot: Bot, ctx: BotEvalCtx, price: number): number {
  return qtyFromQuote(sizeQuoteOf(bot, ctx), price);
}

export const GRID_PRESETS: { id: string; label: string; sell: number; buy: number; levels: number; band: number }[] = [
  { id: "tight", label: "Serrée", sell: 0.8, buy: 0.5, levels: 10, band: 0.04 },
  { id: "std", label: "Standard", sell: 1.5, buy: 1, levels: 8, band: 0.08 },
  { id: "wide", label: "Large", sell: 3, buy: 2, levels: 6, band: 0.14 },
];

/** Extra sell % so a advertised take-profit is net of a round-trip taker fee. */
export function gridFeePadPct(feeRate?: number, net = true): number {
  if (!net || !(feeRate && feeRate > 0)) return 0;
  return feeRate * 2 * 100;
}

export function applyGridPreset(last: number, preset: (typeof GRID_PRESETS)[number], extra: Partial<BotParams> = {}): BotParams {
  const half = preset.band / 2;
  return {
    ...defaultParams("grid", last),
    gridSellPct: preset.sell,
    gridBuyPct: preset.buy,
    levels: preset.levels,
    lower: roundSmart(last * (1 - half)),
    upper: roundSmart(last * (1 + half)),
    ...extra,
  };
}

function nearPx(a: number, b: number): boolean {
  if (!(a > 0) || !(b > 0)) return false;
  return Math.abs(a - b) / Math.max(a, b) < 5e-4;
}

function evalGrid(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const pad = gridFeePadPct(ctx.feeRate, bot.params.gridNetFees !== false);
  const sellPct = (bot.params.gridSellPct ?? 1.5) + pad;
  const buyPct = bot.params.gridBuyPct ?? 1;
  const lotSl = bot.params.gridSlPct ?? 0;
  const maxLots = Math.max(1, Math.min(24, Math.round(bot.params.levels ?? 8)));
  const paramLo = bot.params.lower ?? 0;
  const paramHi = bot.params.upper ?? 0;
  const runtime: BotRuntime = { ...bot.runtime };
  if (!(sellPct > 0) || !(buyPct > 0)) {
    return { fills: [], runtime, note: "Pourcentages de grille invalides." };
  }
  if (paramLo > 0 && paramHi > 0 && !(paramHi > paramLo)) {
    return { fills: [], runtime, note: "Fourchette de grille invalide." };
  }

  let bandLo = runtime.gridLower ?? paramLo;
  let bandHi = runtime.gridUpper ?? paramHi;
  const last = ctx.ticker.last;
  const prev = runtime.lastPrice;
  const fills: BotFill[] = [];
  const pathLow = ctx.barLow ?? (prev != null && prev > 0 ? Math.min(prev, last) : last);
  const pathHigh = ctx.barHigh ?? (prev != null && prev > 0 ? Math.max(prev, last) : last);
  const fee = ctx.feeRate ?? 0;
  const fillCap = Math.max(1, Math.min(32, ctx.maxFills ?? 32));
  let quoteLeft = ctx.quoteBudget;
  let baseLeft = ctx.baseBudget;
  const buyPause = Boolean(runtime.buyPause);
  if ((runtime.buyCoolUntil ?? 0) > 0 && ctx.now >= runtime.buyCoolUntil!) {
    runtime.buyCoolUntil = undefined;
  }
  let cooling = (runtime.buyCoolUntil ?? 0) > ctx.now;
  const wantSeed = Boolean(runtime.gridSeedNow) || Boolean(bot.params.gridSeed && (prev == null || !(prev > 0)));
  const quoteSize = sizeQuoteOf(bot, ctx);
  const qtyAt = (price: number) => qtyFromQuote(quoteSize, price);
  let lots: GridLevelState[] = (runtime.gridOwned ?? []).map((g) => ({ ...g }));
  let recentered = false;
  const skipSell = new Set<number>();
  const skipBuy = new Set<number>();

  const inBand = (p: number) => {
    if (bandLo > 0 && p < bandLo * 0.999) return false;
    if (bandHi > 0 && p > bandHi * 1.001) return false;
    return true;
  };

  const addPending = (raw: number, kind: "step" | "rebuy"): number => {
    const p = roundSmart(raw);
    if (!(p > 0) || (kind !== "rebuy" && !inBand(p))) return -1;
    const near = lots.findIndex((g) => g.pending && nearPx(g.price, p));
    if (near >= 0) {
      if (kind !== "rebuy") return -1;
      lots[near] = { ...lots[near]!, price: p, anchor: true };
      return near;
    }
    if (lots.some((g) => g.qty > 0 && (nearPx(g.entry, p) || nearPx(g.price, p)))) return -1;
    const held = lots.filter((g) => g.qty > 0).length;
    const pendingN = lots.filter((g) => g.pending).length;
    if (kind === "step" && held >= maxLots) return -1;
    if (held + pendingN >= Math.max(maxLots * 2, maxLots + 1)) return -1;
    lots.push({ price: p, qty: 0, entry: 0, pending: true, anchor: kind === "rebuy" ? true : undefined });
    return lots.length - 1;
  };

  const armBait = () => {
    const bait = last * (1 - buyPct / 100);
    const floored = bandLo > 0 ? Math.max(bait, bandLo) : bait;
    const capped = bandHi > 0 ? Math.min(floored, bandHi) : floored;
    addPending(capped, "step");
  };

  const canBuy = (qty: number, price: number) => {
    if (fills.length >= fillCap) return false;
    if (buyPause || cooling) return false;
    if (quoteLeft == null) return true;
    const cost = qty * price * (1 + fee);
    return cost <= quoteLeft + 1e-9;
  };
  const canSell = (qty: number) => {
    if (fills.length >= fillCap) return false;
    if (baseLeft == null) return true;
    return qty <= baseLeft + 1e-12;
  };
  const spendBuy = (qty: number, price: number) => {
    if (quoteLeft != null) quoteLeft -= qty * price * (1 + fee);
    if (baseLeft != null) baseLeft += qty;
  };
  const spendSell = (qty: number) => {
    if (baseLeft != null) baseLeft -= qty;
  };

  const seedLot = () => {
    if (buyPause || lots.some((g) => g.qty > 0)) return false;
    if (!(last > 0) || !inBand(last)) return false;
    const fillPx = px(ctx, "buy");
    const qty = qtyAt(fillPx);
    if (!(qty > 0) || !canBuy(qty, fillPx)) return false;
    fills.push({
      side: "buy",
      qty,
      price: fillPx,
      note: `Grille lot initial @ ${roundSmart(fillPx)}`,
    });
    spendBuy(qty, fillPx);
    lots.push({ price: fillPx, qty, entry: fillPx, pending: false });
    skipSell.add(lots.length - 1);
    addPending(fillPx * (1 - buyPct / 100), "step");
    return true;
  };
  const trySeed = () => {
    if (!wantSeed) {
      runtime.gridSeedNow = false;
      return false;
    }
    const ok = seedLot();
    runtime.gridSeedNow = !ok;
    return ok;
  };

  if (bot.params.gridFollow && bandLo > 0 && bandHi > bandLo && last > 0) {
    const heldN = lots.filter((g) => g.qty > 0).length;
    if (heldN === 0 && (last > bandHi || last < bandLo)) {
      const width = bandHi - bandLo;
      bandLo = roundSmart(Math.max(last - width / 2, last * 0.5));
      bandHi = roundSmart(last + width / 2);
      runtime.gridLower = bandLo;
      runtime.gridUpper = bandHi;
      lots = lots.filter((g) => g.qty > 0 || (g.pending && (g.anchor || inBand(g.price))));
      recentered = true;
    }
  }

  const hadBook = lots.some((g) => g.qty > 0 || g.pending);
  const cold = prev == null || !(prev > 0);
  if (cold) {
    trySeed();
    if (!lots.some((g) => g.qty > 0 || g.pending) && !buyPause && !cooling) armBait();
    if (!lots.some((g) => g.pending)) {
      runtime.lastPrice = last;
      runtime.gridOwned = lots.filter((g) => g.qty > 0 || g.pending);
      return {
        fills,
        runtime,
        note: fills.length
          ? fills.map((f) => f.note).join(" · ")
          : recentered
            ? "Fourchette recentrée — grille armée."
            : "Grille armée — en attente d’un croisement.",
      };
    }
  } else {
    trySeed();
  }

  let guard = 0;
  let progressed = true;
  while (progressed && guard++ < 32 && fills.length < fillCap) {
    progressed = false;

    if (lotSl > 0) {
      for (let i = 0; i < lots.length; i++) {
        if (fills.length >= fillCap) break;
        const g = lots[i]!;
        if (skipSell.has(i) || !(g.qty > 0) || !(g.entry > 0)) continue;
        const stopAt = g.entry * (1 - lotSl / 100);
        if (!(pathLow <= stopAt)) continue;
        if (!canSell(g.qty)) continue;
        const fillPx = ctx.barLow != null ? stopAt : px(ctx, "sell");
        fills.push({
          side: "sell",
          qty: g.qty,
          price: fillPx,
          note: `Stop lot −${lotSl}% (achat ${roundSmart(g.entry)})`,
          entry: g.entry,
        });
        spendSell(g.qty);
        lots[i] = { price: g.price, qty: 0, entry: 0, pending: false };
        skipSell.add(i);
        progressed = true;
        const coolMin = bot.params.gridSlCooldownMin ?? 0;
        if (coolMin > 0) {
          runtime.buyCoolUntil = Math.max(runtime.buyCoolUntil ?? 0, ctx.now + coolMin * 60_000);
          cooling = true;
        }
      }
    }

    for (let i = 0; i < lots.length; i++) {
      if (fills.length >= fillCap) break;
      const g = lots[i]!;
      if (skipSell.has(i) || !(g.qty > 0) || !(g.entry > 0)) continue;
      const sellAt = g.entry * (1 + sellPct / 100);
      if (!(pathHigh >= sellAt)) continue;
      if (!canSell(g.qty)) continue;
      const fillPx = ctx.barHigh != null ? sellAt : px(ctx, "sell");
      fills.push({
        side: "sell",
        qty: g.qty,
        price: fillPx,
        note: `Grille vente +${Number(sellPct.toFixed(2))}% (achat ${roundSmart(g.entry)})`,
        entry: g.entry,
      });
      spendSell(g.qty);
      const rebuy = g.entry;
      lots[i] = { price: g.price, qty: 0, entry: 0, pending: false };
      skipSell.add(i);
      progressed = true;
      const idx = addPending(rebuy, "rebuy");
      if (idx >= 0) skipBuy.add(idx);
    }

    if (buyPause || cooling) continue;

    const pendingIdx = lots
      .map((g, i) => ({ g, i }))
      .filter(({ g, i }) => g.pending && !(g.qty > 0) && !skipBuy.has(i))
      .sort((a, b) => b.g.price - a.g.price);

    for (const { i } of pendingIdx) {
      if (fills.length >= fillCap) break;
      const g = lots[i];
      if (!g?.pending || skipBuy.has(i)) continue;
      const trigger = g.price;
      if (!(pathLow <= trigger)) continue;
      const fillPx = ctx.barLow != null ? trigger : px(ctx, "buy");
      const qty = qtyAt(fillPx);
      if (!(qty > 0) || !canBuy(qty, fillPx)) continue;
      fills.push({
        side: "buy",
        qty,
        price: fillPx,
        note: `Grille achat @ ${roundSmart(trigger)}`,
      });
      spendBuy(qty, fillPx);
      lots[i] = { price: trigger, qty, entry: fillPx, pending: false };
      skipSell.add(i);
      progressed = true;
      addPending(fillPx * (1 - buyPct / 100), "step");
    }
  }

  let cleaned = lots.filter((g) => g.qty > 0 || g.pending);
  if (cleaned.length === 0 && !buyPause && !cooling) {
    lots.length = 0;
    armBait();
    cleaned = lots.filter((g) => g.qty > 0 || g.pending);
  }

  runtime.lastPrice = last;
  runtime.gridOwned = cleaned;
  runtime.gridLower = bandLo || undefined;
  runtime.gridUpper = bandHi || undefined;
  const held = cleaned.filter((g) => g.qty > 0);
  const pending = cleaned.filter((g) => g.pending);
  const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
  const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
  const wait =
    (buyPause ? "Achats en pause · " : "") +
    (cooling ? "Pause achats après stop lot · " : "") +
    (recentered ? "Fourchette recentrée · " : "") +
    `En attente · ${held.length} lot${held.length > 1 ? "s" : ""} · ${pending.length} ordre${pending.length > 1 ? "s" : ""} d’achat` +
    (nextBuy ? ` · achat ${roundSmart(nextBuy)}` : "") +
    (nextSell ? ` · vente ${roundSmart(nextSell)}` : "");
  return {
    fills,
    runtime,
    note: fills.length
      ? fills.map((f) => f.note).join(" · ")
      : cold && !hadBook
        ? recentered
          ? "Fourchette recentrée — grille armée."
          : "Grille armée — en attente d’un croisement."
        : wait,
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

function evalMfi(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 20;
  const ob = bot.params.overbought ?? 80;
  if (!candles || candles.length < period + 4) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour le MFI." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `MFI ${fmt(runtime.lastRsi)} · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = mfi(candles, period);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = r ?? undefined;
  if (r == null || prev == null) return { fills: [], runtime, note: "MFI en chauffe." };
  const fills: BotFill[] = [];
  if (!runtime.inPosition && prev >= os && r < os) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `MFI ${r.toFixed(1)} < ${os}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && prev <= ob && r > ob) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `MFI ${r.toFixed(1)} > ${ob}` });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `MFI ${r.toFixed(1)} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalEngulf(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  if (!candles || candles.length < 6) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour l’engloutissement." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: runtime.inPosition ? "Long engulf" : "En attente d’un engulf" };
  }
  const cur = lastCandle;
  const prev = candles[candles.length - 2]!;
  runtime.lastCandleTime = lastCandle.time;
  const prevBear = prev.close < prev.open;
  const prevBull = prev.close > prev.open;
  const bullEngulf = prevBear && cur.close > cur.open && cur.close >= prev.open && cur.open <= prev.close;
  const bearEngulf = prevBull && cur.close < cur.open && cur.close <= prev.open && cur.open >= prev.close;
  const fills: BotFill[] = [];
  if (!runtime.inPosition && bullEngulf) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "Engloutissement haussier" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && bearEngulf) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "Engloutissement baissier" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `PA ${bullEngulf ? "bull" : bearEngulf ? "bear" : "neutre"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalObv(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const candles = ctx.candles;
  const period = Math.max(5, bot.params.fast ?? 20);
  if (!candles || candles.length < period + 6) {
    return { fills: [], runtime, note: "Chandeliers insuffisants pour l’OBV." };
  }
  const lastCandle = candles[candles.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return { fills: [], runtime, note: `OBV · ${runtime.inPosition ? "long" : "flat"}` };
  }
  const series = obv(candles);
  const mean = ema(series, period);
  const o = series[series.length - 1]!;
  const e = mean[mean.length - 1];
  const po = series[series.length - 2]!;
  const pe = mean[mean.length - 2];
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastEmaFast = e ?? undefined;
  if (e == null || pe == null) return { fills: [], runtime, note: "OBV en chauffe." };
  const fills: BotFill[] = [];
  const crossUp = po <= pe && o > e;
  const crossDown = po >= pe && o < e;
  if (!runtime.inPosition && crossUp) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: "OBV croise au-dessus de l’EMA" });
      markLong(runtime, qty, fillPx);
    }
  } else if (runtime.inPosition && runtime.positionQty && crossDown) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: "OBV croise sous l’EMA" });
    markFlat(runtime);
  }
  return {
    fills,
    runtime,
    note: fills.length ? fills[0]!.note : `OBV ${o >= e ? "haussier" : "baissier"} · ${runtime.inPosition ? "long" : "flat"}`,
  };
}

function evalDiv(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

function evalConfirm(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
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

/** Intervals used by an mtf bot: primary first, then extras (deduped, max 3). */
export function mtfIntervalsOf(bot: Pick<Bot, "interval" | "params">): number[] {
  const primary = Math.max(1, Math.round(bot.interval || 15));
  const extra = (bot.params.mtfIntervals ?? [60, 240])
    .map((n) => Math.round(n))
    .filter((n) => n > 0 && n !== primary);
  return [primary, ...[...new Set(extra)].sort((a, b) => a - b)].slice(0, 3);
}

/** Aggregate lower-TF candles into a higher TF (backtest fallback when multi OHLC missing). */
export function resampleCandles(candles: Candle[], fromMin: number, toMin: number): Candle[] {
  if (!(fromMin > 0) || !(toMin > 0) || toMin <= fromMin || candles.length === 0) return candles.slice();
  const ratio = Math.max(2, Math.round(toMin / fromMin));
  const out: Candle[] = [];
  for (let i = 0; i < candles.length; i += ratio) {
    const chunk = candles.slice(i, i + ratio);
    if (!chunk.length) continue;
    const first = chunk[0]!;
    const last = chunk[chunk.length - 1]!;
    let high = first.high;
    let low = first.low;
    let volume = 0;
    for (const c of chunk) {
      high = Math.max(high, c.high);
      low = Math.min(low, c.low);
      volume += c.volume;
    }
    out.push({ time: first.time, open: first.open, high, low, close: last.close, volume });
  }
  return out;
}

type RsiCross = "BUY" | "SELL" | "HOLD";

function rsiCrossOnCandles(
  candles: Candle[] | undefined,
  period: number,
  os: number,
  ob: number,
): { action: RsiCross; rsi: number | null } {
  if (!candles || candles.length < period + 3) return { action: "HOLD", rsi: null };
  const closes = candles.map((c) => c.close);
  const series = rsi(closes, period);
  const r = series[series.length - 1];
  const prev = series[series.length - 2];
  if (r == null || prev == null) return { action: "HOLD", rsi: r ?? null };
  if (prev >= os && r < os) return { action: "BUY", rsi: r };
  if (prev <= ob && r > ob) return { action: "SELL", rsi: r };
  return { action: "HOLD", rsi: r };
}

function resolveMtfVote(
  votes: { BUY: number; SELL: number; HOLD: number },
  mode: "majority" | "higherAgree",
  primaryAction: RsiCross,
  highestAction: RsiCross,
): RsiCross {
  if (mode === "higherAgree") {
    if (primaryAction === "BUY" && highestAction === "BUY") return "BUY";
    if (primaryAction === "SELL" && highestAction === "SELL") return "SELL";
    return "HOLD";
  }
  if (votes.BUY > votes.SELL && votes.BUY > votes.HOLD) return "BUY";
  if (votes.SELL > votes.BUY && votes.SELL > votes.HOLD) return "SELL";
  return "HOLD";
}

function evalMtf(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const period = Math.max(2, bot.params.rsiPeriod ?? 14);
  const os = bot.params.oversold ?? 30;
  const ob = bot.params.overbought ?? 70;
  const mode = bot.params.mtfMode === "higherAgree" ? "higherAgree" : "majority";
  const intervals = mtfIntervalsOf(bot);
  const primary = intervals[0]!;

  const seriesByTf: { tf: number; candles: Candle[] }[] = [];
  for (const tf of intervals) {
    let series = ctx.multiCandles?.[tf];
    if ((!series || series.length < period + 3) && ctx.candles && tf === primary) series = ctx.candles;
    if ((!series || series.length < period + 3) && ctx.candles && tf !== primary) {
      series = resampleCandles(ctx.candles, primary, tf);
    }
    if (ctx.closedOnly && series) series = dropFormingCandle(series, tf, ctx.now) ?? series;
    if (series && series.length >= period + 3) seriesByTf.push({ tf, candles: series });
  }

  if (seriesByTf.length < 2) {
    return { fills: [], runtime, note: "Multi-TF : chandeliers insuffisants sur ≥2 intervalles." };
  }

  const primarySeries = seriesByTf.find((s) => s.tf === primary)?.candles ?? seriesByTf[0]!.candles;
  const lastCandle = primarySeries[primarySeries.length - 1]!;
  if (runtime.lastCandleTime === lastCandle.time) {
    return {
      fills: [],
      runtime,
      note: runtime.inPosition ? `Long · MTF ${fmt(runtime.lastRsi)}` : `Hors marché · MTF ${fmt(runtime.lastRsi)}`,
    };
  }

  const votes = { BUY: 0, SELL: 0, HOLD: 0 };
  const details: string[] = [];
  let highestTf = -1;
  let highestAction: RsiCross = "HOLD";
  let primaryAction: RsiCross = "HOLD";
  let primaryRsi: number | null = null;
  for (const { tf, candles } of seriesByTf) {
    const { action, rsi: r } = rsiCrossOnCandles(candles, period, os, ob);
    votes[action] += 1;
    details.push(`${tf}m:${action === "HOLD" ? "·" : action[0]}${r != null ? r.toFixed(0) : "?"}`);
    if (tf === primary) {
      primaryAction = action;
      primaryRsi = r;
    }
    if (tf >= highestTf) {
      highestTf = tf;
      highestAction = action;
    }
  }

  const action = resolveMtfVote(votes, mode, primaryAction, highestAction);
  runtime.lastCandleTime = lastCandle.time;
  runtime.lastRsi = primaryRsi ?? undefined;
  runtime.lastClose = lastCandle.close;

  const fills: BotFill[] = [];
  if (action === "BUY" && !runtime.inPosition) {
    const fillPx = px(ctx, "buy");
    const qty = orderQty(bot, ctx, fillPx);
    if (qty > 0) {
      fills.push({ side: "buy", qty, price: fillPx, note: `MTF BUY · ${details.join(" ")}` });
      markLong(runtime, qty, fillPx);
    }
  } else if (action === "SELL" && runtime.inPosition && runtime.positionQty) {
    const fillPx = px(ctx, "sell");
    fills.push({ side: "sell", qty: runtime.positionQty, price: fillPx, note: `MTF SELL · ${details.join(" ")}` });
    markFlat(runtime);
  }

  return {
    fills,
    runtime,
    note: fills.length
      ? fills[0]!.note
      : `MTF ${mode} · ${details.join(" ")} · ${runtime.inPosition ? "long" : "flat"}`,
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

function syncGridPosition(runtime: BotRuntime, fills: BotFill[]) {
  const held = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
  if (held.length) {
    const qty = held.reduce((s, g) => s + g.qty, 0);
    const avg = qty > 0 ? held.reduce((s, g) => s + g.qty * g.entry, 0) / qty : 0;
    runtime.inPosition = true;
    runtime.positionQty = qty;
    runtime.positionAvg = avg;
  } else if (!fills.some((f) => f.side === "buy")) {
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
}

function regimeNote(bot: Bot, ctx: BotEvalCtx): string | null {
  if (bot.kind === "grid" || bot.kind === "dca") return null;
  const ceil = bot.params.adxCeil ?? 0;
  const floor = bot.params.adxFloor ?? 0;
  if (!(ceil > 0) && !(floor > 0)) return null;
  const candles = ctx.candles;
  const period = Math.max(5, Math.round(bot.params.adxPeriod ?? 14));
  if (!candles || candles.length < period * 2 + 2) return null;
  const v = adx(candles, period).adx[candles.length - 1];
  if (v == null || !Number.isFinite(v)) return null;
  if (ceil > 0 && v > ceil) return `ADX ${v.toFixed(0)} — pas d’achat en tendance forte`;
  if (floor > 0 && v < floor) return `ADX ${v.toFixed(0)} — range, pas de suivi`;
  return null;
}

function crashNote(bot: Bot, ctx: BotEvalCtx): string | null {
  if (!MEAN_REVERSION.has(bot.kind)) return null;
  const crash = bot.params.crashPct ?? 0;
  if (!(crash > 0)) return null;
  const candles = ctx.candles;
  if (!candles || candles.length < 2) return null;
  const last = candles[candles.length - 1]!;
  const prev = candles[candles.length - 2]!.close;
  if (!(prev > 0)) return null;
  const drop = ((prev - last.close) / prev) * 100;
  if (drop >= crash) return `Bougie −${drop.toFixed(1)} % — pas d’achat dans le krach`;
  return null;
}

function buyBlockReason(bot: Bot, ctx: BotEvalCtx, runtime: BotRuntime): string | null {
  const last = ctx.ticker.last;
  const now = ctx.now;
  const trendN = bot.params.trendEma ?? 0;
  if (trendN > 0 && ctx.candles && ctx.candles.length >= trendN + 2) {
    const series = ema(
      ctx.candles.map((c) => c.close),
      Math.round(trendN),
    );
    const e = series[series.length - 1];
    if (e != null && last < e) return `Filtre EMA${Math.round(trendN)} baissier`;
  }
  const regime = regimeNote(bot, ctx) ?? crashNote(bot, ctx);
  if (regime) return regime;
  const spreadPct =
    ctx.ticker.ask > 0 && ctx.ticker.bid > 0 && last > 0
      ? ((ctx.ticker.ask - ctx.ticker.bid) / last) * 100
      : 0;
  const maxSpread = bot.params.maxSpreadPct ?? 0;
  if (maxSpread > 0 && spreadPct > maxSpread) return `Spread ${spreadPct.toFixed(2)} % trop large`;
  const cooldownMs = (bot.params.cooldownSec ?? 0) * 1000;
  if (cooldownMs > 0 && bot.lastActionAt && now - bot.lastActionAt < cooldownMs) {
    return `Cooldown ${Math.ceil((cooldownMs - (now - bot.lastActionAt)) / 1000)}s`;
  }
  const sessionStart = bot.params.sessionStart;
  const sessionEnd = bot.params.sessionEnd;
  if (
    sessionStart != null &&
    sessionEnd != null &&
    (sessionStart !== 0 || sessionEnd !== 0) &&
    sessionStart !== sessionEnd &&
    !inUtcSession(now, sessionStart, sessionEnd)
  ) {
    return `Hors session ${sessionStart}h–${sessionEnd}h UTC`;
  }
  const cap = bot.params.maxDailyLoss ?? 0;
  if (cap > 0 && (runtime.dayPnl ?? 0) <= -cap) return `Stop journalier (${cap} EUR)`;
  const maxTrades = bot.params.maxTradesDay ?? 0;
  if (maxTrades > 0 && (runtime.dayTrades ?? 0) >= maxTrades) return `Quota ${maxTrades} trades / jour`;
  const maxLosses = bot.params.maxConsecutiveLoss ?? 0;
  if (maxLosses > 0 && (runtime.consecutiveLosses ?? 0) >= maxLosses) {
    return `Pertes consécutives (${maxLosses})`;
  }
  return null;
}

function applyRisk(
  bot: Bot,
  ctx: BotEvalCtx,
  raw: { fills: BotFill[]; runtime: BotRuntime; note: string },
): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const prev = bot.runtime;
  let runtime = { ...raw.runtime };
  let fills = [...raw.fills];
  let note = raw.note;
  const now = ctx.now;
  const last = ctx.ticker.last;
  const low = ctx.barLow ?? last;
  const high = ctx.barHigh ?? last;
  const day = tradingDay(now);
  if (runtime.dayStamp !== day) {
    runtime.dayStamp = day;
    runtime.dayPnl = 0;
    runtime.dayTrades = 0;
  }

  if (bot.kind === "grid") {
    syncGridPosition(runtime, fills);
  }

  const blockBuys = buyBlockReason(bot, ctx, runtime);
  let gridReplayed = false;
  if (blockBuys && fills.some((f) => f.side === "buy") && bot.kind === "grid") {
    const replay = evaluateRaw({ ...bot, runtime: { ...bot.runtime, buyPause: true } }, ctx);
    fills = [...replay.fills];
    runtime = { ...replay.runtime, buyPause: bot.runtime.buyPause };
    syncGridPosition(runtime, fills);
    gridReplayed = true;
    note = fills.length ? replay.note : blockBuys;
  }

  const hadBuy = !gridReplayed && fills.some((f) => f.side === "buy");

  const trendN = bot.params.trendEma ?? 0;
  if (trendN > 0 && ctx.candles && ctx.candles.length >= trendN + 2) {
    const series = ema(
      ctx.candles.map((c) => c.close),
      Math.round(trendN),
    );
    const e = series[series.length - 1];
    if (e != null && last < e) {
      fills = fills.filter((f) => f.side === "sell");
      if (fills.length === 0) note = `Filtre EMA${Math.round(trendN)} baissier`;
    }
  }

  const regime = regimeNote(bot, ctx) ?? crashNote(bot, ctx);
  if (regime) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) note = regime;
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

  const sessionStart = bot.params.sessionStart;
  const sessionEnd = bot.params.sessionEnd;
  if (
    sessionStart != null &&
    sessionEnd != null &&
    (sessionStart !== 0 || sessionEnd !== 0) &&
    sessionStart !== sessionEnd &&
    !inUtcSession(now, sessionStart, sessionEnd)
  ) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) note = `Hors session ${sessionStart}h–${sessionEnd}h UTC`;
  }

  const cap = bot.params.maxDailyLoss ?? 0;
  if (cap > 0 && (runtime.dayPnl ?? 0) <= -cap) {
    fills = fills.filter((f) => f.side === "sell");
    if (fills.length === 0) {
      note = `Stop journalier (${cap} EUR)`;
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

  const keptBuy = fills.some((f) => f.side === "buy");
  if (hadBuy && !keptBuy) {
    runtime.inPosition = prev.inPosition;
    runtime.positionQty = prev.positionQty;
    runtime.positionAvg = prev.positionAvg;
    runtime.gridOwned = prev.gridOwned;
    runtime.gridLower = prev.gridLower;
    runtime.gridUpper = prev.gridUpper;
    runtime.buyPause = prev.buyPause;
    runtime.peakPrice = prev.peakPrice;
    runtime.nextDcaAt = prev.nextDcaAt;
    runtime.scaledOut = prev.scaledOut;
    runtime.entryAt = prev.entryAt;
    runtime.entryBar = prev.entryBar;
    runtime.buyCoolUntil = prev.buyCoolUntil;
    runtime.gridSeedNow = prev.gridSeedNow;
    if (fills.length === 0) {
      runtime.lastPrice = prev.lastPrice;
      runtime.lastCandleTime = prev.lastCandleTime;
    }
  }

  if (runtime.inPosition && runtime.positionQty && runtime.positionAvg) {
    runtime.peakPrice = Math.max(runtime.peakPrice ?? runtime.positionAvg, high);
  } else if (!runtime.inPosition) {
    runtime.peakPrice = undefined;
  }

  if (runtime.inPosition && runtime.positionQty && runtime.positionAvg && !fills.some((f) => f.side === "sell")) {
    const avg = runtime.positionAvg;
    const pctLow = ((low - avg) / avg) * 100;
    const pctHigh = ((high - avg) / avg) * 100;
    const sl = bot.params.slPct;
    const rawTp = bot.params.tpPct ?? 0;
    const feePct = ((ctx.feeRate ?? 0) * 2 + (rawTp > 0 ? 0.001 : 0)) * 100;
    const tp = rawTp > 0 ? Math.max(rawTp, feePct) : 0;
    const trail = bot.params.trailingPct;
    const be = bot.params.beAfterPct ?? 0;
    const slAtr = bot.params.slAtr ?? 0;
    const peak = runtime.peakPrice ?? avg;
    const holdMin = bot.params.maxHoldMin ?? 0;
    const partial = bot.params.partialTp ?? 0;
    const justEntered = Boolean(keptBuy && !prev.inPosition);
    let atrStop = false;
    if (slAtr > 0 && ctx.candles && ctx.candles.length > 16) {
      const a = atr(ctx.candles, 14);
      const av = a[a.length - 1];
      if (av != null && low <= avg - slAtr * av) atrStop = true;
    }
    const sellPx = (limit: number) => (ctx.barLow != null || ctx.barHigh != null ? limit : px(ctx, "sell"));
    const closeAll = (price: number, why: string) => {
      fills.push({ side: "sell", qty: runtime.positionQty!, price, note: why });
      flattenGrid(runtime);
      markFlat(runtime);
      note = why;
    };

    const perLot = bot.kind === "grid" && (bot.params.gridSlPct ?? 0) > 0;
    const peakGain = ((peak - avg) / avg) * 100;
    const lockPx = avg * (1 + (ctx.feeRate ?? 0) * 2);
    if (sl && sl > 0 && pctLow <= -sl && !perLot) {
      closeAll(sellPx(avg * (1 - sl / 100)), `Stop-loss ${pctLow.toFixed(2)} %`);
    } else if (!justEntered && be > 0 && peakGain >= be && low <= lockPx && bot.kind !== "grid") {
      closeAll(sellPx(lockPx), `Gain verrouillé après +${be} %`);
    } else if (atrStop && bot.kind !== "grid") {
      const a = atr(ctx.candles!, 14);
      const av = a[a.length - 1] ?? 0;
      closeAll(sellPx(avg - slAtr * av), `Stop ATR ×${slAtr}`);
    } else if (tp && tp > 0 && pctHigh >= tp && bot.kind !== "grid") {
      const tpPx = sellPx(avg * (1 + tp / 100));
      if (partial > 0 && partial < 100 && !runtime.scaledOut) {
        const qty = runtime.positionQty * (partial / 100);
        if (qty > 0) {
          fills.push({
            side: "sell",
            qty,
            price: tpPx,
            note: `TP partiel ${partial.toFixed(0)} %`,
          });
          runtime.positionQty = runtime.positionQty - qty;
          runtime.scaledOut = true;
          note = fills[fills.length - 1]!.note;
        }
      } else {
        closeAll(tpPx, `Take-profit ${pctHigh.toFixed(2)} %`);
      }
    } else if (
      trail &&
      trail > 0 &&
      !justEntered &&
      bot.kind !== "grid" &&
      peakGain >= Math.max(trail, ((ctx.feeRate ?? 0) * 2 + 0.001) * 100) &&
      low <= peak * (1 - trail / 100)
    ) {
      closeAll(sellPx(peak * (1 - trail / 100)), `Trailing ${trail} % depuis ${roundSmart(peak)}`);
    } else if (holdMin > 0 && bot.kind !== "grid" && runtime.entryAt && now - runtime.entryAt >= holdMin * 60_000) {
      closeAll(px(ctx, "sell"), `Sortie temps ${holdMin} min`);
    }
  }

  if (keptBuy && !prev.inPosition) {
    runtime.entryAt = now;
    runtime.entryBar = ctx.candles?.[ctx.candles.length - 1]?.time;
    runtime.scaledOut = false;
  }
  if (!runtime.inPosition) {
    runtime.entryAt = undefined;
    runtime.entryBar = undefined;
    runtime.scaledOut = false;
  }

  return { fills, runtime, note };
}

function inUtcSession(now: number, start: number, end: number): boolean {
  const h = new Date(now).getUTCHours() + new Date(now).getUTCMinutes() / 60;
  if (start < end) return h >= start && h < end;
  return h >= start || h < end;
}

function flattenGrid(runtime: BotRuntime) {
  runtime.gridOwned = [];
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
  openQty: number;
  calmar: number;
  sharpe: number;
  sortino: number;
  avgHoldMin: number;
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
  const need = backtestWarmup(kind, params);
  const warmup = Math.max(need, Math.min(opts.warmup ?? need, candles.length - 8));
  if (candles.length < warmup + 8) return null;
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
      barHigh: c.high,
      barLow: c.low,
      quoteBudget: paper.cash,
      baseBudget: paper.holdings[base]?.qty ?? 0,
      feeRate,
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
        costBasis: fill.entry,
      });
      if (res.ok) {
        paper = res.paper;
        bot = { ...bot, lastActionAt: c.time * 1000 };
        const compound = params.compoundPct ?? 0;
        if (compound > 0 && fill.side === "sell" && res.trade.pnl > 0) {
          bot = { ...bot, sizeQuote: Math.max(5, bot.sizeQuote + res.trade.pnl * (compound / 100)) };
        }
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
  const { sharpe, sortino } = riskRatios(curve, candles[warmup]!.time, candles[candles.length - 1]!.time);
  const chrono = [...paper.trades].reverse();
  const holds: number[] = [];
  let opened: number | null = null;
  for (const t of chrono) {
    if (t.side === "buy" && opened == null) opened = t.time;
    if (t.side === "sell" && opened != null) {
      holds.push((t.time - opened) / 60_000);
      opened = null;
    }
  }

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
    openQty: Object.values(paper.holdings).reduce((s, h) => s + h.qty, 0),
    calmar: maxDd > 0 ? (eq - startEquity) / maxDd : eq > startEquity ? 99 : 0,
    sharpe,
    sortino,
    avgHoldMin: holds.length ? holds.reduce((s, n) => s + n, 0) / holds.length : 0,
  };
}

function fmt(n: number | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(1);
}

function riskRatios(curve: { t: number; v: number }[], from: number, to: number): { sharpe: number; sortino: number } {
  if (curve.length < 4) return { sharpe: 0, sortino: 0 };
  const rets: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1]!.v;
    if (prev > 0) rets.push(curve[i]!.v / prev - 1);
  }
  if (rets.length < 3) return { sharpe: 0, sortino: 0 };
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
  const std = Math.sqrt(variance);
  const down = rets.filter((r) => r < 0);
  const downVar = down.length ? down.reduce((s, r) => s + r * r, 0) / down.length : 0;
  const downStd = Math.sqrt(downVar);
  const years = Math.max(1 / 365, (to - from) / (365.25 * 86_400));
  const perYear = rets.length / years;
  const scale = Math.sqrt(Math.max(1, perYear));
  return {
    sharpe: std > 0 ? (mean / std) * scale : 0,
    sortino: downStd > 0 ? (mean / downStd) * scale : mean > 0 ? 99 : 0,
  };
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

export function backtestWarmup(kind: BotKind, params: BotParams): number {
  const n = (v: number | undefined, d: number) => Math.max(2, Math.round(v ?? d));
  switch (kind) {
    case "sma":
      return n(params.slow, 200) + 8;
    case "ema":
    case "scalp":
      return n(params.slow, 21) + 8;
    case "ichimoku":
      return n(params.kijun, 26) * 2 + 8;
    case "macd":
      return n(params.macdSlow, 26) + n(params.macdSignal, 9) + 8;
    case "adx":
      return n(params.adxPeriod, 14) * 3 + 8;
    case "supertrend":
      return n(params.atrPeriod, 10) + 16;
    case "breakout":
      return n(params.donchian, 20) + 6;
    case "obv":
      return n(params.fast, 20) + 8;
    case "div":
      return n(params.rsiPeriod, 14) + 20;
    case "confirm":
      return Math.max(n(params.slow, 21), n(params.macdSlow, 26) + n(params.macdSignal, 9), n(params.rsiPeriod, 14)) + 8;
    case "mtf":
      return n(params.rsiPeriod, 14) + 8;
    default:
      return 48;
  }
}

export function botWinRate(stats: BotStats): number {
  const n = stats.closes > 0 ? stats.closes : 0;
  if (n <= 0) return 0;
  return (stats.wins / n) * 100;
}

export function previewSignal(
  kind: BotKind,
  params: BotParams,
  sizeQuote: number,
  ctx: BotEvalCtx,
  pair = "XBTEUR",
): { note: string; side: "buy" | "sell" | "hold" } {
  const bot: Bot = {
    id: "pv",
    name: "pv",
    kind,
    venue: "paper",
    status: "running",
    pair,
    interval: 60,
    sizeQuote,
    params,
    createdAt: 0,
    lastNote: "",
    stats: { ...EMPTY_STATS },
    runtime: {},
  };
  const { fills, note } = evaluateBot(bot, ctx);
  const side = fills.some((f) => f.side === "buy") ? "buy" : fills.some((f) => f.side === "sell") ? "sell" : "hold";
  return { note, side };
}

export type OptRow = { params: BotParams; label: string; result: BacktestResult };

export function paramVariants(kind: BotKind, base: BotParams): { params: BotParams; label: string }[] {
  const rows: { params: BotParams; label: string }[] = [{ params: base, label: "Actuel" }];
  const add = (label: string, p: Partial<BotParams>) => rows.push({ params: { ...base, ...p }, label });
  if (kind === "rsi" || kind === "mfi" || kind === "stoch" || kind === "div" || kind === "confirm" || kind === "mtf") {
    for (const os of [20, 25, 30, 35]) {
      for (const ob of [65, 70, 75, 80]) add(`os ${os} / ob ${ob}`, { oversold: os, overbought: ob });
    }
    if (kind === "confirm") {
      add("EMA 8/21", { fast: 8, slow: 21 });
      add("EMA 12/26", { fast: 12, slow: 26 });
    }
    if (kind === "mtf") {
      add("majority 15/60/240", { mtfIntervals: [60, 240], mtfMode: "majority" });
      add("higherAgree 15/60/240", { mtfIntervals: [60, 240], mtfMode: "higherAgree" });
      add("majority 5/15/60", { mtfIntervals: [15, 60], mtfMode: "majority" });
    }
  } else if (kind === "williams") {
    for (const os of [-90, -80, -70]) {
      for (const ob of [-30, -20, -10]) add(`os ${os} / ob ${ob}`, { oversold: os, overbought: ob });
    }
  } else if (kind === "cci") {
    for (const os of [-150, -100, -80]) {
      for (const ob of [80, 100, 150]) add(`os ${os} / ob ${ob}`, { oversold: os, overbought: ob });
    }
  } else if (kind === "ema" || kind === "scalp" || kind === "sma" || kind === "obv") {
    for (const fast of [5, 8, 9, 12, 21]) {
      for (const slow of [13, 21, 50, 200]) {
        if (kind === "obv") {
          add(`EMA ${fast}`, { fast });
          break;
        }
        if (slow > fast) add(`${fast}/${slow}`, { fast, slow });
      }
    }
  } else if (kind === "macd") {
    add("8/17/9", { macdFast: 8, macdSlow: 17, macdSignal: 9 });
    add("12/26/9", { macdFast: 12, macdSlow: 26, macdSignal: 9 });
    add("5/35/5", { macdFast: 5, macdSlow: 35, macdSignal: 5 });
  } else if (kind === "bollinger") {
    for (const p of [14, 20, 30]) for (const m of [1.5, 2, 2.5]) add(`n${p} ×${m}`, { bbPeriod: p, bbMult: m });
  } else if (kind === "breakout") {
    for (const d of [10, 20, 55]) add(`Donchian ${d}`, { donchian: d });
  } else if (kind === "supertrend") {
    for (const a of [7, 10, 14]) for (const m of [2, 3]) add(`ATR${a} ×${m}`, { atrPeriod: a, atrMult: m });
  } else if (kind === "meanrev") {
    for (const z of [1.2, 1.6, 2, 2.5]) add(`|Z| ${z}`, { zEntry: z });
  } else if (kind === "grid") {
    const lo = base.lower ?? 100;
    const hi = base.upper ?? 110;
    const mid = (lo + hi) / 2;
    const tightLo = mid * 0.99;
    const tightHi = mid * 1.01;
    if (tightLo < tightHi) add("serrée 2%", { lower: tightLo, upper: tightHi, levels: 6 });
    add("large 8%", { lower: mid * 0.96, upper: mid * 1.04, levels: 8 });
    add("12 lots", { lower: lo, upper: hi, levels: 12 });
    add("revente 0.8% / rachat 0.5%", { gridSellPct: 0.8, gridBuyPct: 0.5 });
    add("revente 1.5% / rachat 1%", { gridSellPct: 1.5, gridBuyPct: 1 });
    add("revente 2.5% / rachat 1.5%", { gridSellPct: 2.5, gridBuyPct: 1.5 });
    add("stop lot 3%", { gridSlPct: 3 });
    add("suivi de fourchette", { gridFollow: true });
    add("premier lot marché", { gridSeed: true });
    add("revente brute", { gridNetFees: false });
    add("pause 30 min après stop", { gridSlPct: 3, gridSlCooldownMin: 30 });
  }
  return rows.slice(0, 18);
}

export function optimizeBot(
  kind: BotKind,
  base: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair: string,
  opts: BacktestOpts = {},
): OptRow[] {
  const scored: OptRow[] = [];
  for (const row of paramVariants(kind, base)) {
    const result = backtestBot(kind, row.params, sizeQuote, candles, feeRate, pair, opts);
    if (!result || result.sells < 1) continue;
    scored.push({ params: row.params, label: row.label, result });
  }
  scored.sort((a, b) => {
    const sa = a.result.calmar !== 99 ? a.result.calmar : a.result.pnlPct;
    const sb = b.result.calmar !== 99 ? b.result.calmar : b.result.pnlPct;
    return sb - sa;
  });
  return scored.slice(0, 6);
}

export function assetPx(asset: string, tickers: Record<string, Ticker>): number {
  if (asset === "EUR") return 1;
  if (asset === "USD") {
    const usd = tickers.XBTUSD?.last;
    const eur = tickers.XBTEUR?.last;
    if (usd && eur) return eur / usd;
    return 1 / 1.08;
  }
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
    /** Sell this lot at its own purchase price instead of the blended average. */
    costBasis?: number;
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
  const basisQty = input.side === "sell" && input.costBasis && input.costBasis > 0 ? input.costBasis : pos.avg;

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
    pnl = notional - fee - basisQty * input.qty;
    const newQty = pos.qty - input.qty;
    if (newQty <= 1e-12) delete holdings[input.base];
    else {
      const costLeft = Math.max(0, pos.avg * pos.qty - basisQty * input.qty);
      holdings[input.base] = { qty: newQty, avg: costLeft / newQty };
    }
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

export type BotBlueprint = {
  name: string;
  kind: BotKind;
  venue: BotVenue;
  pair: string;
  interval: number;
  sizeQuote: number;
  params: BotParams;
};

export function botBlueprint(bot: Bot): BotBlueprint {
  return {
    name: bot.name,
    kind: bot.kind,
    venue: bot.venue,
    pair: bot.pair,
    interval: bot.interval,
    sizeQuote: bot.sizeQuote,
    params: { ...bot.params },
  };
}

export function parseBotBlueprints(raw: unknown): BotBlueprint[] {
  const root = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  const list = Array.isArray(raw) ? raw : Array.isArray(root?.bots) ? (root!.bots as unknown[]) : null;
  if (!list) return [];
  const kinds = new Set(BOT_KINDS.map((k) => k.id));
  const out: BotBlueprint[] = [];
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const kind = r.kind;
    if (typeof kind !== "string" || !kinds.has(kind as BotKind)) continue;
    const pair = typeof r.pair === "string" ? r.pair : "";
    const sizeQuote = Number(r.sizeQuote);
    if (!(sizeQuote > 0) || !pair) continue;
    out.push({
      name: typeof r.name === "string" ? r.name : "",
      kind: kind as BotKind,
      venue: r.venue === "live" ? "live" : "paper",
      pair,
      interval: Number(r.interval) > 0 ? Number(r.interval) : 60,
      sizeQuote,
      params: r.params && typeof r.params === "object" ? (r.params as BotParams) : {},
    });
  }
  return out;
}

export function kindNeedsCandles(kind: BotKind): boolean {
  return BOT_KIND_BY_ID[kind]?.needsCandles ?? false;
}

export const RISK_PRESETS: { id: string; label: string; params: Partial<BotParams> }[] = [
  {
    id: "prudent",
    label: "Prudent",
    params: {
      slPct: 2,
      tpPct: 4,
      trailingPct: 1.5,
      cooldownSec: 90,
      maxSpreadPct: 0.25,
      maxDailyLoss: 150,
      maxTradesDay: 8,
      maxConsecutiveLoss: 3,
      trendEma: 50,
      slAtr: 1.5,
      maxHoldMin: 720,
      partialTp: 50,
    },
  },
  {
    id: "balanced",
    label: "Équilibré",
    params: {
      slPct: 3,
      tpPct: 6,
      trailingPct: 2,
      cooldownSec: 30,
      maxSpreadPct: 0.4,
      maxDailyLoss: 300,
      maxTradesDay: 16,
      maxConsecutiveLoss: 5,
      trendEma: 21,
      slAtr: 0,
      maxHoldMin: 0,
      partialTp: 0,
    },
  },
  {
    id: "aggressive",
    label: "Agressif",
    params: {
      slPct: 5,
      tpPct: 12,
      trailingPct: 0,
      cooldownSec: 0,
      maxSpreadPct: 0.8,
      maxDailyLoss: 0,
      maxTradesDay: 0,
      maxConsecutiveLoss: 0,
      trendEma: 0,
      slAtr: 0,
      maxHoldMin: 0,
      partialTp: 0,
    },
  },
];

export type StrategyScore = {
  kind: BotKind;
  title: string;
  result: BacktestResult;
};

export function compareStrategies(
  candles: Candle[],
  feeRate: number,
  pair: string,
  sizeQuote: number,
  opts: BacktestOpts = {},
): StrategyScore[] {
  const last = candles[candles.length - 1]?.close ?? 100;
  const rows: StrategyScore[] = [];
  for (const kind of BOT_KINDS) {
    const result = backtestBot(kind.id, defaultParams(kind.id, last), sizeQuote, candles, feeRate, pair, opts);
    if (!result || result.sells < 1) continue;
    rows.push({ kind: kind.id, title: kind.title, result });
  }
  rows.sort((a, b) => {
    const sa = a.result.calmar !== 99 ? a.result.calmar : a.result.pnlPct;
    const sb = b.result.calmar !== 99 ? b.result.calmar : b.result.pnlPct;
    return sb - sa;
  });
  return rows;
}

export type WalkForwardResult = {
  inSample: BacktestResult | null;
  outSample: BacktestResult | null;
};

export function walkForward(
  kind: BotKind,
  params: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair: string,
  opts: BacktestOpts = {},
): WalkForwardResult {
  const split = Math.max(40, Math.floor(candles.length * 0.7));
  const warmup = backtestWarmup(kind, params);
  const is = backtestBot(kind, params, sizeQuote, candles.slice(0, split), feeRate, pair, opts);
  const oosStart = Math.max(0, split - warmup);
  const oos = backtestBot(kind, params, sizeQuote, candles.slice(oosStart), feeRate, pair, opts);
  return { inSample: is, outSample: oos };
}

export type MonteCarloResult = {
  samples: number;
  p5: number;
  p50: number;
  p95: number;
  mean: number;
  ruinPct: number;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stress overlays for Lab (copies closes; OHLC high/low widened to the new close). */
export type StressScenarioId = "crash" | "flash" | "spike";

export function applyStressScenario(candles: Candle[], id: StressScenarioId): Candle[] {
  if (candles.length < 10) return candles.slice();
  const out = candles.map((c) => ({ ...c }));
  if (id === "crash") {
    const start = Math.floor(out.length * 0.7);
    const base = out[start]!.close;
    const drop = base * 0.3;
    for (let i = 0; i < 5 && start + i < out.length; i++) {
      const c = out[start + i]!;
      const next = c.close - drop / 5;
      out[start + i] = { ...c, close: next, low: Math.min(c.low, next), high: Math.max(c.high, next) };
    }
  } else if (id === "flash") {
    const idx = Math.min(out.length - 2, Math.floor(out.length * 0.8));
    const c = out[idx]!;
    const drop = c.close * 0.2;
    const down = c.close - drop;
    out[idx] = { ...c, close: down, low: Math.min(c.low, down), high: Math.max(c.high, down) };
    const n = out[idx + 1]!;
    const up = n.close + drop;
    out[idx + 1] = { ...n, close: up, high: Math.max(n.high, up), low: Math.min(n.low, up) };
  } else {
    const idx = Math.floor(out.length * 0.75);
    const c = out[idx]!;
    const up = c.close * 1.2;
    out[idx] = { ...c, close: up, high: Math.max(c.high, up), low: Math.min(c.low, up) };
  }
  return out;
}

export const STRESS_SCENARIOS: { id: StressScenarioId; label: string }[] = [
  { id: "crash", label: "Krach −30 % / 5 barres" },
  { id: "flash", label: "Flash crash −20 % + rebond" },
  { id: "spike", label: "Spike +20 %" },
];

export type AllocInput = {
  id: string;
  score: number;
  sizeQuote: number;
  atrRiskPct?: number;
  budgetQuote?: number;
};

export type AllocResult = {
  id: string;
  weight: number;
  sizeQuote: number;
  atrRiskPct?: number;
  budgetQuote?: number;
};

/**
 * Performance-weighted capital shares. Clamps then renormalizes so weights sum to 1.
 * Negative/zero scores get the floor only after a positive-total path; all-nonpositive → equal.
 */
export function allocateByPerformance(
  rows: AllocInput[],
  opts?: { min?: number; max?: number },
): AllocResult[] {
  if (rows.length === 0) return [];
  const n = rows.length;
  const minW = Math.max(0, Math.min(1 / n, opts?.min ?? 0.05));
  const maxW = Math.max(minW, Math.min(1, opts?.max ?? 0.5));
  const totalSize = rows.reduce((s, r) => s + Math.max(0, r.sizeQuote), 0);
  const positive = rows.map((r) => Math.max(0, r.score));
  const sumPos = positive.reduce((a, b) => a + b, 0);
  let weights = rows.map((_, i) => (sumPos > 0 ? positive[i]! / sumPos : 1 / n));

  for (let iter = 0; iter < 16; iter++) {
    weights = weights.map((w) => Math.max(minW, Math.min(maxW, w)));
    const sum = weights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) < 1e-9) break;
    if (sum < 1) {
      const need = 1 - sum;
      const room = weights.map((w) => Math.max(0, maxW - w));
      const roomSum = room.reduce((a, b) => a + b, 0);
      if (roomSum < 1e-12) {
        const s = weights.reduce((a, b) => a + b, 0) || 1;
        weights = weights.map((w) => w / s);
        break;
      }
      weights = weights.map((w, i) => w + (need * room[i]!) / roomSum);
    } else {
      const excess = sum - 1;
      const spare = weights.map((w) => Math.max(0, w - minW));
      const spareSum = spare.reduce((a, b) => a + b, 0);
      if (spareSum < 1e-12) {
        const s = weights.reduce((a, b) => a + b, 0) || 1;
        weights = weights.map((w) => w / s);
        break;
      }
      weights = weights.map((w, i) => w - (excess * spare[i]!) / spareSum);
    }
  }
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  weights = weights.map((w) => w / sum);

  return rows.map((r, i) => {
    const weight = weights[i]!;
    const sizeQuote = totalSize > 0 ? totalSize * weight : r.sizeQuote;
    const atrRiskPct =
      r.atrRiskPct != null && r.atrRiskPct > 0 ? Math.max(0.05, r.atrRiskPct * weight * rows.length) : r.atrRiskPct;
    const budgetQuote =
      r.budgetQuote != null && r.budgetQuote > 0 ? Math.max(0, r.budgetQuote * weight * rows.length) : r.budgetQuote;
    return { id: r.id, weight, sizeQuote, atrRiskPct, budgetQuote };
  });
}

/** Score a live/paper bot for allocation (PnL + mild win-rate boost). */
export function botAllocScore(bot: Bot): number {
  const pnl = bot.stats.realizedPnl + (bot.runtime.dayPnl ?? 0);
  const wr = botWinRate(bot.stats);
  const closes = bot.stats.closes ?? 0;
  const boost = closes >= 3 ? ((wr - 50) / 100) * Math.max(20, Math.abs(pnl) * 0.1) : 0;
  return pnl + boost;
}

export type GatedOptResult = {
  ok: boolean;
  reason: string;
  params?: BotParams;
  label?: string;
  oosSharpe?: number;
  inSharpe?: number;
};

/**
 * Optimize params then accept only if walk-forward out-of-sample Sharpe ≥ threshold.
 * Uses Lab math (fees, calmar ranking) — not the old Bot fee-less argmax.
 */
export function gatedOptimizeBot(
  kind: BotKind,
  base: BotParams,
  sizeQuote: number,
  candles: Candle[],
  feeRate: number,
  pair: string,
  opts: BacktestOpts & { minOosSharpe?: number } = {},
): GatedOptResult {
  const minOos = opts.minOosSharpe ?? 0;
  const ranked = optimizeBot(kind, base, sizeQuote, candles, feeRate, pair, opts);
  if (!ranked.length) return { ok: false, reason: "Aucune variante rentable sur l’échantillon." };
  const best = ranked[0]!;
  const wf = walkForward(kind, best.params, sizeQuote, candles, feeRate, pair, opts);
  const oos = wf.outSample?.sharpe ?? Number.NEGATIVE_INFINITY;
  const ins = wf.inSample?.sharpe ?? 0;
  if (!(wf.outSample && wf.outSample.sells >= 1)) {
    return { ok: false, reason: "Walk-forward OOS sans trade clôturé.", oosSharpe: oos, inSharpe: ins };
  }
  if (oos < minOos) {
    return {
      ok: false,
      reason: `OOS Sharpe ${oos.toFixed(2)} < seuil ${minOos.toFixed(2)}`,
      oosSharpe: oos,
      inSharpe: ins,
      label: best.label,
    };
  }
  return {
    ok: true,
    reason: `Accepté · ${best.label} · OOS Sharpe ${oos.toFixed(2)}`,
    params: best.params,
    label: best.label,
    oosSharpe: oos,
    inSharpe: ins,
  };
}

/** Shuffle closed-trade PnLs to estimate a 5/50/95 terminal outcome. */
export function monteCarloPnl(pnls: number[], startEquity: number, samples = 200, seed = 1): MonteCarloResult | null {
  if (pnls.length < 3 || !(startEquity > 0) || samples < 8) return null;
  const rand = mulberry32(seed);
  const terminals: number[] = [];
  let ruin = 0;
  for (let i = 0; i < samples; i++) {
    const order = pnls.slice();
    for (let j = order.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1));
      const tmp = order[j]!;
      order[j] = order[k]!;
      order[k] = tmp;
    }
    let eq = startEquity;
    for (const p of order) {
      eq += p;
      if (eq <= startEquity * 0.5) {
        ruin += 1;
        break;
      }
    }
    terminals.push(eq - startEquity);
  }
  terminals.sort((a, b) => a - b);
  const at = (q: number) => terminals[Math.min(terminals.length - 1, Math.max(0, Math.floor(q * (terminals.length - 1))))]!;
  const mean = terminals.reduce((s, n) => s + n, 0) / terminals.length;
  return {
    samples,
    p5: at(0.05),
    p50: at(0.5),
    p95: at(0.95),
    mean,
    ruinPct: (ruin / samples) * 100,
  };
}
