import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bot,
  Briefcase,
  CandlestickChart,
  LayoutGrid,
  ListOrdered,
} from "lucide-react";
import { Toaster } from "sonner";
import { NautilusMark } from "@/components/brand/mark";
import { useBotEngine } from "@/lib/trading/bot-engine";
import { useTickerEngine } from "@/lib/trading/engine";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Marchés", icon: LayoutGrid, match: (p: string) => p === "/" },
  {
    to: "/trade/$pair",
    label: "Trade",
    icon: CandlestickChart,
    match: (p: string) => p.startsWith("/trade"),
  },
  { to: "/bot", label: "Bot", icon: Bot, match: (p: string) => p.startsWith("/bot") },
  { to: "/wallet", label: "Compte", icon: Briefcase, match: (p: string) => p.startsWith("/wallet") },
  { to: "/orders", label: "Ordres", icon: ListOrdered, match: (p: string) => p.startsWith("/orders") },
  {
    to: "/tools",
    label: "Outils",
    icon: ArrowLeftRight,
    match: (p: string) =>
      !["/", "/wallet", "/orders", "/bot"].includes(p) && !p.startsWith("/trade"),
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  useTickerEngine();
  useBotEngine();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastPair = useTradingStore((s) => s.lastPair);
  const live = useTradingStore((s) => s.live);
  const lastTickAt = useTradingStore((s) => s.lastTickAt);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <NautilusMark className="size-7" />
          <span className="text-sm font-semibold tracking-tight">Nautilus</span>
        </div>
        <LivePill live={live} at={lastTickAt} />
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col items-center border-r border-border bg-card pt-5 lg:flex">
        <NautilusMark className="mb-8 size-9" />
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            const dest =
              item.to === "/trade/$pair"
                ? { to: "/trade/$pair" as const, params: { pair: lastPair } }
                : { to: item.to };
            return (
              <Link
                key={item.label}
                {...dest}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-2.5 text-xs font-medium transition-colors duration-150",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("grid size-9 place-items-center rounded-full", active && "bg-muted")}>
                  <Icon className={cn("size-5", active && "text-accent")} strokeWidth={1.75} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mb-6">
          <LivePill live={live} at={lastTickAt} compact />
        </div>
      </aside>

      <main className="min-h-dvh pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-20">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        <div className="grid h-[4.25rem] grid-cols-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            const dest =
              item.to === "/trade/$pair"
                ? { to: "/trade/$pair" as const, params: { pair: lastPair } }
                : { to: item.to };
            return (
              <Link
                key={item.label}
                {...dest}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-150",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span className={cn("grid size-9 place-items-center rounded-full", active && "bg-muted")}>
                  <Icon className={cn("size-4", active && "text-accent")} strokeWidth={1.75} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#181C23",
            border: "1px solid #252A33",
            color: "#F1F3F6",
          },
        }}
      />
    </div>
  );
}

function LivePill({ live, at, compact }: { live: boolean; at: number; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs font-medium uppercase tracking-wide",
        live ? "text-buy" : "text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", live ? "bg-buy" : "bg-subtle")} />
      {compact ? (live ? "Live" : "Off") : live ? "Kraken live" : "Hors ligne"}
      {!compact && at > 0 && (
        <span className="font-mono text-subtle normal-case tracking-normal">
          {new Date(at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      )}
    </div>
  );
}
