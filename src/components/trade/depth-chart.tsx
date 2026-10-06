import { useMemo } from "react";
import {
  bandLadder,
  bookCoveragePct,
  bookMid,
  depthHistogram,
  rangeSteps,
  type BookRangePct,
} from "@/lib/trading/book-range";
import { formatCompact, formatPrice } from "@/lib/trading/format";
import { PAIR_BY_ID } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";

export function DepthChart({ pair, rangePct = 5 }: { pair: string; rangePct?: BookRangePct }) {
  const book = useTradingStore((s) => s.books[pair]);
  const last = useTradingStore((s) => s.tickers[pair]?.last);
  const meta = PAIR_BY_ID[pair];
  const mid = bookMid(book, last);
  const steps = rangeSteps(rangePct);
  const decimals = meta?.pairDecimals ?? 2;
  const lo = mid * (1 - rangePct / 100);
  const hi = mid * (1 + rangePct / 100);
  const bidBands = bandLadder(book?.bids ?? [], mid, steps, "bid");
  const askBands = bandLadder(book?.asks ?? [], mid, steps, "ask");
  const cover = bookCoveragePct(book, mid);
  const thin = cover.bid + 0.05 < rangePct || cover.ask + 0.05 < rangePct;

  const viz = useMemo(() => {
    if (!(mid > 0) || !book) return null;
    const bins = depthHistogram(book.bids, book.asks, mid, rangePct, 12);
    if (!bins.length) return null;
    const span = rangePct * 2 || 1;
    const x = (pct: number) => ((pct + rangePct) / span) * 100;
    const maxSize = Math.max(...bins.map((b) => b.size), 1e-9);
    const maxCumul = Math.max(...bins.map((b) => b.cumul), 1);
    const ySize = (s: number) => 100 - (s / maxSize) * 86;
    const yCumul = (t: number) => 100 - (t / maxCumul) * 86;
    const bars = bins.map((b) => {
      const left = Math.min(b.fromPct, b.toPct);
      const right = Math.max(b.fromPct, b.toPct);
      return {
        key: `${b.side}-${b.fromPct}`,
        x: x(left),
        w: Math.max(0.4, x(right) - x(left) - 0.35),
        y: ySize(b.size),
        h: Math.max(0, 100 - ySize(b.size)),
        side: b.side,
        empty: b.size <= 0,
      };
    });
    const bidBins = bins.filter((b) => b.side === "bid");
    const askBins = bins.filter((b) => b.side === "ask");
    const bidLine = bidBins
      .map((b, i) => {
        const y = yCumul(b.cumul);
        const cmd = i === 0 ? "M" : "L";
        return `${cmd} ${x(b.fromPct).toFixed(2)} ${y.toFixed(2)} L ${x(b.toPct).toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
    const askLine = askBins
      .map((b, i) => {
        const y = yCumul(b.cumul);
        const cmd = i === 0 ? "M" : "L";
        return `${cmd} ${x(b.fromPct).toFixed(2)} ${y.toFixed(2)} L ${x(b.toPct).toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
    const midX = x(0);
    const coverX1 = x(-Math.min(cover.bid, rangePct));
    const coverX2 = x(Math.min(cover.ask, rangePct));
    const marks = [rangePct, rangePct / 2].map((p) => ({ p, bid: x(-p), ask: x(p) }));
    return { bars, bidLine, askLine, midX, coverX1, coverX2, marks };
  }, [book, cover.ask, cover.bid, mid, rangePct]);

  if (!viz) {
    return <div className="grid h-44 place-items-center text-xs text-muted-foreground">Profondeur indisponible</div>;
  }

  return (
    <div>
      <svg viewBox="0 0 100 100" className="h-44 w-full" preserveAspectRatio="none" aria-hidden="true">
        <rect
          x={viz.coverX1}
          y="0"
          width={Math.max(0, viz.coverX2 - viz.coverX1)}
          height="100"
          fill="var(--color-muted)"
          opacity="0.12"
        />
        {viz.bars.map((b) => (
          <rect
            key={b.key}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="0.4"
            fill={b.side === "bid" ? "var(--color-buy)" : "var(--color-sell)"}
            opacity={b.empty ? 0.08 : 0.72}
          />
        ))}
        {viz.bidLine && (
          <path
            d={viz.bidLine}
            fill="none"
            stroke="var(--color-buy)"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            opacity="0.9"
          />
        )}
        {viz.askLine && (
          <path
            d={viz.askLine}
            fill="none"
            stroke="var(--color-sell)"
            strokeWidth="1.1"
            vectorEffect="non-scaling-stroke"
            opacity="0.9"
          />
        )}
        {viz.marks.map((m) => (
          <g key={m.p}>
            <line x1={m.bid} x2={m.bid} y1="0" y2="100" stroke="var(--color-border)" strokeWidth="0.5" />
            <line x1={m.ask} x2={m.ask} y1="0" y2="100" stroke="var(--color-border)" strokeWidth="0.5" />
          </g>
        ))}
        <line x1={viz.midX} x2={viz.midX} y1="0" y2="100" stroke="var(--color-muted-foreground)" strokeWidth="0.7" />
      </svg>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
        <span className="text-buy">
          −{rangePct} % · {formatPrice(lo, decimals)}
        </span>
        <span>{formatPrice(mid, decimals)}</span>
        <span className="text-sell">
          +{rangePct} % · {formatPrice(hi, decimals)}
        </span>
      </div>
      <ul className="mt-2 space-y-1 text-[11px]">
        {steps.map((p, i) => {
          const bid = bidBands[i];
          const ask = askBands[i];
          const bidEmpty = !bid || bid.size <= 0;
          const askEmpty = !ask || ask.size <= 0;
          return (
            <li key={p} className="flex items-center justify-between gap-2 font-mono tabular-nums">
              <span className={bidEmpty ? "text-subtle" : "text-buy"}>
                −{p} % {bidEmpty ? "—" : formatCompact(bid.quote)}
              </span>
              <span className="text-subtle">{p} %</span>
              <span className={askEmpty ? "text-subtle" : "text-sell"}>
                {askEmpty ? "—" : formatCompact(ask.quote)} +{p} %
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] leading-snug text-subtle">
        Volume {meta?.quote} dans chaque bande (pas le cumul). L’axe couvre ±{rangePct} %.
        {thin
          ? ` Carnet public jusqu’à −${cover.bid.toFixed(2)} % / +${cover.ask.toFixed(2)} % — au-delà les barres sont vides.`
          : null}
      </p>
    </div>
  );
}
