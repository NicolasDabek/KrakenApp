import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCompact, formatFiat, formatPct, formatPrice } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { assetBoard, biasTone, marketSignal } from "@/lib/trading/signals";
import { usdValue, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export function MarketOverview() {
  const tickers = useTradingStore((s) => s.tickers);
  const balances = useTradingStore((s) => s.balances);
  const watchlist = useTradingStore((s) => s.watchlist);
  const quote = useTradingStore((s) => s.settings.displayQuote);
  const lastPair = useTradingStore((s) => s.lastPair);

  const list = useMemo(() => Object.values(tickers), [tickers]);
  const assets = useMemo(() => assetBoard(tickers), [tickers]);
  const up = list.filter((t) => t.changePct > 0).length;
  const down = list.filter((t) => t.changePct < 0).length;
  const movers = useMemo(
    () => [...list].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 8),
    [list],
  );

  const totalUsd = balances.reduce((sum, b) => sum + usdValue(b.asset, b.available + b.hold, tickers), 0);
  const fx = usdValue("EUR", 1, tickers) || 1.08;
  const shown = quote === "EUR" ? totalUsd / fx : totalUsd;
  const dayPnl = list.length
    ? balances.reduce((sum, b) => {
        const t = list.find((x) => PAIR_BY_ID[x.id]?.base === b.asset && PAIR_BY_ID[x.id]?.quote === "USD");
        const usd = usdValue(b.asset, b.available + b.hold, tickers);
        return sum + usd * ((t?.changePct ?? 0) / 100);
      }, 0)
    : 0;

  const watched = watchlist
    .map((id) => tickers[id])
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const buys = assets.filter((a) => a.signal.bias === "buy").length;
  const sells = assets.filter((a) => a.signal.bias === "sell").length;

  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Bureau Kraken</p>
          <p className="mt-1 font-mono text-3xl font-medium tabular-nums tracking-tight">
            {formatFiat(shown, quote)}
          </p>
          <p className={cn("mt-1 font-mono text-sm tabular-nums", dayPnl >= 0 ? "text-buy" : "text-sell")}>
            {formatFiat(dayPnl)} / 24h
          </p>
        </div>
        <Link
          to="/trade/$pair"
          params={{ pair: lastPair }}
          className="h-11 rounded-md bg-foreground px-4 text-sm font-medium leading-[2.75rem] text-background"
        >
          Trader
        </Link>
      </div>

      {list.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Largeur du marché</span>
            <span>
              {up} haussier · {down} baissier
              {assets.length > 0 ? ` · ${buys} à acheter · ${sells} à vendre` : ""}
            </span>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-buy" style={{ width: `${list.length ? (up / list.length) * 100 : 50}%` }} />
            <div className="h-full bg-sell" style={{ width: `${list.length ? (down / list.length) * 100 : 50}%` }} />
          </div>
        </div>
      )}

      {watched.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 font-mono text-xs tabular-nums">
          {watched.map((t) => {
            const meta = PAIR_BY_ID[t.id];
            const positive = t.changePct >= 0;
            const sig = marketSignal(t);
            return (
              <Link
                key={t.id}
                to="/trade/$pair"
                params={{ pair: t.id }}
                className="shrink-0 rounded-md bg-muted px-3 py-2"
              >
                <span className="text-muted-foreground">{meta?.displayBase ?? t.id}</span>
                <span className="ml-2 text-foreground">{formatPrice(t.last, meta?.pairDecimals ?? 2)}</span>
                <span className={cn("ml-2", positive ? "text-buy" : "text-sell")}>{formatPct(t.changePct)}</span>
                <span className={cn("ml-2", sig.bias === "buy" ? "text-buy" : sig.bias === "sell" ? "text-sell" : "text-subtle")}>
                  {sig.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {assets.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Valeur des devises
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {assets.map((a) => (
              <li key={a.base}>
                <Link
                  to="/trade/$pair"
                  params={{ pair: a.pairId }}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{a.base}</span>
                      <Badge tone={biasTone(a.signal.bias)}>{a.signal.label}</Badge>
                    </div>
                    <p className="mt-1.5 font-mono text-sm tabular-nums tracking-tight">
                      {formatFiat(a.lastEur, "EUR")}
                    </p>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatFiat(a.lastUsd, "USD")}
                    </p>
                    {a.signal.reasons[0] && (
                      <p className="mt-1 text-xs text-subtle">{a.signal.reasons[0]}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("font-mono text-sm tabular-nums", a.changePct >= 0 ? "text-buy" : "text-sell")}>
                      {formatPct(a.changePct)}
                    </p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-subtle">
                      VWAP {a.signal.vsVwapPct >= 0 ? "+" : ""}
                      {a.signal.vsVwapPct.toFixed(2)}%
                    </p>
                    <p className="mt-0.5 text-xs text-subtle">Vol {formatCompact(a.quoteVolume)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {movers.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Moteurs 24h</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {movers.map((t) => {
              const meta = PAIR_BY_ID[t.id];
              const positive = t.changePct >= 0;
              const sig = marketSignal(t);
              return (
                <Link
                  key={t.id}
                  to="/trade/$pair"
                  params={{ pair: t.id }}
                  className="flex min-w-32 shrink-0 flex-col justify-between rounded-lg bg-card p-3"
                  style={{
                    background: positive
                      ? "color-mix(in oklab, var(--color-buy) 16%, var(--color-card))"
                      : "color-mix(in oklab, var(--color-sell) 16%, var(--color-card))",
                  }}
                >
                  <span className="text-sm font-medium">{meta?.display ?? t.id}</span>
                  <span className={cn("mt-2 font-mono text-sm tabular-nums", positive ? "text-buy" : "text-sell")}>
                    {formatPct(t.changePct)}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">{sig.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
