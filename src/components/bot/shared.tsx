import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "buy" | "sell" }) {
  return (
    <div className="rounded-md bg-muted px-2 py-2">
      <p className="text-[10px] uppercase tracking-wide text-subtle">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-mono text-xs tabular-nums",
          tone === "buy" && "text-buy",
          tone === "sell" && "text-sell",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function Spark({ points, empty = "badge" }: { points: number[]; empty?: "badge" | "none" }) {
  const d = useMemo(() => {
    if (points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * 100;
        const y = 22 - ((p - min) / span) * 20;
        return `${x},${y}`;
      })
      .join(" ");
  }, [points]);
  if (!d) return empty === "badge" ? <Badge tone="accent">Papier</Badge> : null;
  const up = points[points.length - 1]! >= points[0]!;
  return (
    <svg viewBox="0 0 100 24" className="h-8 w-28 shrink-0" aria-hidden>
      <polyline
        fill="none"
        stroke={up ? "var(--color-buy)" : "var(--color-sell)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={d}
      />
    </svg>
  );
}

export function NumField({ label, value, onChange }: { label: string; value: number | undefined; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState(() => (value == null || Number.isNaN(value) ? "" : String(value)));
  useEffect(() => {
    const parsed = Number(raw.replace(",", "."));
    if (raw === "" || raw === "-" || raw === "." || raw === "-." || Number.isNaN(parsed) || parsed !== value) {
      if (Number.isFinite(parsed) && parsed === value) return;
      setRaw(value == null || Number.isNaN(value) ? "" : String(value));
    }
  }, [value]);
  return (
    <Field label={label}>
      <Input
        inputMode="decimal"
        value={raw}
        onChange={(e) => {
          const t = e.target.value.replace(",", ".");
          if (t !== "" && !/^-?\d*\.?\d*$/.test(t)) return;
          setRaw(t);
          if (t === "" || t === "-" || t === "." || t === "-.") return;
          const n = Number(t);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => {
          setRaw(value == null || Number.isNaN(value) ? "" : String(value));
        }}
        className="font-mono tabular-nums"
      />
    </Field>
  );
}

export function ConfirmBar({
  prompt,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  prompt: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="col-span-3 mt-2 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
      <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">{prompt}</p>
      <Button size="sm" variant="sell" onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Annuler
      </Button>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block text-xs text-muted-foreground">
      <p>{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
