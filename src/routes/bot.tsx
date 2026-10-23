import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Percent, Radar, ShieldAlert, Square, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/layout/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { backtestBot, botBlueprint, botMark, BOT_CANDLE_INTERVALS, BOT_KIND_BY_ID, defaultParams, defaultSize, kindNeedsCandles, monteCarloPnl, optimizeBot, paperEquity, previewSignal, RISK_PRESETS, riskPresetFor, walkForward, evaluateDesk, type BacktestResult, type OptRow, type WalkForwardResult } from "@/lib/trading/bots";
import { fetchOhlc, fetchOhlcHistory } from "@/lib/trading/functions";
import { formatDateTime, formatFiat, formatPct, formatQty } from "@/lib/trading/format";
import { EUR_PAIRS, PAIR_BY_ID, backtestFetchInterval, intervalLabel, toEurPair } from "@/lib/trading/pairs";
import { marketSignal } from "@/lib/trading/signals";
import { downloadCsv } from "@/lib/trading/stats";
import { eurValue, useTradingStore } from "@/lib/trading/store";
import type { BotKind, BotParams, BotVenue, Candle } from "@/lib/trading/types";
import { cn } from "@/lib/utils";
import { BotCard } from "@/components/bot/bot-card";
import { KIND_ICON } from "@/components/bot/kind-icons";
import { Lab } from "@/components/bot/lab";
import { LiveJournal } from "@/components/bot/live-journal";
import { ConfirmBar, Field, NumField, Spark, Stat } from "@/components/bot/shared";
import { KindParamsFields } from "@/components/bot/kind-params-fields";

export const Route = createFileRoute("/bot")({ component: BotPage });

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
