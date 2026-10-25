import { toast } from "sonner";
import { DEFAULT_BALANCES } from "./defaults.ts";
import { cloneBalances } from "./helpers.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Réglages, connexion et remise à zéro de la démo. */
export const createSettingsActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "setSettings" | "setConnection" | "resetDemo"> => ({
    setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
    setConnection: (patch) => set({ connection: { ...get().connection, ...patch } }),
    resetDemo: () => {
      set({
        balances: cloneBalances(DEFAULT_BALANCES),
        orders: [],
        fills: [],
        positions: [],
        alerts: [],
        recurring: [],
        journal: [],
      });
      toast.message("Compte démo réinitialisé");
    },
});
