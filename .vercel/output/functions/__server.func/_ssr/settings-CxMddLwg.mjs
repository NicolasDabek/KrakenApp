import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CxMddLwg.js
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
						className: "flex items-center justify-between gap-4 px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Notifier les fills"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Notification système à chaque ordre bot"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							on: Boolean(settings.notifyFills),
							onChange: (v) => {
								setSettings({ notifyFills: v });
								if (v && typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission();
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-4 px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Relancer le réel après rechargement"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Les bots Kraken restent actifs si l’onglet revient"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							on: Boolean(settings.resumeLive),
							onChange: (v) => setSettings({ resumeLive: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-4 px-4 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Garde-fou flux"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Met les bots réels en pause si le prix Kraken se fige"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							on: settings.watchdog !== false,
							onChange: (v) => setSettings({ watchdog: v })
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
				className: "mt-6 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Coupe-circuit bureau"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted-foreground",
						children: "0 = désactivé. Perte jour et drawdown mettent tous les bots en pause. Exposition max bloque seulement les nouveaux achats."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted-foreground",
								children: ["Perte jour (EUR)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									className: "mt-1 font-mono tabular-nums",
									value: settings.deskDailyLoss ?? 0,
									onChange: (e) => setSettings({ deskDailyLoss: Math.max(0, Number(e.target.value) || 0) })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted-foreground",
								children: ["Drawdown max (%)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									className: "mt-1 font-mono tabular-nums",
									value: settings.deskDrawdownPct ?? 0,
									onChange: (e) => setSettings({ deskDrawdownPct: Math.max(0, Number(e.target.value) || 0) })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block text-xs text-muted-foreground",
								children: ["Exposition max (%)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									className: "mt-1 font-mono tabular-nums",
									value: settings.deskMaxExposurePct ?? 0,
									onChange: (e) => setSettings({ deskMaxExposurePct: Math.max(0, Number(e.target.value) || 0) })
								})]
							})
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
					children: "Nautilus est un terminal Kraken. Prix, carnet et chandeliers sont live. Les ordres et bots réels utilisent tes clés API (stockées sur cet appareil). Les retraits ne sont pas proposés."
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
