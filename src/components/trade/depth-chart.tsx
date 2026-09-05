import { useMemo } from "react";
import { useTradingStore } from "@/lib/trading/store";

export function DepthChart({ pair }: { pair: string }) {
  const book = useTradingStore((s) => s.books[pair]);
  const path = useMemo(() => {
    if (!book) return null;
    const bids = [...book.bids].slice(0, 20).sort((a, b) => a.price - b.price);
    const asks = [...book.asks].slice(0, 20).sort((a, b) => a.price - b.price);
    if (bids.length === 0 || asks.length === 0) return null;
    const minP = bids[0]!.price;
    const maxP = asks[asks.length - 1]!.price;
    const span = maxP - minP || 1;
    const maxT = Math.max(bids[bids.length - 1]?.total ?? 1, asks[asks.length - 1]?.total ?? 1);
    const x = (p: number) => ((p - minP) / span) * 100;
    const y = (t: number) => 100 - (t / maxT) * 92;
    const bidD = bids.map((l, i) => `${i === 0 ? "M" : "L"} ${x(l.price).toFixed(2)} ${y(l.total).toFixed(2)}`).join(" ");
    const askD = asks.map((l, i) => `${i === 0 ? "M" : "L"} ${x(l.price).toFixed(2)} ${y(l.total).toFixed(2)}`).join(" ");
    return { bidD, askD, mid: x((book.bids[0]!.price + book.asks[0]!.price) / 2) };
  }, [book]);

  if (!path) {
    return <div className="grid h-32 place-items-center text-xs text-muted-foreground">Profondeur indisponible</div>;
  }

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${path.bidD} L ${path.mid} 100 L 0 100 Z`} fill="rgba(47,190,143,0.22)" />
      <path d={path.bidD} fill="none" stroke="#2FBE8F" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <path d={`${path.askD} L 100 100 L ${path.mid} 100 Z`} fill="rgba(232,93,108,0.22)" />
      <path d={path.askD} fill="none" stroke="#E85D6C" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <line x1={path.mid} x2={path.mid} y1="0" y2="100" stroke="#252A33" strokeWidth="1" />
    </svg>
  );
}
