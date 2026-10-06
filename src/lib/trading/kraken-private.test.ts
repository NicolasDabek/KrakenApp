import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { callKrakenPrivate, normalizeKrakenAsset, parseKrakenBalances } from "./kraken-private.server.ts";

const SECRET = Buffer.from("nautilus-test-secret-material-32").toString("base64");
const KEY = "kraken-key-ok";

afterEach(() => {
  mock.restoreAll();
});

describe("normalizeKrakenAsset / parseKrakenBalances", () => {
  it("maps Kraken prefixed codes to display assets", () => {
    assert.equal(normalizeKrakenAsset("XXBT"), "BTC");
    assert.equal(normalizeKrakenAsset("XBT"), "BTC");
    assert.equal(normalizeKrakenAsset("XETH"), "ETH");
    assert.equal(normalizeKrakenAsset("XXDG"), "DOGE");
    assert.equal(normalizeKrakenAsset("ZEUR"), "EUR");
    assert.equal(normalizeKrakenAsset("ZUSD"), "USD");
    assert.equal(normalizeKrakenAsset("SOL"), "SOL");
  });

  it("aggregates balances and skips zeros", () => {
    const out = parseKrakenBalances({
      XXBT: "0.5",
      XBT: "0.25",
      ZEUR: "1000",
      XXDG: "0",
      SOL: "not-a-number",
    });
    assert.equal(out.BTC, 0.75);
    assert.equal(out.EUR, 1000);
    assert.equal(out.DOGE, undefined);
    assert.deepEqual(parseKrakenBalances(undefined), {});
    assert.deepEqual(parseKrakenBalances({}), {});
    assert.equal(normalizeKrakenAsset("XXRP"), "XRP");
    assert.equal(normalizeKrakenAsset(""), "");
  });
});

describe("callKrakenPrivate", () => {
  it("rejects incomplete keys without touching the network", async () => {
    const res = await callKrakenPrivate("short", "also-short", "Balance");
    assert.equal(res.ok, false);
    assert.match(res.message, /incomplètes/);
  });

  it("signs the request and surfaces Kraken errors", async () => {
    let captured: { url: string; headers: Record<string, string>; body: string } | undefined;
    mock.method(globalThis, "fetch", async (url: string | URL, init?: RequestInit) => {
      captured = {
        url: String(url),
        headers: init?.headers as Record<string, string>,
        body: String(init?.body ?? ""),
      };
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: ["EAPI:Invalid key"], result: {} }),
      } as Response;
    });
    const res = await callKrakenPrivate(KEY, SECRET, "Balance");
    assert.equal(res.ok, false);
    assert.match(res.message, /Invalid key/);
    assert.ok(captured);
    assert.match(captured!.url, /\/0\/private\/Balance$/);
    assert.equal(captured!.headers["API-Key"], KEY);
    assert.ok(captured!.headers["API-Sign"]);
    assert.match(captured!.body, /nonce=/);
  });

  it("returns the payload on success", async () => {
    mock.method(globalThis, "fetch", async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: { ZEUR: "12.5" } }),
      } as Response;
    });
    const res = await callKrakenPrivate<{ ZEUR: string }>(KEY, SECRET, "Balance");
    assert.equal(res.ok, true);
    assert.equal(res.result?.ZEUR, "12.5");
  });

  it("maps HTTP errors and network failures", async () => {
    mock.method(globalThis, "fetch", async () => {
      return {
        ok: false,
        status: 502,
        json: async () => ({ error: [], result: {} }),
      } as Response;
    });
    const http = await callKrakenPrivate(KEY, SECRET, "Balance");
    assert.equal(http.ok, false);
    assert.match(http.message, /HTTP 502/);

    mock.restoreAll();
    mock.method(globalThis, "fetch", async () => {
      throw new Error("ECONNRESET");
    });
    const net = await callKrakenPrivate(KEY, SECRET, "Balance");
    assert.equal(net.ok, false);
    assert.match(net.message, /ECONNRESET/);
  });

  it("increments the nonce between two signed calls", async () => {
    const bodies: string[] = [];
    mock.method(globalThis, "fetch", async (_url: string | URL, init?: RequestInit) => {
      bodies.push(String(init?.body ?? ""));
      return {
        ok: true,
        status: 200,
        json: async () => ({ error: [], result: {} }),
      } as Response;
    });
    await callKrakenPrivate(KEY, SECRET, "Balance");
    await callKrakenPrivate(KEY, SECRET, "Balance");
    const n1 = Number(new URLSearchParams(bodies[0]).get("nonce"));
    const n2 = Number(new URLSearchParams(bodies[1]).get("nonce"));
    assert.ok(n2 > n1);
  });
});
