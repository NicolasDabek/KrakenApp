import { i as __toESM } from "../_runtime.mjs";
import { Bt as toEurPair, It as PAIR_BY_ID, Lt as PAIR_UNIVERSE, Pt as EUR_PAIRS, St as parseDecimal, ot as formatDateTime, st as formatFiat } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dca-CF7Y44IK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DcaPage() {
	const lastPair = useTradingStore((s) => s.lastPair);
	const connection = useTradingStore((s) => s.connection);
	const live = isLiveConnected(connection);
	const recurring = useTradingStore((s) => s.recurring);
	const addRecurring = useTradingStore((s) => s.addRecurring);
	const toggleRecurring = useTradingStore((s) => s.toggleRecurring);
	const removeRecurring = useTradingStore((s) => s.removeRecurring);
	const [pair, setPair] = (0, import_react.useState)(live ? toEurPair(lastPair) : lastPair);
	const [amount, setAmount] = (0, import_react.useState)("50");
	const [cadence, setCadence] = (0, import_react.useState)("daily");
	const pairs = live ? EUR_PAIRS : PAIR_UNIVERSE.filter((p) => p.quote === "USD");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Achats récurrents",
				kicker: live ? "DCA réel : ordre marché Kraken à l’échéance" : "DCA démo contre le dernier prix Kraken"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3 rounded-lg border border-border bg-card p-4",
				onSubmit: (e) => {
					e.preventDefault();
					const n = parseDecimal(amount);
					if (!(n && n > 0)) return;
					addRecurring({
						pair,
						amountQuote: n,
						cadence,
						nextAt: Date.now() + (cadence === "daily" ? 864e5 : 6048e5),
						active: true
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted-foreground",
						children: ["Paire", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: pair,
							onChange: (e) => setPair(e.target.value),
							className: "mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
							children: pairs.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.display
							}, p.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-xs text-muted-foreground",
						children: ["Montant quote", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "decimal",
							value: amount,
							onChange: (e) => setAmount(e.target.value),
							className: "mt-1 font-mono tabular-nums"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-1 rounded-md bg-muted p-1",
						children: ["daily", "weekly"].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCadence(c),
							className: cn("h-9 rounded-sm text-sm", cadence === c ? "bg-foreground text-background" : "text-muted-foreground"),
							children: c === "daily" ? "Quotidien" : "Hebdo"
						}, c))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Planifier"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-6 divide-y divide-border",
				children: [recurring.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "Aucun plan DCA."
				}), recurring.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							PAIR_BY_ID[r.pair]?.display,
							" · ",
							formatFiat(r.amountQuote)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							r.cadence === "daily" ? "Quotidien" : "Hebdomadaire",
							" · prochain ",
							formatDateTime(r.nextAt)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: r.active ? "outline" : "secondary",
							onClick: () => toggleRecurring(r.id),
							children: r.active ? "Pause" : "On"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => removeRecurring(r.id),
							children: "Suppr."
						})]
					})]
				}, r.id))]
			})
		]
	});
}
//#endregion
export { DcaPage as component };
