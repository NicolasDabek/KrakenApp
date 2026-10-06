import { useEffect } from "react";
import { fetchDepth, fetchTape, fetchTickers } from "./functions.ts";
import { isLiveConnected, useTradingStore } from "./store.ts";

export function useTickerEngine() {
  useEffect(() => {
    void useTradingStore.persist.rehydrate();
    let cancelled = false;
    let ticks = 0;

    const pull = async () => {
      try {
        const list = await fetchTickers();
        if (!cancelled) useTradingStore.getState().hydrateTickers(list);
      } catch (err) {
        if (!cancelled) {
          const has = Object.keys(useTradingStore.getState().tickers).length > 0;
          if (!has) {
            useTradingStore
              .getState()
              .setLive(false, err instanceof Error ? err.message : "Flux marché indisponible");
          }
        }
      }
    };

    const syncAccount = async () => {
      const conn = useTradingStore.getState().connection;
      if (!isLiveConnected(conn)) return;
      ticks += 1;
      try {
        await useTradingStore.getState().syncKraken(ticks % 4 === 1 ? "full" : "light");
      } catch {
        /* keep last snapshot */
      }
    };

    void pull();
    void syncAccount();
    const id = window.setInterval(() => void pull(), 2200);
    const acc = window.setInterval(() => void syncAccount(), 22_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearInterval(acc);
    };
  }, []);
}

export function useBookEngine(pair: string | undefined, enabled: boolean) {
  useEffect(() => {
    if (!pair || !enabled) return;
    let cancelled = false;
    const pull = async () => {
      try {
        const [book, tape] = await Promise.all([
          fetchDepth({ data: { pair } }),
          fetchTape({ data: { pair } }),
        ]);
        if (cancelled) return;
        useTradingStore.getState().setBook(pair, book);
        useTradingStore.getState().setTape(pair, tape);
      } catch {
        /* keep last book */
      }
    };
    void pull();
    const id = window.setInterval(() => void pull(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pair, enabled]);
}
