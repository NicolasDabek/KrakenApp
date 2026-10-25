import { toast } from "sonner";
import { uid } from "../format.ts";
import { PAIR_BY_ID } from "../pairs.ts";
import type { Order } from "../types";
import { cloneBalances, getBal, pairAssets } from "./helpers.ts";
import { makePosition } from "./positions.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Traitement de chaque tick (alertes, récurrents, ordres limites, liquidations). */
export const createTickActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "processTick"> => ({
    processTick: () => {
      const { tickers, orders, alerts, settings, positions } = get();
      const now = Date.now();
      let balances = cloneBalances(get().balances);
      let nextOrders = [...orders];
      let fills = [...get().fills];
      let nextPositions = [...positions];
      let nextAlerts = [...alerts];
      const nextRecurring = get().recurring.map((r) => ({ ...r }));
      let changed = false;

      for (const order of nextOrders) {
        if (order.status !== "open") continue;
        const t = tickers[order.pair];
        if (!t) continue;
        const last = t.last;
        let hit = false;
        if (order.type === "limit" && order.price != null) {
          hit =
            order.side === "buy" ? last <= order.price : last >= order.price;
        } else if (order.type === "stop" && order.stopPrice != null) {
          hit =
            order.side === "buy" ? last >= order.stopPrice : last <= order.stopPrice;
        } else if (order.type === "stop-limit" && order.stopPrice != null && order.price != null) {
          const triggered =
            order.side === "buy" ? last >= order.stopPrice : last <= order.stopPrice;
          hit = triggered && (order.side === "buy" ? last <= order.price : last >= order.price);
        }
        if (!hit) continue;
        const { base, quote } = pairAssets(order.pair);
        const px = order.price ?? last;
        const fee = order.amount * px * settings.makerFee;
        order.status = "filled";
        order.filled = order.amount;
        order.avgPrice = px;
        order.fee = fee;
        order.updatedAt = now;
        fills = [
          {
            id: uid("fill"),
            orderId: order.id,
            pair: order.pair,
            side: order.side,
            amount: order.amount,
            price: px,
            fee,
            time: now,
          },
          ...fills,
        ];
        if (order.leverage > 1) {
          const quoteBal = getBal(balances, quote);
          const reserved = ((order.price ?? px) * order.amount) / order.leverage;
          quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
          nextPositions = [makePosition(order, px, now), ...nextPositions];
        } else if (order.side === "buy") {
          const quoteBal = getBal(balances, quote);
          const reserved = (order.price ?? px) * order.amount;
          quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
          const leftover = reserved - order.amount * px;
          quoteBal.available += Math.max(leftover, 0);
          getBal(balances, base).available += order.amount;
          quoteBal.available -= fee;
        } else {
          const baseBal = getBal(balances, base);
          baseBal.hold = Math.max(0, baseBal.hold - order.amount);
          getBal(balances, quote).available += order.amount * px - fee;
        }
        changed = true;
        toast.success("Ordre limite exécuté", { description: PAIR_BY_ID[order.pair]?.display });
      }

      nextPositions = nextPositions
        .map((pos) => {
          const t = tickers[pos.pair];
          if (!t) return pos;
          const last = t.last;
          const peak =
            pos.side === "long"
              ? Math.max(pos.peak ?? pos.entry, last)
              : Math.min(pos.peak ?? pos.entry, last);
          if (peak !== pos.peak) changed = true;
          return { ...pos, peak };
        })
        .filter((pos) => {
          const t = tickers[pos.pair];
          if (!t) return true;
          const last = t.last;
          const hitTp =
            pos.tp != null && (pos.side === "long" ? last >= pos.tp : last <= pos.tp);
          const hitSl =
            pos.sl != null && (pos.side === "long" ? last <= pos.sl : last >= pos.sl);
          const hitLiq = pos.side === "long" ? last <= pos.liqPrice : last >= pos.liqPrice;
          const trail = pos.trailingPct;
          const peak = pos.peak ?? pos.entry;
          const hitTrail =
            trail != null &&
            trail > 0 &&
            (pos.side === "long" ? last <= peak * (1 - trail / 100) : last >= peak * (1 + trail / 100));
          if (!hitTp && !hitSl && !hitLiq && !hitTrail) return true;
          const { quote } = pairAssets(pos.pair);
          const dir = pos.side === "long" ? 1 : -1;
          const pnl = (last - pos.entry) * pos.size * dir;
          const quoteBal = getBal(balances, quote);
          quoteBal.hold = Math.max(0, quoteBal.hold - pos.margin);
          quoteBal.available += pos.margin + pnl;
          changed = true;
          toast.message(hitLiq ? "Liquidation" : hitTrail ? "Trailing stop" : "TP/SL déclenché", {
            description: PAIR_BY_ID[pos.pair]?.display,
          });
          return false;
        });

      nextAlerts = nextAlerts.map((al) => {
        if (al.triggeredAt) return al;
        const t = tickers[al.pair];
        if (!t) return al;
        if (al.armPrice == null || !Number.isFinite(al.armPrice)) return { ...al, armPrice: t.last };
        const prev = al.armPrice;
        const crossed = al.condition === "above" ? prev < al.price && t.last >= al.price : prev > al.price && t.last <= al.price;
        if (!crossed) return { ...al, armPrice: t.last };
        changed = true;
        toast("Alerte prix", {
          description: `${PAIR_BY_ID[al.pair]?.display} ${al.condition === "above" ? "≥" : "≤"} ${al.price}`,
        });
        return { ...al, triggeredAt: now, armPrice: t.last };
      });

      for (const plan of nextRecurring) {
        if (!plan.active || plan.nextAt > now) continue;
        const t = tickers[plan.pair];
        const meta = PAIR_BY_ID[plan.pair];
        if (!t?.last || !meta) continue;
        const amount = plan.amountQuote / t.last;
        if (amount < meta.ordermin) continue;
        const live = Boolean(get().connection.apiKey && get().connection.apiSecret);
        if (live) {
          plan.nextAt = now + (plan.cadence === "daily" ? 86_400_000 : 604_800_000);
          changed = true;
          void get().placeLiveOrder({
            pair: plan.pair,
            side: "buy",
            type: "market",
            amount,
            note: "DCA",
          });
          continue;
        }
        const quoteBal = getBal(balances, meta.quote);
        const fee = plan.amountQuote * settings.takerFee;
        if (quoteBal.available < plan.amountQuote + fee) continue;
        quoteBal.available -= plan.amountQuote + fee;
        getBal(balances, meta.base).available += amount;
        const order: Order = {
          id: uid("ord"),
          pair: plan.pair,
          side: "buy",
          type: "market",
          amount,
          filled: amount,
          avgPrice: t.last,
          status: "filled",
          leverage: 1,
          fee,
          createdAt: now,
          updatedAt: now,
          note: "DCA",
        };
        nextOrders = [order, ...nextOrders];
        fills = [
          {
            id: uid("fill"),
            orderId: order.id,
            pair: plan.pair,
            side: "buy",
            amount,
            price: t.last,
            fee,
            time: now,
          },
          ...fills,
        ];
        plan.nextAt = now + (plan.cadence === "daily" ? 86_400_000 : 604_800_000);
        changed = true;
        toast.success("Achat récurrent", { description: meta.display });
      }

      if (changed) {
        set({
          balances,
          orders: nextOrders,
          fills,
          positions: nextPositions,
          alerts: nextAlerts,
          recurring: nextRecurring,
        });
      }
    },
});
