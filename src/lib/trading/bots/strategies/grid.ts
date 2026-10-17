import type { Bot, BotParams, BotRuntime, GridLevelState } from "../../types.ts";
import { defaultParams } from "../catalog.ts";
import { px, qtyFromQuote, roundSmart, sizeQuoteOf } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export type GridChartLevel = { price: number; kind: "buy" | "sell" | "entry" | "band"; title: string };

export function gridChartLevels(
  bot: { params: BotParams; runtime: BotRuntime },
  feeRate?: number,
): GridChartLevel[] {
  const pad = gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
  const sellPct = (bot.params.gridSellPct ?? 1.5) + pad;
  const out: GridChartLevel[] = [];
  const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
  const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
  if (lo > 0) out.push({ price: lo, kind: "band", title: "Plancher" });
  if (hi > 0) out.push({ price: hi, kind: "band", title: "Plafond" });
  for (const g of bot.runtime.gridOwned ?? []) {
    if (g.pending && g.price > 0) out.push({ price: g.price, kind: "buy", title: "Achat" });
    else if (g.qty > 0 && g.entry > 0) {
      out.push({ price: g.entry, kind: "entry", title: "Lot" });
      out.push({ price: g.entry * (1 + sellPct / 100), kind: "sell", title: "Vente" });
    }
  }
  return out.slice(0, 16);
}

export const GRID_PRESETS: { id: string; label: string; sell: number; buy: number; levels: number; band: number }[] = [
  { id: "tight", label: "Serrée", sell: 0.8, buy: 0.5, levels: 10, band: 0.04 },
  { id: "std", label: "Standard", sell: 1.5, buy: 1, levels: 8, band: 0.08 },
  { id: "wide", label: "Large", sell: 3, buy: 2, levels: 6, band: 0.14 },
];

/** Extra sell % so a advertised take-profit is net of a round-trip taker fee. */
export function gridFeePadPct(feeRate?: number, net = true): number {
  if (!net || !(feeRate && feeRate > 0)) return 0;
  return feeRate * 2 * 100;
}

export function applyGridPreset(last: number, preset: (typeof GRID_PRESETS)[number], extra: Partial<BotParams> = {}): BotParams {
  const half = preset.band / 2;
  return {
    ...defaultParams("grid", last),
    gridSellPct: preset.sell,
    gridBuyPct: preset.buy,
    levels: preset.levels,
    lower: roundSmart(last * (1 - half)),
    upper: roundSmart(last * (1 + half)),
    ...extra,
  };
}

function nearPx(a: number, b: number): boolean {
  if (!(a > 0) || !(b > 0)) return false;
  return Math.abs(a - b) / Math.max(a, b) < 5e-4;
}

export function evalGrid(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const pad = gridFeePadPct(ctx.feeRate, bot.params.gridNetFees !== false);
  const sellPct = (bot.params.gridSellPct ?? 1.5) + pad;
  const buyPct = bot.params.gridBuyPct ?? 1;
  const lotSl = bot.params.gridSlPct ?? 0;
  const maxLots = Math.max(1, Math.min(24, Math.round(bot.params.levels ?? 8)));
  const paramLo = bot.params.lower ?? 0;
  const paramHi = bot.params.upper ?? 0;
  const runtime: BotRuntime = { ...bot.runtime };
  if (!(sellPct > 0) || !(buyPct > 0)) {
    return { fills: [], runtime, note: "Pourcentages de grille invalides." };
  }
  if (paramLo > 0 && paramHi > 0 && !(paramHi > paramLo)) {
    return { fills: [], runtime, note: "Fourchette de grille invalide." };
  }

  let bandLo = runtime.gridLower ?? paramLo;
  let bandHi = runtime.gridUpper ?? paramHi;
  const last = ctx.ticker.last;
  const prev = runtime.lastPrice;
  const fills: BotFill[] = [];
  const pathLow = ctx.barLow ?? (prev != null && prev > 0 ? Math.min(prev, last) : last);
  const pathHigh = ctx.barHigh ?? (prev != null && prev > 0 ? Math.max(prev, last) : last);
  const fee = ctx.feeRate ?? 0;
  const fillCap = Math.max(1, Math.min(32, ctx.maxFills ?? 32));
  let quoteLeft = ctx.quoteBudget;
  let baseLeft = ctx.baseBudget;
  const buyPause = Boolean(runtime.buyPause);
  if ((runtime.buyCoolUntil ?? 0) > 0 && ctx.now >= runtime.buyCoolUntil!) {
    runtime.buyCoolUntil = undefined;
  }
  let cooling = (runtime.buyCoolUntil ?? 0) > ctx.now;
  const wantSeed = Boolean(runtime.gridSeedNow) || Boolean(bot.params.gridSeed && (prev == null || !(prev > 0)));
  const quoteSize = sizeQuoteOf(bot, ctx);
  const qtyAt = (price: number) => qtyFromQuote(quoteSize, price);
  let lots: GridLevelState[] = (runtime.gridOwned ?? []).map((g) => ({ ...g }));
  let recentered = false;
  const skipSell = new Set<number>();
  const skipBuy = new Set<number>();

  const inBand = (p: number) => {
    if (bandLo > 0 && p < bandLo * 0.999) return false;
    if (bandHi > 0 && p > bandHi * 1.001) return false;
    return true;
  };

  const addPending = (raw: number, kind: "step" | "rebuy"): number => {
    const p = roundSmart(raw);
    if (!(p > 0) || (kind !== "rebuy" && !inBand(p))) return -1;
    const near = lots.findIndex((g) => g.pending && nearPx(g.price, p));
    if (near >= 0) {
      if (kind !== "rebuy") return -1;
      lots[near] = { ...lots[near]!, price: p, anchor: true };
      return near;
    }
    if (lots.some((g) => g.qty > 0 && (nearPx(g.entry, p) || nearPx(g.price, p)))) return -1;
    const held = lots.filter((g) => g.qty > 0).length;
    const pendingN = lots.filter((g) => g.pending).length;
    if (kind === "step" && held >= maxLots) return -1;
    if (held + pendingN >= Math.max(maxLots * 2, maxLots + 1)) return -1;
    lots.push({ price: p, qty: 0, entry: 0, pending: true, anchor: kind === "rebuy" ? true : undefined });
    return lots.length - 1;
  };

  const armBait = () => {
    const bait = last * (1 - buyPct / 100);
    const floored = bandLo > 0 ? Math.max(bait, bandLo) : bait;
    const capped = bandHi > 0 ? Math.min(floored, bandHi) : floored;
    addPending(capped, "step");
  };

  const canBuy = (qty: number, price: number) => {
    if (fills.length >= fillCap) return false;
    if (buyPause || cooling) return false;
    if (quoteLeft == null) return true;
    const cost = qty * price * (1 + fee);
    return cost <= quoteLeft + 1e-9;
  };
  const canSell = (qty: number) => {
    if (fills.length >= fillCap) return false;
    if (baseLeft == null) return true;
    return qty <= baseLeft + 1e-12;
  };
  const spendBuy = (qty: number, price: number) => {
    if (quoteLeft != null) quoteLeft -= qty * price * (1 + fee);
    if (baseLeft != null) baseLeft += qty;
  };
  const spendSell = (qty: number) => {
    if (baseLeft != null) baseLeft -= qty;
  };

  const seedLot = () => {
    if (buyPause || lots.some((g) => g.qty > 0)) return false;
    if (!(last > 0) || !inBand(last)) return false;
    const fillPx = px(ctx, "buy");
    const qty = qtyAt(fillPx);
    if (!(qty > 0) || !canBuy(qty, fillPx)) return false;
    fills.push({
      side: "buy",
      qty,
      price: fillPx,
      note: `Grille lot initial @ ${roundSmart(fillPx)}`,
    });
    spendBuy(qty, fillPx);
    lots.push({ price: fillPx, qty, entry: fillPx, pending: false });
    skipSell.add(lots.length - 1);
    addPending(fillPx * (1 - buyPct / 100), "step");
    return true;
  };
  const trySeed = () => {
    if (!wantSeed) {
      runtime.gridSeedNow = false;
      return false;
    }
    const ok = seedLot();
    runtime.gridSeedNow = !ok;
    return ok;
  };

  if (bot.params.gridFollow && bandLo > 0 && bandHi > bandLo && last > 0) {
    const heldN = lots.filter((g) => g.qty > 0).length;
    if (heldN === 0 && (last > bandHi || last < bandLo)) {
      const width = bandHi - bandLo;
      bandLo = roundSmart(Math.max(last - width / 2, last * 0.5));
      bandHi = roundSmart(last + width / 2);
      runtime.gridLower = bandLo;
      runtime.gridUpper = bandHi;
      lots = lots.filter((g) => g.qty > 0 || (g.pending && (g.anchor || inBand(g.price))));
      recentered = true;
    }
  }

  const hadBook = lots.some((g) => g.qty > 0 || g.pending);
  const cold = prev == null || !(prev > 0);
  if (cold) {
    trySeed();
    if (!lots.some((g) => g.qty > 0 || g.pending) && !buyPause && !cooling) armBait();
    if (!lots.some((g) => g.pending)) {
      runtime.lastPrice = last;
      runtime.gridOwned = lots.filter((g) => g.qty > 0 || g.pending);
      return {
        fills,
        runtime,
        note: fills.length
          ? fills.map((f) => f.note).join(" · ")
          : recentered
            ? "Fourchette recentrée — grille armée."
            : "Grille armée — en attente d’un croisement.",
      };
    }
  } else {
    trySeed();
  }

  let guard = 0;
  let progressed = true;
  while (progressed && guard++ < 32 && fills.length < fillCap) {
    progressed = false;

    if (lotSl > 0) {
      for (let i = 0; i < lots.length; i++) {
        if (fills.length >= fillCap) break;
        const g = lots[i]!;
        if (skipSell.has(i) || !(g.qty > 0) || !(g.entry > 0)) continue;
        const stopAt = g.entry * (1 - lotSl / 100);
        if (!(pathLow <= stopAt)) continue;
        if (!canSell(g.qty)) continue;
        const fillPx = ctx.barLow != null ? stopAt : px(ctx, "sell");
        fills.push({
          side: "sell",
          qty: g.qty,
          price: fillPx,
          note: `Stop lot −${lotSl}% (achat ${roundSmart(g.entry)})`,
          entry: g.entry,
        });
        spendSell(g.qty);
        lots[i] = { price: g.price, qty: 0, entry: 0, pending: false };
        skipSell.add(i);
        progressed = true;
        const coolMin = bot.params.gridSlCooldownMin ?? 0;
        if (coolMin > 0) {
          runtime.buyCoolUntil = Math.max(runtime.buyCoolUntil ?? 0, ctx.now + coolMin * 60_000);
          cooling = true;
        }
      }
    }

    for (let i = 0; i < lots.length; i++) {
      if (fills.length >= fillCap) break;
      const g = lots[i]!;
      if (skipSell.has(i) || !(g.qty > 0) || !(g.entry > 0)) continue;
      const sellAt = g.entry * (1 + sellPct / 100);
      if (!(pathHigh >= sellAt)) continue;
      if (!canSell(g.qty)) continue;
      const fillPx = ctx.barHigh != null ? sellAt : px(ctx, "sell");
      fills.push({
        side: "sell",
        qty: g.qty,
        price: fillPx,
        note: `Grille vente +${Number(sellPct.toFixed(2))}% (achat ${roundSmart(g.entry)})`,
        entry: g.entry,
      });
      spendSell(g.qty);
      const rebuy = g.entry;
      lots[i] = { price: g.price, qty: 0, entry: 0, pending: false };
      skipSell.add(i);
      progressed = true;
      const idx = addPending(rebuy, "rebuy");
      if (idx >= 0) skipBuy.add(idx);
    }

    if (buyPause || cooling) continue;

    const pendingIdx = lots
      .map((g, i) => ({ g, i }))
      .filter(({ g, i }) => g.pending && !(g.qty > 0) && !skipBuy.has(i))
      .sort((a, b) => b.g.price - a.g.price);

    for (const { i } of pendingIdx) {
      if (fills.length >= fillCap) break;
      const g = lots[i];
      if (!g?.pending || skipBuy.has(i)) continue;
      const trigger = g.price;
      if (!(pathLow <= trigger)) continue;
      const fillPx = ctx.barLow != null ? trigger : px(ctx, "buy");
      const qty = qtyAt(fillPx);
      if (!(qty > 0) || !canBuy(qty, fillPx)) continue;
      fills.push({
        side: "buy",
        qty,
        price: fillPx,
        note: `Grille achat @ ${roundSmart(trigger)}`,
      });
      spendBuy(qty, fillPx);
      lots[i] = { price: trigger, qty, entry: fillPx, pending: false };
      skipSell.add(i);
      progressed = true;
      addPending(fillPx * (1 - buyPct / 100), "step");
    }
  }

  let cleaned = lots.filter((g) => g.qty > 0 || g.pending);
  if (cleaned.length === 0 && !buyPause && !cooling) {
    lots.length = 0;
    armBait();
    cleaned = lots.filter((g) => g.qty > 0 || g.pending);
  }

  runtime.lastPrice = last;
  runtime.gridOwned = cleaned;
  runtime.gridLower = bandLo || undefined;
  runtime.gridUpper = bandHi || undefined;
  const held = cleaned.filter((g) => g.qty > 0);
  const pending = cleaned.filter((g) => g.pending);
  const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
  const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
  const wait =
    (buyPause ? "Achats en pause · " : "") +
    (cooling ? "Pause achats après stop lot · " : "") +
    (recentered ? "Fourchette recentrée · " : "") +
    `En attente · ${held.length} lot${held.length > 1 ? "s" : ""} · ${pending.length} ordre${pending.length > 1 ? "s" : ""} d’achat` +
    (nextBuy ? ` · achat ${roundSmart(nextBuy)}` : "") +
    (nextSell ? ` · vente ${roundSmart(nextSell)}` : "");
  return {
    fills,
    runtime,
    note: fills.length
      ? fills.map((f) => f.note).join(" · ")
      : cold && !hadBook
        ? recentered
          ? "Fourchette recentrée — grille armée."
          : "Grille armée — en attente d’un croisement."
        : wait,
  };
}

export function syncGridPosition(runtime: BotRuntime, fills: BotFill[]) {
  const held = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
  if (held.length) {
    const qty = held.reduce((s, g) => s + g.qty, 0);
    const avg = qty > 0 ? held.reduce((s, g) => s + g.qty * g.entry, 0) / qty : 0;
    runtime.inPosition = true;
    runtime.positionQty = qty;
    runtime.positionAvg = avg;
  } else if (!fills.some((f) => f.side === "buy")) {
    runtime.inPosition = false;
    runtime.positionQty = 0;
    runtime.positionAvg = 0;
  }
}

export function flattenGrid(runtime: BotRuntime) {
  runtime.gridOwned = [];
}
