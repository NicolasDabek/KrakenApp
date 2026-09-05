import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatFiat } from "@/lib/trading/format";
import { PAIR_BY_ID, PAIR_UNIVERSE } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dca")({ component: DcaPage });

function DcaPage() {
  const lastPair = useTradingStore((s) => s.lastPair);
  const recurring = useTradingStore((s) => s.recurring);
  const addRecurring = useTradingStore((s) => s.addRecurring);
  const toggleRecurring = useTradingStore((s) => s.toggleRecurring);
  const removeRecurring = useTradingStore((s) => s.removeRecurring);
  const [pair, setPair] = useState(lastPair);
  const [amount, setAmount] = useState("50");
  const [cadence, setCadence] = useState<"daily" | "weekly">("daily");

  const usdPairs = PAIR_UNIVERSE.filter((p) => p.quote === "USD");

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Achats récurrents" kicker="DCA démo contre le dernier prix Kraken" />
      <form
        className="space-y-3 rounded-lg border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(amount);
          if (!(n > 0)) return;
          addRecurring({
            pair,
            amountQuote: n,
            cadence,
            nextAt: Date.now() + (cadence === "daily" ? 86_400_000 : 604_800_000),
            active: true,
          });
        }}
      >
        <label className="block text-xs text-muted-foreground">
          Paire
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {usdPairs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-muted-foreground">
          Montant quote
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 font-mono tabular-nums"
          />
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
          {(["daily", "weekly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={cn(
                "h-9 rounded-sm text-sm",
                cadence === c ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              {c === "daily" ? "Quotidien" : "Hebdo"}
            </button>
          ))}
        </div>
        <Button type="submit" className="w-full">
          Planifier
        </Button>
      </form>

      <ul className="mt-6 divide-y divide-border">
        {recurring.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucun plan DCA.</p>}
        {recurring.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium">
                {PAIR_BY_ID[r.pair]?.display} · {formatFiat(r.amountQuote)}
              </p>
              <p className="text-xs text-muted-foreground">
                {r.cadence === "daily" ? "Quotidien" : "Hebdomadaire"} · prochain {formatDateTime(r.nextAt)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant={r.active ? "outline" : "secondary"} onClick={() => toggleRecurring(r.id)}>
                {r.active ? "Pause" : "On"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeRecurring(r.id)}>
                Suppr.
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
