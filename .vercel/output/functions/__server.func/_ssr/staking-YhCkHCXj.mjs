import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as formatFiat, b as usdValue, i as cn, j as formatQty, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staking-YhCkHCXj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APR = [
	{
		asset: "ETH",
		rate: .035,
		note: "On-chain / bonded"
	},
	{
		asset: "SOL",
		rate: .065,
		note: "Délégation"
	},
	{
		asset: "DOT",
		rate: .14,
		note: "Nominators"
	},
	{
		asset: "ADA",
		rate: .03,
		note: "Délégation"
	},
	{
		asset: "ATOM",
		rate: .15,
		note: "Cosmos"
	},
	{
		asset: "TRX",
		rate: .04,
		note: "SR vote"
	},
	{
		asset: "KSM",
		rate: .12,
		note: "Nominators"
	}
];
function StakingPage() {
	const balances = useTradingStore((s) => s.balances);
	const tickers = useTradingStore((s) => s.tickers);
	const [asset, setAsset] = (0, import_react.useState)("SOL");
	const held = balances.find((b) => b.asset === asset)?.available ?? 0;
	const [amount, setAmount] = (0, import_react.useState)(held ? String(held) : "10");
	const [years, setYears] = (0, import_react.useState)("3");
	const row = APR.find((r) => r.asset === asset);
	const qty = Number(amount) || 0;
	const y = Math.max(Number(years) || 0, 0);
	const future = (0, import_react.useMemo)(() => qty * Math.pow(1 + row.rate, y), [
		qty,
		row.rate,
		y
	]);
	const usdNow = usdValue(asset, qty, tickers);
	const usdLater = usdValue(asset, future, tickers);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Staking",
				kicker: "Simulation d’APR Kraken-like — hors lockup et slash"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto",
				children: APR.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setAsset(r.asset);
						const avail = balances.find((b) => b.asset === r.asset)?.available ?? 0;
						if (avail) setAmount(String(avail));
					},
					className: cn("h-9 shrink-0 rounded-full px-3 text-xs font-medium", asset === r.asset ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
					children: r.asset
				}, r.asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-1 text-xs text-muted-foreground",
					children: ["Quantité", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						inputMode: "decimal",
						className: "font-mono tabular-nums"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-1 text-xs text-muted-foreground",
					children: ["Années", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: years,
						onChange: (e) => setYears(e.target.value),
						inputMode: "decimal",
						className: "font-mono tabular-nums"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2 rounded-lg border border-border bg-card p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "APR indicatif",
						v: `${(row.rate * 100).toFixed(1)} %`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Mécanisme",
						v: row.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Valeur actuelle",
						v: formatFiat(usdNow)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: `Après ${y} ans`,
						v: `${formatQty(future, 6)} ${asset}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "USD projeté*",
						v: formatFiat(usdLater)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-subtle",
				children: "*Au prix spot actuel, sans variation de marché."
			})
		]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono tabular-nums",
			children: v
		})]
	});
}
//#endregion
export { StakingPage as component };
