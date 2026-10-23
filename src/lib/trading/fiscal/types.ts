export type FiscalSource = "kraken" | "desk" | "manual" | "paper";

export type FiscalKind = "buy" | "sell" | "swap" | "deposit" | "withdraw" | "income" | "fiat" | "fee";

export type FiscalMove = {
  id: string;
  time: number;
  kind: FiscalKind;
  asset: string;
  qty: number;
  quote?: string;
  quoteQty?: number;
  feeEur?: number;
  note?: string;
  source: FiscalSource;
};

export type LedgerLeg = {
  id: string;
  refid: string;
  time: number;
  type: string;
  asset: string;
  amount: number;
  fee: number;
};

export type CessionRow = {
  time: number;
  asset: string;
  qty: number;
  grossEur: number;
  feesEur: number;
  netEur: number;
  portfolioEur: number;
  /** Ligne 220 — acquisitions cumulées, non diminuées des cessions antérieures. */
  ptaEver: number;
  /** Ligne 221 — fractions déjà sorties. */
  ptaOut: number;
  /** Ligne 223 — prix total d'acquisition encore dans le portefeuille. */
  ptaBefore: number;
  acquiredEur: number;
  gainEur: number;
  /** True when another asset was marked at cost, not at a market price. */
  valuedAtCost: boolean;
  incomplete: boolean;
  note?: string;
};

export type IncomeRow = {
  time: number;
  asset: string;
  qty: number;
  valueEur: number;
  note?: string;
};

export type YearCessions = {
  year: number;
  total: number;
  exempt: boolean;
};

export type YearSheet = {
  year: number;
  cessionsNet: number;
  gain: number;
  exempt: boolean;
  imputed: number;
  taxable: number;
  lossCreated: number;
  rateLabel: string;
  tax: { ir: number; ps: number; total: number; label: string; psRate: number } | null;
};

export type FiscalDeclaration = {
  year: number;
  cessionsNet: number;
  gain: number;
  exempt: boolean;
  imputed: number;
  taxable: number;
  lossCreated: number;
  reportBox: "3AN" | "3BN" | "none";
  reportEuros: number;
};

export type HoldingSnap = {
  asset: string;
  qty: number;
  priceEur: number;
  valueEur: number;
  priced: boolean;
};

export type JournalRow = {
  time: number;
  kind: FiscalKind;
  asset: string;
  qty: number;
  quote?: string;
  quoteQty?: number;
  feeEur?: number;
  source: FiscalSource;
  note?: string;
  inPeriod: boolean;
};

export type PricePoint = { time: number; eur: number };

export type FiscalPrices = {
  /** Daily or weekly EUR closes, any order. Used for case 212. */
  history?: Record<string, PricePoint[]>;
  /** One EUR price per asset, applied to every cession. Overrides history. */
  manual?: Record<string, number>;
};

export type FiscalPeriodKind = "year" | "rolling12" | "month" | "custom";

export type FiscalPeriod = {
  kind: FiscalPeriodKind;
  start: number;
  end: number;
  label: string;
  /** Set when the window is exactly one French civil year — PFU and the 305 € test apply. */
  calendarYear?: number;
};

export type FiscalIdentity = {
  firstName: string;
  lastName: string;
  taxId: string;
  accountRef: string;
};

export type FiscalReport = {
  period: FiscalPeriod;
  sourceLabel: string;
  simulated: boolean;
  cessions: CessionRow[];
  incomes: IncomeRow[];
  swapCount: number;
  openingPta: number;
  closingPta: number;
  totalCessions: number;
  totalGains: number;
  totalLosses: number;
  net: number;
  netEuros: number;
  yearCessions: YearCessions[];
  yearSheets: YearSheet[];
  declaration: FiscalDeclaration | null;
  holdings: HoldingSnap[];
  journal: JournalRow[];
  exempt: boolean;
  tax: { ir: number; ps: number; total: number; label: string; psRate: number } | null;
  indicative: boolean;
  warnings: string[];
  incomplete: boolean;
};

export type FiscalOptions = {
  /** EUR value of 1 USD, used for USD-quoted trades. */
  eurPerUsd?: number;
  /** When true, blockchain deposits/withdrawals do not change the global portfolio. */
  ownWallets?: boolean;
  sourceLabel?: string;
  prices?: FiscalPrices;
};
