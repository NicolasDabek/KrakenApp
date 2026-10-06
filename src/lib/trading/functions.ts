import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EMPTY_STATS, evaluateBot } from "./bots.ts";
import {
  allocateEarn,
  cancelKrakenOrder,
  closeKrakenPosition,
  convertKraken,
  deallocateEarn,
  fetchAccountSnapshot,
  fetchDepositAddress,
  fetchEarn,
  fetchEarnStrategies,
  fetchKrakenLedgers,
  fetchOpenOrders,
  placeKrakenOrder,
  queryKrakenOrder,
} from "./kraken-account.server.ts";
import { callKrakenPrivate, parseKrakenBalances } from "./kraken-private.server.ts";
import { getDepth, getOhlc, getOhlcHistory, getTickers, getTrades, pingKraken } from "./kraken.server.ts";
import type { Bot, BotKind, BotParams, BotRuntime, Candle, NewOrderInput, Position, Ticker } from "./types";

export const fetchTickers = createServerFn({ method: "GET" }).handler(async () => {
  return getTickers();
});

export const fetchOhlc = createServerFn({ method: "GET" })
  .validator(z.object({ pair: z.string(), interval: z.number() }))
  .handler(async ({ data }) => {
    return getOhlc(data.pair, data.interval);
  });

export const fetchOhlcHistory = createServerFn({ method: "GET" })
  .validator(z.object({ pair: z.string(), interval: z.number(), since: z.number(), days: z.number().optional() }))
  .handler(async ({ data }) => {
    return getOhlcHistory(data.pair, data.interval, data.since, data.days);
  });

export const fetchDepth = createServerFn({ method: "GET" })
  .validator(z.object({ pair: z.string() }))
  .handler(async ({ data }) => {
    return getDepth(data.pair);
  });

export const fetchTape = createServerFn({ method: "GET" })
  .validator(z.object({ pair: z.string() }))
  .handler(async ({ data }) => {
    return getTrades(data.pair);
  });

export const fetchKrakenStatus = createServerFn({ method: "GET" }).handler(async () => {
  return pingKraken();
});

const KrakenAuth = z.object({
  apiKey: z.string().min(4),
  apiSecret: z.string().min(8),
});

export const krakenBalance = createServerFn({ method: "POST" })
  .validator(KrakenAuth)
  .handler(async ({ data }) => {
    const res = await callKrakenPrivate<Record<string, string>>(data.apiKey, data.apiSecret, "Balance");
    if (!res.ok) return { ok: false as const, message: res.message, balances: {} as Record<string, number>, eur: 0 };
    const balances = parseKrakenBalances(res.result);
    return { ok: true as const, message: "Clés Kraken valides", balances, eur: balances.EUR ?? 0 };
  });

export const krakenSnapshot = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ mode: z.enum(["light", "full"]).optional() }))
  .handler(async ({ data }) => {
    return fetchAccountSnapshot(data, data.mode ?? "full");
  });

export const krakenLedgers = createServerFn({ method: "POST" })
  .validator(KrakenAuth)
  .handler(async ({ data }) => {
    return fetchKrakenLedgers(data);
  });

export const krakenAddOrder = createServerFn({ method: "POST" })
  .validator(
    KrakenAuth.extend({
      pair: z.string(),
      side: z.enum(["buy", "sell"]),
      volume: z.string(),
      validate: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const params: Record<string, string> = {
      pair: data.pair,
      type: data.side,
      ordertype: "market",
      volume: data.volume,
      oflags: "fciq",
    };
    if (data.validate) params.validate = "true";
    const res = await callKrakenPrivate<{ txid?: string[]; descr?: { order?: string } }>(
      data.apiKey,
      data.apiSecret,
      "AddOrder",
      params,
    );
    if (!res.ok) return { ok: false as const, message: res.message, txid: undefined as string | undefined };
    return {
      ok: true as const,
      message: res.result?.descr?.order ?? (data.validate ? "Ordre valide (non envoyé)" : "Ordre Kraken envoyé"),
      txid: res.result?.txid?.[0],
    };
  });

export const krakenQueryOrder = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ txid: z.string().min(1) }))
  .handler(async ({ data }) => {
    const order = await queryKrakenOrder({ apiKey: data.apiKey, apiSecret: data.apiSecret }, data.txid);
    if (!order) return { ok: false as const, message: "Ordre introuvable", order: undefined };
    return { ok: true as const, message: "OK", order };
  });

const PlaceBody = KrakenAuth.extend({
  pair: z.string(),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit", "stop", "stop-limit"]),
  amount: z.number().positive(),
  price: z.number().optional(),
  stopPrice: z.number().optional(),
  leverage: z.number().optional(),
  tp: z.number().optional(),
  sl: z.number().optional(),
  trailingPct: z.number().optional(),
  note: z.string().optional(),
  validate: z.boolean().optional(),
});

export const krakenPlaceOrder = createServerFn({ method: "POST" })
  .validator(PlaceBody)
  .handler(async ({ data }) => {
    const input: NewOrderInput = {
      pair: data.pair,
      side: data.side,
      type: data.type,
      amount: data.amount,
      price: data.price,
      stopPrice: data.stopPrice,
      leverage: data.leverage,
      tp: data.tp,
      sl: data.sl,
      trailingPct: data.trailingPct,
      note: data.note,
    };
    return placeKrakenOrder({ apiKey: data.apiKey, apiSecret: data.apiSecret }, input, { validate: data.validate });
  });

export const krakenCancel = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ txid: z.string().min(1) }))
  .handler(async ({ data }) => {
    return cancelKrakenOrder({ apiKey: data.apiKey, apiSecret: data.apiSecret }, data.txid);
  });

export const krakenClosePosition = createServerFn({ method: "POST" })
  .validator(
    KrakenAuth.extend({
      id: z.string(),
      pair: z.string(),
      side: z.enum(["long", "short"]),
      size: z.number().positive(),
      leverage: z.number(),
      entry: z.number(),
      margin: z.number(),
      liqPrice: z.number(),
      openedAt: z.number(),
      peak: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const pos: Position = {
      id: data.id,
      pair: data.pair,
      side: data.side,
      size: data.size,
      entry: data.entry,
      leverage: data.leverage,
      margin: data.margin,
      liqPrice: data.liqPrice,
      peak: data.peak ?? data.entry,
      openedAt: data.openedAt,
    };
    return closeKrakenPosition({ apiKey: data.apiKey, apiSecret: data.apiSecret }, pos);
  });

export const krakenConvert = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ from: z.string(), to: z.string(), amount: z.number().positive() }))
  .handler(async ({ data }) => {
    return convertKraken({ apiKey: data.apiKey, apiSecret: data.apiSecret }, data.from, data.to, data.amount);
  });

export const krakenOpenOrders = createServerFn({ method: "POST" })
  .validator(KrakenAuth)
  .handler(async ({ data }) => {
    const orders = await fetchOpenOrders(data);
    return { ok: true as const, message: "OK", count: orders.length, orders };
  });

export const krakenEarn = createServerFn({ method: "POST" })
  .validator(KrakenAuth)
  .handler(async ({ data }) => {
    const rows = await fetchEarn(data);
    return { ok: true as const, message: "OK", rows };
  });

export const krakenEarnStrategies = createServerFn({ method: "POST" })
  .validator(KrakenAuth)
  .handler(async ({ data }) => {
    const rows = await fetchEarnStrategies(data);
    return { ok: true as const, message: "OK", rows };
  });

export const krakenEarnAllocate = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ strategyId: z.string().min(1), amount: z.number().positive() }))
  .handler(async ({ data }) => {
    return allocateEarn({ apiKey: data.apiKey, apiSecret: data.apiSecret }, data.strategyId, data.amount);
  });

export const krakenEarnDeallocate = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ strategyId: z.string().min(1), amount: z.number().positive() }))
  .handler(async ({ data }) => {
    return deallocateEarn({ apiKey: data.apiKey, apiSecret: data.apiSecret }, data.strategyId, data.amount);
  });

export const krakenDeposit = createServerFn({ method: "POST" })
  .validator(KrakenAuth.extend({ asset: z.string().min(2).max(12) }))
  .handler(async ({ data }) => {
    return fetchDepositAddress({ apiKey: data.apiKey, apiSecret: data.apiSecret }, data.asset);
  });

const BotKindSchema = z.enum([
  "grid",
  "dca",
  "rsi",
  "ema",
  "bollinger",
  "macd",
  "stoch",
  "vwap",
  "breakout",
  "supertrend",
  "volume",
  "scalp",
  "cci",
  "meanrev",
  "keltner",
  "roc",
  "adx",
  "williams",
  "ichimoku",
  "psar",
  "sma",
  "ha",
  "mfi",
  "engulf",
  "obv",
  "div",
]);

export const krakenEvaluateBot = createServerFn({ method: "POST" })
  .validator(
    z.object({
      kind: BotKindSchema,
      pair: z.string(),
      interval: z.number(),
      sizeQuote: z.number().positive(),
      params: z.record(z.string(), z.unknown()),
      runtime: z.record(z.string(), z.unknown()).optional(),
      ticker: z.object({
        id: z.string(),
        last: z.number(),
        bid: z.number(),
        ask: z.number(),
        open: z.number(),
        high: z.number(),
        low: z.number(),
        volume: z.number(),
        vwap: z.number(),
        change: z.number(),
        changePct: z.number(),
        trades: z.number(),
        quoteVolume: z.number(),
      }),
      candles: z
        .array(
          z.object({
            time: z.number(),
            open: z.number(),
            high: z.number(),
            low: z.number(),
            close: z.number(),
            volume: z.number(),
          }),
        )
        .optional(),
      equity: z.number().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const bot: Bot = {
      id: "eval",
      name: "eval",
      kind: data.kind as BotKind,
      venue: "live",
      status: "running",
      pair: data.pair,
      interval: data.interval,
      sizeQuote: data.sizeQuote,
      params: data.params as BotParams,
      createdAt: 0,
      lastNote: "",
      stats: { ...EMPTY_STATS },
      runtime: (data.runtime ?? {}) as BotRuntime,
    };
    const result = evaluateBot(bot, {
      now: Date.now(),
      ticker: data.ticker as Ticker,
      candles: data.candles as Candle[] | undefined,
      equity: data.equity,
      closedOnly: true,
    });
    return { ok: true as const, message: result.note, fills: result.fills, runtime: result.runtime };
  });
