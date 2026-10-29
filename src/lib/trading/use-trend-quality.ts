import { useEffect, useState } from "react";
import { fetchOhlc } from "./functions";
import { trendQuality, type TrendQuality } from "./indicators";

/** Bougies 1 h : EMA 20/50 couvre ~2 jours, assez stable pour la vue marché. */
const INTERVAL = 60;
const TTL_MS = 10 * 60_000;
const MAX_PARALLEL = 3;

const cache = new Map<string, { at: number; value: TrendQuality | null }>();
const pending = new Map<string, Promise<TrendQuality | null>>();
const queue: (() => void)[] = [];
let active = 0;

function schedule<T>(job: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active++;
      job()
        .then(resolve, reject)
        .finally(() => {
          active--;
          queue.shift()?.();
        });
    };
    if (active < MAX_PARALLEL) run();
    else queue.push(run);
  });
}

function load(pair: string): Promise<TrendQuality | null> {
  const hit = cache.get(pair);
  if (hit && Date.now() - hit.at < TTL_MS) return Promise.resolve(hit.value);
  const inflight = pending.get(pair);
  if (inflight) return inflight;
  const p = schedule(() => fetchOhlc({ data: { pair, interval: INTERVAL } }))
    .then((candles) => {
      // Drop the still-forming hourly bar so volume is not read as "falling".
      const closed = candles.length > 1 ? candles.slice(0, -1) : candles;
      const value = closed.length ? trendQuality(closed) : null;
      cache.set(pair, { at: Date.now(), value });
      return value;
    })
    .catch(() => null)
    .finally(() => pending.delete(pair));
  pending.set(pair, p);
  return p;
}

/** Qualité de tendance EMA 20/50 + volume (1 h) d'une paire, chargée à la demande et mise en cache 10 min. */
export function useTrendQuality(pair: string | undefined, enabled = true): TrendQuality | null {
  const [value, setValue] = useState<TrendQuality | null>(() => (pair ? (cache.get(pair)?.value ?? null) : null));
  useEffect(() => {
    if (!pair || !enabled) return;
    let alive = true;
    void load(pair).then((v) => {
      if (alive) setValue(v);
    });
    return () => {
      alive = false;
    };
  }, [pair, enabled]);
  return value;
}
