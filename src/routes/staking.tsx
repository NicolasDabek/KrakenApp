import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { formatFiat, formatQty } from "@/lib/trading/format";
import { usdValue, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/staking")({ component: StakingPage });

const APR: { asset: string; rate: number; note: string }[] = [
  { asset: "ETH", rate: 0.035, note: "On-chain / bonded" },
  { asset: "SOL", rate: 0.065, note: "Délégation" },
  { asset: "DOT", rate: 0.14, note: "Nominators" },
  { asset: "ADA", rate: 0.03, note: "Délégation" },
  { asset: "ATOM", rate: 0.15, note: "Cosmos" },
  { asset: "TRX", rate: 0.04, note: "SR vote" },
  { asset: "KSM", rate: 0.12, note: "Nominators" },
];

function StakingPage() {
  const balances = useTradingStore((s) => s.balances);
  const tickers = useTradingStore((s) => s.tickers);
  const [asset, setAsset] = useState("SOL");
  const held = balances.find((b) => b.asset === asset)?.available ?? 0;
  const [amount, setAmount] = useState(held ? String(held) : "10");
  const [years, setYears] = useState("3");

  const row = APR.find((r) => r.asset === asset)!;
  const qty = Number(amount) || 0;
  const y = Math.max(Number(years) || 0, 0);
  const future = useMemo(() => qty * Math.pow(1 + row.rate, y), [qty, row.rate, y]);
  const usdNow = usdValue(asset, qty, tickers);
  const usdLater = usdValue(asset, future, tickers);

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Staking" kicker="Simulation d’APR Kraken-like — hors lockup et slash" />
      <div className="flex gap-1 overflow-x-auto">
        {APR.map((r) => (
          <button
            key={r.asset}
            type="button"
            onClick={() => {
              setAsset(r.asset);
              const avail = balances.find((b) => b.asset === r.asset)?.available ?? 0;
              if (avail) setAmount(String(avail));
            }}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
              asset === r.asset ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {r.asset}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <label className="block space-y-1 text-xs text-muted-foreground">
          Quantité
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="font-mono tabular-nums" />
        </label>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Années
          <Input value={years} onChange={(e) => setYears(e.target.value)} inputMode="decimal" className="font-mono tabular-nums" />
        </label>
      </div>
      <div className="mt-6 space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
        <Row k="APR indicatif" v={`${(row.rate * 100).toFixed(1)} %`} />
        <Row k="Mécanisme" v={row.note} />
        <Row k="Valeur actuelle" v={formatFiat(usdNow)} />
        <Row k={`Après ${y} ans`} v={`${formatQty(future, 6)} ${asset}`} />
        <Row k="USD projeté*" v={formatFiat(usdLater)} />
      </div>
      <p className="mt-3 text-xs text-subtle">*Au prix spot actuel, sans variation de marché.</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono tabular-nums">{v}</span>
    </div>
  );
}
