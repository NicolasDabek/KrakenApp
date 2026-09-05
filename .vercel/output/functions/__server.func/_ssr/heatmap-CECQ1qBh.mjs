import { i as PAIR_BY_ID } from "./pairs-DHGeMw8F.mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn, k as formatPct, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/heatmap-CECQ1qBh.js
var import_jsx_runtime = require_jsx_runtime();
function HeatmapPage() {
	const tickersMap = useTradingStore((s) => s.tickers);
	const ranked = [...Object.values(tickersMap)].sort((a, b) => b.quoteVolume - a.quoteVolume);
	const maxVol = ranked[0]?.quoteVolume || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Heatmap",
			kicker: "Surface ≈ volume 24h · couleur = variation du jour Kraken"
		}), ranked.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-12 text-center text-sm text-muted-foreground",
			children: "Chargement des marchés…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
			children: ranked.map((t) => {
				const pct = t.changePct;
				const intensity = Math.min(Math.abs(pct) / 8, 1);
				const up = pct >= 0;
				const meta = PAIR_BY_ID[t.id];
				const span = t.quoteVolume / maxVol > .45 ? "col-span-2 row-span-2 min-h-36" : "min-h-24";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/trade/$pair",
					params: { pair: t.id },
					className: cn("flex flex-col justify-between rounded-lg p-3 transition-transform duration-150 active:scale-[0.96]", span),
					style: { background: up ? `color-mix(in oklab, var(--color-buy) ${18 + intensity * 42}%, var(--color-card))` : `color-mix(in oklab, var(--color-sell) ${18 + intensity * 42}%, var(--color-card))` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: meta?.display ?? t.id
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-mono text-lg tabular-nums",
						children: t.last.toLocaleString("fr-FR")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-mono text-sm tabular-nums", up ? "text-buy" : "text-sell"),
						children: formatPct(pct)
					})] })]
				}, t.id);
			})
		})]
	});
}
//#endregion
export { HeatmapPage as component };
