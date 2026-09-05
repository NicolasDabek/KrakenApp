import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callKrakenPrivate, parseKrakenBalances } from "./kraken-private.server";
import { getDepth, getOhlc, getOhlcHistory, getTickers, getTrades, pingKraken } from "./kraken.server";

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

export const krakenOpenOrders = createServerFn({ method: "POST" })
  .validator(KrakenAuth)
  .handler(async ({ data }) => {
    const res = await callKrakenPrivate<{ open?: Record<string, { descr?: { pair?: string; type?: string } }> }>(
      data.apiKey,
      data.apiSecret,
      "OpenOrders",
    );
    if (!res.ok) return { ok: false as const, message: res.message, count: 0 };
    return { ok: true as const, message: "OK", count: Object.keys(res.result?.open ?? {}).length };
  });
