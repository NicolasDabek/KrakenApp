import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { eurValue, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";
import { ConfirmBar, Field, Spark, Stat } from "@/components/bot/shared";

export function PaperPanel() {
  const paper = useTradingStore((s) => s.paper);
  const tickers = useTradingStore((s) => s.tickers);
  const setPaperStart = useTradingStore((s) => s.setPaperStart);
  const setPaperFee = useTradingStore((s) => s.setPaperFee);
  const resetPaper = useTradingStore((s) => s.resetPaper);
  const flattenPaperPositions = useTradingStore((s) => s.flattenPaperPositions);
  const [start, setStart] = useState(String(paper.startingBalance));
  const [feePct, setFeePct] = useState((paper.feeRate * 100).toFixed(2));
  const [confirmReset, setConfirmReset] = useState(false);
  const holdings = Object.entries(paper.holdings ?? {}).filter(([, h]) => h.qty > 0);
  const marked = holdings.reduce((s, [asset, h]) => s + eurValue(asset, h.qty, tickers), 0);
  const equity = paper.cash + marked;
  const pnl = equity - paper.startingBalance;
  const pnlPct = paper.startingBalance ? (pnl / paper.startingBalance) * 100 : 0;

  useEffect(() => {
    setStart(String(paper.startingBalance));
    setFeePct((paper.feeRate * 100).toFixed(2));
  }, [paper.startingBalance, paper.feeRate]);

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Équité simulation (EUR)</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">
            {formatFiat(equity, "EUR")}
          </p>
          <p className={cn("mt-1 font-mono text-sm tabular-nums", pnl >= 0 ? "text-buy" : "text-sell")}>
            {pnl >= 0 ? "+" : ""}
            {formatFiat(pnl, "EUR")} · {formatPct(pnlPct)}
          </p>
        </div>
        <Spark points={paper.equityCurve.map((p) => p.v)} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Cash" value={formatFiat(paper.cash, "EUR")} />
        <Stat label="Frais payés" value={formatFiat(paper.feesPaid, "EUR")} />
        <Stat
          label="Réalisé"
          value={formatFiat(paper.realizedPnl, "EUR")}
          tone={paper.realizedPnl >= 0 ? "buy" : "sell"}
        />
      </div>

      {holdings.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
          {holdings.map(([asset, h]) => (
            <li key={asset} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {asset} · {formatQty(h.qty, 6)} @ {formatFiat(h.avg, "EUR")}
              </span>
              <span className="font-mono tabular-nums">{formatFiat(eurValue(asset, h.qty, tickers), "EUR")}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Field label="Solde de départ (EUR)">
          <Input
            aria-label="Solde de départ (EUR)"
            inputMode="decimal"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="font-mono tabular-nums"
          />
        </Field>
        <Field label="Frais taker (%)">
          <Input
            aria-label="Frais taker (%)"
            inputMode="decimal"
            value={feePct}
            onChange={(e) => setFeePct(e.target.value)}
            className="font-mono tabular-nums"
          />
        </Field>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-subtle">
        Chaque ordre marché prélève ce taux à l’achat et à la vente. Round-trip ≈{" "}
        {(Number(feePct) * 2 || 0).toFixed(2)} %. Paires EUR uniquement.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const n = Number(start);
            const f = Number(feePct) / 100;
            if (Number.isFinite(f)) setPaperFee(f);
            if (n !== paper.startingBalance) setPaperStart(n);
          }}
        >
          Appliquer
        </Button>
        <Button variant="secondary" onClick={flattenPaperPositions}>
          Tout vendre
        </Button>
      </div>
      <Button variant="ghost" className="mt-1 w-full" onClick={() => useTradingStore.getState().pauseAllBots("paper")}>
        Pause des bots papier
      </Button>
      {confirmReset ? (
        <ConfirmBar
          prompt="Efface cash, lots et stats des bots papier."
          confirmLabel="Réinitialiser"
          onConfirm={() => {
            resetPaper();
            setConfirmReset(false);
          }}
          onCancel={() => setConfirmReset(false)}
        />
      ) : (
        <Button variant="ghost" className="mt-1 w-full" onClick={() => setConfirmReset(true)}>
          Réinitialiser la simulation
        </Button>
      )}
    </div>
  );
}
