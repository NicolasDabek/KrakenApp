import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Flux de marché : tickers, carnets, tape, paire courante, watchlist. */
export const createMarketActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "hydrateTickers" | "setBook" | "setTape" | "setLive" | "setLastPair" | "toggleWatch"> => ({
    hydrateTickers: (list) => {
      const tickers = { ...get().tickers };
      for (const t of list) tickers[t.id] = t;
      set({ tickers, lastTickAt: Date.now(), live: true, error: null });
      get().processTick();
      get().runBots();
    },

    setBook: (pair, book) => set({ books: { ...get().books, [pair]: book } }),
    setTape: (pair, trades) => set({ tapes: { ...get().tapes, [pair]: trades } }),
    setLive: (live, error = null) => set({ live, error }),
    setLastPair: (pair) => set({ lastPair: pair }),

    toggleWatch: (pair) => {
      const watchlist = get().watchlist.includes(pair)
        ? get().watchlist.filter((p) => p !== pair)
        : [pair, ...get().watchlist];
      set({ watchlist });
    },
});
