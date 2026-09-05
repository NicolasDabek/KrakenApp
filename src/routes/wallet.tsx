import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sheet } from "@/components/layout/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { krakenDeposit } from "@/lib/trading/functions";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { usdValue, isLiveConnected, liveBalanceRows, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

function WalletPage() {
  const demoBalances = useTradingStore((s) => s.balances);
  const krakenBalances = useTradingStore((s) => s.krakenBalances);
  const connection = useTradingStore((s) => s.connection);
  const live = isLiveConnected(connection);
  const balances = live ? liveBalanceRows(krakenBalances) : demoBalances;
  const tickers = useTradingStore((s) => s.tickers);
  const quote = useTradingStore((s) => s.settings.displayQuote);
  const [sheet, setSheet] = useState<"in" | "out" | null>(null);
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState<string | null>(null);
  const [depositBusy, setDepositBusy] = useState(false);

  const rows = useMemo(() => {
    return balances
      .map((b) => {
        const usd = usdValue(b.asset, b.available + b.hold, tickers);
        const t = Object.values(tickers).find(
          (x) => PAIR_BY_ID[x.id]?.base === b.asset && PAIR_BY_ID[x.id]?.quote === "USD",
        );
        return { ...b, usd, changePct: t?.changePct ?? 0 };
      })
      .filter((b) => b.available + b.hold > 0 || b.usd > 0.5)
      .sort((a, b) => b.usd - a.usd);
  }, [balances, tickers]);

  const totalUsd = rows.reduce((s, r) => s + r.usd, 0);
  const dayPnl = rows.reduce((s, r) => s + r.usd * (r.changePct / 100), 0);
  const dayPct = totalUsd ? (dayPnl / (totalUsd - dayPnl)) * 100 : 0;
  const fx = usdValue("EUR", 1, tickers) || 1.08;
  const shown = quote === "EUR" ? totalUsd / fx : totalUsd;

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Valeur estimée</p>
          <p className="mt-1 font-mono text-3xl font-medium tabular-nums tracking-tight">
            {formatFiat(shown, quote)}
          </p>
          <p className={cn("mt-1 font-mono text-sm tabular-nums", dayPnl >= 0 ? "text-buy" : "text-sell")}>
            {formatFiat(dayPnl, "USD")} · {formatPct(dayPct)} / 24h
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={live ? "buy" : "warn"}>{live ? "Kraken" : "Démo"}</Badge>
          <AllocRing
            slices={rows.map((r) => ({
              id: r.asset,
              pct: totalUsd ? (r.usd / totalUsd) * 100 : 0,
            }))}
          />
        </div>
      </div>

      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-muted">
        {rows.map((r, i) => (
          <div
            key={r.asset}
            title={r.asset}
            className="h-full"
            style={{
              width: `${totalUsd ? (r.usd / totalUsd) * 100 : 0}%`,
              background: `color-mix(in oklab, var(--color-accent) ${100 - i * 12}%, var(--color-foreground))`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {rows.slice(0, 6).map((r) => (
          <span key={r.asset}>
            {r.asset} {totalUsd ? Math.round((r.usd / totalUsd) * 100) : 0}%
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => setSheet("in")}>
          Déposer
        </Button>
        <Button variant="outline" onClick={() => setSheet("out")}>
          Retirer
        </Button>
      </div>

      <ul className="mt-6 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.asset} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{r.asset}</p>
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {formatQty(r.available, 8)}
                {r.hold > 0 ? ` · ${formatQty(r.hold, 6)} bloqué` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm tabular-nums">{formatFiat(r.usd)}</p>
              <p className={cn("font-mono text-xs tabular-nums", r.changePct >= 0 ? "text-buy" : "text-sell")}>
                {formatPct(r.changePct)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {sheet && (
        <Sheet title={sheet === "in" ? "Dépôt" : "Retrait"} onClose={() => setSheet(null)}>
          <div className="space-y-3 px-4 pb-5">
            <p className="text-sm text-muted-foreground">
              {live
                ? sheet === "in"
                  ? "Adresse générée via l’API Kraken DepositAddresses."
                  : "Les retraits on-chain restent sur Kraken.com (droit Withdrawal non utilisé ici)."
                : "Simulation locale. Connecte tes clés pour une adresse de dépôt réelle."}
            </p>
            <Input value={asset} onChange={(e) => setAsset(e.target.value.toUpperCase())} placeholder="Actif" />
            {sheet === "out" && (
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" inputMode="decimal" />
            )}
            {sheet === "in" && (
              <div className="rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {deposit ?? (live ? "Appuie pour demander l’adresse Kraken" : `nautilus-demo-${asset.toLowerCase()}`)}
              </div>
            )}
            <Button
              className="w-full"
              disabled={depositBusy}
              onClick={() => {
                if (sheet === "out") {
                  setSheet(null);
                  return;
                }
                if (!live) {
                  setSheet(null);
                  return;
                }
                setDepositBusy(true);
                void krakenDeposit({ data: { apiKey: connection.apiKey, apiSecret: connection.apiSecret, asset } })
                  .then((res) => {
                    setDeposit(res.ok && res.info ? `${res.info.method} · ${res.info.address}${res.info.tag ? ` · tag ${res.info.tag}` : ""}` : res.message);
                  })
                  .finally(() => setDepositBusy(false));
              }}
            >
              {sheet === "in" ? (live ? (depositBusy ? "…" : "Obtenir l’adresse") : "J’ai compris") : "Fermer"}
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function AllocRing({ slices }: { slices: { id: string; pct: number }[] }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 40 40" className="size-16 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="6" />
      {slices.map((s, i) => {
        const dash = (s.pct / 100) * c;
        const gap = c - dash;
        const el = (
          <circle
            key={s.id}
            cx="20"
            cy="20"
            r={r}
            fill="none"
            stroke={`color-mix(in oklab, var(--color-accent) ${100 - i * 14}%, var(--color-foreground))`}
            strokeWidth="6"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-acc}
          />
        );
        acc += dash;
        return el;
      })}
    </svg>
  );
}
