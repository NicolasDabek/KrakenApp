import type { BookLevel, OrderBook } from "./types.ts";

/**
 * Score de carnet d'ordres sur plusieurs profondeurs (top 5 / 10 / 25 niveaux).
 *
 * Seuils (documentés, utilisés par le filtre `bookFilter` des bots) :
 * - imbalance = (bidEUR − askEUR) / (bidEUR + askEUR), de −1 (vendeurs) à +1 (acheteurs).
 *   Score global = moyenne pondérée top5 ×0,5 + top10 ×0,3 + top25 ×0,2 (le proche compte plus).
 * - Mur : un niveau dont le notionnel ≥ WALL_MULT (4) × la médiane des 25 premiers niveaux du côté,
 *   et à moins de WALL_NEAR_PCT (0,5 %) du milieu. Les murs plus loin sont ignorés.
 * - Carnet mince : notionnel top 10 d'un côté < THIN_QUOTE (2 000) en devise de cotation,
 *   ou moins de 5 niveaux de ce côté.
 * - Spread : en % du milieu ; > WIDE_SPREAD_PCT (0,3 %) = large.
 */
export const BOOK_DEPTHS = [5, 10, 25] as const;
export const WALL_MULT = 4;
export const WALL_NEAR_PCT = 0.5;
export const THIN_QUOTE = 2000;
export const WIDE_SPREAD_PCT = 0.3;
/** Carnet plus vieux que ça : ignoré (le filtre ne bloque rien). */
export const BOOK_MAX_AGE_MS = 20_000;

export type DepthSlice = { levels: number; bidQuote: number; askQuote: number; imbalance: number };
export type BookWall = {
  side: "bid" | "ask";
  price: number;
  quote: number;
  distPct: number;
  ratio: number;
};
export type BookScore = {
  mid: number;
  spreadPct: number;
  depths: DepthSlice[];
  /** −1..+1, pondéré vers le haut du carnet. */
  score: number;
  bidWall: BookWall | null;
  askWall: BookWall | null;
  thinBids: boolean;
  thinAsks: boolean;
  wideSpread: boolean;
};

const notional = (rows: BookLevel[], n: number) =>
  rows.slice(0, n).reduce((s, l) => s + l.price * l.size, 0);
const imb = (b: number, a: number) => (b + a > 0 ? (b - a) / (b + a) : 0);

function findWall(rows: BookLevel[], side: "bid" | "ask", mid: number): BookWall | null {
  const top = rows.slice(0, 25);
  if (top.length < 5 || !(mid > 0)) return null;
  const q = top.map((l) => l.price * l.size);
  const sorted = [...q].sort((x, y) => x - y);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  if (!(median > 0)) return null;
  let best: BookWall | null = null;
  top.forEach((l, i) => {
    const distPct = (Math.abs(l.price - mid) / mid) * 100;
    const ratio = q[i]! / median;
    if (distPct <= WALL_NEAR_PCT && ratio >= WALL_MULT && (!best || q[i]! > best.quote)) {
      best = { side, price: l.price, quote: q[i]!, distPct, ratio };
    }
  });
  return best;
}

export function scoreBook(book?: OrderBook | null): BookScore | null {
  if (!book || !book.bids?.length || !book.asks?.length) return null;
  const bid = book.bids[0]!.price;
  const ask = book.asks[0]!.price;
  if (!(bid > 0) || !(ask > 0) || ask < bid) return null;
  const mid = (bid + ask) / 2;
  const depths = BOOK_DEPTHS.map((n) => {
    const b = notional(book.bids, n);
    const a = notional(book.asks, n);
    return { levels: n, bidQuote: b, askQuote: a, imbalance: imb(b, a) };
  });
  const score =
    depths[0]!.imbalance * 0.5 + depths[1]!.imbalance * 0.3 + depths[2]!.imbalance * 0.2;
  const spreadPct = ((ask - bid) / mid) * 100;
  return {
    mid,
    spreadPct,
    depths,
    score,
    bidWall: findWall(book.bids, "bid", mid),
    askWall: findWall(book.asks, "ask", mid),
    thinBids: book.bids.length < 5 || depths[1]!.bidQuote < THIN_QUOTE,
    thinAsks: book.asks.length < 5 || depths[1]!.askQuote < THIN_QUOTE,
    wideSpread: spreadPct > WIDE_SPREAD_PCT,
  };
}

export type BookFilterMode = "off" | "soft" | "strict";

/**
 * Raison de bloquer un ACHAT selon le carnet, ou null.
 * soft : bloque si score ≤ −0,5, mur vendeur proche (sans mur acheteur), ou carnet acheteur mince.
 * strict : idem avec score ≤ −0,2, et bloque aussi un spread large.
 */
export function bookBuyBlock(s: BookScore | null, mode: BookFilterMode): string | null {
  if (!s || mode === "off") return null;
  const lim = mode === "strict" ? -0.2 : -0.5;
  if (s.score <= lim) return `Carnet vendeur (${(s.score * 100).toFixed(0)}) — pas d’achat`;
  if (s.askWall && !s.bidWall) {
    return `Mur vendeur ×${s.askWall.ratio.toFixed(0)} à ${s.askWall.distPct.toFixed(2)} % — pas d’achat`;
  }
  if (s.thinBids) return "Carnet acheteur mince — pas d’achat";
  if (mode === "strict" && s.wideSpread) return `Spread ${s.spreadPct.toFixed(2)} % — pas d’achat`;
  return null;
}

/** Résumé compact pour l'UI : « Carnet +32 · mur V 0,21 % · mince A ». */
export function bookHint(s: BookScore | null): string | null {
  if (!s) return null;
  const parts = [`Carnet ${s.score >= 0 ? "+" : ""}${(s.score * 100).toFixed(0)}`];
  if (s.bidWall) parts.push(`mur A ${s.bidWall.distPct.toFixed(2)} %`);
  if (s.askWall) parts.push(`mur V ${s.askWall.distPct.toFixed(2)} %`);
  if (s.thinBids) parts.push("acheteurs minces");
  if (s.thinAsks) parts.push("vendeurs minces");
  return parts.join(" · ");
}
