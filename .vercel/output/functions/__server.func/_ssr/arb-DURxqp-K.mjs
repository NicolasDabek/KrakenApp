import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as formatPrice, h as eurUsdRate, i as cn, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/arb-DURxqp-K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArbPage() {
	const tickers = useTradingStore((s) => s.tickers);
	const fx = eurUsdRate(tickers);
	const rows = (0, import_react.useMemo)(() => {
		const byBase = /* @__PURE__ */ new Map();
		for (const t of Object.values(tickers)) {
			const meta = PAIR_BY_ID[t.id];
			if (!meta) continue;
			const g = byBase.get(meta.base) ?? {};
			if (meta.quote === "USD") g.usdId = t.id;
			if (meta.quote === "EUR") g.eurId = t.id;
			byBase.set(meta.base, g);
		}
		const out = [];
		for (const [base, g] of byBase) {
			if (!g.usdId || !g.eurId) continue;
			const usd = tickers[g.usdId];
			const eur = tickers[g.eurId];
			if (!usd || !eur || !fx) continue;
			const impliedEur = usd.last / fx;
			const diff = eur.last - impliedEur;
			const bps = impliedEur ? diff / impliedEur * 1e4 : 0;
			out.push({
				base,
				usdId: g.usdId,
				eurId: g.eurId,
				usd: usd.last,
				eur: eur.last,
				impliedEur,
				bps
			});
		}
		return out.sort((a, b) => Math.abs(b.bps) - Math.abs(a.bps));
	}, [tickers, fx]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Écart USD / EUR",
				kicker: `EURUSD implicite ${fx.toFixed(4)} via BTC · écart en points de base`
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-12 text-center text-sm text-muted-foreground",
				children: "En attente des paires EUR."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: r.base
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							"USD ",
							formatPrice(r.usd, PAIR_BY_ID[r.usdId]?.pairDecimals ?? 2),
							" · EUR",
							" ",
							formatPrice(r.eur, PAIR_BY_ID[r.eurId]?.pairDecimals ?? 2)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/trade/$pair",
						params: { pair: Math.abs(r.bps) > 0 && r.bps > 0 ? r.eurId : r.usdId },
						className: cn("font-mono text-sm tabular-nums", Math.abs(r.bps) >= 15 ? "text-warning" : "text-muted-foreground"),
						children: [
							r.bps >= 0 ? "+" : "",
							r.bps.toFixed(1),
							" pb"
						]
					})]
				}, r.base))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs leading-relaxed text-subtle",
				children: "Un écart positif signifie que le livre EUR cote plus cher que le USD converti. Frais et spread rendent l’arbitrage souvent infaisable — l’outil sert de radar, pas d’exécution."
			})
		]
	});
}
//#endregion
export { ArbPage as component };
