import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { downloadCsv, logReturns, pearson, rangePosition, rewardRisk, sizeFromRisk } from "./stats.ts";

describe("rangePosition", () => {
  it("maps last inside the 24h range to 0..1", () => {
    assert.equal(rangePosition(90, 110, 100), 0.5);
    assert.equal(rangePosition(90, 110, 90), 0);
    assert.equal(rangePosition(90, 110, 110), 1);
    assert.equal(rangePosition(90, 110, 200), 1);
    assert.equal(rangePosition(90, 110, 0), 0);
  });

  it("returns the midpoint when the range is degenerate", () => {
    assert.equal(rangePosition(10, 10, 10), 0.5);
    assert.equal(rangePosition(Number.NaN, 10, 10), 0.5);
  });
});

describe("logReturns / pearson", () => {
  it("computes successive log returns", () => {
    const r = logReturns([100, 110, 99]);
    assert.equal(r.length, 2);
    assert.ok(Math.abs(r[0]! - Math.log(1.1)) < 1e-12);
    assert.deepEqual(logReturns([0, 1, 2]), [Math.log(2)]);
  });

  it("returns 0 below 4 samples and ±1 on aligned series", () => {
    assert.equal(pearson([1, 2, 3], [3, 2, 1]), 0);
    const xs = [1, 2, 3, 4, 5, 6];
    assert.ok(Math.abs(pearson(xs, xs) - 1) < 1e-9);
    assert.ok(Math.abs(pearson(xs, xs.map((x) => -x)) + 1) < 1e-9);
    assert.equal(pearson([1, 1, 1, 1], [2, 3, 4, 5]), 0);
    assert.deepEqual(logReturns([]), []);
    assert.deepEqual(logReturns([5]), []);
  });
});

describe("sizeFromRisk / rewardRisk", () => {
  it("sizes a position from equity, risk % and stop distance", () => {
    const s = sizeFromRisk(10_000, 1, 100, 90);
    assert.equal(s.risk, 100);
    assert.equal(s.qty, 10);
    assert.equal(s.notional, 1000);
  });

  it("returns zeros on invalid inputs", () => {
    assert.equal(sizeFromRisk(0, 1, 100, 90).qty, 0);
    assert.equal(sizeFromRisk(10_000, 1, 100, 100).qty, 0);
  });

  it("computes reward / risk", () => {
    assert.equal(rewardRisk(100, 90, 120), 2);
    assert.equal(rewardRisk(100, 100, 120), 0);
  });

  it("handles a short stop above entry", () => {
    const s = sizeFromRisk(5_000, 2, 100, 110);
    assert.equal(s.risk, 100);
    assert.equal(s.qty, 10);
    assert.equal(rewardRisk(100, 110, 80), 2);
  });
});

describe("downloadCsv", () => {
  it("quotes cells and clicks a download link", () => {
    const clicks: string[] = [];
    const g = globalThis as typeof globalThis & { document?: { createElement: (tag: string) => unknown } };
    const prevDoc = g.document;
    const prevCreate = URL.createObjectURL;
    const prevRevoke = URL.revokeObjectURL;
    g.document = {
      createElement: (tag: string) => {
        assert.equal(tag, "a");
        const el = { href: "", download: "", click() { clicks.push(this.download); } };
        return el;
      },
    } as unknown as Document;
    URL.createObjectURL = () => "blob:csv-test";
    URL.revokeObjectURL = () => {};
    try {
      downloadCsv("trades.csv", [
        ["side", 'note "x"'],
        ["buy", "ok"],
      ]);
      assert.equal(clicks[0], "trades.csv");
    } finally {
      if (prevDoc) g.document = prevDoc;
      else delete (g as { document?: unknown }).document;
      URL.createObjectURL = prevCreate;
      URL.revokeObjectURL = prevRevoke;
    }
  });
});
