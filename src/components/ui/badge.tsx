import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "buy" | "sell" | "accent" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "buy" && "bg-buy/15 text-buy",
        tone === "sell" && "bg-sell/15 text-sell",
        tone === "accent" && "bg-accent/15 text-accent",
        tone === "warn" && "bg-warning/15 text-warning",
        className,
      )}
      {...props}
    />
  );
}
