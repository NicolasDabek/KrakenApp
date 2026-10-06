import { afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { BACKEND_ENDPOINTS, NATIVE_API_ROOT, backendRequest, orderPayload, resolveBackendRoot } from "./backend.ts";

describe("backend contract", () => {
  it("exposes a same-origin REST root and no withdrawal route", () => {
    assert.equal(NATIVE_API_ROOT, "/api/v1");
    const paths = BACKEND_ENDPOINTS.map((e) => e.path);
    assert.ok(paths.includes("/health"));
    assert.ok(paths.includes("/orders"));
    assert.ok(paths.includes("/bots/evaluate"));
    assert.ok(paths.includes("/convert"));
    assert.ok(paths.includes("/earn/allocate"));
    assert.ok(paths.includes("/deposit/:asset"));
    assert.equal(
      paths.some((p) => /withdraw/i.test(p)),
      false,
      "withdrawals must stay disabled",
    );
  });

  it("resolves an empty base URL to the native API root", () => {
    assert.equal(resolveBackendRoot({ baseUrl: "", apiKey: "", apiSecret: "" }), "/api/v1");
    assert.equal(
      resolveBackendRoot({ baseUrl: "https://example.test/api/v1/", apiKey: "", apiSecret: "" }),
      "https://example.test/api/v1",
    );
  });

  it("maps an order form onto the REST payload", () => {
    const p = orderPayload({
      pair: "XBTEUR",
      side: "buy",
      type: "limit",
      amount: 0.01,
      price: 90_000,
      sl: 80_000,
      tp: 100_000,
      leverage: 2,
    });
    assert.equal(p.pair, "XBTEUR");
    assert.equal(p.stopLoss, 80_000);
    assert.equal(p.takeProfit, 100_000);
    assert.equal(p.leverage, 2);
  });

  it("lists a description for every endpoint and covers the bot evaluate route", () => {
    assert.ok(BACKEND_ENDPOINTS.every((e) => e.method && e.path && e.desc.length > 3));
    assert.ok(BACKEND_ENDPOINTS.some((e) => e.path === "/bots/order"));
    assert.ok(BACKEND_ENDPOINTS.some((e) => e.method === "DELETE"));
  });
});

describe("backendRequest", () => {
  afterEach(() => mock.restoreAll());

  it("sends API headers, parses JSON and treats payload.ok=false as failure", async () => {
    let captured: { url: string; headers: Record<string, string>; body: string } | undefined;
    mock.method(globalThis, "fetch", async (url: string | URL, init?: RequestInit) => {
      captured = {
        url: String(url),
        headers: (init?.headers ?? {}) as Record<string, string>,
        body: String(init?.body ?? ""),
      };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: false, message: "refusé" }),
      } as Response;
    });
    const res = await backendRequest<{ ok: boolean }>(
      { baseUrl: "https://example.test/api/v1", apiKey: "k", apiSecret: "s" },
      "/orders",
      { method: "POST", body: JSON.stringify({ pair: "XBTEUR" }) },
    );
    assert.equal(res.ok, false);
    assert.equal(res.message, "refusé");
    assert.ok(captured);
    assert.equal(captured!.headers["X-API-Key"], "k");
    assert.equal(captured!.headers["X-API-Secret"], "s");
    assert.match(captured!.url, /\/orders$/);
  });

  it("returns a network error without throwing", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new Error("offline");
    });
    const res = await backendRequest({ baseUrl: "", apiKey: "", apiSecret: "" }, "/health");
    assert.equal(res.ok, false);
    assert.equal(res.status, 0);
    assert.match(res.message, /offline/);
  });

  it("keeps a non-JSON body as the error message", async () => {
    mock.method(globalThis, "fetch", async () => {
      return {
        ok: false,
        status: 502,
        text: async () => "bad gateway",
      } as Response;
    });
    const res = await backendRequest({ baseUrl: "https://x.test/api/v1", apiKey: "", apiSecret: "" }, "/health");
    assert.equal(res.ok, false);
    assert.equal(res.status, 502);
    assert.match(res.message, /bad gateway/);
  });

  it("uses window.origin when the connection has no base URL", () => {
    const g = globalThis as { window?: { location: { origin: string } } };
    const prev = g.window;
    g.window = { location: { origin: "https://nautilus.test" } };
    try {
      assert.equal(
        resolveBackendRoot({ baseUrl: "", apiKey: "", apiSecret: "" }),
        "https://nautilus.test/api/v1",
      );
    } finally {
      if (prev) g.window = prev;
      else delete g.window;
    }
  });
});
