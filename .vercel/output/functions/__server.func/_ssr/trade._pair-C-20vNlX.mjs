import { i as __toESM } from "../_runtime.mjs";
import { $ as defaultSize, Bt as toEurPair, Dt as rsi, Ft as INTERVALS, G as bollinger, It as PAIR_BY_ID, Nt as DEFAULT_PAIR, Q as defaultParams, St as parseDecimal, U as atr, _t as macd, at as formatCompact, dt as formatQty, ft as formatTime, jt as vwap, kt as stochastic, lt as formatPct, pt as gridChartLevels, st as formatFiat, tt as ema, ut as formatPrice } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as fetchOhlc, t as cn } from "./utils-CQTqeWMb.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { J as ChevronDown, n as X, u as Star } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { t as Sheet } from "./sheet-hSSPeHqD.mjs";
import { t as Badge } from "./badge-Cl68uAGu.mjs";
import { n as biasTone, r as marketSignal } from "./signals-BSZYwJQv.mjs";
import { i as useBookEngine, n as Route$1, s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
import { t as MarketList } from "./market-list-DWPmu_4w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade._pair-C-20vNlX.js
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
var LEVEL_COLOR = {
	buy: "#2FBE8F",
	sell: "#E85D6C",
	entry: "#5B8CFF",
	band: "#8B929E"
};
function paintLevels(series, bag, levels) {
	for (const line of bag.lines) series.removePriceLine(line);
	bag.lines = (levels ?? []).map((lv) => series.createPriceLine({
		price: lv.price,
		color: LEVEL_COLOR[lv.kind],
		lineWidth: lv.kind === "band" ? 1 : 2,
		lineStyle: lv.kind === "band" ? 2 : 0,
		axisLabelVisible: true,
		title: lv.title
	}));
}
function CandleChart({ pair, levels }) {
	const [interval, setIntervalId] = (0, import_react.useState)(60);
	const [indicator, setIndicator] = (0, import_react.useState)("ema");
	const [candles, setCandles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const host = (0, import_react.useRef)(null);
	const sub = (0, import_react.useRef)(null);
	const bag = (0, import_react.useRef)(null);
	const candlesRef = (0, import_react.useRef)([]);
	const last = useTradingStore((s) => s.tickers[pair]?.last);
	const levelsRef = (0, import_react.useRef)(levels);
	levelsRef.current = levels;
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
				vol,
				lines: []
			};
			paintLevels(candleSeries, bag.current, levelsRef.current);
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
	(0, import_react.useEffect)(() => {
		const node = bag.current;
		if (!node) return;
		paintLevels(node.candle, node, levels);
	}, [levels]);
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
var BOOK_RANGE_PCTS = [
	1,
	5,
	10,
	25
];
function bookMid(book, last) {
	const bid = book?.bids[0]?.price ?? 0;
	const ask = book?.asks[0]?.price ?? 0;
	if (bid > 0 && ask > 0) return (bid + ask) / 2;
	return last && last > 0 ? last : bid || ask;
}
function rangeSteps(pct) {
	if (pct === 1) return [
		.2,
		.4,
		.6,
		.8,
		1
	];
	if (pct === 5) return [
		1,
		2,
		3,
		4,
		5
	];
	if (pct === 10) return [
		2,
		4,
		6,
		8,
		10
	];
	return [
		5,
		10,
		15,
		20,
		25
	];
}
function bookCoveragePct(book, mid) {
	const m = mid && mid > 0 ? mid : bookMid(book);
	if (!(m > 0) || !book) return {
		bid: 0,
		ask: 0
	};
	const farBid = book.bids[book.bids.length - 1]?.price;
	const farAsk = book.asks[book.asks.length - 1]?.price;
	return {
		bid: farBid && farBid < m ? (m - farBid) / m * 100 : 0,
		ask: farAsk && farAsk > m ? (farAsk - m) / m * 100 : 0
	};
}
function inPriceBand(price, inner, outer, side) {
	return side === "ask" ? price > inner && price <= outer : price < inner && price >= outer;
}
function bandLadder(levels, mid, steps, side) {
	if (!(mid > 0)) return [];
	let cumul = 0;
	let quoteCumul = 0;
	return steps.map((stepPct, i) => {
		const prev = i === 0 ? 0 : steps[i - 1];
		const inner = side === "ask" ? mid * (1 + prev / 100) : mid * (1 - prev / 100);
		const outer = side === "ask" ? mid * (1 + stepPct / 100) : mid * (1 - stepPct / 100);
		let size = 0;
		let quote = 0;
		for (const l of levels) {
			if (!inPriceBand(l.price, inner, outer, side)) continue;
			size += l.size;
			quote += l.size * l.price;
		}
		cumul += size;
		quoteCumul += quote;
		return {
			pct: stepPct,
			price: outer,
			size,
			quote,
			total: cumul,
			totalQuote: quoteCumul
		};
	});
}
function depthHistogram(bids, asks, mid, rangePct, perSide = 12) {
	if (!(mid > 0) || rangePct <= 0 || perSide < 1) return [];
	const width = rangePct / perSide;
	const fillSide = (levels, side) => {
		const rows = [];
		let cumul = 0;
		let cumulQuote = 0;
		for (let i = 1; i <= perSide; i++) {
			const fromPct = side === "bid" ? -i * width : (i - 1) * width;
			const toPct = side === "bid" ? -(i - 1) * width : i * width;
			const inner = mid * (1 + (side === "bid" ? toPct : fromPct) / 100);
			const outer = mid * (1 + (side === "bid" ? fromPct : toPct) / 100);
			let size = 0;
			let quote = 0;
			for (const l of levels) {
				if (!inPriceBand(l.price, inner, outer, side)) continue;
				size += l.size;
				quote += l.size * l.price;
			}
			cumul += size;
			cumulQuote += quote;
			rows.push({
				fromPct,
				toPct,
				side,
				size,
				quote,
				cumul,
				cumulQuote
			});
		}
		return rows;
	};
	const bidRows = fillSide(bids, "bid").slice().reverse();
	const askRows = fillSide(asks, "ask");
	return [...bidRows, ...askRows];
}
function DepthChart({ pair, rangePct = 5 }) {
	const book = useTradingStore((s) => s.books[pair]);
	const last = useTradingStore((s) => s.tickers[pair]?.last);
	const meta = PAIR_BY_ID[pair];
	const mid = bookMid(book, last);
	const steps = rangeSteps(rangePct);
	const decimals = meta?.pairDecimals ?? 2;
	const lo = mid * (1 - rangePct / 100);
	const hi = mid * (1 + rangePct / 100);
	const bidBands = bandLadder(book?.bids ?? [], mid, steps, "bid");
	const askBands = bandLadder(book?.asks ?? [], mid, steps, "ask");
	const cover = bookCoveragePct(book, mid);
	const thin = cover.bid + .05 < rangePct || cover.ask + .05 < rangePct;
	const viz = (0, import_react.useMemo)(() => {
		if (!(mid > 0) || !book) return null;
		const bins = depthHistogram(book.bids, book.asks, mid, rangePct, 12);
		if (!bins.length) return null;
		const span = rangePct * 2 || 1;
		const x = (pct) => (pct + rangePct) / span * 100;
		const maxSize = Math.max(...bins.map((b) => b.size), 1e-9);
		const maxCumul = Math.max(...bins.map((b) => b.cumul), 1);
		const ySize = (s) => 100 - s / maxSize * 86;
		const yCumul = (t) => 100 - t / maxCumul * 86;
		const bars = bins.map((b) => {
			const left = Math.min(b.fromPct, b.toPct);
			const right = Math.max(b.fromPct, b.toPct);
			return {
				key: `${b.side}-${b.fromPct}`,
				x: x(left),
				w: Math.max(.4, x(right) - x(left) - .35),
				y: ySize(b.size),
				h: Math.max(0, 100 - ySize(b.size)),
				side: b.side,
				empty: b.size <= 0
			};
		});
		const bidBins = bins.filter((b) => b.side === "bid");
		const askBins = bins.filter((b) => b.side === "ask");
		return {
			bars,
			bidLine: bidBins.map((b, i) => {
				const y = yCumul(b.cumul);
				return `${i === 0 ? "M" : "L"} ${x(b.fromPct).toFixed(2)} ${y.toFixed(2)} L ${x(b.toPct).toFixed(2)} ${y.toFixed(2)}`;
			}).join(" "),
			askLine: askBins.map((b, i) => {
				const y = yCumul(b.cumul);
				return `${i === 0 ? "M" : "L"} ${x(b.fromPct).toFixed(2)} ${y.toFixed(2)} L ${x(b.toPct).toFixed(2)} ${y.toFixed(2)}`;
			}).join(" "),
			midX: x(0),
			coverX1: x(-Math.min(cover.bid, rangePct)),
			coverX2: x(Math.min(cover.ask, rangePct)),
			marks: [rangePct, rangePct / 2].map((p) => ({
				p,
				bid: x(-p),
				ask: x(p)
			}))
		};
	}, [
		book,
		cover.ask,
		cover.bid,
		mid,
		rangePct
	]);
	if (!viz) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-44 place-items-center text-xs text-muted-foreground",
		children: "Profondeur indisponible"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 100 100",
			className: "h-44 w-full",
			preserveAspectRatio: "none",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: viz.coverX1,
					y: "0",
					width: Math.max(0, viz.coverX2 - viz.coverX1),
					height: "100",
					fill: "var(--color-muted)",
					opacity: "0.12"
				}),
				viz.bars.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: b.x,
					y: b.y,
					width: b.w,
					height: b.h,
					rx: "0.4",
					fill: b.side === "bid" ? "var(--color-buy)" : "var(--color-sell)",
					opacity: b.empty ? .08 : .72
				}, b.key)),
				viz.bidLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: viz.bidLine,
					fill: "none",
					stroke: "var(--color-buy)",
					strokeWidth: "1.1",
					vectorEffect: "non-scaling-stroke",
					opacity: "0.9"
				}),
				viz.askLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: viz.askLine,
					fill: "none",
					stroke: "var(--color-sell)",
					strokeWidth: "1.1",
					vectorEffect: "non-scaling-stroke",
					opacity: "0.9"
				}),
				viz.marks.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: m.bid,
					x2: m.bid,
					y1: "0",
					y2: "100",
					stroke: "var(--color-border)",
					strokeWidth: "0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: m.ask,
					x2: m.ask,
					y1: "0",
					y2: "100",
					stroke: "var(--color-border)",
					strokeWidth: "0.5"
				})] }, m.p)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: viz.midX,
					x2: viz.midX,
					y1: "0",
					y2: "100",
					stroke: "var(--color-muted-foreground)",
					strokeWidth: "0.7"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex items-center justify-between font-mono text-[10px] tabular-nums text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-buy",
					children: [
						"−",
						rangePct,
						" % · ",
						formatPrice(lo, decimals)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatPrice(mid, decimals) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sell",
					children: [
						"+",
						rangePct,
						" % · ",
						formatPrice(hi, decimals)
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1 text-[11px]",
			children: steps.map((p, i) => {
				const bid = bidBands[i];
				const ask = askBands[i];
				const bidEmpty = !bid || bid.size <= 0;
				const askEmpty = !ask || ask.size <= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 font-mono tabular-nums",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: bidEmpty ? "text-subtle" : "text-buy",
							children: [
								"−",
								p,
								" % ",
								bidEmpty ? "—" : formatCompact(bid.quote)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: [p, " %"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: askEmpty ? "text-subtle" : "text-sell",
							children: [
								askEmpty ? "—" : formatCompact(ask.quote),
								" +",
								p,
								" %"
							]
						})
					]
				}, p);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-[10px] leading-snug text-subtle",
			children: [
				"Volume ",
				meta?.quote,
				" dans chaque bande (pas le cumul). L’axe couvre ±",
				rangePct,
				" %.",
				thin ? ` Carnet public jusqu’à −${cover.bid.toFixed(2)} % / +${cover.ask.toFixed(2)} % — au-delà les barres sont vides.` : null
			]
		})
	] });
}
function BookRangePicker({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex w-full items-center justify-between gap-2 lg:w-fit lg:gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
			children: "Niveaux"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-1",
			children: BOOK_RANGE_PCTS.map((pct) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(pct),
				className: cn("h-9 min-w-11 rounded-full px-2.5 text-xs font-medium transition-colors duration-150", value === pct ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
				children: [pct, " %"]
			}, pct))
		})]
	});
}
function OrderBook({ pair, rangePct = 5, onPrice }) {
	const book = useTradingStore((s) => s.books[pair]);
	const last = useTradingStore((s) => s.tickers[pair]?.last);
	const meta = PAIR_BY_ID[pair];
	const mid = bookMid(book, last);
	const steps = rangeSteps(rangePct);
	const asks = bandLadder(book?.asks ?? [], mid, steps, "ask").slice().reverse();
	const bids = bandLadder(book?.bids ?? [], mid, steps, "bid");
	const max = Math.max(...asks.map((l) => l.size), ...bids.map((l) => l.size), 1e-9);
	const decimals = meta?.pairDecimals ?? 2;
	const bidQuote = bids[bids.length - 1]?.totalQuote ?? 0;
	const askQuote = asks[0]?.totalQuote ?? 0;
	const tot = bidQuote + askQuote;
	const bidShare = tot > 0 ? bidQuote / tot * 100 : 50;
	const cover = bookCoveragePct(book, mid);
	const thin = cover.bid + .05 < rangePct || cover.ask + .05 < rangePct;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex h-1 overflow-hidden rounded-full bg-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-buy",
					style: { width: `${bidShare}%` }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-sell",
					style: { width: `${100 - bidShare}%` }
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-subtle",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Niveau" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Prix (",
						meta?.quote,
						")"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Bande (",
						meta?.base,
						")"
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: asks.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BandRowView, {
					row: l,
					sign: "+",
					max,
					decimals,
					side: "sell",
					onClick: () => onPrice?.(l.price)
				}, `a-${l.pct}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "my-2 flex items-center justify-between rounded-sm bg-muted px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-sm tabular-nums text-foreground",
					children: formatPrice(last ?? mid, decimals)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [
						"Spread ",
						formatPrice(book?.spread ?? 0, decimals),
						book ? ` · ${book.spreadPct.toFixed(3)} %` : ""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-0.5",
				children: bids.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BandRowView, {
					row: l,
					sign: "−",
					max,
					decimals,
					side: "buy",
					onClick: () => onPrice?.(l.price)
				}, `b-${l.pct}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-buy",
					children: [
						"Cumul jusqu’à −",
						rangePct,
						" %"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block font-mono tabular-nums",
					children: [
						formatQty(bids[bids.length - 1]?.total ?? 0, 4),
						" ",
						meta?.base,
						" · ",
						formatCompact(bidQuote),
						" ",
						meta?.quote
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sell",
						children: [
							"Cumul jusqu’à +",
							rangePct,
							" %"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block font-mono tabular-nums",
						children: [
							formatQty(asks[0]?.total ?? 0, 4),
							" ",
							meta?.base,
							" · ",
							formatCompact(askQuote),
							" ",
							meta?.quote
						]
					})]
				})]
			}),
			thin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[10px] leading-snug text-subtle",
				children: [
					"Carnet public jusqu’à −",
					cover.bid.toFixed(2),
					" % / +",
					cover.ask.toFixed(2),
					" %. Les bandes au-delà n’ont pas d’offres — ce n’est pas le même cumul recopié."
				]
			})
		]
	});
}
function BandRowView({ row, sign, max, decimals, side, onClick }) {
	const empty = row.size <= 0;
	const width = empty ? 0 : Math.min(100, row.size / max * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "relative flex min-h-9 w-full items-center justify-between gap-2 px-1 py-0.5 font-mono text-xs tabular-nums",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("absolute inset-y-0 right-0 rounded-sm opacity-25", side === "buy" ? "bg-buy" : "bg-sell"),
				style: { width: `${width}%` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("relative w-12 text-left", side === "buy" ? "text-buy" : "text-sell"),
				children: [
					sign,
					row.pct,
					" %"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "relative flex-1 text-center text-foreground",
				children: formatPrice(row.price, decimals)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("relative w-16 text-right", empty ? "text-subtle" : "text-muted-foreground"),
				children: empty ? "—" : formatQty(row.size, 4)
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
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const connection = useTradingStore((s) => s.connection);
	const placeOrder = useTradingStore((s) => s.placeOrder);
	const placeLiveOrder = useTradingStore((s) => s.placeLiveOrder);
	const confirm = useTradingStore((s) => s.settings.confirmOrders);
	const takerFee = useTradingStore((s) => s.settings.takerFee);
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
	const px = type === "market" ? last : parseDecimal(price) || seedPrice || last;
	const qty = parseDecimal(amount) ?? 0;
	const live = Boolean(connection.apiKey && connection.apiSecret);
	const baseBal = live ? krakenBalances[meta?.base ?? ""] ?? 0 : balances.find((b) => b.asset === meta?.base)?.available ?? 0;
	const quoteBal = live ? krakenBalances[meta?.quote ?? ""] ?? 0 : balances.find((b) => b.asset === meta?.quote)?.available ?? 0;
	const available = activeSide === "buy" ? quoteBal : baseBal;
	const total = qty * px;
	const fee = total * takerFee;
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
		price: type === "market" || type === "stop" ? void 0 : parseDecimal(price) || px,
		stopPrice: type === "stop" || type === "stop-limit" ? parseDecimal(stop) || void 0 : void 0,
		leverage,
		tp: parseDecimal(tp) || void 0,
		sl: parseDecimal(sl) || void 0,
		trailingPct: parseDecimal(trail) || void 0
	};
	const send = async () => {
		setError(null);
		if (live) {
			const res = await placeLiveOrder(payload);
			if (!res.ok) setError(res.message);
			else setAmount("");
			setPending(false);
			return;
		}
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
					k: `Frais taker ${(takerFee * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`,
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
				children: live ? "Ordre envoyé sur Kraken (clés de cet appareil)" : "Mode démo — exécution locale contre le prix Kraken"
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
						onClick: () => void send(),
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
	const { pair } = Route$1.useParams();
	const meta = PAIR_BY_ID[pair] ?? PAIR_BY_ID["XBTEUR"];
	const ticker = useTradingStore((s) => s.tickers[pair]);
	const watchlist = useTradingStore((s) => s.watchlist);
	const toggleWatch = useTradingStore((s) => s.toggleWatch);
	const connection = useTradingStore((s) => s.connection);
	const bots = useTradingStore((s) => s.bots);
	const paperFee = useTradingStore((s) => s.paper.feeRate);
	const liveFee = useTradingStore((s) => s.settings.takerFee);
	const pairBots = bots.filter((b) => b.pair === pair && b.status === "running");
	const gridBot = pairBots.find((b) => b.kind === "grid") ?? bots.find((b) => b.pair === pair && b.kind === "grid");
	const gridLevels = gridBot ? gridChartLevels(gridBot, gridBot.venue === "live" ? liveFee : paperFee) : void 0;
	const liveKeys = isLiveConnected(connection);
	const [panel, setPanel] = (0, import_react.useState)("book");
	const [picker, setPicker] = (0, import_react.useState)(false);
	const [ticket, setTicket] = (0, import_react.useState)(null);
	const [seed, setSeed] = (0, import_react.useState)();
	const [rangePct, setRangePct] = (0, import_react.useState)(5);
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
							] }),
							pairBots.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/bot",
								className: "text-accent",
								children: [
									pairBots.length,
									" bot",
									pairBots.length > 1 ? "s" : "",
									" actif",
									pairBots.length > 1 ? "s" : ""
								]
							}),
							PAIR_BY_ID[pair]?.quote === "EUR" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-accent",
								onClick: () => {
									const last = useTradingStore.getState().tickers[pair]?.last || 100;
									const bot = useTradingStore.getState().createBot({
										kind: "grid",
										venue: liveKeys ? "live" : "paper",
										pair: toEurPair(pair),
										interval: 15,
										sizeQuote: defaultSize("grid"),
										params: defaultParams("grid", last)
									});
									toast.message(`${bot.name} créé`, { description: "Ouvre Bots pour le lancer." });
								},
								children: "Grille sur cette paire"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, {
						pair,
						levels: gridLevels
					}),
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
					(panel === "book" || panel === "depth") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-border px-3 py-2 lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookRangePicker, {
							value: rangePct,
							onChange: setRangePct
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pb-32 lg:hidden",
						children: [
							panel === "book" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderBook, {
								pair,
								rangePct,
								onPrice: setSeed
							}),
							panel === "tape" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradesTape, { pair }),
							panel === "depth" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepthChart, {
									pair,
									rangePct
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 hidden px-4 lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookRangePicker, {
							value: rangePct,
							onChange: setRangePct
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 hidden gap-4 px-4 pb-6 lg:grid lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: [
									"Carnet ±",
									rangePct,
									" %"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderBook, {
								pair,
								rangePct,
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
										children: [
											"Profondeur ±",
											rangePct,
											" %"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DepthChart, {
										pair,
										rangePct
									})]
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
						tone: liveKeys ? "buy" : "warn",
						children: liveKeys ? "Kraken" : "Démo"
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
