import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyStressScenario, backtestBot, BOT_KIND_BY_ID, compareStrategies, defaultParams, STRESS_SCENARIOS, type StrategyScore, type StressScenarioId } from "@/lib/trading/bots";
import { fetchOhlcHistory } from "@/lib/trading/functions";
import { formatPct } from "@/lib/trading/format";
import { EUR_PAIRS, backtestFetchInterval, toEurPair } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";
import { Field } from "./shared";

export function Lab() {
  const lastPair = useTradingStore((s) => s.lastPair);
  const feeRate = useTradingStore((s) => s.paper.feeRate);
  const [pair, setPair] = useState(() => {
    const p = toEurPair(lastPair);
    return EUR_PAIRS.some((x) => x.id === p) ? p : "XBTEUR";
  });
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<StrategyScore[] | null>(null);
  const [stressId, setStressId] = useState<StressScenarioId | null>(null);
  const [stressBusy, setStressBusy] = useState(false);
  const [stressRows, setStressRows] = useState<
    { id: StressScenarioId; label: string; pnlPct: number; sharpe: number; maxDd: number }[] | null
  >(null);

  const run = async () => {
    setBusy(true);
    try {
      const fetchInterval = backtestFetchInterval(days, 60);
      const since = Math.floor(Date.now() / 1000) - days * 86_400;
      const hist = await fetchOhlcHistory({ data: { pair, interval: fetchInterval, since, days } });
      if (hist.candles.length < 40) {
        toast.message("Historique trop court pour comparer");
        setRows([]);
        return;
      }
      const ranked = compareStrategies(hist.candles, feeRate, pair, 200, {
        startingBalance: 10_000,
        slippageBps: 5,
        interval: hist.interval,
        requestedDays: days,
      });
      setRows(ranked);
      if (!ranked.length) toast.message("Aucune stratégie n’a clôturé de trade");
    } catch {
      toast.message("Historique Kraken indisponible");
    } finally {
      setBusy(false);
    }
  };

  const runStress = async (id: StressScenarioId) => {
    setStressBusy(true);
    setStressId(id);
    try {
      const fetchInterval = backtestFetchInterval(days, 60);
      const since = Math.floor(Date.now() / 1000) - days * 86_400;
      const hist = await fetchOhlcHistory({ data: { pair, interval: fetchInterval, since, days } });
      if (hist.candles.length < 40) {
        toast.message("Historique trop court pour le stress");
        return;
      }
      const stressed = applyStressScenario(hist.candles, id);
      const kinds = ["rsi", "ema", "confirm", "mtf", "bollinger"] as const;
      const out: { id: StressScenarioId; label: string; pnlPct: number; sharpe: number; maxDd: number }[] = [];
      for (const kind of kinds) {
        const params = defaultParams(kind, stressed[stressed.length - 1]?.close ?? 100);
        const result = backtestBot(kind, params, 200, stressed, feeRate, pair, {
          startingBalance: 10_000,
          slippageBps: 5,
          interval: hist.interval,
          requestedDays: days,
        });
        if (!result) continue;
        out.push({
          id,
          label: BOT_KIND_BY_ID[kind]?.title ?? kind,
          pnlPct: result.pnlPct,
          sharpe: result.sharpe,
          maxDd: result.maxDrawdownPct,
        });
      }
      out.sort((a, b) => b.sharpe - a.sharpe);
      setStressRows(out);
      if (!out.length) toast.message("Aucun résultat sous stress");
    } catch {
      toast.message("Stress test indisponible");
    } finally {
      setStressBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Laboratoire</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Backtest les stratégies sur la même fenêtre, classées par Calmar. Scénarios de stress optionnels.
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Paire">
          <select
            value={pair}
            onChange={(e) => {
              setPair(e.target.value);
              setRows(null);
              setStressRows(null);
            }}
            className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {EUR_PAIRS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fenêtre">
          <div className="flex flex-wrap gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDays(d);
                  setRows(null);
                  setStressRows(null);
                }}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  days === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {d} j
              </button>
            ))}
          </div>
        </Field>
      </div>
      <Button type="button" variant="outline" className="mt-3 w-full" disabled={busy} onClick={() => void run()}>
        {busy ? "Comparaison…" : "Comparer les stratégies"}
      </Button>
      {rows && rows.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rows.slice(0, 8).map((row, i) => (
            <li key={row.kind} className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs">
              <span className="min-w-0 truncate">
                <span className="font-mono tabular-nums text-subtle">{i + 1}.</span> {row.title}
              </span>
              <span className={cn("shrink-0 font-mono tabular-nums", row.result.pnl >= 0 ? "text-buy" : "text-sell")}>
                {formatPct(row.result.pnlPct)} · {row.result.sharpe.toFixed(1)}σ
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs font-medium text-muted-foreground">Stress (série OHLC modifiée)</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {STRESS_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={stressBusy}
              onClick={() => void runStress(s.id)}
              className={cn(
                "h-8 rounded-full px-3 text-[11px] font-medium",
                stressId === s.id && stressRows
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {stressBusy && stressId === s.id ? "…" : s.label}
            </button>
          ))}
        </div>
        {stressRows && stressRows.length > 0 && (
          <ul className="mt-2 space-y-1">
            {stressRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs">
                <span className="truncate">{row.label}</span>
                <span className={cn("font-mono tabular-nums", row.pnlPct >= 0 ? "text-buy" : "text-sell")}>
                  {formatPct(row.pnlPct)} · DD {formatPct(row.maxDd)} · {row.sharpe.toFixed(1)}σ
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
