import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { fetchOhlc } from "@/lib/trading/functions";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { logReturns, pearson } from "@/lib/trading/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/correlation")({ component: CorrelationPage });

const UNIVERSE = ["XBTUSD", "ETHUSD", "SOLUSD", "XRPUSD", "LINKUSD", "AVAXUSD"];

function CorrelationPage() {
  const [matrix, setMatrix] = useState<number[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(UNIVERSE.map((pair) => fetchOhlc({ data: { pair, interval: 60 } })))
      .then((series) => {
        if (cancelled) return;
        const rets = series.map((candles) => logReturns(candles.map((c) => c.close)));
        const m = UNIVERSE.map((_, i) => UNIVERSE.map((__, j) => pearson(rets[i] ?? [], rets[j] ?? [])));
        setMatrix(m);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "OHLC indisponible");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <PageHeader title="Corrélation" kicker="Pearson sur rendements horaires Kraken (≈ 12 h)" />
      {error && <p className="text-sm text-sell">{error}</p>}
      {!matrix && !error && <p className="mt-12 text-center text-sm text-muted-foreground">Calcul des séries…</p>}
      {matrix && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-80 border-separate border-spacing-1 text-center text-xs">
            <thead>
              <tr>
                <th className="w-12" />
                {UNIVERSE.map((id) => (
                  <th key={id} className="pb-1 font-medium text-muted-foreground">
                    {PAIR_BY_ID[id]?.displayBase}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UNIVERSE.map((rowId, i) => (
                <tr key={rowId}>
                  <th className="pr-1 text-left font-medium text-muted-foreground">
                    {PAIR_BY_ID[rowId]?.displayBase}
                  </th>
                  {matrix[i]!.map((v, j) => (
                    <td key={`${i}-${j}`}>
                      <div
                        className={cn(
                          "grid h-11 place-items-center rounded-md font-mono tabular-nums",
                          i === j && "text-foreground",
                        )}
                        style={{
                          background:
                            v >= 0
                              ? `color-mix(in oklab, var(--color-buy) ${Math.round(v * 55)}%, var(--color-muted))`
                              : `color-mix(in oklab, var(--color-sell) ${Math.round(-v * 55)}%, var(--color-muted))`,
                        }}
                      >
                        {v.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
