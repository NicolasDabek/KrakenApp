/**
 * Detects protective orders (stop-loss / take-profit) left behind on a pair with no
 * remaining main limit order — ported from Bot_Kraken_Typescript `OrderWatcher`.
 * Pure: returns the txids to cancel, the caller decides whether to cancel them.
 */
export type OpenOrderLike = { descr?: { pair?: string; ordertype?: string } };

const PROTECTIVE = new Set([
  "stop-loss",
  "take-profit",
  "take-profit-limit",
  "stop-loss-limit",
  "trailing-stop",
  "trailing-stop-limit",
]);

export function orphanProtectiveOrders(
  open: Record<string, OpenOrderLike> | undefined,
  pairs?: string[],
): string[] {
  if (!open) return [];
  const byPair = new Map<string, { main: number; protective: string[] }>();
  for (const [txid, o] of Object.entries(open)) {
    const pair = o.descr?.pair;
    const type = o.descr?.ordertype ?? "";
    if (!pair || (pairs && !pairs.includes(pair))) continue;
    const slot = byPair.get(pair) ?? { main: 0, protective: [] };
    if (PROTECTIVE.has(type)) slot.protective.push(txid);
    else if (type === "limit") slot.main++;
    byPair.set(pair, slot);
  }
  const out: string[] = [];
  for (const slot of byPair.values()) if (slot.main === 0) out.push(...slot.protective);
  return out;
}
