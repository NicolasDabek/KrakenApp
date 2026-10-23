/** Façade fiscale : le code vit dans ./fiscal/ (rules, assets, types, dates, moves, csv, report, common). */
export { CESSION_EXEMPT_EUR, PFU_IR, PFU_PS, PFU_PS_2026, pfuForYear } from "./fiscal/rules.ts";
export { normalizeFiscalAsset, isFiatAsset } from "./fiscal/assets.ts";
export type { FiscalSource, FiscalKind, FiscalMove, LedgerLeg, CessionRow, IncomeRow, YearCessions, YearSheet, FiscalDeclaration, HoldingSnap, JournalRow, PricePoint, FiscalPrices, FiscalPeriodKind, FiscalPeriod, FiscalIdentity, FiscalReport, FiscalOptions } from "./fiscal/types.ts";
export { parisDate, parisYear, parisMonth, formatFiscalDate, resolvePeriod } from "./fiscal/dates.ts";
export { movesFromLedgers, movesFromFills } from "./fiscal/moves.ts";
export type { FillLike } from "./fiscal/moves.ts";
export { legsFromKrakenCsv } from "./fiscal/csv.ts";
export { buildFiscalReport } from "./fiscal/report.ts";
