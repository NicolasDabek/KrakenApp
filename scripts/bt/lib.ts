// Backtest harness shared by tune.ts / report. Node 22: node --experimental-strip-types
import { readFileSync, existsSync } from "node:fs";
import { backtestBot } from "../../src/lib/trading/bots.ts";
import type { BotKind, BotParams, Candle } from "../../src/lib/trading/types.ts";

export const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LINKUSDT", "AVAXUSDT"];
export const IVS = [60, 15];
export const LOOKBACK = 500; // bars handed to the bot each step (live sees ~720)
export const IS_FRAC = 0.65; // first 65% in-sample, last 35% out-of-sample
export const FEE = 0.004; // Kraken taker 0.40%
export const SIZE = 500;
export const START = 10_000;

export type Metrics = { pnl: number; trades: number; dd: number; wins: number; losses: number };
export type DsResult = { ds: string; is: Metrics; oos: Metrics };

export const DATASETS = PAIRS.flatMap((p) => IVS.map((iv) => ({ id: `${p}_${iv}`, pair: p, iv })));

const cache = new Map<string, Candle[]>();
export function load(id: string): Candle[] {
  let c = cache.get(id);
  if (!c) {
    const f = new URL(`./.data/${id}.json`, import.meta.url);
    if (!existsSync(f)) throw new Error(`missing ${id}: run node scripts/bt/fetch-data.mjs`);
    c = JSON.parse(readFileSync(f, "utf8")) as Candle[];
    cache.set(id, c);
  }
  return c;
}

function m(kind: BotKind, params: BotParams, candles: Candle[], iv: number): Metrics {
  const r = backtestBot(kind, params, SIZE, candles, FEE, "XBTEUR", { interval: iv, warmup: LOOKBACK, startingBalance: START, lookback: LOOKBACK });
  if (!r) return { pnl: 0, trades: 0, dd: 0, wins: 0, losses: 0 };
  return { pnl: r.pnl, trades: r.trades, dd: r.maxDrawdownPct, wins: r.wins, losses: r.losses };
}

export function runDataset(kind: BotKind, params: BotParams, dsId: string): DsResult {
  const ds = DATASETS.find((d) => d.id === dsId)!;
  const c = load(dsId);
  const split = Math.floor(c.length * IS_FRAC);
  return { ds: dsId, is: m(kind, params, c.slice(0, split), ds.iv), oos: m(kind, params, c.slice(split - LOOKBACK), ds.iv) };
}

export type Agg = { pnl: number; trades: number; dd: number; win: number };
export function agg(rows: DsResult[], side: "is" | "oos"): Agg {
  let pnl = 0, trades = 0, dd = 0, w = 0, l = 0;
  for (const r of rows) {
    const x = r[side];
    pnl += x.pnl; trades += x.trades; dd = Math.max(dd, x.dd); w += x.wins; l += x.losses;
  }
  return { pnl, trades, dd, win: w + l ? (100 * w) / (w + l) : 0 };
}
