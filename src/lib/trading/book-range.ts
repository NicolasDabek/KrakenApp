import type { BookLevel, OrderBook } from "./types.ts";

export const BOOK_RANGE_PCTS = [1, 5, 10, 25] as const;
export type BookRangePct = (typeof BOOK_RANGE_PCTS)[number];

export type BandRow = {
  pct: number;
  price: number;
  size: number;
  quote: number;
  total: number;
  totalQuote: number;
};

export type DepthBin = {
  fromPct: number;
  toPct: number;
  side: "bid" | "ask";
  size: number;
  quote: number;
  cumul: number;
  cumulQuote: number;
};

export function bookMid(book?: OrderBook, last?: number): number {
  const bid = book?.bids[0]?.price ?? 0;
  const ask = book?.asks[0]?.price ?? 0;
  if (bid > 0 && ask > 0) return (bid + ask) / 2;
  return last && last > 0 ? last : bid || ask;
}

export function rangeSteps(pct: BookRangePct): number[] {
  if (pct === 1) return [0.2, 0.4, 0.6, 0.8, 1];
  if (pct === 5) return [1, 2, 3, 4, 5];
  if (pct === 10) return [2, 4, 6, 8, 10];
  return [5, 10, 15, 20, 25];
}

export function bookCoveragePct(book?: OrderBook, mid?: number): { bid: number; ask: number } {
  const m = mid && mid > 0 ? mid : bookMid(book);
  if (!(m > 0) || !book) return { bid: 0, ask: 0 };
  const farBid = book.bids[book.bids.length - 1]?.price;
  const farAsk = book.asks[book.asks.length - 1]?.price;
  return {
    bid: farBid && farBid < m ? ((m - farBid) / m) * 100 : 0,
    ask: farAsk && farAsk > m ? ((farAsk - m) / m) * 100 : 0,
  };
}

function inPriceBand(price: number, inner: number, outer: number, side: "bid" | "ask"): boolean {
  return side === "ask" ? price > inner && price <= outer : price < inner && price >= outer;
}

export function bandLadder(
  levels: BookLevel[],
  mid: number,
  steps: number[],
  side: "bid" | "ask",
): BandRow[] {
  if (!(mid > 0)) return [];
  let cumul = 0;
  let quoteCumul = 0;
  return steps.map((stepPct, i) => {
    const prev = i === 0 ? 0 : steps[i - 1]!;
    const inner = side === "ask" ? mid * (1 + prev / 100) : mid * (1 - prev / 100);
    const outer = side === "ask" ? mid * (1 + stepPct / 100) : mid * (1 - stepPct / 100);
    let size = 0;
    let quote = 0;
    for (const l of levels) {
      if (!inPriceBand(l.price, inner, outer, side)) continue;
      size += l.size;
      quote += l.size * l.price;
    }
    cumul += size;
    quoteCumul += quote;
    return { pct: stepPct, price: outer, size, quote, total: cumul, totalQuote: quoteCumul };
  });
}

export function depthHistogram(
  bids: BookLevel[],
  asks: BookLevel[],
  mid: number,
  rangePct: number,
  perSide = 12,
): DepthBin[] {
  if (!(mid > 0) || rangePct <= 0 || perSide < 1) return [];
  const width = rangePct / perSide;

  const fillSide = (levels: BookLevel[], side: "bid" | "ask"): DepthBin[] => {
    const rows: DepthBin[] = [];
    let cumul = 0;
    let cumulQuote = 0;
    for (let i = 1; i <= perSide; i++) {
      const fromPct = side === "bid" ? -i * width : (i - 1) * width;
      const toPct = side === "bid" ? -(i - 1) * width : i * width;
      const inner = mid * (1 + (side === "bid" ? toPct : fromPct) / 100);
      const outer = mid * (1 + (side === "bid" ? fromPct : toPct) / 100);
      let size = 0;
      let quote = 0;
      for (const l of levels) {
        if (!inPriceBand(l.price, inner, outer, side)) continue;
        size += l.size;
        quote += l.size * l.price;
      }
      cumul += size;
      cumulQuote += quote;
      rows.push({ fromPct, toPct, side, size, quote, cumul, cumulQuote });
    }
    return rows;
  };

  const bidRows = fillSide(bids, "bid").slice().reverse();
  const askRows = fillSide(asks, "ask");
  return [...bidRows, ...askRows];
}
