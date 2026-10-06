import { backtestFetchInterval, PAIR_BY_ID, PAIR_BY_RESULT, TICKER_QUERY } from "./pairs.ts";
import type { BookLevel, Candle, OrderBook, TapeTrade, Ticker } from "./types";

const KRAKEN = "https://api.kraken.com/0/public";

type CacheEntry = { at: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function kraken<T>(path: string, ttlMs: number): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  try {
    const res = await fetch(`${KRAKEN}/${path}`, {
      headers: { "User-Agent": "Nautilus-Trading-Terminal/1.0" },
    });
    if (!res.ok) throw new Error(`Kraken HTTP ${res.status}`);
    const json = (await res.json()) as { error: string[]; result: T };
    if (json.error?.length) throw new Error(json.error.join(", "));
    cache.set(path, { at: Date.now(), data: json.result });
    return json.result;
  } catch (err) {
    if (hit) return hit.data as T;
    throw err;
  }
}

type RawTicker = {
  a: string[];
  b: string[];
  c: string[];
  v: string[];
  p: string[];
  t: number[];
  l: string[];
  h: string[];
  o: string;
};

function num(v: string | number | undefined): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parseTickers(raw: Record<string, RawTicker>): Ticker[] {
  const out: Ticker[] = [];
  for (const [key, t] of Object.entries(raw)) {
    const meta = PAIR_BY_RESULT[key] ?? PAIR_BY_ID[key];
    if (!meta) continue;
    const last = num(t.c?.[0]);
    const open = num(t.o);
    const change = last - open;
    const changePct = open ? (change / open) * 100 : 0;
    const volume = num(t.v?.[1]);
    const vwap = num(t.p?.[1]);
    out.push({
      id: meta.id,
      last,
      bid: num(t.b?.[0]),
      ask: num(t.a?.[0]),
      open,
      high: num(t.h?.[1]),
      low: num(t.l?.[1]),
      volume,
      vwap,
      change,
      changePct,
      trades: num(t.t?.[1]),
      quoteVolume: volume * vwap,
    });
  }
  const rank = Object.fromEntries(PAIR_BY_ID ? Object.keys(PAIR_BY_ID).map((id, i) => [id, i]) : []);
  out.sort((a, b) => (rank[a.id] ?? 99) - (rank[b.id] ?? 99));
  return out;
}

export async function getTickers(): Promise<Ticker[]> {
  const raw = await kraken<Record<string, RawTicker>>(`Ticker?pair=${TICKER_QUERY}`, 1800);
  return parseTickers(raw);
}

const OHLC_INTERVALS = new Set([1, 5, 15, 30, 60, 240, 1440, 10080, 21600]);

export async function getOhlc(pair: string, interval: number, since?: number): Promise<Candle[]> {
  const meta = PAIR_BY_ID[pair] ?? PAIR_BY_RESULT[pair];
  const krakenPair = meta?.id ?? pair;
  const iv = OHLC_INTERVALS.has(interval) ? interval : 60;
  const extra = since && since > 0 ? `&since=${since}` : "";
  const raw = await kraken<Record<string, unknown[][] | number>>(
    `OHLC?pair=${encodeURIComponent(krakenPair)}&interval=${iv}${extra}`,
    since ? 20_000 : 8000,
  );
  const rows = Object.values(raw).find((v) => Array.isArray(v) && Array.isArray(v[0])) ?? [];
  return (rows as unknown[][]).map((row) => ({
    time: num(row[0] as number),
    open: num(row[1] as string),
    high: num(row[2] as string),
    low: num(row[3] as string),
    close: num(row[4] as string),
    volume: num(row[6] as string),
  }));
}

/** Last ~720 bars. Drops the uncommitted current frame. `since` never rewinds on Kraken. */
export async function getOhlcHistory(
  pair: string,
  interval: number,
  since: number,
  days?: number,
): Promise<{ candles: Candle[]; interval: number }> {
  const now = Math.floor(Date.now() / 1000);
  const span = days && days > 0 ? days : (now - Math.max(0, since)) / 86_400;
  const used = backtestFetchInterval(span, interval);
  const raw = await getOhlc(pair, used);
  if (raw.length === 0) return { candles: [], interval: used };

  const frameSec = used * 60;
  const frameStart = Math.floor(now / frameSec) * frameSec;
  const committed = raw[raw.length - 1]!.time >= frameStart ? raw.slice(0, -1) : raw;
  const cut = since > 0 ? since : now - Math.round(span) * 86_400;
  const windowed = committed.filter((c) => c.time >= cut);
  return { candles: windowed.length ? windowed : committed, interval: used };
}

function levels(rows: string[][], side: "bid" | "ask"): BookLevel[] {
  const sorted = [...rows]
    .map((r) => ({ price: num(r[0]), size: num(r[1]), total: 0 }))
    .sort((a, b) => (side === "bid" ? b.price - a.price : a.price - b.price));
  let acc = 0;
  return sorted.map((l) => {
    acc += l.size;
    return { ...l, total: acc };
  });
}

export async function getDepth(pair: string): Promise<OrderBook> {
  const raw = await kraken<Record<string, { bids: string[][]; asks: string[][] }>>(
    `Depth?pair=${encodeURIComponent(pair)}&count=500`,
    1200,
  );
  const book = Object.values(raw)[0] ?? { bids: [], asks: [] };
  const bids = levels(book.bids ?? [], "bid");
  const asks = levels(book.asks ?? [], "ask");
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[0]?.price ?? 0;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
  const mid = (bestAsk + bestBid) / 2;
  return { bids, asks, spread, spreadPct: mid ? (spread / mid) * 100 : 0 };
}

export async function getTrades(pair: string): Promise<TapeTrade[]> {
  const raw = await kraken<Record<string, unknown[][]>>(
    `Trades?pair=${encodeURIComponent(pair)}`,
    1500,
  );
  const rows = Object.values(raw).find((v) => Array.isArray(v) && Array.isArray(v[0])) ?? [];
  return rows
    .slice(-40)
    .reverse()
    .map((row, i) => ({
      id: String(row[6] ?? `${row[2]}-${i}`),
      price: num(row[0] as string),
      size: num(row[1] as string),
      side: row[3] === "b" ? "buy" : "sell",
      time: Math.round(num(row[2] as number) * 1000),
    }));
}

export async function pingKraken(): Promise<{ ok: boolean; ms: number }> {
  const t0 = Date.now();
  await kraken<Record<string, string>>("Time", 5000);
  return { ok: true, ms: Date.now() - t0 };
}
