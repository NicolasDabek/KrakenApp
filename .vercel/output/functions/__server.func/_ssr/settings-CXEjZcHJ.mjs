import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-D7MFyafD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CXEjZcHJ.js
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const settings = useTradingStore((s) => s.settings);
	const setSettings = useTradingStore((s) => s.setSettings);
	const resetDemo = useTradingStore((s) => s.resetDemo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Paramètres",
				kicker: "Préférences locales du terminal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "divide-y divide-border rounded-lg border border-border bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-4 px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Confirmer les ordres"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Feuille avant chaque envoi"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							on: settings.confirmOrders,
							onChange: (v) => setSettings({ confirmOrders: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-4 px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Devise d’affichage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Portefeuille et bureau"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex rounded-md bg-muted p-1",
							children: ["USD", "EUR"].map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSettings({ displayQuote: q }),
								className: cn("h-8 rounded-sm px-3 text-xs font-medium", settings.displayQuote === q ? "bg-foreground text-background" : "text-muted-foreground"),
								children: q
							}, q))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-4 py-4 text-sm text-muted-foreground",
						children: [
							"Frais simulés : taker ",
							(settings.takerFee * 100).toFixed(2),
							" % · maker ",
							(settings.makerFee * 100).toFixed(2),
							" %"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "sell",
					className: "w-full",
					onClick: resetDemo,
					children: "Réinitialiser le compte démo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs leading-relaxed text-subtle",
					children: "Nautilus est un terminal mobile. Les prix, le carnet et les chandeliers viennent de Kraken. Les ordres restent en démo jusqu’au branchement backend."
				})]
			})
		]
	});
}
function Toggle({ on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": on,
		onClick: () => onChange(!on),
		className: cn("relative h-7 w-12 rounded-full transition-colors duration-150", on ? "bg-accent" : "bg-border"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute top-0.5 size-6 rounded-full bg-foreground transition-transform duration-150", on ? "translate-x-5" : "translate-x-0.5") })
	});
}
//#endregion
export { SettingsPage as component };
