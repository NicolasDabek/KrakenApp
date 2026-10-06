import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { getDepth, getOhlc, getOhlcHistory, getTickers, getTrades, parseTickers, pingKraken } from "./kraken.server.ts";

afterEach(() => {
  mock.restoreAll();
});

function rawTicker(last: string, open: string) {
  return {
    a: ["90100.1", "1", "1"],
    b: ["90000.1", "1", "1"],
    c: [last, "0.1"],
    v: ["10", "100"],
    p: ["89000", "89500"],
    t: [10, 200],
    l: ["88000", "87000"],
    h: ["91000", "92000"],
    o: open,
  };
}

describe("parseTickers", () => {
  it("maps Kraken result keys onto Nautilus pair ids", () => {
    const list = parseTickers({
      XXBTZEUR: rawTicker("90000", "88000"),
      SOLEUR: rawTicker("140.5", "130"),
      UNKNOWN: rawTicker("1", "1"),
    });
    const btc = list.find((t) => t.id === "XBTEUR");
    const sol = list.find((t) => t.id === "SOLEUR");
    assert.ok(btc);
    assert.equal(btc!.last, 90_000);
    assert.equal(btc!.open, 88_000);
    assert.ok(Math.abs(btc!.changePct - ((90_000 - 88_000) / 88_000) * 100) < 1e-9);
    assert.equal(btc!.quoteVolume, 100 * 89_500);
    assert.ok(sol);
    assert.equal(list.some((t) => t.id === "UNKNOWN"), false);
  });

  it("treats a zero open as a 0% change", () => {
    const list = parseTickers({ XXBTZEUR: rawTicker("90000", "0") });
    assert.equal(list[0]!.changePct, 0);
    assert.equal(list[0]!.change, 90_000);
  });
});

describe("public REST helpers", () => {
  it("parses a depth book with 500 levels requested", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      assert.match(String(url), /Depth\?pair=XBTEUR&count=500/);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          error: [],
          result: {
            XXBTZEUR: {
              bids: [
                ["99", "2", 1],
                ["98", "3", 1],
              ],
              asks: [
                ["101", "1", 1],
                ["102", "4", 1],
              ],
            },
          },
        }),
      } as Response;
    });
    const book = await getDepth("XBTEUR");
    assert.equal(book.bids[0]!.price, 99);
    assert.equal(book.bids[0]!.size, 2);
    assert.equal(book.bids[1]!.total, 5);
    assert.equal(book.asks[0]!.price, 101);
    assert.ok(book.spread > 0);
  });

  it("coarsens 90-day history to 4h bars to fit Kraken's 720-bar window", async () => {
    const now = Math.floor(Date.now() / 1000);
    const rows = Array.from({ length: 20 }, (_, i) => [
      now - (20 - i) * 14_400,
      "100",
      "101",
      "99",
      "100.5",
      "100.2",
      "12",
      "8",
    ]);
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      assert.match(String(url), /interval=240/);
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { XXBTZEUR: rows, last: now } }),
      } as Response;
    });
    const hist = await getOhlcHistory("XBTEUR", 15, now - 90 * 86_400, 90);
    assert.equal(hist.interval, 240);
    assert.ok(hist.candles.length >= 1);
    assert.ok(hist.candles[0]!.close > 0);
  });

  it("parses OHLC, trades and ping, and reuses the in-memory cache", async () => {
    const now = Math.floor(Date.now() / 1000);
    const ohlcRows = [
      [now - 120, "100", "101", "99", "100.5", "100.2", "12", "8"],
      [now - 60, "100.5", "102", "100", "101", "100.8", "9", "5"],
    ];
    let ohlcCalls = 0;
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/OHLC")) {
        ohlcCalls += 1;
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { XXBTZEUR: ohlcRows, last: now } }),
        } as Response;
      }
      if (u.includes("/Trades")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              XXBTZEUR: [
                ["90000", "0.1", now - 10, "b", "m", "", "T1"],
                ["90010", "0.2", now - 5, "s", "l", "", "T2"],
              ],
            },
          }),
        } as Response;
      }
      if (u.includes("/Time")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { unixtime: now } }),
        } as Response;
      }
      throw new Error(`unexpected ${u}`);
    });

    const candles = await getOhlc("ETHEUR", 15);
    assert.ok(candles.length >= 1);
    assert.equal(candles[0]!.open, 100);
    assert.equal(candles[0]!.volume, 12);
    await getOhlc("ETHEUR", 15);
    assert.equal(ohlcCalls, 1, "second OHLC hit should come from cache");

    const tape = await getTrades("ETHEUR");
    assert.equal(tape.length, 2);
    assert.equal(tape[0]!.side, "sell");
    assert.equal(tape[1]!.side, "buy");
    assert.equal(tape[0]!.id, "T2");

    const ping = await pingKraken();
    assert.equal(ping.ok, true);
    assert.ok(ping.ms >= 0);
  });

  it("returns an empty book when Kraken sends no levels", async () => {
    mock.method(globalThis, "fetch", async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { XXBTZEUR: { bids: [], asks: [] } } }),
      } as Response;
    });
    const book = await getDepth("SOLEUR");
    assert.deepEqual(book.bids, []);
    assert.deepEqual(book.asks, []);
    assert.equal(book.spread, 0);
  });

  it("fetches tickers and returns empty history when OHLC is empty", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/Ticker")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { XXBTZEUR: rawTicker("91000", "90000") } }),
        } as Response;
      }
      if (u.includes("/OHLC")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { XXBTZEUR: [], last: 1 } }),
        } as Response;
      }
      throw new Error(u);
    });
    const list = await getTickers();
    assert.ok(list.some((t) => t.id === "XBTEUR" && t.last === 91_000));
    const hist = await getOhlcHistory("XBTEUR", 15, 0, 7);
    assert.deepEqual(hist.candles, []);
    assert.equal(hist.interval, 15);
  });

  it("forwards since on OHLC and maps Kraken errors", async () => {
    let seen = "";
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      seen = String(url);
      if (seen.includes("NOPEEUR")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: ["EGeneral:Invalid pair"], result: {} }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          error: [],
          result: { XLTCZEUR: [[1_700_000_000, "80", "81", "79", "80.5", "80", "4", "2"]], last: 1_700_000_060 },
        }),
      } as Response;
    });
    const cs = await getOhlc("LTCEUR", 60, 1_699_000_000);
    assert.ok(seen.includes("since=1699000000"));
    assert.equal(cs[0]?.close, 80.5);
    await assert.rejects(() => getOhlc("NOPEEUR", 15), /Invalid pair|EGeneral/);
  });

  it("falls back to a valid OHLC interval", async () => {
    let seen = "";
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      seen = String(url);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          error: [],
          result: { XXBTZEUR: [[1_700_000_000, "100", "101", "99", "100", "100", "1", "1"]], last: 1_700_000_060 },
        }),
      } as Response;
    });
    await getOhlc("XBTEUR", 7);
    assert.ok(seen.includes("interval=60"), seen);
  });
});
