import { i as __toESM } from "../_runtime.mjs";
import { It as PAIR_BY_ID, at as formatCompact, lt as formatPct, ut as formatPrice } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Segmented } from "./segmented-DgitihsW.mjs";
import { i as rangePosition } from "./stats-wybfxzw1.mjs";
import { u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screener-2IhJ_x90.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ScreenerPage() {
	const tickersMap = useTradingStore((s) => s.tickers);
	const tickers = Object.values(tickersMap);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("chg");
	const rows = (0, import_react.useMemo)(() => {
		let list = [...tickers];
		if (filter === "eur") list = list.filter((t) => PAIR_BY_ID[t.id]?.quote === "EUR");
		if (filter === "breakout") list = list.filter((t) => rangePosition(t.low, t.high, t.last) >= .9);
		if (filter === "oversold") list = list.filter((t) => rangePosition(t.low, t.high, t.last) <= .1);
		if (filter === "volume") {
			const ranked = [...list].sort((a, b) => b.quoteVolume - a.quoteVolume);
			const cut = ranked[Math.floor(ranked.length * .25)]?.quoteVolume ?? 0;
			list = list.filter((t) => t.quoteVolume >= cut);
		}
		if (filter === "volatile") list = list.filter((t) => Math.abs(t.changePct) >= 4);
		list.sort((a, b) => {
			if (sort === "vol") return b.quoteVolume - a.quoteVolume;
			if (sort === "range") return (b.high - b.low) / b.last - (a.high - a.low) / a.last;
			return Math.abs(b.changePct) - Math.abs(a.changePct);
		});
		return list;
	}, [
		tickers,
		filter,
		sort
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Screener",
				kicker: "Filtres sur le spot Kraken du jour"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
				value: filter,
				onChange: setFilter,
				options: [
					{
						id: "all",
						label: "Tous"
					},
					{
						id: "eur",
						label: "EUR"
					},
					{
						id: "breakout",
						label: "Breakout"
					},
					{
						id: "oversold",
						label: "Survente"
					},
					{
						id: "volume",
						label: "Volume"
					},
					{
						id: "volatile",
						label: "Volatil"
					}
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSort(sort === "chg" ? "vol" : sort === "vol" ? "range" : "chg"),
					className: "h-8 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground",
					children: sort === "chg" ? "Variation" : sort === "vol" ? "Volume" : "Range"
				})
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 text-center text-sm text-muted-foreground",
				children: "Aucun résultat."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 divide-y divide-border",
				children: rows.map((t) => {
					const meta = PAIR_BY_ID[t.id];
					const pos = rangePosition(t.low, t.high, t.last);
					const up = t.changePct >= 0;
					const rangePct = t.last ? (t.high - t.low) / t.last * 100 : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/trade/$pair",
						params: { pair: t.id },
						className: "flex items-center justify-between py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: meta?.display ?? t.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs tabular-nums text-muted-foreground",
								children: [
									"Vol ",
									formatCompact(t.quoteVolume),
									" · Range ",
									rangePct.toFixed(1),
									"%"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "range-track absolute inset-0 opacity-70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground",
									style: { left: `calc(${pos * 100}% - 3px)` }
								})]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums",
								children: formatPrice(t.last, meta?.pairDecimals ?? 2)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-mono text-xs tabular-nums", up ? "text-buy" : "text-sell"),
								children: formatPct(t.changePct)
							})]
						})]
					}) }, t.id);
				})
			})
		]
	});
}
//#endregion
export { ScreenerPage as component };
