import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID, o as PAIR_UNIVERSE } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as formatPrice, D as formatDateTime, i as cn, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-D7MFyafD.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alerts-BTr1vv5n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AlertsPage() {
	const alerts = useTradingStore((s) => s.alerts);
	const addAlert = useTradingStore((s) => s.addAlert);
	const removeAlert = useTradingStore((s) => s.removeAlert);
	const lastPair = useTradingStore((s) => s.lastPair);
	const tickers = useTradingStore((s) => s.tickers);
	const [pair, setPair] = (0, import_react.useState)(lastPair);
	const [condition, setCondition] = (0, import_react.useState)("above");
	const [price, setPrice] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const last = tickers[pair]?.last ?? 0;
	const meta = PAIR_BY_ID[pair];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Alertes",
				kicker: "Notification locale dès que le dernier prix Kraken croise le seuil"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-lg border border-border bg-card p-4",
				onSubmit: (e) => {
					e.preventDefault();
					const n = Number(price);
					if (!n) return;
					addAlert({
						pair,
						condition,
						price: n,
						note
					});
					setPrice("");
					setNote("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted-foreground",
						children: ["Paire", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: pair,
							onChange: (e) => setPair(e.target.value),
							className: "mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
							children: PAIR_UNIVERSE.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.display
							}, p.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-1 rounded-md bg-muted p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCondition("above"),
							className: cn("h-9 rounded-sm text-sm", condition === "above" ? "bg-foreground text-background" : "text-muted-foreground"),
							children: "Au-dessus"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCondition("below"),
							className: cn("h-9 rounded-sm text-sm", condition === "below" ? "bg-foreground text-background" : "text-muted-foreground"),
							children: "En-dessous"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: price,
						onChange: (e) => setPrice(e.target.value),
						placeholder: `Dernier ${formatPrice(last, meta?.pairDecimals ?? 2)}`,
						className: "font-mono tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: "Note (optionnel)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Créer l’alerte"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 divide-y divide-border",
				children: [alerts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Aucune alerte."
				}), alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							PAIR_BY_ID[a.pair]?.display,
							" ",
							a.condition === "above" ? "≥" : "≤",
							" ",
							a.price
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [a.triggeredAt ? `Déclenchée ${formatDateTime(a.triggeredAt)}` : `Créée ${formatDateTime(a.createdAt)}`, a.note ? ` · ${a.note}` : ""]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => removeAlert(a.id),
						children: "Suppr."
					})]
				}, a.id))]
			})
		]
	});
}
//#endregion
export { AlertsPage as component };
