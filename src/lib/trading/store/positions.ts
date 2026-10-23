import { toast } from "sonner";
import type { BotRuntime, Fill, LiveFill, Order, Position } from "../types";
import { formatKrakenVolume, uid } from "../format.ts";
import { krakenAddOrder, krakenCancel, krakenClosePosition, krakenPlaceOrder, krakenQueryOrder } from "../functions.ts";
import { PAIR_BY_ID } from "../pairs.ts";
import { buzz, cloneBalances, getBal, pairAssets, pingFill, withLog } from "./helpers.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

export const INFLIGHT_TIMEOUT_MS = 90_000;

export function snapshotRuntime(runtime: BotRuntime): BotRuntime {
  const copy = { ...runtime };
  delete copy.flightPrev;
  delete copy.inFlight;
  delete copy.inFlightAt;
  return copy;
}

export function restoreFlight(runtime: BotRuntime): BotRuntime {
  if (!runtime.flightPrev) return { ...runtime, inFlight: false, inFlightAt: undefined };
  return { ...runtime.flightPrev, inFlight: false, inFlightAt: undefined, flightPrev: undefined };
}

function liquidationPrice(entry: number, leverage: number, side: "long" | "short") {
  const mm = 0.006;
  const move = (1 / leverage - mm) * entry;
  return side === "long" ? Math.max(entry - move, 0) : entry + move;
}

export function makePosition(order: Order, px: number, now: number): Position {
  const side = order.side === "buy" ? "long" : "short";
  return {
    id: uid("pos"),
    pair: order.pair,
    side,
    size: order.amount,
    entry: px,
    leverage: order.leverage,
    margin: (order.amount * px) / order.leverage,
    liqPrice: liquidationPrice(px, order.leverage, side),
    tp: order.tp,
    sl: order.sl,
    trailingPct: order.trailingPct,
    peak: px,
    openedAt: now,
  };
}

/** Ordres (papier et réels), positions et ordres en vol vers Kraken. */
export const createOrderActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "placeOrder" | "placeLiveOrder" | "cancelOrder" | "cancelLiveOrder" | "closePosition" | "closeLivePosition" | "dispatchKrakenFill"> => ({
    placeOrder: (input, opts) => {
      const silent = opts?.silent ?? false;
      const { base, quote, meta } = pairAssets(input.pair);
      const ticker = get().tickers[input.pair];
      if (!ticker) return { ok: false, message: "Marché indisponible pour le moment." };
      if (!meta) return { ok: false, message: "Paire inconnue." };
      if (!(input.amount > 0)) return { ok: false, message: "Quantité invalide." };
      if (input.amount < meta.ordermin) {
        return { ok: false, message: `Minimum ${meta.ordermin} ${base}.` };
      }

      const last = ticker.last;
      const leverage = Math.min(Math.max(input.leverage ?? 1, 1), meta.maxLeverage);
      const isMargin = leverage > 1;
      const now = Date.now();
      const order: Order = {
        id: uid("ord"),
        pair: input.pair,
        side: input.side,
        type: input.type,
        amount: input.amount,
        price: input.price,
        stopPrice: input.stopPrice,
        filled: 0,
        avgPrice: 0,
        status: "open",
        leverage,
        tp: input.tp,
        sl: input.sl,
        trailingPct: input.trailingPct,
        fee: 0,
        createdAt: now,
        updatedAt: now,
        note: input.note,
      };

      const shouldFillNow =
        input.type === "market" ||
        (input.type === "limit" &&
          input.price != null &&
          ((input.side === "buy" && last <= input.price) ||
            (input.side === "sell" && last >= input.price)));

      const fillPrice =
        input.type === "market"
          ? input.side === "buy"
            ? ticker.ask || last
            : ticker.bid || last
          : (input.price ?? last);

      const balances = cloneBalances(get().balances);
      const feeRate = shouldFillNow ? get().settings.takerFee : get().settings.makerFee;

      if (isMargin) {
        const marginNeeded = (input.amount * fillPrice) / leverage;
        const quoteBal = getBal(balances, quote);
        if (quoteBal.available < marginNeeded) {
          return { ok: false, message: `Marge insuffisante en ${quote}.` };
        }
        quoteBal.available -= marginNeeded;
        quoteBal.hold += marginNeeded;
      } else if (input.side === "buy") {
        const quoteBal = getBal(balances, quote);
        const cost = input.amount * (input.price ?? fillPrice);
        const hold = shouldFillNow ? 0 : cost;
        const spend = shouldFillNow ? cost * (1 + feeRate) : cost;
        if (quoteBal.available < spend) {
          return { ok: false, message: `Solde ${quote} insuffisant.` };
        }
        quoteBal.available -= spend;
        if (!shouldFillNow) quoteBal.hold += hold;
      } else {
        const baseBal = getBal(balances, base);
        if (baseBal.available < input.amount) {
          return { ok: false, message: `Solde ${base} insuffisant.` };
        }
        baseBal.available -= input.amount;
        if (!shouldFillNow) baseBal.hold += input.amount;
      }

      if (shouldFillNow) {
        const fee = input.amount * fillPrice * feeRate;
        order.status = "filled";
        order.filled = input.amount;
        order.avgPrice = fillPrice;
        order.fee = fee;
        const fill: Fill = {
          id: uid("fill"),
          orderId: order.id,
          pair: input.pair,
          side: input.side,
          amount: input.amount,
          price: fillPrice,
          fee,
          time: now,
        };
        if (isMargin) {
          set({
            balances,
            orders: [order, ...get().orders],
            fills: [fill, ...get().fills],
            positions: [makePosition(order, fillPrice, now), ...get().positions],
          });
        } else if (input.side === "buy") {
          const baseBal = getBal(balances, base);
          baseBal.available += input.amount;
          set({
            balances,
            orders: [order, ...get().orders],
            fills: [fill, ...get().fills],
          });
        } else {
          const quoteBal = getBal(balances, quote);
          quoteBal.available += input.amount * fillPrice - fee;
          set({
            balances,
            orders: [order, ...get().orders],
            fills: [fill, ...get().fills],
          });
        }
        if (!silent) {
          buzz();
          toast.success(
            `${input.side === "buy" ? "Achat" : "Vente"} ${meta.display} exécuté`,
            { description: `${input.amount} ${base} @ ${fillPrice}` },
          );
        }
        return { ok: true, message: "Ordre exécuté.", order };
      }

      set({ balances, orders: [order, ...get().orders] });
      if (!silent) toast.message("Ordre ouvert", { description: `${meta.display} · ${input.type}` });
      return { ok: true, message: "Ordre placé.", order };
    },

    placeLiveOrder: async (input) => {
      const { apiKey, apiSecret } = get().connection;
      if (!apiKey || !apiSecret) return { ok: false, message: "Clés Kraken manquantes." };
      const ticker = get().tickers[input.pair];
      const last = ticker?.last ?? input.price ?? 0;
      const res = await krakenPlaceOrder({
        data: {
          apiKey,
          apiSecret,
          pair: input.pair,
          side: input.side,
          type: input.type,
          amount: input.amount,
          price: input.price ?? last,
          stopPrice: input.stopPrice,
          leverage: input.leverage,
          tp: input.tp,
          sl: input.sl,
          trailingPct: input.trailingPct,
          note: input.note,
        },
      });
      if (!res.ok) {
        toast.message("Kraken a refusé l’ordre", { description: res.message });
        return { ok: false, message: res.message };
      }
      if (res.order) {
        set({
          krakenOrders: [res.order, ...get().krakenOrders.filter((o) => o.id !== res.order!.id)].slice(0, 80),
        });
      }
      toast.success("Ordre Kraken", { description: res.message });
      void get().syncKraken("light");
      return { ok: true, message: res.message, order: res.order };
    },

    cancelOrder: (id) => {
      const order = get().orders.find((o) => o.id === id && o.status === "open");
      if (!order) return;
      const { base, quote } = pairAssets(order.pair);
      const balances = cloneBalances(get().balances);
      if (order.leverage > 1) {
        const quoteBal = getBal(balances, quote);
        const reserved = ((order.price ?? 0) * order.amount) / order.leverage;
        quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
        quoteBal.available += reserved;
      } else if (order.side === "buy") {
        const quoteBal = getBal(balances, quote);
        const reserved = (order.price ?? 0) * order.amount;
        quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
        quoteBal.available += reserved;
      } else {
        const baseBal = getBal(balances, base);
        baseBal.hold = Math.max(0, baseBal.hold - order.amount);
        baseBal.available += order.amount;
      }
      set({
        balances,
        orders: get().orders.map((o) =>
          o.id === id ? { ...o, status: "cancelled", updatedAt: Date.now() } : o,
        ),
      });
    },

    cancelLiveOrder: async (id) => {
      const { apiKey, apiSecret } = get().connection;
      if (!apiKey || !apiSecret) return { ok: false, message: "Clés Kraken manquantes." };
      const res = await krakenCancel({ data: { apiKey, apiSecret, txid: id } });
      if (!res.ok) {
        toast.message("Annulation refusée", { description: res.message });
        return res;
      }
      set({
        krakenOrders: get().krakenOrders.map((o) =>
          o.id === id ? { ...o, status: "cancelled", updatedAt: Date.now() } : o,
        ),
      });
      toast.message("Ordre annulé");
      void get().syncKraken("light");
      return res;
    },

    closePosition: (id) => {
      const pos = get().positions.find((p) => p.id === id);
      if (!pos) return;
      const ticker = get().tickers[pos.pair];
      if (!ticker) return;
      const { quote } = pairAssets(pos.pair);
      const px = ticker.last;
      const dir = pos.side === "long" ? 1 : -1;
      const pnl = (px - pos.entry) * pos.size * dir;
      const fee = pos.size * px * get().settings.takerFee;
      const balances = cloneBalances(get().balances);
      const quoteBal = getBal(balances, quote);
      quoteBal.hold = Math.max(0, quoteBal.hold - pos.margin);
      quoteBal.available += pos.margin + pnl - fee;
      const fill: Fill = {
        id: uid("fill"),
        orderId: pos.id,
        pair: pos.pair,
        side: pos.side === "long" ? "sell" : "buy",
        amount: pos.size,
        price: px,
        fee,
        time: Date.now(),
      };
      set({
        balances,
        positions: get().positions.filter((p) => p.id !== id),
        fills: [fill, ...get().fills],
      });
      buzz();
      toast.success("Position clôturée", {
        description: `PnL ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ${quote}`,
      });
    },

    closeLivePosition: async (id) => {
      const pos = get().krakenPositions.find((p) => p.id === id) ?? get().positions.find((p) => p.id === id);
      if (!pos) return { ok: false, message: "Position introuvable." };
      const { apiKey, apiSecret } = get().connection;
      if (!apiKey || !apiSecret) return { ok: false, message: "Clés Kraken manquantes." };
      const res = await krakenClosePosition({
        data: {
          apiKey,
          apiSecret,
          id: pos.id,
          pair: pos.pair,
          side: pos.side,
          size: pos.size,
          leverage: pos.leverage,
          entry: pos.entry,
          margin: pos.margin,
          liqPrice: pos.liqPrice,
          openedAt: pos.openedAt,
          peak: pos.peak,
        },
      });
      if (!res.ok) {
        toast.message("Clôture refusée", { description: res.message });
        return res;
      }
      toast.success("Position clôturée", { description: res.message });
      void get().syncKraken("light");
      return res;
    },

    dispatchKrakenFill: async (input) => {
      const { apiKey, apiSecret } = get().connection;
      const fail = (message: string, pause = false) => {
        set({
          bots: get().bots.map((b) =>
            b.id === input.botId
              ? {
                  ...b,
                  status: pause ? "paused" : b.status === "running" ? "running" : b.status,
                  lastNote: message,
                  error: message,
                  runtime: {
                    ...input.prevRuntime,
                    inFlight: false,
                    errorStreak: (b.runtime.errorStreak ?? 0) + 1,
                  },
                }
              : b,
          ),
        });
        toast.message("Kraken a refusé l’ordre", { description: message });
      };
      if (!apiKey || !apiSecret) {
        fail("Clés Kraken manquantes.", true);
        return;
      }
      const meta = PAIR_BY_ID[input.pair];
      if (!meta || meta.quote !== "EUR") {
        fail("Paire hors EUR.", true);
        return;
      }
      const volume = formatKrakenVolume(input.qty, meta.lotDecimals);
      if (!(Number(volume) > 0)) {
        fail(`Volume invalide (${volume}).`);
        return;
      }
      if (Number(volume) < meta.ordermin) {
        fail(`Sous le minimum ${meta.ordermin} ${meta.base}.`);
        return;
      }
      const balances = get().krakenBalances;
      if (input.side === "buy") {
        const known = get().krakenSyncAt > 0 || get().krakenEur > 0 || Object.keys(balances).length > 0;
        const need = input.qty * input.price * 1.004;
        if (known && get().krakenEur + 1e-9 < need) {
          fail(`EUR insuffisant sur Kraken (${need.toFixed(2)} requis).`, true);
          return;
        }
      }
      if (input.side === "sell") {
        const have = balances[meta.base] ?? 0;
        if (Object.keys(balances).length > 0 && have + 1e-12 < input.qty) {
          fail(`Solde ${meta.base} insuffisant sur Kraken.`, true);
          return;
        }
      }
      const res = await krakenAddOrder({
        data: { apiKey, apiSecret, pair: input.pair, side: input.side, volume },
      });
      const now = Date.now();
      if (!res.ok) {
        const fatal = /Invalid key|Invalid signature|Permission denied|Insufficient funds/i.test(res.message);
        const streak = (get().bots.find((b) => b.id === input.botId)?.runtime.errorStreak ?? 0) + 1;
        fail(res.message, fatal || streak >= 3);
        if (/Invalid key|Invalid signature/i.test(res.message)) get().pauseAllBots("live");
        return;
      }
      const feeRate = get().settings.takerFee;
      let fillPx = input.price;
      let fillQty = input.qty;
      let fee = fillQty * fillPx * feeRate;
      if (res.txid) {
        try {
          const q = await krakenQueryOrder({ data: { apiKey, apiSecret, txid: res.txid } });
          if (q.ok && q.order) {
            if (q.order.avgPrice > 0) fillPx = q.order.avgPrice;
            if (q.order.filled > 0) fillQty = q.order.filled;
            if (q.order.fee > 0) fee = q.order.fee;
            else fee = fillQty * fillPx * feeRate;
          }
        } catch {
          /* keep ticker price */
        }
      }
      let pnl = 0;
      if (input.side === "sell" && input.entryAvg && input.entryAvg > 0) {
        pnl = fillQty * fillPx - fee - input.entryAvg * fillQty;
      }
      const live: LiveFill = {
        id: uid("lf"),
        botId: input.botId,
        pair: input.pair,
        side: input.side,
        amount: fillQty,
        price: fillPx,
        fee,
        pnl,
        note: input.note,
        time: now,
        txid: res.txid,
      };
      set({
        liveFills: [live, ...get().liveFills].slice(0, 250),
        bots: get().bots.map((b) => {
          if (b.id !== input.botId) return b;
          const stats = { ...b.stats };
          stats.trades += 1;
          stats.feesPaid += fee;
          stats.volume += fillQty * fillPx;
          stats.realizedPnl += pnl;
          if (input.side === "sell") {
            stats.closes = (stats.closes ?? 0) + 1;
            if (pnl > 0) stats.wins += 1;
          }
          const compound = b.params.compoundPct ?? 0;
          const sizeQuote =
            compound > 0 && input.side === "sell" && pnl > 0
              ? Math.max(5, b.sizeQuote + pnl * (compound / 100))
              : b.sizeQuote;
          const dayPnl = (input.intendedRuntime.dayPnl ?? 0) + pnl;
          const dayTrades = (input.intendedRuntime.dayTrades ?? 0) + 1;
          const consecutiveLosses =
            input.side === "sell" ? (pnl < 0 ? (b.runtime.consecutiveLosses ?? 0) + 1 : 0) : (b.runtime.consecutiveLosses ?? 0);
          return withLog(
            {
              ...b,
              stats,
              sizeQuote,
              lastActionAt: now,
              lastNote: `${input.note}${res.txid ? ` · ${res.txid}` : ""}`,
              error: undefined,
              runtime: {
                ...input.intendedRuntime,
                inFlight: false,
                inFlightAt: undefined,
                dayPnl,
                dayTrades,
                consecutiveLosses,
                errorStreak: 0,
              },
            },
            input.note,
            input.side,
          );
        }),
      });
      toast.success("Ordre Kraken", { description: res.message });
      pingFill(get().settings, "Kraken", `${input.note}${res.txid ? ` · ${res.txid}` : ""}`);
      void get().syncKraken("light");
    },
});
