import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { formatPct } from "@/lib/trading/format";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/heatmap")({ component: HeatmapPage });

function HeatmapPage() {
  const tickersMap = useTradingStore((s) => s.tickers);
  const tickers = Object.values(tickersMap);
  const ranked = [...tickers].sort((a, b) => b.quoteVolume - a.quoteVolume);
  const maxVol = ranked[0]?.quoteVolume || 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <PageHeader title="Heatmap" kicker="Surface ≈ volume 24h · couleur = variation du jour Kraken" />
      {ranked.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">Chargement des marchés…</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {ranked.map((t) => {
            const pct = t.changePct;
            const intensity = Math.min(Math.abs(pct) / 8, 1);
            const up = pct >= 0;
            const meta = PAIR_BY_ID[t.id];
            const span = t.quoteVolume / maxVol > 0.45 ? "col-span-2 row-span-2 min-h-36" : "min-h-24";
            return (
              <Link
                key={t.id}
                to="/trade/$pair"
                params={{ pair: t.id }}
                className={cn("flex flex-col justify-between rounded-lg p-3 transition-transform duration-150 active:scale-[0.96]", span)}
                style={{
                  background: up
                    ? `color-mix(in oklab, var(--color-buy) ${18 + intensity * 42}%, var(--color-card))`
                    : `color-mix(in oklab, var(--color-sell) ${18 + intensity * 42}%, var(--color-card))`,
                }}
              >
                <span className="text-sm font-medium">{meta?.display ?? t.id}</span>
                <span>
                  <span className="block font-mono text-lg tabular-nums">{t.last.toLocaleString("fr-FR")}</span>
                  <span className={cn("font-mono text-sm tabular-nums", up ? "text-buy" : "text-sell")}>
                    {formatPct(pct)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
