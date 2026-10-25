import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/layout/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { backtestBot, BOT_CANDLE_INTERVALS, BOT_KIND_BY_ID, defaultParams, defaultSize, kindNeedsCandles, optimizeBot, previewSignal, RISK_PRESETS, riskPresetFor, walkForward, type BacktestResult, type OptRow, type WalkForwardResult } from "@/lib/trading/bots";
import { fetchOhlc, fetchOhlcHistory } from "@/lib/trading/functions";
import { formatPct, formatQty } from "@/lib/trading/format";
import { EUR_PAIRS, PAIR_BY_ID, backtestFetchInterval, intervalLabel, toEurPair } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import type { BotKind, BotParams, BotVenue, Candle } from "@/lib/trading/types";
import { cn } from "@/lib/utils";
import { Field, NumField } from "@/components/bot/shared";
import { KindParamsFields } from "@/components/bot/kind-params-fields";
import { BacktestReport } from "./backtest-report";

export function Composer({
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
