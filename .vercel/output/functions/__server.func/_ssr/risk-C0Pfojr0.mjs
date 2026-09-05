import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as formatFiat, b as usdValue, i as cn, j as formatQty, k as formatPct, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
import { a as rewardRisk, o as sizeFromRisk } from "./stats-wybfxzw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/risk-C0Pfojr0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RiskPage() {
	const tickers = useTradingStore((s) => s.tickers);
	const balances = useTradingStore((s) => s.balances);
	const lastPair = useTradingStore((s) => s.lastPair);
	const meta = PAIR_BY_ID[lastPair];
	const last = tickers[lastPair]?.last ?? 0;
	const equity = balances.reduce((s, b) => s + usdValue(b.asset, b.available + b.hold, tickers), 0);
	const [capital, setCapital] = (0, import_react.useState)(() => String(Math.round(equity) || 25e3));
	const [riskPct, setRiskPct] = (0, import_react.useState)("1");
	const [entry, setEntry] = (0, import_react.useState)(() => last ? String(last) : "97000");
	const [stop, setStop] = (0, import_react.useState)("");
	const [target, setTarget] = (0, import_react.useState)("");
	const [lev, setLev] = (0, import_react.useState)("1");
	const [side, setSide] = (0, import_react.useState)("long");
	const sized = (0, import_react.useMemo)(() => {
		const e = Number(entry) || 0;
		const s = Number(stop) || 0;
		const cap = Number(capital) || 0;
		const rp = Number(riskPct) || 0;
		return sizeFromRisk(cap, rp, e, s);
	}, [
		capital,
		riskPct,
		entry,
		stop
	]);
	const rr = rewardRisk(Number(entry) || 0, Number(stop) || 0, Number(target) || 0);
	const leverage = Math.max(Number(lev) || 1, 1);
	const margin = sized.notional / leverage;
	const stopPct = Number(entry) ? Math.abs(Number(entry) - Number(stop)) / Number(entry) * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Taille de position",
				kicker: `${meta?.display ?? lastPair} · risque en % du capital`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1 rounded-md bg-muted p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSide("long"),
					className: cn("h-9 rounded-sm text-sm", side === "long" ? "bg-buy text-buy-foreground" : "text-muted-foreground"),
					children: "Long"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSide("short"),
					className: cn("h-9 rounded-sm text-sm", side === "short" ? "bg-sell text-sell-foreground" : "text-muted-foreground"),
					children: "Short"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Capital (USD)",
						value: capital,
						onChange: setCapital
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Risque %",
						value: riskPct,
						onChange: setRiskPct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Entrée",
						value: entry,
						onChange: setEntry
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Stop",
						value: stop,
						onChange: setStop
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Objectif (opt.)",
						value: target,
						onChange: setTarget
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Levier",
						value: lev,
						onChange: setLev
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2 rounded-lg border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Quantité",
						v: `${formatQty(sized.qty, 6)} ${meta?.base ?? ""}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Notionnel",
						v: formatFiat(sized.notional)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Marge",
						v: formatFiat(margin)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Risque $",
						v: formatFiat(sized.risk)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Distance stop",
						v: formatPct(stopPct)
					}),
					Number(target) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "R:R",
						v: rr ? `${rr.toFixed(2)} R` : "—",
						positive: rr >= 1
					})
				]
			})
		]
	});
}
function Num({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1 text-xs text-muted-foreground",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value,
			onChange: (e) => onChange(e.target.value),
			inputMode: "decimal",
			className: "font-mono tabular-nums"
		})]
	});
}
function Stat({ k, v, positive }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-mono tabular-nums", positive === true && "text-buy", positive === false && "text-sell"),
			children: v
		})]
	});
}
//#endregion
export { RiskPage as component };
