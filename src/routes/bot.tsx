import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Ban,
  BadgeCheck,
  BarChart3,
  CandlestickChart,
  CircleDot,
  CirclePlus,
  Combine,
  Cloud,
  Compass,
  Copy,
  Crosshair,
  Download,
  Droplets,
  Flame,
  Gauge,
  Grip,
  Layers,
  LineChart,
  Milestone,
  Navigation,
  Pause,
  Pencil,
  Percent,
  Play,
  Radar,
  Radio,
  Repeat,
  Rocket,
  ShieldAlert,
  Split,
  Square,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/layout/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import {
  applyStressScenario,
  backtestBot,
  botBlueprint,
  botDeployed,
  botInventoryQty,
  botMark,
  BOT_CANDLE_INTERVALS,
  BOT_KIND_BY_ID,
  botWinRate,
  compareStrategies,
  DCA_INTERVALS,
  defaultParams,
  defaultSize,
  GRID_PRESETS,
  applyGridPreset,
  gridFeePadPct,
  kindNeedsCandles,
  monteCarloPnl,
  optimizeBot,
  paperEquity,
  previewSignal,
  profitDefaults,
  RISK_PRESETS,
  riskPresetFor,
  STRESS_SCENARIOS,
  walkForward,
  evaluateDesk,
  type BacktestResult,
  type OptRow,
  type StrategyScore,
  type StressScenarioId,
  type WalkForwardResult,
} from "@/lib/trading/bots";
import { fetchOhlc, fetchOhlcHistory } from "@/lib/trading/functions";
import { formatDateTime, formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { EUR_PAIRS, PAIR_BY_ID, backtestFetchInterval, intervalLabel, toEurPair } from "@/lib/trading/pairs";
import { marketSignal } from "@/lib/trading/signals";
import { downloadCsv } from "@/lib/trading/stats";
import { eurValue, useTradingStore } from "@/lib/trading/store";
import type { Bot, BotKind, BotParams, BotVenue, Candle } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bot")({ component: BotPage });

const KIND_ICON: Record<BotKind, typeof Grip> = {
  grid: Grip,
  dca: Repeat,
  rsi: Activity,
  ema: TrendingUp,
  bollinger: Waves,
  macd: BarChart3,
  stoch: Gauge,
  vwap: Milestone,
  breakout: Rocket,
  supertrend: Compass,
  volume: Volume2,
  scalp: Zap,
  cci: Crosshair,
  meanrev: Target,
  keltner: Layers,
  roc: ArrowUpRight,
  adx: Navigation,
  williams: Percent,
  ichimoku: Cloud,
  psar: CircleDot,
  sma: LineChart,
  ha: CandlestickChart,
  mfi: Droplets,
  engulf: Flame,
  obv: Radio,
  div: Split,
  confirm: BadgeCheck,
  mtf: Combine,
};

const KIND_GROUPS: { title: string; ids: BotKind[] }[] = [
  { title: "Accumulation", ids: ["grid", "dca"] },
  { title: "Reversion", ids: ["rsi", "bollinger", "stoch", "vwap", "cci", "meanrev", "keltner", "williams", "mfi", "div", "mtf"] },
  { title: "Tendance", ids: ["ema", "sma", "macd", "breakout", "supertrend", "adx", "roc", "ichimoku", "psar", "ha", "obv", "confirm"] },
  { title: "Court terme", ids: ["scalp", "volume", "engulf"] },
];

function BotPage() {
  const [venue, setVenue] = useState<BotVenue>("paper");
  const [composer, setComposer] = useState<BotKind | null>(null);
  const bots = useTradingStore((s) => s.bots);
  const paper = useTradingStore((s) => s.paper);
  const lastPair = useTradingStore((s) => s.lastPair);
  const visible = bots.filter((b) => b.venue === venue);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bots</h1>
        <p className="mt-1 text-sm text-muted-foreground">
        Automatisation spot EUR sur Kraken. Simulation avec frais, réel via tes clés API.
      </p>
      </div>

      <Cockpit venue={venue} />
      <EurRadar />
      <Lab />

      <div className="mt-4">
        <Segmented
          value={venue}
          onChange={setVenue}
          options={[
            { id: "paper", label: "Simulation" },
            { id: "live", label: "Réel" },
          ]}
        />
      </div>

      {venue === "paper" ? <PaperPanel /> : <LivePanel />}

      <section className="mt-7">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nouveau bot · paires EUR</h2>
        <div className="mt-3 space-y-5">
          {KIND_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-subtle">{group.title}</p>
              <ul className="grid grid-cols-2 gap-2">
                {group.ids.map((id) => {
                  const kind = BOT_KIND_BY_ID[id];
                  if (!kind) return null;
                  const Icon = KIND_ICON[kind.id];
                  return (
                    <li key={kind.id}>
                      <button
                        type="button"
                        onClick={() => setComposer(kind.id)}
                        className="flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors duration-150 hover:bg-muted"
                      >
                        <span className="grid size-9 place-items-center rounded-md bg-muted text-accent">
                          <Icon className="size-4" strokeWidth={1.75} />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{kind.title}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{kind.blurb}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {venue === "paper" ? "Bots papier" : "Bots réels"}
          </h2>
          <BotIo venue={venue} count={visible.length} />
        </div>
        {visible.length === 0 ? (
          <p className="mt-6 py-6 text-center text-sm text-muted-foreground">
            Aucun bot {venue === "paper" ? "en simulation" : "réel"}. Choisis une stratégie ci-dessus.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {visible.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </ul>
        )}
      </section>

      {venue === "paper" && paper.trades.length > 0 && <PaperJournal />}
      {venue === "live" && <LiveJournal />}

      {composer && (
        <Composer
          kind={composer}
          venue={venue}
          defaultPair={lastPair}
          onClose={() => setComposer(null)}
        />
      )}
    </div>
  );
}

function Cockpit({ venue }: { venue: BotVenue }) {
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

function EurRadar() {
  const tickers = useTradingStore((s) => s.tickers);
  const bots = useTradingStore((s) => s.bots);
  const rows = useMemo(() => {
    return EUR_PAIRS.map((p) => {
      const t = tickers[p.id];
      const sig = marketSignal(t);
      const n = bots.filter((b) => b.pair === p.id && b.status === "running").length;
      return { p, t, sig, n, move: Math.abs(t?.changePct ?? 0) };
    }).sort((a, b) => b.move - a.move);
  }, [tickers, bots]);
  const hot = rows.filter((r) => r.t).slice(0, 12);
  if (hot.length === 0) return null;
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Radar EUR</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Les 12 plus gros mouvements 24h. Un point = bot actif.
          </p>
        </div>
        <Radar className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-1">
        {hot.map((row) => {
          const pct = row.t?.changePct ?? 0;
          return (
            <li key={row.p.id}>
              <Link
                to="/trade/$pair"
                params={{ pair: row.p.id }}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      row.sig.bias === "buy" ? "bg-buy" : row.sig.bias === "sell" ? "bg-sell" : "bg-subtle",
                    )}
                  />
                  <span className="truncate text-xs font-medium">{row.p.displayBase}</span>
                  {row.n > 0 && <span className="size-1.5 shrink-0 rounded-full bg-accent" />}
                </span>
                <span className={cn("shrink-0 font-mono text-xs tabular-nums", pct >= 0 ? "text-buy" : "text-sell")}>
                  {formatPct(pct)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Lab() {
  const lastPair = useTradingStore((s) => s.lastPair);
  const feeRate = useTradingStore((s) => s.paper.feeRate);
  const [pair, setPair] = useState(() => {
    const p = toEurPair(lastPair);
    return EUR_PAIRS.some((x) => x.id === p) ? p : "XBTEUR";
  });
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<StrategyScore[] | null>(null);
  const [stressId, setStressId] = useState<StressScenarioId | null>(null);
  const [stressBusy, setStressBusy] = useState(false);
  const [stressRows, setStressRows] = useState<
    { id: StressScenarioId; label: string; pnlPct: number; sharpe: number; maxDd: number }[] | null
  >(null);

  const run = async () => {
    setBusy(true);
    try {
      const fetchInterval = backtestFetchInterval(days, 60);
      const since = Math.floor(Date.now() / 1000) - days * 86_400;
      const hist = await fetchOhlcHistory({ data: { pair, interval: fetchInterval, since, days } });
      if (hist.candles.length < 40) {
        toast.message("Historique trop court pour comparer");
        setRows([]);
        return;
      }
      const ranked = compareStrategies(hist.candles, feeRate, pair, 200, {
        startingBalance: 10_000,
        slippageBps: 5,
        interval: hist.interval,
        requestedDays: days,
      });
      setRows(ranked);
      if (!ranked.length) toast.message("Aucune stratégie n’a clôturé de trade");
    } catch {
      toast.message("Historique Kraken indisponible");
    } finally {
      setBusy(false);
    }
  };

  const runStress = async (id: StressScenarioId) => {
    setStressBusy(true);
    setStressId(id);
    try {
      const fetchInterval = backtestFetchInterval(days, 60);
      const since = Math.floor(Date.now() / 1000) - days * 86_400;
      const hist = await fetchOhlcHistory({ data: { pair, interval: fetchInterval, since, days } });
      if (hist.candles.length < 40) {
        toast.message("Historique trop court pour le stress");
        return;
      }
      const stressed = applyStressScenario(hist.candles, id);
      const kinds = ["rsi", "ema", "confirm", "mtf", "bollinger"] as const;
      const out: { id: StressScenarioId; label: string; pnlPct: number; sharpe: number; maxDd: number }[] = [];
      for (const kind of kinds) {
        const params = defaultParams(kind, stressed[stressed.length - 1]?.close ?? 100);
        const result = backtestBot(kind, params, 200, stressed, feeRate, pair, {
          startingBalance: 10_000,
          slippageBps: 5,
          interval: hist.interval,
          requestedDays: days,
        });
        if (!result) continue;
        out.push({
          id,
          label: BOT_KIND_BY_ID[kind]?.title ?? kind,
          pnlPct: result.pnlPct,
          sharpe: result.sharpe,
          maxDd: result.maxDrawdownPct,
        });
      }
      out.sort((a, b) => b.sharpe - a.sharpe);
      setStressRows(out);
      if (!out.length) toast.message("Aucun résultat sous stress");
    } catch {
      toast.message("Stress test indisponible");
    } finally {
      setStressBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Laboratoire</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Backtest les stratégies sur la même fenêtre, classées par Calmar. Scénarios de stress optionnels.
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Paire">
          <select
            value={pair}
            onChange={(e) => {
              setPair(e.target.value);
              setRows(null);
              setStressRows(null);
            }}
            className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {EUR_PAIRS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fenêtre">
          <div className="flex flex-wrap gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDays(d);
                  setRows(null);
                  setStressRows(null);
                }}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  days === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {d} j
              </button>
            ))}
          </div>
        </Field>
      </div>
      <Button type="button" variant="outline" className="mt-3 w-full" disabled={busy} onClick={() => void run()}>
        {busy ? "Comparaison…" : "Comparer les stratégies"}
      </Button>
      {rows && rows.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rows.slice(0, 8).map((row, i) => (
            <li key={row.kind} className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs">
              <span className="min-w-0 truncate">
                <span className="font-mono tabular-nums text-subtle">{i + 1}.</span> {row.title}
              </span>
              <span className={cn("shrink-0 font-mono tabular-nums", row.result.pnl >= 0 ? "text-buy" : "text-sell")}>
                {formatPct(row.result.pnlPct)} · {row.result.sharpe.toFixed(1)}σ
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs font-medium text-muted-foreground">Stress (série OHLC modifiée)</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {STRESS_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={stressBusy}
              onClick={() => void runStress(s.id)}
              className={cn(
                "h-8 rounded-full px-3 text-[11px] font-medium",
                stressId === s.id && stressRows
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {stressBusy && stressId === s.id ? "…" : s.label}
            </button>
          ))}
        </div>
        {stressRows && stressRows.length > 0 && (
          <ul className="mt-2 space-y-1">
            {stressRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs">
                <span className="truncate">{row.label}</span>
                <span className={cn("font-mono tabular-nums", row.pnlPct >= 0 ? "text-buy" : "text-sell")}>
                  {formatPct(row.pnlPct)} · DD {formatPct(row.maxDd)} · {row.sharpe.toFixed(1)}σ
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


function LivePanel() {
  const connection = useTradingStore((s) => s.connection);
  const setConnection = useTradingStore((s) => s.setConnection);
  const syncKraken = useTradingStore((s) => s.syncKraken);
  const pauseAllBots = useTradingStore((s) => s.pauseAllBots);
  const krakenEur = useTradingStore((s) => s.krakenEur);
  const krakenBalances = useTradingStore((s) => s.krakenBalances);
  const krakenError = useTradingStore((s) => s.krakenError);
  const krakenSyncAt = useTradingStore((s) => s.krakenSyncAt);
  const [apiKey, setApiKey] = useState(connection.apiKey);
  const [apiSecret, setApiSecret] = useState(connection.apiSecret);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setApiKey(connection.apiKey);
    setApiSecret(connection.apiSecret);
  }, [connection.apiKey, connection.apiSecret]);

  const save = () => setConnection({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() });

  const test = async () => {
    save();
    setBusy(true);
    await syncKraken();
    setBusy(false);
  };

  const holdings = Object.entries(krakenBalances).filter(([a, q]) => a !== "EUR" && q > 0).slice(0, 6);

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Solde Kraken (EUR)</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">
            {formatFiat(krakenEur, "EUR")}
          </p>
          {krakenSyncAt > 0 && (
            <p className="mt-1 text-xs text-subtle">Sync {formatDateTime(krakenSyncAt)}</p>
          )}
        </div>
        <Badge tone={connection.testOk ? "buy" : "warn"}>{connection.testOk ? "Clés OK" : "Hors ligne"}</Badge>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Clé publique et clé privée Kraken (Spot). Droits : Query funds + Create & modify orders. Les clés restent
        sur cet appareil.
      </p>
      <div className="mt-3 space-y-2">
        <Field label="Clé publique (API Key)">
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Clé privée (API Secret)">
          <Input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            autoComplete="off"
          />
        </Field>
      </div>
      {krakenError && <p className="mt-2 text-xs text-sell">{krakenError}</p>}
      {holdings.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {holdings.map(([asset, qty]) => (
            <li key={asset} className="flex justify-between">
              <span>{asset}</span>
              <span className="font-mono tabular-nums">{formatQty(qty, 6)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => void test()} disabled={busy}>
          {busy ? "Test…" : "Tester Kraken"}
        </Button>
        <Button variant="sell" onClick={() => pauseAllBots("live")}>
          <Square className="size-3.5" />
          Stop réel
        </Button>
      </div>
      <Link to="/connect" className="mt-2 block text-center text-xs text-accent">
        Page connexion complète
      </Link>
      <p className="mt-3 text-[11px] leading-relaxed text-subtle">
        Les bots réels envoient des ordres marché spot EUR. Un timeout Kraken met le bot en pause (pas de double ordre). Le garde-fou flux est dans Paramètres. Par défaut ils se mettent en pause au rechargement.
      </p>
    </div>
  );
}

function PaperPanel() {
  const paper = useTradingStore((s) => s.paper);
  const tickers = useTradingStore((s) => s.tickers);
  const setPaperStart = useTradingStore((s) => s.setPaperStart);
  const setPaperFee = useTradingStore((s) => s.setPaperFee);
  const resetPaper = useTradingStore((s) => s.resetPaper);
  const flattenPaperPositions = useTradingStore((s) => s.flattenPaperPositions);
  const [start, setStart] = useState(String(paper.startingBalance));
  const [feePct, setFeePct] = useState((paper.feeRate * 100).toFixed(2));
  const [confirmReset, setConfirmReset] = useState(false);
  const holdings = Object.entries(paper.holdings ?? {}).filter(([, h]) => h.qty > 0);
  const marked = holdings.reduce((s, [asset, h]) => s + eurValue(asset, h.qty, tickers), 0);
  const equity = paper.cash + marked;
  const pnl = equity - paper.startingBalance;
  const pnlPct = paper.startingBalance ? (pnl / paper.startingBalance) * 100 : 0;

  useEffect(() => {
    setStart(String(paper.startingBalance));
    setFeePct((paper.feeRate * 100).toFixed(2));
  }, [paper.startingBalance, paper.feeRate]);

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Équité simulation (EUR)</p>
          <p className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">
            {formatFiat(equity, "EUR")}
          </p>
          <p className={cn("mt-1 font-mono text-sm tabular-nums", pnl >= 0 ? "text-buy" : "text-sell")}>
            {pnl >= 0 ? "+" : ""}
            {formatFiat(pnl, "EUR")} · {formatPct(pnlPct)}
          </p>
        </div>
        <Spark points={paper.equityCurve.map((p) => p.v)} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Cash" value={formatFiat(paper.cash, "EUR")} />
        <Stat label="Frais payés" value={formatFiat(paper.feesPaid, "EUR")} />
        <Stat
          label="Réalisé"
          value={formatFiat(paper.realizedPnl, "EUR")}
          tone={paper.realizedPnl >= 0 ? "buy" : "sell"}
        />
      </div>

      {holdings.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
          {holdings.map(([asset, h]) => (
            <li key={asset} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {asset} · {formatQty(h.qty, 6)} @ {formatFiat(h.avg, "EUR")}
              </span>
              <span className="font-mono tabular-nums">{formatFiat(eurValue(asset, h.qty, tickers), "EUR")}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Field label="Solde de départ (EUR)">
          <Input
            aria-label="Solde de départ (EUR)"
            inputMode="decimal"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="font-mono tabular-nums"
          />
        </Field>
        <Field label="Frais taker (%)">
          <Input
            aria-label="Frais taker (%)"
            inputMode="decimal"
            value={feePct}
            onChange={(e) => setFeePct(e.target.value)}
            className="font-mono tabular-nums"
          />
        </Field>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-subtle">
        Chaque ordre marché prélève ce taux à l’achat et à la vente. Round-trip ≈{" "}
        {(Number(feePct) * 2 || 0).toFixed(2)} %. Paires EUR uniquement.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const n = Number(start);
            const f = Number(feePct) / 100;
            if (Number.isFinite(f)) setPaperFee(f);
            if (n !== paper.startingBalance) setPaperStart(n);
          }}
        >
          Appliquer
        </Button>
        <Button variant="secondary" onClick={flattenPaperPositions}>
          Tout vendre
        </Button>
      </div>
      <Button variant="ghost" className="mt-1 w-full" onClick={() => useTradingStore.getState().pauseAllBots("paper")}>
        Pause des bots papier
      </Button>
      {confirmReset ? (
        <ConfirmBar
          prompt="Efface cash, lots et stats des bots papier."
          confirmLabel="Réinitialiser"
          onConfirm={() => {
            resetPaper();
            setConfirmReset(false);
          }}
          onCancel={() => setConfirmReset(false)}
        />
      ) : (
        <Button variant="ghost" className="mt-1 w-full" onClick={() => setConfirmReset(true)}>
          Réinitialiser la simulation
        </Button>
      )}
    </div>
  );
}

function PaperJournal() {
  const trades = useTradingStore((s) => s.paper.trades);
  const exportCsv = () => {
    downloadCsv("nautilus-bots-eur.csv", [
      ["time", "pair", "side", "amount", "price", "fee", "pnl", "note"],
      ...trades.map((t) => [
        new Date(t.time).toISOString(),
        PAIR_BY_ID[t.pair]?.display ?? t.pair,
        t.side,
        String(t.amount),
        String(t.price),
        String(t.fee),
        String(t.pnl),
        t.note,
      ]),
    ]);
  };
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Journal papier</h2>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
        {trades.slice(0, 24).map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                  {t.side === "buy" ? "Achat" : "Vente"}
                </span>{" "}
                {PAIR_BY_ID[t.pair]?.display ?? t.pair}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.note} · frais {formatFiat(t.fee, "EUR")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatDateTime(t.time)}</p>
              {t.side === "sell" && (
                <p className={cn("font-mono text-xs tabular-nums", t.pnl >= 0 ? "text-buy" : "text-sell")}>
                  {t.pnl >= 0 ? "+" : ""}
                  {formatFiat(t.pnl, "EUR")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LiveJournal() {
  const fills = useTradingStore((s) => s.liveFills);
  if (fills.length === 0) return null;
  const exportCsv = () => {
    downloadCsv("nautilus-bots-live-eur.csv", [
      ["time", "pair", "side", "amount", "price", "fee", "pnl", "txid", "note"],
      ...fills.map((t) => [
        new Date(t.time).toISOString(),
        PAIR_BY_ID[t.pair]?.display ?? t.pair,
        t.side,
        String(t.amount),
        String(t.price),
        String(t.fee),
        String(t.pnl),
        t.txid ?? "",
        t.note,
      ]),
    ]);
  };
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Journal réel Kraken</h2>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
        {fills.slice(0, 24).map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                  {t.side === "buy" ? "Achat" : "Vente"}
                </span>{" "}
                {PAIR_BY_ID[t.pair]?.display ?? t.pair}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.note} · frais {formatFiat(t.fee, "EUR")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatDateTime(t.time)}</p>
              {t.side === "sell" && (
                <p className={cn("font-mono text-xs tabular-nums", t.pnl >= 0 ? "text-buy" : "text-sell")}>
                  {t.pnl >= 0 ? "+" : ""}
                  {formatFiat(t.pnl, "EUR")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "buy" | "sell" }) {
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

function Spark({ points, empty = "badge" }: { points: number[]; empty?: "badge" | "none" }) {
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

function BotIo({ venue, count }: { venue: BotVenue; count: number }) {
  const bots = useTradingStore((s) => s.bots);
  const importBots = useTradingStore((s) => s.importBots);
  const inputRef = useRef<HTMLInputElement>(null);
  const mine = bots.filter((b) => b.venue === venue);

  const exportMine = () => {
    const payload = { v: 1, bots: mine.map(botBlueprint) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nautilus-bots-${venue}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.message(`${mine.length} bot${mine.length > 1 ? "s" : ""} exporté${mine.length > 1 ? "s" : ""}`);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-xs text-subtle">{count}</span>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          void file.text().then((text) => {
            try {
              const res = importBots(JSON.parse(text));
              toast.message(res.message);
            } catch {
              toast.message("Fichier JSON illisible");
            }
          });
        }}
      />
      <Button size="sm" variant="ghost" onClick={exportMine} disabled={mine.length === 0} aria-label="Exporter">
        <Download className="size-3.5" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()} aria-label="Importer">
        <Upload className="size-3.5" />
      </Button>
    </div>
  );
}

function BotCard({ bot }: { bot: Bot }) {
  const startBot = useTradingStore((s) => s.startBot);
  const pauseBot = useTradingStore((s) => s.pauseBot);
  const removeBot = useTradingStore((s) => s.removeBot);
  const duplicateBot = useTradingStore((s) => s.duplicateBot);
  const toggleBuyPause = useTradingStore((s) => s.toggleBuyPause);
  const seedGrid = useTradingStore((s) => s.seedGrid);
  const ticker = useTradingStore((s) => s.tickers[bot.pair]);
  const paperFee = useTradingStore((s) => s.paper.feeRate);
  const liveFee = useTradingStore((s) => s.settings.takerFee);
  const connection = useTradingStore((s) => s.connection);
  const paperTrades = useTradingStore((s) => s.paper.trades);
  const liveFills = useTradingStore((s) => s.liveFills);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = KIND_ICON[bot.kind] ?? Grip;
  const meta = PAIR_BY_ID[bot.pair];
  const running = bot.status === "running";
  const winRate = botWinRate(bot.stats);
  const mark = botMark(bot.runtime, ticker?.last ?? 0);
  const uPnl = mark.unrealized;
  const sparkPts = useMemo(() => {
    const rows = (bot.venue === "paper" ? paperTrades : liveFills).filter((t) => t.botId === bot.id);
    const pts: number[] = [0];
    let acc = 0;
    for (const t of [...rows].reverse()) {
      if (t.side !== "sell") continue;
      acc += t.pnl;
      pts.push(acc);
    }
    return pts;
  }, [bot.id, bot.venue, paperTrades, liveFills]);

  const launch = () => {
    const res = startBot(bot.id);
    if (!res.ok) toast.message(res.message);
  };

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-accent">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{bot.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {meta?.display ?? bot.pair} · {formatFiat(bot.sizeQuote, "EUR")} / ordre
              {ticker ? ` · ${formatQty(ticker.last, meta?.pairDecimals ?? 2)}` : ""}
              {kindNeedsCandles(bot.kind) ? ` · ${intervalLabel(bot.interval)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tone={running ? "buy" : bot.status === "error" ? "sell" : "neutral"}>
            {bot.runtime.inFlight
              ? "Envoi…"
              : running
                ? bot.runtime.buyPause
                  ? "Vente seule"
                  : "Actif"
                : bot.status === "paused"
                  ? "Pause"
                  : bot.status === "error"
                    ? "Erreur"
                    : "Arrêté"}
          </Badge>
          <Spark points={sparkPts} empty="none" />
        </div>
      </button>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{bot.lastNote}</p>
      {bot.kind === "grid" && (
        <GridStatus bot={bot} last={ticker?.last} feeRate={bot.venue === "live" ? liveFee : paperFee} />
      )}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Trades" value={String(bot.stats.trades)} />
        <Stat label="Frais" value={formatFiat(bot.stats.feesPaid, "EUR")} />
        <Stat
          label="PnL"
          value={formatFiat(bot.stats.realizedPnl, "EUR")}
          tone={bot.stats.realizedPnl >= 0 ? "buy" : "sell"}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Stat label="Win rate" value={bot.stats.closes ? `${Math.round(winRate)} %` : "—"} />
        <Stat
          label="Non réalisé"
          value={formatFiat(uPnl, "EUR")}
          tone={uPnl > 0 ? "buy" : uPnl < 0 ? "sell" : undefined}
        />
        <Stat label="Jour" value={formatFiat(bot.runtime.dayPnl ?? 0, "EUR")} tone={(bot.runtime.dayPnl ?? 0) >= 0 ? "buy" : "sell"} />
      </div>
      {bot.venue === "live" && !connection.apiKey && (
        <p className="mt-2 text-xs text-warning">Clés Kraken requises pour lancer.</p>
      )}
      {confirmDelete ? (
        <ConfirmBar
          prompt="Supprimer ce bot et son journal local."
          confirmLabel="Supprimer"
          onConfirm={() => {
            removeBot(bot.id);
            setConfirmDelete(false);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : (
        <div className="mt-3 flex gap-2">
          {running ? (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => pauseBot(bot.id)}>
              <Pause className="size-3.5" />
              Pause
            </Button>
          ) : (
            <Button size="sm" variant="buy" className="flex-1" onClick={launch}>
              <Play className="size-3.5" />
              Lancer
            </Button>
          )}
          {bot.kind === "grid" && running && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleBuyPause(bot.id)}
              aria-label={bot.runtime.buyPause ? "Reprendre les achats" : "Pause achats"}
            >
              <Ban className="size-3.5" />
            </Button>
          )}
          {bot.kind === "grid" && running && !(bot.runtime.gridOwned ?? []).some((g) => g.qty > 0) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const res = seedGrid(bot.id);
                toast.message(res.message);
              }}
              aria-label="Prendre le premier lot"
            >
              <CirclePlus className="size-3.5" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)} aria-label="Détail">
            <Pencil className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => duplicateBot(bot.id)} aria-label="Dupliquer">
            <Copy className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} aria-label="Supprimer">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
      {open && <BotDetail botId={bot.id} onClose={() => setOpen(false)} />}
    </li>
  );
}

function Composer({
  kind,
  venue,
  defaultPair,
  onClose,
}: {
  kind: BotKind;
  venue: BotVenue;
  defaultPair: string;
  onClose: () => void;
}) {
  const createBot = useTradingStore((s) => s.createBot);
  const startBot = useTradingStore((s) => s.startBot);
  const feeRate = useTradingStore((s) => s.paper.feeRate);
  const hasKeys = useTradingStore((s) => Boolean(s.connection.apiKey && s.connection.apiSecret));
  const info = BOT_KIND_BY_ID[kind]!;
  const initialPair = toEurPair(defaultPair);
  const [pair, setPair] = useState(EUR_PAIRS.some((p) => p.id === initialPair) ? initialPair : "XBTEUR");
  const pairLast = useTradingStore((s) => s.tickers[pair]?.last ?? 0);
  const ticker = useTradingStore((s) => s.tickers[pair]);
  const [name, setName] = useState("");
  const [size, setSize] = useState(String(defaultSize(kind)));
  const [interval, setIntervalId] = useState(60);
  const [params, setParams] = useState<BotParams>(() => defaultParams(kind, pairLast || 100));
  const [busy, setBusy] = useState(false);
  const [bt, setBt] = useState<BacktestResult | null>(null);
  const [btBusy, setBtBusy] = useState(false);
  const [btDays, setBtDays] = useState(30);
  const [btCapital, setBtCapital] = useState("10000");
  const [btSlip, setBtSlip] = useState("5");
  const [preview, setPreview] = useState<{ note: string; side: "buy" | "sell" | "hold" } | null>(null);
  const [opt, setOpt] = useState<OptRow[] | null>(null);
  const [optBusy, setOptBusy] = useState(false);
  const [wf, setWf] = useState<WalkForwardResult | null>(null);
  const [wfBusy, setWfBusy] = useState(false);
  const histRef = useRef<Candle[] | null>(null);
  const previewCandles = useRef<Candle[] | null>(null);
  const seeded = useRef(pairLast > 0);

  useEffect(() => {
    if (kind !== "grid" || seeded.current || !(pairLast > 0)) return;
    setParams((p) => ({ ...defaultParams("grid", pairLast), slPct: p.slPct, tpPct: p.tpPct, cooldownSec: p.cooldownSec }));
    seeded.current = true;
  }, [kind, pairLast]);

  const patch = (p: Partial<BotParams>) => setParams((prev) => ({ ...prev, ...p }));

  useEffect(() => {
    let cancelled = false;
    if (!kindNeedsCandles(kind)) {
      setPreview(null);
      return;
    }
    fetchOhlc({ data: { pair, interval } })
      .then((rows) => {
        if (cancelled) return;
        previewCandles.current = rows;
        const t = useTradingStore.getState().tickers[pair];
        if (!t) return;
        const n = Number(size);
        setPreview(previewSignal(kind, params, n > 0 ? n : 100, { now: Date.now(), ticker: t, candles: rows, equity: 10_000 }, pair));
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [kind, pair, interval]);

  useEffect(() => {
    const rows = previewCandles.current;
    const t = ticker;
    if (!rows || !t || !kindNeedsCandles(kind)) return;
    const n = Number(size);
    setPreview(previewSignal(kind, params, n > 0 ? n : 100, { now: Date.now(), ticker: t, candles: rows, equity: 10_000 }, pair));
  }, [kind, params, size, ticker, pair]);

  const saveBot = (launch: boolean) => {
    const n = Number(size);
    if (!(n > 0)) return;
    if (venue === "live" && !hasKeys) return;
    const stacked = useTradingStore.getState().bots.filter((b) => b.venue === venue && b.pair === pair && b.status === "running").length;
    setBusy(true);
    const bot = createBot({
      kind,
      venue,
      pair,
      interval,
      sizeQuote: n,
      name: name.trim() || undefined,
      params: {
        ...params,
        cooldownSec: params.cooldownSec ?? (venue === "live" ? 20 : 0),
        maxSpreadPct: params.maxSpreadPct ?? (venue === "live" ? 0.35 : 0),
      },
    });
    if (launch) {
      const res = startBot(bot.id);
      if (!res.ok) toast.message(res.message);
      else if (stacked > 0) toast.message(`${stacked + 1} bots actifs sur ${PAIR_BY_ID[pair]?.display ?? pair}`);
    } else {
      toast.message(stacked > 0 ? `Bot créé · ${stacked} déjà actif${stacked > 1 ? "s" : ""} sur cette paire` : "Bot créé à l’arrêt");
    }
    setBusy(false);
    onClose();
  };

  const runBacktest = async () => {
    setBtBusy(true);
    try {
      const fetchInterval = backtestFetchInterval(btDays, interval);
      if (fetchInterval !== interval) setIntervalId(fetchInterval);
      const since = Math.floor(Date.now() / 1000) - btDays * 86_400;
      const hist = await fetchOhlcHistory({ data: { pair, interval: fetchInterval, since, days: btDays } });
      const candles: Candle[] = hist.candles;
      const used = hist.interval;
      const n = Number(size);
      const capital = Number(btCapital);
      const slip = Number(btSlip);
      if (candles.length < 30) {
        setBt(null);
        toast.message("Historique trop court pour ce backtest");
        return;
      }
      const result = backtestBot(kind, params, n > 0 ? n : 100, candles, feeRate, pair, {
        startingBalance: capital > 0 ? capital : 10_000,
        slippageBps: Number.isFinite(slip) ? slip : 0,
        interval: used,
        requestedDays: btDays,
      });
      histRef.current = candles;
      setBt(result);
      setOpt(null);
      setWf(null);
      if (!result) toast.message("Pas assez de barres pour cette stratégie");
    } catch {
      setBt(null);
      toast.message("Historique Kraken indisponible");
    } finally {
      setBtBusy(false);
    }
  };

  return (
    <Sheet title={info.title} onClose={onClose}>
      <form
        className="space-y-3 px-4 pb-6 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveBot(true);
        }}
      >
        <p className="text-sm text-muted-foreground">{info.blurb}</p>
        {pairLast > 0 && (
          <p className="font-mono text-xs tabular-nums text-subtle">Dernier prix {formatQty(pairLast, 6)} EUR</p>
        )}
        {preview && (
          <p
            className={cn(
              "rounded-md px-3 py-2 text-xs leading-relaxed",
              preview.side === "buy" ? "bg-buy/15 text-buy" : preview.side === "sell" ? "bg-sell/15 text-sell" : "bg-muted text-muted-foreground",
            )}
          >
            Maintenant : {preview.side === "buy" ? "signal achat" : preview.side === "sell" ? "signal vente" : "pas de signal"} — {preview.note}
          </p>
        )}
        <Field label="Nom">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${info.title} ${PAIR_BY_ID[pair]?.display ?? pair}`} />
        </Field>
        <Field label="Paire EUR">
          <select
            value={pair}
            onChange={(e) => {
              setPair(e.target.value);
              setBt(null);
              if (kind === "grid") {
                const px = useTradingStore.getState().tickers[e.target.value]?.last ?? pairLast;
                setParams((p) => ({ ...defaultParams("grid", px || 100), slPct: p.slPct, tpPct: p.tpPct }));
              }
            }}
            className="h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {EUR_PAIRS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Taille par ordre (EUR)">
          <Input inputMode="decimal" value={size} onChange={(e) => setSize(e.target.value)} className="font-mono tabular-nums" />
        </Field>

        <KindParamsFields
          kind={kind}
          params={params}
          patch={patch}
          last={pairLast || 100}
          sizeQuote={Number(size) || defaultSize(kind)}
          feeRate={feeRate}
        />

        {info.needsCandles && (
          <Field label="Unité de temps">
            <div className="flex flex-wrap gap-1">
              {BOT_CANDLE_INTERVALS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setIntervalId(c.id);
                    setBt(null);
                  }}
                  className={cn(
                    "h-9 rounded-full px-3 text-xs font-medium",
                    interval === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="Profil de risque">
          <div className="flex flex-wrap gap-1">
            {RISK_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => patch(riskPresetFor(kind, p))}
                className="h-9 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
        {kind !== "grid" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <NumField label="SL %" value={params.slPct ?? 0} onChange={(v) => patch({ slPct: v })} />
              <NumField label="TP %" value={params.tpPct ?? 0} onChange={(v) => patch({ tpPct: v })} />
              <NumField label="Trailing %" value={params.trailingPct ?? 0} onChange={(v) => patch({ trailingPct: v })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="Filtre EMA tendance" value={params.trendEma ?? 0} onChange={(v) => patch({ trendEma: v })} />
              <NumField label="Stop ATR ×" value={params.slAtr ?? 0} onChange={(v) => patch({ slAtr: v })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="TP partiel %" value={params.partialTp ?? 0} onChange={(v) => patch({ partialTp: v })} />
              <NumField label="Max hold (min)" value={params.maxHoldMin ?? 0} onChange={(v) => patch({ maxHoldMin: v })} />
            </div>
          </>
        )}
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Session UTC début" value={params.sessionStart ?? 0} onChange={(v) => patch({ sessionStart: v })} />
          <NumField label="Session UTC fin" value={params.sessionEnd ?? 0} onChange={(v) => patch({ sessionEnd: v })} />
        </div>
        {kind !== "grid" && kind !== "dca" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="ADX max" value={params.adxCeil ?? 0} onChange={(v) => patch({ adxCeil: v })} />
              <NumField label="ADX min" value={params.adxFloor ?? 0} onChange={(v) => patch({ adxFloor: v })} />
              <NumField label="Krach %" value={params.crashPct ?? 0} onChange={(v) => patch({ crashPct: v })} />
              <NumField label="Verrou %" value={params.beAfterPct ?? 0} onChange={(v) => patch({ beAfterPct: v })} />
            </div>
            <p className="text-[11px] leading-relaxed text-subtle">
              Profil gain déjà actif sur un nouveau bot. ADX max bloque la réversion en tendance forte, ADX min ignore le
              range pour le suivi. Krach : pas d’achat de réversion si la bougie chute de ce %. Verrou : dès ce gain, le
              stop remonte au prix d’achat plus les frais. Un TP plus petit que l’aller-retour de frais est relevé. 0 = off.
              Rien ici ne garantit un bénéfice.
            </p>
          </>
        )}
        {kind !== "grid" && (
          <p className="text-[11px] leading-relaxed text-subtle">
            Filtre EMA : n’achète que si le prix est au-dessus de l’EMA. Stop ATR : clôture si le prix recule de N × ATR.
            Le trailing ne s’arme qu’une fois le gain au moins égal au trailing. TP partiel vend ce % puis laisse courir.
            Session 0/0 = 24h. Hold max force la sortie. 0 = off.
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Pause s" value={params.cooldownSec ?? (venue === "live" ? 20 : 0)} onChange={(v) => patch({ cooldownSec: v })} />
          <NumField label="Spread max %" value={params.maxSpreadPct ?? (venue === "live" ? 0.35 : 0)} onChange={(v) => patch({ maxSpreadPct: v })} />
          <NumField label="% équité / ordre" value={params.sizePct ?? 0} onChange={(v) => patch({ sizePct: v })} />
        </div>
        <NumField label="Risque ATR % équité" value={params.atrRiskPct ?? 0} onChange={(v) => patch({ atrRiskPct: v })} />
        <p className="text-[11px] leading-relaxed text-subtle">
          Risque ATR : taille = (équité × %) / ATR. Prioritaire sur le % d’équité fixe.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Perte max / jour (EUR)" value={params.maxDailyLoss ?? 0} onChange={(v) => patch({ maxDailyLoss: v })} />
          <NumField label="Trades max / jour" value={params.maxTradesDay ?? 0} onChange={(v) => patch({ maxTradesDay: v })} />
        </div>
        <NumField label="Stop après N pertes d’affilée" value={params.maxConsecutiveLoss ?? 0} onChange={(v) => patch({ maxConsecutiveLoss: v })} />
        <p className="text-[11px] leading-relaxed text-subtle">
          0 = désactivé. Le pourcentage d’équité remplace la taille fixe dès qu’il est positif.
        </p>

        <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-3">
          <p className="text-xs font-medium text-foreground">Backtest</p>
          <Field label="Fenêtre">
            <div className="flex flex-wrap gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setBtDays(d);
                    setBt(null);
                    setOpt(null);
                  }}
                  className={cn(
                    "h-9 rounded-full px-3 text-xs font-medium",
                    btDays === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {d} j
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-subtle">
              Kraken ne livre que ~720 bougies. {intervalLabel(backtestFetchInterval(btDays, interval))} pour {btDays} j
              (15 m ≈ 7 j, 1 h ≈ 30 j, 4 h ≈ 90 j).
            </p>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Capital (EUR)">
              <Input
                inputMode="decimal"
                value={btCapital}
                onChange={(e) => setBtCapital(e.target.value)}
                className="font-mono tabular-nums"
              />
            </Field>
            <Field label="Slippage (bps)">
              <Input
                inputMode="decimal"
                value={btSlip}
                onChange={(e) => setBtSlip(e.target.value)}
                className="font-mono tabular-nums"
              />
            </Field>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={() => void runBacktest()} disabled={btBusy}>
            {btBusy ? "Backtest…" : "Lancer le backtest"}
          </Button>
          {bt && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={optBusy || !histRef.current}
              onClick={() => {
                const candles = histRef.current;
                if (!candles) return;
                setOptBusy(true);
                try {
                  const n = Number(size);
                  const rows = optimizeBot(kind, params, n > 0 ? n : 100, candles, feeRate, pair, {
                    startingBalance: Number(btCapital) > 0 ? Number(btCapital) : 10_000,
                    slippageBps: Number(btSlip) || 0,
                    interval: bt.interval,
                    requestedDays: btDays,
                  });
                  setOpt(rows);
                  if (!rows.length) toast.message("Pas assez de trades pour comparer");
                } finally {
                  setOptBusy(false);
                }
              }}
            >
              {optBusy ? "Optimisation…" : "Optimiser les paramètres"}
            </Button>
          )}
          {opt && opt.length > 0 && (
            <ul className="space-y-1.5">
              {opt.map((row) => (
                <li key={row.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setParams(row.params);
                      setBt(row.result);
                    }}
                    className="flex w-full items-center justify-between rounded-md bg-background px-3 py-2 text-left text-xs"
                  >
                    <span>{row.label}</span>
                    <span className={row.result.pnl >= 0 ? "text-buy" : "text-sell"}>
                      {formatPct(row.result.pnlPct)} · DD {row.result.maxDrawdownPct.toFixed(0)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {bt && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={wfBusy || !histRef.current}
              onClick={() => {
                const candles = histRef.current;
                if (!candles) return;
                setWfBusy(true);
                try {
                  const n = Number(size);
                  setWf(
                    walkForward(kind, params, n > 0 ? n : 100, candles, feeRate, pair, {
                      startingBalance: Number(btCapital) > 0 ? Number(btCapital) : 10_000,
                      slippageBps: Number(btSlip) || 0,
                      interval: bt.interval,
                      requestedDays: btDays,
                    }),
                  );
                } finally {
                  setWfBusy(false);
                }
              }}
            >
              {wfBusy ? "Walk-forward…" : "Validation walk-forward (70/30)"}
            </Button>
          )}
          {wf && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-background px-3 py-2">
                <p className="text-subtle">In-sample</p>
                <p className={cn("mt-1 font-mono tabular-nums", (wf.inSample?.pnl ?? 0) >= 0 ? "text-buy" : "text-sell")}>
                  {wf.inSample ? formatPct(wf.inSample.pnlPct) : "—"}
                </p>
              </div>
              <div className="rounded-md bg-background px-3 py-2">
                <p className="text-subtle">Out-of-sample</p>
                <p className={cn("mt-1 font-mono tabular-nums", (wf.outSample?.pnl ?? 0) >= 0 ? "text-buy" : "text-sell")}>
                  {wf.outSample ? formatPct(wf.outSample.pnlPct) : "—"}
                </p>
              </div>
            </div>
          )}
          {bt && <BacktestReport result={bt} pair={pair} />}
        </div>

        <p className="text-xs text-muted-foreground">
          Mode :{" "}
          <span className="text-foreground">
            {venue === "paper" ? "simulation EUR, frais inclus" : "réel Kraken (clés API)"}
          </span>
        </p>
        {venue === "live" && !hasKeys && (
          <p className="text-xs text-sell">Enregistre tes clés Kraken dans le panneau Réel avant de lancer.</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" disabled={busy || (venue === "live" && !hasKeys)} onClick={() => saveBot(false)}>
            Créer
          </Button>
          <Button type="submit" disabled={busy || (venue === "live" && !hasKeys)}>
            Créer et lancer
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function BacktestReport({ result, pair }: { result: BacktestResult; pair: string }) {
  const better = result.pnl >= result.buyHoldPnl;
  const mc = useMemo(
    () => monteCarloPnl(result.tradeLog.filter((t) => t.side === "sell").map((t) => t.pnl), result.startEquity),
    [result],
  );
  const exportCsv = () => {
    downloadCsv(`nautilus-backtest-${pair}.csv`, [
      ["time", "side", "price", "pnl", "note"],
      ...result.tradeLog.map((t) => [
        new Date(t.time).toISOString(),
        t.side,
        String(t.price),
        String(t.pnl),
        t.note,
      ]),
    ]);
  };
  const from = result.from ? new Date(result.from * 1000).toLocaleDateString("fr-FR") : "—";
  const to = result.to ? new Date(result.to * 1000).toLocaleDateString("fr-FR") : "—";
  const spanDays = result.from && result.to ? Math.max(1, Math.round((result.to - result.from) / 86_400)) : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {from} → {to} · {spanDays} j · {intervalLabel(result.interval)} · {result.bars} barres
          </p>
          <p className={cn("mt-1 font-mono text-lg tabular-nums", result.pnl >= 0 ? "text-buy" : "text-sell")}>
            {result.pnl >= 0 ? "+" : ""}
            {formatFiat(result.pnl, "EUR")} · {formatPct(result.pnlPct)}
          </p>
        </div>
        <Spark points={result.equityCurve.map((p) => p.v)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Trades" value={String(result.trades)} />
        <Stat label="Win rate" value={`${result.winRate.toFixed(0)} %`} />
        <Stat label="Facteur" value={result.profitFactor.toFixed(2)} />
        <Stat label="Drawdown" value={formatPct(-result.maxDrawdownPct)} tone="sell" />
        <Stat label="Frais" value={formatFiat(result.fees, "EUR")} />
        <Stat label="Calmar" value={result.calmar.toFixed(2)} />
        <Stat label="Sharpe" value={result.sharpe.toFixed(2)} />
        <Stat label="Sortino" value={result.sortino.toFixed(2)} />
        <Stat label="Hold moy." value={`${result.avgHoldMin.toFixed(0)} min`} />
      </div>
      <p className="text-xs text-muted-foreground">
        Buy & hold {formatPct(result.buyHoldPct)} ({formatFiat(result.buyHoldPnl, "EUR")}) · le bot{" "}
        <span className={better ? "text-buy" : "text-sell"}>{better ? "surperforme" : "sous-performe"}</span>
        {" · "}
        espérance {formatFiat(result.expectancy, "EUR")} / vente
        {result.openQty > 0 ? ` · position ouverte ${formatQty(result.openQty, 6)}` : ""}
      </p>
      {mc && (
        <p className="text-xs text-muted-foreground">
          Monte Carlo {mc.samples} mélanges · p5 {formatFiat(mc.p5, "EUR")} · médiane {formatFiat(mc.p50, "EUR")} · p95{" "}
          {formatFiat(mc.p95, "EUR")}
          {mc.ruinPct > 0 ? ` · ruine ${mc.ruinPct.toFixed(0)} %` : ""}
        </p>
      )}
      {result.tradeLog.slice(0, 8).length > 0 && (
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          {result.tradeLog.slice(0, 8).map((t, i) => (
            <li key={`${t.time}-${i}`} className="flex justify-between gap-2 font-mono tabular-nums">
              <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                {t.side === "buy" ? "Achat" : "Vente"} {formatQty(t.price, 2)}
              </span>
              <span className={t.pnl >= 0 ? "text-buy" : "text-sell"}>
                {t.side === "sell" ? formatFiat(t.pnl, "EUR") : t.note}
              </span>
            </li>
          ))}
        </ul>
      )}
      {result.tradeLog.length > 0 && (
        <Button type="button" size="sm" variant="ghost" className="w-full" onClick={exportCsv}>
          Export CSV des trades
        </Button>
      )}
    </div>
  );
}

function BotDetail({ botId, onClose }: { botId: string; onClose: () => void }) {
  const bot = useTradingStore((s) => s.bots.find((b) => b.id === botId));
  const updateBot = useTradingStore((s) => s.updateBot);
  const flattenBot = useTradingStore((s) => s.flattenBot);
  const cloneBotToPair = useTradingStore((s) => s.cloneBotToPair);
  const paperAll = useTradingStore((s) => s.paper.trades);
  const feeRate = useTradingStore((s) => s.paper.feeRate);
  const seedGrid = useTradingStore((s) => s.seedGrid);
  const liveAll = useTradingStore((s) => s.liveFills);
  const paperTrades = paperAll.filter((t) => t.botId === botId).slice(0, 12);
  const liveTrades = liveAll.filter((t) => t.botId === botId).slice(0, 12);
  const ticker = useTradingStore((s) => (bot ? s.tickers[bot.pair] : undefined));
  const liveFee = useTradingStore((s) => s.settings.takerFee);
  const [name, setName] = useState(bot?.name ?? "");
  const [size, setSize] = useState(String(bot?.sizeQuote ?? 0));
  const [params, setParams] = useState<BotParams>(bot?.params ?? {});
  const [clonePair, setClonePair] = useState(bot?.pair ?? "ETHEUR");
  const [confirmFlat, setConfirmFlat] = useState(false);
  if (!bot) return null;
  const running = bot.status === "running";
  const trades = bot.venue === "live" ? liveTrades : paperTrades;
  const info = BOT_KIND_BY_ID[bot.kind];
  const patch = (p: Partial<BotParams>) => setParams((prev) => ({ ...prev, ...p }));
  const deployed = botDeployed(bot.runtime);

  return (
    <Sheet title={bot.name} onClose={onClose}>
      <div className="space-y-3 px-4 pb-6 pt-2">
        <p className="text-sm text-muted-foreground">{info?.blurb}</p>
        <p className="text-xs text-muted-foreground">
          {PAIR_BY_ID[bot.pair]?.display} · {intervalLabel(bot.interval)} · {bot.lastNote}
        </p>
        {ticker && botInventoryQty(bot.runtime) > 0 ? (
          <p className="font-mono text-xs tabular-nums">
            Position {formatQty(botInventoryQty(bot.runtime), 6)} @ {formatFiat(bot.runtime.positionAvg ?? 0, "EUR")}
            {deployed > 0 ? ` · déployé ${formatFiat(deployed, "EUR")}` : ""}
          </p>
        ) : (
          <p className="text-xs text-subtle">Hors marché</p>
        )}
        {bot.kind === "grid" && (
          <GridBook bot={bot} last={ticker?.last} feeRate={bot.venue === "live" ? liveFee : feeRate} />
        )}
        <Field label="Nom">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={running} />
        </Field>
        <Field label="Taille par ordre (EUR)">
          <Input inputMode="decimal" value={size} onChange={(e) => setSize(e.target.value)} disabled={running} className="font-mono tabular-nums" />
        </Field>
        <KindParamsFields
          kind={bot.kind}
          params={params}
          patch={patch}
          last={ticker?.last || bot.params.lower || 100}
          sizeQuote={Number(size) || bot.sizeQuote}
          feeRate={bot.venue === "live" ? liveFee : feeRate}
        />
        {bot.kind !== "grid" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <NumField label="SL %" value={params.slPct ?? 0} onChange={(v) => setParams((p) => ({ ...p, slPct: v }))} />
              <NumField label="TP %" value={params.tpPct ?? 0} onChange={(v) => setParams((p) => ({ ...p, tpPct: v }))} />
              <NumField label="Trailing %" value={params.trailingPct ?? 0} onChange={(v) => setParams((p) => ({ ...p, trailingPct: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="Filtre EMA" value={params.trendEma ?? 0} onChange={(v) => setParams((p) => ({ ...p, trendEma: v }))} />
              <NumField label="Stop ATR ×" value={params.slAtr ?? 0} onChange={(v) => setParams((p) => ({ ...p, slAtr: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="TP partiel %" value={params.partialTp ?? 0} onChange={(v) => setParams((p) => ({ ...p, partialTp: v }))} />
              <NumField label="Max hold min" value={params.maxHoldMin ?? 0} onChange={(v) => setParams((p) => ({ ...p, maxHoldMin: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="ADX max" value={params.adxCeil ?? 0} onChange={(v) => setParams((p) => ({ ...p, adxCeil: v }))} />
              <NumField label="ADX min" value={params.adxFloor ?? 0} onChange={(v) => setParams((p) => ({ ...p, adxFloor: v }))} />
              <NumField label="Krach %" value={params.crashPct ?? 0} onChange={(v) => setParams((p) => ({ ...p, crashPct: v }))} />
              <NumField label="Verrou %" value={params.beAfterPct ?? 0} onChange={(v) => setParams((p) => ({ ...p, beAfterPct: v }))} />
            </div>
            {!running && bot.kind !== "dca" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setParams((p) => ({ ...p, ...profitDefaults(bot.kind) }))}
              >
                Appliquer le profil gain
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <NumField label="Session début" value={params.sessionStart ?? 0} onChange={(v) => setParams((p) => ({ ...p, sessionStart: v }))} />
              <NumField label="Session fin" value={params.sessionEnd ?? 0} onChange={(v) => setParams((p) => ({ ...p, sessionEnd: v }))} />
            </div>
          </>
        )}
        {bot.kind === "grid" && (
          <NumField label="Stop global % (aplatit toute la grille)" value={params.slPct ?? 0} onChange={(v) => setParams((p) => ({ ...p, slPct: v }))} />
        )}
        {running && <p className="text-xs text-warning">Mets le bot en pause pour modifier les paramètres.</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={running}
            onClick={() => {
              const n = Number(size);
              updateBot(bot.id, { name: name.trim() || bot.name, sizeQuote: n > 0 ? n : bot.sizeQuote, params });
              toast.message("Paramètres enregistrés");
              onClose();
            }}
          >
            Enregistrer
          </Button>
          {confirmFlat ? (
            <Button
              variant="sell"
              onClick={() => {
                flattenBot(bot.id);
                setConfirmFlat(false);
              }}
            >
              Confirmer
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmFlat(true)}>
              Clôturer la position
            </Button>
          )}
        </div>
        <Field label="Cloner sur une autre paire">
          <div className="flex gap-2">
            <select
              value={clonePair}
              onChange={(e) => setClonePair(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-md border border-border bg-muted px-3 text-sm text-foreground"
            >
              {EUR_PAIRS.filter((p) => p.id !== bot.pair).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const copy = cloneBotToPair(bot.id, clonePair);
                if (copy) {
                  toast.message(`${copy.name} créé`);
                  onClose();
                }
              }}
            >
              Cloner
            </Button>
          </div>
        </Field>
        {bot.kind === "grid" && running && !(bot.runtime.gridOwned ?? []).some((g) => g.qty > 0) && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              const res = seedGrid(bot.id);
              toast.message(res.message);
            }}
          >
            <CirclePlus className="size-3.5" />
            Prendre le premier lot au marché
          </Button>
        )}
        {trades.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              downloadCsv(`nautilus-bot-${bot.pair}.csv`, [
                ["time", "side", "price", "qty", "pnl", "note"],
                ...trades.map((t) => [
                  new Date(t.time).toISOString(),
                  t.side,
                  String(t.price),
                  String(t.amount),
                  String(t.pnl),
                  t.note ?? "",
                ]),
              ]);
            }}
          >
            Exporter les fills (CSV)
          </Button>
        )}
        <Link to="/trade/$pair" params={{ pair: bot.pair }} className="block text-center text-xs text-accent">
          Ouvrir le carnet {PAIR_BY_ID[bot.pair]?.display}
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Journal</p>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {(bot.log ?? []).slice(0, 12).length === 0 && trades.length === 0 && (
              <li className="px-3 py-3 text-xs text-muted-foreground">Aucun événement.</li>
            )}
            {(bot.log ?? []).slice(0, 10).map((e, i) => (
              <li key={`${e.t}-${i}`} className="px-3 py-2 text-xs">
                <span className="font-mono tabular-nums text-subtle">{formatDateTime(e.t)}</span>
                <span className="ml-2 text-muted-foreground">{e.text}</span>
              </li>
            ))}
          </ul>
        </div>
        {trades.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Derniers fills</p>
            <ul className="mt-2 space-y-1">
              {trades.map((t) => (
                <li key={t.id} className="flex justify-between text-xs">
                  <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                    {t.side === "buy" ? "Achat" : "Vente"}
                  </span>
                  <span className="font-mono tabular-nums">{formatFiat(t.pnl, "EUR")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function KindParamsFields({
  kind,
  params,
  patch,
  last,
  sizeQuote,
  feeRate,
}: {
  kind: BotKind;
  params: BotParams;
  patch: (p: Partial<BotParams>) => void;
  last: number;
  sizeQuote: number;
  feeRate: number;
}) {
  return (
    <>
      {kind === "grid" && (
        <GridParamsFields params={params} patch={patch} last={last} sizeQuote={sizeQuote} feeRate={feeRate} />
      )}
      {kind === "dca" && (
        <Field label="Cadence">
          <div className="flex flex-wrap gap-1">
            {DCA_INTERVALS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => patch({ intervalMs: c.id })}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  params.intervalMs === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Field>
      )}
      {kind === "rsi" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Période" value={params.rsiPeriod ?? 14} onChange={(v) => patch({ rsiPeriod: v })} />
          <NumField label="Survente" value={params.oversold ?? 30} onChange={(v) => patch({ oversold: v })} />
          <NumField label="Surachat" value={params.overbought ?? 70} onChange={(v) => patch({ overbought: v })} />
        </div>
      )}
      {(kind === "ema" || kind === "scalp") && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="EMA rapide" value={params.fast ?? (kind === "scalp" ? 5 : 9)} onChange={(v) => patch({ fast: v })} />
          <NumField label="EMA lente" value={params.slow ?? (kind === "scalp" ? 13 : 21)} onChange={(v) => patch({ slow: v })} />
        </div>
      )}
      {kind === "scalp" && (
        <NumField label="RSI scalp" value={params.rsiPeriod ?? 7} onChange={(v) => patch({ rsiPeriod: v })} />
      )}
      {kind === "mfi" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Période" value={params.rsiPeriod ?? 14} onChange={(v) => patch({ rsiPeriod: v })} />
          <NumField label="Sous-flux" value={params.oversold ?? 20} onChange={(v) => patch({ oversold: v })} />
          <NumField label="Sur-flux" value={params.overbought ?? 80} onChange={(v) => patch({ overbought: v })} />
        </div>
      )}
      {kind === "engulf" && (
        <p className="text-xs leading-relaxed text-subtle">Pas de paramètre d’indicateur — uniquement le motif de bougie.</p>
      )}
      {kind === "bollinger" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Période" value={params.bbPeriod ?? 20} onChange={(v) => patch({ bbPeriod: v })} />
          <NumField label="Écart-type" value={params.bbMult ?? 2} onChange={(v) => patch({ bbMult: v })} />
        </div>
      )}
      {kind === "macd" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Rapide" value={params.macdFast ?? 12} onChange={(v) => patch({ macdFast: v })} />
          <NumField label="Lent" value={params.macdSlow ?? 26} onChange={(v) => patch({ macdSlow: v })} />
          <NumField label="Signal" value={params.macdSignal ?? 9} onChange={(v) => patch({ macdSignal: v })} />
        </div>
      )}
      {kind === "stoch" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="N" value={params.stochN ?? 14} onChange={(v) => patch({ stochN: v })} />
          <NumField label="Survente" value={params.oversold ?? 20} onChange={(v) => patch({ oversold: v })} />
          <NumField label="Surachat" value={params.overbought ?? 80} onChange={(v) => patch({ overbought: v })} />
        </div>
      )}
      {kind === "breakout" && (
        <NumField label="Fenêtre Donchian" value={params.donchian ?? 20} onChange={(v) => patch({ donchian: v })} />
      )}
      {kind === "supertrend" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="ATR" value={params.atrPeriod ?? 10} onChange={(v) => patch({ atrPeriod: v })} />
          <NumField label="Mult" value={params.atrMult ?? 3} onChange={(v) => patch({ atrMult: v })} />
        </div>
      )}
      {kind === "volume" && (
        <NumField label="Seuil × moyenne" value={params.volMult ?? 2} onChange={(v) => patch({ volMult: v })} />
      )}
      {kind === "cci" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Période" value={params.cciPeriod ?? 20} onChange={(v) => patch({ cciPeriod: v })} />
          <NumField label="Survente" value={params.oversold ?? -100} onChange={(v) => patch({ oversold: v })} />
          <NumField label="Surachat" value={params.overbought ?? 100} onChange={(v) => patch({ overbought: v })} />
        </div>
      )}
      {kind === "meanrev" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Fenêtre" value={params.zWindow ?? 20} onChange={(v) => patch({ zWindow: v })} />
          <NumField label="|Z| entrée" value={params.zEntry ?? 1.6} onChange={(v) => patch({ zEntry: v })} />
        </div>
      )}
      {kind === "keltner" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Période" value={params.kcPeriod ?? 20} onChange={(v) => patch({ kcPeriod: v })} />
          <NumField label="ATR ×" value={params.kcMult ?? 1.5} onChange={(v) => patch({ kcMult: v })} />
        </div>
      )}
      {kind === "roc" && (
        <NumField label="Période ROC" value={params.rocPeriod ?? 12} onChange={(v) => patch({ rocPeriod: v })} />
      )}
      {kind === "adx" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Période" value={params.adxPeriod ?? 14} onChange={(v) => patch({ adxPeriod: v })} />
          <NumField label="ADX min" value={params.adxMin ?? 20} onChange={(v) => patch({ adxMin: v })} />
        </div>
      )}
      {kind === "williams" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="N" value={params.wrPeriod ?? 14} onChange={(v) => patch({ wrPeriod: v })} />
          <NumField label="Survente" value={params.oversold ?? -80} onChange={(v) => patch({ oversold: v })} />
          <NumField label="Surachat" value={params.overbought ?? -20} onChange={(v) => patch({ overbought: v })} />
        </div>
      )}
      {kind === "ichimoku" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Tenkan" value={params.tenkan ?? 9} onChange={(v) => patch({ tenkan: v })} />
          <NumField label="Kijun" value={params.kijun ?? 26} onChange={(v) => patch({ kijun: v })} />
        </div>
      )}
      {kind === "psar" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="AF" value={params.psarAf ?? 0.02} onChange={(v) => patch({ psarAf: v })} />
          <NumField label="AF max" value={params.psarMax ?? 0.2} onChange={(v) => patch({ psarMax: v })} />
        </div>
      )}
      {kind === "sma" && (
        <div className="grid grid-cols-2 gap-2">
          <NumField label="SMA rapide" value={params.fast ?? 50} onChange={(v) => patch({ fast: v })} />
          <NumField label="SMA lente" value={params.slow ?? 200} onChange={(v) => patch({ slow: v })} />
        </div>
      )}
      {kind === "obv" && (
        <NumField label="EMA de l’OBV" value={params.fast ?? 20} onChange={(v) => patch({ fast: v })} />
      )}
      {kind === "div" && (
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Période RSI" value={params.rsiPeriod ?? 14} onChange={(v) => patch({ rsiPeriod: v })} />
          <NumField label="Zone basse" value={params.oversold ?? 40} onChange={(v) => patch({ oversold: v })} />
          <NumField label="Sortie" value={params.overbought ?? 70} onChange={(v) => patch({ overbought: v })} />
        </div>
      )}
      {kind === "confirm" && (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-subtle">
            Achat seulement si l’EMA rapide est au-dessus de la lente, le MACD est positif, et le RSI sort de survente.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="EMA rapide" value={params.fast ?? 9} onChange={(v) => patch({ fast: v })} />
            <NumField label="EMA lente" value={params.slow ?? 21} onChange={(v) => patch({ slow: v })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumField label="Période RSI" value={params.rsiPeriod ?? 14} onChange={(v) => patch({ rsiPeriod: v })} />
            <NumField label="Survente" value={params.oversold ?? 35} onChange={(v) => patch({ oversold: v })} />
            <NumField label="Surachat" value={params.overbought ?? 70} onChange={(v) => patch({ overbought: v })} />
          </div>
        </div>
      )}
      {kind === "mtf" && (
        <div className="space-y-2">
          <p className="text-xs leading-relaxed text-subtle">
            RSI croisé sur l’intervalle du bot plus 1–2 TF supplémentaires (OHLC Kraken séparés). Majority = vote ;
            higherAgree = le TF le plus long doit confirmer.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <NumField label="Période RSI" value={params.rsiPeriod ?? 14} onChange={(v) => patch({ rsiPeriod: v })} />
            <NumField label="Survente" value={params.oversold ?? 30} onChange={(v) => patch({ oversold: v })} />
            <NumField label="Surachat" value={params.overbought ?? 70} onChange={(v) => patch({ overbought: v })} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { id: "majority", label: "Majorité" },
                { id: "higherAgree", label: "TF haut d’accord" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => patch({ mtfMode: m.id })}
                className={cn(
                  "h-8 rounded-full px-3 text-xs font-medium",
                  (params.mtfMode ?? "majority") === m.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { label: "15+60+240", intervals: [60, 240] },
                { label: "5+15+60", intervals: [15, 60] },
                { label: "30+60+240", intervals: [60, 240] },
              ] as const
            ).map((pre) => {
              const cur = (params.mtfIntervals ?? [60, 240]).join(",");
              const on = cur === pre.intervals.join(",");
              return (
                <button
                  key={pre.label}
                  type="button"
                  onClick={() => patch({ mtfIntervals: [...pre.intervals] })}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-medium",
                    on ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {pre.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {kindNeedsCandles(kind) && (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Auto-optimisation (walk-forward)</p>
              <p className="text-[11px] leading-relaxed text-subtle">
                Paper recommandé. Sur le réel, activer aussi « Auto-opt live » dans Paramètres (surapprentissage).
              </p>
            </div>
            <button
              type="button"
              onClick={() => patch({ autoOpt: !params.autoOpt })}
              className={cn(
                "h-8 rounded-full px-3 text-xs font-medium",
                params.autoOpt ? "bg-buy text-buy-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {params.autoOpt ? "ON" : "OFF"}
            </button>
          </div>
          {params.autoOpt && (
            <div className="grid grid-cols-2 gap-2">
              <NumField
                label="Tous les (jours)"
                value={Math.round((params.autoOptEveryMs ?? 7 * 86400000) / 86400000)}
                onChange={(v) => patch({ autoOptEveryMs: Math.max(1, v) * 86400000 })}
              />
              <NumField
                label="Sharpe OOS min"
                value={params.autoOptMinOosSharpe ?? 0}
                onChange={(v) => patch({ autoOptMinOosSharpe: v })}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

function GridParamsFields({
  params,
  patch,
  last,
  sizeQuote,
  feeRate,
}: {
  params: BotParams;
  patch: (p: Partial<BotParams>) => void;
  last: number;
  sizeQuote: number;
  feeRate: number;
}) {
  const pad = gridFeePadPct(feeRate, params.gridNetFees !== false);
  const levels = params.levels ?? 8;
  const exposure = Math.max(0, sizeQuote) * levels;
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Chaque lot se revend à +X % de son prix d’achat. Après un achat, un nouvel ordre est placé Y % plus bas. Après une vente, le bot rachète au prix d’achat mémorisé.
      </p>
      <div className="flex flex-wrap gap-1">
        {GRID_PRESETS.map((pre) => {
          const on = params.gridSellPct === pre.sell && params.gridBuyPct === pre.buy && (params.levels ?? 8) === pre.levels;
          return (
            <button
              key={pre.id}
              type="button"
              onClick={() => patch(applyGridPreset(last || 100, pre, { slPct: params.slPct, tpPct: params.tpPct, cooldownSec: params.cooldownSec, gridNetFees: params.gridNetFees, gridSeed: params.gridSeed, compoundPct: params.compoundPct, gridSlPct: params.gridSlPct, gridFollow: params.gridFollow, gridSlCooldownMin: params.gridSlCooldownMin, budgetQuote: params.budgetQuote }))}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium",
                on ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {pre.label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Revente %" value={params.gridSellPct ?? 1.5} onChange={(v) => patch({ gridSellPct: v })} />
        <NumField label="Rachat plus bas %" value={params.gridBuyPct ?? 1} onChange={(v) => patch({ gridBuyPct: v })} />
      </div>
      {pad > 0 && (
        <p className="text-xs text-subtle">
          Revente nette {params.gridSellPct ?? 1.5} % → déclenchement à {(params.gridSellPct ?? 1.5) + pad} % brut (frais aller-retour).
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <NumField label="Plancher" value={params.lower} onChange={(v) => patch({ lower: v })} />
        <NumField label="Plafond" value={params.upper} onChange={(v) => patch({ upper: v })} />
        <NumField label="Lots max" value={levels} onChange={(v) => patch({ levels: v })} />
      </div>
      <p className="text-xs text-subtle">
        Exposition max {formatFiat(exposure, "EUR")} ({levels} × {formatFiat(sizeQuote, "EUR")})
      </p>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Stop lot %" value={params.gridSlPct ?? 0} onChange={(v) => patch({ gridSlPct: v })} />
        <NumField label="Réinvestir %" value={params.compoundPct ?? 0} onChange={(v) => patch({ compoundPct: v })} />
      </div>
      <NumField label="Pause achats après stop (min)" value={params.gridSlCooldownMin ?? 0} onChange={(v) => patch({ gridSlCooldownMin: v })} />
      <NumField label="Budget max (EUR, 0 = illimité)" value={params.budgetQuote ?? 0} onChange={(v) => patch({ budgetQuote: v })} />
      <button
        type="button"
        onClick={() => patch({ gridFollow: !params.gridFollow })}
        className={cn(
          "h-11 w-full rounded-md text-xs font-medium",
          params.gridFollow ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
        )}
      >
        {params.gridFollow ? "Suivi de fourchette activé" : "Suivi de fourchette désactivé"}
      </button>
      <button
        type="button"
        onClick={() => patch({ gridNetFees: params.gridNetFees === false })}
        className={cn(
          "h-11 w-full rounded-md text-xs font-medium",
          params.gridNetFees !== false ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
        )}
      >
        {params.gridNetFees !== false ? "Revente nette de frais" : "Revente brute (hors frais)"}
      </button>
      <button
        type="button"
        onClick={() => patch({ gridSeed: !params.gridSeed })}
        className={cn(
          "h-11 w-full rounded-md text-xs font-medium",
          params.gridSeed ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
        )}
      >
        {params.gridSeed ? "Premier lot au marché au lancement" : "Attendre un creux pour le premier lot"}
      </button>
      <p className="text-xs leading-relaxed text-subtle">
        Stop lot : coupe un lot perdant sans le racheter. Pause après stop : aucun nouvel achat pendant X minutes. Réinvestir : ajoute X % du gain à la taille du prochain ordre. Suivi : recentre plancher/plafond si le prix sort de la bande et qu’aucun lot n’est ouvert.
      </p>
    </div>
  );
}

function gridLots(bot: Bot) {
  const rows = bot.runtime.gridOwned ?? [];
  return {
    held: rows.filter((g) => g.qty > 0),
    pending: rows.filter((g) => g.pending),
  };
}

function GridStatus({ bot, last, feeRate }: { bot: Bot; last?: number; feeRate?: number }) {
  const { held, pending } = gridLots(bot);
  if (!held.length && !pending.length && !(last && (bot.params.lower ?? 0) > 0)) return null;
  const sellPct = (bot.params.gridSellPct ?? 1.5) + gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
  const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
  const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
  const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
  const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
  const deployed = botDeployed(bot.runtime);
  const cap = bot.params.budgetQuote ?? 0;
  return (
    <div className="mt-2 space-y-2">
      {lo > 0 && hi > lo && last ? <GridLadder lo={lo} hi={hi} last={last} nextBuy={nextBuy} nextSell={nextSell} /> : null}
      <p className="font-mono text-xs tabular-nums text-subtle">
        {held.length} lot{held.length > 1 ? "s" : ""}
        {pending.length ? ` · ${pending.length} achat${pending.length > 1 ? "s" : ""}` : ""}
        {nextBuy ? ` · achat ${formatFiat(nextBuy, "EUR")}` : ""}
        {nextSell ? ` · vente ${formatFiat(nextSell, "EUR")}` : ""}
        {deployed > 0 ? ` · ${formatFiat(deployed, "EUR")}` : ""}
        {cap > 0 ? ` / ${formatFiat(cap, "EUR")}` : ""}
        {bot.runtime.inFlight ? " · envoi…" : ""}
      </p>
    </div>
  );
}

function GridLadder({
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

function GridBook({ bot, last, feeRate }: { bot: Bot; last?: number; feeRate?: number }) {
  const { held, pending } = gridLots(bot);
  const sellPct = (bot.params.gridSellPct ?? 1.5) + gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
  const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
  const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
  const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
  const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
  if (!held.length && !pending.length && !(lo > 0 && hi > lo && last)) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted px-3 py-2">
      {lo > 0 && hi > lo && last ? <GridLadder lo={lo} hi={hi} last={last} nextBuy={nextBuy} nextSell={nextSell} /> : null}
      {held.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lots en portefeuille</p>
          <ul className="mt-1 space-y-1">
            {held
              .slice()
              .sort((a, b) => b.entry - a.entry)
              .map((g, i) => (
                <li key={`h-${g.entry}-${i}`} className="flex justify-between gap-2 font-mono text-xs tabular-nums">
                  <span>
                    {formatQty(g.qty, 6)} @ {formatFiat(g.entry, "EUR")}
                  </span>
                  <span className="text-buy">vente {formatFiat(g.entry * (1 + sellPct / 100), "EUR")}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ordres d’achat</p>
          <ul className="mt-1 space-y-1">
            {pending
              .slice()
              .sort((a, b) => b.price - a.price)
              .map((g, i) => (
                <li key={`p-${g.price}-${i}`} className="flex justify-between gap-2 font-mono text-xs tabular-nums">
                  <span>limite {formatFiat(g.price, "EUR")}</span>
                  <span className="text-muted-foreground">en attente</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number | undefined; onChange: (v: number) => void }) {
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

function ConfirmBar({
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block text-xs text-muted-foreground">
      <p>{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
