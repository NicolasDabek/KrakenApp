import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as formatPrice, E as formatCompact, O as formatFiat, b as usdValue, i as cn, k as formatPct, r as Route$18, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as Badge } from "./badge-CZ4ysjJY.mjs";
import { i as marketSignal, n as assetBoard, r as biasTone, t as MarketList } from "./market-list-CfEGAZ10.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D-kVJA2q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MarketOverview() {
	const tickers = useTradingStore((s) => s.tickers);
	const balances = useTradingStore((s) => s.balances);
	const watchlist = useTradingStore((s) => s.watchlist);
	const quote = useTradingStore((s) => s.settings.displayQuote);
	const lastPair = useTradingStore((s) => s.lastPair);
	const list = (0, import_react.useMemo)(() => Object.values(tickers), [tickers]);
	const assets = (0, import_react.useMemo)(() => assetBoard(tickers), [tickers]);
	const up = list.filter((t) => t.changePct > 0).length;
	const down = list.filter((t) => t.changePct < 0).length;
	const movers = (0, import_react.useMemo)(() => [...list].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 8), [list]);
	const totalUsd = balances.reduce((sum, b) => sum + usdValue(b.asset, b.available + b.hold, tickers), 0);
	const fx = usdValue("EUR", 1, tickers) || 1.08;
	const shown = quote === "EUR" ? totalUsd / fx : totalUsd;
	const dayPnl = list.length ? balances.reduce((sum, b) => {
		const t = list.find((x) => PAIR_BY_ID[x.id]?.base === b.asset && PAIR_BY_ID[x.id]?.quote === "USD");
		return sum + usdValue(b.asset, b.available + b.hold, tickers) * ((t?.changePct ?? 0) / 100);
	}, 0) : 0;
	const watched = watchlist.map((id) => tickers[id]).filter((t) => Boolean(t));
	const buys = assets.filter((a) => a.signal.bias === "buy").length;
	const sells = assets.filter((a) => a.signal.bias === "sell").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-4 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Bureau Kraken"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-3xl font-medium tabular-nums tracking-tight",
						children: formatFiat(shown, quote)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("mt-1 font-mono text-sm tabular-nums", dayPnl >= 0 ? "text-buy" : "text-sell"),
						children: [formatFiat(dayPnl), " / 24h"]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/trade/$pair",
					params: { pair: lastPair },
					className: "h-11 rounded-md bg-foreground px-4 text-sm font-medium leading-[2.75rem] text-background",
					children: "Trader"
				})]
			}),
			list.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1.5 flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Largeur du marché" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					up,
					" haussier · ",
					down,
					" baissier",
					assets.length > 0 ? ` · ${buys} à acheter · ${sells} à vendre` : ""
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-1.5 overflow-hidden rounded-full bg-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-buy",
					style: { width: `${list.length ? up / list.length * 100 : 50}%` }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-sell",
					style: { width: `${list.length ? down / list.length * 100 : 50}%` }
				})]
			})] }),
			watched.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-x-auto pb-1 font-mono text-xs tabular-nums",
				children: watched.map((t) => {
					const meta = PAIR_BY_ID[t.id];
					const positive = t.changePct >= 0;
					const sig = marketSignal(t);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/trade/$pair",
						params: { pair: t.id },
						className: "shrink-0 rounded-md bg-muted px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: meta?.displayBase ?? t.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-foreground",
								children: formatPrice(t.last, meta?.pairDecimals ?? 2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("ml-2", positive ? "text-buy" : "text-sell"),
								children: formatPct(t.changePct)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("ml-2", sig.bias === "buy" ? "text-buy" : sig.bias === "sell" ? "text-sell" : "text-subtle"),
								children: sig.label
							})
						]
					}, t.id);
				})
			}),
			assets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Valeur des devises"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
				children: assets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/trade/$pair",
					params: { pair: a.pairId },
					className: "flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: a.base
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: biasTone(a.signal.bias),
									children: a.signal.label
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 font-mono text-sm tabular-nums tracking-tight",
								children: formatFiat(a.lastEur, "EUR")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-mono text-xs tabular-nums text-muted-foreground",
								children: formatFiat(a.lastUsd, "USD")
							}),
							a.signal.reasons[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: a.signal.reasons[0]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 text-right",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("font-mono text-sm tabular-nums", a.changePct >= 0 ? "text-buy" : "text-sell"),
								children: formatPct(a.changePct)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs tabular-nums text-subtle",
								children: [
									"VWAP ",
									a.signal.vsVwapPct >= 0 ? "+" : "",
									a.signal.vsVwapPct.toFixed(2),
									"%"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 text-xs text-subtle",
								children: ["Vol ", formatCompact(a.quoteVolume)]
							})
						]
					})]
				}) }, a.base))
			})] }),
			movers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Moteurs 24h"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: movers.map((t) => {
					const meta = PAIR_BY_ID[t.id];
					const positive = t.changePct >= 0;
					const sig = marketSignal(t);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/trade/$pair",
						params: { pair: t.id },
						className: "flex min-w-32 shrink-0 flex-col justify-between rounded-lg bg-card p-3",
						style: { background: positive ? "color-mix(in oklab, var(--color-buy) 16%, var(--color-card))" : "color-mix(in oklab, var(--color-sell) 16%, var(--color-card))" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: meta?.display ?? t.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("mt-2 font-mono text-sm tabular-nums", positive ? "text-buy" : "text-sell"),
								children: formatPct(t.changePct)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 text-xs text-muted-foreground",
								children: sig.label
							})
						]
					}, t.id);
				})
			})] })
		]
	});
}
function MarketsPage() {
	const data = Route$18.useLoaderData();
	(0, import_react.useEffect)(() => {
		if (data.length) useTradingStore.getState().hydrateTickers(data);
	}, [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl lg:max-w-5xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketOverview, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketList, {
			seed: data,
			embedded: true
		})]
	});
}
//#endregion
export { MarketsPage as component };
