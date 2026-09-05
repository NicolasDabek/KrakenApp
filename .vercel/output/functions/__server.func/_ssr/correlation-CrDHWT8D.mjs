import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn, w as fetchOhlc } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { n as logReturns, r as pearson } from "./stats-wybfxzw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/correlation-CrDHWT8D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var UNIVERSE = [
	"XBTUSD",
	"ETHUSD",
	"SOLUSD",
	"XRPUSD",
	"LINKUSD",
	"AVAXUSD"
];
function CorrelationPage() {
	const [matrix, setMatrix] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		Promise.all(UNIVERSE.map((pair) => fetchOhlc({ data: {
			pair,
			interval: 60
		} }))).then((series) => {
			if (cancelled) return;
			const rets = series.map((candles) => logReturns(candles.map((c) => c.close)));
			const m = UNIVERSE.map((_, i) => UNIVERSE.map((__, j) => pearson(rets[i] ?? [], rets[j] ?? [])));
			setMatrix(m);
		}).catch((err) => {
			if (!cancelled) setError(err instanceof Error ? err.message : "OHLC indisponible");
		});
		return () => {
			cancelled = true;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Corrélation",
				kicker: "Pearson sur rendements horaires Kraken (≈ 12 h)"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-sell",
				children: error
			}),
			!matrix && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 text-center text-sm text-muted-foreground",
				children: "Calcul des séries…"
			}),
			matrix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-80 border-separate border-spacing-1 text-center text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-12" }), UNIVERSE.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pb-1 font-medium text-muted-foreground",
						children: PAIR_BY_ID[id]?.displayBase
					}, id))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: UNIVERSE.map((rowId, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "pr-1 text-left font-medium text-muted-foreground",
						children: PAIR_BY_ID[rowId]?.displayBase
					}), matrix[i].map((v, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("grid h-11 place-items-center rounded-md font-mono tabular-nums", i === j && "text-foreground"),
						style: { background: v >= 0 ? `color-mix(in oklab, var(--color-buy) ${Math.round(v * 55)}%, var(--color-muted))` : `color-mix(in oklab, var(--color-sell) ${Math.round(-v * 55)}%, var(--color-muted))` },
						children: v.toFixed(2)
					}) }, `${i}-${j}`))] }, rowId)) })]
				})
			})
		]
	});
}
//#endregion
export { CorrelationPage as component };
