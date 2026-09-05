import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { formatPct, formatPrice } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { eurUsdRate, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arb")({ component: ArbPage });

function ArbPage() {
  const tickers = useTradingStore((s) => s.tickers);
  const fx = eurUsdRate(tickers);

  const rows = useMemo(() => {
    const byBase = new Map<string, { usdId?: string; eurId?: string }>();
    for (const t of Object.values(tickers)) {
      const meta = PAIR_BY_ID[t.id];
      if (!meta) continue;
      const g = byBase.get(meta.base) ?? {};
      if (meta.quote === "USD") g.usdId = t.id;
      if (meta.quote === "EUR") g.eurId = t.id;
      byBase.set(meta.base, g);
    }
    const out = [];
    for (const [base, g] of byBase) {
      if (!g.usdId || !g.eurId) continue;
      const usd = tickers[g.usdId];
      const eur = tickers[g.eurId];
      if (!usd || !eur || !fx) continue;
      const impliedEur = usd.last / fx;
      const diff = eur.last - impliedEur;
      const bps = impliedEur ? (diff / impliedEur) * 10_000 : 0;
      out.push({
        base,
        usdId: g.usdId,
        eurId: g.eurId,
        usd: usd.last,
        eur: eur.last,
        impliedEur,
        bps,
      });
    }
    return out.sort((a, b) => Math.abs(b.bps) - Math.abs(a.bps));
  }, [tickers, fx]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <PageHeader
        title="Écart USD / EUR"
        kicker={`EURUSD implicite ${fx.toFixed(4)} via BTC · écart en points de base`}
      />
      {rows.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">En attente des paires EUR.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.base} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{r.base}</p>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  USD {formatPrice(r.usd, PAIR_BY_ID[r.usdId]?.pairDecimals ?? 2)} · EUR{" "}
                  {formatPrice(r.eur, PAIR_BY_ID[r.eurId]?.pairDecimals ?? 2)}
                </p>
              </div>
              <Link
                to="/trade/$pair"
                params={{ pair: Math.abs(r.bps) > 0 && r.bps > 0 ? r.eurId : r.usdId }}
                className={cn(
                  "font-mono text-sm tabular-nums",
                  Math.abs(r.bps) >= 15 ? "text-warning" : "text-muted-foreground",
                )}
              >
                {r.bps >= 0 ? "+" : ""}
                {r.bps.toFixed(1)} pb
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs leading-relaxed text-subtle">
        Un écart positif signifie que le livre EUR cote plus cher que le USD converti. Frais et
        spread rendent l’arbitrage souvent infaisable — l’outil sert de radar, pas d’exécution.
      </p>
    </div>
  );
}
