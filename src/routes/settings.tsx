import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const settings = useTradingStore((s) => s.settings);
  const setSettings = useTradingStore((s) => s.setSettings);
  const resetDemo = useTradingStore((s) => s.resetDemo);

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Paramètres" kicker="Préférences locales du terminal" />
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Confirmer les ordres</p>
            <p className="text-xs text-muted-foreground">Feuille avant chaque envoi</p>
          </div>
          <Toggle on={settings.confirmOrders} onChange={(v) => setSettings({ confirmOrders: v })} />
        </li>
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Devise d’affichage</p>
            <p className="text-xs text-muted-foreground">Portefeuille et bureau</p>
          </div>
          <div className="flex rounded-md bg-muted p-1">
            {(["USD", "EUR"] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setSettings({ displayQuote: q })}
                className={cn(
                  "h-8 rounded-sm px-3 text-xs font-medium",
                  settings.displayQuote === q ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </li>
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Notifier les fills</p>
            <p className="text-xs text-muted-foreground">Notification système à chaque ordre bot</p>
          </div>
          <Toggle
            on={Boolean(settings.notifyFills)}
            onChange={(v) => {
              setSettings({ notifyFills: v });
              if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
                void Notification.requestPermission();
              }
            }}
          />
        </li>
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Relancer le réel après rechargement</p>
            <p className="text-xs text-muted-foreground">Les bots Kraken restent actifs si l’onglet revient</p>
          </div>
          <Toggle on={Boolean(settings.resumeLive)} onChange={(v) => setSettings({ resumeLive: v })} />
        </li>
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Garde-fou flux</p>
            <p className="text-xs text-muted-foreground">Met les bots réels en pause si le prix Kraken se fige</p>
          </div>
          <Toggle on={settings.watchdog !== false} onChange={(v) => setSettings({ watchdog: v })} />
        </li>
        <li className="px-4 py-4 text-sm text-muted-foreground">
          Frais simulés : taker {(settings.takerFee * 100).toFixed(2)} % · maker {(settings.makerFee * 100).toFixed(2)} %
        </li>
      </ul>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Annuler les ordres au stop bureau</p>
            <p className="text-xs text-muted-foreground">
              Sur halt live : pause des bots puis annulation des ordres ouverts sur les paires bots (agressif).
            </p>
          </div>
          <Toggle
            on={settings.cancelOrdersOnHalt !== false}
            onChange={(v) => setSettings({ cancelOrdersOnHalt: v })}
          />
        </li>
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Allocation auto par performance</p>
            <p className="text-xs text-muted-foreground">
              Toutes les ~15 min, redistribue sizeQuote entre bots actifs (min/max ci-dessous). Paper-safe.
            </p>
          </div>
          <Toggle on={Boolean(settings.allocEnabled)} onChange={(v) => setSettings({ allocEnabled: v })} />
        </li>
        <li className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Auto-opt live autorisé</p>
            <p className="text-xs text-muted-foreground">
              Laisse les bots réels appliquer une optimisation walk-forward (risque de surapprentissage).
            </p>
          </div>
          <Toggle on={Boolean(settings.autoOptLive)} onChange={(v) => setSettings({ autoOptLive: v })} />
        </li>
      </ul>

      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Coupe-circuit bureau</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          0 = désactivé. Perte jour et drawdown mettent tous les bots en pause (et peuvent annuler les ordres Kraken). Exposition max bloque seulement les nouveaux achats.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block text-xs text-muted-foreground">
            Perte jour (EUR)
            <Input
              inputMode="decimal"
              className="mt-1 font-mono tabular-nums"
              value={settings.deskDailyLoss ?? 0}
              onChange={(e) => setSettings({ deskDailyLoss: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Drawdown max (%)
            <Input
              inputMode="decimal"
              className="mt-1 font-mono tabular-nums"
              value={settings.deskDrawdownPct ?? 0}
              onChange={(e) => setSettings({ deskDrawdownPct: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Exposition max (%)
            <Input
              inputMode="decimal"
              className="mt-1 font-mono tabular-nums"
              value={settings.deskMaxExposurePct ?? 0}
              onChange={(e) => setSettings({ deskMaxExposurePct: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted-foreground">
            Alloc min (0–1)
            <Input
              inputMode="decimal"
              className="mt-1 font-mono tabular-nums"
              value={settings.allocMin ?? 0.05}
              onChange={(e) => setSettings({ allocMin: Math.min(1, Math.max(0, Number(e.target.value) || 0)) })}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Alloc max (0–1)
            <Input
              inputMode="decimal"
              className="mt-1 font-mono tabular-nums"
              value={settings.allocMax ?? 0.5}
              onChange={(e) => setSettings({ allocMax: Math.min(1, Math.max(0, Number(e.target.value) || 0)) })}
            />
          </label>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="sell" className="w-full" onClick={resetDemo}>
          Réinitialiser le compte démo
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-subtle">
          Nautilus est un terminal Kraken. Prix, carnet et chandeliers sont live. Les ordres et bots réels utilisent tes clés API (stockées sur cet appareil). Les retraits ne sont pas proposés.
        </p>
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-12 rounded-full transition-colors duration-150",
        on ? "bg-accent" : "bg-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-6 rounded-full bg-foreground transition-transform duration-150",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
