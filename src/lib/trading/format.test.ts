import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatCompact,
  formatDateTime,
  formatFiat,
  formatKrakenVolume,
  formatPct,
  formatPrice,
  formatQty,
  formatTime,
  parseDecimal,
  uid,
} from "./format.ts";

const squeeze = (s: string) => s.replace(/\s/g, " ").replace(/−/g, "-");

describe("formatPrice / formatQty", () => {
  it("renders a fixed number of decimals in fr-FR", () => {
    assert.equal(squeeze(formatPrice(12.5, 2)), "12,50");
    assert.equal(squeeze(formatPrice(1234.567, 1)), "1 234,6");
    assert.equal(formatPrice(Number.NaN, 2), "—");
  });

  it("clamps decimals between 0 and 10", () => {
    assert.match(formatPrice(1.23456789, 0), /1/);
    assert.doesNotThrow(() => formatPrice(1, 99));
  });

  it("compacts large quantities", () => {
    assert.match(squeeze(formatQty(12_500)), /12 500/);
    assert.equal(formatQty(Number.NaN), "—");
  });

  it("lit une virgule française et un séparateur de milliers", () => {
    assert.equal(parseDecimal("1,5"), 1.5);
    assert.equal(parseDecimal("1.5"), 1.5);
    assert.equal(parseDecimal("1 234,56"), 1234.56);
    assert.equal(parseDecimal("1.234,56"), 1234.56);
    assert.equal(parseDecimal(""), null);
    assert.equal(parseDecimal("abc"), null);
  });
});

describe("formatFiat / formatPct / formatCompact", () => {
  it("prints EUR and USD with two decimals", () => {
    assert.match(formatFiat(10, "EUR"), /10,00/);
    assert.match(formatFiat(10, "USD"), /10,00/);
    assert.equal(formatFiat(Number.NaN), "—");
  });

  it("signs percentages with a proper minus", () => {
    assert.match(squeeze(formatPct(1.5)), /\+1,50 %/);
    assert.match(squeeze(formatPct(-2.25)), /-2,25 %/);
    assert.match(squeeze(formatPct(0)), /0,00 %/);
    assert.equal(formatPct(Number.NaN), "—");
  });

  it("abbreviates large notionals", () => {
    assert.match(squeeze(formatCompact(1_500_000_000)), /1,5 Md/);
    assert.match(squeeze(formatCompact(2_300_000)), /2,3 M/);
    assert.match(squeeze(formatCompact(4_200)), /4,2 k/);
    assert.match(squeeze(formatCompact(-4_200)), /-4,2 k/);
    assert.equal(formatCompact(Number.NaN), "—");
  });

  it("keeps small quantities and compact values unabbreviated", () => {
    assert.match(formatQty(0.123456), /0,123456|0.123456/);
    assert.match(formatCompact(12.5), /12,5|12.5/);
    assert.match(formatFiat(1, "EUR"), /1,00/);
  });
});

describe("formatKrakenVolume / uid", () => {
  it("strips trailing zeros for Kraken volume strings", () => {
    assert.equal(formatKrakenVolume(1.23, 8), "1.23");
    assert.equal(formatKrakenVolume(1, 8), "1");
    assert.equal(formatKrakenVolume(0.00005, 8), "0.00005");
    assert.equal(formatKrakenVolume(0, 8), "0");
    assert.equal(formatKrakenVolume(-1, 8), "0");
  });

  it("builds unique prefixed ids", () => {
    const a = uid("bot");
    const b = uid("bot");
    assert.match(a, /^bot-[a-z0-9]+-[a-z0-9]+$/);
    assert.notEqual(a, b);
    assert.match(uid(), /^n-/);
  });

  it("formats clock and calendar stamps in fr-FR", () => {
    const ts = Date.UTC(2026, 2, 15, 12, 30, 45);
    const time = formatTime(ts);
    const dt = formatDateTime(ts);
    assert.match(time, /\d{2}:\d{2}:\d{2}/);
    assert.match(dt, /\d{2}/);
    assert.ok(dt.length > 6);
  });
});
