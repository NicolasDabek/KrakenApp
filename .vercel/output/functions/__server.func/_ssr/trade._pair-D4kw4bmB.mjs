import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID, r as INTERVALS, t as DEFAULT_PAIR } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as ChevronDown, l as Star, n as X } from "../_libs/lucide-react.mjs";
import { A as formatPrice, M as formatTime, O as formatFiat, S as vwap, _ as macd, a as useBookEngine, d as bollinger, i as cn, j as formatQty, k as formatPct, l as atr, m as ema, n as Route, v as rsi, w as fetchOhlc, x as useTradingStore, y as stochastic } from "./router-DFwZ_5tV.mjs";
import { t as Button } from "./button-D7MFyafD.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
import { t as Sheet } from "./sheet-hSSPeHqD.mjs";
import { t as Badge } from "./badge-CZ4ysjJY.mjs";
import { i as marketSignal, r as biasTone, t as MarketList } from "./market-list-CfEGAZ10.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade._pair-D4kw4bmB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INDICATORS = [
	{
		id: "none",
		label: "Off"
	},
	{
		id: "ema",
		label: "EMA"
	},
	{
		id: "bb",
		label: "BB"
	},
	{
		id: "vwap",
		label: "VWAP"
	},
	{
		id: "rsi",
		label: "RSI"
	},
	{
		id: "macd",
		label: "MACD"
	},
	{
		id: "atr",
		label: "ATR"
	},
	{
		id: "stoch",
		label: "Stoch"
	}
];
function CandleChart({ pair }) {
	const [interval, setIntervalId] = (0, import_react.useState)(60);
	const [indicator, setIndicator] = (0, import_react.useState)("ema");
	const [candles, setCandles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const host = (0, import_react.useRef)(null);
	const sub = (0, import_react.useRef)(null);
	const bag = (0, import_react.useRef)(null);
	const candlesRef = (0, import_react.useRef)([]);
	const last = useTradingStore((s) => s.tickers[pair]?.last);
	(0, import_react.useEffect)(() => {
		candlesRef.current = candles;
	}, [candles]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoading(true);
		fetchOhlc({ data: {
			pair,
			interval
		} }).then((rows) => {
			if (!cancelled) setCandles(rows);
		}).catch(() => {
			if (!cancelled) setCandles([]);
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [pair, interval]);
	(0, import_react.useEffect)(() => {
		if (!host.current || loading || candles.length < 2) return;
		let disposed = false;
		const ro = new ResizeObserver(() => {
			const node = host.current;
			if (bag.current && node) bag.current.chart.resize(node.clientWidth, node.clientHeight);
		});
		(async () => {
			const lc = await import("../_libs/lightweight-charts.mjs").then((n) => n.t);
			if (disposed || !host.current) return;
			const node = host.current;
			const created = lc.createChart(node, {
				autoSize: true,
				layout: {
					background: {
						type: lc.ColorType.Solid,
						color: "#090A0C"
					},
					textColor: "#8B929E",
					fontFamily: "IBM Plex Sans, sans-serif",
					attributionLogo: false
				},
				grid: {
					vertLines: { color: "#252A33" },
					horzLines: { color: "#252A33" }
				},
				rightPriceScale: { borderColor: "#252A33" },
				timeScale: {
					borderColor: "#252A33",
					timeVisible: interval < 1440,
					secondsVisible: false
				},
				crosshair: { mode: lc.CrosshairMode.Normal }
			});
			const candleSeries = created.addSeries(lc.CandlestickSeries, {
				upColor: "#2FBE8F",
				downColor: "#E85D6C",
				borderVisible: false,
				wickUpColor: "#2FBE8F",
				wickDownColor: "#E85D6C"
			});
			candleSeries.setData(candles.map((c) => ({
				time: c.time,
				open: c.open,
				high: c.high,
				low: c.low,
				close: c.close
			})));
			const vol = created.addSeries(lc.HistogramSeries, {
				priceScaleId: "vol",
				priceFormat: { type: "volume" }
			});
			created.priceScale("vol").applyOptions({ scaleMargins: {
				top: .78,
				bottom: 0
			} });
			vol.setData(candles.map((c) => ({
				time: c.time,
				value: c.volume,
				color: c.close >= c.open ? "rgba(47,190,143,0.35)" : "rgba(232,93,108,0.35)"
			})));
			const closes = candles.map((c) => c.close);
			const overlay = (values, color) => {
				created.addSeries(lc.LineSeries, {
					color,
					lineWidth: 1,
					priceLineVisible: false,
					lastValueVisible: false
				}).setData(candles.flatMap((c, i) => {
					const v = values[i];
					return v == null ? [] : [{
						time: c.time,
						value: v
					}];
				}));
			};
			if (indicator === "ema") {
				overlay(ema(closes, 20), "#5B8CFF");
				overlay(ema(closes, 50), "#D4A054");
			}
			if (indicator === "bb") {
				const bb = bollinger(closes, 20, 2);
				overlay(bb.upper, "rgba(91,140,255,0.55)");
				overlay(bb.mid, "#5B8CFF");
				overlay(bb.lower, "rgba(91,140,255,0.55)");
			}
			if (indicator === "vwap") overlay(vwap(candles), "#D4A054");
			const pane = indicator === "rsi" || indicator === "macd" || indicator === "atr" || indicator === "stoch";
			let subChart;
			if (pane && sub.current) {
				subChart = lc.createChart(sub.current, {
					autoSize: true,
					layout: {
						background: {
							type: lc.ColorType.Solid,
							color: "#090A0C"
						},
						textColor: "#8B929E",
						fontFamily: "IBM Plex Sans, sans-serif",
						attributionLogo: false
					},
					grid: {
						vertLines: { color: "#252A33" },
						horzLines: { color: "#252A33" }
					},
					rightPriceScale: { borderColor: "#252A33" },
					timeScale: {
						visible: false,
						borderColor: "#252A33"
					}
				});
				created.timeScale().subscribeVisibleLogicalRangeChange((range) => {
					if (range) subChart?.timeScale().setVisibleLogicalRange(range);
				});
				if (indicator === "rsi") {
					const series = subChart.addSeries(lc.LineSeries, {
						color: "#5B8CFF",
						lineWidth: 1
					});
					const values = rsi(closes, 14);
					series.setData(candles.flatMap((c, i) => {
						const v = values[i];
						return v == null ? [] : [{
							time: c.time,
							value: v
						}];
					}));
				} else if (indicator === "macd") {
					const m = macd(closes);
					subChart.addSeries(lc.HistogramSeries, { priceLineVisible: false }).setData(candles.flatMap((c, i) => {
						const v = m.hist[i];
						return v == null ? [] : [{
							time: c.time,
							value: v,
							color: v >= 0 ? "rgba(47,190,143,0.7)" : "rgba(232,93,108,0.7)"
						}];
					}));
					subChart.addSeries(lc.LineSeries, {
						color: "#5B8CFF",
						lineWidth: 1
					}).setData(candles.flatMap((c, i) => {
						const v = m.line[i];
						return v == null ? [] : [{
							time: c.time,
							value: v
						}];
					}));
				} else if (indicator === "atr") {
					const series = subChart.addSeries(lc.LineSeries, {
						color: "#D4A054",
						lineWidth: 1
					});
					const values = atr(candles, 14);
					series.setData(candles.flatMap((c, i) => {
						const v = values[i];
						return v == null ? [] : [{
							time: c.time,
							value: v
						}];
					}));
				} else {
					const st = stochastic(candles);
					subChart.addSeries(lc.LineSeries, {
						color: "#5B8CFF",
						lineWidth: 1
					}).setData(candles.flatMap((c, i) => {
						const v = st.k[i];
						return v == null ? [] : [{
							time: c.time,
							value: v
						}];
					}));
					subChart.addSeries(lc.LineSeries, {
						color: "#D4A054",
						lineWidth: 1
					}).setData(candles.flatMap((c, i) => {
						const v = st.d[i];
						return v == null ? [] : [{
							time: c.time,
							value: v
						}];
					}));
				}
			}
			created.timeScale().fitContent();
			bag.current = {
				chart: created,
				sub: subChart,
				candle: candleSeries,
				vol
			};
			ro.observe(node);
		})();
		return () => {
			disposed = true;
			ro.disconnect();
			bag.current?.chart.remove();
			bag.current?.sub?.remove();
			bag.current = null;
		};
	}, [
		loading,
		pair,
		interval,
		indicator
	]);
	(0, import_react.useEffect)(() => {
		if (!last || !Number.isFinite(last)) return;
		const prev = candlesRef.current;
		if (prev.length === 0) return;
		const cur = prev[prev.length - 1];
		const step = interval * 60;
		const now = Math.floor(Date.now() / 1e3);
		let next;
		if (now >= cur.time + step) {
			next = {
				time: cur.time + Math.floor((now - cur.time) / step) * step,
				open: last,
				high: last,
				low: last,
				close: last,
				volume: 0
			};
			candlesRef.current = [...prev, next];
		} else {
			if (cur.close === last) return;
			next = {
				...cur,
				close: last,
				high: Math.max(cur.high, last),
				low: Math.min(cur.low, last)
			};
			candlesRef.current = [...prev.slice(0, -1), next];
		}
		try {
			bag.current?.candle.update({
				time: next.time,
				open: next.open,
				high: next.high,
				low: next.low,
				close: next.close
			});
		} catch {}
	}, [last, interval]);
	const pane = indicator === "rsi" || indicator === "macd" || indicator === "atr" || indicator === "stoch";
	const meta = PAIR_BY_ID[pair];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 overflow-x-auto px-3 py-2",
			children: [
				INTERVALS.map((tf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setIntervalId(tf.id),
					className: cn("h-8 shrink-0 rounded-sm px-2.5 text-xs font-medium", interval === tf.id ? "bg-muted text-foreground" : "text-muted-foreground"),
					children: tf.label
				}, tf.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-4 w-px bg-border" }),
				INDICATORS.map((ind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setIndicator(ind.id),
					className: cn("h-8 shrink-0 rounded-sm px-2.5 text-xs font-medium", indicator === ind.id ? "bg-muted text-foreground" : "text-muted-foreground"),
					children: ind.label
				}, ind.id))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-h-64 flex-1",
			children: [
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 z-10 grid place-items-center text-sm text-muted-foreground",
					children: [
						"Chargement ",
						meta?.display,
						"…"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: host,
					className: cn("w-full", pane ? "h-52" : "h-72")
				}),
				pane && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: sub,
					className: "h-24 w-full border-t border-border"
				})
			]
		})]
	});
}
function DepthChart({ pair }) {
	const book = useTradingStore((s) => s.books[pair]);
	const path = (0, import_react.useMemo)(() => {
		if (!book) return null;
		const bids = [...book.bids].slice(0, 20).sort((a, b) => a.price - b.price);
		const asks = [...book.asks].slice(0, 20).sort((a, b) => a.price - b.price);
		if (bids.length === 0 || asks.length === 0) return null;
		const minP = bids[0].price;
		const span = asks[asks.length - 1].price - minP || 1;
		const maxT = Math.max(bids[bids.length - 1]?.total ?? 1, asks[asks.length - 1]?.total ?? 1);
		const x = (p) => (p - minP) / span * 100;
		const y = (t) => 100 - t / maxT * 92;
		return {
			bidD: bids.map((l, i) => `${i === 0 ? "M" : "L"} ${x(l.price).toFixed(2)} ${y(l.total).toFixed(2)}`).join(" "),
			askD: asks.map((l, i) => `${i === 0 ? "M" : "L"} ${x(l.price).toFixed(2)} ${y(l.total).toFixed(2)}`).join(" "),
			mid: x((book.bids[0].price + book.asks[0].price) / 2)
		};
	}, [book]);
	if (!path) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-32 place-items-center text-xs text-muted-foreground",
		children: "Profondeur indisponible"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 100 100",
		className: "h-32 w-full",
		preserveAspectRatio: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `${path.bidD} L ${path.mid} 100 L 0 100 Z`,
				fill: "rgba(47,190,143,0.22)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: path.bidD,
				fill: "none",
				stroke: "#2FBE8F",
				strokeWidth: "1.2",
				vectorEffect: "non-scaling-stroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `${path.askD} L 100 100 L ${path.mid} 100 Z`,
				fill: "rgba(232,93,108,0.22)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: path.askD,
				fill: "none",
				stroke: "#E85D6C",
				strokeWidth: "1.2",
				vectorEffect: "non-scaling-stroke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: path.mid,
				x2: path.mid,
				y1: "0",
				y2: "100",
				stroke: "#252A33",
				strokeWidth: "1"
			})
		]
	});
}
function OrderBook({ pair, onPrice }) {
	const book = useTradingStore((s) => s.books[pair]);
	const last = useTradingStore((s) => s.tickers[pair]?.last);
	const meta = PAIR_BY_ID[pair];
	const asks = (book?.asks ?? []).slice(0, 12).slice().reverse();
	const bids = (book?.bids ?? []).slice(0, 12);
	const max = Math.max(...asks.map((l) => l.total), ...bids.map((l) => l.total), 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Prix (",
						meta?.quote,
						")"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Qté (",
						meta?.base,
						")"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cumul" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: asks.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookRow, {
					price: l.price,
					size: l.size,
					total: l.total,
					max,
					decimals: meta?.pairDecimals ?? 2,
					side: "sell",
					onClick: () => onPrice?.(l.price)
				}, `a-${l.price}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "my-2 flex items-center justify-between rounded-sm bg-muted px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-sm tabular-nums text-foreground",
					children: formatPrice(last ?? 0, meta?.pairDecimals ?? 2)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [
						"Spread ",
						formatPrice(book?.spread ?? 0, meta?.pairDecimals ?? 2),
						book ? ` · ${book.spreadPct.toFixed(3)} %` : ""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: bids.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookRow, {
					price: l.price,
					size: l.size,
					total: l.total,
					max,
					decimals: meta?.pairDecimals ?? 2,
					side: "buy",
					onClick: () => onPrice?.(l.price)
				}, `b-${l.price}`))
			})
		]
	});
}
function BookRow({ price, size, total, max, decimals, side, onClick }) {
	const pct = Math.min(100, total / max * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "relative flex w-full items-center justify-between px-1 py-0.5 font-mono text-xs tabular-nums",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("absolute inset-y-0 right-0 rounded-sm opacity-25", side === "buy" ? "bg-buy" : "bg-sell"),
				style: { width: `${pct}%` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("relative", side === "buy" ? "text-buy" : "text-sell"),
				children: formatPrice(price, decimals)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "relative text-foreground",
				children: formatQty(size, 5)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "relative text-muted-foreground",
				children: formatQty(total, 4)
			})
		]
	});
}
var TYPES = [
	{
		id: "market",
		label: "Marché"
	},
	{
		id: "limit",
		label: "Limite"
	},
	{
		id: "stop",
		label: "Stop"
	},
	{
		id: "stop-limit",
		label: "Stop-lim."
	}
];
function TradeForm({ pair, forcedSide, seedPrice }) {
	const meta = PAIR_BY_ID[pair];
	const ticker = useTradingStore((s) => s.tickers[pair]);
	const balances = useTradingStore((s) => s.balances);
	const placeOrder = useTradingStore((s) => s.placeOrder);
	const confirm = useTradingStore((s) => s.settings.confirmOrders);
	const [side, setSide] = (0, import_react.useState)(forcedSide ?? "buy");
	const [type, setType] = (0, import_react.useState)("market");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("");
	const [stop, setStop] = (0, import_react.useState)("");
	const [tp, setTp] = (0, import_react.useState)("");
	const [sl, setSl] = (0, import_react.useState)("");
	const [trail, setTrail] = (0, import_react.useState)("");
	const [leverage, setLeverage] = (0, import_react.useState)(1);
	const [advanced, setAdvanced] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const activeSide = forcedSide ?? side;
	const last = ticker?.last ?? 0;
	const px = type === "market" ? last : Number(price) || seedPrice || last;
	const qty = Number(amount) || 0;
	const baseBal = balances.find((b) => b.asset === meta?.base)?.available ?? 0;
	const quoteBal = balances.find((b) => b.asset === meta?.quote)?.available ?? 0;
	const available = activeSide === "buy" ? quoteBal : baseBal;
	const total = qty * px;
	const fee = total * .0026;
	const setPct = (pct) => {
		if (!meta) return;
		if (activeSide === "buy") {
			const spend = quoteBal * pct;
			const q = px > 0 ? spend / px : 0;
			setAmount(String(Number(q.toFixed(Math.min(meta.lotDecimals, 8)))));
		} else setAmount(String(Number((baseBal * pct).toFixed(Math.min(meta.lotDecimals, 8)))));
	};
	const leverageMarks = (0, import_react.useMemo)(() => {
		const max = meta?.maxLeverage ?? 1;
		return [
			1,
			2,
			3,
			5,
			10
		].filter((n) => n <= max);
	}, [meta]);
	const payload = {
		pair,
		side: activeSide,
		type,
		amount: qty,
		price: type === "market" || type === "stop" ? void 0 : Number(price) || px,
		stopPrice: type === "stop" || type === "stop-limit" ? Number(stop) || void 0 : void 0,
		leverage,
		tp: Number(tp) || void 0,
		sl: Number(sl) || void 0,
		trailingPct: Number(trail) || void 0
	};
	const send = () => {
		setError(null);
		const res = placeOrder(payload);
		if (!res.ok) setError(res.message);
		else setAmount("");
		setPending(false);
	};
	const submit = () => {
		setError(null);
		if (confirm) {
			setPending(true);
			return;
		}
		send();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-3 p-4",
		onSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		children: [
			!forcedSide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1 rounded-md bg-muted p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSide("buy"),
					className: cn("h-10 rounded-sm text-sm font-medium", activeSide === "buy" ? "bg-buy text-buy-foreground" : "text-muted-foreground"),
					children: "Acheter"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSide("sell"),
					className: cn("h-10 rounded-sm text-sm font-medium", activeSide === "sell" ? "bg-sell text-sell-foreground" : "text-muted-foreground"),
					children: "Vendre"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto",
				children: TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setType(t.id),
					className: cn("h-8 shrink-0 rounded-full px-3 text-xs font-medium", type === t.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
					children: t.label
				}, t.id))
			}),
			(type === "limit" || type === "stop-limit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: `Prix ${meta?.quote}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "decimal",
					value: price,
					placeholder: formatPrice(seedPrice ?? last, meta?.pairDecimals ?? 2),
					onChange: (e) => setPrice(e.target.value),
					className: "font-mono tabular-nums"
				})
			}),
			(type === "stop" || type === "stop-limit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Stop",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "decimal",
					value: stop,
					onChange: (e) => setStop(e.target.value),
					className: "font-mono tabular-nums"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: `Quantité ${meta?.base}`,
				hint: `Dispo. ${formatQty(available, 6)} ${activeSide === "buy" ? meta?.quote : meta?.base}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "decimal",
					value: amount,
					onChange: (e) => setAmount(e.target.value),
					className: "font-mono tabular-nums",
					placeholder: "0.00"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-1",
				children: [
					.25,
					.5,
					.75,
					1
				].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setPct(p),
					className: "h-9 rounded-sm bg-muted text-xs font-medium text-muted-foreground",
					children: [p * 100, "%"]
				}, p))
			}),
			meta && meta.maxLeverage > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Levier" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono tabular-nums text-foreground",
					children: [leverage, "×"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: leverageMarks.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setLeverage(n),
					className: cn("h-8 flex-1 rounded-sm text-xs font-medium", leverage === n ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
					children: [n, "×"]
				}, n))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setAdvanced((v) => !v),
				className: "text-xs font-medium text-muted-foreground",
				children: advanced ? "Masquer TP / SL / trailing" : "Take-profit / Stop-loss / Trailing"
			}),
			advanced && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						placeholder: "TP",
						value: tp,
						onChange: (e) => setTp(e.target.value),
						className: "font-mono tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						placeholder: "SL",
						value: sl,
						onChange: (e) => setSl(e.target.value),
						className: "font-mono tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						placeholder: "Trail %",
						value: trail,
						onChange: (e) => setTrail(e.target.value),
						className: "font-mono tabular-nums"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Total estimé",
					v: formatFiat(total, meta?.quote === "EUR" ? "EUR" : "USD")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Frais taker 0,26 %",
					v: formatFiat(fee, meta?.quote === "EUR" ? "EUR" : "USD")
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-sell",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "submit",
				variant: activeSide === "buy" ? "buy" : "sell",
				className: "w-full",
				size: "lg",
				children: [
					activeSide === "buy" ? "Acheter" : "Vendre",
					" ",
					meta?.base
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs text-subtle",
				children: "Mode démo — exécution locale contre le prix Kraken"
			})
		]
	}), pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title: "Confirmer l’ordre",
		onClose: () => setPending(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 px-4 pb-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						activeSide === "buy" ? "Achat" : "Vente",
						" ",
						qty,
						" ",
						meta?.base,
						" · ",
						type,
						" · ",
						meta?.display
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm tabular-nums",
					children: [
						"≈ ",
						formatFiat(total, meta?.quote === "EUR" ? "EUR" : "USD"),
						leverage > 1 ? ` · ${leverage}×` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setPending(false),
						children: "Annuler"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: activeSide === "buy" ? "buy" : "sell",
						onClick: send,
						children: "Confirmer"
					})]
				})
			]
		})
	})] });
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center justify-between text-xs text-muted-foreground",
			children: [label, hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono tabular-nums",
				children: hint
			})]
		}), children]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono tabular-nums text-foreground",
			children: v
		})]
	});
}
var EMPTY = [];
function TradesTape({ pair }) {
	const trades = useTradingStore((s) => s.tapes[pair] ?? EMPTY);
	const meta = PAIR_BY_ID[pair];
	if (trades.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-4 py-8 text-center text-sm text-muted-foreground",
		children: "En attente du flux de transactions…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-border px-3",
		children: trades.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between py-1.5 font-mono text-xs tabular-nums",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn(t.side === "buy" ? "text-buy" : "text-sell"),
					children: formatPrice(t.price, meta?.pairDecimals ?? 2)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground",
					children: formatQty(t.size, 5)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: formatTime(t.time)
				})
			]
		}, t.id))
	});
}
function TradePage() {
	const { pair } = Route.useParams();
	const meta = PAIR_BY_ID[pair] ?? PAIR_BY_ID["XBTEUR"];
	const ticker = useTradingStore((s) => s.tickers[pair]);
	const watchlist = useTradingStore((s) => s.watchlist);
	const toggleWatch = useTradingStore((s) => s.toggleWatch);
	const [panel, setPanel] = (0, import_react.useState)("book");
	const [picker, setPicker] = (0, import_react.useState)(false);
	const [ticket, setTicket] = (0, import_react.useState)(null);
	const [seed, setSeed] = (0, import_react.useState)();
	useBookEngine(pair, true);
	(0, import_react.useEffect)(() => {
		if (useTradingStore.getState().lastPair !== pair) useTradingStore.getState().setLastPair(pair);
	}, [pair]);
	if (!PAIR_BY_ID[pair]) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: "Paire inconnue."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/trade/$pair",
			params: { pair: DEFAULT_PAIR },
			className: "mt-3 inline-block text-accent",
			children: "Ouvrir BTC/USD"
		})]
	});
	const up = (ticker?.changePct ?? 0) >= 0;
	const fav = watchlist.includes(pair);
	const sig = marketSignal(ticker);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lg:grid lg:h-[calc(100dvh)] lg:grid-cols-[minmax(0,1fr)_340px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPicker(true),
							className: "text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-lg font-semibold tracking-tight",
									children: meta?.display
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted-foreground" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xl tabular-nums",
									children: formatPrice(ticker?.last ?? 0, meta?.pairDecimals ?? 2)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono text-sm tabular-nums", up ? "text-buy" : "text-sell"),
									children: formatPct(ticker?.changePct ?? 0)
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Favori",
							onClick: () => toggleWatch(pair),
							className: "grid size-11 place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-5", fav && "fill-warning text-warning") })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 px-4 pb-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["H ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono tabular-nums text-foreground",
								children: formatPrice(ticker?.high ?? 0, meta?.pairDecimals ?? 2)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["B ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono tabular-nums text-foreground",
								children: formatPrice(ticker?.low ?? 0, meta?.pairDecimals ?? 2)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Vol ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono tabular-nums text-foreground",
								children: ticker ? Math.round(ticker.volume).toLocaleString("fr-FR") : "—"
							})] }),
							ticker && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"VWAP",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums text-foreground",
										children: formatPrice(ticker.vwap, meta?.pairDecimals ?? 2)
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: biasTone(sig.bias),
									children: sig.label
								}),
								sig.reasons[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: sig.reasons[0]
								})
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, { pair }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden",
						children: [
							["book", "Carnet"],
							["tape", "Trades"],
							["depth", "Profondeur"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPanel(id),
							className: cn("h-8 shrink-0 rounded-full px-3 text-xs font-medium", panel === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
							children: label
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pb-20 lg:hidden",
						children: [
							panel === "book" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderBook, {
								pair,
								onPrice: setSeed
							}),
							panel === "tape" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradesTape, { pair }),
							panel === "depth" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepthChart, { pair })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 hidden gap-4 px-4 pb-6 lg:grid lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Carnet"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderBook, {
								pair,
								onPrice: setSeed
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
									children: "Dernières transactions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradesTape, { pair }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
										children: "Profondeur"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepthChart, { pair })]
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden border-l border-border lg:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Ticket"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "warn",
						children: "Démo"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeForm, {
					pair,
					seedPrice: seed
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 grid grid-cols-2 gap-2 bg-background/95 px-4 py-2 backdrop-blur-sm lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "buy",
					onClick: () => setTicket("buy"),
					children: "Acheter"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "sell",
					onClick: () => setTicket("sell"),
					children: "Vendre"
				})]
			}),
			ticket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-background/70",
					onClick: () => setTicket(null)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-xl border-t border-border bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-4 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								ticket === "buy" ? "Acheter" : "Vendre",
								" ",
								meta?.display
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center",
							onClick: () => setTicket(null),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeForm, {
						pair,
						forcedSide: ticket,
						seedPrice: seed
					})]
				})]
			}),
			picker && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-40 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Choisir une paire"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-11 place-items-center",
						onClick: () => setPicker(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[calc(100dvh-3.5rem)] overflow-y-auto",
					onClick: () => setPicker(false),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketList, { compact: true })
				})]
			})
		]
	});
}
//#endregion
export { TradePage as component };
