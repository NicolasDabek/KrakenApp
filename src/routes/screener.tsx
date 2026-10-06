import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Segmented } from "@/components/ui/segmented";
import { formatCompact, formatPct, formatPrice } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { rangePosition } from "@/lib/trading/stats";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/screener")({ component: ScreenerPage });

type Filter = "all" | "eur" | "breakout" | "oversold" | "volume" | "volatile";

function ScreenerPage() {
  const tickersMap = useTradingStore((s) => s.tickers);
  const tickers = Object.values(tickersMap);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"chg" | "vol" | "range">("chg");

  const rows = useMemo(() => {
    let list = [...tickers];
    if (filter === "eur") list = list.filter((t) => PAIR_BY_ID[t.id]?.quote === "EUR");
    if (filter === "breakout") list = list.filter((t) => rangePosition(t.low, t.high, t.last) >= 0.9);
    if (filter === "oversold") list = list.filter((t) => rangePosition(t.low, t.high, t.last) <= 0.1);
    if (filter === "volume") {
      const ranked = [...list].sort((a, b) => b.quoteVolume - a.quoteVolume);
      const cut = ranked[Math.floor(ranked.length * 0.25)]?.quoteVolume ?? 0;
      list = list.filter((t) => t.quoteVolume >= cut);
    }
    if (filter === "volatile") list = list.filter((t) => Math.abs(t.changePct) >= 4);
    list.sort((a, b) => {
      if (sort === "vol") return b.quoteVolume - a.quoteVolume;
      if (sort === "range") return (b.high - b.low) / b.last - (a.high - a.low) / a.last;
      return Math.abs(b.changePct) - Math.abs(a.changePct);
    });
    return list;
  }, [tickers, filter, sort]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <PageHeader title="Screener" kicker="Filtres sur le spot Kraken du jour" />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "Tous" },
          { id: "eur", label: "EUR" },
          { id: "breakout", label: "Breakout" },
          { id: "oversold", label: "Survente" },
          { id: "volume", label: "Volume" },
          { id: "volatile", label: "Volatil" },
        ]}
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setSort(sort === "chg" ? "vol" : sort === "vol" ? "range" : "chg")}
          className="h-8 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground"
        >
          {sort === "chg" ? "Variation" : sort === "vol" ? "Volume" : "Range"}
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">Aucun résultat.</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {rows.map((t) => {
            const meta = PAIR_BY_ID[t.id];
            const pos = rangePosition(t.low, t.high, t.last);
            const up = t.changePct >= 0;
            const rangePct = t.last ? ((t.high - t.low) / t.last) * 100 : 0;
            return (
              <li key={t.id}>
                <Link to="/trade/$pair" params={{ pair: t.id }} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{meta?.display ?? t.id}</p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                      Vol {formatCompact(t.quoteVolume)} · Range {rangePct.toFixed(1)}%
                    </p>
                    <div className="relative mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-border">
                      <div className="range-track absolute inset-0 opacity-70" />
                      <div
                        className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground"
                        style={{ left: `calc(${pos * 100}% - 3px)` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm tabular-nums">{formatPrice(t.last, meta?.pairDecimals ?? 2)}</p>
                    <p className={cn("font-mono text-xs tabular-nums", up ? "text-buy" : "text-sell")}>
                      {formatPct(t.changePct)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
