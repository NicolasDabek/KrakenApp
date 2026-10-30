import { useEffect, useRef } from "react";
import { dropFormingCandle, kindNeedsCandles, mtfIntervalsOf } from "./bots.ts";
import { BOOK_KINDS } from "./bots/catalog.ts";
import { fetchDepth, fetchOhlc } from "./functions.ts";
import { useTradingStore } from "./store.ts";
import type { Bot } from "./types.ts";

function candleKeysForBot(bot: Pick<Bot, "kind" | "pair" | "interval" | "params">): string[] {
  if (bot.kind === "mtf") {
    return mtfIntervalsOf(bot).map((tf) => `${bot.pair}:${tf}`);
  }
  if (kindNeedsCandles(bot.kind)) {
    return [`${bot.pair}:${bot.interval}`];
  }
  return [];
}

export function useBotEngine() {
  const runningKey = useTradingStore((s) =>
    s.bots
      .filter((b) => b.status === "running")
      .map((b) => `${b.id}:${b.pair}:${b.interval}:${b.kind}:${(b.params.mtfIntervals ?? []).join("-")}`)
      .join("|"),
  );
  const fetching = useRef(false);
  const opting = useRef(false);

  useEffect(() => {
    if (!runningKey) return;
    let cancelled = false;

    const pull = async () => {
      if (fetching.current) return;
      const bots = useTradingStore.getState().bots.filter((b) => b.status === "running");
      const keys = [...new Set(bots.flatMap((b) => candleKeysForBot(b)))];
      if (keys.length === 0) return;
      fetching.current = true;
      // Carnet des paires dont un bot utilise le filtre carnet (rafraîchi à chaque cycle).
      const bookPairs = [
        ...new Set(bots.filter((b) => BOOK_KINDS.has(b.kind) && (b.params.bookFilter ?? "off") !== "off").map((b) => b.pair)),
      ];
      await Promise.all(
        bookPairs.map(async (pair) => {
          try {
            const book = await fetchDepth({ data: { pair } });
            if (!cancelled) useTradingStore.getState().setBook(pair, book);
          } catch {
            /* sans carnet frais, le filtre ne bloque rien */
          }
        }),
      );
      const bag: Record<string, Awaited<ReturnType<typeof fetchOhlc>>> = {};
      try {
        await Promise.all(
          keys.map(async (key) => {
            const [pair, interval] = key.split(":");
            if (!pair || !interval) return;
            try {
              const rows = await fetchOhlc({ data: { pair, interval: Number(interval) } });
              bag[key] = dropFormingCandle(rows, Number(interval), Date.now()) ?? rows;
            } catch {
              /* keep last candles */
            }
          }),
        );
        if (!cancelled && Object.keys(bag).length > 0) {
          useTradingStore.getState().setBotCandles(bag);
          useTradingStore.getState().runBots();
        }
      } finally {
        fetching.current = false;
      }
    };

    const maybeOpt = async () => {
      if (opting.current || cancelled) return;
      opting.current = true;
      try {
        await useTradingStore.getState().runGatedAutoOpt();
      } finally {
        opting.current = false;
      }
    };

    void pull();
    const id = window.setInterval(() => void pull(), 14_000);
    const optId = window.setInterval(() => void maybeOpt(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearInterval(optId);
    };
  }, [runningKey]);
}
