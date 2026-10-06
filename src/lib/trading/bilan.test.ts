import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bilanToCsv, buildBilan, periodStart } from "./bilan.ts";
import { parisDate } from "./fiscal.ts";

describe("bilan", () => {
  const now = parisDate(2026, 10, 3, 18);

  it("ignore les ventes d'avant aujourd'hui, heure de Paris", () => {
    const report = buildBilan(
      [
        { pair: "XBTEUR", side: "sell", amount: 0.01, price: 100_000, fee: 2, pnl: 40, time: parisDate(2026, 10, 2, 23) },
        { pair: "XBTEUR", side: "sell", amount: 0.01, price: 101_000, fee: 3, pnl: -10, time: parisDate(2026, 10, 3, 9) },
        { pair: "ETHEUR", side: "buy", amount: 1, price: 3000, fee: 1, pnl: 0, time: parisDate(2026, 10, 3, 10) },
      ],
      "today",
      now,
    );
    assert.equal(report.sells, 1);
    assert.equal(report.buys, 1);
    assert.equal(report.pnl, -10);
    assert.equal(report.wins, 0);
    assert.equal(report.losses, 1);
    assert.equal(report.rows.length, 2);
    assert.ok(report.from <= parisDate(2026, 10, 3, 0));
    assert.ok(periodStart("7d", now) < parisDate(2026, 10, 2, 23));
  });

  it("exporte un CSV avec virgule décimale", () => {
    const report = buildBilan(
      [{ pair: "XBTEUR", side: "sell", amount: 1, price: 10, fee: 0.26, pnl: 1.5, time: now }],
      "all",
      now,
    );
    const csv = bilanToCsv(report);
    assert.match(csv, /XBTEUR;0;1;0,26;1,50;10,00;1/);
    assert.match(csv, /TOTAL;0;1/);
  });
});
