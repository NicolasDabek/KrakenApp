import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import {
  allocateEarn,
  cancelKrakenOrder,
  closeKrakenPosition,
  convertKraken,
  deallocateEarn,
  fetchAccountSnapshot,
  fetchClosedOrders,
  fetchDepositAddress,
  fetchEarn,
  fetchEarnStrategies,
  fetchOpenOrders,
  fetchOpenPositions,
  fetchTradeBalance,
  fetchTradesHistory,
  placeKrakenOrder,
  queryKrakenOrder,
} from "./kraken-account.server.ts";
import type { Position } from "./types.ts";

const SECRET = Buffer.from("nautilus-test-secret-material-32").toString("base64");
const KEYS = { apiKey: "kraken-key-ok", apiSecret: SECRET };

afterEach(() => {
  mock.restoreAll();
});

function okFetch(result: unknown) {
  mock.method(globalThis, "fetch", async () => {
    return {
      ok: true,
      status: 200,
      json: async () => ({ error: [], result }),
    } as Response;
  });
}

describe("placeKrakenOrder", () => {
  it("rejects unknown pairs and dust sizes without a network call", async () => {
    const unknown = await placeKrakenOrder(KEYS, {
      pair: "FAKEEUR",
      side: "buy",
      type: "market",
      amount: 1,
    });
    assert.equal(unknown.ok, false);
    assert.match(unknown.message, /Paire inconnue/);

    const dust = await placeKrakenOrder(KEYS, {
      pair: "XBTEUR",
      side: "buy",
      type: "market",
      amount: 0.00000001,
    });
    assert.equal(dust.ok, false);
    assert.match(dust.message, /Minimum/);
  });

  it("requires a price on limit orders", async () => {
    const res = await placeKrakenOrder(KEYS, {
      pair: "XBTEUR",
      side: "buy",
      type: "limit",
      amount: 0.01,
    });
    assert.equal(res.ok, false);
    assert.match(res.message, /Prix manquant/);
  });

  it("sends a market order with fciq and optional stop-loss close", async () => {
    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OTEST"], descr: { order: "buy 0.01 XBTEUR @ market" } } }),
      } as Response;
    });
    const res = await placeKrakenOrder(KEYS, {
      pair: "XBTEUR",
      side: "buy",
      type: "market",
      amount: 0.01,
      sl: 80_000,
    });
    assert.equal(res.ok, true);
    assert.equal(res.txid, "OTEST");
    assert.equal(res.order?.status, "filled");
    assert.match(body, /ordertype=market/);
    assert.match(body, /oflags=fciq/);
    assert.match(body, /close%5Bordertype%5D=stop-loss|close\[ordertype\]=stop-loss/);
  });

  it("maps stop-limit to stop-loss-limit", async () => {
    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OLIM"] } }),
      } as Response;
    });
    const res = await placeKrakenOrder(KEYS, {
      pair: "ETHEUR",
      side: "sell",
      type: "stop-limit",
      amount: 0.05,
      stopPrice: 2_000,
      price: 1_990,
    });
    assert.equal(res.ok, true);
    assert.match(body, /stop-loss-limit/);
    assert.match(body, /price=2000/);
    assert.match(body, /price2=1990/);
  });
});

describe("queryKrakenOrder", () => {
  it("returns a filled order with avg price", async () => {
    okFetch({
      OTEST: {
        status: "closed",
        vol: "0.01",
        vol_exec: "0.01",
        price: "90123.4",
        fee: "2.34",
        opentm: 1,
        closetm: 2,
        descr: { pair: "XBTEUR", type: "buy", ordertype: "market", order: "buy 0.01 XBTEUR @ market" },
      },
    });
    const order = await queryKrakenOrder(KEYS, "OTEST");
    assert.ok(order);
    assert.equal(order!.id, "OTEST");
    assert.equal(order!.avgPrice, 90123.4);
    assert.equal(order!.filled, 0.01);
    assert.equal(order!.fee, 2.34);
  });
});

describe("cancel / close / convert", () => {
  it("cancels by txid", async () => {
    okFetch({ count: 1 });
    const res = await cancelKrakenOrder(KEYS, "O123");
    assert.equal(res.ok, true);
    assert.match(res.message, /Annulé/);
  });

  it("closes a long with a market sell", async () => {
    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OCLOSE"] } }),
      } as Response;
    });
    const pos: Position = {
      id: "p1",
      pair: "XBTEUR",
      side: "long",
      size: 0.01,
      entry: 90_000,
      leverage: 2,
      margin: 450,
      liqPrice: 50_000,
      peak: 91_000,
      openedAt: 1,
    };
    const res = await closeKrakenPosition(KEYS, pos);
    assert.equal(res.ok, true);
    assert.match(body, /type=sell/);
    assert.match(body, /ordertype=market/);
    assert.match(body, /leverage=2/);
  });

  it("rejects invalid conversions and buys EUR→BTC with viqc", async () => {
    const same = await convertKraken(KEYS, "EUR", "EUR", 10);
    assert.equal(same.ok, false);
    const zero = await convertKraken(KEYS, "EUR", "BTC", 0);
    assert.equal(zero.ok, false);

    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OCONV"] } }),
      } as Response;
    });
    const res = await convertKraken(KEYS, "EUR", "BTC", 200);
    assert.equal(res.ok, true);
    assert.match(body, /type=buy/);
    assert.match(body, /viqc/);
  });
});

describe("earn / deposit / snapshot parsing", () => {
  it("rejects a zero earn amount and allocates on success", async () => {
    const zero = await allocateEarn(KEYS, "flex-eur", 0);
    assert.equal(zero.ok, false);
    okFetch({ result: "ok" });
    const res = await allocateEarn(KEYS, "flex-eur", 25);
    assert.equal(res.ok, true);
    mock.restoreAll();
    const de = await deallocateEarn(KEYS, "flex-eur", 0);
    assert.equal(de.ok, false);
  });

  it("parses earn allocations and strategies", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("Earn/Allocations")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              items: [
                { native_asset: "XXBT", amount_allocated: "0.5", strategy_id: "flex-xbt", apr: "0.04", type: "flex" },
                { native_asset: "EUR", amount: "0", strategy_id: "empty" },
              ],
            },
          }),
        } as Response;
      }
      if (u.includes("Earn/Strategies")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              items: [
                {
                  id: "flex-eur",
                  native_asset: "ZEUR",
                  can_allocate: true,
                  can_deallocate: true,
                  lock_type: { type: "flex" },
                  apr_estimate: { high: "0.05" },
                  auto_compound: { type: "enabled" },
                },
              ],
            },
          }),
        } as Response;
      }
      throw new Error(u);
    });
    const rows = await fetchEarn(KEYS);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.asset, "BTC");
    assert.equal(rows[0]!.amount, 0.5);
    const strats = await fetchEarnStrategies(KEYS);
    assert.equal(strats[0]!.id, "flex-eur");
    assert.equal(strats[0]!.asset, "EUR");
    assert.equal(strats[0]!.canAllocate, true);
  });

  it("resolves a deposit address through methods then addresses", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("DepositMethods")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: [{ method: "Bitcoin" }] }),
        } as Response;
      }
      if (u.includes("DepositAddresses")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: [{ address: "bc1qtest", tag: "" }],
          }),
        } as Response;
      }
      throw new Error(u);
    });
    const res = await fetchDepositAddress(KEYS, "XXBT");
    assert.equal(res.ok, true);
    assert.equal(res.info?.address, "bc1qtest");
    assert.equal(res.info?.method, "Bitcoin");
  });

  it("maps open orders, fills and positions from a snapshot", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.endsWith("/Balance")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { ZEUR: "1000", XXBT: "0.2" } }),
        } as Response;
      }
      if (u.includes("OpenOrders")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              open: {
                O1: {
                  status: "open",
                  opentm: 1_700_000_000,
                  descr: { pair: "XBTEUR", type: "buy", ordertype: "limit", price: "80000", leverage: "2" },
                  vol: "0.01",
                  vol_exec: "0",
                  fee: "0",
                },
              },
            },
          }),
        } as Response;
      }
      if (u.includes("ClosedOrders") || u.includes("TradesHistory") || u.includes("Earn/Allocations") || u.includes("TradeBalance")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: u.includes("TradeBalance") ? { eb: "1200", tf: "800", m: "100", n: "5" } : {} }),
        } as Response;
      }
      if (u.includes("OpenPositions")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              P1: {
                pair: "XBTEUR",
                type: "buy",
                vol: "0.02",
                vol_closed: "0",
                cost: "1800",
                margin: "900",
                value: "1900",
                time: 1_700_000_000,
              },
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: {} }),
      } as Response;
    });
    const snap = await fetchAccountSnapshot(KEYS, "light");
    assert.equal(snap.ok, true);
    assert.equal(snap.eur, 1000);
    assert.equal(snap.orders?.[0]?.type, "limit");
    assert.equal(snap.orders?.[0]?.leverage, 2);
    assert.equal(snap.positions?.[0]?.side, "long");
    assert.ok((snap.positions?.[0]?.size ?? 0) > 0);
  });

  it("parses trade history and a short position", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("TradesHistory")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              trades: {
                T9: {
                  ordertxid: "O9",
                  pair: "XXBTZEUR",
                  time: 1_700_000_111,
                  type: "sell",
                  price: "91000",
                  fee: "1.2",
                  vol: "0.01",
                },
              },
            },
          }),
        } as Response;
      }
      if (u.includes("OpenPositions")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              S1: {
                pair: "ETHEUR",
                type: "sell",
                vol: "1",
                vol_closed: "0",
                cost: "2000",
                margin: "400",
                time: 1_700_000_000,
              },
            },
          }),
        } as Response;
      }
      if (u.includes("OpenOrders")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              open: {
                OX: {
                  status: "canceled",
                  descr: { pair: "SOLEUR", type: "sell", ordertype: "stop-loss-limit", price: "100", price2: "99" },
                  vol: "1",
                  stopprice: "100",
                },
              },
            },
          }),
        } as Response;
      }
      throw new Error(u);
    });
    const fills = await fetchTradesHistory(KEYS);
    assert.equal(fills[0]?.side, "sell");
    assert.equal(fills[0]?.pair, "XBTEUR");
    const pos = await fetchOpenPositions(KEYS);
    assert.equal(pos[0]?.side, "short");
    const orders = await fetchOpenOrders(KEYS);
    assert.equal(orders[0]?.status, "cancelled");
    assert.equal(orders[0]?.type, "stop-limit");
  });

  it("sends a trailing stop without a numeric price", async () => {
    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OTRAIL"] } }),
      } as Response;
    });
    const res = await placeKrakenOrder(KEYS, {
      pair: "XBTEUR",
      side: "sell",
      type: "stop",
      amount: 0.01,
      trailingPct: 2.5,
    });
    assert.equal(res.ok, true);
    assert.match(body, /trailing-stop/);
    assert.match(body, /price=%2B2.50|\+2.50/);
  });

  it("deallocates Earn, validates an order and refuses a deposit without methods", async () => {
    okFetch({ result: "ok" });
    const de = await deallocateEarn(KEYS, "flex-eur", 12);
    assert.equal(de.ok, true);
    mock.restoreAll();

    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { descr: { order: "validate" } } }),
      } as Response;
    });
    const val = await placeKrakenOrder(
      KEYS,
      { pair: "XBTEUR", side: "buy", type: "limit", amount: 0.01, price: 80_000 },
      { validate: true },
    );
    assert.equal(val.ok, true);
    assert.match(body, /validate=true/);
    assert.match(body, /ordertype=limit/);
    mock.restoreAll();

    mock.method(globalThis, "fetch", async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: [] }),
      } as Response;
    });
    const dep = await fetchDepositAddress(KEYS, "EUR");
    assert.equal(dep.ok, false);
    assert.match(dep.message, /méthode/i);
  });

  it("returns a failed snapshot when Balance is rejected", async () => {
    mock.method(globalThis, "fetch", async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: ["EAPI:Invalid key"], result: {} }),
      } as Response;
    });
    const snap = await fetchAccountSnapshot(KEYS, "full");
    assert.equal(snap.ok, false);
    assert.match(snap.message, /Invalid key/);
  });

  it("closes a short with a market buy", async () => {
    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OSHORT"] } }),
      } as Response;
    });
    const res = await closeKrakenPosition(KEYS, {
      id: "p2",
      pair: "ETHEUR",
      side: "short",
      size: 0.05,
      entry: 2_000,
      leverage: 1,
      margin: 100,
      liqPrice: 3_000,
      peak: 1_900,
      openedAt: 1,
    });
    assert.equal(res.ok, true);
    assert.match(body, /type=buy/);
    assert.match(body, /ETHEUR|pair=ETHEUR/);
  });
});

describe("trade balance, closed orders, convert hop, take-profit close", () => {
  it("parses TradeBalance and closed orders", async () => {
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("TradeBalance")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { eb: "1200.5", tf: "800", m: "50", n: "-12" } }),
        } as Response;
      }
      if (u.includes("ClosedOrders")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error: [],
            result: {
              closed: {
                C9: {
                  status: "closed",
                  descr: { pair: "ETHEUR", type: "sell", ordertype: "limit", price: "2500" },
                  vol: "0.4",
                  vol_exec: "0.4",
                  closetm: 1_700_000_222,
                },
              },
            },
          }),
        } as Response;
      }
      throw new Error(u);
    });
    const tb = await fetchTradeBalance(KEYS);
    assert.equal(tb?.equity, 1200.5);
    assert.equal(tb?.unrealized, -12);
    const closed = await fetchClosedOrders(KEYS);
    assert.equal(closed[0]?.pair, "ETHEUR");
    assert.equal(closed[0]?.status, "filled");
  });

  it("hops SOL → ADA via EUR then reports a zero-received hop", async () => {
    let balances = 0;
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/Balance")) {
        balances += 1;
        const zeur = balances === 1 ? "10" : "85";
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { ZEUR: zeur, SOL: "2" } }),
        } as Response;
      }
      if (u.includes("AddOrder")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { txid: ["OHOP"], descr: { order: "hop" } } }),
        } as Response;
      }
      throw new Error(u);
    });
    const hop = await convertKraken(KEYS, "SOL", "ADA", 1);
    assert.equal(hop.ok, true);
    assert.match(hop.message, /via EUR/);

    mock.restoreAll();
    balances = 0;
    mock.method(globalThis, "fetch", async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/Balance")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { ZEUR: "10" } }),
        } as Response;
      }
      if (u.includes("AddOrder")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ error: [], result: { txid: ["O1"] } }),
        } as Response;
      }
      throw new Error(u);
    });
    const stuck = await convertKraken(KEYS, "SOL", "ADA", 1);
    assert.equal(stuck.ok, true);
    assert.match(stuck.message, /Relance/);
  });

  it("attaches a take-profit close and rejects an unknown-pair flatten", async () => {
    let body = "";
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      body = String(init?.body ?? "");
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { txid: ["OTP"] } }),
      } as Response;
    });
    const res = await placeKrakenOrder(KEYS, {
      pair: "XBTEUR",
      side: "buy",
      type: "market",
      amount: 0.01,
      tp: 120_000,
    });
    assert.equal(res.ok, true);
    assert.match(body, /take-profit/);
    assert.match(body, /120000/);

    const bad = await closeKrakenPosition(KEYS, {
      id: "x",
      pair: "FAKEEUR",
      side: "long",
      size: 1,
      entry: 1,
      leverage: 1,
      margin: 1,
      liqPrice: 0,
      peak: 1,
      openedAt: 1,
    });
    assert.equal(bad.ok, false);
  });
});
