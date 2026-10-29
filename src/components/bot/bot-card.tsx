import { Link } from "@tanstack/react-router";
import { Ban, CirclePlus, Copy, Grip, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/layout/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { botDeployed, botInventoryQty, botMark, BOT_KIND_BY_ID, botWinRate, gridFeePadPct, kindNeedsCandles, profitDefaults } from "@/lib/trading/bots";
import { formatDateTime, formatFiat, formatQty } from "@/lib/trading/format";
import { trendQuality } from "@/lib/trading/indicators";
import { EUR_PAIRS, PAIR_BY_ID, intervalLabel, toEurPair } from "@/lib/trading/pairs";
import { downloadCsv } from "@/lib/trading/stats";
import { useTradingStore } from "@/lib/trading/store";
import type { Bot, BotParams } from "@/lib/trading/types";
import { TrendQualityLine } from "@/components/markets/trend-quality";
import { ConfirmBar, Field, NumField, Spark, Stat } from "./shared";
import { KIND_ICON } from "./kind-icons";
import { KindParamsFields } from "./kind-params-fields";
import { GridLadder } from "./grid-ladder";
import { gridLots } from "./grid-lots";

export function BotCard({ bot }: { bot: Bot }) {
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
      <BotTrend bot={bot} />
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

/** État de tendance EMA 20/50 + volume sur les bougies du bot (mêmes données que le moteur). */
function BotTrend({ bot }: { bot: Bot }) {
  const candles = useTradingStore(
    (s) => s.botCandles[`${toEurPair(bot.pair)}:${bot.interval}`] ?? s.botCandles[`${bot.pair}:${bot.interval}`],
  );
  const tq = useMemo(() => (candles?.length ? trendQuality(candles) : null), [candles]);
  if (bot.kind === "grid" || bot.kind === "dca" || !tq) return null;
  const mode = bot.params.trendFilter ?? "off";
  return (
    <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
      <TrendQualityLine tq={tq} frame={intervalLabel(bot.interval)} />
      <span className="text-[11px] text-subtle">
        Filtre {mode === "off" ? "off" : mode === "soft" ? "contre-tendance" : "solide seulement"}
      </span>
    </div>
  );
}
