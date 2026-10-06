import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crc32 as zlibCrc } from "node:zlib";
import {
  buildFiscalReport,
  CESSION_EXEMPT_EUR,
  movesFromFills,
  movesFromLedgers,
  legsFromKrakenCsv,
  parisDate,
  resolvePeriod,
  type FiscalMove,
} from "./fiscal.ts";
import { crc32, reportToCsv, reportToDocx, reportToPdf, reportToText, reportToXlsx } from "./fiscal-export.ts";

const id = { firstName: "Ada", lastName: "Martin", taxId: "123", accountRef: "KR-1" };

function buy(time: number, asset: string, qty: number, eur: number, fee = 0): FiscalMove {
  return { id: `b-${time}`, time, kind: "buy", asset, qty, quote: "EUR", quoteQty: eur, feeEur: fee, source: "kraken" };
}

function sell(time: number, asset: string, qty: number, eur: number, fee = 0): FiscalMove {
  return { id: `s-${time}`, time, kind: "sell", asset, qty, quote: "EUR", quoteQty: eur, feeEur: fee, source: "kraken" };
}

describe("période fiscale Europe/Paris", () => {
  it("borne une année civile et un mois", () => {
    const year = resolvePeriod({ kind: "year", year: 2025 });
    assert.equal(year.calendarYear, 2025);
    assert.equal(year.start, parisDate(2025, 1, 1));
    assert.equal(year.end, parisDate(2026, 1, 1) - 1);
    const month = resolvePeriod({ kind: "month", year: 2025, month: 3 });
    assert.equal(month.label, "mars 2025");
    assert.equal(month.calendarYear, undefined);
    assert.ok(month.end > month.start);
  });
});

describe("méthode 2086", () => {
  const year = resolvePeriod({ kind: "year", year: 2025 });

  it("calcule une plus-value simple quand tout le portefeuille est cédé", () => {
    const report = buildFiscalReport([buy(year.start, "BTC", 1, 1000), sell(year.start + 10, "BTC", 1, 1500)], year);
    assert.equal(report.cessions.length, 1);
    assert.equal(report.cessions[0]!.acquiredEur, 1000);
    assert.equal(report.cessions[0]!.gainEur, 500);
    assert.equal(report.net, 500);
    assert.equal(report.exempt, false);
    assert.equal(report.tax?.total, Math.round(500 * 0.3 * 100) / 100);
  });

  it("impute une fraction du prix d'acquisition quand un autre actif reste", () => {
    const report = buildFiscalReport(
      [
        buy(year.start, "BTC", 1, 1000),
        buy(year.start + 1, "ETH", 1, 1000),
        sell(year.start + 2, "BTC", 1, 1500),
      ],
      year,
    );
    const row = report.cessions[0]!;
    assert.equal(row.portfolioEur, 2500);
    assert.equal(row.acquiredEur, 1200);
    assert.equal(row.gainEur, 300);
    assert.ok(report.closingPta > 0);
  });

  it("n'impose pas un échange crypto-crypto et déduit les frais", () => {
    const report = buildFiscalReport(
      [
        buy(year.start, "BTC", 1, 1000, 10),
        {
          id: "swap",
          time: year.start + 1,
          kind: "swap",
          asset: "BTC",
          qty: 1,
          quote: "ETH",
          quoteQty: 10,
          source: "kraken",
        },
        sell(year.start + 2, "ETH", 10, 1500, 15),
      ],
      year,
    );
    assert.equal(report.swapCount, 1);
    assert.equal(report.cessions.length, 1);
    assert.equal(report.cessions[0]!.netEur, 1485);
    assert.equal(report.cessions[0]!.gainEur, 1485 - 1010);
  });

  it("exonère si les cessions brutes de l'année ne dépassent pas 305 €", () => {
    const report = buildFiscalReport([buy(year.start, "BTC", 1, 100), sell(year.start + 1, "BTC", 1, 200)], year);
    assert.ok(report.yearCessions[0]!.total <= CESSION_EXEMPT_EUR);
    assert.equal(report.exempt, true);
    assert.equal(report.tax, null);
  });

  it("reprend le prix d'acquisition acquis avant la période", () => {
    const before = parisDate(2024, 6, 1);
    const report = buildFiscalReport([buy(before, "BTC", 1, 800), sell(year.start + 5, "BTC", 0.5, 500)], year);
    assert.equal(report.openingPta, 800);
    assert.equal(report.cessions[0]!.acquiredEur, 400);
    assert.equal(report.cessions[0]!.gainEur, 100);
  });

  it("traite un revenu de staking à part et l'intègre au prix de revient", () => {
    const report = buildFiscalReport(
      [
        {
          id: "earn",
          time: year.start,
          kind: "income",
          asset: "ETH",
          qty: 0.1,
          quoteQty: 200,
          source: "kraken",
          note: "staking",
        },
        sell(year.start + 1, "ETH", 0.1, 250),
      ],
      year,
    );
    assert.equal(report.incomes.length, 1);
    assert.equal(report.incomes[0]!.valueEur, 200);
    assert.equal(report.cessions[0]!.gainEur, 50);
  });

  it("exonère sur le prix net de frais, pas sur le brut", () => {
    const report = buildFiscalReport([buy(year.start, "BTC", 1, 100), sell(year.start + 1, "BTC", 1, 310, 10)], year);
    assert.equal(report.cessions[0]!.netEur, 300);
    assert.equal(report.yearCessions[0]!.total, 300);
    assert.equal(report.exempt, true);
    assert.equal(report.declaration?.reportBox, "none");
  });

  it("applique 30 % jusqu'en 2025 et 31,4 % dès 2026", () => {
    const y2026 = resolvePeriod({ kind: "year", year: 2026 });
    const old = buildFiscalReport([buy(year.start, "BTC", 1, 1000), sell(year.start + 10, "BTC", 1, 1500)], year);
    const next = buildFiscalReport([buy(y2026.start, "BTC", 1, 1000), sell(y2026.start + 10, "BTC", 1, 1500)], y2026);
    assert.equal(old.tax?.label, "30 %");
    assert.equal(old.tax?.total, 150);
    assert.equal(next.tax?.label, "31,4 %");
    assert.equal(next.tax?.ps, 93);
    assert.equal(next.tax?.total, 157);
    assert.equal(next.declaration?.reportBox, "3AN");
    assert.equal(next.declaration?.reportEuros, 500);
  });

  it("impute une moins-value des dix années précédentes et ignore une année exonérée", () => {
    const lossYear = parisDate(2024, 3, 1);
    const tiny = parisDate(2023, 3, 1);
    const report = buildFiscalReport(
      [
        buy(tiny, "BTC", 1, 100),
        sell(tiny + 1, "BTC", 1, 40),
        buy(lossYear, "ETH", 1, 1000),
        sell(lossYear + 1, "ETH", 1, 800),
        buy(year.start, "BTC", 1, 1000),
        sell(year.start + 5, "BTC", 1, 1500),
      ],
      year,
    );
    const y2023 = report.yearSheets.find((row) => row.year === 2023)!;
    const y2024 = report.yearSheets.find((row) => row.year === 2024)!;
    const y2025 = report.yearSheets.find((row) => row.year === 2025)!;
    assert.equal(y2023.exempt, true);
    assert.equal(y2023.lossCreated, 0);
    assert.equal(y2024.lossCreated, 200);
    assert.equal(y2025.imputed, 200);
    assert.equal(y2025.taxable, 300);
    assert.equal(report.declaration?.reportEuros, 300);
    assert.equal(report.tax?.total, 90);
  });

  it("valorise l'autre actif au cours du jour et fige le stock en fin de période", () => {
    const later = resolvePeriod({ kind: "year", year: 2026 });
    const report = buildFiscalReport(
      [
        buy(year.start, "BTC", 1, 1000),
        buy(year.start + 1, "ETH", 1, 1000),
        sell(year.start + 2, "BTC", 1, 1500),
        buy(later.start, "SOL", 1, 400),
      ],
      year,
      { prices: { history: { ETH: [{ time: year.start, eur: 3000 }] } } },
    );
    assert.equal(report.cessions[0]!.portfolioEur, 4500);
    assert.equal(report.cessions[0]!.acquiredEur, 666.67);
    assert.equal(report.cessions[0]!.gainEur, 833.33);
    assert.equal(report.cessions[0]!.valuedAtCost, false);
    assert.equal(report.closingPta, 1333.33);
    assert.ok(report.holdings.some((row) => row.asset === "ETH"));
    assert.equal(
      report.holdings.some((row) => row.asset === "SOL"),
      false,
    );
  });
});

describe("grand livre Kraken et ordres du bureau", () => {
  it("regroupe un achat puis une vente EUR", () => {
    const { moves, warnings } = movesFromLedgers([
      { id: "1", refid: "T1", time: 1, type: "trade", asset: "ZEUR", amount: -1000, fee: 2 },
      { id: "2", refid: "T1", time: 1, type: "trade", asset: "XXBT", amount: 0.01, fee: 0 },
      { id: "3", refid: "T2", time: 2, type: "trade", asset: "XXBT", amount: -0.01, fee: 0 },
      { id: "4", refid: "T2", time: 2, type: "trade", asset: "ZEUR", amount: 1200, fee: 3 },
    ]);
    assert.equal(warnings.length, 0);
    assert.equal(moves[0]!.kind, "buy");
    assert.equal(moves[0]!.asset, "BTC");
    assert.equal(moves[0]!.quoteQty, 1000);
    assert.equal(moves[0]!.feeEur, 2);
    assert.equal(moves[1]!.kind, "sell");
    assert.equal(moves[1]!.quoteQty, 1200);
    assert.equal(moves[1]!.feeEur, 3);
  });

  it("fusionne le staking ETH.S avec ETH et ignore un simple wrap", () => {
    const { moves } = movesFromLedgers([
      { id: "a", refid: "S", time: 1, type: "staking", asset: "ETH.S", amount: 0.2, fee: 0 },
      { id: "b", refid: "W", time: 2, type: "trade", asset: "XETH", amount: -1, fee: 0 },
      { id: "c", refid: "W", time: 2, type: "trade", asset: "ETH.S", amount: 1, fee: 0 },
    ]);
    assert.equal(moves.length, 1);
    assert.equal(moves[0]!.kind, "income");
    assert.equal(moves[0]!.asset, "ETH");
  });

  it("convertit un fill du bureau", () => {
    const { moves } = movesFromFills(
      [{ id: "f", pair: "ETHEUR", side: "sell", amount: 2, price: 1500, fee: 4, time: 10 }],
      "desk",
    );
    assert.equal(moves[0]!.kind, "sell");
    assert.equal(moves[0]!.asset, "ETH");
    assert.equal(moves[0]!.quoteQty, 3000);
    assert.equal(moves[0]!.feeEur, 4);
  });

  it("importe un grand livre CSV et un historique de trades", () => {
    const ledger = [
      "txid,refid,time,type,asset,amount,fee",
      "a,T1,1700000000,trade,ZEUR,-1000,2",
      "b,T1,1700000000,trade,XXBT,0.01,0",
      "c,T2,1700001000,trade,XXBT,-0.01,0",
      "d,T2,1700001000,trade,ZEUR,1200,3",
    ].join("\n");
    const parsed = legsFromKrakenCsv(ledger);
    assert.equal(parsed.warnings.length, 0);
    const { moves } = movesFromLedgers(parsed.legs);
    assert.equal(moves[0]!.kind, "buy");
    assert.equal(moves[0]!.asset, "BTC");
    assert.equal(moves[0]!.quoteQty, 1000);
    assert.equal(moves[1]!.kind, "sell");
    assert.equal(moves[1]!.quoteQty, 1200);

    const trades = [
      "txid;pair;time;type;vol;cost;fee;price",
      "t1;XXBTZEUR;2024-06-01 12:00:00;buy;0,01;1000,00;2,00;100000",
      't2;XBTEUR;2024-06-02 12:00:00;sell;"0,01";"1.200,00";"3,00";"120.000,00"',
    ].join("\n");
    const fromTrades = legsFromKrakenCsv(trades);
    const tradeMoves = movesFromLedgers(fromTrades.legs).moves;
    assert.equal(fromTrades.warnings.length, 0);
    assert.equal(tradeMoves[0]!.kind, "buy");
    assert.equal(tradeMoves[0]!.asset, "BTC");
    assert.equal(tradeMoves[0]!.quoteQty, 1000);
    assert.equal(tradeMoves[0]!.feeEur, 2);
    assert.equal(tradeMoves[1]!.kind, "sell");
    assert.equal(tradeMoves[1]!.quoteQty, 1200);
    assert.equal(tradeMoves[1]!.feeEur, 3);
  });
});

describe("exports", () => {
  const year = resolvePeriod({ kind: "year", year: 2025 });
  const report = buildFiscalReport([buy(year.start, "BTC", 1, 1000), sell(year.start + 10, "BTC", 1, 1600)], year, {
    sourceLabel: "Kraken",
  });

  it("produit un PDF, un classeur et un document", () => {
    const pdf = reportToPdf(report, id);
    assert.equal(String.fromCharCode(...pdf.slice(0, 8)), "%PDF-1.4");
    assert.ok(Buffer.from(pdf).includes("%%EOF"));
    const xlsx = reportToXlsx(report, id);
    assert.equal(xlsx[0], 0x50);
    assert.equal(xlsx[1], 0x4b);
    assert.ok(Buffer.from(xlsx).includes("xl/workbook.xml"));
    assert.ok(Buffer.from(xlsx).includes("Cessions"));
    const docx = reportToDocx(report, id);
    assert.ok(Buffer.from(docx).includes("word/document.xml"));
    assert.match(reportToText(report, id), /2086/);
    assert.match(reportToCsv(report), /prix_net_eur/);
    assert.equal(crc32(Uint8Array.from([1, 2, 3, 4])), zlibCrc(Buffer.from([1, 2, 3, 4])));
  });
});
