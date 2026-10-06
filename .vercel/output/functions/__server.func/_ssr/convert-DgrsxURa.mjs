import { i as __toESM } from "../_runtime.mjs";
import { dt as formatQty } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { c as liveBalanceRows, l as usdValue, s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/convert-DgrsxURa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConvertPage() {
	const demoBalances = useTradingStore((s) => s.balances);
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const connection = useTradingStore((s) => s.connection);
	const live = isLiveConnected(connection);
	const balances = live ? liveBalanceRows(krakenBalances) : demoBalances;
	const tickers = useTradingStore((s) => s.tickers);
	const convert = useTradingStore((s) => s.convert);
	const convertLive = useTradingStore((s) => s.convertLive);
	const assets = (0, import_react.useMemo)(() => Array.from(/* @__PURE__ */ new Set([
		"USD",
		"EUR",
		...balances.filter((b) => b.available > 0).map((b) => b.asset)
	])), [balances]);
	const [from, setFrom] = (0, import_react.useState)("USD");
	const [to, setTo] = (0, import_react.useState)("BTC");
	const [amount, setAmount] = (0, import_react.useState)("100");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const fromBal = balances.find((b) => b.asset === from)?.available ?? 0;
	const usd = usdValue(from, Number(amount) || 0, tickers);
	const toPx = usdValue(to, 1, tickers);
	const preview = toPx ? usd / toPx * .9974 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Convertir",
			kicker: live ? "Ordre marché Kraken (frais taker)" : "Swap interne au compte démo, frais taker 0,26 %"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3",
			onSubmit: (e) => {
				e.preventDefault();
				const n = Number(amount) || 0;
				if (live) {
					setBusy(true);
					convertLive(from, to, n).then((res) => {
						setMsg(res.message);
						setBusy(false);
					});
					return;
				}
				const res = convert(from, to, n);
				setMsg(res.message);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-muted-foreground",
					children: ["Depuis", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: from,
						onChange: (e) => setFrom(e.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
						children: assets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a,
							children: a
						}, a))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "decimal",
					value: amount,
					onChange: (e) => setAmount(e.target.value),
					className: "font-mono tabular-nums"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Disponible ",
						formatQty(fromBal, 8),
						" ",
						from
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-muted-foreground",
					children: ["Vers", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: to,
						onChange: (e) => setTo(e.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
						children: [
							"BTC",
							"ETH",
							"SOL",
							"USD",
							"EUR",
							"XRP",
							"ADA",
							"DOGE"
						].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a,
							children: a
						}, a))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-muted px-3 py-3 font-mono text-sm tabular-nums",
					children: [
						"≈ ",
						preview ? preview.toPrecision(6) : "—",
						" ",
						to
					]
				}),
				msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: msg
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy,
					children: busy ? "Envoi…" : "Convertir"
				})
			]
		})]
	});
}
//#endregion
export { ConvertPage as component };
