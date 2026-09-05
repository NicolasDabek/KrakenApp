import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CandlestickChart,
  CircleDot,
  Cloud,
  Compass,
  Copy,
  Crosshair,
  Gauge,
  Grip,
  Layers,
  LineChart,
  Milestone,
  Navigation,
  Pause,
  Percent,
  Play,
  Repeat,
  Rocket,
  Square,
  Target,
  Trash2,
  TrendingUp,
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
  backtestBot,
  BOT_CANDLE_INTERVALS,
  BOT_KIND_BY_ID,
  DCA_INTERVALS,
  defaultParams,
  defaultSize,
  type BacktestResult,
} from "@/lib/trading/bots";
import { fetchOhlcHistory } from "@/lib/trading/functions";
import { formatDateTime, formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { EUR_PAIRS, PAIR_BY_ID, backtestFetchInterval, intervalLabel, toEurPair } from "@/lib/trading/pairs";
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
};

const KIND_GROUPS: { title: string; ids: BotKind[] }[] = [
  { title: "Accumulation", ids: ["grid", "dca"] },
  { title: "Reversion", ids: ["rsi", "bollinger", "stoch", "vwap", "cci", "meanrev", "keltner", "williams"] },
  { title: "Tendance", ids: ["ema", "sma", "macd", "breakout", "supertrend", "adx", "roc", "ichimoku", "psar", "ha"] },
  { title: "Court terme", ids: ["scalp", "volume"] },
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
          <span className="text-xs text-subtle">{visible.length}</span>
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
        Les bots réels envoient des ordres marché spot EUR. Ils se mettent en pause au rechargement de la page.
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
      <Button variant="ghost" className="mt-1 w-full" onClick={resetPaper}>
        Réinitialiser la simulation
      </Button>
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

function Spark({ points }: { points: number[] }) {
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
  if (!d) return <Badge tone="accent">Papier</Badge>;
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

function BotCard({ bot }: { bot: Bot }) {
  const startBot = useTradingStore((s) => s.startBot);
  const pauseBot = useTradingStore((s) => s.pauseBot);
  const removeBot = useTradingStore((s) => s.removeBot);
  const duplicateBot = useTradingStore((s) => s.duplicateBot);
  const ticker = useTradingStore((s) => s.tickers[bot.pair]);
  const connection = useTradingStore((s) => s.connection);
  const Icon = KIND_ICON[bot.kind] ?? Grip;
  const meta = PAIR_BY_ID[bot.pair];
  const running = bot.status === "running";
  const winRate = bot.stats.trades > 0 ? (bot.stats.wins / bot.stats.trades) * 100 : 0;
  const uPnl =
    bot.runtime.inPosition && bot.runtime.positionQty && bot.runtime.positionAvg && ticker?.last
      ? (ticker.last - bot.runtime.positionAvg) * bot.runtime.positionQty
      : 0;

  const launch = () => {
    const res = startBot(bot.id);
    if (!res.ok) toast.message(res.message);
  };

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-accent">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{bot.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {meta?.display ?? bot.pair} · {formatFiat(bot.sizeQuote, "EUR")} / ordre
              {ticker ? ` · ${formatQty(ticker.last, meta?.pairDecimals ?? 2)}` : ""}
            </p>
          </div>
        </div>
        <Badge tone={running ? "buy" : bot.status === "error" ? "sell" : "neutral"}>
          {running ? "Actif" : bot.status === "paused" ? "Pause" : bot.status === "error" ? "Erreur" : "Arrêté"}
        </Badge>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{bot.lastNote}</p>
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
        <Stat label="Win rate" value={bot.stats.trades ? `${Math.round(winRate)} %` : "—"} />
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
        <Button size="sm" variant="ghost" onClick={() => duplicateBot(bot.id)} aria-label="Dupliquer">
          <Copy className="size-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => removeBot(bot.id)} aria-label="Supprimer">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
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
  const [size, setSize] = useState(String(defaultSize(kind)));
  const [interval, setIntervalId] = useState(60);
  const [params, setParams] = useState<BotParams>(() => defaultParams(kind, pairLast || 100));
  const [busy, setBusy] = useState(false);
  const [bt, setBt] = useState<BacktestResult | null>(null);
  const [btBusy, setBtBusy] = useState(false);
  const [btDays, setBtDays] = useState(30);
  const [btCapital, setBtCapital] = useState("10000");
  const [btSlip, setBtSlip] = useState("5");
  const seeded = useRef(pairLast > 0);

  useEffect(() => {
    if (kind !== "grid" || seeded.current || !(pairLast > 0)) return;
    setParams((p) => ({ ...defaultParams("grid", pairLast), slPct: p.slPct, tpPct: p.tpPct, cooldownSec: p.cooldownSec }));
    seeded.current = true;
  }, [kind, pairLast]);

  const patch = (p: Partial<BotParams>) => setParams((prev) => ({ ...prev, ...p }));

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
      setBt(result);
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
          const n = Number(size);
          if (!(n > 0)) return;
          if (venue === "live" && !hasKeys) return;
          setBusy(true);
          const bot = createBot({
            kind,
            venue,
            pair,
            interval,
            sizeQuote: n,
            params: {
              ...params,
              cooldownSec: params.cooldownSec ?? (venue === "live" ? 20 : 0),
              maxSpreadPct: params.maxSpreadPct ?? (venue === "live" ? 0.35 : 0),
            },
          });
          const res = startBot(bot.id);
          if (!res.ok) toast.message(res.message);
          setBusy(false);
          onClose();
        }}
      >
        <p className="text-sm text-muted-foreground">{info.blurb}</p>
        {pairLast > 0 && (
          <p className="font-mono text-xs tabular-nums text-subtle">Dernier prix {formatQty(pairLast, 6)} EUR</p>
        )}
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

        {kind === "grid" && (
          <div className="grid grid-cols-3 gap-2">
            <NumField label="Bas" value={params.lower} onChange={(v) => patch({ lower: v })} />
            <NumField label="Haut" value={params.upper} onChange={(v) => patch({ upper: v })} />
            <NumField label="Niveaux" value={params.levels ?? 8} onChange={(v) => patch({ levels: v })} />
          </div>
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

        <div className="grid grid-cols-3 gap-2">
          <NumField label="SL %" value={params.slPct ?? 0} onChange={(v) => patch({ slPct: v })} />
          <NumField label="TP %" value={params.tpPct ?? 0} onChange={(v) => patch({ tpPct: v })} />
          <NumField label="Trailing %" value={params.trailingPct ?? 0} onChange={(v) => patch({ trailingPct: v })} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumField label="Pause s" value={params.cooldownSec ?? (venue === "live" ? 20 : 0)} onChange={(v) => patch({ cooldownSec: v })} />
          <NumField label="Spread max %" value={params.maxSpreadPct ?? (venue === "live" ? 0.35 : 0)} onChange={(v) => patch({ maxSpreadPct: v })} />
          <NumField label="% équité / ordre" value={params.sizePct ?? 0} onChange={(v) => patch({ sizePct: v })} />
        </div>
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
                    setIntervalId(backtestFetchInterval(d, 15));
                    setBt(null);
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
        <Button type="submit" className="w-full" disabled={busy || (venue === "live" && !hasKeys)}>
          Créer et lancer
        </Button>
      </form>
    </Sheet>
  );
}

function BacktestReport({ result, pair }: { result: BacktestResult; pair: string }) {
  const better = result.pnl >= result.buyHoldPnl;
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
        <Stat label="Expo." value={`${result.exposurePct.toFixed(0)} %`} />
      </div>
      <p className="text-xs text-muted-foreground">
        Buy & hold {formatPct(result.buyHoldPct)} ({formatFiat(result.buyHoldPnl, "EUR")}) · le bot{" "}
        <span className={better ? "text-buy" : "text-sell"}>{better ? "surperforme" : "sous-performe"}</span>
        {" · "}
        espérance {formatFiat(result.expectancy, "EUR")} / vente
      </p>
      {result.tradeLog.length > 0 && (
        <Button type="button" size="sm" variant="ghost" className="w-full" onClick={exportCsv}>
          Export CSV des trades
        </Button>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number | undefined; onChange: (v: number) => void }) {
  return (
    <Field label={label}>
      <Input
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="font-mono tabular-nums"
      />
    </Field>
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
