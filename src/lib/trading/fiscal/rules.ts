import type { FiscalReport } from "./types.ts";
import { cents } from "./common.ts";

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

export function taxOn(baseEuros: number, year: number): FiscalReport["tax"] {
  const rates = pfuForYear(year);
  const base = Math.round(baseEuros);
  if (!(base > 0)) return null;
  const ir = cents(base * rates.ir);
  const ps = cents(base * rates.ps);
  return { ir, ps, total: cents(ir + ps), label: rates.label, psRate: rates.ps };
}
