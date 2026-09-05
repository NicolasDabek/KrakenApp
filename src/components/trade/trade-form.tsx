import { useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/layout/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFiat, formatPrice, formatQty } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import type { OrderSide, OrderType } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

const TYPES: { id: OrderType; label: string }[] = [
  { id: "market", label: "Marché" },
  { id: "limit", label: "Limite" },
  { id: "stop", label: "Stop" },
  { id: "stop-limit", label: "Stop-lim." },
];

export function TradeForm({
  pair,
  forcedSide,
  seedPrice,
}: {
  pair: string;
  forcedSide?: OrderSide;
  seedPrice?: number;
}) {
  const meta = PAIR_BY_ID[pair];
  const ticker = useTradingStore((s) => s.tickers[pair]);
  const balances = useTradingStore((s) => s.balances);
  const placeOrder = useTradingStore((s) => s.placeOrder);
  const confirm = useTradingStore((s) => s.settings.confirmOrders);
  const [side, setSide] = useState<OrderSide>(forcedSide ?? "buy");
  const [type, setType] = useState<OrderType>("market");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stop, setStop] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [trail, setTrail] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const activeSide = forcedSide ?? side;
  const last = ticker?.last ?? 0;
  const px = type === "market" ? last : Number(price) || seedPrice || last;
  const qty = Number(amount) || 0;

  const baseBal = balances.find((b) => b.asset === meta?.base)?.available ?? 0;
  const quoteBal = balances.find((b) => b.asset === meta?.quote)?.available ?? 0;
  const available = activeSide === "buy" ? quoteBal : baseBal;

  const total = qty * px;
  const fee = total * 0.0026;

  const setPct = (pct: number) => {
    if (!meta) return;
    if (activeSide === "buy") {
      const spend = quoteBal * pct;
      const q = px > 0 ? spend / px : 0;
      setAmount(String(Number(q.toFixed(Math.min(meta.lotDecimals, 8)))));
    } else {
      setAmount(String(Number((baseBal * pct).toFixed(Math.min(meta.lotDecimals, 8)))));
    }
  };

  const leverageMarks = useMemo(() => {
    const max = meta?.maxLeverage ?? 1;
    return [1, 2, 3, 5, 10].filter((n) => n <= max);
  }, [meta]);

  const payload = {
    pair,
    side: activeSide,
    type,
    amount: qty,
    price: type === "market" || type === "stop" ? undefined : Number(price) || px,
    stopPrice: type === "stop" || type === "stop-limit" ? Number(stop) || undefined : undefined,
    leverage,
    tp: Number(tp) || undefined,
    sl: Number(sl) || undefined,
    trailingPct: Number(trail) || undefined,
  };

  const send = () => {
    setError(null);
    const res = placeOrder(payload);
    if (!res.ok) setError(res.message);
    else setAmount("");
    setPending(false);
  };

  const submit = () => {
    setError(null);
    if (confirm) {
      setPending(true);
      return;
    }
    send();
  };

  return (
    <>
      <form
        className="space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {!forcedSide && (
          <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={cn(
                "h-10 rounded-sm text-sm font-medium",
                activeSide === "buy" ? "bg-buy text-buy-foreground" : "text-muted-foreground",
              )}
            >
              Acheter
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={cn(
                "h-10 rounded-sm text-sm font-medium",
                activeSide === "sell" ? "bg-sell text-sell-foreground" : "text-muted-foreground",
              )}
            >
              Vendre
            </button>
          </div>
        )}

        <div className="flex gap-1 overflow-x-auto">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium",
                type === t.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {(type === "limit" || type === "stop-limit") && (
          <Field label={`Prix ${meta?.quote}`}>
            <Input
              inputMode="decimal"
              value={price}
              placeholder={formatPrice(seedPrice ?? last, meta?.pairDecimals ?? 2)}
              onChange={(e) => setPrice(e.target.value)}
              className="font-mono tabular-nums"
            />
          </Field>
        )}
        {(type === "stop" || type === "stop-limit") && (
          <Field label="Stop">
            <Input
              inputMode="decimal"
              value={stop}
              onChange={(e) => setStop(e.target.value)}
              className="font-mono tabular-nums"
            />
          </Field>
        )}

        <Field
          label={`Quantité ${meta?.base}`}
          hint={`Dispo. ${formatQty(available, 6)} ${activeSide === "buy" ? meta?.quote : meta?.base}`}
        >
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono tabular-nums"
            placeholder="0.00"
          />
        </Field>

        <div className="grid grid-cols-4 gap-1">
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPct(p)}
              className="h-9 rounded-sm bg-muted text-xs font-medium text-muted-foreground"
            >
              {p * 100}%
            </button>
          ))}
        </div>

        {meta && meta.maxLeverage > 1 && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Levier</span>
              <span className="font-mono tabular-nums text-foreground">{leverage}×</span>
            </div>
            <div className="flex gap-1">
              {leverageMarks.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLeverage(n)}
                  className={cn(
                    "h-8 flex-1 rounded-sm text-xs font-medium",
                    leverage === n ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {n}×
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="text-xs font-medium text-muted-foreground"
        >
          {advanced ? "Masquer TP / SL / trailing" : "Take-profit / Stop-loss / Trailing"}
        </button>
        {advanced && (
          <div className="grid grid-cols-3 gap-2">
            <Input
              inputMode="decimal"
              placeholder="TP"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="font-mono tabular-nums"
            />
            <Input
              inputMode="decimal"
              placeholder="SL"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="font-mono tabular-nums"
            />
            <Input
              inputMode="decimal"
              placeholder="Trail %"
              value={trail}
              onChange={(e) => setTrail(e.target.value)}
              className="font-mono tabular-nums"
            />
          </div>
        )}

        <div className="space-y-1 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Row k="Total estimé" v={formatFiat(total, meta?.quote === "EUR" ? "EUR" : "USD")} />
          <Row k="Frais taker 0,26 %" v={formatFiat(fee, meta?.quote === "EUR" ? "EUR" : "USD")} />
        </div>

        {error && <p className="text-sm text-sell">{error}</p>}

        <Button type="submit" variant={activeSide === "buy" ? "buy" : "sell"} className="w-full" size="lg">
          {activeSide === "buy" ? "Acheter" : "Vendre"} {meta?.base}
        </Button>
        <p className="text-center text-xs text-subtle">Mode démo — exécution locale contre le prix Kraken</p>
      </form>

      {pending && (
        <Sheet title="Confirmer l’ordre" onClose={() => setPending(false)}>
          <div className="space-y-3 px-4 pb-5">
            <p className="text-sm text-muted-foreground">
              {activeSide === "buy" ? "Achat" : "Vente"} {qty} {meta?.base} · {type} · {meta?.display}
            </p>
            <p className="font-mono text-sm tabular-nums">
              ≈ {formatFiat(total, meta?.quote === "EUR" ? "EUR" : "USD")}
              {leverage > 1 ? ` · ${leverage}×` : ""}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setPending(false)}>
                Annuler
              </Button>
              <Button variant={activeSide === "buy" ? "buy" : "sell"} onClick={send}>
                Confirmer
              </Button>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-xs text-muted-foreground">
        {label}
        {hint && <span className="font-mono tabular-nums">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span>{k}</span>
      <span className="font-mono tabular-nums text-foreground">{v}</span>
    </div>
  );
}
