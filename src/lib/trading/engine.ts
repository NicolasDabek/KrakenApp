import { useEffect } from "react";
import { fetchDepth, fetchTape, fetchTickers } from "./functions";
import { useTradingStore } from "./store";

export function useTickerEngine() {
  useEffect(() => {
    void useTradingStore.persist.rehydrate();
    let cancelled = false;

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

    void pull();
    const id = window.setInterval(() => void pull(), 2200);
    return () => {
      cancelled = true;
      window.clearInterval(id);
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
