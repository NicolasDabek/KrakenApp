import { Button } from "@/components/ui/button";
import { formatDateTime, formatFiat } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { downloadCsv } from "@/lib/trading/stats";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export function LiveJournal() {
  const fills = useTradingStore((s) => s.liveFills);
  if (fills.length === 0) return null;
  const exportCsv = () => {
    downloadCsv("nautilus-bots-live-eur.csv", [
      ["time", "pair", "side", "amount", "price", "fee", "pnl", "txid", "note"],
      ...fills.map((t) => [
        new Date(t.time).toISOString(),
        PAIR_BY_ID[t.pair]?.display ?? t.pair,
        t.side,
        String(t.amount),
        String(t.price),
        String(t.fee),
        String(t.pnl),
        t.txid ?? "",
        t.note,
      ]),
    ]);
  };
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Journal réel Kraken</h2>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
        {fills.slice(0, 24).map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                  {t.side === "buy" ? "Achat" : "Vente"}
                </span>{" "}
                {PAIR_BY_ID[t.pair]?.display ?? t.pair}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.note} · frais {formatFiat(t.fee, "EUR")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatDateTime(t.time)}</p>
              {t.side === "sell" && (
                <p className={cn("font-mono text-xs tabular-nums", t.pnl >= 0 ? "text-buy" : "text-sell")}>
                  {t.pnl >= 0 ? "+" : ""}
                  {formatFiat(t.pnl, "EUR")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
