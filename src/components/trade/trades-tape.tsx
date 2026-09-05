import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { formatPrice, formatQty, formatTime } from "@/lib/trading/format";
import { useTradingStore } from "@/lib/trading/store";
import type { TapeTrade } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

const EMPTY: TapeTrade[] = [];

export function TradesTape({ pair }: { pair: string }) {
  const trades = useTradingStore((s) => s.tapes[pair] ?? EMPTY);
  const meta = PAIR_BY_ID[pair];
  if (trades.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground">En attente du flux de transactions…</p>;
  }
  return (
    <ul className="divide-y divide-border px-3">
      {trades.map((t) => (
        <li key={t.id} className="flex items-center justify-between py-1.5 font-mono text-xs tabular-nums">
          <span className={cn(t.side === "buy" ? "text-buy" : "text-sell")}>
            {formatPrice(t.price, meta?.pairDecimals ?? 2)}
          </span>
          <span className="text-foreground">{formatQty(t.size, 5)}</span>
          <span className="text-subtle">{formatTime(t.time)}</span>
        </li>
      ))}
    </ul>
  );
}
