import { Link } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCompact, formatPct, formatPrice } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { biasTone, marketSignal } from "@/lib/trading/signals";
import { useTradingStore } from "@/lib/trading/store";
import type { Ticker } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "fav" | "usd" | "eur" | "up" | "down" | "buy" | "sell" | "wait";

export function MarketList({
  compact = false,
  embedded = false,
  seed = [],
}: {
  compact?: boolean;
  embedded?: boolean;
  seed?: Ticker[];
}) {
  const live = useTradingStore((s) => s.tickers);
  const tickers = Object.keys(live).length
    ? live
    : Object.fromEntries(seed.map((t) => [t.id, t]));
  const watchlist = useTradingStore((s) => s.watchlist);
  const toggleWatch = useTradingStore((s) => s.toggleWatch);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"vol" | "chg" | "name" | "signal">("vol");

  const rows = useMemo(() => {
    let list = Object.values(tickers);
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((t) => {
        const meta = PAIR_BY_ID[t.id];
        return (
          t.id.toLowerCase().includes(query) ||
          meta?.display.toLowerCase().includes(query) ||
          meta?.base.toLowerCase().includes(query)
        );
      });
    }
    if (filter === "fav") list = list.filter((t) => watchlist.includes(t.id));
    if (filter === "usd") list = list.filter((t) => PAIR_BY_ID[t.id]?.quote === "USD");
    if (filter === "eur") list = list.filter((t) => PAIR_BY_ID[t.id]?.quote === "EUR");
    if (filter === "up") list = list.filter((t) => t.changePct > 0);
    if (filter === "down") list = list.filter((t) => t.changePct < 0);
    if (filter === "buy" || filter === "sell" || filter === "wait") {
      list = list.filter((t) => marketSignal(t).bias === filter);
    }
    list = [...list].sort((a, b) => {
      if (sort === "chg") return Math.abs(b.changePct) - Math.abs(a.changePct);
      if (sort === "name") return (PAIR_BY_ID[a.id]?.display ?? "").localeCompare(PAIR_BY_ID[b.id]?.display ?? "");
      if (sort === "signal") return Math.abs(marketSignal(b).score) - Math.abs(marketSignal(a).score);
      return b.quoteVolume - a.quoteVolume;
    });
    return list;
  }, [tickers, q, filter, sort, watchlist]);

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "fav", label: "Favoris" },
    { id: "eur", label: "EUR" },
    { id: "usd", label: "USD" },
    { id: "buy", label: "Acheter" },
    { id: "sell", label: "Vendre" },
    { id: "up", label: "Hausse" },
    { id: "down", label: "Baisse" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("sticky top-0 z-10 space-y-3 bg-background", compact ? "pb-3" : "px-4 pb-3 pt-4")}>
        {!compact && !embedded && (
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Marchés</h1>
            <p className="text-sm text-muted-foreground">Prix spot Kraken en direct</p>
          </div>
        )}
        {embedded && <h2 className="text-sm font-medium">Tous les marchés</h2>}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher BTC, SOL, EUR…"
            className="pl-9"
            aria-label="Rechercher une paire"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors duration-150",
                filter === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSort(sort === "vol" ? "chg" : sort === "chg" ? "signal" : sort === "signal" ? "name" : "vol")}
            className="ml-auto h-8 shrink-0 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground"
          >
            {sort === "vol" ? "Volume" : sort === "chg" ? "Variation" : sort === "signal" ? "Signal" : "Nom"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {Object.keys(tickers).length === 0 ? "Chargement des marchés Kraken…" : "Aucun marché ne correspond."}
          </p>
        ) : (
          <ul className="divide-y divide-border lg:grid lg:grid-cols-2 lg:divide-y-0">
            {rows.map((t) => (
              <MarketRow
                key={t.id}
                ticker={t}
                fav={watchlist.includes(t.id)}
                onFav={() => toggleWatch(t.id)}
                compact={compact}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MarketRow({
  ticker,
  fav,
  onFav,
  compact,
}: {
  ticker: Ticker;
  fav: boolean;
  onFav: () => void;
  compact: boolean;
}) {
  const meta = PAIR_BY_ID[ticker.id];
  const up = ticker.changePct >= 0;
  const sig = marketSignal(ticker);
  const quote = meta?.quote === "EUR" ? "EUR" : "USD";
  return (
    <li className="border-b border-border">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={onFav}
          className="grid size-11 place-items-center text-subtle"
        >
          <Star className={cn("size-4", fav && "fill-warning text-warning")} />
        </button>
        <Link
          to="/trade/$pair"
          params={{ pair: ticker.id }}
          className="flex min-w-0 flex-1 items-center justify-between py-3 pr-4"
        >
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{meta?.display ?? ticker.id}</span>
              {!compact && (
                <span className="text-xs text-subtle">{formatCompact(ticker.quoteVolume)}</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <RangeBar low={ticker.low} high={ticker.high} last={ticker.last} />
              {!compact && <Badge tone={biasTone(sig.bias)}>{sig.label}</Badge>}
            </div>
            {!compact && (
              <p className="mt-1 text-xs text-subtle">
                VWAP {sig.vsVwapPct >= 0 ? "+" : ""}
                {sig.vsVwapPct.toFixed(2)}% · range {(sig.rangePos * 100).toFixed(0)}%
                {sig.spreadPct > 0 ? ` · spr. ${sig.spreadPct.toFixed(2)}%` : ""}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="font-mono text-sm tabular-nums">
              {formatPrice(ticker.last, meta?.pairDecimals ?? 2)}
              <span className="ml-1 text-xs text-subtle">{quote}</span>
            </div>
            <div className={cn("font-mono text-xs tabular-nums", up ? "text-buy" : "text-sell")}>
              {formatPct(ticker.changePct)}
            </div>
            {compact && (
              <p className={cn("text-xs", sig.bias === "buy" ? "text-buy" : sig.bias === "sell" ? "text-sell" : "text-subtle")}>
                {sig.label}
              </p>
            )}
          </div>
        </Link>
      </div>
    </li>
  );
}

function RangeBar({ low, high, last }: { low: number; high: number; last: number }) {
  const t = high === low ? 0.5 : Math.min(1, Math.max(0, (last - low) / (high - low)));
  return (
    <div className="relative mt-0.5 h-1 w-24 overflow-hidden rounded-full bg-border">
      <div className="range-track absolute inset-0 opacity-70" />
      <div
        className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground"
        style={{ left: `calc(${t * 100}% - 3px)` }}
      />
    </div>
  );
}
