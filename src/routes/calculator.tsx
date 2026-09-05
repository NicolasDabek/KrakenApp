import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { formatFiat, formatPct } from "@/lib/trading/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calculator")({ component: CalculatorPage });

type Mode = "pnl" | "liq" | "fees";

function CalculatorPage() {
  const [mode, setMode] = useState<Mode>("pnl");
  const [entry, setEntry] = useState("97000");
  const [exit, setExit] = useState("101000");
  const [size, setSize] = useState("0.1");
  const [leverage, setLeverage] = useState("5");
  const [side, setSide] = useState<"long" | "short">("long");
  const [notional, setNotional] = useState("10000");

  const e = Number(entry) || 0;
  const x = Number(exit) || 0;
  const q = Number(size) || 0;
  const lev = Math.max(Number(leverage) || 1, 1);
  const n = Number(notional) || 0;

  const result = useMemo(() => {
    const dir = side === "long" ? 1 : -1;
    const pnl = (x - e) * q * dir;
    const cost = e * q;
    const pct = cost ? (pnl / cost) * 100 : 0;
    const roe = cost ? (pnl / (cost / lev)) * 100 : 0;
    const mm = 0.006;
    const liq = side === "long" ? e * (1 - (1 / lev - mm)) : e * (1 + (1 / lev - mm));
    const taker = n * 0.0026;
    const maker = n * 0.0016;
    const round = n * 0.0026 * 2;
    return { pnl, pct, roe, liq, taker, maker, round };
  }, [e, x, q, lev, side, n]);

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Calculateur" kicker="PnL, liquidation et frais Kraken" />
      <div className="flex gap-1">
        {(
          [
            ["pnl", "PnL"],
            ["liq", "Liquidation"],
            ["fees", "Frais"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "h-9 flex-1 rounded-full text-xs font-medium",
              mode === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {(mode === "pnl" || mode === "liq") && (
          <>
            <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
              <button type="button" onClick={() => setSide("long")} className={cn("h-9 rounded-sm text-sm", side === "long" ? "bg-buy text-buy-foreground" : "text-muted-foreground")}>Long</button>
              <button type="button" onClick={() => setSide("short")} className={cn("h-9 rounded-sm text-sm", side === "short" ? "bg-sell text-sell-foreground" : "text-muted-foreground")}>Short</button>
            </div>
            <Num label="Entrée" value={entry} onChange={setEntry} />
            {mode === "pnl" && <Num label="Sortie" value={exit} onChange={setExit} />}
            <Num label="Quantité" value={size} onChange={setSize} />
            <Num label="Levier" value={leverage} onChange={setLeverage} />
          </>
        )}
        {mode === "fees" && <Num label="Notionnel (USD)" value={notional} onChange={setNotional} />}
      </div>

      <div className="mt-6 space-y-2 rounded-lg border border-border bg-card p-4">
        {mode === "pnl" && (
          <>
            <Stat k="PnL" v={formatFiat(result.pnl)} positive={result.pnl >= 0} />
            <Stat k="Variation" v={formatPct(result.pct)} positive={result.pct >= 0} />
            <Stat k="ROE levier" v={formatPct(result.roe)} positive={result.roe >= 0} />
          </>
        )}
        {mode === "liq" && (
          <Stat k="Prix de liquidation (MM 0,6 %)" v={result.liq.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} />
        )}
        {mode === "fees" && (
          <>
            <Stat k="Taker 0,26 %" v={formatFiat(result.taker)} />
            <Stat k="Maker 0,16 %" v={formatFiat(result.maker)} />
            <Stat k="Aller-retour taker" v={formatFiat(result.round)} />
          </>
        )}
      </div>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 text-xs text-muted-foreground">
      {label}
      <Input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" className="font-mono tabular-nums" />
    </label>
  );
}

function Stat({ k, v, positive }: { k: string; v: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("font-mono tabular-nums", positive === true && "text-buy", positive === false && "text-sell")}>{v}</span>
    </div>
  );
}
