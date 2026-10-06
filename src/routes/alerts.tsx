import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatPct, formatPrice, parseDecimal } from "@/lib/trading/format";
import { PAIR_BY_ID, PAIR_UNIVERSE } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

function AlertsPage() {
  const alerts = useTradingStore((s) => s.alerts);
  const addAlert = useTradingStore((s) => s.addAlert);
  const removeAlert = useTradingStore((s) => s.removeAlert);
  const rearmAlert = useTradingStore((s) => s.rearmAlert);
  const lastPair = useTradingStore((s) => s.lastPair);
  const tickers = useTradingStore((s) => s.tickers);
  const [pair, setPair] = useState(lastPair);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const last = tickers[pair]?.last ?? 0;
  const meta = PAIR_BY_ID[pair];

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Alertes" kicker="Notification locale dès que le dernier prix Kraken croise le seuil" />

      <form
        className="space-y-3 rounded-lg border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseDecimal(price);
          if (!(n && n > 0)) return;
          addAlert({ pair, condition, price: n, note });
          setPrice("");
          setNote("");
        }}
      >
        <label className="block text-xs text-muted-foreground">
          Paire
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {PAIR_UNIVERSE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
          <button
            type="button"
            onClick={() => setCondition("above")}
            className={cn("h-9 rounded-sm text-sm", condition === "above" ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            Au-dessus
          </button>
          <button
            type="button"
            onClick={() => setCondition("below")}
            className={cn("h-9 rounded-sm text-sm", condition === "below" ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            En-dessous
          </button>
        </div>
        <Input
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={`Dernier ${formatPrice(last, meta?.pairDecimals ?? 2)}`}
          className="font-mono tabular-nums"
        />
        {last > 0 && (
          <div className="flex flex-wrap gap-1">
            {[-5, -2, -1, 1, 2, 5].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setCondition(pct > 0 ? "above" : "below");
                  setPrice((last * (1 + pct / 100)).toFixed(meta?.pairDecimals ?? 2));
                }}
                className="h-9 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground"
              >
                {pct > 0 ? "+" : ""}
                {pct} %
              </button>
            ))}
          </div>
        )}
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optionnel)" />
        <Button type="submit" className="w-full">
          Créer l’alerte
        </Button>
      </form>

      <ul className="mt-6 divide-y divide-border">
        {alerts.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucune alerte.</p>}
        {alerts.map((a) => {
          const t = tickers[a.pair];
          const dist = t?.last && a.price ? ((a.price - t.last) / t.last) * 100 : 0;
          return (
          <li key={a.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">
                {PAIR_BY_ID[a.pair]?.display} {a.condition === "above" ? "≥" : "≤"} {a.price}
              </p>
              <p className="text-xs text-muted-foreground">
                {a.triggeredAt ? `Déclenchée ${formatDateTime(a.triggeredAt)}` : `Créée ${formatDateTime(a.createdAt)}`}
                {t ? ` · ${formatPct(dist)} du dernier` : ""}
                {a.note ? ` · ${a.note}` : ""}
              </p>
            </div>
            <div className="flex gap-1">
              {a.triggeredAt && (
                <Button size="sm" variant="outline" onClick={() => rearmAlert(a.id)}>
                  Réarmer
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => removeAlert(a.id)}>
                Suppr.
              </Button>
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
