import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatQty } from "@/lib/trading/format";
import { usdValue, useTradingStore } from "@/lib/trading/store";

export const Route = createFileRoute("/convert")({ component: ConvertPage });

function ConvertPage() {
  const balances = useTradingStore((s) => s.balances);
  const tickers = useTradingStore((s) => s.tickers);
  const convert = useTradingStore((s) => s.convert);
  const assets = useMemo(
    () =>
      Array.from(
        new Set(["USD", "EUR", ...balances.filter((b) => b.available > 0).map((b) => b.asset)]),
      ),
    [balances],
  );
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BTC");
  const [amount, setAmount] = useState("100");
  const [msg, setMsg] = useState<string | null>(null);

  const fromBal = balances.find((b) => b.asset === from)?.available ?? 0;
  const usd = usdValue(from, Number(amount) || 0, tickers);
  const toPx = usdValue(to, 1, tickers);
  const preview = toPx ? (usd / toPx) * 0.9974 : 0;

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      <PageHeader title="Convertir" kicker="Swap interne au compte démo, frais taker 0,26 %" />
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const res = convert(from, to, Number(amount) || 0);
          setMsg(res.message);
        }}
      >
        <label className="block text-xs text-muted-foreground">
          Depuis
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {assets.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <Input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="font-mono tabular-nums"
        />
        <p className="text-xs text-muted-foreground">Disponible {formatQty(fromBal, 8)} {from}</p>
        <label className="block text-xs text-muted-foreground">
          Vers
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {["BTC", "ETH", "SOL", "USD", "EUR", "XRP", "ADA", "DOGE"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-md bg-muted px-3 py-3 font-mono text-sm tabular-nums">
          ≈ {preview ? preview.toPrecision(6) : "—"} {to}
        </div>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <Button type="submit" className="w-full">
          Convertir
        </Button>
      </form>
    </div>
  );
}
