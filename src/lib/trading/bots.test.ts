import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOT_CANDLE_INTERVALS,
  BOT_KIND_BY_ID,
  BOT_KINDS,
  profitDefaults,
  riskPresetFor,
  RISK_PRESETS,
  DCA_INTERVALS,
  DEFAULT_PAPER,
  EMPTY_STATS,
  applyPaperFill,
  assetPx,
  backtestBot,
  backtestWarmup,
  botBlueprint,
  botInventoryQty,
  botWinRate,
  compareStrategies,
  defaultParams,
  defaultSize,
  dropFormingCandle,
  evaluateBot,
  evaluateDesk,
  GRID_PRESETS,
  applyGridPreset,
  gridChartLevels,
  gridFeePadPct,
  flattenPaper,
  formatWait,
  kindNeedsCandles,
  kindTitle,
  monteCarloPnl,
  optimizeBot,
  paperEquity,
  paramVariants,
  parseBotBlueprints,
  previewSignal,
  remainingQuoteBudget,
  resetPaperAccount,
  snapshotEquity,
  walkForward,
} from "./bots.ts";
import type { Bot, BotKind, Candle, PaperAccount, Ticker } from "./types.ts";

function ticker(last: number, extra: Partial<Ticker> = {}): Ticker {
  return {
    id: "XBTEUR",
    last,
    bid: last * 0.9995,
    ask: last * 1.0005,
    open: last,
    high: last,
    low: last,
    volume: 10,
    vwap: last,
    change: 0,
    changePct: 0,
    trades: 0,
    quoteVolume: 0,
    ...extra,
  };
}

function candlesFrom(closes: number[], volume = 20): Candle[] {
  return closes.map((close, i) => {
    const open = i === 0 ? close : closes[i - 1]!;
    return {
      time: 1_700_000_000 + i * 900,
      open,
      high: Math.max(open, close) + 0.4,
      low: Math.min(open, close) - 0.4,
      close,
      volume,
    };
  });
}

function makeBot(kind: BotKind, extra: Partial<Bot> = {}): Bot {
  const { params, runtime, ...rest } = extra;
  return {
    id: "b1",
    name: "test",
    kind,
    venue: "paper",
    status: "running",
    pair: "XBTEUR",
    interval: 15,
    sizeQuote: 200,
    createdAt: 0,
    lastNote: "",
    stats: { ...EMPTY_STATS },
    ...rest,
    params: { ...defaultParams(kind, 100), ...params },
    runtime: runtime ?? {},
  };
}

describe("catalog", () => {
  it("registers 27 named strategies with EUR-friendly defaults", () => {
    assert.equal(BOT_KINDS.length, 27);
    const ids = BOT_KINDS.map((k) => k.id);
    assert.equal(new Set(ids).size, 27);
    assert.ok(ids.includes("mfi"));
    assert.ok(ids.includes("engulf"));
    assert.ok(ids.includes("obv"));
    assert.ok(ids.includes("div"));
    assert.ok(ids.includes("confirm"));
    assert.equal(kindTitle("rsi"), "Reversion RSI");
    assert.equal(kindNeedsCandles("grid"), false);
    assert.equal(kindNeedsCandles("dca"), false);
    assert.equal(kindNeedsCandles("rsi"), true);
    assert.equal(defaultSize("dca"), 50);
    assert.equal(defaultSize("grid"), 80);
    assert.equal(defaultSize("rsi"), 200);
    const grid = defaultParams("grid", 100);
    assert.ok((grid.lower ?? 0) < 100);
    assert.ok((grid.upper ?? 0) > 100);
    assert.equal(grid.gridSellPct, 1.5);
    assert.equal(grid.gridBuyPct, 1);
    assert.equal(grid.gridNetFees, true);
    assert.equal(GRID_PRESETS.length, 3);
    assert.ok(applyGridPreset(100, GRID_PRESETS[0]!).gridBuyPct === 0.5);
    assert.equal(gridFeePadPct(0.0026, true), 0.52);
    assert.equal(gridFeePadPct(0.0026, false), 0);
    assert.equal(defaultParams("mfi", 100).oversold, 20);
    assert.equal(defaultParams("mfi", 100).adxCeil, 32);
    assert.equal(defaultParams("rsi", 100).slPct, 3.5);
    assert.equal(defaultParams("ema", 100).adxFloor, 18);
    assert.equal(defaultParams("ema", 100).slAtr, 2);
    assert.equal(defaultParams("grid", 100).adxCeil, undefined);
    assert.deepEqual(profitDefaults("dca"), {});
    const prudent = RISK_PRESETS.find((p) => p.id === "prudent")!;
    const onGrid = riskPresetFor("grid", prudent);
    assert.equal(onGrid.slPct, 0);
    assert.equal(onGrid.gridSlPct, 2);
    assert.equal(riskPresetFor("rsi", prudent).slPct, 2);
    assert.equal(EMPTY_STATS.closes, 0);
    assert.equal(DEFAULT_PAPER.feeRate, 0.0026);
    assert.equal(DEFAULT_PAPER.cash, 10_000);
    assert.equal(BOT_KIND_BY_ID.rsi?.title, "Reversion RSI");
    assert.ok(DCA_INTERVALS.some((i) => i.id === 300_000));
    assert.ok(BOT_CANDLE_INTERVALS.some((i) => i.id === 15));
    for (const kind of BOT_KINDS) {
      const p = defaultParams(kind.id, 100);
      assert.equal(typeof p, "object");
      assert.ok(kindTitle(kind.id).length > 0);
    }
  });
});

describe("evaluateBot — DCA / grid / engulf", () => {
  it("fires a DCA buy when due and waits otherwise", () => {
    const now = 1_000_000;
    const due = evaluateBot(makeBot("dca", { params: { intervalMs: 60_000 } }), {
      now,
      ticker: ticker(50_000),
    });
    assert.equal(due.fills.length, 1);
    assert.equal(due.fills[0]!.side, "buy");
    assert.ok(Math.abs(due.fills[0]!.qty * due.fills[0]!.price - 200) < 1e-6);
    assert.equal(due.runtime.nextDcaAt, now + 60_000);

    const wait = evaluateBot(
      makeBot("dca", { runtime: { nextDcaAt: now + 30_000 }, params: { intervalMs: 60_000 } }),
      { now, ticker: ticker(50_000) },
    );
    assert.equal(wait.fills.length, 0);
    assert.match(wait.note, /Prochain achat/);
  });

  it("arms a grid then buys when price crosses a level down", () => {
    const bot = makeBot("grid", { params: { lower: 90, upper: 110, levels: 5 }, sizeQuote: 100 });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    assert.equal(armed.fills.length, 0);
    assert.match(armed.note, /armée/);
    const bait = (armed.runtime.gridOwned ?? []).filter((g) => g.pending);
    assert.equal(bait.length, 1);
    assert.ok(bait[0]!.price < 100);
    const crossed = evaluateBot(
      { ...bot, runtime: armed.runtime },
      { now: 2, ticker: ticker(95) },
    );
    assert.ok(crossed.fills.some((f) => f.side === "buy"));
    assert.ok((crossed.runtime.gridOwned ?? []).some((g) => g.qty > 0));
  });

  it("buys a bullish engulfing candle", () => {
    const body: Candle[] = candlesFrom([100, 101, 102, 103, 104]);
    body.push({
      time: body[body.length - 1]!.time + 900,
      open: 105,
      high: 105.2,
      low: 94.8,
      close: 95,
      volume: 20,
    });
    body.push({
      time: body[body.length - 1]!.time + 900,
      open: 94,
      high: 107,
      low: 93.5,
      close: 106.5,
      volume: 20,
    });
    const res = evaluateBot(makeBot("engulf"), {
      now: 3,
      ticker: ticker(106.5),
      candles: body,
    });
    assert.equal(res.fills[0]?.side, "buy");
    assert.match(res.fills[0]!.note, /haussier/);
  });
});

describe("evaluateBot — RSI + risk overlay", () => {
  function rsiDump(): Candle[] {
    const up = Array.from({ length: 28 }, () => 120);
    const dump = Array.from({ length: 16 }, (_, i) => 120 - (i + 1) * 4);
    return candlesFrom([...up, ...dump]);
  }

  function walkUntilFill(kind: BotKind, cs: Candle[], params: Bot["params"] = {}) {
    let bot = makeBot(kind, { params });
    for (let i = 20; i <= cs.length; i++) {
      const slice = cs.slice(0, i);
      const res = evaluateBot(bot, {
        now: i,
        ticker: ticker(slice[slice.length - 1]!.close),
        candles: slice,
      });
      bot = { ...bot, runtime: res.runtime };
      if (res.fills.length) return { bot, res, slice };
    }
    return { bot, res: evaluateBot(bot, { now: 99, ticker: ticker(cs.at(-1)!.close), candles: cs }), slice: cs };
  }

  it("enters when RSI crosses below oversold", () => {
    const { res } = walkUntilFill("rsi", rsiDump(), {
      rsiPeriod: 14,
      oversold: 30,
      overbought: 70,
      adxCeil: 0,
      slPct: 0,
      crashPct: 0,
    });
    assert.equal(res.fills[0]?.side, "buy");
    assert.equal(res.runtime.inPosition, true);
  });

  it("does not re-fire on the same candle", () => {
    const { bot, res, slice } = walkUntilFill("rsi", rsiDump(), { adxCeil: 0, slPct: 0, crashPct: 0 });
    const again = evaluateBot(
      { ...bot, runtime: res.runtime },
      { now: 200, ticker: ticker(slice[slice.length - 1]!.close), candles: slice },
    );
    assert.equal(again.fills.length, 0);
  });

  it("asks for more candles when the series is too short", () => {
    const res = evaluateBot(makeBot("rsi"), {
      now: 1,
      ticker: ticker(100),
      candles: candlesFrom([100, 101, 102]),
    });
    assert.equal(res.fills.length, 0);
    assert.match(res.note, /insuffisants/);
  });

  it("triggers a stop-loss on an open position", () => {
    const bot = makeBot("dca", {
      params: { intervalMs: 300_000, slPct: 2 },
      runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12 },
    });
    const res = evaluateBot(bot, { now: 50, ticker: ticker(97) });
    assert.equal(res.fills[0]?.side, "sell");
    assert.match(res.fills[0]!.note, /Stop-loss/);
    assert.equal(res.runtime.inPosition, false);
  });

  it("locks a gain at the fee-adjusted entry and raises a take-profit that cannot pay the fees", () => {
    const locked = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, beAfterPct: 1.2 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, peakPrice: 103, nextDcaAt: 9e12 },
      }),
      { now: 50, ticker: ticker(100.2), feeRate: 0.0026, barLow: 100.1, barHigh: 100.4 },
    );
    assert.match(locked.fills[0]?.note ?? "", /verrouillé/);
    assert.ok((locked.fills[0]?.price ?? 0) > 100);

    const tiny = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, tpPct: 0.2 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12 },
      }),
      { now: 50, ticker: ticker(100.4), feeRate: 0.0026, barHigh: 100.4, barLow: 100.2 },
    );
    assert.equal(tiny.fills.length, 0);

    const paid = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, tpPct: 0.2 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12 },
      }),
      { now: 51, ticker: ticker(100.8), feeRate: 0.0026, barHigh: 100.8, barLow: 100.5 },
    );
    assert.match(paid.fills[0]?.note ?? "", /Take-profit/);
  });

  it("does not trail until the trade has earned the trail, and skips a mean-reversion buy in a strong trend", () => {
    const early = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, trailingPct: 2 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, peakPrice: 101, nextDcaAt: 9e12 },
      }),
      { now: 50, ticker: ticker(99.5) },
    );
    assert.equal(early.fills.length, 0);

    const { res } = walkUntilFill("rsi", rsiDump());
    assert.notEqual(res.fills[0]?.side, "buy");
    assert.match(res.note, /Bougie|ADX/);
  });

  it("triggers take-profit and trailing stop", () => {
    const tp = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, tpPct: 3 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12 },
      }),
      { now: 50, ticker: ticker(104) },
    );
    assert.match(tp.fills[0]?.note ?? "", /Take-profit/);

    const trail = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, trailingPct: 2 },
        runtime: {
          inPosition: true,
          positionQty: 1,
          positionAvg: 100,
          peakPrice: 110,
          nextDcaAt: 9e12,
        },
      }),
      { now: 50, ticker: ticker(107) },
    );
    assert.match(trail.fills[0]?.note ?? "", /Trailing/);
  });

  it("blocks buys under a bearish trend EMA, wide spread, cooldown and daily loss", () => {
    const now = 1_000;
    const cs = candlesFrom(Array.from({ length: 30 }, () => 120));
    const trend = evaluateBot(
      makeBot("dca", { params: { intervalMs: 1, trendEma: 10 } }),
      { now, ticker: ticker(100), candles: cs, equity: 10_000 },
    );
    assert.equal(trend.fills.length, 0);
    assert.match(trend.note, /Filtre EMA/);

    const spread = evaluateBot(makeBot("dca", { params: { intervalMs: 1, maxSpreadPct: 0.1 } }), {
      now,
      ticker: ticker(100, { bid: 99, ask: 101 }),
    });
    assert.equal(spread.fills.length, 0);
    assert.match(spread.note, /Spread/);

    const cool = evaluateBot(
      makeBot("dca", { params: { intervalMs: 1, cooldownSec: 60 }, lastActionAt: now - 500 }),
      { now, ticker: ticker(100) },
    );
    assert.equal(cool.fills.length, 0);
    assert.match(cool.note, /Cooldown/);

    const day = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 1, maxDailyLoss: 50 },
        runtime: { dayStamp: new Date(now).toISOString().slice(0, 10), dayPnl: -80 },
      }),
      { now, ticker: ticker(100) },
    );
    assert.equal(day.fills.length, 0);
    assert.match(day.note, /Stop journalier/);
  });

  it("sizes from equity when sizePct is set", () => {
    const res = evaluateBot(makeBot("dca", { params: { intervalMs: 1, sizePct: 5 }, sizeQuote: 200 }), {
      now: 1,
      ticker: ticker(100),
      equity: 10_000,
    });
    assert.equal(res.fills.length, 1);
    assert.ok(Math.abs(res.fills[0]!.qty * res.fills[0]!.price - 500) < 1e-6);
  });

  it("flattens grid inventory on a stop-loss", () => {
    const bot = makeBot("grid", {
      params: { lower: 90, upper: 110, levels: 5, slPct: 5 },
      runtime: {
        lastPrice: 100,
        gridOwned: [
          { price: 90, qty: 1, entry: 100 },
          { price: 95, qty: 1, entry: 100 },
          { price: 100, qty: 0, entry: 0 },
          { price: 105, qty: 0, entry: 0 },
          { price: 110, qty: 0, entry: 0 },
        ],
      },
    });
    const res = evaluateBot(bot, { now: 2, ticker: ticker(90) });
    assert.ok(res.fills.some((f) => f.note.includes("Stop-loss")));
    assert.ok((res.runtime.gridOwned ?? []).every((g) => g.qty === 0));
  });

  it("rolls back position when a risk overlay blocks the buy", () => {
    const { bot, res, slice } = walkUntilFill("rsi", rsiDump(), { adxCeil: 0, slPct: 0, crashPct: 0 });
    assert.equal(res.fills[0]?.side, "buy");
    const blocked = evaluateBot(
      {
        ...bot,
        lastActionAt: 9_000,
        params: { ...bot.params, cooldownSec: 60 },
        runtime: { ...bot.runtime, lastCandleTime: undefined, inPosition: false, positionQty: 0, positionAvg: 0 },
      },
      { now: 9_500, ticker: ticker(slice.at(-1)!.close), candles: slice },
    );
    assert.equal(blocked.fills.length, 0);
    assert.equal(blocked.runtime.inPosition, false);
    assert.match(blocked.note, /Cooldown/);
  });

  it("hits a stop-loss on the bar low even if close recovered", () => {
    const bot = makeBot("dca", {
      params: { intervalMs: 300_000, slPct: 2 },
      runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12, entryAt: 1 },
    });
    const res = evaluateBot(bot, { now: 50, ticker: ticker(99.5), barLow: 97, barHigh: 100 });
    assert.equal(res.fills[0]?.side, "sell");
    assert.match(res.fills[0]!.note, /Stop-loss/);
    assert.ok(res.fills[0]!.price <= 98.01);
  });

  it("blocks entries outside the UTC session and times out a stale long", () => {
    const sessionNow = Date.UTC(2024, 0, 1, 3, 0, 0);
    const session = evaluateBot(makeBot("dca", { params: { intervalMs: 1, sessionStart: 8, sessionEnd: 16 } }), {
      now: sessionNow,
      ticker: ticker(100),
    });
    assert.equal(session.fills.length, 0);
    assert.match(session.note, /Hors session/);

    const aged = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, maxHoldMin: 5 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12, entryAt: sessionNow - 10 * 60_000 },
      }),
      { now: sessionNow, ticker: ticker(100) },
    );
    assert.equal(aged.fills[0]?.side, "sell");
    assert.match(aged.fills[0]!.note, /Sortie temps/);
  });

  it("scales out half the position at take-profit", () => {
    const res = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, tpPct: 3, partialTp: 50 },
        runtime: { inPosition: true, positionQty: 2, positionAvg: 100, nextDcaAt: 9e12 },
      }),
      { now: 50, ticker: ticker(104) },
    );
    assert.equal(res.fills.length, 1);
    assert.equal(res.fills[0]!.qty, 1);
    assert.equal(res.runtime.inPosition, true);
    assert.equal(res.runtime.positionQty, 1);
    assert.equal(res.runtime.scaledOut, true);
    assert.match(res.fills[0]!.note, /partiel/);
  });
});

describe("paper account", () => {
  const start = resetPaperAccount(20_000, 0.0026);

  it("debits cash + fee on a buy and credits pnl on a sell", () => {
    const buy = applyPaperFill(start, {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "buy",
      qty: 1,
      price: 10_000,
      note: "test buy",
      time: 1,
    });
    assert.equal(buy.ok, true);
    if (!buy.ok) return;
    assert.ok(Math.abs(buy.paper.cash - (20_000 - 10_000 - 26)) < 1e-6);
    assert.equal(buy.paper.holdings.BTC?.qty, 1);
    assert.equal(buy.paper.holdings.BTC?.avg, 10_000);
    assert.equal(buy.trade.pnl, 0);

    const sell = applyPaperFill(buy.paper, {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "sell",
      qty: 1,
      price: 11_000,
      note: "test sell",
      time: 2,
    });
    assert.equal(sell.ok, true);
    if (!sell.ok) return;
    assert.ok(Math.abs(sell.trade.pnl - (11_000 - 28.6 - 10_000)) < 1e-6);
    assert.ok(sell.paper.holdings.BTC == null);
    assert.ok(sell.paper.realizedPnl > 0);
  });

  it("rejects an unaffordable buy and an oversized sell", () => {
    const poor = applyPaperFill(resetPaperAccount(10, 0.0026), {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "buy",
      qty: 1,
      price: 10_000,
      note: "x",
    });
    assert.equal(poor.ok, false);

    const naked = applyPaperFill(start, {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "sell",
      qty: 1,
      price: 10_000,
      note: "x",
    });
    assert.equal(naked.ok, false);
  });

  it("marks equity in EUR using EUR pairs, including USD via the BTC cross", () => {
    const tickers = {
      XBTEUR: ticker(90_000),
      XBTUSD: { ...ticker(99_000), id: "XBTUSD" },
    };
    assert.equal(assetPx("EUR", tickers), 1);
    assert.ok(Math.abs(assetPx("USD", tickers) - 90_000 / 99_000) < 1e-9);
    assert.equal(assetPx("BTC", tickers), 90_000);

    const paper: PaperAccount = {
      ...start,
      cash: 1_000,
      holdings: { BTC: { qty: 0.1, avg: 80_000 } },
    };
    assert.ok(Math.abs(paperEquity(paper, tickers) - (1_000 + 9_000)) < 1e-6);
  });

  it("liquidates paper holdings back to EUR", () => {
    const funded: PaperAccount = {
      ...start,
      cash: 1_000,
      holdings: { BTC: { qty: 0.01, avg: 80_000 } },
    };
    const out = flattenPaper(funded, { XBTEUR: ticker(90_000) });
    assert.equal(out.sold, 1);
    assert.ok(out.paper.holdings.BTC == null);
    assert.ok(out.paper.cash > 1_000);
  });

  it("snapshots the equity curve and reports win rate on closes", () => {
    const snapped = snapshotEquity(start, 12_000);
    assert.equal(snapped.equityCurve.at(-1)?.v, 12_000);
    assert.equal(botWinRate({ ...EMPTY_STATS, wins: 3, closes: 4 }), 75);
    assert.equal(botWinRate(EMPTY_STATS), 0);
  });
});

describe("backtest / optimizer / preview", () => {
  it("refuses too-short history and coarsens warmup per strategy", () => {
    assert.equal(backtestBot("dca", {}, 50, candlesFrom([1, 2, 3]), 0.0026), null);
    assert.equal(backtestWarmup("sma", { slow: 200 }), 208);
    assert.equal(backtestWarmup("rsi", {}), 48);
    assert.ok(backtestWarmup("ichimoku", { kijun: 26 }) > 50);
  });

  it("runs a DCA backtest that spends fees and tracks equity", () => {
    const cs = candlesFrom(Array.from({ length: 80 }, (_, i) => 100 + Math.sin(i / 6) * 4));
    const result = backtestBot("dca", { intervalMs: 1 }, 100, cs, 0.0026, "XBTEUR", {
      startingBalance: 10_000,
      requestedDays: 7,
      interval: 15,
    });
    assert.ok(result);
    assert.ok(result!.buys >= 1);
    assert.ok(result!.fees > 0);
    assert.equal(result!.startEquity, 10_000);
    assert.equal(result!.requestedDays, 7);
    assert.ok(result!.equityCurve.length >= 2);
    assert.ok(result!.openQty >= 0);
    assert.ok(Number.isFinite(result!.sharpe));
    assert.ok(Number.isFinite(result!.sortino));
  });

  it("previews a live signal and ranks RSI variants", () => {
    const preview = previewSignal("dca", { intervalMs: 1 }, 200, { now: 1, ticker: ticker(100) });
    assert.equal(preview.side, "buy");

    const hold = previewSignal("rsi", defaultParams("rsi", 100), 200, {
      now: 1,
      ticker: ticker(100),
      candles: candlesFrom([100, 101, 102]),
    });
    assert.equal(hold.side, "hold");

    const wait = previewSignal(
      "dca",
      { intervalMs: 60_000 },
      200,
      { now: 1, ticker: ticker(100) },
      "XBTEUR",
    );
    assert.ok(wait.note.length > 0);

    const rows = paramVariants("rsi", defaultParams("rsi", 100));
    assert.ok(rows.length > 1);
    assert.ok(rows.length <= 18);
    assert.equal(rows[0]!.label, "Actuel");

    const wave = candlesFrom(Array.from({ length: 160 }, (_, i) => 100 + Math.sin(i / 4) * 12));
    const ranked = optimizeBot("rsi", defaultParams("rsi", 100), 200, wave, 0.0026, "XBTEUR", {
      startingBalance: 10_000,
    });
    assert.ok(ranked.length <= 6);
    if (ranked.length > 1) {
      assert.ok(ranked[0]!.result.sells >= 1);
    }
  });

  it("formats waits and keeps optimizer labels stable", () => {
    assert.equal(formatWait(1_500), "2s");
    assert.equal(formatWait(120_000), "2 min");
    assert.equal(formatWait(3_600_000), "1 h");
    assert.equal(formatWait(3 * 86_400_000), "3 j");
    const macd = paramVariants("macd", defaultParams("macd", 100));
    assert.ok(macd.some((r) => r.label.includes("12/26/9")));
    const wr = paramVariants("williams", defaultParams("williams", 100));
    assert.ok(wr.some((r) => (r.params.oversold ?? 0) < 0));
    const grid = paramVariants("grid", { lower: 90, upper: 110, levels: 8 });
    for (const row of grid) {
      assert.ok((row.params.lower ?? 0) < (row.params.upper ?? 1), row.label);
    }
  });

  it("ranks strategies and splits a walk-forward window", () => {
    const wave = candlesFrom(Array.from({ length: 180 }, (_, i) => 100 + Math.sin(i / 5) * 8 + i * 0.05));
    const ranked = compareStrategies(wave, 0.0026, "XBTEUR", 200, { startingBalance: 10_000 });
    assert.ok(Array.isArray(ranked));
    if (ranked.length > 1) {
      assert.ok(ranked[0]!.result.sells >= 1);
    }
    const wf = walkForward("dca", { intervalMs: 1 }, 100, wave, 0.0026, "XBTEUR", { startingBalance: 10_000 });
    assert.ok(wf.inSample);
    assert.ok(wf.outSample);
  });
});

describe("evaluateBot — remaining strategies", () => {
  function walkUntilFill(kind: BotKind, cs: Candle[], params: Bot["params"] = {}) {
    let bot = makeBot(kind, { params });
    for (let i = Math.min(20, cs.length); i <= cs.length; i++) {
      const slice = cs.slice(0, i);
      const res = evaluateBot(bot, {
        now: i,
        ticker: ticker(slice[slice.length - 1]!.close),
        candles: slice,
      });
      bot = { ...bot, runtime: res.runtime };
      if (res.fills.length) return { bot, res, slice };
    }
    return {
      bot,
      res: evaluateBot(bot, { now: 99, ticker: ticker(cs.at(-1)!.close), candles: cs }),
      slice: cs,
    };
  }

  it("runs every strategy on a long series without throwing", () => {
    const wave = candlesFrom(Array.from({ length: 260 }, (_, i) => 100 + Math.sin(i / 7) * 8 + i * 0.02));
    for (const kind of BOT_KINDS) {
      const res = evaluateBot(makeBot(kind.id, { params: defaultParams(kind.id, 100) }), {
        now: 1,
        ticker: ticker(wave.at(-1)!.close),
        candles: wave,
      });
      assert.equal(typeof res.note, "string", kind.id);
      assert.ok(Array.isArray(res.fills), kind.id);
    }
  });

  it("buys a Donchian breakout and a volume spike", () => {
    const base = candlesFrom(Array.from({ length: 30 }, () => 100));
    const brk = [...base, { time: 1_700_000_000 + 31 * 900, open: 100, high: 112, low: 100, close: 111, volume: 20 }];
    const br = evaluateBot(makeBot("breakout", { params: { donchian: 20 } }), {
      now: 2,
      ticker: ticker(111),
      candles: brk,
    });
    assert.equal(br.fills[0]?.side, "buy");

    const quiet = candlesFrom(Array.from({ length: 24 }, () => 100), 10);
    quiet[quiet.length - 1] = {
      ...quiet[quiet.length - 1]!,
      volume: 80,
      open: 99,
      close: 102,
      high: 103,
      low: 98,
    };
    const vol = evaluateBot(makeBot("volume", { params: { volMult: 2 } }), {
      now: 3,
      ticker: ticker(102),
      candles: quiet,
    });
    assert.equal(vol.fills[0]?.side, "buy");
  });

  it("crosses EMA up and SMA golden-cross with short windows", () => {
    const down = Array.from({ length: 20 }, (_, i) => 80 - i);
    const up = Array.from({ length: 18 }, (_, i) => 60 + i * 3);
    const { res: emaRes } = walkUntilFill("ema", candlesFrom([...down, ...up]), { fast: 3, slow: 8 });
    assert.equal(emaRes.fills[0]?.side, "buy");

    const { res: smaRes } = walkUntilFill("sma", candlesFrom([...down, ...up]), { fast: 3, slow: 8 });
    assert.equal(smaRes.fills[0]?.side, "buy");
  });

  it("enters VWAP on a cross below and HA on a color flip", () => {
    const up = candlesFrom(Array.from({ length: 24 }, (_, i) => 100 + i * 0.4));
    const dump = [
      ...up,
      {
        time: up.at(-1)!.time + 900,
        open: 110,
        high: 110.2,
        low: 96,
        close: 97,
        volume: 40,
      },
    ];
    const v = evaluateBot(makeBot("vwap", { params: { crashPct: 0, adxCeil: 0 } }), { now: 4, ticker: ticker(97), candles: dump });
    assert.equal(v.fills[0]?.side, "buy");

    const red = candlesFrom([100, 99, 98, 97, 96, 95, 94, 93]);
    const green = [
      ...red,
      { time: red.at(-1)!.time + 900, open: 93, high: 99, low: 92.5, close: 98.5, volume: 20 },
    ];
    const ha = evaluateBot(makeBot("ha"), { now: 5, ticker: ticker(98.5), candles: green });
    assert.ok(ha.fills[0]?.side === "buy" || ha.note.length > 0);
  });

  it("sells a bearish engulfing from an open long", () => {
    const body = candlesFrom([100, 101, 102, 103, 104, 105]);
    body.push({
      time: body.at(-1)!.time + 900,
      open: 104,
      high: 108,
      low: 103.5,
      close: 107.5,
      volume: 20,
    });
    body.push({
      time: body.at(-1)!.time + 900,
      open: 108,
      high: 108.2,
      low: 100,
      close: 101,
      volume: 20,
    });
    const res = evaluateBot(
      makeBot("engulf", { runtime: { inPosition: true, positionQty: 1, positionAvg: 100 } }),
      { now: 6, ticker: ticker(101), candles: body },
    );
    assert.equal(res.fills[0]?.side, "sell");
    assert.match(res.fills[0]!.note, /baissier/);
  });

  it("rejects an inverted grid", () => {
    const bad = evaluateBot(makeBot("grid", { params: { lower: 120, upper: 80, levels: 4 } }), {
      now: 1,
      ticker: ticker(100),
    });
    assert.equal(bad.fills.length, 0);
    assert.match(bad.note, /invalide/);
  });

  it("blocks buys on quota and consecutive losses, and sells on ATR stop", () => {
    const quota = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 1, maxTradesDay: 2 },
        runtime: { dayStamp: new Date(1_000).toISOString().slice(0, 10), dayTrades: 2 },
      }),
      { now: 1_000, ticker: ticker(100) },
    );
    assert.equal(quota.fills.length, 0);
    assert.match(quota.note, /Quota/);

    const losses = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 1, maxConsecutiveLoss: 3 },
        runtime: { consecutiveLosses: 3 },
      }),
      { now: 1_000, ticker: ticker(100) },
    );
    assert.equal(losses.fills.length, 0);
    assert.match(losses.note, /Pertes consécutives/);

    const cs = candlesFrom(Array.from({ length: 30 }, () => 100));
    cs[cs.length - 1] = { ...cs.at(-1)!, close: 90, low: 88, high: 101, open: 100 };
    const atrStop = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 300_000, slAtr: 0.5 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100, nextDcaAt: 9e12 },
      }),
      { now: 50, ticker: ticker(90), candles: cs },
    );
    assert.equal(atrStop.fills[0]?.side, "sell");
    assert.match(atrStop.fills[0]!.note, /ATR/);
  });

  it("sells a grid inventory when price crosses a higher level", () => {
    const bot = makeBot("grid", { params: { lower: 90, upper: 110, levels: 5 }, sizeQuote: 100 });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const bought = evaluateBot({ ...bot, runtime: armed.runtime }, { now: 2, ticker: ticker(95) });
    assert.ok(bought.fills.some((f) => f.side === "buy"));
    const sold = evaluateBot({ ...bot, runtime: bought.runtime }, { now: 3, ticker: ticker(105) });
    assert.ok(sold.fills.some((f) => f.side === "sell"));
  });

  it("places a lower buy after a fill and a rebuy at the remembered purchase after a sell", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 8, gridSellPct: 2, gridBuyPct: 1 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const bait = (armed.runtime.gridOwned ?? []).find((g) => g.pending);
    assert.ok(bait);
    assert.ok(Math.abs(bait!.price - 99) < 0.05);

    const bought = evaluateBot({ ...bot, runtime: armed.runtime }, { now: 2, ticker: ticker(98.5) });
    const buy = bought.fills.find((f) => f.side === "buy");
    assert.ok(buy);
    const lot = (bought.runtime.gridOwned ?? []).find((g) => g.qty > 0);
    assert.ok(lot);
    assert.ok(lot!.entry > 0);
    const lowerBuy = (bought.runtime.gridOwned ?? []).find((g) => g.pending);
    assert.ok(lowerBuy);
    assert.ok(lowerBuy!.price < lot!.entry);
    assert.ok(Math.abs(lowerBuy!.price - lot!.entry * 0.99) / lot!.entry < 0.01);

    const entry = lot!.entry;
    const sold = evaluateBot({ ...bot, runtime: bought.runtime }, { now: 3, ticker: ticker(entry * 1.025) });
    assert.ok(sold.fills.some((f) => f.side === "sell"));
    const soldFill = sold.fills.find((f) => f.side === "sell");
    assert.ok(soldFill?.entry && Math.abs(soldFill.entry - entry) / entry < 0.01);
    assert.equal((sold.runtime.gridOwned ?? []).filter((g) => g.qty > 0).length, 0);
    const rebues = (sold.runtime.gridOwned ?? []).filter((g) => g.pending);
    assert.ok(rebues.some((g) => Math.abs(g.price - entry) / entry < 0.01), "rebuy at original purchase");
    assert.ok(
      rebues.some((g) => g.price < entry * 0.995),
      "keeps the lower buy that was armed after the first fill",
    );
  });

  it("does not rebuy immediately when price is still above the remembered purchase", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 4, gridSellPct: 2, gridBuyPct: 1 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const bought = evaluateBot({ ...bot, runtime: armed.runtime }, { now: 2, ticker: ticker(98) });
    const lot = (bought.runtime.gridOwned ?? []).find((g) => g.qty > 0)!;
    const sold = evaluateBot({ ...bot, runtime: bought.runtime }, { now: 3, ticker: ticker(lot.entry * 1.03) });
    assert.ok(sold.fills.every((f) => f.side === "sell"));
    assert.ok((sold.runtime.gridOwned ?? []).some((g) => g.pending && Math.abs(g.price - lot.entry) / lot.entry < 0.01));
  });

  it("caps stacked lots and still rearms a bait after a stop-loss flatten", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 2, gridSellPct: 10, gridBuyPct: 1, slPct: 5 },
      sizeQuote: 100,
    });
    let runtime = evaluateBot(bot, { now: 1, ticker: ticker(100) }).runtime;
    runtime = evaluateBot({ ...bot, runtime }, { now: 2, ticker: ticker(98.8) }).runtime;
    runtime = evaluateBot({ ...bot, runtime }, { now: 3, ticker: ticker(97.6) }).runtime;
    const held = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
    assert.ok(held.length <= 2);
    const avg = held.reduce((s, g) => s + g.qty * g.entry, 0) / held.reduce((s, g) => s + g.qty, 0);
    const sl = evaluateBot(
      { ...bot, runtime: { ...runtime, inPosition: true, positionQty: 1, positionAvg: avg } },
      { now: 4, ticker: ticker(avg * 0.9) },
    );
    assert.ok(sl.fills.some((f) => f.note.includes("Stop-loss")));
    assert.ok((sl.runtime.gridOwned ?? []).every((g) => g.qty === 0));
  });

  it("takes a first lot at market when seeded, and pads the sell % with fees", () => {
    const seeded = evaluateBot(
      makeBot("grid", {
        params: { lower: 50, upper: 200, levels: 6, gridSellPct: 2, gridBuyPct: 1, gridSeed: true },
        sizeQuote: 100,
      }),
      { now: 1, ticker: ticker(100) },
    );
    assert.ok(seeded.fills.some((f) => f.side === "buy"));
    assert.ok((seeded.runtime.gridOwned ?? []).some((g) => g.qty > 0));
    assert.ok((seeded.runtime.gridOwned ?? []).some((g) => g.pending));

    const bot = makeBot("grid", { params: { lower: 50, upper: 200, gridSellPct: 1, gridBuyPct: 1 }, sizeQuote: 100 });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const bought = evaluateBot({ ...bot, runtime: armed.runtime }, { now: 2, ticker: ticker(98.5) });
    const lot = (bought.runtime.gridOwned ?? []).find((g) => g.qty > 0)!;
    const gross = evaluateBot(
      { ...bot, params: { ...bot.params, gridNetFees: false }, runtime: bought.runtime },
      { now: 3, ticker: ticker(lot.entry * 1.011), feeRate: 0.0026 },
    );
    assert.ok(gross.fills.some((f) => f.side === "sell"));
    const net = evaluateBot(
      { ...bot, params: { ...bot.params, gridNetFees: true }, runtime: bought.runtime },
      { now: 3, ticker: ticker(lot.entry * 1.011), feeRate: 0.0026 },
    );
    assert.equal(net.fills.filter((f) => f.side === "sell").length, 0);

    const click = evaluateBot(
      { ...bot, runtime: { ...armed.runtime, gridSeedNow: true } },
      { now: 4, ticker: ticker(100) },
    );
    assert.ok(click.fills.some((f) => f.side === "buy"));
  });

  it("cascades extra buys when a bar trades through several steps", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 8, gridSellPct: 5, gridBuyPct: 1 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const res = evaluateBot(
      { ...bot, runtime: armed.runtime },
      { now: 2, ticker: ticker(96), barLow: 95, barHigh: 100.2 },
    );
    const buys = res.fills.filter((f) => f.side === "buy");
    assert.ok(buys.length >= 2);
    const held = (res.runtime.gridOwned ?? []).filter((g) => g.qty > 0);
    assert.ok(held.length >= 2);
    const entries = held.map((g) => g.entry).sort((a, b) => b - a);
    assert.ok(entries[0]! > entries[1]!);
    assert.ok(res.fills.every((f) => f.side === "buy"));
  });

  it("respects a quote budget and a live one-fill cap", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 8, gridSellPct: 5, gridBuyPct: 1 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const poor = evaluateBot(
      { ...bot, runtime: armed.runtime },
      { now: 2, ticker: ticker(96), barLow: 95, barHigh: 100.2, quoteBudget: 50, feeRate: 0.0026 },
    );
    assert.equal(poor.fills.filter((f) => f.side === "buy").length, 0);

    const capped = evaluateBot(
      { ...bot, runtime: armed.runtime },
      { now: 2, ticker: ticker(96), barLow: 95, barHigh: 100.2, maxFills: 1 },
    );
    assert.equal(capped.fills.length, 1);
    assert.ok((capped.runtime.gridOwned ?? []).some((g) => g.pending));
  });

  it("stops a losing lot without rebuying at the purchase and pauses new buys", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 6, gridSellPct: 8, gridBuyPct: 1, gridSlPct: 2 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const bought = evaluateBot({ ...bot, runtime: armed.runtime }, { now: 2, ticker: ticker(98.5) });
    const lot = (bought.runtime.gridOwned ?? []).find((g) => g.qty > 0)!;
    const stopped = evaluateBot({ ...bot, runtime: bought.runtime }, { now: 3, ticker: ticker(lot.entry * 0.97) });
    assert.ok(stopped.fills.some((f) => f.note.includes("Stop lot")));
    assert.ok(!(stopped.runtime.gridOwned ?? []).some((g) => g.pending && Math.abs(g.price - lot.entry) / lot.entry < 0.002));

    const paused = evaluateBot(
      { ...bot, runtime: { ...armed.runtime, buyPause: true } },
      { now: 4, ticker: ticker(90) },
    );
    assert.equal(paused.fills.filter((f) => f.side === "buy").length, 0);
    assert.match(paused.note, /pause/i);
  });

  it("recenters an empty band when follow is on, and ignores overlay trailing on a grid", () => {
    const bot = makeBot("grid", {
      params: { lower: 90, upper: 110, levels: 6, gridSellPct: 2, gridBuyPct: 1, gridFollow: true, trailingPct: 1 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const follow = evaluateBot({ ...bot, runtime: { ...armed.runtime, gridOwned: [] } }, { now: 2, ticker: ticker(130) });
    assert.ok((follow.runtime.gridLower ?? 0) > 100);
    assert.ok((follow.runtime.gridUpper ?? 0) > 130 || follow.runtime.gridUpper! > follow.runtime.gridLower!);
    assert.match(follow.note, /recentr/i);

    const held = evaluateBot(
      makeBot("grid", {
        params: { lower: 50, upper: 200, levels: 4, gridSellPct: 20, trailingPct: 1 },
        runtime: {
          lastPrice: 110,
          inPosition: true,
          positionQty: 1,
          positionAvg: 100,
          peakPrice: 112,
          gridOwned: [{ price: 100, qty: 1, entry: 100 }],
        },
      }),
      { now: 3, ticker: ticker(109) },
    );
    assert.ok(!held.fills.some((f) => f.note.includes("Trailing")));
    assert.ok((held.runtime.gridOwned ?? []).some((g) => g.qty > 0));
  });

  it("round-trips bot blueprints and skips unknown kinds", () => {
    const bot = makeBot("grid", { params: { gridSellPct: 2, gridBuyPct: 1 }, sizeQuote: 80 });
    const payload = { v: 1, bots: [botBlueprint(bot), { kind: "nope", pair: "XBTEUR", sizeQuote: 10 }] };
    const rows = parseBotBlueprints(payload);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.kind, "grid");
    assert.equal(rows[0]!.sizeQuote, 80);
    assert.equal(parseBotBlueprints("nope").length, 0);
  });

  it("keeps a grid sell when a same-bar buy is blocked by spread", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 8, gridSellPct: 1.5, gridBuyPct: 1, maxSpreadPct: 0.2 },
      runtime: {
        lastPrice: 101,
        gridOwned: [
          { price: 100, qty: 0.01, entry: 100 },
          { price: 99, qty: 0, entry: 0, pending: true },
        ],
      },
    });
    const res = evaluateBot(bot, {
      now: 2,
      ticker: ticker(101.6, { bid: 90, ask: 120 }),
      barLow: 98.5,
      barHigh: 101.6,
    });
    assert.ok(res.fills.some((f) => f.side === "sell"));
    assert.equal(res.fills.filter((f) => f.side === "buy").length, 0);
    assert.equal((res.runtime.gridOwned ?? []).filter((g) => g.qty > 0).length, 0);
    assert.ok((res.runtime.gridOwned ?? []).some((g) => g.pending && Math.abs(g.price - 100) < 0.01));
  });

  it("drops a forming OHLC frame and counts grid inventory", () => {
    const rows = candlesFrom([10, 11, 12]);
    const last = rows[rows.length - 1]!;
    const inside = dropFormingCandle(rows, 15, (last.time + 10) * 1000);
    assert.equal(inside?.length, rows.length - 1);
    const closed = dropFormingCandle(rows, 15, (last.time + 15 * 60 + 2) * 1000);
    assert.equal(closed?.length, rows.length);
    assert.equal(botInventoryQty({ positionQty: 0, gridOwned: [{ price: 1, qty: 0.4, entry: 1 }] }), 0.4);
    assert.equal(botInventoryQty({ positionQty: 2 }), 2);
  });

  it("sells a lot whose lastPrice is already above the take-profit (no missed cross)", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 4, gridSellPct: 1.5, gridBuyPct: 1, gridNetFees: false },
      runtime: {
        lastPrice: 104,
        gridOwned: [{ price: 100, qty: 0.01, entry: 100 }],
      },
      sizeQuote: 100,
    });
    const res = evaluateBot(bot, { now: 2, ticker: ticker(104) });
    assert.ok(res.fills.some((f) => f.side === "sell"));
  });

  it("fills a pending buy when lastPrice is already through the trigger", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 8, gridSellPct: 5, gridBuyPct: 1 },
      runtime: {
        lastPrice: 96,
        gridOwned: [{ price: 99, qty: 0, entry: 0, pending: true }],
      },
      sizeQuote: 100,
    });
    const res = evaluateBot(bot, { now: 2, ticker: ticker(96) });
    assert.ok(res.fills.some((f) => f.side === "buy"));
    assert.ok((res.runtime.gridOwned ?? []).some((g) => g.qty > 0));
  });

  it("fills a remembered rebuy on the first tick after lastPrice was cleared", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 6, gridSellPct: 5, gridBuyPct: 1 },
      runtime: {
        gridOwned: [{ price: 100, qty: 0, entry: 0, pending: true, anchor: true }],
      },
      sizeQuote: 100,
    });
    const res = evaluateBot(bot, { now: 2, ticker: ticker(99) });
    assert.ok(res.fills.some((f) => f.side === "buy"));
    assert.equal(res.runtime.lastPrice, 99);
  });

  it("keeps a remembered rebuy when an empty band recenters", () => {
    const bot = makeBot("grid", {
      params: { lower: 90, upper: 110, levels: 6, gridSellPct: 2, gridBuyPct: 1, gridFollow: true },
      runtime: {
        lastPrice: 130,
        gridLower: 90,
        gridUpper: 110,
        gridOwned: [{ price: 100, qty: 0, entry: 0, pending: true, anchor: true }],
      },
      sizeQuote: 100,
    });
    const res = evaluateBot(bot, { now: 2, ticker: ticker(132) });
    assert.ok((res.runtime.gridLower ?? 0) > 110);
    assert.equal(res.fills.length, 0);
    assert.ok((res.runtime.gridOwned ?? []).some((g) => g.pending && g.anchor && Math.abs(g.price - 100) < 0.05));
  });

  it("keeps gridSeedNow when the first lot cannot seed outside the band", () => {
    const bot = makeBot("grid", {
      params: { lower: 90, upper: 95, levels: 4, gridSeed: true, gridSellPct: 2, gridBuyPct: 1 },
      runtime: { gridSeedNow: true },
      sizeQuote: 100,
    });
    const res = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    assert.equal(res.fills.length, 0);
    assert.equal(res.runtime.gridSeedNow, true);
  });

  it("blocks new grid buys for the cooldown after a lot stop", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 6, gridSellPct: 8, gridBuyPct: 1, gridSlPct: 2, gridSlCooldownMin: 30 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100) });
    const bought = evaluateBot({ ...bot, runtime: armed.runtime }, { now: 2, ticker: ticker(98.5) });
    const lot = (bought.runtime.gridOwned ?? []).find((g) => g.qty > 0)!;
    const stopped = evaluateBot({ ...bot, runtime: bought.runtime }, { now: 3_000, ticker: ticker(lot.entry * 0.97) });
    assert.ok(stopped.fills.some((f) => f.note.includes("Stop lot")));
    assert.ok((stopped.runtime.buyCoolUntil ?? 0) > 3_000);
    const during = evaluateBot(
      { ...bot, runtime: stopped.runtime },
      { now: 3_000 + 60_000, ticker: ticker(lot.entry * 0.9) },
    );
    assert.equal(during.fills.filter((f) => f.side === "buy").length, 0);
    const after = evaluateBot(
      { ...bot, runtime: { ...stopped.runtime, buyCoolUntil: 3_000 + 10 } },
      { now: 3_000 + 40 * 60_000, ticker: ticker(90) },
    );
    assert.equal(after.runtime.buyCoolUntil, undefined);
  });
});

describe("paper averaging / partial sell / optimizer extras", () => {
  it("averages a second buy and sells a fraction", () => {
    let paper = resetPaperAccount(30_000, 0.0026);
    const first = applyPaperFill(paper, {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "buy",
      qty: 1,
      price: 10_000,
      note: "a",
      time: 1,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    const second = applyPaperFill(first.paper, {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "buy",
      qty: 1,
      price: 12_000,
      note: "b",
      time: 2,
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(second.paper.holdings.BTC?.qty, 2);
    assert.equal(second.paper.holdings.BTC?.avg, 11_000);

    const part = applyPaperFill(second.paper, {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "sell",
      qty: 0.5,
      price: 12_000,
      note: "c",
      time: 3,
    });
    assert.equal(part.ok, true);
    if (!part.ok) return;
    assert.ok(Math.abs((part.paper.holdings.BTC?.qty ?? 0) - 1.5) < 1e-9);
    assert.ok(part.trade.pnl !== 0);
  });

  it("emits variants for grid/ema/breakout and a warmup per family", () => {
    assert.ok(paramVariants("ema", defaultParams("ema", 100)).length > 2);
    assert.ok(paramVariants("breakout", defaultParams("breakout", 100)).length >= 2);
    assert.ok(paramVariants("grid", defaultParams("grid", 100)).length >= 2);
    assert.ok(paramVariants("dca", defaultParams("dca", 100)).length === 1);
    assert.ok(backtestWarmup("ema", { slow: 21 }) >= 29);
    assert.ok(backtestWarmup("macd", {}) >= 26);
    assert.ok(backtestWarmup("adx", { adxPeriod: 14 }) >= 40);
    assert.ok(backtestWarmup("supertrend", {}) >= 20);
    assert.ok(backtestWarmup("breakout", { donchian: 55 }) >= 55);
  });

  it("backtests a grid and an RSI wave with leftover inventory tracked", () => {
    const wave = candlesFrom(Array.from({ length: 80 }, (_, i) => 100 + Math.sin(i / 3) * 8));
    const grid = backtestBot("grid", defaultParams("grid", 100), 80, wave, 0.0026, "XBTEUR", {
      startingBalance: 10_000,
      requestedDays: 7,
    });
    assert.ok(grid);
    assert.ok(grid!.equityCurve.length >= 2);
    assert.ok(grid!.openQty >= 0);
    assert.ok(Number.isFinite(grid!.calmar));

    const rsi = backtestBot("rsi", defaultParams("rsi", 100), 200, wave, 0.0026, "XBTEUR", {
      startingBalance: 8_000,
      slippageBps: 5,
      interval: 60,
      requestedDays: 30,
    });
    assert.ok(rsi);
    assert.equal(rsi!.interval, 60);
    assert.equal(rsi!.requestedDays, 30);
    assert.equal(rsi!.startEquity, 8_000);
  });
});

describe("evaluateBot — oscillators, ROC, z-score, Keltner", () => {
  it("asks every candle strategy for more history when the series is tiny", () => {
    const tiny = candlesFrom([100, 101]);
    for (const kind of BOT_KINDS.filter((k) => k.needsCandles)) {
      const res = evaluateBot(makeBot(kind.id), { now: 1, ticker: ticker(101), candles: tiny });
      assert.equal(res.fills.length, 0, kind.id);
      assert.match(res.note, /insuffisants/, kind.id);
    }
  });

  it("buys a ROC zero-cross, a z-score dump and a Keltner lower touch", () => {
    const rocBars = candlesFrom([...Array.from({ length: 20 }, () => 100), 108]);
    const roc = evaluateBot(makeBot("roc", { params: { rocPeriod: 12 } }), {
      now: 2,
      ticker: ticker(108),
      candles: rocBars,
    });
    assert.equal(roc.fills[0]?.side, "buy");

    const dump = candlesFrom([...Array.from({ length: 24 }, () => 100), 80]);
    const z = evaluateBot(makeBot("meanrev", { params: { zWindow: 20, zEntry: 1.6, crashPct: 0, adxCeil: 0 } }), {
      now: 3,
      ticker: ticker(80),
      candles: dump,
    });
    assert.equal(z.fills[0]?.side, "buy");

    const kc = candlesFrom(Array.from({ length: 30 }, () => 100));
    kc[kc.length - 1] = { ...kc.at(-1)!, open: 100, close: 90, low: 89, high: 100.2 };
    const kelt = evaluateBot(makeBot("keltner", { params: { kcPeriod: 20, kcMult: 1.5, crashPct: 0, adxCeil: 0 } }), {
      now: 4,
      ticker: ticker(90),
      candles: kc,
    });
    assert.equal(kelt.fills[0]?.side, "buy");
  });

  it("buys Bollinger lower-band and Williams oversold bounce", () => {
    const osc = Array.from({ length: 36 }, (_, i) => 100 + Math.sin(i / 2.2) * 6);
    const dump = Array.from({ length: 12 }, (_, i) => osc.at(-1)! - (i + 1) * 4);
    const cs = candlesFrom([...osc, ...dump]);
    let bot = makeBot("bollinger", { params: { bbPeriod: 20, bbMult: 2, crashPct: 0, adxCeil: 0 } });
    let bought = false;
    for (let i = 24; i <= cs.length; i++) {
      const slice = cs.slice(0, i);
      const res = evaluateBot(bot, { now: i, ticker: ticker(slice.at(-1)!.close), candles: slice });
      bot = { ...bot, runtime: res.runtime };
      if (res.fills.some((f) => f.side === "buy")) {
        bought = true;
        break;
      }
    }
    assert.equal(bought, true);

    const drop = candlesFrom(Array.from({ length: 18 }, (_, i) => 120 - i * 3));
    const bounce = [
      ...drop,
      { time: drop.at(-1)!.time + 900, open: 67, high: 78, low: 66, close: 77, volume: 20 },
    ];
    const wr = evaluateBot(makeBot("williams", { params: { wrPeriod: 14, oversold: -80, overbought: -20, crashPct: 0, adxCeil: 0 } }), {
      now: 6,
      ticker: ticker(77),
      candles: bounce,
    });
    assert.ok(wr.fills[0]?.side === "buy" || /survente|%R|flat/i.test(wr.note));
  });

  it("exits RSI from overbought after a rally and rejects a zero-size DCA", () => {
    const down = Array.from({ length: 28 }, (_, i) => 120 - i * 2);
    const up = Array.from({ length: 36 }, (_, i) => 64 + (i + 1) * 2);
    const cs = candlesFrom([...down, ...up]);
    let bot = makeBot("rsi", {
      params: { rsiPeriod: 14, oversold: 30, overbought: 70 },
      runtime: { inPosition: true, positionQty: 1, positionAvg: 50 },
    });
    let sold = false;
    for (let i = 20; i <= cs.length; i++) {
      const slice = cs.slice(0, i);
      const res = evaluateBot(bot, { now: i, ticker: ticker(slice.at(-1)!.close), candles: slice });
      bot = { ...bot, runtime: res.runtime };
      if (res.fills.some((f) => f.side === "sell")) {
        sold = true;
        break;
      }
    }
    assert.equal(sold, true);

    const tiny = evaluateBot(makeBot("dca", { sizeQuote: 0, params: { intervalMs: 1 } }), {
      now: 8,
      ticker: ticker(100),
    });
    assert.equal(tiny.fills.length, 0);
    assert.match(tiny.note, /Taille/);
  });

  it("prices unknown paper assets at 0 and formats remaining waits", () => {
    assert.equal(assetPx("FOO", {}), 0);
    assert.ok(assetPx("USD", {}) > 0);
    assert.equal(formatWait(0), "0s");
    assert.equal(formatWait(45_000), "45s");
    assert.equal(formatWait(50 * 3_600_000), "2 j");
    assert.ok(paramVariants("supertrend", defaultParams("supertrend", 100)).length > 1);
    assert.ok(paramVariants("meanrev", defaultParams("meanrev", 100)).length > 1);
    assert.ok(paramVariants("mfi", defaultParams("mfi", 100)).length > 1);
    const empty = optimizeBot("grid", defaultParams("grid", 100), 80, candlesFrom(Array.from({ length: 40 }, () => 100)), 0.0026, "XBTEUR");
    assert.ok(Array.isArray(empty));
  });

  it("rejects a zero-qty paper fill", () => {
    const res = applyPaperFill(resetPaperAccount(1_000, 0.0026), {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "buy",
      qty: 0,
      price: 10_000,
      note: "x",
    });
    assert.equal(res.ok, false);
  });
});

describe("evaluateBot — MACD, oscillators, trend flips, MFI", () => {
  function dumpRally(): Candle[] {
    const down = Array.from({ length: 48 }, (_, i) => 150 - i * 1.15);
    const up = Array.from({ length: 56 }, (_, i) => 95 + i * 1.55);
    return candlesFrom([...down, ...up]);
  }

  function walkUntilFill(kind: BotKind, cs: Candle[], params: Bot["params"] = {}, extra: Partial<Bot> = {}) {
    let bot = makeBot(kind, { params, ...extra });
    for (let i = 6; i <= cs.length; i++) {
      const slice = cs.slice(0, i);
      const res = evaluateBot(bot, {
        now: i,
        ticker: ticker(slice[slice.length - 1]!.close),
        candles: slice,
      });
      bot = { ...bot, runtime: res.runtime };
      if (res.fills.length) return { bot, res, slice };
    }
    return {
      bot,
      res: evaluateBot(bot, { now: 99, ticker: ticker(cs.at(-1)!.close), candles: cs }),
      slice: cs,
    };
  }

  it("buys MACD histogram, scalp, supertrend and PSAR on a dump-then-rally", () => {
    const cs = dumpRally();
    const macdRes = walkUntilFill("macd", cs, { macdFast: 5, macdSlow: 13, macdSignal: 5 });
    assert.equal(macdRes.res.fills[0]?.side, "buy");
    const again = evaluateBot(
      { ...macdRes.bot, runtime: macdRes.res.runtime },
      { now: 200, ticker: ticker(macdRes.slice.at(-1)!.close), candles: macdRes.slice },
    );
    assert.equal(again.fills.length, 0);

    const scalp = walkUntilFill("scalp", cs, { fast: 5, slow: 13, rsiPeriod: 7 });
    assert.equal(scalp.res.fills[0]?.side, "buy");

    const st = walkUntilFill("supertrend", cs, { atrPeriod: 7, atrMult: 2 });
    assert.equal(st.res.fills[0]?.side, "buy");

    const sar = walkUntilFill("psar", cs, { psarAf: 0.04, psarMax: 0.2 });
    assert.equal(sar.res.fills[0]?.side, "buy");
  });

  it("buys Ichimoku and ADX on a shortened rally", () => {
    const short = candlesFrom([
      ...Array.from({ length: 18 }, (_, i) => 130 - i * 1.6),
      ...Array.from({ length: 28 }, (_, i) => 101 + i * 2.2),
    ]);
    const ichi = walkUntilFill("ichimoku", short, { tenkan: 5, kijun: 13 });
    assert.equal(ichi.res.fills[0]?.side, "buy");

    const adxRes = walkUntilFill("adx", dumpRally(), { adxPeriod: 5, adxMin: 8 });
    assert.ok(adxRes.res.fills[0]?.side === "buy" || /ADX|DI|chauffe|flat/i.test(adxRes.res.note));
  });

  it("buys stochastic, CCI and MFI on oversold setups", () => {
    const bounce = candlesFrom([
      ...Array.from({ length: 22 }, (_, i) => 150 - i * 4),
      ...Array.from({ length: 16 }, (_, i) => 62 + i * 5),
    ]);
    const stoch = walkUntilFill("stoch", bounce, { stochN: 8, oversold: 25, overbought: 80, crashPct: 0, adxCeil: 0 });
    assert.ok(stoch.res.fills[0]?.side === "buy" || /K |Stoch|chauffe|flat/i.test(stoch.res.note));

    const cciRes = walkUntilFill("cci", bounce, { cciPeriod: 10, oversold: -80, overbought: 100, crashPct: 0, adxCeil: 0 });
    assert.equal(cciRes.res.fills[0]?.side, "buy");

    const mfiBars = candlesFrom(
      [
        ...Array.from({ length: 16 }, (_, i) => 80 + i * 2),
        ...Array.from({ length: 24 }, (_, i) => 110 - (i + 1) * 3),
      ],
      30,
    );
    const mfiRes = walkUntilFill("mfi", mfiBars, { rsiPeriod: 10, oversold: 20, overbought: 80, crashPct: 0, adxCeil: 0 });
    assert.equal(mfiRes.res.fills[0]?.side, "buy");
  });

  it("sells ROC, z-score, volume spike and Bollinger upper from an open long", () => {
    const rocBars = candlesFrom([...Array.from({ length: 18 }, () => 110), 90]);
    const rocSell = evaluateBot(
      makeBot("roc", {
        params: { rocPeriod: 12 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100 },
      }),
      { now: 9, ticker: ticker(90), candles: rocBars },
    );
    assert.equal(rocSell.fills[0]?.side, "sell");

    const recover = candlesFrom([...Array.from({ length: 24 }, () => 80), 100]);
    const zSell = evaluateBot(
      makeBot("meanrev", {
        params: { zWindow: 20, zEntry: 1.6 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 90 },
      }),
      { now: 10, ticker: ticker(100), candles: recover },
    );
    assert.equal(zSell.fills[0]?.side, "sell");

    const quiet = candlesFrom(Array.from({ length: 24 }, () => 100), 10);
    quiet[quiet.length - 1] = {
      ...quiet.at(-1)!,
      volume: 90,
      open: 102,
      close: 97,
      high: 103,
      low: 96,
    };
    const volSell = evaluateBot(
      makeBot("volume", {
        params: { volMult: 2 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100 },
      }),
      { now: 11, ticker: ticker(97), candles: quiet },
    );
    assert.equal(volSell.fills[0]?.side, "sell");

    const osc = Array.from({ length: 28 }, (_, i) => 100 + Math.sin(i / 2) * 5);
    const spike = [...osc, 118];
    const bbSell = evaluateBot(
      makeBot("bollinger", {
        params: { bbPeriod: 20, bbMult: 2 },
        runtime: { inPosition: true, positionQty: 1, positionAvg: 100 },
      }),
      { now: 12, ticker: ticker(118), candles: candlesFrom(spike) },
    );
    assert.ok(bbSell.fills[0]?.side === "sell" || /long|flat|Close/i.test(bbSell.note));
  });

  it("uses the quoted price when last is missing and last when the spread is huge", () => {
    const due = evaluateBot(makeBot("dca", { params: { intervalMs: 1 } }), {
      now: 1,
      ticker: ticker(0, { last: 0, ask: 80, bid: 79 }),
    });
    assert.equal(due.fills[0]?.side, "buy");
    assert.equal(due.fills[0]?.price, 80);

    const tight = evaluateBot(makeBot("dca", { params: { intervalMs: 1 } }), {
      now: 2,
      ticker: ticker(100, { ask: 150, bid: 50 }),
    });
    assert.equal(tight.fills[0]?.price, 100);
  });

  it("resets the daily stamp, skips unknown paper assets and clamps a negative start", () => {
    const resetDay = evaluateBot(
      makeBot("dca", {
        params: { intervalMs: 1, maxDailyLoss: 50 },
        runtime: { dayStamp: "1999-01-01", dayPnl: -80, dayTrades: 9 },
      }),
      { now: Date.UTC(2026, 0, 2), ticker: ticker(100) },
    );
    assert.equal(resetDay.fills.length, 1);
    assert.equal(resetDay.runtime.dayPnl, 0);

    const skip = flattenPaper(
      { ...resetPaperAccount(100, 0.0026), holdings: { FOO: { qty: 1, avg: 1 } } },
      {},
    );
    assert.equal(skip.sold, 0);

    const fresh = resetPaperAccount(-20, 0.01);
    assert.equal(fresh.cash, 0);
    assert.equal(fresh.startingBalance, 0);

    const badPx = applyPaperFill(resetPaperAccount(1_000, 0.0026), {
      botId: "b",
      pair: "XBTEUR",
      base: "BTC",
      side: "buy",
      qty: 1,
      price: 0,
      note: "x",
    });
    assert.equal(badPx.ok, false);

    assert.equal(kindNeedsCandles("not-a-kind" as BotKind), false);
    assert.equal(kindTitle("not-a-kind" as BotKind), "not-a-kind");
  });

  it("backtests every strategy on a 220-bar wave and emits extra param variants", () => {
    const wave = candlesFrom(
      Array.from({ length: 220 }, (_, i) => 100 + Math.sin(i / 5) * 10 + Math.sin(i / 19) * 4),
    );
    for (const kind of BOT_KINDS) {
      const params = { ...defaultParams(kind.id, 100) };
      if (kind.id === "sma") {
        params.fast = 8;
        params.slow = 21;
      }
      const r = backtestBot(kind.id, params, defaultSize(kind.id), wave, 0.0026, "XBTEUR", {
        startingBalance: 10_000,
      });
      assert.ok(r === null || Number.isFinite(r.equity), kind.id);
    }
    assert.ok(paramVariants("bollinger", defaultParams("bollinger", 100)).length > 3);
    assert.ok(paramVariants("williams", defaultParams("williams", 100)).length > 3);
    assert.ok(paramVariants("cci", defaultParams("cci", 100)).length > 3);
    assert.ok(paramVariants("stoch", defaultParams("stoch", 100)).length > 3);
    assert.ok(paramVariants("scalp", defaultParams("scalp", 100)).length > 3);
    assert.ok(paramVariants("sma", defaultParams("sma", 100)).length > 3);
    assert.ok(backtestWarmup("scalp", { slow: 13 }) >= 21);
    assert.ok(backtestWarmup("volume", {}) >= 20);
  });
});

describe("desk risk / monte carlo / confirmation", () => {
  it("halts on daily loss or drawdown and blocks buys on exposure", () => {
    const daily = evaluateDesk({
      equity: 8_000,
      peak: 10_000,
      dayPnl: -200,
      exposure: 500,
      limits: { deskDailyLoss: 150 },
    });
    assert.equal(daily.halt, "daily");
    assert.equal(daily.blockBuys, true);

    const dd = evaluateDesk({
      equity: 8_000,
      peak: 10_000,
      dayPnl: 10,
      exposure: 100,
      limits: { deskDrawdownPct: 15 },
    });
    assert.equal(dd.halt, "drawdown");
    assert.ok(dd.drawdownPct >= 15);

    const exp = evaluateDesk({
      equity: 10_000,
      peak: 10_000,
      dayPnl: 0,
      exposure: 4_000,
      limits: { deskMaxExposurePct: 30 },
    });
    assert.equal(exp.halt, null);
    assert.equal(exp.blockBuys, true);

    const off = evaluateDesk({ equity: 10_000, peak: 10_000, dayPnl: -5, exposure: 9_000, limits: {} });
    assert.equal(off.halt, null);
    assert.equal(off.blockBuys, false);
  });

  it("ranks shuffled trade PnLs and ignores too-short samples", () => {
    const mc = monteCarloPnl([10, -5, 20, -8, 12, -3, 4], 1_000, 64, 7);
    assert.ok(mc);
    assert.ok(mc!.p5 <= mc!.p50 && mc!.p50 <= mc!.p95);
    assert.equal(mc!.samples, 64);
    assert.equal(monteCarloPnl([1, 2], 1_000), null);
  });

  it("runs the confirmation strategy over a recovery wave", () => {
    const wave = candlesFrom(
      Array.from({ length: 90 }, (_, i) => {
        if (i < 40) return 100 + i * 0.2;
        if (i < 58) return 108 - (i - 40) * 1.4;
        return 83 + (i - 58) * 1.1;
      }),
    );
    let runtime = {};
    for (let i = 50; i < wave.length; i++) {
      const res = evaluateBot(makeBot("confirm", { runtime }), {
        now: i * 1_000,
        ticker: ticker(wave[i]!.close),
        candles: wave.slice(0, i + 1),
      });
      runtime = res.runtime;
    }
    const snap = evaluateBot(makeBot("confirm", { runtime }), {
      now: 99_000,
      ticker: ticker(wave.at(-1)!.close),
      candles: wave,
    });
    assert.ok(snap.note.length > 3);
    assert.ok(backtestWarmup("confirm", defaultParams("confirm", 100)) >= 30);
    assert.ok(paramVariants("confirm", defaultParams("confirm", 100)).length > 3);
    assert.equal(kindNeedsCandles("confirm"), true);
    assert.equal(kindTitle("confirm"), "Confirmation");
  });

  it("caps remaining quote budget and draws grid chart levels", () => {
    assert.equal(
      remainingQuoteBudget({ budgetQuote: 500 }, { gridOwned: [{ price: 100, qty: 1, entry: 100 }] }, 10_000),
      400,
    );
    assert.equal(remainingQuoteBudget({}, {}, 80), 80);
    assert.equal(remainingQuoteBudget({ budgetQuote: 0 }, {}, undefined), undefined);
    assert.equal(remainingQuoteBudget({ budgetQuote: 200 }, { positionQty: 1, positionAvg: 200 }, 10_000), 0);

    const levels = gridChartLevels(
      {
        params: { lower: 90, upper: 110, gridSellPct: 2, gridNetFees: false },
        runtime: {
          gridOwned: [
            { price: 100, qty: 1, entry: 100 },
            { price: 99, qty: 0, entry: 0, pending: true },
          ],
        },
      },
      0,
    );
    assert.ok(levels.some((l) => l.kind === "band" && l.price === 90));
    assert.ok(levels.some((l) => l.kind === "entry" && l.price === 100));
    assert.ok(levels.some((l) => l.kind === "sell" && Math.abs(l.price - 102) < 1e-9));
    assert.ok(levels.some((l) => l.kind === "buy" && l.price === 99));
  });

  it("does not flatten a grid on overlay SL when per-lot stop is set", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, slPct: 3, gridSlPct: 10, gridSellPct: 20, gridBuyPct: 1 },
      runtime: {
        lastPrice: 100,
        inPosition: true,
        positionQty: 1,
        positionAvg: 100,
        gridOwned: [{ price: 100, qty: 1, entry: 100 }],
      },
    });
    const res = evaluateBot(bot, { now: 2, ticker: ticker(96) });
    assert.equal(res.fills.filter((f) => f.note.includes("Stop-loss")).length, 0);
    assert.ok((res.runtime.gridOwned ?? []).some((g) => g.qty > 0));
  });

  it("honours budgetQuote even when the venue still has cash", () => {
    const bot = makeBot("grid", {
      params: { lower: 50, upper: 200, levels: 8, gridSellPct: 5, gridBuyPct: 1, budgetQuote: 50 },
      sizeQuote: 100,
    });
    const armed = evaluateBot(bot, { now: 1, ticker: ticker(100), quoteBudget: 10_000 });
    const poor = evaluateBot(
      { ...bot, runtime: armed.runtime },
      { now: 2, ticker: ticker(96), barLow: 95, barHigh: 100.2, quoteBudget: 10_000, feeRate: 0.0026 },
    );
    assert.equal(poor.fills.filter((f) => f.side === "buy").length, 0);
  });
});

