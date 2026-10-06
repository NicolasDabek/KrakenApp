import { i as __toESM } from "../_runtime.mjs";
import { It as PAIR_BY_ID, at as formatCompact, lt as formatPct, ut as formatPrice } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
import { g as Search, u as Star } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { t as Badge } from "./badge-Cl68uAGu.mjs";
import { n as biasTone, r as marketSignal } from "./signals-BSZYwJQv.mjs";
import { u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-list-DWPmu_4w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
export { MarketList as t };
