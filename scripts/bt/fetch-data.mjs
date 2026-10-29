// Downloads public OHLCV history (Binance spot klines, no key) into scripts/bt/.data/
// Usage: node scripts/bt/fetch-data.mjs   (Node 22)
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = new URL("./.data/", import.meta.url);
mkdirSync(OUT, { recursive: true });
export const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LINKUSDT", "AVAXUSDT"];
export const SETS = [{ iv: 60, days: 365 }, { iv: 15, days: 90 }];
const step = { 15: "15m", 60: "1h" };
for (const { iv, days } of SETS) for (const p of PAIRS) {
  const end = Date.UTC(2026, 9, 28); // fixed end date → reproducible dataset
  let t = end - days * 86400e3;
  const rows = [];
  while (t < end) {
    const u = `https://data-api.binance.vision/api/v3/klines?symbol=${p}&interval=${step[iv]}&startTime=${t}&endTime=${end}&limit=1000`;
    const r = await (await fetch(u)).json();
    if (!Array.isArray(r) || !r.length) break;
    for (const k of r) rows.push({ time: k[0] / 1000, open: +k[1], high: +k[2], low: +k[3], close: +k[4], volume: +k[5], vwap: +k[7] / (+k[5] || 1), count: k[8] });
    t = r[r.length - 1][0] + iv * 60e3;
  }
  writeFileSync(new URL(`${p}_${iv}.json`, OUT), JSON.stringify(rows));
  console.log(p, iv, rows.length);
}
