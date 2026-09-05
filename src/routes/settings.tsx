import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
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
        <li className="px-4 py-4 text-sm text-muted-foreground">
          Frais simulés : taker {(settings.takerFee * 100).toFixed(2)} % · maker {(settings.makerFee * 100).toFixed(2)} %
        </li>
      </ul>

      <div className="mt-8">
        <Button variant="sell" className="w-full" onClick={resetDemo}>
          Réinitialiser le compte démo
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-subtle">
          Nautilus est un terminal mobile. Les prix, le carnet et les chandeliers viennent de Kraken. Les ordres restent en démo jusqu’au branchement backend.
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
