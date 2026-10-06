import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOOK_RANGE_PCTS,
  bandLadder,
  bookCoveragePct,
  bookMid,
  depthHistogram,
  rangeSteps,
} from "./book-range.ts";
import type { BookLevel, OrderBook } from "./types.ts";

function lvl(price: number, size: number, total = size): BookLevel {
  return { price, size, total };
}

function bookAround(mid: number, farPct: number): OrderBook {
  const bids: BookLevel[] = [];
  const asks: BookLevel[] = [];
  let bidTotal = 0;
  let askTotal = 0;
  for (let i = 1; i <= 20; i++) {
    const pct = (farPct * i) / 20;
    const bSize = 1 + i * 0.1;
    const aSize = 1.2 + i * 0.08;
    bidTotal += bSize;
    askTotal += aSize;
    bids.push(lvl(mid * (1 - pct / 100), bSize, bidTotal));
    asks.push(lvl(mid * (1 + pct / 100), aSize, askTotal));
  }
  return { bids, asks, spread: asks[0]!.price - bids[0]!.price, spreadPct: 0 };
}

describe("bookMid / rangeSteps", () => {
  it("uses the bid/ask midpoint when both sides exist", () => {
    const book: OrderBook = {
      bids: [lvl(99, 1)],
      asks: [lvl(101, 1)],
      spread: 2,
      spreadPct: 2,
    };
    assert.equal(bookMid(book), 100);
  });

  it("falls back to last, then to a single side", () => {
    assert.equal(bookMid(undefined, 42), 42);
    assert.equal(bookMid({ bids: [lvl(50, 1)], asks: [], spread: 0, spreadPct: 0 }), 50);
    assert.equal(bookMid({ bids: [], asks: [lvl(70, 1)], spread: 0, spreadPct: 0 }), 70);
  });

  it("exposes the four range presets with matching ladders", () => {
    assert.deepEqual([...BOOK_RANGE_PCTS], [1, 5, 10, 25]);
    assert.deepEqual(rangeSteps(1), [0.2, 0.4, 0.6, 0.8, 1]);
    assert.deepEqual(rangeSteps(5), [1, 2, 3, 4, 5]);
    assert.deepEqual(rangeSteps(10), [2, 4, 6, 8, 10]);
    assert.deepEqual(rangeSteps(25), [5, 10, 15, 20, 25]);
  });
});

describe("bandLadder", () => {
  it("splits in-band size from cumulative totals", () => {
    const mid = 100;
    const bids = [
      lvl(99.5, 2),
      lvl(98.5, 3),
      lvl(96, 5),
      lvl(90, 8),
    ];
    const rows = bandLadder(bids, mid, [1, 2, 5, 10], "bid");
    assert.equal(rows.length, 4);
    assert.equal(rows[0]!.pct, 1);
    assert.equal(rows[0]!.size, 2);
    assert.equal(rows[1]!.size, 3);
    assert.equal(rows[2]!.size, 5);
    assert.equal(rows[3]!.size, 8);
    assert.equal(rows[0]!.total, 2);
    assert.equal(rows[1]!.total, 5);
    assert.equal(rows[2]!.total, 10);
    assert.equal(rows[3]!.total, 18);
    assert.equal(rows[0]!.price, 99);
    assert.equal(rows[3]!.price, 90);
  });

  it("keeps ask bands above mid and ignores the other side", () => {
    const asks = [lvl(100.5, 1), lvl(102, 4), lvl(108, 9)];
    const rows = bandLadder(asks, 100, [1, 5, 10], "ask");
    assert.equal(rows[0]!.size, 1);
    assert.equal(rows[1]!.size, 4);
    assert.equal(rows[2]!.size, 9);
    assert.equal(rows[2]!.total, 14);
    const leaked = bandLadder(asks, 100, [1, 5], "bid");
    assert.ok(leaked.every((r) => r.size === 0));
  });

  it("returns empty rows when mid is missing", () => {
    assert.deepEqual(bandLadder([lvl(1, 1)], 0, [1, 5], "bid"), []);
  });

  it("shows empty outer bands when the book is shallow", () => {
    const bids = [lvl(99.5, 2)];
    const rows = bandLadder(bids, 100, [1, 5, 10, 25], "bid");
    assert.equal(rows[0]!.size, 2);
    assert.equal(rows[1]!.size, 0);
    assert.equal(rows[2]!.size, 0);
    assert.equal(rows[3]!.size, 0);
    assert.equal(rows[3]!.total, 2);
  });

  it("accumulates quote notionals on each band", () => {
    const bids = [lvl(99.5, 2), lvl(98, 4)];
    const rows = bandLadder(bids, 100, [1, 5], "bid");
    assert.ok(Math.abs(rows[0]!.quote - 99.5 * 2) < 1e-9);
    assert.ok(Math.abs(rows[1]!.quote - 98 * 4) < 1e-9);
    assert.ok(rows[1]!.totalQuote > rows[0]!.totalQuote);
  });
});

describe("depthHistogram / coverage", () => {
  it("spans the selected window with 12 bins per side", () => {
    const book = bookAround(50_000, 4);
    const bins1 = depthHistogram(book.bids, book.asks, 50_000, 1);
    const bins25 = depthHistogram(book.bids, book.asks, 50_000, 25);
    assert.equal(bins1.length, 24);
    assert.equal(bins25.length, 24);
    assert.ok(bins1.every((b) => b.side === "bid" || b.side === "ask"));
    const ask1 = bins1.filter((b) => b.side === "ask");
    const ask25 = bins25.filter((b) => b.side === "ask");
    assert.ok(ask1[ask1.length - 1]!.toPct <= 1.0001);
    assert.ok(ask25[ask25.length - 1]!.toPct >= 24);
    const filled1 = ask1.filter((b) => b.size > 0).length;
    const filled25 = ask25.filter((b) => b.size > 0).length;
    assert.ok(filled1 > filled25, "a 1% window should fill more inner bins than a 25% window on a shallow book");
  });

  it("reports how far the book actually covers", () => {
    const book = bookAround(100, 8);
    const cov = bookCoveragePct(book, 100);
    assert.ok(cov.bid > 7 && cov.bid < 9);
    assert.ok(cov.ask > 7 && cov.ask < 9);
    assert.deepEqual(bookCoveragePct(undefined), { bid: 0, ask: 0 });
  });

  it("returns no bins when mid or range is invalid and honors perSide", () => {
    assert.deepEqual(depthHistogram([], [], 0, 5), []);
    assert.deepEqual(depthHistogram([], [], 100, 0), []);
    const book = bookAround(100, 2);
    const bins = depthHistogram(book.bids, book.asks, 100, 5, 4);
    assert.equal(bins.length, 8);
    assert.equal(bins.filter((b) => b.side === "bid").length, 4);
  });
});
