import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Bot,
  Calculator,
  Coins,
  GitCompare,
  Grid3x3,
  Percent,
  Plug,
  Repeat,
  ScanSearch,
  Settings,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/tools")({ component: ToolsPage });

const GROUPS = [
  {
    title: "Marché",
    items: [
      { to: "/heatmap", title: "Heatmap", desc: "Volume × variation 24h", icon: Grid3x3 },
      { to: "/screener", title: "Screener", desc: "Breakout, volume, survente", icon: ScanSearch },
      { to: "/arb", title: "Écart USD/EUR", desc: "Radar d’arbitrage inter-livres", icon: GitCompare },
      { to: "/correlation", title: "Corrélation", desc: "Pearson sur rendements horaires", icon: Percent },
    ],
  },
  {
    title: "Trading",
    items: [
      { to: "/bot", title: "Bots", desc: "17 stratégies EUR, papier ou Kraken réel", icon: Bot },
      { to: "/alerts", title: "Alertes prix", desc: "Seuils haut / bas", icon: Bell },
      { to: "/dca", title: "Achats récurrents", desc: "DCA quotidien ou hebdo", icon: Repeat },
      { to: "/risk", title: "Taille de position", desc: "Risque %, R:R, marge", icon: Shield },
      { to: "/calculator", title: "Calculateur", desc: "PnL, liquidation, frais", icon: Calculator },
      { to: "/journal", title: "Journal", desc: "Plans et post-mortem", icon: BookOpen },
    ],
  },
  {
    title: "Compte",
    items: [
      { to: "/convert", title: "Convertir", desc: "Swap interne du compte démo", icon: ArrowLeftRight },
      { to: "/staking", title: "Staking", desc: "Projection d’APR", icon: Coins },
      { to: "/connect", title: "Connexion API", desc: "Clés Kraken pour les bots réels", icon: Plug },
      { to: "/settings", title: "Paramètres", desc: "Frais, confirmations, reset", icon: Settings },
    ],
  },
] as const;

function ToolsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <h1 className="text-xl font-semibold tracking-tight">Outils</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Suite autour du carnet Kraken. Les bots réels passent des ordres spot EUR avec tes clés.
      </p>
      <div className="mt-6 space-y-7">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.title}</h2>
            <ul className="grid grid-cols-2 gap-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:bg-muted"
                    >
                      <span className="grid size-9 place-items-center rounded-md bg-muted text-accent">
                        <Icon className="size-4" strokeWidth={1.75} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.desc}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
