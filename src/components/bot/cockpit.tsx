import { Percent, ShieldAlert, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { botMark, paperEquity, evaluateDesk } from "@/lib/trading/bots";
import { formatFiat, formatPct } from "@/lib/trading/format";
import { eurValue, useTradingStore } from "@/lib/trading/store";
import type { BotVenue } from "@/lib/trading/types";
import { cn } from "@/lib/utils";
import { ConfirmBar } from "@/components/bot/shared";

export function Cockpit({ venue }: { venue: BotVenue }) {
  const bots = useTradingStore((s) => s.bots);
  const pauseAllBots = useTradingStore((s) => s.pauseAllBots);
  const panicLive = useTradingStore((s) => s.panicLive);
  const lastTickAt = useTradingStore((s) => s.lastTickAt);
  const liveFeed = useTradingStore((s) => s.live);
  const tickers = useTradingStore((s) => s.tickers);
  const paper = useTradingStore((s) => s.paper);
  const settings = useTradingStore((s) => s.settings);
  const krakenBalances = useTradingStore((s) => s.krakenBalances);
  const deskPeakPaper = useTradingStore((s) => s.deskPeakPaper);
  const deskPeakLive = useTradingStore((s) => s.deskPeakLive);
  const [confirmPanic, setConfirmPanic] = useState(false);
  const mine = bots.filter((b) => b.venue === venue);
  const running = mine.filter((b) => b.status === "running");
  const day = mine.reduce((s, b) => s + (b.runtime.dayPnl ?? 0), 0);
  const pnl = mine.reduce((s, b) => s + b.stats.realizedPnl, 0);
  const stale = lastTickAt > 0 && Date.now() - lastTickAt > 18_000;
  const marks = mine.map((b) => botMark(b.runtime, tickers[b.pair]?.last ?? 0));
  const uPnl = marks.reduce((s, m) => s + m.unrealized, 0);
  const exposure = marks.reduce((s, m) => s + m.exposure, 0);
  const equity =
    venue === "paper"
      ? paperEquity(paper, tickers)
      : Object.entries(krakenBalances).reduce((s, [asset, qty]) => s + eurValue(asset, qty, tickers), 0);
  const peak =
    venue === "paper"
      ? Math.max(deskPeakPaper, paper.startingBalance, equity, ...paper.equityCurve.map((p) => p.v))
      : Math.max(deskPeakLive, equity);
  const desk = evaluateDesk({
    equity,
    peak,
    dayPnl: day,
    exposure,
    limits: settings,
  });
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <div className="rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-[10px] uppercase tracking-wide text-subtle">Actifs</p>
        <p className="mt-1 font-mono text-lg tabular-nums">{running.length}<span className="text-xs text-muted-foreground">/{mine.length}</span></p>
      </div>
      <div className="rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-[10px] uppercase tracking-wide text-subtle">PnL jour</p>
        <p className={cn("mt-1 font-mono text-lg tabular-nums", day >= 0 ? "text-buy" : "text-sell")}>
          {formatFiat(day, "EUR")}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-[10px] uppercase tracking-wide text-subtle">Réalisé</p>
        <p className={cn("mt-1 font-mono text-lg tabular-nums", pnl >= 0 ? "text-buy" : "text-sell")}>
          {formatFiat(pnl, "EUR")}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-[10px] uppercase tracking-wide text-subtle">Non réalisé</p>
        <p className={cn("mt-1 font-mono text-lg tabular-nums", uPnl >= 0 ? "text-buy" : "text-sell")}>
          {formatFiat(uPnl, "EUR")}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-[10px] uppercase tracking-wide text-subtle">Exposition</p>
        <p className="mt-1 font-mono text-lg tabular-nums">{formatFiat(exposure, "EUR")}</p>
      </div>
      <div className="rounded-lg border border-border bg-card px-3 py-3">
        <p className="text-[10px] uppercase tracking-wide text-subtle">Drawdown</p>
        <p className={cn("mt-1 font-mono text-lg tabular-nums", desk.drawdownPct > 0 ? "text-sell" : "text-muted-foreground")}>
          {formatPct(-desk.drawdownPct)}
        </p>
      </div>
      {desk.note && (
        <div className="col-span-3 rounded-lg border border-border bg-card px-3 py-2">
          <p className="text-xs text-warning">{desk.note}</p>
        </div>
      )}
      <div className="col-span-3 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Flux {liveFeed && !stale ? "live" : stale ? "figé" : "en attente"}
          {venue === "live" ? " · réel Kraken" : " · simulation"}
        </p>
        <Badge tone={stale ? "warn" : liveFeed ? "buy" : "neutral"}>{stale ? "Figé" : liveFeed ? "OK" : "—"}</Badge>
      </div>
      {running.length > 0 && (
        <Button variant="outline" className="col-span-3" onClick={() => pauseAllBots(venue)}>
          <Square className="size-3.5" />
          Tout mettre en pause
        </Button>
      )}
      {running.length >= 2 && (
        <Button
          variant="outline"
          className="col-span-3"
          onClick={() => {
            const res = useTradingStore.getState().rebalanceAllocations(venue);
            if (!res.ok) toast.message(res.message);
          }}
        >
          <Percent className="size-3.5" />
          Réallouer le capital (perf.)
        </Button>
      )}
      {venue === "live" && mine.length > 0 && (
        confirmPanic ? (
          <ConfirmBar
            prompt="Pause tous les bots réels et vend le spot EUR ouvert."
            confirmLabel="Confirmer le stop"
            onConfirm={() => {
              panicLive();
              setConfirmPanic(false);
            }}
            onCancel={() => setConfirmPanic(false)}
          />
        ) : (
          <Button variant="sell" className="col-span-3" onClick={() => setConfirmPanic(true)}>
            <ShieldAlert className="size-3.5" />
            Stop d’urgence (pause + vendre)
          </Button>
        )
      )}
    </div>
  );
}
