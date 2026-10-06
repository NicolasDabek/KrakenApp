import { PAIR_BY_ID, resolvePairId } from "./pairs.ts";
import { parseDecimal } from "./format.ts";

/** CGI art. 150 VH bis — seuil d'exonération des cessions d'actifs numériques. */
export const CESSION_EXEMPT_EUR = 305;
/** PFU : 12,8 % d'impôt sur le revenu (inchangé). */
export const PFU_IR = 0.128;
/** Prélèvements sociaux jusqu'aux revenus 2025. */
export const PFU_PS = 0.172;
/** Prélèvements sociaux dès le 1er janvier 2026 (LFSS 2026, CSG +1,4 pt). */
export const PFU_PS_2026 = 0.186;

export function pfuForYear(year: number): { ir: number; ps: number; total: number; label: string } {
  const ps = year >= 2026 ? PFU_PS_2026 : PFU_PS;
  return { ir: PFU_IR, ps, total: PFU_IR + ps, label: year >= 2026 ? "31,4 %" : "30 %" };
}

const FIAT = new Set(["EUR", "USD", "GBP", "CHF", "CAD", "JPY", "AUD"]);

const ASSET_MAP: Record<string, string> = {
  XXBT: "BTC",
  XBT: "BTC",
  XETH: "ETH",
  XXRP: "XRP",
  XLTC: "LTC",
  XXLM: "XLM",
  XXMR: "XMR",
  XXDG: "DOGE",
  XDG: "DOGE",
  ZEUR: "EUR",
  ZUSD: "USD",
  ZGBP: "GBP",
};

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

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export function normalizeFiscalAsset(code: string): string {
  let raw = code.trim().toUpperCase();
  if (!raw) return "";
  raw = raw.replace(/\.(S|F|B|M|T|P|HOLD)$/, "");
  if (ASSET_MAP[raw]) return ASSET_MAP[raw]!;
  return raw.replace(/^Z(?=EUR|USD|GBP|CHF|CAD|JPY|AUD)/, "").replace(/^X(?=[A-Z]{3}$)/, "");
}

export function isFiatAsset(asset: string): boolean {
  return FIAT.has(asset);
}

function parisOffset(utc: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(utc)).map((p) => [p.type, p.value]));
  const hour = parts.hour === "24" ? 0 : Number(parts.hour);
  const asUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), hour, Number(parts.minute), Number(parts.second));
  return asUtc - utc;
}

export function parisDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  return guess - parisOffset(guess);
}

export function parisYear(ms: number): number {
  const dtf = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", year: "numeric" });
  return Number(dtf.format(ms));
}

export function parisMonth(ms: number): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", month: "numeric" }).format(ms));
}

export function formatFiscalDate(ms: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(ms);
}

export function resolvePeriod(input: {
  kind: FiscalPeriodKind;
  year?: number;
  month?: number;
  from?: string;
  to?: string;
  now?: number;
}): FiscalPeriod {
  const now = input.now ?? Date.now();
  if (input.kind === "rolling12") {
    const start = now - 365 * 24 * 60 * 60 * 1000;
    return { kind: "rolling12", start, end: now, label: "12 derniers mois" };
  }
  if (input.kind === "month") {
    const year = input.year ?? parisYear(now);
    const month = Math.min(12, Math.max(1, input.month ?? 1));
    const start = parisDate(year, month, 1);
    const end = (month === 12 ? parisDate(year + 1, 1, 1) : parisDate(year, month + 1, 1)) - 1;
    return { kind: "month", start, end, label: `${MONTHS[month - 1]} ${year}` };
  }
  if (input.kind === "custom") {
    const from = parseDay(input.from) ?? parisDate(parisYear(now), 1, 1);
    const toDay = parseDay(input.to);
    const end = toDay != null ? toDay + 24 * 60 * 60 * 1000 - 1 : now;
    const start = Math.min(from, end);
    return {
      kind: "custom",
      start,
      end: Math.max(end, start),
      label: `${formatFiscalDate(start)} – ${formatFiscalDate(Math.max(end, start))}`,
    };
  }
  const year = input.year ?? parisYear(now);
  const start = parisDate(year, 1, 1);
  const end = parisDate(year + 1, 1, 1) - 1;
  return { kind: "year", start, end, label: `Année ${year}`, calendarYear: year };
}

function parseDay(iso: string | undefined): number | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return parisDate(y, m, d);
}

function cents(n: number): number {
  return Math.round(n * 100) / 100;
}

function pushWarn(list: string[], text: string) {
  if (!list.includes(text)) list.push(text);
}

export function movesFromLedgers(legs: LedgerLeg[], opts: FiscalOptions = {}): { moves: FiscalMove[]; warnings: string[] } {
  const warnings: string[] = [];
  const groups = new Map<string, LedgerLeg[]>();
  for (const leg of legs) {
    const asset = normalizeFiscalAsset(leg.asset);
    if (!asset || !Number.isFinite(leg.amount)) continue;
    const key = `${leg.type}|${leg.refid || leg.id}`;
    const bucket = groups.get(key) ?? [];
    bucket.push({ ...leg, asset, type: leg.type.toLowerCase() });
    groups.set(key, bucket);
  }

  const moves: FiscalMove[] = [];
  for (const [, bucket] of groups) {
    const type = bucket[0]!.type;
    const time = Math.min(...bucket.map((l) => l.time));
    const id = bucket[0]!.refid || bucket[0]!.id;

    if (type === "margin" || type === "rollover" || type === "settled") {
      pushWarn(warnings, "Activité sur marge ou dérivés ignorée (hors cessions spot de l’art. 150 VH bis).");
      continue;
    }

    if (type === "deposit" || type === "withdrawal" || type === "transfer") {
      for (const leg of bucket) {
        const qty = Math.abs(leg.amount);
        if (!(qty > 0)) continue;
        if (isFiatAsset(leg.asset)) {
          moves.push({
            id: leg.id,
            time: leg.time,
            kind: "fiat",
            asset: leg.asset,
            qty,
            source: "kraken",
            note: type,
          });
          continue;
        }
        const inbound = type === "deposit" || (type === "transfer" && leg.amount > 0);
        const outbound = type === "withdrawal" || (type === "transfer" && leg.amount < 0);
        if (type === "transfer" && !inbound && !outbound) continue;
        moves.push({
          id: leg.id,
          time: leg.time,
          kind: inbound ? "deposit" : "withdraw",
          asset: leg.asset,
          qty,
          source: "kraken",
          note: type === "transfer" ? "Transfert interne Kraken" : type === "deposit" ? "Dépôt" : "Retrait",
        });
      }
      continue;
    }

    if (type === "staking" || type === "earn" || type === "reward" || type === "dividend" || type === "credit") {
      for (const leg of bucket) {
        if (isFiatAsset(leg.asset) || !(leg.amount > 0)) continue;
        moves.push({
          id: leg.id,
          time: leg.time,
          kind: "income",
          asset: leg.asset,
          qty: leg.amount,
          source: "kraken",
          note: type,
        });
      }
      continue;
    }

    if (type !== "trade" && type !== "spend" && type !== "receive" && type !== "sale") {
      pushWarn(warnings, `Mouvement Kraken « ${type} » non classé — à vérifier.`);
      continue;
    }

    const out = new Map<string, { qty: number; fee: number }>();
    const inn = new Map<string, { qty: number; fee: number }>();
    for (const leg of bucket) {
      const bag = leg.amount < 0 ? out : inn;
      const cur = bag.get(leg.asset) ?? { qty: 0, fee: 0 };
      cur.qty += Math.abs(leg.amount);
      cur.fee += Math.abs(leg.fee);
      bag.set(leg.asset, cur);
    }
    const outs = [...out.entries()];
    const ins = [...inn.entries()];
    if (!outs.length || !ins.length) {
      pushWarn(warnings, "Trade Kraken incomplet (une seule jambe) — ignoré.");
      continue;
    }

    const fiatOut = outs.find(([a]) => isFiatAsset(a));
    const fiatIn = ins.find(([a]) => isFiatAsset(a));
    const cryptoOut = outs.find(([a]) => !isFiatAsset(a));
    const cryptoIn = ins.find(([a]) => !isFiatAsset(a));

    if (fiatOut && cryptoIn && fiatOut[0] === "EUR") {
      const feeCrypto = cryptoIn[1].fee;
      const qty = Math.max(0, cryptoIn[1].qty - feeCrypto);
      const feeEur = fiatOut[1].fee + (feeCrypto > 0 && cryptoIn[1].qty > 0 ? (fiatOut[1].qty / cryptoIn[1].qty) * feeCrypto : 0);
      moves.push({
        id,
        time,
        kind: "buy",
        asset: cryptoIn[0],
        qty,
        quote: "EUR",
        quoteQty: fiatOut[1].qty,
        feeEur,
        source: "kraken",
        note: "Achat",
      });
      continue;
    }

    if (fiatIn && cryptoOut && (fiatIn[0] === "EUR" || fiatIn[0] === "USD")) {
      const feeCrypto = cryptoOut[1].fee;
      const qty = cryptoOut[1].qty + feeCrypto;
      const gross = fiatIn[1].qty;
      const fx = fiatIn[0] === "EUR" ? 1 : opts.eurPerUsd;
      if (!(fx && fx > 0)) {
        pushWarn(warnings, "Cession en USD sans taux EUR — ignorée. Recharge avec le marché ouvert.");
        continue;
      }
      const unit = gross / Math.max(cryptoOut[1].qty, 1e-12);
      const feeEur = fiatIn[1].fee * fx + feeCrypto * unit * fx;
      moves.push({
        id,
        time,
        kind: "sell",
        asset: cryptoOut[0],
        qty,
        quote: "EUR",
        quoteQty: gross * fx,
        feeEur,
        source: "kraken",
        note: fiatIn[0] === "USD" ? "Vente USD convertie" : "Vente",
      });
      continue;
    }

    if (cryptoOut && cryptoIn && cryptoOut[0] === cryptoIn[0]) {
      const left = cryptoOut[1].qty + cryptoOut[1].fee;
      const back = Math.max(0, cryptoIn[1].qty - cryptoIn[1].fee);
      const burned = left - back;
      if (burned > 1e-10) {
        moves.push({
          id,
          time,
          kind: "fee",
          asset: cryptoOut[0],
          qty: burned,
          source: "kraken",
          note: "Frais de conversion interne",
        });
      }
      continue;
    }

    if (cryptoOut && cryptoIn) {
      moves.push({
        id,
        time,
        kind: "swap",
        asset: cryptoOut[0],
        qty: cryptoOut[1].qty + cryptoOut[1].fee,
        quote: cryptoIn[0],
        quoteQty: Math.max(0, cryptoIn[1].qty - cryptoIn[1].fee),
        source: "kraken",
        note: "Échange crypto",
      });
      continue;
    }

    pushWarn(warnings, "Trade avec une monnaie autre que EUR/USD — non converti.");
  }

  moves.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  return { moves, warnings };
}

const CSV_MAX_ROWS = 20_000;

function parseCsvTable(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const headerLine = src.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const delim = (headerLine.match(/;/g) ?? []).length > (headerLine.match(/,/g) ?? []).length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((record) => record.some((value) => value.trim()));
}

function csvIndex(headers: string[], ...names: string[]): number {
  return headers.findIndex((header) => names.includes(header));
}

function csvTime(raw: string): number | null {
  const text = raw.trim();
  if (!text) return null;
  if (/^\d+(\.\d+)?$/.test(text)) {
    const n = Number(text);
    return n > 1e12 ? Math.round(n) : Math.round(n * 1000);
  }
  const iso = text.includes("T") ? text : text.replace(" ", "T");
  const zoned = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const ms = Date.parse(zoned);
  return Number.isFinite(ms) ? ms : null;
}

/** Kraken ledger export or trades history CSV. Stays on device; no API call. */
export function legsFromKrakenCsv(text: string): { legs: LedgerLeg[]; warnings: string[] } {
  const warnings: string[] = [];
  const table = parseCsvTable(text);
  if (table.length < 2) return { legs: [], warnings: ["Fichier vide ou sans ligne de données."] };
  const headers = table[0]!.map((header) => header.trim().toLowerCase());
  const rows = table.slice(1);
  const ledger = csvIndex(headers, "asset") >= 0 && csvIndex(headers, "amount", "montant") >= 0;
  const trades = csvIndex(headers, "pair") >= 0 && csvIndex(headers, "vol", "volume") >= 0;
  if (!ledger && !trades) {
    return {
      legs: [],
      warnings: ["Export non reconnu. Il faut un grand livre Kraken (asset, amount) ou un historique de trades (pair, vol)."],
    };
  }
  const slice = rows.slice(0, CSV_MAX_ROWS);
  if (rows.length > CSV_MAX_ROWS) pushWarn(warnings, `Import limité aux ${CSV_MAX_ROWS} premières lignes.`);
  const legs = ledger ? legsFromLedgerRows(headers, slice, warnings) : legsFromTradeRows(headers, slice, warnings);
  if (!legs.length) pushWarn(warnings, "Aucune ligne exploitable dans ce fichier.");
  return { legs, warnings };
}

function legsFromLedgerRows(headers: string[], rows: string[][], warnings: string[]): LedgerLeg[] {
  const iTime = csvIndex(headers, "time", "date");
  const iType = csvIndex(headers, "type");
  const iAsset = csvIndex(headers, "asset");
  const iAmount = csvIndex(headers, "amount", "montant");
  const iFee = csvIndex(headers, "fee", "frais");
  const iRef = csvIndex(headers, "refid", "ref");
  const iId = csvIndex(headers, "txid", "id");
  const legs: LedgerLeg[] = [];
  rows.forEach((row, index) => {
    const time = csvTime(row[iTime] ?? "");
    const asset = (row[iAsset] ?? "").trim();
    const amount = parseDecimal(row[iAmount] ?? "") ?? Number.NaN;
    if (time == null || !asset || !Number.isFinite(amount)) return;
    legs.push({
      id: (row[iId] ?? "").trim() || `csv-${index}`,
      refid: (row[iRef] ?? "").trim() || (row[iId] ?? "").trim() || `csv-${index}`,
      time,
      type: ((row[iType] ?? "").trim() || "trade").toLowerCase(),
      asset,
      amount,
      fee: Math.abs(parseDecimal(row[iFee] ?? "") ?? 0),
    });
  });
  if (rows.length && !legs.length) pushWarn(warnings, "Les dates ou montants du grand livre n’ont pas pu être lus.");
  return legs;
}

function legsFromTradeRows(headers: string[], rows: string[][], warnings: string[]): LedgerLeg[] {
  const iTime = csvIndex(headers, "time", "date");
  const iType = csvIndex(headers, "type");
  const iPair = csvIndex(headers, "pair");
  const iVol = csvIndex(headers, "vol", "volume");
  const iCost = csvIndex(headers, "cost");
  const iFee = csvIndex(headers, "fee", "frais");
  const iPrice = csvIndex(headers, "price");
  const iId = csvIndex(headers, "txid", "id");
  const legs: LedgerLeg[] = [];
  let skipped = 0;
  rows.forEach((row, index) => {
    const pair = resolvePairId((row[iPair] ?? "").trim());
    const meta = pair ? PAIR_BY_ID[pair] : undefined;
    const time = csvTime(row[iTime] ?? "");
    const vol = parseDecimal(row[iVol] ?? "") ?? 0;
    const cost = parseDecimal(row[iCost] ?? "") ?? (parseDecimal(row[iPrice] ?? "") ?? 0) * vol;
    const side = (row[iType] ?? "").trim().toLowerCase();
    if (!meta || time == null || !(vol > 0) || !(cost > 0) || (side !== "buy" && side !== "sell")) {
      skipped += 1;
      return;
    }
    const id = (row[iId] ?? "").trim() || `csv-${index}`;
    const fee = Math.abs(parseDecimal(row[iFee] ?? "") ?? 0);
    const quote = meta.quote;
    const base = meta.base;
    if (side === "buy") {
      legs.push({ id: `${id}-q`, refid: id, time, type: "trade", asset: quote, amount: -cost, fee });
      legs.push({ id: `${id}-b`, refid: id, time, type: "trade", asset: base, amount: vol, fee: 0 });
    } else {
      legs.push({ id: `${id}-b`, refid: id, time, type: "trade", asset: base, amount: -vol, fee: 0 });
      legs.push({ id: `${id}-q`, refid: id, time, type: "trade", asset: quote, amount: cost, fee });
    }
  });
  if (skipped) pushWarn(warnings, `${skipped} trade${skipped > 1 ? "s" : ""} ignoré${skipped > 1 ? "s" : ""} (paire ou montant illisible).`);
  return legs;
}

export type FillLike = {
  id: string;
  pair: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  fee: number;
  time: number;
};

export function movesFromFills(
  fills: FillLike[],
  source: FiscalSource,
  opts: FiscalOptions = {},
): { moves: FiscalMove[]; warnings: string[] } {
  const warnings: string[] = [];
  const moves: FiscalMove[] = [];
  for (const fill of fills) {
    const meta = PAIR_BY_ID[fill.pair];
    if (!meta || !(fill.amount > 0) || !(fill.price > 0)) {
      pushWarn(warnings, "Ordre sans paire reconnue — ignoré.");
      continue;
    }
    const quote = meta.quote;
    const notion = fill.amount * fill.price;
    if (quote === "EUR" || (quote === "USD" && opts.eurPerUsd && opts.eurPerUsd > 0)) {
      const fx = quote === "EUR" ? 1 : opts.eurPerUsd!;
      if (quote === "USD") pushWarn(warnings, "Cessions ou achats en USD convertis avec le taux EUR du moment — à recouper.");
      moves.push({
        id: fill.id,
        time: fill.time,
        kind: fill.side === "buy" ? "buy" : "sell",
        asset: normalizeFiscalAsset(meta.base),
        qty: fill.amount,
        quote: "EUR",
        quoteQty: notion * fx,
        feeEur: (fill.fee || 0) * fx,
        source,
        note: fill.side === "buy" ? "Achat" : "Vente",
      });
      continue;
    }
    if (!isFiatAsset(quote)) {
      moves.push({
        id: fill.id,
        time: fill.time,
        kind: "swap",
        asset: fill.side === "sell" ? normalizeFiscalAsset(meta.base) : normalizeFiscalAsset(quote),
        qty: fill.side === "sell" ? fill.amount : notion,
        quote: fill.side === "sell" ? normalizeFiscalAsset(quote) : normalizeFiscalAsset(meta.base),
        quoteQty: fill.side === "sell" ? notion : fill.amount,
        source,
        note: "Échange crypto",
      });
      continue;
    }
    pushWarn(warnings, `Paire ${meta.display} hors EUR/USD — non reprise.`);
  }
  moves.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  return { moves, warnings };
}

function portfolioValue(holdings: Map<string, number>, px: Map<string, number>): { value: number; missing: string[] } {
  let value = 0;
  const missing: string[] = [];
  for (const [asset, qty] of holdings) {
    if (!(qty > 1e-12)) continue;
    const price = px.get(asset);
    if (!(price && price > 0)) {
      missing.push(asset);
      continue;
    }
    value += qty * price;
  }
  return { value, missing };
}

function indexPrices(history: Record<string, PricePoint[]> | undefined): Map<string, PricePoint[]> {
  const map = new Map<string, PricePoint[]>();
  if (!history) return map;
  for (const [asset, rows] of Object.entries(history)) {
    const clean = rows
      .filter((row) => row && row.eur > 0 && Number.isFinite(row.time))
      .sort((a, b) => a.time - b.time);
    if (clean.length) map.set(asset, clean);
  }
  return map;
}

function priceAt(series: PricePoint[] | undefined, time: number): number | undefined {
  if (!series?.length) return undefined;
  let lo = 0;
  let hi = series.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (series[mid]!.time <= time) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans >= 0 ? series[ans]!.eur : undefined;
}

function marketPrice(opts: FiscalOptions, history: Map<string, PricePoint[]>, asset: string, time: number): number | undefined {
  const manual = opts.prices?.manual?.[asset];
  if (manual && manual > 0) return manual;
  return priceAt(history.get(asset), time);
}

function taxOn(baseEuros: number, year: number): FiscalReport["tax"] {
  const rates = pfuForYear(year);
  const base = Math.round(baseEuros);
  if (!(base > 0)) return null;
  const ir = cents(base * rates.ir);
  const ps = cents(base * rates.ps);
  return { ir, ps, total: cents(ir + ps), label: rates.label, psRate: rates.ps };
}

function buildYearSheets(rows: CessionRow[]): YearSheet[] {
  const by = new Map<number, { net: number; gain: number }>();
  for (const row of rows) {
    const year = parisYear(row.time);
    const cur = by.get(year) ?? { net: 0, gain: 0 };
    cur.net += row.netEur;
    cur.gain += row.gainEur;
    by.set(year, cur);
  }
  const years = [...by.keys()].sort((a, b) => a - b);
  if (!years.length) return [];
  const lots: { year: number; left: number }[] = [];
  const sheets: YearSheet[] = [];
  for (let year = years[0]!; year <= years[years.length - 1]!; year++) {
    for (const lot of lots) {
      if (year - lot.year > 10) lot.left = 0;
    }
    const cur = by.get(year);
    if (!cur) continue;
    const cessionsNet = cents(cur.net);
    const gain = cents(cur.gain);
    const exempt = cessionsNet <= CESSION_EXEMPT_EUR;
    let imputed = 0;
    let taxable = 0;
    let lossCreated = 0;
    if (!exempt && gain > 0) {
      let left = gain;
      for (const lot of lots) {
        if (!(lot.left > 0) || year - lot.year > 10 || year <= lot.year) continue;
        const take = Math.min(lot.left, left);
        lot.left = cents(lot.left - take);
        left = cents(left - take);
        imputed = cents(imputed + take);
        if (!(left > 0)) break;
      }
      taxable = left;
    } else if (!exempt && gain < 0) {
      lossCreated = cents(-gain);
      lots.push({ year, left: lossCreated });
    }
    const rates = pfuForYear(year);
    sheets.push({
      year,
      cessionsNet,
      gain,
      exempt,
      imputed,
      taxable: exempt ? 0 : taxable,
      lossCreated: exempt ? 0 : lossCreated,
      rateLabel: rates.label,
      tax: exempt ? null : taxOn(taxable, year),
    });
  }
  return sheets;
}

export function buildFiscalReport(moves: FiscalMove[], period: FiscalPeriod, opts: FiscalOptions = {}): FiscalReport {
  const warnings: string[] = [];
  const sorted = [...moves].sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  const holdings = new Map<string, number>();
  const px = new Map<string, number>();
  const history = indexPrices(opts.prices?.history);
  let pta = 0;
  let ever = 0;
  let openingPta: number | null = null;
  let snapPta: number | null = null;
  let snapHoldings: Map<string, number> | null = null;
  let snapPx: Map<string, number> | null = null;
  const allCessions: CessionRow[] = [];
  const incomes: IncomeRow[] = [];
  let swapCount = 0;
  let simulated = false;
  let sawCostValuation = false;

  const addQty = (asset: string, qty: number) => {
    holdings.set(asset, (holdings.get(asset) ?? 0) + qty);
  };

  const snap = () => {
    if (snapPta != null) return;
    snapPta = pta;
    snapHoldings = new Map(holdings);
    snapPx = new Map(px);
  };

  for (const move of sorted) {
    if (move.time > period.end) snap();
    if (move.source === "paper") simulated = true;
    if (openingPta == null && move.time >= period.start) openingPta = pta;

    if (move.kind === "fiat") continue;

    if (move.kind === "fee") {
      addQty(move.asset, -move.qty);
      continue;
    }

    if (move.kind === "deposit") {
      if (opts.ownWallets && move.source !== "manual") continue;
      addQty(move.asset, move.qty);
      pushWarn(
        warnings,
        "Dépôt crypto sans prix d’acquisition : le stock augmente, pas le prix de revient. Ajoute un achat manuel si ces unités ont été payées ailleurs.",
      );
      continue;
    }

    if (move.kind === "withdraw") {
      if (opts.ownWallets && move.source !== "manual") continue;
      addQty(move.asset, -move.qty);
      pushWarn(
        warnings,
        "Retrait crypto sorti du stock suivi. Si les unités sont encore à toi, coche « wallets perso » pour les garder dans la valeur globale.",
      );
      continue;
    }

    if (move.kind === "buy") {
      const fee = Math.max(0, move.feeEur ?? 0);
      const cost = Math.max(0, move.quoteQty ?? 0) + fee;
      const qty = move.qty;
      if (!(qty > 0) || !(cost > 0)) continue;
      addQty(move.asset, qty);
      pta += cost;
      ever += cost;
      px.set(move.asset, cost / qty);
      continue;
    }

    if (move.kind === "swap") {
      const outQty = move.qty;
      const inAsset = move.quote ?? "";
      const inQty = move.quoteQty ?? 0;
      if (!inAsset || !(outQty > 0) || !(inQty > 0)) continue;
      addQty(move.asset, -outQty);
      addQty(inAsset, inQty);
      const outPx = px.get(move.asset);
      const inPx = px.get(inAsset);
      if (outPx && outPx > 0) px.set(inAsset, (outQty * outPx) / inQty);
      else if (inPx && inPx > 0) px.set(move.asset, (inQty * inPx) / outQty);
      swapCount += 1;
      continue;
    }

    if (move.kind === "income") {
      const known = px.get(move.asset);
      const value = move.quoteQty && move.quoteQty > 0 ? move.quoteQty : known && known > 0 ? move.qty * known : 0;
      addQty(move.asset, move.qty);
      if (value > 0 && move.qty > 0) {
        px.set(move.asset, value / move.qty);
        pta += value;
        ever += value;
      } else {
        pushWarn(warnings, `Revenu ${move.asset} sans prix EUR — stock augmenté, prix de revient inchangé.`);
      }
      if (move.time >= period.start && move.time <= period.end) {
        incomes.push({
          time: move.time,
          asset: move.asset,
          qty: move.qty,
          valueEur: cents(value),
          note: move.note,
        });
      }
      continue;
    }

    if (move.kind !== "sell") continue;

    const gross = Math.max(0, move.quoteQty ?? 0);
    const fees = Math.max(0, move.feeEur ?? 0);
    const net = Math.max(0, gross - fees);
    const qty = move.qty;
    if (!(qty > 0) || !(gross > 0)) continue;

    const held = holdings.get(move.asset) ?? 0;
    if (held + 1e-8 < qty) {
      pushWarn(warnings, `Vente de ${move.asset} supérieure au stock suivi — plus-value peut-être trop haute (prix de revient incomplet).`);
      holdings.set(move.asset, qty);
    }
    px.set(move.asset, net / qty);
    const marks = new Map(px);
    let valuedAtCost = false;
    for (const [asset, heldQty] of holdings) {
      if (!(heldQty > 1e-12) || asset === move.asset) continue;
      const market = marketPrice(opts, history, asset, move.time);
      if (market && market > 0) {
        marks.set(asset, market);
        px.set(asset, market);
      } else if ((px.get(asset) ?? 0) > 0) {
        valuedAtCost = true;
      }
    }
    if (valuedAtCost) sawCostValuation = true;
    const valued = portfolioValue(holdings, marks);
    let portfolio = valued.value;
    let incomplete = valued.missing.length > 0 || valuedAtCost;
    if (valued.missing.length) {
      pushWarn(warnings, `Prix manquant pour ${valued.missing.join(", ")} — valeur globale incomplète.`);
    }
    if (!(portfolio > 0)) {
      portfolio = net;
      incomplete = true;
    }
    let fraction = portfolio > 0 ? net / portfolio : 1;
    if (fraction > 1) {
      fraction = 1;
      incomplete = true;
      pushWarn(warnings, "Fraction de cession plafonnée à 100 % (valeur de portefeuille inférieure au prix de cession).");
    }
    const acquired = pta * fraction;
    const gain = net - acquired;
    const ptaBefore = pta;
    const ptaEver = ever;
    const ptaOut = Math.max(0, ever - pta);
    pta = Math.max(0, pta - acquired);
    addQty(move.asset, -qty);

    allCessions.push({
      time: move.time,
      asset: move.asset,
      qty,
      grossEur: cents(gross),
      feesEur: cents(fees),
      netEur: cents(net),
      portfolioEur: cents(portfolio),
      ptaEver: cents(ptaEver),
      ptaOut: cents(ptaOut),
      ptaBefore: cents(ptaBefore),
      acquiredEur: cents(acquired),
      gainEur: cents(gain),
      valuedAtCost,
      incomplete,
      note: move.note,
    });
  }

  snap();
  if (openingPta == null) openingPta = pta;

  if (sawCostValuation) {
    pushWarn(
      warnings,
      "Case 212 incomplète : un autre actif est valorisé au prix d'acquisition, pas au cours du jour de la cession. Charge les cours Kraken ou saisis un prix.",
    );
  }

  const cessions = allCessions.filter((row) => row.time >= period.start && row.time <= period.end);
  const yearSheets = buildYearSheets(allCessions);
  const yearCessions: YearCessions[] = yearSheets.map((sheet) => ({
    year: sheet.year,
    total: sheet.cessionsNet,
    exempt: sheet.exempt,
  }));

  const totalCessions = cents(cessions.reduce((s, c) => s + c.netEur, 0));
  const totalGains = cents(cessions.filter((c) => c.gainEur > 0).reduce((s, c) => s + c.gainEur, 0));
  const totalLosses = cents(cessions.filter((c) => c.gainEur < 0).reduce((s, c) => s + c.gainEur, 0));
  const net = cents(cessions.reduce((s, c) => s + c.gainEur, 0));
  const singleYear = period.calendarYear != null;
  const sheet = singleYear ? yearSheets.find((row) => row.year === period.calendarYear) : undefined;
  const exempt = Boolean(sheet?.exempt);
  const indicative = !singleYear;
  const tax = sheet ? sheet.tax : net > 0 ? taxOn(net, parisYear(period.end)) : null;
  const declaration: FiscalDeclaration | null = sheet
    ? {
        year: sheet.year,
        cessionsNet: sheet.cessionsNet,
        gain: sheet.gain,
        exempt: sheet.exempt,
        imputed: sheet.imputed,
        taxable: sheet.taxable,
        lossCreated: sheet.lossCreated,
        reportBox: sheet.exempt ? "none" : sheet.taxable > 0 ? "3AN" : sheet.lossCreated > 0 ? "3BN" : "none",
        reportEuros: sheet.exempt ? 0 : Math.round(sheet.taxable > 0 ? sheet.taxable : sheet.lossCreated),
      }
    : null;

  const endHoldings = snapHoldings ?? holdings;
  const endPx = snapPx ?? px;
  const endPta = snapPta ?? pta;
  const holdingRows: HoldingSnap[] = [];
  for (const [asset, qty] of endHoldings) {
    if (!(qty > 1e-8)) continue;
    const market = marketPrice(opts, history, asset, period.end);
    const cost = endPx.get(asset);
    const price = market && market > 0 ? market : cost && cost > 0 ? cost : 0;
    holdingRows.push({
      asset,
      qty,
      priceEur: cents(price),
      valueEur: cents(qty * price),
      priced: Boolean(market && market > 0),
    });
  }
  holdingRows.sort((a, b) => b.valueEur - a.valueEur || a.asset.localeCompare(b.asset));

  const journal: JournalRow[] = sorted.map((move) => ({
    time: move.time,
    kind: move.kind,
    asset: move.asset,
    qty: move.qty,
    quote: move.quote,
    quoteQty: move.quoteQty,
    feeEur: move.feeEur,
    source: move.source,
    note: move.note,
    inPeriod: move.time >= period.start && move.time <= period.end,
  }));

  if (simulated) {
    pushWarn(warnings, "La simulation papier est incluse. Ne la reporte pas sur une déclaration réelle.");
  }
  if (exempt && sheet) {
    pushWarn(
      warnings,
      `Cessions nettes ${period.calendarYear} ≤ ${CESSION_EXEMPT_EUR} € (ligne 218) : plus-values exonérées. La 2086 reste à déposer, sans montant en 3AN ni 3BN.`,
    );
  }
  if (sheet && sheet.imputed > 0) {
    pushWarn(
      warnings,
      `Moins-values antérieures imputées : ${sheet.imputed.toLocaleString("fr-FR")} €. Le report tient compte de l'historique chargé, sur 10 ans.`,
    );
  }

  return {
    period,
    sourceLabel: opts.sourceLabel ?? "Activité",
    simulated,
    cessions,
    incomes,
    swapCount,
    openingPta: cents(openingPta),
    closingPta: cents(endPta),
    totalCessions,
    totalGains,
    totalLosses,
    net,
    netEuros: Math.round(net),
    yearCessions,
    yearSheets,
    declaration,
    holdings: holdingRows,
    journal,
    exempt,
    tax: exempt ? null : tax,
    indicative,
    warnings,
    incomplete: cessions.some((c) => c.incomplete) || warnings.some((w) => w.includes("incompl")),
  };
}
