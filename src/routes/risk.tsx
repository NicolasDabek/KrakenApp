import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { rewardRisk, sizeFromRisk } from "@/lib/trading/stats";
import { usdValue, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk")({ component: RiskPage });

function RiskPage() {
  const tickers = useTradingStore((s) => s.tickers);
  const balances = useTradingStore((s) => s.balances);
  const lastPair = useTradingStore((s) => s.lastPair);
  const meta = PAIR_BY_ID[lastPair];
  const last = tickers[lastPair]?.last ?? 0;
  const equity = balances.reduce((s, b) => s + usdValue(b.asset, b.available + b.hold, tickers), 0);

  const [capital, setCapital] = useState(() => String(Math.round(equity) || 25000));
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState(() => (last ? String(last) : "97000"));
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [lev, setLev] = useState("1");
  const [side, setSide] = useState<"long" | "short">("long");

  const sized = useMemo(() => {
    const e = Number(entry) || 0;
    const s = Number(stop) || 0;
    const cap = Number(capital) || 0;
    const rp = Number(riskPct) || 0;
    return sizeFromRisk(cap, rp, e, s);
  }, [capital, riskPct, entry, stop]);

  const rr = rewardRisk(Number(entry) || 0, Number(stop) || 0, Number(target) || 0);
  const leverage = Math.max(Number(lev) || 1, 1);
  const margin = sized.notional / leverage;
  const stopPct = Number(entry) ? (Math.abs(Number(entry) - Number(stop)) / Number(entry)) * 100 : 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader
        title="Taille de position"
        kicker={`${meta?.display ?? lastPair} · risque en % du capital`}
      />
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setSide("long")}
          className={cn("h-9 rounded-sm text-sm", side === "long" ? "bg-buy text-buy-foreground" : "text-muted-foreground")}
        >
          Long
        </button>
        <button
          type="button"
          onClick={() => setSide("short")}
          className={cn("h-9 rounded-sm text-sm", side === "short" ? "bg-sell text-sell-foreground" : "text-muted-foreground")}
        >
          Short
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <Num label="Capital (USD)" value={capital} onChange={setCapital} />
        <Num label="Risque %" value={riskPct} onChange={setRiskPct} />
        <Num label="Entrée" value={entry} onChange={setEntry} />
        <Num label="Stop" value={stop} onChange={setStop} />
        <Num label="Objectif (opt.)" value={target} onChange={setTarget} />
        <Num label="Levier" value={lev} onChange={setLev} />
      </div>
      <div className="mt-6 space-y-2 rounded-lg border border-border bg-card p-4">
        <Stat k="Quantité" v={`${formatQty(sized.qty, 6)} ${meta?.base ?? ""}`} />
        <Stat k="Notionnel" v={formatFiat(sized.notional)} />
        <Stat k="Marge" v={formatFiat(margin)} />
        <Stat k="Risque $" v={formatFiat(sized.risk)} />
        <Stat k="Distance stop" v={formatPct(stopPct)} />
        {Number(target) > 0 && <Stat k="R:R" v={rr ? `${rr.toFixed(2)} R` : "—"} positive={rr >= 1} />}
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
      <span className={cn("font-mono tabular-nums", positive === true && "text-buy", positive === false && "text-sell")}>
        {v}
      </span>
    </div>
  );
}
