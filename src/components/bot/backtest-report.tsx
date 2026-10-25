import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { monteCarloPnl, type BacktestResult } from "@/lib/trading/bots";
import { formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { intervalLabel } from "@/lib/trading/pairs";
import { downloadCsv } from "@/lib/trading/stats";
import { cn } from "@/lib/utils";
import { Spark, Stat } from "@/components/bot/shared";

export function BacktestReport({ result, pair }: { result: BacktestResult; pair: string }) {
  const better = result.pnl >= result.buyHoldPnl;
  const mc = useMemo(
    () => monteCarloPnl(result.tradeLog.filter((t) => t.side === "sell").map((t) => t.pnl), result.startEquity),
    [result],
  );
  const exportCsv = () => {
    downloadCsv(`nautilus-backtest-${pair}.csv`, [
      ["time", "side", "price", "pnl", "note"],
      ...result.tradeLog.map((t) => [
        new Date(t.time).toISOString(),
        t.side,
        String(t.price),
        String(t.pnl),
        t.note,
      ]),
    ]);
  };
  const from = result.from ? new Date(result.from * 1000).toLocaleDateString("fr-FR") : "—";
  const to = result.to ? new Date(result.to * 1000).toLocaleDateString("fr-FR") : "—";
  const spanDays = result.from && result.to ? Math.max(1, Math.round((result.to - result.from) / 86_400)) : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {from} → {to} · {spanDays} j · {intervalLabel(result.interval)} · {result.bars} barres
          </p>
          <p className={cn("mt-1 font-mono text-lg tabular-nums", result.pnl >= 0 ? "text-buy" : "text-sell")}>
            {result.pnl >= 0 ? "+" : ""}
            {formatFiat(result.pnl, "EUR")} · {formatPct(result.pnlPct)}
          </p>
        </div>
        <Spark points={result.equityCurve.map((p) => p.v)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Trades" value={String(result.trades)} />
        <Stat label="Win rate" value={`${result.winRate.toFixed(0)} %`} />
        <Stat label="Facteur" value={result.profitFactor.toFixed(2)} />
        <Stat label="Drawdown" value={formatPct(-result.maxDrawdownPct)} tone="sell" />
        <Stat label="Frais" value={formatFiat(result.fees, "EUR")} />
        <Stat label="Calmar" value={result.calmar.toFixed(2)} />
        <Stat label="Sharpe" value={result.sharpe.toFixed(2)} />
        <Stat label="Sortino" value={result.sortino.toFixed(2)} />
        <Stat label="Hold moy." value={`${result.avgHoldMin.toFixed(0)} min`} />
      </div>
      <p className="text-xs text-muted-foreground">
        Buy & hold {formatPct(result.buyHoldPct)} ({formatFiat(result.buyHoldPnl, "EUR")}) · le bot{" "}
        <span className={better ? "text-buy" : "text-sell"}>{better ? "surperforme" : "sous-performe"}</span>
        {" · "}
        espérance {formatFiat(result.expectancy, "EUR")} / vente
        {result.openQty > 0 ? ` · position ouverte ${formatQty(result.openQty, 6)}` : ""}
      </p>
      {mc && (
        <p className="text-xs text-muted-foreground">
          Monte Carlo {mc.samples} mélanges · p5 {formatFiat(mc.p5, "EUR")} · médiane {formatFiat(mc.p50, "EUR")} · p95{" "}
          {formatFiat(mc.p95, "EUR")}
          {mc.ruinPct > 0 ? ` · ruine ${mc.ruinPct.toFixed(0)} %` : ""}
        </p>
      )}
      {result.tradeLog.slice(0, 8).length > 0 && (
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          {result.tradeLog.slice(0, 8).map((t, i) => (
            <li key={`${t.time}-${i}`} className="flex justify-between gap-2 font-mono tabular-nums">
              <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                {t.side === "buy" ? "Achat" : "Vente"} {formatQty(t.price, 2)}
              </span>
              <span className={t.pnl >= 0 ? "text-buy" : "text-sell"}>
                {t.side === "sell" ? formatFiat(t.pnl, "EUR") : t.note}
              </span>
            </li>
          ))}
        </ul>
      )}
      {result.tradeLog.length > 0 && (
        <Button type="button" size="sm" variant="ghost" className="w-full" onClick={exportCsv}>
          Export CSV des trades
        </Button>
      )}
    </div>
  );
}
