import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { handleV1, V1_CORS } from "./v1-handler.ts";

const SECRET = Buffer.from("nautilus-test-secret-material-32").toString("base64");
const KEY = "kraken-key-ok";

afterEach(() => {
  mock.restoreAll();
});

function req(method: string, path: string, opts: { keys?: boolean; body?: unknown; query?: string } = {}) {
  const headers: Record<string, string> = {};
  if (opts.keys) {
    headers["x-api-key"] = KEY;
    headers["x-api-secret"] = SECRET;
  }
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  return new Request(`https://nautilus.test/api/v1/${path}${opts.query ?? ""}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

async function jsonOf(res: Response) {
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

function okPublic(result: unknown) {
  mock.method(globalThis, "fetch", async () => {
    return {
      ok: true,
      status: 200,
      json: async () => ({ error: [], result }),
    } as Response;
  });
}

describe("handleV1 public routes", () => {
  it("pings health without API keys", async () => {
    okPublic({ unixtime: 1_700_000_000 });
    const { status, body } = await jsonOf(await handleV1("GET", req("GET", "health"), "health"));
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.match(String(body.message), /Nautilus/);
    assert.equal(typeof body.ms, "number");
  });

  it("evaluates a public DCA bot and rejects a truncated body", async () => {
    const ticker = {
      id: "XBTEUR",
      last: 100,
      bid: 99.95,
      ask: 100.05,
      open: 100,
      high: 101,
      low: 99,
      volume: 1,
      vwap: 100,
      change: 0,
      changePct: 0,
      trades: 1,
      quoteVolume: 100,
    };
    const ok = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "bots/evaluate", {
          body: {
            kind: "dca",
            pair: "XBTEUR",
            interval: 15,
            sizeQuote: 200,
            params: { intervalMs: 1 },
            ticker,
          },
        }),
        "bots/evaluate",
      ),
    );
    assert.equal(ok.status, 200);
    assert.equal(ok.body.ok, true);
    assert.ok(Array.isArray(ok.body.fills));
    assert.equal((ok.body.fills as { side: string }[])[0]?.side, "buy");

    const bad = await jsonOf(
      await handleV1("POST", req("POST", "bots/evaluate", { body: { kind: "dca" } }), "bots/evaluate"),
    );
    assert.equal(bad.status, 400);
    assert.equal(bad.body.ok, false);
  });

  it("accepts mfi on the evaluate endpoint", async () => {
    const res = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "bots/evaluate", {
          body: {
            kind: "mfi",
            pair: "XBTEUR",
            interval: 15,
            sizeQuote: 50,
            params: {},
            ticker: {
              id: "XBTEUR",
              last: 100,
              bid: 100,
              ask: 100,
              open: 100,
              high: 100,
              low: 100,
              volume: 1,
              vwap: 100,
              change: 0,
              changePct: 0,
              trades: 0,
              quoteVolume: 0,
            },
            candles: [{ time: 1, open: 1, high: 1, low: 1, close: 1, volume: 1 }],
          },
        }),
        "bots/evaluate",
      ),
    );
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.match(String(res.body.message), /insuffisants|MFI|chauffe/i);
  });
});

describe("handleV1 auth and private routes", () => {
  it("rejects private routes without keys and 404s unknown paths", async () => {
    const denied = await jsonOf(await handleV1("GET", req("GET", "balances"), "balances"));
    assert.equal(denied.status, 401);
    assert.match(String(denied.body.message), /X-API-Key/);

    const missing = await jsonOf(await handleV1("GET", req("GET", "nope", { keys: true }), "nope"));
    assert.equal(missing.status, 404);
    assert.match(String(missing.body.message), /inconnue/);
  });

  it("places a bot market order note and refuses an unknown pair without a network call", async () => {
    const unknown = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "orders", {
          keys: true,
          body: { pair: "FAKEEUR", side: "buy", type: "market", amount: 1 },
        }),
        "orders",
      ),
    );
    assert.equal(unknown.status, 400);
    assert.match(String(unknown.body.message), /Paire inconnue/);

    const bot = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "bots/order", {
          keys: true,
          body: { pair: "FAKEEUR", side: "buy", amount: 1 },
        }),
        "bots/order",
      ),
    );
    assert.equal(bot.status, 400);
  });

  it("tests keys, converts, allocates and cancels through the REST surface", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/Balance")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { ZEUR: "250" } }),
        } as Response;
      }
      if (u.includes("AddOrder") || u.includes("CancelOrder") || u.includes("Earn/")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { txid: ["O1"], count: 1 } }),
        } as Response;
      }
      throw new Error(u);
    });

    const testKeys = await jsonOf(await handleV1("POST", req("POST", "keys/test", { keys: true, body: {} }), "keys/test"));
    assert.equal(testKeys.status, 200);
    assert.equal(testKeys.body.eur, 250);

    const conv = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "convert", { keys: true, body: { from: "EUR", to: "BTC", amount: 50 } }),
        "convert",
      ),
    );
    assert.equal(conv.status, 200);
    assert.equal(conv.body.ok, true);

    const alloc = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "earn/allocate", { keys: true, body: { strategyId: "flex", amount: 10 } }),
        "earn/allocate",
      ),
    );
    assert.equal(alloc.status, 200);

    const zero = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "earn/deallocate", { keys: true, body: { strategyId: "flex", amount: 0 } }),
        "earn/deallocate",
      ),
    );
    assert.equal(zero.status, 400);

    const cancel = await jsonOf(await handleV1("DELETE", req("DELETE", "orders/O1", { keys: true }), "orders/O1"));
    assert.equal(cancel.status, 200);
    assert.equal(cancel.body.ok, true);
  });

  it("turns a thrown public fetch into HTTP 500 and keeps CORS headers", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new Error("boom");
    });
    const res = await handleV1("GET", req("GET", "tickers"), "tickers");
    assert.equal(res.status, 500);
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), V1_CORS["Access-Control-Allow-Origin"]);
    const body = (await res.json()) as { ok: boolean; message: string };
    assert.equal(body.ok, false);
    assert.match(body.message, /boom/);
  });
});

describe("handleV1 market data and private reads", () => {
  it("serves tickers, ohlc, depth, trades and history", async () => {
    const now = Math.floor(Date.now() / 1000);
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/Ticker")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              XXBTZEUR: {
                a: ["101", "1", "1"],
                b: ["99", "1", "1"],
                c: ["100", "0.1"],
                v: ["1", "2"],
                p: ["100", "100"],
                t: [1, 2],
                l: ["90", "90"],
                h: ["110", "110"],
                o: "95",
              },
            },
          }),
        } as Response;
      }
      if (u.includes("/OHLC")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: { LINKEUR: [[now - 120, "10", "11", "9", "10.5", "10", "3", "1"]], last: now },
          }),
        } as Response;
      }
      if (u.includes("/Depth")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: { DOTEUR: { bids: [["5", "2", 1]], asks: [["5.1", "1", 1]] } },
          }),
        } as Response;
      }
      if (u.includes("/Trades")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: { TRXEUR: [["0.1", "10", now - 1, "b", "m", "", "T9"]] },
          }),
        } as Response;
      }
      throw new Error(u);
    });

    const tickers = await jsonOf(await handleV1("GET", req("GET", "tickers"), "tickers"));
    assert.equal(tickers.status, 200);
    assert.equal(tickers.body.ok, true);
    assert.ok(Array.isArray(tickers.body.tickers));

    const ohlc = await jsonOf(
      await handleV1("GET", req("GET", "ohlc", { query: "?pair=LINKEUR&interval=5" }), "ohlc"),
    );
    assert.equal(ohlc.status, 200);
    assert.ok(Array.isArray(ohlc.body.candles));

    const depth = await jsonOf(
      await handleV1("GET", req("GET", "depth", { query: "?pair=DOTEUR" }), "depth"),
    );
    assert.equal(depth.status, 200);
    assert.ok((depth.body.book as { bids: unknown[] }).bids.length >= 1);

    const trades = await jsonOf(
      await handleV1("GET", req("GET", "trades", { query: "?pair=TRXEUR" }), "trades"),
    );
    assert.equal(trades.status, 200);
    assert.equal((trades.body.trades as { side: string }[])[0]?.side, "buy");

    const hist = await jsonOf(
      await handleV1(
        "GET",
        req("GET", "ohlc/history", { query: "?pair=LINKEUR&interval=15&days=7&since=0" }),
        "ohlc/history",
      ),
    );
    assert.equal(hist.status, 200);
    assert.equal(hist.body.ok, true);
  });

  it("reads balances, orders, fills, positions, earn and deposit with keys", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      const ok = (result: unknown) =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ error: [], result }),
        }) as Response;
      if (u.includes("/Balance")) return ok({ ZEUR: "40", XXBT: "0.01" });
      if (u.includes("OpenOrders")) return ok({ open: {} });
      if (u.includes("ClosedOrders")) {
        return ok({
          closed: {
            C1: {
              status: "closed",
              descr: { pair: "XBTEUR", type: "buy", ordertype: "market", price: "90000" },
              vol: "0.01",
              vol_exec: "0.01",
            },
          },
        });
      }
      if (u.includes("TradesHistory")) {
        return ok({
          trades: {
            T1: { ordertxid: "O1", pair: "XXBTZEUR", time: 1_700_000_000, type: "buy", price: "90000", fee: "1", vol: "0.01" },
          },
        });
      }
      if (u.includes("OpenPositions")) return ok({});
      if (u.includes("Earn/Allocations")) return ok({ items: [] });
      if (u.includes("Earn/Strategies")) return ok({ items: [{ id: "flex", asset: "EUR", apr_estimate: "0.04" }] });
      if (u.includes("DepositMethods")) return ok([{ method: "Bitcoin" }]);
      if (u.includes("DepositAddresses")) return ok([{ address: "bc1qtest", expiretm: "0", new: false }]);
      if (u.includes("TradeBalance")) return ok({ eb: "100", tf: "80", m: "10", n: "2" });
      if (u.includes("AddOrder")) return ok({ txid: ["OCLOSE"] });
      throw new Error(u);
    });

    const bal = await jsonOf(await handleV1("GET", req("GET", "balances", { keys: true }), "balances"));
    assert.equal(bal.status, 200);
    assert.equal(bal.body.eur, 40);

    const orders = await jsonOf(await handleV1("GET", req("GET", "orders", { keys: true }), "orders"));
    assert.equal(orders.status, 200);
    assert.ok(Array.isArray(orders.body.orders));

    const fills = await jsonOf(await handleV1("GET", req("GET", "fills", { keys: true }), "fills"));
    assert.equal(fills.status, 200);
    assert.ok(((fills.body.fills as unknown[]) ?? []).length >= 1);

    const pos = await jsonOf(await handleV1("GET", req("GET", "positions", { keys: true }), "positions"));
    assert.equal(pos.status, 200);

    const earn = await jsonOf(await handleV1("GET", req("GET", "earn", { keys: true }), "earn"));
    assert.equal(earn.status, 200);

    const strats = await jsonOf(
      await handleV1("GET", req("GET", "earn/strategies", { keys: true }), "earn/strategies"),
    );
    assert.equal(strats.status, 200);

    const dep = await jsonOf(await handleV1("GET", req("GET", "deposit/XBT", { keys: true }), "deposit/XBT"));
    assert.equal(dep.status, 200);

    const light = await jsonOf(
      await handleV1("GET", req("GET", "account/light", { keys: true }), "account/light"),
    );
    assert.equal(light.status, 200);
    assert.equal(light.body.ok, true);

    const close = await jsonOf(
      await handleV1(
        "POST",
        req("POST", "positions/p1/close", {
          keys: true,
          body: {
            id: "p1",
            pair: "XBTEUR",
            side: "long",
            size: 0.01,
            entry: 90_000,
            leverage: 1,
            margin: 900,
            liqPrice: 0,
            peak: 90_000,
            openedAt: 1,
          },
        }),
        "positions/p1/close",
      ),
    );
    assert.equal(close.status, 200);
    assert.equal(close.body.ok, true);
  });

  it("rejects evaluate without a ticker and keys/test when Balance fails", async () => {
    const missing = await jsonOf(
      await handleV1("POST", req("POST", "bots/evaluate", { body: { kind: "rsi", pair: "XBTEUR" } }), "bots/evaluate"),
    );
    assert.equal(missing.status, 400);

    mock.method(globalThis, "fetch", async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: ["EAPI:Invalid key"], result: {} }),
      } as Response;
    });
    const bad = await jsonOf(await handleV1("POST", req("POST", "keys/test", { keys: true, body: {} }), "keys/test"));
    assert.equal(bad.status, 400);
    assert.equal(bad.body.ok, false);
  });
});
