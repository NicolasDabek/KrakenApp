import type { Bot } from "../types";
import { DEFAULT_PAPER } from "../bots.ts";
import { toEurPair } from "../pairs.ts";
import { createJSONStorage, type PersistOptions } from "zustand/middleware";
import type { TradingState } from "./state.ts";

/** Forme sérialisée (voir partialize). */
type PersistedDesk = unknown;

/** Persistance localStorage du bureau (clé nautilus-desk). */
export const tradingPersistOptions: PersistOptions<TradingState, PersistedDesk> = {
    name: "nautilus-desk",
    version: 3,
    storage: typeof window === "undefined" ? undefined : createJSONStorage(() => localStorage),
    partialize: (s) => ({
      watchlist: s.watchlist,
      lastPair: s.lastPair,
      balances: s.balances,
      orders: s.orders,
      fills: s.fills,
      positions: s.positions,
      alerts: s.alerts,
      recurring: s.recurring,
      journal: s.journal,
      settings: s.settings,
      connection: s.connection,
      bots: s.bots.map((b) => ({
        ...b,
        log: (b.log ?? []).slice(0, 24),
        runtime: {
          ...(b.runtime.flightPrev ? b.runtime.flightPrev : b.runtime),
          inFlight: false,
          inFlightAt: undefined,
          pendingFills: undefined,
          flightPrev: undefined,
        },
      })),
      paper: {
        ...s.paper,
        trades: s.paper.trades.slice(0, 200),
        equityCurve: s.paper.equityCurve.slice(-120),
      },
      liveFills: s.liveFills.slice(0, 200),
      deskPeakPaper: s.deskPeakPaper,
      deskPeakLive: s.deskPeakLive,
    }),
    skipHydration: true,
    migrate: (persisted, from) => {
      const s = persisted as Record<string, unknown>;
      if (from < 2 && Array.isArray(s.bots)) {
        s.bots = (s.bots as Bot[]).map((b) => ({
          ...b,
          pair: toEurPair(b.pair),
          status: b.venue === "live" && b.status === "running" ? "paused" : b.status,
          runtime: { ...b.runtime, inFlight: false },
        }));
      }
      return s as typeof persisted;
    },
    onRehydrateStorage: () => (state) => {
      if (!state) return;
      if (!(state.deskPeakPaper > 0)) {
        state.deskPeakPaper = state.paper?.startingBalance ?? DEFAULT_PAPER.startingBalance;
      }
      if (!(state.deskPeakLive >= 0)) state.deskPeakLive = 0;
      state.bots = state.bots.map((b) => {
        const pair = toEurPair(b.pair);
        const pauseLive = b.venue === "live" && b.status === "running" && !state.settings.resumeLive;
        const next: Bot = {
          ...b,
          pair,
          status: pauseLive ? "paused" : b.status,
          lastNote: pauseLive ? "Pause après rechargement — relance pour trader réel." : b.lastNote,
          runtime: { ...b.runtime, inFlight: false, inFlightAt: undefined },
        };
        return next;
      });
    },
};
