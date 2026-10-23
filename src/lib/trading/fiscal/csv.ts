import { PAIR_BY_ID, resolvePairId } from "../pairs.ts";
import { parseDecimal } from "../format.ts";
import type { LedgerLeg } from "./types.ts";
import { pushWarn } from "./common.ts";

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
