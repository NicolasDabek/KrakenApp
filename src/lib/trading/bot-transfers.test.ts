import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyStressScenario,
  allocateByPerformance,
  BOT_KINDS,
  botAllocScore,
  defaultParams,
  EMPTY_STATS,
  evaluateBot,
  gatedOptimizeBot,
  kindTitle,
  mtfIntervalsOf,
  resampleCandles,
  STRESS_SCENARIOS,
} from "./bots.ts";
import type { Bot, Candle, Ticker } from "./types.ts";

function ticker(last: number): Ticker {
  return {
    id: "XBTEUR",
    last,
    bid: last,
    ask: last,
    open: last,
    high: last,
    low: last,
    volume: 1,
    vwap: last,
    change: 0,
    changePct: 0,
    trades: 0,
    quoteVolume: 0,
  };
}

function makeBot(kind: Bot["kind"], extra: Partial<Bot> = {}): Bot {
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

describe("Bot transfers", () => {
  it("registers mtf in the catalog", () => {
    assert.equal(BOT_KINDS.length, 28);
    assert.equal(kindTitle("mtf"), "Multi-TF RSI");
  });

  it("lists distinct mtf intervals and resamples higher TF", () => {
    const bot = makeBot("mtf", { interval: 15, params: defaultParams("mtf", 100) });
    assert.deepEqual(mtfIntervalsOf(bot), [15, 60, 240]);
    const base: Candle[] = Array.from({ length: 120 }, (_, i) => ({
      time: i * 900,
      open: 100,
      high: 101,
      low: 99,
      close: 100 + (i % 7) * 0.1,
      volume: 1,
    }));
    const hourly = resampleCandles(base, 15, 60);
    assert.ok(hourly.length < base.length);
    assert.ok(hourly.length >= 20);
  });

  it("evaluates mtf with multiCandles", () => {
    const base: Candle[] = Array.from({ length: 80 }, (_, i) => {
      const close = 100 + Math.sin(i / 6) * 2;
      return {
        time: 1_700_000_000 + i * 60,
        open: close,
        high: close + 0.5,
        low: close - 0.5,
        close,
        volume: 10,
      };
    });
    const bot = makeBot("mtf", {
      interval: 15,
      params: { ...defaultParams("mtf", 100), mtfMode: "majority", mtfIntervals: [60, 240] },
    });
    const res = evaluateBot(bot, {
      now: Date.now(),
      ticker: ticker(base.at(-1)!.close),
      candles: base,
      multiCandles: {
        15: base,
        60: resampleCandles(base, 15, 60),
        240: resampleCandles(base, 15, 240),
      },
      equity: 10_000,
    });
    assert.ok(res.note.length > 0);
  });

  it("applies stress scenarios on candle copies", () => {
    const candles: Candle[] = Array.from({ length: 50 }, (_, i) => ({
      time: i,
      open: 100,
      high: 101,
      low: 99,
      close: 100,
      volume: 1,
    }));
    const crash = applyStressScenario(candles, "crash");
    assert.notEqual(
      crash[Math.floor(crash.length * 0.7)]!.close,
      candles[Math.floor(candles.length * 0.7)]!.close,
    );
    assert.equal(candles[Math.floor(candles.length * 0.7)]!.close, 100);
    assert.equal(STRESS_SCENARIOS.length, 3);
  });

  it("renormalizes allocation weights after min/max clamps", () => {
    const rows = allocateByPerformance(
      [
        { id: "a", score: 100, sizeQuote: 100 },
        { id: "b", score: 1, sizeQuote: 100 },
        { id: "c", score: 1, sizeQuote: 100 },
      ],
      { min: 0.2, max: 0.5 },
    );
    const sum = rows.reduce((s, r) => s + r.weight, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9);
    for (const r of rows) {
      assert.ok(r.weight >= 0.2 - 1e-9);
      assert.ok(r.weight <= 0.5 + 1e-9);
    }
  });

  it("scores bots and rejects gated optimize on short history", () => {
    const bot = makeBot("rsi", { stats: { ...EMPTY_STATS, realizedPnl: 12, closes: 4, wins: 3 } });
    assert.ok(botAllocScore(bot) > 0);
    const short: Candle[] = Array.from({ length: 20 }, (_, i) => ({
      time: i * 900,
      open: 100,
      high: 101,
      low: 99,
      close: 100,
      volume: 1,
    }));
    const gated = gatedOptimizeBot("rsi", defaultParams("rsi", 100), 200, short, 0.0026, "XBTEUR");
    assert.equal(gated.ok, false);
  });
});
