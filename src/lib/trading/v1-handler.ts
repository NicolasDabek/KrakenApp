import { EMPTY_STATS, evaluateBot } from "./bots.ts";
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
  fetchTradesHistory,
  placeKrakenOrder,
} from "./kraken-account.server.ts";
import { callKrakenPrivate, parseKrakenBalances } from "./kraken-private.server.ts";
import { getDepth, getOhlc, getOhlcHistory, getTickers, getTrades, pingKraken } from "./kraken.server.ts";
import type { Bot, BotKind, BotParams, BotRuntime, Candle, NewOrderInput, Position, Ticker } from "./types.ts";

export const V1_CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key, X-API-Secret",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: V1_CORS });
}

function keysFrom(request: Request) {
  return {
    apiKey: request.headers.get("x-api-key") ?? "",
    apiSecret: request.headers.get("x-api-secret") ?? "",
  };
}

function needKeys(keys: { apiKey: string; apiSecret: string }) {
  if (keys.apiKey.length < 8 || keys.apiSecret.length < 16) {
    return json({ ok: false, message: "En-têtes X-API-Key et X-API-Secret requis." }, 401);
  }
  return null;
}

async function readBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export async function handleV1(method: string, request: Request, splat: string): Promise<Response> {
  const path = splat.replace(/\/$/, "");
  const url = new URL(request.url);
  const keys = keysFrom(request);

  try {
    if (method === "GET" && (path === "health" || path === "")) {
      const ping = await pingKraken();
      return json({ ok: ping.ok, message: ping.ok ? "Nautilus backend" : "Kraken injoignable", ms: ping.ms });
    }
    if (method === "GET" && path === "tickers") {
      return json({ ok: true, tickers: await getTickers() });
    }
    if (method === "GET" && path === "ohlc") {
      const pair = url.searchParams.get("pair") ?? "XBTEUR";
      const interval = Number(url.searchParams.get("interval") ?? 60);
      return json({ ok: true, candles: await getOhlc(pair, interval) });
    }
    if (method === "GET" && path === "ohlc/history") {
      const pair = url.searchParams.get("pair") ?? "XBTEUR";
      const interval = Number(url.searchParams.get("interval") ?? 15);
      const days = Number(url.searchParams.get("days") ?? 7);
      const since = Number(url.searchParams.get("since") ?? 0);
      const hist = await getOhlcHistory(pair, interval, since, days);
      return json({ ok: true, ...hist });
    }
    if (method === "GET" && path === "depth") {
      const pair = url.searchParams.get("pair") ?? "XBTEUR";
      return json({ ok: true, book: await getDepth(pair) });
    }
    if (method === "GET" && path === "trades") {
      const pair = url.searchParams.get("pair") ?? "XBTEUR";
      return json({ ok: true, trades: await getTrades(pair) });
    }

    if (method === "POST" && path === "bots/evaluate") {
      const body = await readBody<{
        kind: BotKind;
        pair: string;
        interval: number;
        sizeQuote: number;
        params: BotParams;
        runtime?: BotRuntime;
        ticker: Ticker;
        candles?: Candle[];
        equity?: number;
      }>(request);
      if (!body?.kind || !body.pair || !body.ticker) {
        return json({ ok: false, message: "kind, pair et ticker requis." }, 400);
      }
      const bot: Bot = {
        id: "eval",
        name: "eval",
        kind: body.kind,
        venue: "live",
        status: "running",
        pair: body.pair,
        interval: body.interval || 15,
        sizeQuote: body.sizeQuote || 50,
        params: body.params ?? {},
        createdAt: 0,
        lastNote: "",
        stats: { ...EMPTY_STATS },
        runtime: body.runtime ?? {},
      };
      const result = evaluateBot(bot, {
        now: Date.now(),
        ticker: body.ticker,
        candles: body.candles,
        equity: body.equity,
      });
      return json({ ok: true, message: result.note, fills: result.fills, runtime: result.runtime });
    }

    const denied = needKeys(keys);
    if (denied) return denied;

    if (method === "POST" && path === "keys/test") {
      const res = await callKrakenPrivate<Record<string, string>>(keys.apiKey, keys.apiSecret, "Balance");
      if (!res.ok) return json({ ok: false, message: res.message, balances: {}, eur: 0 }, 400);
      const balances = parseKrakenBalances(res.result);
      return json({ ok: true, message: "Clés Kraken valides", balances, eur: balances.EUR ?? 0 });
    }
    if (method === "GET" && (path === "account" || path === "account/full")) {
      const snap = await fetchAccountSnapshot(keys, "full");
      return json(snap, snap.ok ? 200 : 400);
    }
    if (method === "GET" && path === "account/light") {
      const snap = await fetchAccountSnapshot(keys, "light");
      return json(snap, snap.ok ? 200 : 400);
    }
    if (method === "GET" && path === "balances") {
      const res = await callKrakenPrivate<Record<string, string>>(keys.apiKey, keys.apiSecret, "Balance");
      if (!res.ok) return json({ ok: false, message: res.message, balances: {}, eur: 0 }, 400);
      const balances = parseKrakenBalances(res.result);
      return json({ ok: true, message: "OK", balances, eur: balances.EUR ?? 0 });
    }
    if (method === "GET" && path === "orders") {
      const [open, closed] = await Promise.all([fetchOpenOrders(keys), fetchClosedOrders(keys)]);
      return json({ ok: true, message: "OK", orders: [...open, ...closed].slice(0, 80) });
    }
    if (method === "GET" && path === "fills") {
      const fills = await fetchTradesHistory(keys);
      return json({ ok: true, message: "OK", fills: fills.slice(0, 80) });
    }
    if (method === "GET" && path === "positions") {
      const positions = await fetchOpenPositions(keys);
      return json({ ok: true, message: "OK", positions });
    }
    if (method === "GET" && path === "earn") {
      const earn = await fetchEarn(keys);
      return json({ ok: true, message: "OK", earn });
    }
    if (method === "GET" && path === "earn/strategies") {
      const rows = await fetchEarnStrategies(keys);
      return json({ ok: true, message: "OK", strategies: rows });
    }
    if (method === "GET" && path.startsWith("deposit/")) {
      const asset = path.slice("deposit/".length);
      const res = await fetchDepositAddress(keys, asset);
      return json(res, res.ok ? 200 : 400);
    }

    if (method === "POST" && (path === "orders" || path === "bots/order")) {
      const body = await readBody<NewOrderInput & { volume?: string; validate?: boolean }>(request);
      const amount = body.amount ?? Number(body.volume);
      const input: NewOrderInput = {
        pair: body.pair,
        side: body.side,
        type: body.type ?? "market",
        amount,
        price: body.price,
        stopPrice: body.stopPrice,
        leverage: body.leverage,
        tp: body.tp,
        sl: body.sl,
        trailingPct: body.trailingPct,
        note: body.note ?? (path === "bots/order" ? "bot" : undefined),
      };
      const res = await placeKrakenOrder(keys, input, { validate: body.validate });
      return json(res, res.ok ? 200 : 400);
    }
    if (method === "POST" && path === "convert") {
      const body = await readBody<{ from: string; to: string; amount: number }>(request);
      const res = await convertKraken(keys, body.from, body.to, Number(body.amount));
      return json(res, res.ok ? 200 : 400);
    }
    if (method === "POST" && path.endsWith("/close") && path.startsWith("positions/")) {
      const body = await readBody<Position>(request);
      const res = await closeKrakenPosition(keys, body);
      return json(res, res.ok ? 200 : 400);
    }
    if (method === "POST" && path === "earn/allocate") {
      const body = await readBody<{ strategyId: string; amount: number }>(request);
      const res = await allocateEarn(keys, body.strategyId, Number(body.amount));
      return json(res, res.ok ? 200 : 400);
    }
    if (method === "POST" && path === "earn/deallocate") {
      const body = await readBody<{ strategyId: string; amount: number }>(request);
      const res = await deallocateEarn(keys, body.strategyId, Number(body.amount));
      return json(res, res.ok ? 200 : 400);
    }

    if (method === "DELETE" && path.startsWith("orders/")) {
      const txid = path.slice("orders/".length);
      const res = await cancelKrakenOrder(keys, txid);
      return json(res, res.ok ? 200 : 400);
    }

    return json({ ok: false, message: `Route inconnue: /api/v1/${path}` }, 404);
  } catch (err) {
    return json({ ok: false, message: err instanceof Error ? err.message : "Erreur backend" }, 500);
  }
}
