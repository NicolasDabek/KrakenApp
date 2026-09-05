import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Grid3x3, G as Bell, N as Coins, O as GitCompare, U as Bot, V as Calculator, W as BookOpen, _ as Plug, d as Shield, f as Settings, g as Repeat, m as ScanSearch, q as ArrowLeftRight, y as Percent } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tools-D0a0Ov7F.js
var import_jsx_runtime = require_jsx_runtime();
var GROUPS = [
	{
		title: "Marché",
		items: [
			{
				to: "/heatmap",
				title: "Heatmap",
				desc: "Volume × variation 24h",
				icon: Grid3x3
			},
			{
				to: "/screener",
				title: "Screener",
				desc: "Breakout, volume, survente",
				icon: ScanSearch
			},
			{
				to: "/arb",
				title: "Écart USD/EUR",
				desc: "Radar d’arbitrage inter-livres",
				icon: GitCompare
			},
			{
				to: "/correlation",
				title: "Corrélation",
				desc: "Pearson sur rendements horaires",
				icon: Percent
			}
		]
	},
	{
		title: "Trading",
		items: [
			{
				to: "/bot",
				title: "Bots",
				desc: "17 stratégies EUR, papier ou Kraken réel",
				icon: Bot
			},
			{
				to: "/alerts",
				title: "Alertes prix",
				desc: "Seuils haut / bas",
				icon: Bell
			},
			{
				to: "/dca",
				title: "Achats récurrents",
				desc: "DCA quotidien ou hebdo",
				icon: Repeat
			},
			{
				to: "/risk",
				title: "Taille de position",
				desc: "Risque %, R:R, marge",
				icon: Shield
			},
			{
				to: "/calculator",
				title: "Calculateur",
				desc: "PnL, liquidation, frais",
				icon: Calculator
			},
			{
				to: "/journal",
				title: "Journal",
				desc: "Plans et post-mortem",
				icon: BookOpen
			}
		]
	},
	{
		title: "Compte",
		items: [
			{
				to: "/convert",
				title: "Convertir",
				desc: "Swap interne du compte démo",
				icon: ArrowLeftRight
			},
			{
				to: "/staking",
				title: "Staking",
				desc: "Projection d’APR",
				icon: Coins
			},
			{
				to: "/connect",
				title: "Connexion API",
				desc: "Clés Kraken pour les bots réels",
				icon: Plug
			},
			{
				to: "/settings",
				title: "Paramètres",
				desc: "Frais, confirmations, reset",
				icon: Settings
			}
		]
	}
];
function ToolsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: "Outils"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Suite autour du carnet Kraken. Les bots réels passent des ordres spot EUR avec tes clés."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-7",
				children: GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: group.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-2 gap-2",
					children: group.items.map((item) => {
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: "flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-md bg-muted text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									strokeWidth: 1.75
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs leading-relaxed text-muted-foreground",
								children: item.desc
							})] })]
						}) }, item.to);
					})
				})] }, group.title))
			})
		]
	});
}
//#endregion
export { ToolsPage as component };
