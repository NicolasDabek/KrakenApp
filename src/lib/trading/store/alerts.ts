import { uid } from "../format.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Alertes de prix, achats récurrents et journal. */
export const createAlertActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "addAlert" | "removeAlert" | "rearmAlert" | "addRecurring" | "toggleRecurring" | "removeRecurring" | "addJournal" | "removeJournal"> => ({
    addAlert: (alert) => {
      const armPrice = get().tickers[alert.pair]?.last;
      set({
        alerts: [
          { ...alert, id: uid("al"), createdAt: Date.now(), armPrice },
          ...get().alerts,
        ],
      });
    },
    removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
    rearmAlert: (id) =>
      set({
        alerts: get().alerts.map((a) =>
          a.id === id ? { ...a, triggeredAt: undefined, armPrice: get().tickers[a.pair]?.last ?? a.armPrice } : a,
        ),
      }),

    addRecurring: (item) =>
      set({ recurring: [{ ...item, id: uid("dca") }, ...get().recurring] }),
    toggleRecurring: (id) =>
      set({
        recurring: get().recurring.map((r) =>
          r.id === id ? { ...r, active: !r.active } : r,
        ),
      }),
    removeRecurring: (id) => set({ recurring: get().recurring.filter((r) => r.id !== id) }),

    addJournal: (entry) =>
      set({
        journal: [
          { ...entry, id: uid("jnl"), createdAt: Date.now() },
          ...get().journal,
        ],
      }),
    removeJournal: (id) => set({ journal: get().journal.filter((j) => j.id !== id) }),
});
