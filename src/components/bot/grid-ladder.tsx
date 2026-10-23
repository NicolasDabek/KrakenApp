export function GridLadder({
  lo,
  hi,
  last,
  nextBuy,
  nextSell,
}: {
  lo: number;
  hi: number;
  last: number;
  nextBuy?: number;
  nextSell?: number;
}) {
  const span = hi - lo;
  const pct = (p: number) => Math.max(0, Math.min(100, ((p - lo) / span) * 100));
  return (
    <div className="relative h-2 rounded-full bg-muted">
      <span className="absolute inset-y-0 left-0 rounded-full bg-accent/30" style={{ width: `${pct(Math.min(last, hi))}%` }} />
      {nextBuy != null && (
        <span className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-buy" style={{ left: `${pct(nextBuy)}%` }} />
      )}
      {nextSell != null && (
        <span className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sell" style={{ left: `${pct(nextSell)}%` }} />
      )}
      <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${pct(last)}%` }} />
    </div>
  );
}
