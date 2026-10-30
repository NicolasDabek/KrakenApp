import { DCA_INTERVALS, GRID_PRESETS, applyGridPreset, gridFeePadPct, kindNeedsCandles, BOOK_KINDS } from "@/lib/trading/bots";
import { formatFiat } from "@/lib/trading/format";
import type { BotKind, BotParams } from "@/lib/trading/types";
import { cn } from "@/lib/utils";
import { Segmented } from "@/components/ui/segmented";
import { Field, NumField } from "./shared";

export function KindParamsFields({
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
      {kind !== "grid" && kind !== "dca" && (
        <Field label="Qualité de tendance (EMA 20/50 + volume)">
          <Segmented
            value={params.trendFilter ?? "off"}
            onChange={(v) => patch({ trendFilter: v })}
            options={TREND_FILTER_OPTIONS}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-subtle">
            {TREND_FILTER_HELP[params.trendFilter ?? "off"]} Les ventes ne sont jamais bloquées.
          </p>
        </Field>
      )}
      {BOOK_KINDS.has(kind) && (
        <Field label="Carnet d’ordres (profondeur 5/10/25 niveaux)">
          <Segmented
            value={params.bookFilter ?? "off"}
            onChange={(v) => patch({ bookFilter: v })}
            options={BOOK_FILTER_OPTIONS}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-subtle">
            {BOOK_FILTER_HELP[params.bookFilter ?? "off"]} N’agit que sur les achats ; stop-loss, take-profit et sorties ne sont jamais bloqués. Sans carnet récent (backtest), aucun effet.
          </p>
        </Field>
      )}
    </>
  );
}

const TREND_FILTER_OPTIONS: { id: NonNullable<BotParams["trendFilter"]>; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "soft", label: "Contre-tendance" },
  { id: "strict", label: "Solide seulement" },
];

const BOOK_FILTER_OPTIONS: { id: NonNullable<BotParams["bookFilter"]>; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "soft", label: "Souple" },
  { id: "strict", label: "Strict" },
];

const BOOK_FILTER_HELP: Record<NonNullable<BotParams["bookFilter"]>, string> = {
  off: "Le carnet n’est pas consulté.",
  soft: "Pas d’achat si le carnet penche nettement côté vendeurs (score ≤ −50), face à un mur vendeur proche (≥ ×4 la médiane, < 0,5 %) ou si les acheteurs sont minces.",
  strict: "Comme Souple, mais dès un score ≤ −20, et aussi si le spread dépasse 0,3 %.",
};

const TREND_FILTER_HELP: Record<NonNullable<BotParams["trendFilter"]>, string> = {
  off: "Aucun filtre : comportement historique.",
  soft: "Pas d’achat en tendance baissière (réversion : seulement si la baisse est solide, volume confirmé).",
  strict: "Achat de suivi seulement en hausse solide (EMA20 > EMA50, pente et volume au-dessus de sa moyenne) ; réversion bloquée dès que la tendance baisse.",
};

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
