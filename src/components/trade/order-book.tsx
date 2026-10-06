import {
  BOOK_RANGE_PCTS,
  bandLadder,
  bookCoveragePct,
  bookMid,
  rangeSteps,
  type BookRangePct,
} from "@/lib/trading/book-range";
import { formatCompact, formatPrice, formatQty } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export function BookRangePicker({
  value,
  onChange,
}: {
  value: BookRangePct;
  onChange: (v: BookRangePct) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2 lg:w-fit lg:gap-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Niveaux</p>
      <div className="flex gap-1">
        {BOOK_RANGE_PCTS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => onChange(pct)}
            className={cn(
              "h-9 min-w-11 rounded-full px-2.5 text-xs font-medium transition-colors duration-150",
              value === pct ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {pct} %
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrderBook({
  pair,
  rangePct = 5,
  onPrice,
}: {
  pair: string;
  rangePct?: BookRangePct;
  onPrice?: (n: number) => void;
}) {
  const book = useTradingStore((s) => s.books[pair]);
  const last = useTradingStore((s) => s.tickers[pair]?.last);
  const meta = PAIR_BY_ID[pair];
  const mid = bookMid(book, last);
  const steps = rangeSteps(rangePct);
  const asks = bandLadder(book?.asks ?? [], mid, steps, "ask").slice().reverse();
  const bids = bandLadder(book?.bids ?? [], mid, steps, "bid");
  const max = Math.max(...asks.map((l) => l.size), ...bids.map((l) => l.size), 1e-9);
  const decimals = meta?.pairDecimals ?? 2;
  const bidQuote = bids[bids.length - 1]?.totalQuote ?? 0;
  const askQuote = asks[0]?.totalQuote ?? 0;
  const tot = bidQuote + askQuote;
  const bidShare = tot > 0 ? (bidQuote / tot) * 100 : 50;
  const cover = bookCoveragePct(book, mid);
  const thin = cover.bid + 0.05 < rangePct || cover.ask + 0.05 < rangePct;

  return (
    <div className="px-3 py-2">
      <div className="mb-2 flex h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-buy" style={{ width: `${bidShare}%` }} />
        <div className="h-full bg-sell" style={{ width: `${100 - bidShare}%` }} />
      </div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-subtle">
        <span>Niveau</span>
        <span>Prix ({meta?.quote})</span>
        <span>Bande ({meta?.base})</span>
      </div>
      <div className="space-y-0.5">
        {asks.map((l) => (
          <BandRowView
            key={`a-${l.pct}`}
            row={l}
            sign="+"
            max={max}
            decimals={decimals}
            side="sell"
            onClick={() => onPrice?.(l.price)}
          />
        ))}
      </div>
      <div className="my-2 flex items-center justify-between rounded-sm bg-muted px-2 py-1.5">
        <span className="font-mono text-sm tabular-nums text-foreground">{formatPrice(last ?? mid, decimals)}</span>
        <span className="text-xs text-muted-foreground">
          Spread {formatPrice(book?.spread ?? 0, decimals)}
          {book ? ` · ${book.spreadPct.toFixed(3)} %` : ""}
        </span>
      </div>
      <div className="space-y-0.5">
        {bids.map((l) => (
          <BandRowView
            key={`b-${l.pct}`}
            row={l}
            sign="−"
            max={max}
            decimals={decimals}
            side="buy"
            onClick={() => onPrice?.(l.price)}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <p>
          <span className="text-buy">Cumul jusqu’à −{rangePct} %</span>
          <span className="block font-mono tabular-nums">
            {formatQty(bids[bids.length - 1]?.total ?? 0, 4)} {meta?.base} · {formatCompact(bidQuote)} {meta?.quote}
          </span>
        </p>
        <p className="text-right">
          <span className="text-sell">Cumul jusqu’à +{rangePct} %</span>
          <span className="block font-mono tabular-nums">
            {formatQty(asks[0]?.total ?? 0, 4)} {meta?.base} · {formatCompact(askQuote)} {meta?.quote}
          </span>
        </p>
      </div>
      {thin && (
        <p className="mt-2 text-[10px] leading-snug text-subtle">
          Carnet public jusqu’à −{cover.bid.toFixed(2)} % / +{cover.ask.toFixed(2)} %. Les bandes au-delà
          n’ont pas d’offres — ce n’est pas le même cumul recopié.
        </p>
      )}
    </div>
  );
}

function BandRowView({
  row,
  sign,
  max,
  decimals,
  side,
  onClick,
}: {
  row: { pct: number; price: number; size: number };
  sign: "+" | "−";
  max: number;
  decimals: number;
  side: "buy" | "sell";
  onClick: () => void;
}) {
  const empty = row.size <= 0;
  const width = empty ? 0 : Math.min(100, (row.size / max) * 100);
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-9 w-full items-center justify-between gap-2 px-1 py-0.5 font-mono text-xs tabular-nums"
    >
      <span
        className={cn(
          "absolute inset-y-0 right-0 rounded-sm opacity-25",
          side === "buy" ? "bg-buy" : "bg-sell",
        )}
        style={{ width: `${width}%` }}
      />
      <span className={cn("relative w-12 text-left", side === "buy" ? "text-buy" : "text-sell")}>
        {sign}
        {row.pct} %
      </span>
      <span className="relative flex-1 text-center text-foreground">{formatPrice(row.price, decimals)}</span>
      <span className={cn("relative w-16 text-right", empty ? "text-subtle" : "text-muted-foreground")}>
        {empty ? "—" : formatQty(row.size, 4)}
      </span>
    </button>
  );
}
