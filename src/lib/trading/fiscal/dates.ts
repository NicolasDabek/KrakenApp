import type { FiscalPeriod, FiscalPeriodKind } from "./types.ts";

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
