import type { TrendQuality } from "@/lib/trading/indicators";
import { cn } from "@/lib/utils";

/** Ligne compacte : relation EMA20/EMA50, volume vs sa moyenne 20, et verdict solide/fragile. */
export function TrendQualityLine({ tq, className, frame = "1 h" }: { tq: TrendQuality | null; className?: string; frame?: string }) {
  if (!tq || tq.emaFast == null || tq.emaSlow == null) return null;
  const rel = tq.emaFast >= tq.emaSlow ? ">" : "<";
  const tone =
    tq.direction === "flat"
      ? "text-subtle"
      : tq.direction === "up"
        ? tq.quality === "solid"
          ? "text-buy"
          : "text-buy/70"
        : tq.quality === "solid"
          ? "text-sell"
          : "text-sell/70";
  const verdict =
    tq.direction === "flat"
      ? "Sans tendance"
      : `${tq.direction === "up" ? "Hausse" : "Baisse"} ${tq.quality === "solid" ? "solide" : "fragile"}`;
  const vol = tq.volTrend == null ? null : tq.volTrend;
  return (
    <p className={cn("text-xs text-subtle tabular-nums", className)} title={`${frame} · ${tq.note}`}>
      EMA20 {rel} EMA50 {tq.spreadPct >= 0 ? "+" : ""}
      {tq.spreadPct.toFixed(2)}%
      {vol != null && (
        <>
          {" · "}Vol {vol >= 1 ? "↑" : "↓"} ×{vol.toFixed(2)}
        </>
      )}
      {" · "}
      <span className={cn("font-medium", tone)}>{verdict}</span>
    </p>
  );
}
