import { toast } from "sonner";
import { applyPaperFill, botInventoryQty, paperEquity, snapshotEquity } from "../bots.ts";
import { krakenCancel } from "../functions.ts";
import { PAIR_BY_ID, toEurPair } from "../pairs.ts";
import { withLog } from "./helpers.ts";
import { restoreFlight } from "./positions.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Coupe-circuits : liquidation de bot, panique, pause générale, annulation des ordres. */
export const createRiskActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "flattenBot" | "panicLive" | "pauseAllBots" | "cancelOpenOrdersOnHalt"> => ({
    flattenBot: (id) => {
      const bot = get().bots.find((b) => b.id === id);
      if (!bot) return;
      const ticker = get().tickers[bot.pair];
      const meta = PAIR_BY_ID[bot.pair];
      let qty = botInventoryQty(bot.runtime);
      if (!(qty > 0) || !ticker?.last || !meta) {
        toast.message("Pas de position à clôturer sur ce bot.");
        return;
      }
      if (bot.venue === "live") {
        const bals = get().krakenBalances;
        const have = bals[meta.base] ?? 0;
        if (Object.keys(bals).length > 0) {
          if (!(have > 0)) {
            toast.message(`Solde ${meta.base} insuffisant sur Kraken.`);
            return;
          }
          qty = Math.min(qty, have);
        }
      }
      const price = ticker.bid || ticker.last;
      if (bot.venue === "live") {
        if (bot.runtime.inFlight) {
          toast.message("Ordre déjà en cours.");
          return;
        }
        set({
          bots: get().bots.map((b) =>
            b.id === id
              ? { ...b, runtime: { ...b.runtime, inFlight: true, inFlightAt: Date.now() }, lastNote: "Clôture Kraken…" }
              : b,
          ),
        });
        void get().dispatchKrakenFill({
          botId: id,
          pair: bot.pair,
          side: "sell",
          qty,
          price,
          note: "Clôture manuelle",
          prevRuntime: bot.runtime,
          intendedRuntime: {
            ...bot.runtime,
            inPosition: false,
            positionQty: 0,
            positionAvg: 0,
            gridOwned: [],
            inFlight: false,
            pendingFills: undefined,
          },
          entryAvg: bot.runtime.positionAvg,
        });
        return;
      }
      const res = applyPaperFill(get().paper, {
        botId: id,
        pair: bot.pair,
        base: meta.base,
        side: "sell",
        qty,
        price,
        note: "Clôture manuelle",
      });
      if (!res.ok) {
        toast.message(res.message);
        return;
      }
      const stats = { ...bot.stats };
      stats.trades += 1;
      stats.closes = (stats.closes ?? 0) + 1;
      stats.feesPaid += res.trade.fee;
      stats.volume += qty * price;
      stats.realizedPnl += res.trade.pnl;
      if (res.trade.pnl > 0) stats.wins += 1;
      set({
        paper: snapshotEquity(res.paper, paperEquity(res.paper, get().tickers)),
        bots: get().bots.map((b) =>
          b.id === id
            ? withLog(
                {
                  ...b,
                  stats,
                  lastNote: "Position clôturée.",
                  lastActionAt: Date.now(),
                  runtime: {
                    ...b.runtime,
                    inPosition: false,
                    positionQty: 0,
                    positionAvg: 0,
                    gridOwned: [],
                  },
                },
                "Clôture manuelle",
                "sell",
              )
            : b,
        ),
      });
      toast.success("Position papier clôturée");
    },

    panicLive: () => {
      const live = get().bots.filter((b) => b.venue === "live");
      get().pauseAllBots("live", { silent: true });
      let closing = 0;
      for (const bot of live) {
        if (botInventoryQty(bot.runtime) > 0) {
          closing += 1;
          get().flattenBot(bot.id);
        }
      }
      toast.message(
        closing ? `Stop d’urgence · ${closing} position${closing > 1 ? "s" : ""} en clôture` : "Bots réels arrêtés",
      );
    },

    pauseAllBots: (venue, opts) => {
      const note = opts?.note ?? "Stop global.";
      set({
        bots: get().bots.map((b) =>
          b.status === "running" && (!venue || b.venue === venue)
            ? {
                ...b,
                status: "paused",
                lastNote: note,
                runtime: b.runtime.inFlight ? restoreFlight(b.runtime) : { ...b.runtime, inFlight: false },
              }
            : b,
        ),
      });
      if (!opts?.silent) {
        toast.message(opts?.note ?? (venue === "live" ? "Bots réels en pause" : "Bots en pause"));
      }
    },

    cancelOpenOrdersOnHalt: async () => {
      const settings = get().settings;
      if (settings.cancelOrdersOnHalt === false) {
        return { ok: true, message: "Annulation ordres désactivée.", cancelled: 0 };
      }
      const { apiKey, apiSecret } = get().connection;
      if (!apiKey || !apiSecret) return { ok: false, message: "Clés Kraken manquantes.", cancelled: 0 };
      const livePairs = new Set(
        get()
          .bots.filter((b) => b.venue === "live")
          .map((b) => toEurPair(b.pair)),
      );
      const open = get().krakenOrders.filter((o) => o.status === "open");
      const targets = open.filter((o) => {
        const pair = toEurPair(o.pair);
        if (livePairs.has(pair)) return true;
        const note = o.note ?? "";
        return /bot|Bot|grille|RSI|MTF|Nautilus/i.test(note);
      });
      let cancelled = 0;
      for (const order of targets) {
        const res = await krakenCancel({ data: { apiKey, apiSecret, txid: order.id } });
        if (res.ok) {
          cancelled += 1;
          set({
            krakenOrders: get().krakenOrders.map((o) =>
              o.id === order.id ? { ...o, status: "cancelled", updatedAt: Date.now() } : o,
            ),
          });
        }
      }
      if (cancelled > 0) {
        toast.message(`Stop bureau · ${cancelled} ordre${cancelled > 1 ? "s" : ""} Kraken annulé${cancelled > 1 ? "s" : ""}`);
        void get().syncKraken("light");
      }
      return {
        ok: true,
        message: cancelled ? `${cancelled} annulé(s)` : "Aucun ordre ouvert sur les paires bots",
        cancelled,
      };
    },
});
