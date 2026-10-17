import type { BotKind, BotParams } from "../types.ts";
import { roundSmart } from "./common.ts";

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

export function defaultParams(kind: BotKind, last: number): BotParams {
  return { ...baseParams(kind, last), ...profitDefaults(kind) };
}

export const MEAN_REVERSION = new Set<BotKind>([
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

export function kindTitle(kind: BotKind): string {
  return BOT_KIND_BY_ID[kind]?.title ?? kind;
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
