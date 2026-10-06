import { i as __toESM } from "../_runtime.mjs";
import { It as PAIR_BY_ID, dt as formatQty, ot as formatDateTime, ut as formatPrice } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as downloadCsv } from "./stats-wybfxzw1.mjs";
import { s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-B-XeVhuB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage() {
	const [tab, setTab] = (0, import_react.useState)("open");
	const demoOrders = useTradingStore((s) => s.orders);
	const demoFills = useTradingStore((s) => s.fills);
	const demoPositions = useTradingStore((s) => s.positions);
	const krakenOrders = useTradingStore((s) => s.krakenOrders);
	const krakenFills = useTradingStore((s) => s.krakenFills);
	const krakenPositions = useTradingStore((s) => s.krakenPositions);
	const connection = useTradingStore((s) => s.connection);
	const live = isLiveConnected(connection);
	const orders = live ? krakenOrders : demoOrders;
	const fills = live ? krakenFills : demoFills;
	const positions = live ? krakenPositions : demoPositions;
	const tickers = useTradingStore((s) => s.tickers);
	const cancelOrder = useTradingStore((s) => s.cancelOrder);
	const cancelLiveOrder = useTradingStore((s) => s.cancelLiveOrder);
	const closePosition = useTradingStore((s) => s.closePosition);
	const closeLivePosition = useTradingStore((s) => s.closeLivePosition);
	const syncKraken = useTradingStore((s) => s.syncKraken);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const open = orders.filter((o) => o.status === "open");
	const hist = orders.filter((o) => o.status !== "open");
	const exportFills = () => {
		downloadCsv("nautilus-fills.csv", [[
			"time",
			"pair",
			"side",
			"amount",
			"price",
			"fee"
		], ...fills.map((f) => [
			new Date(f.time).toISOString(),
			PAIR_BY_ID[f.pair]?.display ?? f.pair,
			f.side,
			String(f.amount),
			String(f.price),
			String(f.fee)
		])]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight",
					children: "Ordres"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => {
							setBusy(true);
							syncKraken().finally(() => setBusy(false));
						},
						children: busy ? "Sync…" : "Synchroniser"
					}), fills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: exportFills,
						children: "Export CSV"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-1 overflow-x-auto",
				children: [
					["open", `Ouverts (${open.length})`],
					["positions", `Positions (${positions.length})`],
					["history", "Historique"],
					["fills", "Exécutions"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("h-9 shrink-0 rounded-full px-3 text-xs font-medium", tab === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
					children: label
				}, id))
			}),
			tab === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
				empty: "Aucun ordre ouvert.",
				children: open.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: o.side === "buy" ? "text-buy" : "text-sell",
								children: o.side === "buy" ? "Achat" : "Vente"
							}),
							" ",
							PAIR_BY_ID[o.pair]?.display,
							" · ",
							o.type,
							o.leverage > 1 ? ` · ${o.leverage}×` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							formatQty(o.amount, 6),
							" @ ",
							o.price ? formatPrice(o.price, PAIR_BY_ID[o.pair]?.pairDecimals ?? 2) : "marché"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => live ? void cancelLiveOrder(o.id) : cancelOrder(o.id),
						children: "Annuler"
					})]
				}, o.id))
			}),
			tab === "positions" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
				empty: "Aucune position margin.",
				children: positions.map((p) => {
					const pnl = ((tickers[p.pair]?.last ?? p.entry) - p.entry) * p.size * (p.side === "long" ? 1 : -1);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "space-y-2 border-b border-border py-3 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium",
									children: [
										PAIR_BY_ID[p.pair]?.display,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: p.side === "long" ? "text-buy" : "text-sell",
											children: [
												p.side === "long" ? "Long" : "Short",
												" ",
												p.leverage,
												"×"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("font-mono text-sm tabular-nums", pnl >= 0 ? "text-buy" : "text-sell"),
									children: [pnl >= 0 ? "+" : "", pnl.toFixed(2)]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs tabular-nums text-muted-foreground",
								children: [
									"Taille ",
									formatQty(p.size, 6),
									" · Entrée ",
									p.entry,
									" · Liq. ",
									p.liqPrice.toFixed(2),
									p.trailingPct ? ` · trail ${p.trailingPct}%` : ""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => live ? void closeLivePosition(p.id) : closePosition(p.id),
								children: "Clôturer"
							})
						]
					}, p.id);
				})
			}),
			tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
				empty: "Pas encore d’historique.",
				children: hist.slice(0, 40).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: o.side === "buy" ? "text-buy" : "text-sell",
								children: o.side === "buy" ? "Achat" : "Vente"
							}),
							" ",
							PAIR_BY_ID[o.pair]?.display,
							" · ",
							o.status,
							o.note ? ` · ${o.note}` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							formatQty(o.filled || o.amount, 6),
							" @ ",
							o.avgPrice || o.price || "—",
							" · ",
							formatDateTime(o.updatedAt)
						]
					})]
				}, o.id))
			}),
			tab === "fills" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
				empty: "Aucune exécution.",
				children: fills.slice(0, 50).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: f.side === "buy" ? "text-buy" : "text-sell",
							children: f.side === "buy" ? "Achat" : "Vente"
						}),
						" ",
						PAIR_BY_ID[f.pair]?.display
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums text-muted-foreground",
						children: [
							formatQty(f.amount, 6),
							" @ ",
							f.price
						]
					})]
				}, f.id))
			}),
			open.length === 0 && tab === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/trade/$pair",
				params: { pair: "XBTUSD" },
				className: "mt-4 inline-block text-sm text-accent",
				children: "Placer un ordre"
			})
		]
	});
}
function List({ empty, children }) {
	if (!(Array.isArray(children) ? children.length > 0 : Boolean(children))) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-10 text-center text-sm text-muted-foreground",
		children: empty
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 divide-y divide-border",
		children
	});
}
//#endregion
export { OrdersPage as component };
