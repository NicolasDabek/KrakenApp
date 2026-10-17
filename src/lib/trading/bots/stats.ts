import type { Bot, BotStats } from "../types.ts";

export function riskRatios(curve: { t: number; v: number }[], from: number, to: number): { sharpe: number; sortino: number } {
  if (curve.length < 4) return { sharpe: 0, sortino: 0 };
  const rets: number[] = [];
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1]!.v;
    if (prev > 0) rets.push(curve[i]!.v / prev - 1);
  }
  if (rets.length < 3) return { sharpe: 0, sortino: 0 };
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
  const std = Math.sqrt(variance);
  const down = rets.filter((r) => r < 0);
  const downVar = down.length ? down.reduce((s, r) => s + r * r, 0) / down.length : 0;
  const downStd = Math.sqrt(downVar);
  const years = Math.max(1 / 365, (to - from) / (365.25 * 86_400));
  const perYear = rets.length / years;
  const scale = Math.sqrt(Math.max(1, perYear));
  return {
    sharpe: std > 0 ? (mean / std) * scale : 0,
    sortino: downStd > 0 ? (mean / downStd) * scale : mean > 0 ? 99 : 0,
  };
}

export function botWinRate(stats: BotStats): number {
  const n = stats.closes > 0 ? stats.closes : 0;
  if (n <= 0) return 0;
  return (stats.wins / n) * 100;
}

export type MonteCarloResult = {
  samples: number;
  p5: number;
  p50: number;
  p95: number;
  mean: number;
  ruinPct: number;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type AllocInput = {
  id: string;
  score: number;
  sizeQuote: number;
  atrRiskPct?: number;
  budgetQuote?: number;
};

export type AllocResult = {
  id: string;
  weight: number;
  sizeQuote: number;
  atrRiskPct?: number;
  budgetQuote?: number;
};

/**
 * Performance-weighted capital shares. Clamps then renormalizes so weights sum to 1.
 * Negative/zero scores get the floor only after a positive-total path; all-nonpositive → equal.
 */
export function allocateByPerformance(
  rows: AllocInput[],
  opts?: { min?: number; max?: number },
): AllocResult[] {
  if (rows.length === 0) return [];
  const n = rows.length;
  const minW = Math.max(0, Math.min(1 / n, opts?.min ?? 0.05));
  const maxW = Math.max(minW, Math.min(1, opts?.max ?? 0.5));
  const totalSize = rows.reduce((s, r) => s + Math.max(0, r.sizeQuote), 0);
  const positive = rows.map((r) => Math.max(0, r.score));
  const sumPos = positive.reduce((a, b) => a + b, 0);
  let weights = rows.map((_, i) => (sumPos > 0 ? positive[i]! / sumPos : 1 / n));

  for (let iter = 0; iter < 16; iter++) {
    weights = weights.map((w) => Math.max(minW, Math.min(maxW, w)));
    const sum = weights.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) < 1e-9) break;
    if (sum < 1) {
      const need = 1 - sum;
      const room = weights.map((w) => Math.max(0, maxW - w));
      const roomSum = room.reduce((a, b) => a + b, 0);
      if (roomSum < 1e-12) {
        const s = weights.reduce((a, b) => a + b, 0) || 1;
        weights = weights.map((w) => w / s);
        break;
      }
      weights = weights.map((w, i) => w + (need * room[i]!) / roomSum);
    } else {
      const excess = sum - 1;
      const spare = weights.map((w) => Math.max(0, w - minW));
      const spareSum = spare.reduce((a, b) => a + b, 0);
      if (spareSum < 1e-12) {
        const s = weights.reduce((a, b) => a + b, 0) || 1;
        weights = weights.map((w) => w / s);
        break;
      }
      weights = weights.map((w, i) => w - (excess * spare[i]!) / spareSum);
    }
  }
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  weights = weights.map((w) => w / sum);

  return rows.map((r, i) => {
    const weight = weights[i]!;
    const sizeQuote = totalSize > 0 ? totalSize * weight : r.sizeQuote;
    const atrRiskPct =
      r.atrRiskPct != null && r.atrRiskPct > 0 ? Math.max(0.05, r.atrRiskPct * weight * rows.length) : r.atrRiskPct;
    const budgetQuote =
      r.budgetQuote != null && r.budgetQuote > 0 ? Math.max(0, r.budgetQuote * weight * rows.length) : r.budgetQuote;
    return { id: r.id, weight, sizeQuote, atrRiskPct, budgetQuote };
  });
}

/** Score a live/paper bot for allocation (PnL + mild win-rate boost). */
export function botAllocScore(bot: Bot): number {
  const pnl = bot.stats.realizedPnl + (bot.runtime.dayPnl ?? 0);
  const wr = botWinRate(bot.stats);
  const closes = bot.stats.closes ?? 0;
  const boost = closes >= 3 ? ((wr - 50) / 100) * Math.max(20, Math.abs(pnl) * 0.1) : 0;
  return pnl + boost;
}

/** Shuffle closed-trade PnLs to estimate a 5/50/95 terminal outcome. */
export function monteCarloPnl(pnls: number[], startEquity: number, samples = 200, seed = 1): MonteCarloResult | null {
  if (pnls.length < 3 || !(startEquity > 0) || samples < 8) return null;
  const rand = mulberry32(seed);
  const terminals: number[] = [];
  let ruin = 0;
  for (let i = 0; i < samples; i++) {
    const order = pnls.slice();
    for (let j = order.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1));
      const tmp = order[j]!;
      order[j] = order[k]!;
      order[k] = tmp;
    }
    let eq = startEquity;
    for (const p of order) {
      eq += p;
      if (eq <= startEquity * 0.5) {
        ruin += 1;
        break;
      }
    }
    terminals.push(eq - startEquity);
  }
  terminals.sort((a, b) => a - b);
  const at = (q: number) => terminals[Math.min(terminals.length - 1, Math.max(0, Math.floor(q * (terminals.length - 1))))]!;
  const mean = terminals.reduce((s, n) => s + n, 0) / terminals.length;
  return {
    samples,
    p5: at(0.05),
    p50: at(0.5),
    p95: at(0.95),
    mean,
    ruinPct: (ruin / samples) * 100,
  };
}
