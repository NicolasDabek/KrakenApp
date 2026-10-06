import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assetBoard, biasTone, marketSignal } from "./signals.ts";
import type { Ticker } from "./types.ts";

function ticker(id: string, last: number, extra: Partial<Ticker> = {}): Ticker {
  return {
    id,
    last,
    bid: last * 0.999,
    ask: last * 1.001,
    open: last,
    high: last * 1.04,
    low: last * 0.96,
    volume: 100,
    vwap: last,
    change: 0,
    changePct: 0,
    trades: 10,
    quoteVolume: last * 100,
    ...extra,
  };
}

describe("marketSignal", () => {
  it("waits when the ticker is missing", () => {
    const s = marketSignal(undefined);
    assert.equal(s.bias, "wait");
    assert.equal(s.label, "—");
    assert.equal(s.score, 0);
  });

  it("flags a buy when price is cheap vs VWAP, range and 24h drop", () => {
    const s = marketSignal(
      ticker("XBTEUR", 90, {
        vwap: 100,
        low: 89,
        high: 120,
        changePct: -3,
      }),
    );
    assert.equal(s.bias, "buy");
    assert.equal(s.label, "Acheter");
    assert.ok(s.score >= 2);
    assert.ok(s.reasons.includes("Sous la VWAP"));
    assert.ok(s.reasons.includes("Bas du range 24h"));
    assert.ok(s.reasons.includes("Pression vendeuse 24h"));
  });

  it("flags a sell on extension above VWAP and range", () => {
    const s = marketSignal(
      ticker("XBTEUR", 110, {
        vwap: 100,
        low: 80,
        high: 111,
        changePct: 4,
      }),
    );
    assert.equal(s.bias, "sell");
    assert.equal(s.label, "Vendre");
    assert.ok(s.score <= -2);
  });

  it("stays on wait for mixed signals and notes a wide spread", () => {
    const s = marketSignal(
      ticker("XBTEUR", 100, {
        bid: 99,
        ask: 101,
        vwap: 100,
        low: 90,
        high: 110,
        changePct: 0,
      }),
    );
    assert.equal(s.bias, "wait");
    assert.equal(s.label, "Attendre");
    assert.ok(s.reasons.includes("Spread large"));
  });

  it("maps bias to UI tones", () => {
    assert.equal(biasTone("buy"), "buy");
    assert.equal(biasTone("sell"), "sell");
    assert.equal(biasTone("wait"), "neutral");
  });
});

describe("assetBoard", () => {
  it("groups EUR and USD quotes per base and prefers EUR", () => {
    const board = assetBoard({
      XBTEUR: ticker("XBTEUR", 90_000, { quoteVolume: 5e8 }),
      XBTUSD: ticker("XBTUSD", 97_200, { quoteVolume: 9e8 }),
      SOLEUR: ticker("SOLEUR", 140, { quoteVolume: 1e7 }),
    });
    const btc = board.find((a) => a.base === "BTC");
    const sol = board.find((a) => a.base === "SOL");
    assert.ok(btc);
    assert.equal(btc!.pairId, "XBTEUR");
    assert.equal(btc!.lastEur, 90_000);
    assert.equal(btc!.lastUsd, 97_200);
    assert.ok(sol);
    assert.equal(sol!.lastEur, 140);
    assert.ok(sol!.lastUsd > 0);
    assert.ok(board[0]!.quoteVolume >= board[board.length - 1]!.quoteVolume);
  });

  it("treats a zero last as wait and still boards a USD-only asset", () => {
    const zero = marketSignal(ticker("XBTEUR", 0));
    assert.equal(zero.bias, "wait");
    assert.equal(zero.score, 0);
    const board = assetBoard({
      SOLUSD: ticker("SOLUSD", 140, { quoteVolume: 2e7 }),
    });
    const sol = board.find((a) => a.base === "SOL");
    assert.ok(sol);
    assert.equal(sol!.pairId, "SOLUSD");
    assert.ok(sol!.lastUsd > 0);
    assert.ok(sol!.lastEur > 0);
  });

  it("stays wait on a lone VWAP signal", () => {
    const s = marketSignal(
      ticker("ETHEUR", 99.8, {
        vwap: 100,
        low: 90,
        high: 110,
        changePct: 0,
        bid: 99.79,
        ask: 99.81,
      }),
    );
    assert.equal(s.bias, "wait");
    assert.ok(s.score <= 1);
    assert.ok(s.reasons.includes("Sous la VWAP"));
  });

  it("ignores a zero VWAP and a missing bid/ask", () => {
    const s = marketSignal(
      ticker("XBTEUR", 100, {
        vwap: 0,
        bid: 0,
        ask: 0,
        low: 90,
        high: 110,
        changePct: 0,
      }),
    );
    assert.equal(s.vsVwapPct, 0);
    assert.equal(s.spreadPct, 0);
    assert.equal(s.bias, "wait");
  });
});
