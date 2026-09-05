import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Star, p as Search } from "../_libs/lucide-react.mjs";
import { A as formatPrice, E as formatCompact, i as cn, k as formatPct, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
import { t as Badge } from "./badge-CZ4ysjJY.mjs";
import { i as rangePosition } from "./stats-wybfxzw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-list-CfEGAZ10.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function marketSignal(t) {
	if (!t || !(t.last > 0)) return {
		bias: "wait",
		score: 0,
		label: "—",
		reasons: [],
		vsVwapPct: 0,
		rangePos: .5,
		spreadPct: 0
	};
	const vsVwapPct = t.vwap > 0 ? (t.last - t.vwap) / t.vwap * 100 : 0;
	const rangePos = rangePosition(t.low, t.high, t.last);
	const spreadPct = t.ask > 0 && t.bid > 0 ? (t.ask - t.bid) / t.last * 100 : 0;
	let score = 0;
	const reasons = [];
	if (vsVwapPct <= -.12) {
		score += 1;
		reasons.push("Sous la VWAP");
	} else if (vsVwapPct >= .12) {
		score -= 1;
		reasons.push("Au-dessus de la VWAP");
	}
	if (rangePos <= .18) {
		score += 1;
		reasons.push("Bas du range 24h");
	} else if (rangePos >= .82) {
		score -= 1;
		reasons.push("Haut du range 24h");
	}
	if (t.changePct <= -2) {
		score += 1;
		reasons.push("Pression vendeuse 24h");
	} else if (t.changePct >= 2) {
		score -= 1;
		reasons.push("Extension haussière 24h");
	}
	if (spreadPct > .35) reasons.push("Spread large");
	const bias = score >= 2 ? "buy" : score <= -2 ? "sell" : "wait";
	return {
		bias,
		score,
		label: bias === "buy" ? "Acheter" : bias === "sell" ? "Vendre" : "Attendre",
		reasons,
		vsVwapPct,
		rangePos,
		spreadPct
	};
}
function biasTone(bias) {
	if (bias === "buy") return "buy";
	if (bias === "sell") return "sell";
	return "neutral";
}
function assetBoard(tickers) {
	const byBase = /* @__PURE__ */ new Map();
	for (const t of Object.values(tickers)) {
		const meta = PAIR_BY_ID[t.id];
		if (!meta) continue;
		const slot = byBase.get(meta.base) ?? {};
		if (meta.quote === "EUR") slot.eur = t;
		if (meta.quote === "USD") slot.usd = t;
		byBase.set(meta.base, slot);
	}
	const fx = (() => {
		const a = tickers.XBTUSD?.last;
		const b = tickers.XBTEUR?.last;
		return a && b ? a / b : 1.08;
	})();
	const out = [];
	for (const [base, slot] of byBase) {
		if (!(slot.eur ?? slot.usd)) continue;
		const lastEur = slot.eur?.last ?? (slot.usd ? slot.usd.last / fx : 0);
		const lastUsd = slot.usd?.last ?? (slot.eur ? slot.eur.last * fx : 0);
		out.push({
			base,
			pairId: (slot.eur ?? slot.usd).id,
			eur: slot.eur,
			usd: slot.usd,
			lastEur,
			lastUsd,
			changePct: (slot.eur ?? slot.usd).changePct,
			volume: (slot.eur ?? slot.usd).volume,
			quoteVolume: (slot.eur ?? slot.usd).quoteVolume,
			high: (slot.eur ?? slot.usd).high,
			low: (slot.eur ?? slot.usd).low,
			vwap: (slot.eur ?? slot.usd).vwap,
			signal: marketSignal(slot.eur ?? slot.usd)
		});
	}
	out.sort((a, b) => b.quoteVolume - a.quoteVolume);
	return out;
}
function MarketList({ compact = false, embedded = false, seed = [] }) {
	const live = useTradingStore((s) => s.tickers);
	const tickers = Object.keys(live).length ? live : Object.fromEntries(seed.map((t) => [t.id, t]));
	const watchlist = useTradingStore((s) => s.watchlist);
	const toggleWatch = useTradingStore((s) => s.toggleWatch);
	const [q, setQ] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("vol");
	const rows = (0, import_react.useMemo)(() => {
		let list = Object.values(tickers);
		const query = q.trim().toLowerCase();
		if (query) list = list.filter((t) => {
			const meta = PAIR_BY_ID[t.id];
			return t.id.toLowerCase().includes(query) || meta?.display.toLowerCase().includes(query) || meta?.base.toLowerCase().includes(query);
		});
		if (filter === "fav") list = list.filter((t) => watchlist.includes(t.id));
		if (filter === "usd") list = list.filter((t) => PAIR_BY_ID[t.id]?.quote === "USD");
		if (filter === "eur") list = list.filter((t) => PAIR_BY_ID[t.id]?.quote === "EUR");
		if (filter === "up") list = list.filter((t) => t.changePct > 0);
		if (filter === "down") list = list.filter((t) => t.changePct < 0);
		if (filter === "buy" || filter === "sell" || filter === "wait") list = list.filter((t) => marketSignal(t).bias === filter);
		list = [...list].sort((a, b) => {
			if (sort === "chg") return Math.abs(b.changePct) - Math.abs(a.changePct);
			if (sort === "name") return (PAIR_BY_ID[a.id]?.display ?? "").localeCompare(PAIR_BY_ID[b.id]?.display ?? "");
			if (sort === "signal") return Math.abs(marketSignal(b).score) - Math.abs(marketSignal(a).score);
			return b.quoteVolume - a.quoteVolume;
		});
		return list;
	}, [
		tickers,
		q,
		filter,
		sort,
		watchlist
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("sticky top-0 z-10 space-y-3 bg-background", compact ? "pb-3" : "px-4 pb-3 pt-4"),
			children: [
				!compact && !embedded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight",
					children: "Marchés"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Prix spot Kraken en direct"
				})] }),
				embedded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Tous les marchés"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Rechercher BTC, SOL, EUR…",
						className: "pl-9",
						"aria-label": "Rechercher une paire"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 overflow-x-auto pb-1",
					children: [[
						{
							id: "all",
							label: "Tous"
						},
						{
							id: "fav",
							label: "Favoris"
						},
						{
							id: "eur",
							label: "EUR"
						},
						{
							id: "usd",
							label: "USD"
						},
						{
							id: "buy",
							label: "Acheter"
						},
						{
							id: "sell",
							label: "Vendre"
						},
						{
							id: "up",
							label: "Hausse"
						},
						{
							id: "down",
							label: "Baisse"
						}
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilter(c.id),
						className: cn("h-8 shrink-0 rounded-full px-3 text-xs font-medium transition-colors duration-150", filter === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
						children: c.label
					}, c.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSort(sort === "vol" ? "chg" : sort === "chg" ? "signal" : sort === "signal" ? "name" : "vol"),
						className: "ml-auto h-8 shrink-0 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground",
						children: sort === "vol" ? "Volume" : sort === "chg" ? "Variation" : sort === "signal" ? "Signal" : "Nom"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-12 text-center text-sm text-muted-foreground",
				children: Object.keys(tickers).length === 0 ? "Chargement des marchés Kraken…" : "Aucun marché ne correspond."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border lg:grid lg:grid-cols-2 lg:divide-y-0",
				children: rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketRow, {
					ticker: t,
					fav: watchlist.includes(t.id),
					onFav: () => toggleWatch(t.id),
					compact
				}, t.id))
			})
		})]
	});
}
function MarketRow({ ticker, fav, onFav, compact }) {
	const meta = PAIR_BY_ID[ticker.id];
	const up = ticker.changePct >= 0;
	const sig = marketSignal(ticker);
	const quote = meta?.quote === "EUR" ? "EUR" : "USD";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": fav ? "Retirer des favoris" : "Ajouter aux favoris",
				onClick: onFav,
				className: "grid size-11 place-items-center text-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", fav && "fill-warning text-warning") })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/trade/$pair",
				params: { pair: ticker.id },
				className: "flex min-w-0 flex-1 items-center justify-between py-3 pr-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: meta?.display ?? ticker.id
							}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-subtle",
								children: formatCompact(ticker.quoteVolume)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangeBar, {
								low: ticker.low,
								high: ticker.high,
								last: ticker.last
							}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: biasTone(sig.bias),
								children: sig.label
							})]
						}),
						!compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-subtle",
							children: [
								"VWAP ",
								sig.vsVwapPct >= 0 ? "+" : "",
								sig.vsVwapPct.toFixed(2),
								"% · range ",
								(sig.rangePos * 100).toFixed(0),
								"%",
								sig.spreadPct > 0 ? ` · spr. ${sig.spreadPct.toFixed(2)}%` : ""
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-sm tabular-nums",
							children: [formatPrice(ticker.last, meta?.pairDecimals ?? 2), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-xs text-subtle",
								children: quote
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-mono text-xs tabular-nums", up ? "text-buy" : "text-sell"),
							children: formatPct(ticker.changePct)
						}),
						compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("text-xs", sig.bias === "buy" ? "text-buy" : sig.bias === "sell" ? "text-sell" : "text-subtle"),
							children: sig.label
						})
					]
				})]
			})]
		})
	});
}
function RangeBar({ low, high, last }) {
	const t = high === low ? .5 : Math.min(1, Math.max(0, (last - low) / (high - low)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-0.5 h-1 w-24 overflow-hidden rounded-full bg-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "range-track absolute inset-0 opacity-70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-foreground",
			style: { left: `calc(${t * 100}% - 3px)` }
		})]
	});
}
//#endregion
export { marketSignal as i, assetBoard as n, biasTone as r, MarketList as t };
