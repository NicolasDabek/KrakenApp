import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bookBuyBlock, bookHint, scoreBook } from "./book-score.ts";
import { bookFilterNote, defaultParams, untunedParams } from "./bots.ts";
import type { Bot, BookLevel, OrderBook } from "./types.ts";

function side(start: number, step: number, sizes: number[]): BookLevel[] {
  let total = 0;
  return sizes.map((size, i) => ((total += size), { price: start + step * i, size, total }));
}
function book(bidSizes: number[], askSizes: number[], at?: number): OrderBook {
  return {
    bids: side(99.95, -0.01, bidSizes),
    asks: side(100.05, 0.01, askSizes),
    spread: 0.1,
    spreadPct: 0.1,
    at,
  };
}
const flat = (n: number, s: number) => Array.from({ length: n }, () => s);

describe("scoreBook", () => {
  it("returns null for an empty or crossed book", () => {
    assert.equal(scoreBook(undefined), null);
    assert.equal(scoreBook({ bids: [], asks: [], spread: 0, spreadPct: 0 }), null);
  });
  it("scores a balanced book ~0 and a bid-heavy book > 0 on 5/10/25 levels", () => {
    const bal = scoreBook(book(flat(30, 5), flat(30, 5)))!;
    assert.ok(Math.abs(bal.score) < 0.01);
    assert.deepEqual(
      bal.depths.map((d) => d.levels),
      [5, 10, 25],
    );
    const bull = scoreBook(book(flat(30, 15), flat(30, 5)))!;
    assert.ok(bull.score > 0.4);
    assert.equal(bull.bidWall, null);
  });
  it("detects a near ask wall and thin bids", () => {
    const asks = flat(30, 5);
    asks[3] = 40; // ×8 la médiane, à ~0,08 %
    const s = scoreBook(book(flat(30, 5), asks))!;
    assert.ok(s.askWall && s.askWall.ratio >= 7);
    assert.equal(bookBuyBlock(s, "soft")?.startsWith("Mur vendeur"), true);
    const thin = scoreBook(book(flat(30, 0.1), flat(30, 0.1)))!;
    assert.equal(thin.thinBids, true);
    assert.match(bookHint(thin)!, /acheteurs minces/);
  });
  it("soft vs strict thresholds", () => {
    const s = scoreBook(book(flat(30, 5), flat(30, 9)))!; // ≈ −0,29
    assert.equal(bookBuyBlock(s, "soft"), null);
    assert.match(bookBuyBlock(s, "strict")!, /Carnet vendeur/);
    assert.equal(bookBuyBlock(s, "off"), null);
  });
});

describe("bookFilterNote", () => {
  const bot = (kind: Bot["kind"], bookFilter?: "off" | "soft" | "strict") =>
    ({ kind, params: { bookFilter } }) as unknown as Bot;
  const heavy = book(flat(30, 1), flat(30, 30), 1_000);
  const ctx = (b?: OrderBook, now = 2_000) => ({ now, ticker: { last: 100 } as never, book: b });
  it("is a no-op when off, unsupported kind, no book or stale book", () => {
    assert.equal(bookFilterNote(bot("scalp", "off"), ctx(heavy)), null);
    assert.equal(bookFilterNote(bot("scalp"), ctx(heavy)), null);
    assert.equal(bookFilterNote(bot("grid", "strict"), ctx(heavy)), null);
    assert.equal(bookFilterNote(bot("dca", "strict"), ctx(heavy)), null);
    assert.equal(bookFilterNote(bot("ema", "strict"), ctx(heavy)), null);
    assert.equal(bookFilterNote(bot("scalp", "soft"), ctx(undefined)), null);
    assert.equal(bookFilterNote(bot("scalp", "soft"), ctx(heavy, 60_000)), null);
  });
  it("blocks buys into a seller-heavy book", () => {
    assert.match(bookFilterNote(bot("scalp", "soft"), ctx(heavy))!, /pas d’achat/);
    assert.match(bookFilterNote(bot("rsi", "soft"), ctx(heavy))!, /pas d’achat/);
  });
  it("defaults: soft for book kinds on new bots, absent elsewhere and in untuned params", () => {
    assert.equal(defaultParams("scalp", 100).bookFilter, "soft");
    assert.equal(defaultParams("breakout", 100).bookFilter, "soft");
    assert.equal(defaultParams("ema", 100).bookFilter, undefined);
    assert.equal(defaultParams("grid", 100).bookFilter, undefined);
    assert.equal(untunedParams("scalp", 100).bookFilter, undefined);
  });
});
