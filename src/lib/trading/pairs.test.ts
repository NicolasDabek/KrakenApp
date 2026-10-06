import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PAIR,
  EUR_PAIRS,
  INTERVALS,
  KRAKEN_OHLC_MAX_BARS,
  PAIR_BY_ID,
  PAIR_BY_RESULT,
  PAIR_UNIVERSE,
  TICKER_QUERY,
  backtestFetchInterval,
  displayAsset,
  intervalLabel,
  pairForAssets,
  resolvePairId,
  toEurPair,
} from "./pairs.ts";

describe("pair universe", () => {
  it("defaults to BTC/EUR and lists only EUR pairs for bots", () => {
    assert.equal(DEFAULT_PAIR, "XBTEUR");
    assert.ok(EUR_PAIRS.length >= 20);
    assert.ok(EUR_PAIRS.every((p) => p.quote === "EUR"));
    assert.equal(PAIR_UNIVERSE.length, EUR_PAIRS.length * 2);
  });

  it("renames Kraken asset codes for display", () => {
    assert.equal(displayAsset("XXBT"), "BTC");
    assert.equal(displayAsset("XBT"), "BTC");
    assert.equal(displayAsset("XDG"), "DOGE");
    assert.equal(displayAsset("ZEUR"), "EUR");
    assert.equal(displayAsset("SOL"), "SOL");
  });

  it("resolves ids, result keys, ws names and BTC aliases", () => {
    assert.equal(resolvePairId("XBTEUR"), "XBTEUR");
    assert.equal(resolvePairId("XXBTZEUR"), "XBTEUR");
    assert.equal(resolvePairId("XBT/EUR"), "XBTEUR");
    assert.equal(resolvePairId("BTCEUR"), "XBTEUR");
    assert.equal(resolvePairId("BTC/EUR"), "XBTEUR");
    assert.equal(resolvePairId("unknown-pair"), undefined);
    assert.equal(resolvePairId(""), undefined);
  });

  it("maps any USD pair onto its EUR twin", () => {
    assert.equal(toEurPair("XBTUSD"), "XBTEUR");
    assert.equal(toEurPair("SOLEUR"), "SOLEUR");
    assert.equal(toEurPair("not-a-pair"), "XBTEUR");
  });
});

describe("pairForAssets / intervals", () => {
  it("picks the Kraken side for a conversion", () => {
    assert.deepEqual(pairForAssets("BTC", "EUR"), { pair: "XBTEUR", side: "sell" });
    assert.deepEqual(pairForAssets("EUR", "BTC"), { pair: "XBTEUR", side: "buy" });
    assert.deepEqual(pairForAssets("ETH", "EUR"), { pair: "ETHEUR", side: "sell" });
    assert.equal(pairForAssets("SOL", "ADA"), null);
  });

  it("labels intervals and coarsens backtests to fit ~720 Kraken bars", () => {
    assert.equal(KRAKEN_OHLC_MAX_BARS, 720);
    assert.equal(intervalLabel(15), "15m");
    assert.equal(intervalLabel(1440), "1j");
    assert.equal(intervalLabel(99), "99m");
    assert.equal(backtestFetchInterval(7, 15), 15);
    assert.equal(backtestFetchInterval(30, 15), 60);
    assert.equal(backtestFetchInterval(90, 15), 240);
    assert.equal(backtestFetchInterval(7, 60), 60);
    assert.ok(INTERVALS.some((i) => i.id === 15));
  });

  it("keeps PAIR_BY_ID in sync with the universe", () => {
    for (const p of PAIR_UNIVERSE) {
      assert.equal(PAIR_BY_ID[p.id], p);
      assert.ok(p.ordermin > 0);
      assert.ok(p.lotDecimals >= 0);
    }
  });

  it("indexes result keys and builds the ticker query", () => {
    assert.equal(PAIR_BY_RESULT.XXBTZEUR?.id, "XBTEUR");
    assert.equal(PAIR_BY_RESULT.SOLEUR?.id, "SOLEUR");
    assert.ok(TICKER_QUERY.includes("XBTEUR"));
    assert.ok(TICKER_QUERY.split(",").length === PAIR_UNIVERSE.length);
    assert.equal(resolvePairId("ETH/EUR"), "ETHEUR");
    assert.equal(resolvePairId("XETHZEUR"), "ETHEUR");
    assert.equal(intervalLabel(1), "1m");
    assert.equal(intervalLabel(60), "1h");
    assert.equal(intervalLabel(10080), "1s");
    assert.equal(backtestFetchInterval(1, 1), 5);
    assert.equal(pairForAssets("EUR", "ETH")?.side, "buy");
    assert.equal(displayAsset("ZUSD"), "USD");
  });

  it("resolves more aliases and coarsens a year-long backtest", () => {
    assert.equal(resolvePairId("sol/eur"), "SOLEUR");
    assert.equal(resolvePairId("SOL/EUR"), "SOLEUR");
    assert.equal(resolvePairId("XXBTZUSD"), "XBTUSD");
    assert.equal(toEurPair("ETHUSD"), "ETHEUR");
    assert.equal(toEurPair("unknown"), "XBTEUR");
    assert.equal(pairForAssets("BTC", "USD")?.pair, "XBTUSD");
    assert.equal(pairForAssets("USD", "BTC")?.side, "buy");
    assert.equal(backtestFetchInterval(365, 15), 1440);
    assert.equal(intervalLabel(30), "30m");
    assert.equal(intervalLabel(240), "4h");
  });

  it("rejects same-asset conversions and unknown interval labels stay in minutes", () => {
    assert.equal(pairForAssets("EUR", "EUR"), null);
    assert.equal(pairForAssets("BTC", "BTC"), null);
    assert.equal(pairForAssets("FOO", "BAR"), null);
    assert.equal(intervalLabel(5), "5m");
    assert.equal(resolvePairId(undefined), undefined);
    assert.equal(displayAsset("XXDG"), "DOGE");
    assert.equal(toEurPair("XBTEUR"), "XBTEUR");
  });
});
