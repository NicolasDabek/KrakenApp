import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { bilanToCsv, buildBilan, type BilanPeriod } from "@/lib/trading/bilan";
import { formatFiat } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bilan")({ component: BilanPage });

const PERIODS: { id: BilanPeriod; label: string }[] = [
  { id: "today", label: "Aujourd’hui" },
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "all", label: "Tout" },
];

function downloadCsv(name: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function BilanPage() {
  const paperTrades = useTradingStore((s) => s.paper.trades);
  const liveFills = useTradingStore((s) => s.liveFills);
  const [period, setPeriod] = useState<BilanPeriod>("30d");
  const [venue, setVenue] = useState<"all" | "paper" | "live">("all");

  const report = useMemo(() => {
    const rows = [
      ...(venue === "live" ? [] : paperTrades.map((trade) => ({ ...trade, amount: trade.amount }))),
      ...(venue === "paper" ? [] : liveFills),
    ];
    return buildBilan(rows, period, Date.now());
  }, [paperTrades, liveFills, period, venue]);

  const tone = report.pnl > 0 ? "text-buy" : report.pnl < 0 ? "text-sell" : "text-foreground";

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Bilan" kicker="PnL réalisé des bots, papier et Kraken. Rien ne quitte cet appareil." />
      <Segmented value={period} onChange={setPeriod} options={PERIODS} />
      <div className="mt-3">
        <Segmented
          value={venue}
          onChange={setVenue}
          options={[
            { id: "all", label: "Tout" },
            { id: "paper", label: "Papier" },
            { id: "live", label: "Kraken" },
          ]}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="PnL réalisé" value={formatFiat(report.pnl, "EUR")} className={tone} />
        <Stat label="Frais" value={formatFiat(report.fees, "EUR")} />
        <Stat label="Volume" value={formatFiat(report.volume, "EUR")} />
        <Stat
          label="Ventes gagnantes"
          value={report.sells ? `${report.wins}/${report.sells}` : "—"}
          hint={report.sells ? `${report.winRate.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} %` : "Aucune vente"}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {report.trades} ordre{report.trades > 1 ? "s" : ""} · {report.buys} achat{report.buys > 1 ? "s" : ""} · {report.sells} vente
          {report.sells > 1 ? "s" : ""}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={report.rows.length === 0}
          onClick={() => downloadCsv(`nautilus-bilan-${period}.csv`, bilanToCsv(report))}
        >
          Exporter CSV
        </Button>
      </div>

      {report.rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Aucun ordre sur cette période.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
          {report.rows.map((row) => (
            <li key={row.pair} className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{PAIR_BY_ID[row.pair]?.display ?? row.pair}</p>
                <p className="text-xs text-muted-foreground">
                  {row.buys} achat{row.buys > 1 ? "s" : ""} · {row.sells} vente{row.sells > 1 ? "s" : ""} · frais {formatFiat(row.fees, "EUR")}
                </p>
              </div>
              <p className={cn("font-mono text-sm tabular-nums", row.pnl > 0 ? "text-buy" : row.pnl < 0 ? "text-sell" : "text-foreground")}>
                {formatFiat(row.pnl, "EUR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, hint, className }: { label: string; value: string; hint?: string; className?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-sm tabular-nums", className)}>{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
