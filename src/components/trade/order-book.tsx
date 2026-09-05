import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { formatPrice, formatQty } from "@/lib/trading/format";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export function OrderBook({ pair, onPrice }: { pair: string; onPrice?: (n: number) => void }) {
  const book = useTradingStore((s) => s.books[pair]);
  const last = useTradingStore((s) => s.tickers[pair]?.last);
  const meta = PAIR_BY_ID[pair];
  const asks = (book?.asks ?? []).slice(0, 12).slice().reverse();
  const bids = (book?.bids ?? []).slice(0, 12);
  const max = Math.max(
    ...asks.map((l) => l.total),
    ...bids.map((l) => l.total),
    1,
  );

  return (
    <div className="px-3 py-2">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-subtle">
        <span>Prix ({meta?.quote})</span>
        <span>Qté ({meta?.base})</span>
        <span>Cumul</span>
      </div>
      <div className="space-y-0.5">
        {asks.map((l) => (
          <BookRow
            key={`a-${l.price}`}
            price={l.price}
            size={l.size}
            total={l.total}
            max={max}
            decimals={meta?.pairDecimals ?? 2}
            side="sell"
            onClick={() => onPrice?.(l.price)}
          />
        ))}
      </div>
      <div className="my-2 flex items-center justify-between rounded-sm bg-muted px-2 py-1.5">
        <span className="font-mono text-sm tabular-nums text-foreground">
          {formatPrice(last ?? 0, meta?.pairDecimals ?? 2)}
        </span>
        <span className="text-xs text-muted-foreground">
          Spread {formatPrice(book?.spread ?? 0, meta?.pairDecimals ?? 2)}
          {book ? ` · ${book.spreadPct.toFixed(3)} %` : ""}
        </span>
      </div>
      <div className="space-y-0.5">
        {bids.map((l) => (
          <BookRow
            key={`b-${l.price}`}
            price={l.price}
            size={l.size}
            total={l.total}
            max={max}
            decimals={meta?.pairDecimals ?? 2}
            side="buy"
            onClick={() => onPrice?.(l.price)}
          />
        ))}
      </div>
    </div>
  );
}

function BookRow({
  price,
  size,
  total,
  max,
  decimals,
  side,
  onClick,
}: {
  price: number;
  size: number;
  total: number;
  max: number;
  decimals: number;
  side: "buy" | "sell";
  onClick: () => void;
}) {
  const pct = Math.min(100, (total / max) * 100);
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full items-center justify-between px-1 py-0.5 font-mono text-xs tabular-nums"
    >
      <span
        className={cn(
          "absolute inset-y-0 right-0 rounded-sm opacity-25",
          side === "buy" ? "bg-buy" : "bg-sell",
        )}
        style={{ width: `${pct}%` }}
      />
      <span className={cn("relative", side === "buy" ? "text-buy" : "text-sell")}>
        {formatPrice(price, decimals)}
      </span>
      <span className="relative text-foreground">{formatQty(size, 5)}</span>
      <span className="relative text-muted-foreground">{formatQty(total, 4)}</span>
    </button>
  );
}
