import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as formatFiat, i as cn, k as formatPct } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calculator-CnXKDzgZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CalculatorPage() {
	const [mode, setMode] = (0, import_react.useState)("pnl");
	const [entry, setEntry] = (0, import_react.useState)("97000");
	const [exit, setExit] = (0, import_react.useState)("101000");
	const [size, setSize] = (0, import_react.useState)("0.1");
	const [leverage, setLeverage] = (0, import_react.useState)("5");
	const [side, setSide] = (0, import_react.useState)("long");
	const [notional, setNotional] = (0, import_react.useState)("10000");
	const e = Number(entry) || 0;
	const x = Number(exit) || 0;
	const q = Number(size) || 0;
	const lev = Math.max(Number(leverage) || 1, 1);
	const n = Number(notional) || 0;
	const result = (0, import_react.useMemo)(() => {
		const dir = side === "long" ? 1 : -1;
		const pnl = (x - e) * q * dir;
		const cost = e * q;
		const pct = cost ? pnl / cost * 100 : 0;
		const roe = cost ? pnl / (cost / lev) * 100 : 0;
		const mm = .006;
		return {
			pnl,
			pct,
			roe,
			liq: side === "long" ? e * (1 - (1 / lev - mm)) : e * (1 + (1 / lev - mm)),
			taker: n * .0026,
			maker: n * .0016,
			round: n * .0026 * 2
		};
	}, [
		e,
		x,
		q,
		lev,
		side,
		n
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Calculateur",
				kicker: "PnL, liquidation et frais Kraken"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: [
					["pnl", "PnL"],
					["liq", "Liquidation"],
					["fees", "Frais"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMode(id),
					className: cn("h-9 flex-1 rounded-full text-xs font-medium", mode === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-3",
				children: [(mode === "pnl" || mode === "liq") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Entrée",
						value: entry,
						onChange: setEntry
					}),
					mode === "pnl" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Sortie",
						value: exit,
						onChange: setExit
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Quantité",
						value: size,
						onChange: setSize
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
						label: "Levier",
						value: leverage,
						onChange: setLeverage
					})
				] }), mode === "fees" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Num, {
					label: "Notionnel (USD)",
					value: notional,
					onChange: setNotional
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2 rounded-lg border border-border bg-card p-4",
				children: [
					mode === "pnl" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "PnL",
							v: formatFiat(result.pnl),
							positive: result.pnl >= 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Variation",
							v: formatPct(result.pct),
							positive: result.pct >= 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "ROE levier",
							v: formatPct(result.roe),
							positive: result.roe >= 0
						})
					] }),
					mode === "liq" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Prix de liquidation (MM 0,6 %)",
						v: result.liq.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
					}),
					mode === "fees" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Taker 0,26 %",
							v: formatFiat(result.taker)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Maker 0,16 %",
							v: formatFiat(result.maker)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							k: "Aller-retour taker",
							v: formatFiat(result.round)
						})
					] })
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
export { CalculatorPage as component };
