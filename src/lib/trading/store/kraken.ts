import { krakenBalance, krakenSnapshot } from "../functions.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Synchronisation du compte Kraken. */
export const createKrakenActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "syncKraken"> => ({
    syncKraken: async (mode = "full") => {
      const { apiKey, apiSecret } = get().connection;
      if (!apiKey || !apiSecret) {
        const message = "Clés Kraken manquantes.";
        set({ krakenError: message });
        return { ok: false, message };
      }
      const res = await krakenSnapshot({ data: { apiKey, apiSecret, mode } });
      if (!res.ok) {
        const fallback = await krakenBalance({ data: { apiKey, apiSecret } });
        // Échec total : on garde les derniers soldes connus. Les écraser par 0 faisait croire à un
        // compte vide (achats refusés « EUR insuffisant » et bots live mis en pause).
        set(balancePatchAfterFallback(fallback, Date.now()));
        get().setConnection({
          testedAt: Date.now(),
          testOk: fallback.ok,
          testMessage: fallback.message,
        });
        return { ok: fallback.ok, message: fallback.message };
      }
      const open = (res.orders ?? []).filter((o) => o.status === "open");
      const closedKept =
        mode === "light"
          ? get().krakenOrders.filter((o) => o.status !== "open")
          : (res.orders ?? []).filter((o) => o.status !== "open");
      set({
        krakenBalances: res.balances ?? {},
        krakenEur: res.eur ?? 0,
        krakenOrders: [...open, ...closedKept].slice(0, 80),
        krakenFills: mode === "light" ? get().krakenFills : (res.fills ?? []),
        krakenPositions: res.positions ?? [],
        krakenSyncAt: Date.now(),
        krakenError: null,
      });
      get().setConnection({
        testedAt: Date.now(),
        testOk: true,
        testMessage: res.message,
      });
      return { ok: true, message: res.message };
    },
});

export function balancePatchAfterFallback(
  fallback: { ok: boolean; message: string; balances: Record<string, number>; eur: number },
  now: number,
): Partial<Pick<TradingState, "krakenBalances" | "krakenEur" | "krakenSyncAt" | "krakenError">> {
  return fallback.ok
    ? { krakenBalances: fallback.balances, krakenEur: fallback.eur, krakenSyncAt: now, krakenError: null }
    : { krakenError: fallback.message };
}
