import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice, formatQty } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { downloadCsv } from "@/lib/trading/stats";
import { isLiveConnected, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

type Tab = "open" | "history" | "fills" | "positions";

function OrdersPage() {
  const [tab, setTab] = useState<Tab>("open");
  const demoOrders = useTradingStore((s) => s.orders);
  const demoFills = useTradingStore((s) => s.fills);
  const demoPositions = useTradingStore((s) => s.positions);
  const krakenOrders = useTradingStore((s) => s.krakenOrders);
  const krakenFills = useTradingStore((s) => s.krakenFills);
  const krakenPositions = useTradingStore((s) => s.krakenPositions);
  const connection = useTradingStore((s) => s.connection);
  const live = isLiveConnected(connection);
  const orders = live ? krakenOrders : demoOrders;
  const fills = live ? krakenFills : demoFills;
  const positions = live ? krakenPositions : demoPositions;
  const tickers = useTradingStore((s) => s.tickers);
  const cancelOrder = useTradingStore((s) => s.cancelOrder);
  const cancelLiveOrder = useTradingStore((s) => s.cancelLiveOrder);
  const closePosition = useTradingStore((s) => s.closePosition);
  const closeLivePosition = useTradingStore((s) => s.closeLivePosition);
  const syncKraken = useTradingStore((s) => s.syncKraken);
  const [busy, setBusy] = useState(false);

  const open = orders.filter((o) => o.status === "open");
  const hist = orders.filter((o) => o.status !== "open");

  const exportFills = () => {
    downloadCsv("nautilus-fills.csv", [
      ["time", "pair", "side", "amount", "price", "fee"],
      ...fills.map((f) => [
        new Date(f.time).toISOString(),
        PAIR_BY_ID[f.pair]?.display ?? f.pair,
        f.side,
        String(f.amount),
        String(f.price),
        String(f.fee),
      ]),
    ]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Ordres</h1>
        <div className="flex gap-2">
          {live && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void syncKraken().finally(() => setBusy(false));
              }}
            >
              {busy ? "Sync…" : "Synchroniser"}
            </Button>
          )}
          {fills.length > 0 && (
            <Button size="sm" variant="outline" onClick={exportFills}>
              Export CSV
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-1 overflow-x-auto">
        {(
          [
            ["open", `Ouverts (${open.length})`],
            ["positions", `Positions (${positions.length})`],
            ["history", "Historique"],
            ["fills", "Exécutions"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
              tab === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "open" && (
        <List empty="Aucun ordre ouvert.">
          {open.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">
                  <span className={o.side === "buy" ? "text-buy" : "text-sell"}>
                    {o.side === "buy" ? "Achat" : "Vente"}
                  </span>{" "}
                  {PAIR_BY_ID[o.pair]?.display} · {o.type}
                  {o.leverage > 1 ? ` · ${o.leverage}×` : ""}
                </p>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatQty(o.amount, 6)} @ {o.price ? formatPrice(o.price, PAIR_BY_ID[o.pair]?.pairDecimals ?? 2) : "marché"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => (live ? void cancelLiveOrder(o.id) : cancelOrder(o.id))}
              >
                Annuler
              </Button>
            </li>
          ))}
        </List>
      )}

      {tab === "positions" && (
        <List empty="Aucune position margin.">
          {positions.map((p) => {
            const last = tickers[p.pair]?.last ?? p.entry;
            const pnl = (last - p.entry) * p.size * (p.side === "long" ? 1 : -1);
            return (
              <li key={p.id} className="space-y-2 border-b border-border py-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {PAIR_BY_ID[p.pair]?.display}{" "}
                    <span className={p.side === "long" ? "text-buy" : "text-sell"}>
                      {p.side === "long" ? "Long" : "Short"} {p.leverage}×
                    </span>
                  </p>
                  <span className={cn("font-mono text-sm tabular-nums", pnl >= 0 ? "text-buy" : "text-sell")}>
                    {pnl >= 0 ? "+" : ""}
                    {pnl.toFixed(2)}
                  </span>
                </div>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  Taille {formatQty(p.size, 6)} · Entrée {p.entry} · Liq. {p.liqPrice.toFixed(2)}
                  {p.trailingPct ? ` · trail ${p.trailingPct}%` : ""}
                </p>
                <Button size="sm" variant="outline" onClick={() => (live ? void closeLivePosition(p.id) : closePosition(p.id))}>
                  Clôturer
                </Button>
              </li>
            );
          })}
        </List>
      )}

      {tab === "history" && (
        <List empty="Pas encore d’historique.">
          {hist.slice(0, 40).map((o) => (
            <li key={o.id} className="py-3">
              <p className="text-sm">
                <span className={o.side === "buy" ? "text-buy" : "text-sell"}>
                  {o.side === "buy" ? "Achat" : "Vente"}
                </span>{" "}
                {PAIR_BY_ID[o.pair]?.display} · {o.status}
                {o.note ? ` · ${o.note}` : ""}
              </p>
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {formatQty(o.filled || o.amount, 6)} @ {o.avgPrice || o.price || "—"} · {formatDateTime(o.updatedAt)}
              </p>
            </li>
          ))}
        </List>
      )}

      {tab === "fills" && (
        <List empty="Aucune exécution.">
          {fills.slice(0, 50).map((f) => (
            <li key={f.id} className="flex justify-between py-3 text-sm">
              <span>
                <span className={f.side === "buy" ? "text-buy" : "text-sell"}>
                  {f.side === "buy" ? "Achat" : "Vente"}
                </span>{" "}
                {PAIR_BY_ID[f.pair]?.display}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {formatQty(f.amount, 6)} @ {f.price}
              </span>
            </li>
          ))}
        </List>
      )}

      {open.length === 0 && tab === "open" && (
        <Link to="/trade/$pair" params={{ pair: "XBTUSD" }} className="mt-4 inline-block text-sm text-accent">
          Placer un ordre
        </Link>
      )}
    </div>
  );
}

function List({ empty, children }: { empty: string; children: ReactNode }) {
  const has = Array.isArray(children) ? children.length > 0 : Boolean(children);
  if (!has) return <p className="mt-10 text-center text-sm text-muted-foreground">{empty}</p>;
  return <ul className="mt-2 divide-y divide-border">{children}</ul>;
}
