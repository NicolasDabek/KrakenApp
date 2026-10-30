import { adx, atr, ema, trendQuality } from "../indicators.ts";
import type { Bot, BotRuntime } from "../types.ts";
import { BOOK_MAX_AGE_MS, bookBuyBlock, scoreBook } from "../book-score.ts";
import { BOOK_KINDS, MEAN_REVERSION } from "./catalog.ts";
import { dropFormingCandle, markFlat, px, remainingQuoteBudget, roundSmart, tradingDay } from "./common.ts";
import type { BotEvalCtx, BotFill } from "./common.ts";
import { evalAdx } from "./strategies/adx.ts";
import { evalBb } from "./strategies/bollinger.ts";
import { evalBreakout } from "./strategies/breakout.ts";
import { evalCci } from "./strategies/cci.ts";
import { evalConfirm } from "./strategies/confirm.ts";
import { evalDca } from "./strategies/dca.ts";
import { evalDiv } from "./strategies/div.ts";
import { evalEma } from "./strategies/ema.ts";
import { evalEngulf } from "./strategies/engulf.ts";
import { evalGrid, flattenGrid, syncGridPosition } from "./strategies/grid.ts";
import { evalHa } from "./strategies/ha.ts";
import { evalIchimoku } from "./strategies/ichimoku.ts";
import { evalKeltner } from "./strategies/keltner.ts";
import { evalMacd } from "./strategies/macd.ts";
import { evalMeanRev } from "./strategies/meanrev.ts";
import { evalMfi } from "./strategies/mfi.ts";
import { evalMtf } from "./strategies/mtf.ts";
import { evalObv } from "./strategies/obv.ts";
import { evalPsar } from "./strategies/psar.ts";
import { evalRoc } from "./strategies/roc.ts";
import { evalRsi } from "./strategies/rsi.ts";
import { evalScalp } from "./strategies/scalp.ts";
import { evalSma } from "./strategies/sma.ts";
import { evalStoch } from "./strategies/stoch.ts";
import { evalSupertrend } from "./strategies/supertrend.ts";
import { evalVolume } from "./strategies/volume.ts";
import { evalVwap } from "./strategies/vwap.ts";
import { evalWilliams } from "./strategies/williams.ts";

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

/**
 * Filtre qualité de tendance (EMA 20/50 + volume). N'agit que sur les achats.
 * soft : suivi de tendance bloqué en tendance baissière ; réversion bloquée en baisse solide.
 * strict : suivi de tendance seulement en hausse solide ; réversion bloquée dès que la tendance baisse.
 */
export function trendFilterNote(bot: Bot, ctx: BotEvalCtx): string | null {
  const mode = bot.params.trendFilter ?? "off";
  if (mode === "off" || bot.kind === "grid" || bot.kind === "dca") return null;
  const candles = ctx.candles;
  if (!candles) return null;
  const tq = trendQuality(candles);
  if (tq.emaSlow == null) return null;
  const reversion = MEAN_REVERSION.has(bot.kind);
  const down = tq.direction === "down";
  let block: boolean;
  if (reversion) block = mode === "strict" ? down : down && tq.quality === "solid";
  else block = mode === "strict" ? !(tq.direction === "up" && tq.quality === "solid") : down;
  return block ? `Tendance ${tq.note} — pas d’achat` : null;
}

/** Filtre carnet : achats seulement, jamais les sorties (SL/TP/trailing/panique). Sans carnet frais : aucun effet. */
export function bookFilterNote(bot: Bot, ctx: BotEvalCtx): string | null {
  const mode = bot.params.bookFilter ?? "off";
  if (mode === "off" || !BOOK_KINDS.has(bot.kind) || !ctx.book) return null;
  if (ctx.book.at != null && ctx.now - ctx.book.at > BOOK_MAX_AGE_MS) return null;
  return bookBuyBlock(scoreBook(ctx.book), mode);
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
  const regime = regimeNote(bot, ctx) ?? crashNote(bot, ctx) ?? trendFilterNote(bot, ctx) ?? bookFilterNote(bot, ctx);
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

  const regime = regimeNote(bot, ctx) ?? crashNote(bot, ctx) ?? trendFilterNote(bot, ctx) ?? bookFilterNote(bot, ctx);
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
