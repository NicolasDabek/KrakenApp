import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MarketList } from "@/components/markets/market-list";
import { CandleChart } from "@/components/trade/candle-chart";
import { DepthChart } from "@/components/trade/depth-chart";
import { OrderBook } from "@/components/trade/order-book";
import { TradeForm } from "@/components/trade/trade-form";
import { TradesTape } from "@/components/trade/trades-tape";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBookEngine } from "@/lib/trading/engine";
import { formatPct, formatPrice } from "@/lib/trading/format";
import { DEFAULT_PAIR, PAIR_BY_ID } from "@/lib/trading/pairs";
import { biasTone, marketSignal } from "@/lib/trading/signals";
import { useTradingStore } from "@/lib/trading/store";
import type { OrderSide } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trade/$pair")({
  component: TradePage,
});

type Panel = "order" | "book" | "tape" | "depth";

function TradePage() {
  const { pair } = Route.useParams();
  const meta = PAIR_BY_ID[pair] ?? PAIR_BY_ID[DEFAULT_PAIR];
  const ticker = useTradingStore((s) => s.tickers[pair]);
  const watchlist = useTradingStore((s) => s.watchlist);
  const toggleWatch = useTradingStore((s) => s.toggleWatch);
  const [panel, setPanel] = useState<Panel>("book");
  const [picker, setPicker] = useState(false);
  const [ticket, setTicket] = useState<OrderSide | null>(null);
  const [seed, setSeed] = useState<number | undefined>();

  useBookEngine(pair, true);
  useEffect(() => {
    if (useTradingStore.getState().lastPair !== pair) {
      useTradingStore.getState().setLastPair(pair);
    }
  }, [pair]);

  if (!PAIR_BY_ID[pair]) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Paire inconnue.</p>
        <Link to="/trade/$pair" params={{ pair: DEFAULT_PAIR }} className="mt-3 inline-block text-accent">
          Ouvrir BTC/USD
        </Link>
      </div>
    );
  }

  const up = (ticker?.changePct ?? 0) >= 0;
  const fav = watchlist.includes(pair);
  const sig = marketSignal(ticker);

  return (
    <div className="lg:grid lg:h-[calc(100dvh)] lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => setPicker(true)} className="text-left">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-semibold tracking-tight">{meta?.display}</h1>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-xl tabular-nums">
                {formatPrice(ticker?.last ?? 0, meta?.pairDecimals ?? 2)}
              </span>
              <span className={cn("font-mono text-sm tabular-nums", up ? "text-buy" : "text-sell")}>
                {formatPct(ticker?.changePct ?? 0)}
              </span>
            </div>
          </button>
          <button
            type="button"
            aria-label="Favori"
            onClick={() => toggleWatch(pair)}
            className="grid size-11 place-items-center"
          >
            <Star className={cn("size-5", fav && "fill-warning text-warning")} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-4 pb-2 text-xs text-muted-foreground">
          <span>
            H <span className="font-mono tabular-nums text-foreground">{formatPrice(ticker?.high ?? 0, meta?.pairDecimals ?? 2)}</span>
          </span>
          <span>
            B <span className="font-mono tabular-nums text-foreground">{formatPrice(ticker?.low ?? 0, meta?.pairDecimals ?? 2)}</span>
          </span>
          <span>
            Vol <span className="font-mono tabular-nums text-foreground">{ticker ? Math.round(ticker.volume).toLocaleString("fr-FR") : "—"}</span>
          </span>
          {ticker && (
            <>
              <span>
                VWAP{" "}
                <span className="font-mono tabular-nums text-foreground">
                  {formatPrice(ticker.vwap, meta?.pairDecimals ?? 2)}
                </span>
              </span>
              <Badge tone={biasTone(sig.bias)}>{sig.label}</Badge>
              {sig.reasons[0] && <span className="text-subtle">{sig.reasons[0]}</span>}
            </>
          )}
        </div>

        <CandleChart pair={pair} />

        <div className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
          {(
            [
              ["book", "Carnet"],
              ["tape", "Trades"],
              ["depth", "Profondeur"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium",
                panel === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pb-20 lg:hidden">
          {panel === "book" && <OrderBook pair={pair} onPrice={setSeed} />}
          {panel === "tape" && <TradesTape pair={pair} />}
          {panel === "depth" && (
            <div className="p-3">
              <DepthChart pair={pair} />
            </div>
          )}
        </div>

        <div className="mt-4 hidden gap-4 px-4 pb-6 lg:grid lg:grid-cols-2">
          <div className="rounded-lg border border-border">
            <p className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Carnet
            </p>
            <OrderBook pair={pair} onPrice={setSeed} />
          </div>
          <div className="rounded-lg border border-border">
            <p className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dernières transactions
            </p>
            <TradesTape pair={pair} />
            <div className="border-t border-border p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Profondeur</p>
              <DepthChart pair={pair} />
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden border-l border-border lg:block">
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-sm font-medium">Ticket</p>
          <Badge tone="warn">Démo</Badge>
        </div>
        <TradeForm pair={pair} seedPrice={seed} />
      </aside>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 grid grid-cols-2 gap-2 bg-background/95 px-4 py-2 backdrop-blur-sm lg:hidden">
        <Button variant="buy" onClick={() => setTicket("buy")}>
          Acheter
        </Button>
        <Button variant="sell" onClick={() => setTicket("sell")}>
          Vendre
        </Button>
      </div>

      {ticket && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-background/70" onClick={() => setTicket(null)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-xl border-t border-border bg-card">
            <div className="flex items-center justify-between px-4 pt-3">
              <p className="text-sm font-medium">
                {ticket === "buy" ? "Acheter" : "Vendre"} {meta?.display}
              </p>
              <button type="button" className="grid size-11 place-items-center" onClick={() => setTicket(null)}>
                <X className="size-4" />
              </button>
            </div>
            <TradeForm pair={pair} forcedSide={ticket} seedPrice={seed} />
          </div>
        </div>
      )}

      {picker && (
        <div className="fixed inset-0 z-40 bg-background">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-medium">Choisir une paire</p>
            <button type="button" className="grid size-11 place-items-center" onClick={() => setPicker(false)}>
              <X className="size-4" />
            </button>
          </div>
          <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto" onClick={() => setPicker(false)}>
            <MarketList compact />
          </div>
        </div>
      )}
    </div>
  );
}
