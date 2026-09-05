import { useEffect, useRef } from "react";
import { kindNeedsCandles } from "./bots";
import { fetchOhlc } from "./functions";
import { useTradingStore } from "./store";

export function useBotEngine() {
  const runningKey = useTradingStore((s) =>
    s.bots
      .filter((b) => b.status === "running")
      .map((b) => `${b.id}:${b.pair}:${b.interval}:${b.kind}`)
      .join("|"),
  );
  const fetching = useRef(false);

  useEffect(() => {
    if (!runningKey) return;
    let cancelled = false;

    const pull = async () => {
      if (fetching.current) return;
      const bots = useTradingStore.getState().bots.filter((b) => b.status === "running");
      const keys = [
        ...new Set(
          bots.filter((b) => kindNeedsCandles(b.kind)).map((b) => `${b.pair}:${b.interval}`),
        ),
      ];
      if (keys.length === 0) return;
      fetching.current = true;
      const bag: Record<string, Awaited<ReturnType<typeof fetchOhlc>>> = {};
      try {
        await Promise.all(
          keys.map(async (key) => {
            const [pair, interval] = key.split(":");
            if (!pair || !interval) return;
            try {
              bag[key] = await fetchOhlc({ data: { pair, interval: Number(interval) } });
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

    void pull();
    const id = window.setInterval(() => void pull(), 14_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [runningKey]);
}
