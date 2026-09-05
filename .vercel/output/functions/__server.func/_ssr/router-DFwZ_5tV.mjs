import { i as __toESM } from "../_runtime.mjs";
import { i as PAIR_BY_ID, t as DEFAULT_PAIR, u as toEurPair } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createFileRoute, b as useRouter, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as object, i as number, n as boolean, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { B as ChartCandlestick, C as ListOrdered, H as Briefcase, U as Bot, a as TriangleAlert, q as ArrowLeftRight, w as LayoutGrid } from "../_libs/lucide-react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-Cq0eoGO-.js
var loc = "fr-FR";
function formatPrice(price, decimals) {
	if (!Number.isFinite(price)) return "—";
	const d = Math.max(0, Math.min(decimals, 10));
	return price.toLocaleString(loc, {
		minimumFractionDigits: d,
		maximumFractionDigits: d
	});
}
function formatQty(qty, decimals = 6) {
	if (!Number.isFinite(qty)) return "—";
	if (Math.abs(qty) >= 1e3) return qty.toLocaleString(loc, { maximumFractionDigits: 2 });
	return qty.toLocaleString(loc, {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals
	});
}
function formatFiat(value, currency = "USD") {
	if (!Number.isFinite(value)) return "—";
	return value.toLocaleString(loc, {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
function formatCompact(n) {
	if (!Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	const sign = n < 0 ? "−" : "";
	if (abs >= 1e9) return `${sign}${(abs / 1e9).toLocaleString(loc, { maximumFractionDigits: 2 })} Md`;
	if (abs >= 1e6) return `${sign}${(abs / 1e6).toLocaleString(loc, { maximumFractionDigits: 2 })} M`;
	if (abs >= 1e3) return `${sign}${(abs / 1e3).toLocaleString(loc, { maximumFractionDigits: 2 })} k`;
	return n.toLocaleString(loc, { maximumFractionDigits: 2 });
}
function formatPct(pct, digits = 2) {
	if (!Number.isFinite(pct)) return "—";
	return `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${Math.abs(pct).toLocaleString(loc, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	})} %`;
}
function formatTime(ts) {
	return new Date(ts).toLocaleTimeString(loc, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
}
function formatDateTime(ts) {
	return new Date(ts).toLocaleString(loc, {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function uid(prefix = "n") {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
function formatKrakenVolume(qty, lotDecimals) {
	const d = Math.min(Math.max(Math.floor(lotDecimals), 0), 8);
	if (!(qty > 0) || !Number.isFinite(qty)) return "0";
	return qty.toFixed(d).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/functions-CThbSH20.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var fetchTickers = createServerFn({ method: "GET" }).handler(createSsrRpc("e16641418aeb50959e3d1284bbc9dd597e614fce64673f9adb36d0ee53b07be0"));
var fetchOhlc = createServerFn({ method: "GET" }).validator(object({
	pair: string(),
	interval: number()
})).handler(createSsrRpc("8772bde06fd3b1b686b3346c87fead6921b0fb6576e05303090fdf81b8786fc8"));
var fetchOhlcHistory = createServerFn({ method: "GET" }).validator(object({
	pair: string(),
	interval: number(),
	since: number(),
	days: number().optional()
})).handler(createSsrRpc("1099c53d3ec617e217b8324f62489c20d06fd0cd92c18b84dffcc8dfa3d607ab"));
var fetchDepth = createServerFn({ method: "GET" }).validator(object({ pair: string() })).handler(createSsrRpc("9be116d3b8b632e923a3646001b672c20e3e643bc52de74a8a2414ab23a2d2f8"));
var fetchTape = createServerFn({ method: "GET" }).validator(object({ pair: string() })).handler(createSsrRpc("f9fe717c7f772686ea2785ca1940f9df0d41261ec4ba590c7f11e547a983765e"));
var fetchKrakenStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("0ca6acfa61d32a187269693f72acf34a0e5e2ac80171b1abb7806ea4608c6af7"));
var KrakenAuth = object({
	apiKey: string().min(4),
	apiSecret: string().min(8)
});
var krakenBalance = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(createSsrRpc("5045e2c37d5a791ac2e0adc2f4eda7dc334496191d3d42c1c93179d879a11bde"));
var krakenAddOrder = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	pair: string(),
	side: _enum(["buy", "sell"]),
	volume: string(),
	validate: boolean().optional()
})).handler(createSsrRpc("295860f06ccc7b1a0871bbebec83dd9f3efbae5f2492ac46948d6c60b77029b7"));
createServerFn({ method: "POST" }).validator(KrakenAuth).handler(createSsrRpc("ab9fcf7f9963c04ed0b8b8eca74b4b641d796dd9a5e3413fc7fa8fa5046594b9"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/store-BBHVYsjk.js
function sma(values, period) {
	const out = [];
	let sum = 0;
	for (let i = 0; i < values.length; i++) {
		sum += values[i] ?? 0;
		if (i >= period) sum -= values[i - period] ?? 0;
		out.push(i >= period - 1 ? sum / period : null);
	}
	return out;
}
function ema(values, period) {
	const out = [];
	const k = 2 / (period + 1);
	let prev = null;
	for (let i = 0; i < values.length; i++) {
		const v = values[i] ?? 0;
		if (i < period - 1) {
			out.push(null);
			continue;
		}
		if (prev === null) {
			let sum = 0;
			for (let j = i - period + 1; j <= i; j++) sum += values[j] ?? 0;
			prev = sum / period;
		} else prev = v * k + prev * (1 - k);
		out.push(prev);
	}
	return out;
}
function bollinger(values, period = 20, mult = 2) {
	const mid = sma(values, period);
	const upper = [];
	const lower = [];
	for (let i = 0; i < values.length; i++) {
		const m = mid[i];
		if (m == null || i < period - 1) {
			upper.push(null);
			lower.push(null);
			continue;
		}
		let variance = 0;
		for (let j = i - period + 1; j <= i; j++) {
			const d = (values[j] ?? 0) - m;
			variance += d * d;
		}
		const sd = Math.sqrt(variance / period);
		upper.push(m + mult * sd);
		lower.push(m - mult * sd);
	}
	return {
		mid,
		upper,
		lower
	};
}
function rsi(values, period = 14) {
	const out = [];
	let avgGain = 0;
	let avgLoss = 0;
	for (let i = 0; i < values.length; i++) {
		if (i === 0) {
			out.push(null);
			continue;
		}
		const ch = (values[i] ?? 0) - (values[i - 1] ?? 0);
		const gain = Math.max(ch, 0);
		const loss = Math.max(-ch, 0);
		if (i <= period) {
			avgGain += gain;
			avgLoss += loss;
			if (i < period) {
				out.push(null);
				continue;
			}
			avgGain /= period;
			avgLoss /= period;
		} else {
			avgGain = (avgGain * (period - 1) + gain) / period;
			avgLoss = (avgLoss * (period - 1) + loss) / period;
		}
		const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
		out.push(100 - 100 / (1 + rs));
	}
	return out;
}
function macd(values, fast = 12, slow = 26, signal = 9) {
	const emaFast = ema(values, fast);
	const emaSlow = ema(values, slow);
	const line = values.map((_, i) => {
		const a = emaFast[i];
		const b = emaSlow[i];
		return a != null && b != null ? a - b : null;
	});
	const signalLine = ema(line.map((v) => v ?? 0), signal).map((v, i) => line[i] == null ? null : v);
	return {
		line,
		signal: signalLine,
		hist: line.map((v, i) => {
			const s = signalLine[i];
			return v != null && s != null ? v - s : null;
		})
	};
}
function vwap(candles) {
	const out = [];
	let pv = 0;
	let vol = 0;
	for (const c of candles) {
		const typical = (c.high + c.low + c.close) / 3;
		pv += typical * c.volume;
		vol += c.volume;
		out.push(vol > 0 ? pv / vol : null);
	}
	return out;
}
function atr(candles, period = 14) {
	const tr = [];
	for (let i = 0; i < candles.length; i++) {
		const c = candles[i];
		if (i === 0) {
			tr.push(c.high - c.low);
			continue;
		}
		const prev = candles[i - 1].close;
		tr.push(Math.max(c.high - c.low, Math.abs(c.high - prev), Math.abs(c.low - prev)));
	}
	return sma(tr, period);
}
function stochastic(candles, n = 14, dPeriod = 3) {
	const k = [];
	for (let i = 0; i < candles.length; i++) {
		if (i < n - 1) {
			k.push(null);
			continue;
		}
		let hi = -Infinity;
		let lo = Infinity;
		for (let j = i - n + 1; j <= i; j++) {
			hi = Math.max(hi, candles[j].high);
			lo = Math.min(lo, candles[j].low);
		}
		const den = hi - lo;
		k.push(den === 0 ? 50 : (candles[i].close - lo) / den * 100);
	}
	return {
		k,
		d: sma(k.map((v) => v ?? 50), dPeriod).map((v, i) => k[i] == null ? null : v)
	};
}
function donchian(candles, n = 20) {
	const upper = [];
	const lower = [];
	for (let i = 0; i < candles.length; i++) {
		if (i < n - 1) {
			upper.push(null);
			lower.push(null);
			continue;
		}
		let hi = -Infinity;
		let lo = Infinity;
		for (let j = i - n + 1; j <= i; j++) {
			hi = Math.max(hi, candles[j].high);
			lo = Math.min(lo, candles[j].low);
		}
		upper.push(hi);
		lower.push(lo);
	}
	return {
		upper,
		lower
	};
}
function supertrend(candles, period = 10, mult = 3) {
	const atrs = atr(candles, period);
	const line = [];
	const dir = [];
	let prevLine = null;
	let prevDir = "up";
	for (let i = 0; i < candles.length; i++) {
		const a = atrs[i];
		const c = candles[i];
		if (a == null) {
			line.push(null);
			dir.push(null);
			continue;
		}
		const mid = (c.high + c.low) / 2;
		const up = mid + mult * a;
		const dn = mid - mult * a;
		let d = prevDir;
		let l = prevDir === "up" ? dn : up;
		if (prevLine != null) {
			if (prevDir === "up") {
				l = Math.max(dn, prevLine);
				if (c.close < l) d = "down";
			} else {
				l = Math.min(up, prevLine);
				if (c.close > l) d = "up";
			}
		}
		prevLine = d === "up" ? d === prevDir ? l : dn : d === prevDir ? l : up;
		if (d !== prevDir) prevLine = d === "up" ? dn : up;
		prevDir = d;
		line.push(prevLine);
		dir.push(d);
	}
	return {
		line,
		dir
	};
}
function zscore(values, period = 20) {
	const mid = sma(values, period);
	const out = [];
	for (let i = 0; i < values.length; i++) {
		const m = mid[i];
		if (m == null) {
			out.push(null);
			continue;
		}
		let v = 0;
		for (let j = i - period + 1; j <= i; j++) {
			const d = (values[j] ?? 0) - m;
			v += d * d;
		}
		const sd = Math.sqrt(v / period);
		out.push(sd === 0 ? 0 : ((values[i] ?? 0) - m) / sd);
	}
	return out;
}
function roc(values, period = 12) {
	const out = [];
	for (let i = 0; i < values.length; i++) {
		if (i < period) {
			out.push(null);
			continue;
		}
		const prev = values[i - period] ?? 0;
		const cur = values[i] ?? 0;
		out.push(prev > 0 ? (cur - prev) / prev * 100 : null);
	}
	return out;
}
function cci(candles, period = 20) {
	const tp = candles.map((c) => (c.high + c.low + c.close) / 3);
	const mid = sma(tp, period);
	const out = [];
	for (let i = 0; i < tp.length; i++) {
		const m = mid[i];
		if (m == null) {
			out.push(null);
			continue;
		}
		let mad = 0;
		for (let j = i - period + 1; j <= i; j++) mad += Math.abs((tp[j] ?? 0) - m);
		mad /= period;
		out.push(mad === 0 ? 0 : ((tp[i] ?? 0) - m) / (.015 * mad));
	}
	return out;
}
function keltner(candles, period = 20, mult = 1.5) {
	const mid = ema(candles.map((c) => (c.high + c.low + c.close) / 3), period);
	const a = atr(candles, period);
	const upper = [];
	const lower = [];
	for (let i = 0; i < candles.length; i++) {
		const m = mid[i];
		const av = a[i];
		if (m == null || av == null) {
			upper.push(null);
			lower.push(null);
		} else {
			upper.push(m + mult * av);
			lower.push(m - mult * av);
		}
	}
	return {
		mid,
		upper,
		lower
	};
}
function adx(candles, period = 14) {
	const plusDM = [];
	const minusDM = [];
	const tr = [];
	for (let i = 0; i < candles.length; i++) {
		const c = candles[i];
		if (i === 0) {
			plusDM.push(0);
			minusDM.push(0);
			tr.push(c.high - c.low);
			continue;
		}
		const p = candles[i - 1];
		const up = c.high - p.high;
		const down = p.low - c.low;
		plusDM.push(up > down && up > 0 ? up : 0);
		minusDM.push(down > up && down > 0 ? down : 0);
		tr.push(Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)));
	}
	const wilder = (arr) => {
		const out = [];
		let prev = 0;
		for (let i = 0; i < arr.length; i++) {
			if (i < period) {
				prev += arr[i];
				out.push(i === period - 1 ? prev : null);
				continue;
			}
			prev = prev - prev / period + arr[i];
			out.push(prev);
		}
		return out;
	};
	const str = wilder(tr);
	const sp = wilder(plusDM);
	const smn = wilder(minusDM);
	const plusDI = [];
	const minusDI = [];
	const dx = [];
	for (let i = 0; i < candles.length; i++) {
		const t = str[i];
		const p = sp[i];
		const m = smn[i];
		if (t == null || p == null || m == null || !(t > 0)) {
			plusDI.push(null);
			minusDI.push(null);
			dx.push(null);
			continue;
		}
		const pdi = 100 * p / t;
		const mdi = 100 * m / t;
		plusDI.push(pdi);
		minusDI.push(mdi);
		const den = pdi + mdi;
		dx.push(den === 0 ? 0 : 100 * Math.abs(pdi - mdi) / den);
	}
	const adxLine = [];
	let acc = 0;
	let seeded = 0;
	let prevAdx = null;
	for (let i = 0; i < dx.length; i++) {
		const v = dx[i];
		if (v == null) {
			adxLine.push(null);
			continue;
		}
		if (prevAdx == null) {
			acc += v;
			seeded += 1;
			if (seeded < period) {
				adxLine.push(null);
				continue;
			}
			prevAdx = acc / period;
			adxLine.push(prevAdx);
		} else {
			prevAdx = (prevAdx * (period - 1) + v) / period;
			adxLine.push(prevAdx);
		}
	}
	return {
		adx: adxLine,
		plusDI,
		minusDI
	};
}
function williamsR(candles, n = 14) {
	const out = [];
	for (let i = 0; i < candles.length; i++) {
		if (i < n - 1) {
			out.push(null);
			continue;
		}
		let hi = -Infinity;
		let lo = Infinity;
		for (let j = i - n + 1; j <= i; j++) {
			hi = Math.max(hi, candles[j].high);
			lo = Math.min(lo, candles[j].low);
		}
		const den = hi - lo;
		out.push(den === 0 ? -50 : (hi - candles[i].close) / den * -100);
	}
	return out;
}
function midHL(candles, period, i) {
	if (i < period - 1) return null;
	let hi = -Infinity;
	let lo = Infinity;
	for (let j = i - period + 1; j <= i; j++) {
		hi = Math.max(hi, candles[j].high);
		lo = Math.min(lo, candles[j].low);
	}
	return (hi + lo) / 2;
}
function ichimoku(candles, tenkanN = 9, kijunN = 26) {
	const tenkan = [];
	const kijun = [];
	const senkouA = [];
	const senkouB = [];
	const span = 52;
	for (let i = 0; i < candles.length; i++) {
		const t = midHL(candles, tenkanN, i);
		const k = midHL(candles, kijunN, i);
		tenkan.push(t);
		kijun.push(k);
		senkouA.push(t != null && k != null ? (t + k) / 2 : null);
		senkouB.push(midHL(candles, span, i));
	}
	return {
		tenkan,
		kijun,
		senkouA,
		senkouB
	};
}
function psar(candles, step = .02, maxAf = .2) {
	const sar = [];
	const dir = [];
	if (candles.length === 0) return {
		sar,
		dir
	};
	let up = candles[1] ? candles[1].close >= candles[0].close : true;
	let af = step;
	let ep = up ? candles[0].high : candles[0].low;
	let acc = up ? candles[0].low : candles[0].high;
	sar.push(acc);
	dir.push(up ? "up" : "down");
	for (let i = 1; i < candles.length; i++) {
		const c = candles[i];
		acc = up ? acc + af * (ep - acc) : acc - af * (acc - ep);
		if (up) {
			if (candles[i - 1]) acc = Math.min(acc, candles[i - 1].low);
			if (i >= 2) acc = Math.min(acc, candles[i - 2].low);
		} else {
			if (candles[i - 1]) acc = Math.max(acc, candles[i - 1].high);
			if (i >= 2) acc = Math.max(acc, candles[i - 2].high);
		}
		let flipped = false;
		if (up && c.low < acc) {
			up = false;
			acc = ep;
			ep = c.low;
			af = step;
			flipped = true;
		} else if (!up && c.high > acc) {
			up = true;
			acc = ep;
			ep = c.high;
			af = step;
			flipped = true;
		}
		if (!flipped) {
			if (up && c.high > ep) {
				ep = c.high;
				af = Math.min(maxAf, af + step);
			} else if (!up && c.low < ep) {
				ep = c.low;
				af = Math.min(maxAf, af + step);
			}
		}
		sar.push(acc);
		dir.push(up ? "up" : "down");
	}
	return {
		sar,
		dir
	};
}
function heikinAshi(candles) {
	const out = [];
	for (let i = 0; i < candles.length; i++) {
		const c = candles[i];
		const haClose = (c.open + c.high + c.low + c.close) / 4;
		const prev = out[i - 1];
		const haOpen = prev ? (prev.open + prev.close) / 2 : (c.open + c.close) / 2;
		out.push({
			time: c.time,
			open: haOpen,
			high: Math.max(c.high, haOpen, haClose),
			low: Math.min(c.low, haOpen, haClose),
			close: haClose,
			volume: c.volume
		});
	}
	return out;
}
var BOT_KIND_BY_ID = Object.fromEntries([
	{
		id: "grid",
		title: "Grille",
		blurb: "Achète bas, vend haut dans une fourchette de prix.",
		needsCandles: false
	},
	{
		id: "dca",
		title: "Accumulateur",
		blurb: "Achète un montant fixe à intervalle régulier.",
		needsCandles: false
	},
	{
		id: "rsi",
		title: "Reversion RSI",
		blurb: "Achète en survente, revend en surachat.",
		needsCandles: true
	},
	{
		id: "ema",
		title: "Croisement EMA",
		blurb: "Suit la tendance au croisement de deux moyennes.",
		needsCandles: true
	},
	{
		id: "bollinger",
		title: "Bandes de Bollinger",
		blurb: "Rebond sur la bande basse, allègement sur la haute.",
		needsCandles: true
	},
	{
		id: "macd",
		title: "Momentum MACD",
		blurb: "Entre au passage de l’histogramme en positif.",
		needsCandles: true
	},
	{
		id: "stoch",
		title: "Stochastic",
		blurb: "Croisement %K/%D en zone de survente.",
		needsCandles: true
	},
	{
		id: "vwap",
		title: "Reversion VWAP",
		blurb: "Achète sous la VWAP, revend au-dessus.",
		needsCandles: true
	},
	{
		id: "breakout",
		title: "Breakout Donchian",
		blurb: "Suit la cassure du plus haut / plus bas.",
		needsCandles: true
	},
	{
		id: "supertrend",
		title: "Supertrend",
		blurb: "Flip de tendance basé sur l’ATR.",
		needsCandles: true
	},
	{
		id: "volume",
		title: "Spike volume",
		blurb: "Entre sur un volume anormal dans le sens de la bougie.",
		needsCandles: true
	},
	{
		id: "scalp",
		title: "Scalp EMA+RSI",
		blurb: "Micro-tendance 5/13 filtrée par le RSI.",
		needsCandles: true
	},
	{
		id: "cci",
		title: "CCI",
		blurb: "Reversion sur le Commodity Channel Index.",
		needsCandles: true
	},
	{
		id: "meanrev",
		title: "Z-score",
		blurb: "Achète les écarts extrêmes à la moyenne.",
		needsCandles: true
	},
	{
		id: "keltner",
		title: "Keltner",
		blurb: "Rebond sur le canal ATR autour de l’EMA.",
		needsCandles: true
	},
	{
		id: "roc",
		title: "Momentum ROC",
		blurb: "Suit le taux de variation du prix.",
		needsCandles: true
	},
	{
		id: "adx",
		title: "ADX + DI",
		blurb: "Entre quand la tendance est confirmée.",
		needsCandles: true
	},
	{
		id: "williams",
		title: "Williams %R",
		blurb: "Reversion sur le %R, cousin du Stochastic.",
		needsCandles: true
	},
	{
		id: "ichimoku",
		title: "Ichimoku",
		blurb: "Croisement Tenkan / Kijun filtré par le nuage.",
		needsCandles: true
	},
	{
		id: "psar",
		title: "Parabolic SAR",
		blurb: "Suit le flip de la parabole de Wilder.",
		needsCandles: true
	},
	{
		id: "sma",
		title: "Croisement SMA",
		blurb: "Golden / death cross des moyennes simples.",
		needsCandles: true
	},
	{
		id: "ha",
		title: "Heikin-Ashi",
		blurb: "Entre au retournement des bougies lissées.",
		needsCandles: true
	}
].map((k) => [k.id, k]));
var DCA_INTERVALS = [
	{
		id: 6e4,
		label: "1 min"
	},
	{
		id: 3e5,
		label: "5 min"
	},
	{
		id: 9e5,
		label: "15 min"
	},
	{
		id: 36e5,
		label: "1 h"
	},
	{
		id: 864e5,
		label: "1 j"
	}
];
var BOT_CANDLE_INTERVALS = [
	{
		id: 5,
		label: "5m"
	},
	{
		id: 15,
		label: "15m"
	},
	{
		id: 30,
		label: "30m"
	},
	{
		id: 60,
		label: "1h"
	},
	{
		id: 240,
		label: "4h"
	},
	{
		id: 1440,
		label: "1j"
	}
];
var EMPTY_STATS = {
	trades: 0,
	wins: 0,
	feesPaid: 0,
	realizedPnl: 0,
	volume: 0
};
var DEFAULT_PAPER = {
	startingBalance: 1e4,
	cash: 1e4,
	holdings: {},
	feesPaid: 0,
	realizedPnl: 0,
	feeRate: .0026,
	trades: [],
	equityCurve: []
};
function defaultParams(kind, last) {
	if (kind === "grid") return {
		lower: roundSmart(last * .96),
		upper: roundSmart(last * 1.04),
		levels: 8
	};
	if (kind === "dca") return { intervalMs: 3e5 };
	if (kind === "rsi") return {
		rsiPeriod: 14,
		oversold: 30,
		overbought: 70
	};
	if (kind === "ema") return {
		fast: 9,
		slow: 21
	};
	if (kind === "bollinger") return {
		bbPeriod: 20,
		bbMult: 2
	};
	if (kind === "stoch") return {
		stochN: 14,
		oversold: 20,
		overbought: 80
	};
	if (kind === "vwap") return {};
	if (kind === "breakout") return { donchian: 20 };
	if (kind === "supertrend") return {
		atrPeriod: 10,
		atrMult: 3
	};
	if (kind === "volume") return { volMult: 2 };
	if (kind === "scalp") return {
		fast: 5,
		slow: 13,
		rsiPeriod: 7
	};
	if (kind === "cci") return {
		cciPeriod: 20,
		oversold: -100,
		overbought: 100
	};
	if (kind === "meanrev") return {
		zWindow: 20,
		zEntry: 1.6
	};
	if (kind === "keltner") return {
		kcPeriod: 20,
		kcMult: 1.5
	};
	if (kind === "roc") return { rocPeriod: 12 };
	if (kind === "adx") return {
		adxPeriod: 14,
		adxMin: 20
	};
	if (kind === "williams") return {
		wrPeriod: 14,
		oversold: -80,
		overbought: -20
	};
	if (kind === "ichimoku") return {
		tenkan: 9,
		kijun: 26
	};
	if (kind === "psar") return {
		psarAf: .02,
		psarMax: .2
	};
	if (kind === "sma") return {
		fast: 50,
		slow: 200
	};
	if (kind === "ha") return {};
	return {
		macdFast: 12,
		macdSlow: 26,
		macdSignal: 9
	};
}
function defaultSize(kind) {
	if (kind === "dca") return 50;
	if (kind === "grid") return 80;
	return 200;
}
function roundSmart(n) {
	if (!(n > 0)) return 0;
	if (n >= 1e3) return Math.round(n);
	if (n >= 100) return Math.round(n * 10) / 10;
	if (n >= 1) return Math.round(n * 100) / 100;
	return Number(n.toPrecision(4));
}
function evaluateBot(bot, ctx) {
	return applyRisk(bot, ctx, evaluateRaw(bot, ctx));
}
function evaluateRaw(bot, ctx) {
	switch (bot.kind) {
		case "grid": return evalGrid(bot, ctx);
		case "dca": return evalDca(bot, ctx);
		case "rsi": return evalRsi(bot, ctx);
		case "ema": return evalEma(bot, ctx);
		case "bollinger": return evalBb(bot, ctx);
		case "macd": return evalMacd(bot, ctx);
		case "stoch": return evalStoch(bot, ctx);
		case "vwap": return evalVwap(bot, ctx);
		case "breakout": return evalBreakout(bot, ctx);
		case "supertrend": return evalSupertrend(bot, ctx);
		case "volume": return evalVolume(bot, ctx);
		case "scalp": return evalScalp(bot, ctx);
		case "cci": return evalCci(bot, ctx);
		case "meanrev": return evalMeanRev(bot, ctx);
		case "keltner": return evalKeltner(bot, ctx);
		case "roc": return evalRoc(bot, ctx);
		case "adx": return evalAdx(bot, ctx);
		case "williams": return evalWilliams(bot, ctx);
		case "ichimoku": return evalIchimoku(bot, ctx);
		case "psar": return evalPsar(bot, ctx);
		case "sma": return evalSma(bot, ctx);
		case "ha": return evalHa(bot, ctx);
	}
}
function px(ctx, side) {
	const last = ctx.ticker.last;
	const quoted = side === "buy" ? ctx.ticker.ask : ctx.ticker.bid;
	if (quoted > 0 && last > 0 && Math.abs(quoted - last) / last < .02) return quoted;
	return last || quoted;
}
function qtyFromQuote(sizeQuote, price) {
	if (!(price > 0) || !(sizeQuote > 0)) return 0;
	return sizeQuote / price;
}
function sizeQuoteOf(bot, ctx) {
	const pct = bot.params.sizePct;
	if (pct && pct > 0 && ctx.equity && ctx.equity > 0) return Math.max(0, ctx.equity * (pct / 100));
	return bot.sizeQuote;
}
function orderQty(bot, ctx, price) {
	return qtyFromQuote(sizeQuoteOf(bot, ctx), price);
}
function linspace(lo, hi, n) {
	const levels = Math.max(2, Math.min(24, Math.round(n)));
	const step = (hi - lo) / (levels - 1);
	return Array.from({ length: levels }, (_, i) => lo + step * i);
}
function evalGrid(bot, ctx) {
	const lower = bot.params.lower ?? 0;
	const upper = bot.params.upper ?? 0;
	const n = bot.params.levels ?? 8;
	const runtime = { ...bot.runtime };
	if (!(lower > 0) || !(upper > lower)) return {
		fills: [],
		runtime,
		note: "Fourchette de grille invalide."
	};
	const prices = linspace(lower, upper, n);
	const owned = runtime.gridOwned?.length === prices.length ? runtime.gridOwned.map((g) => ({ ...g })) : prices.map((price) => ({
		price,
		qty: 0,
		entry: 0
	}));
	const last = ctx.ticker.last;
	const prev = runtime.lastPrice;
	const fills = [];
	if (prev == null || !(prev > 0)) {
		runtime.lastPrice = last;
		runtime.gridOwned = owned;
		return {
			fills,
			runtime,
			note: "Grille armée — en attente d’un croisement."
		};
	}
	for (let i = 0; i < prices.length - 1; i++) {
		const lvl = prices[i];
		if (owned[i].qty <= 0 && prev > lvl && last <= lvl) {
			const fillPx = px(ctx, "buy");
			const qty = orderQty(bot, ctx, fillPx);
			if (qty > 0) {
				fills.push({
					side: "buy",
					qty,
					price: fillPx,
					note: `Grille achat @ ${roundSmart(lvl)}`
				});
				owned[i] = {
					price: lvl,
					qty,
					entry: fillPx
				};
			}
		}
	}
	for (let i = 1; i < prices.length; i++) {
		const lvl = prices[i];
		const below = owned[i - 1];
		if (below.qty > 0 && prev < lvl && last >= lvl) {
			const fillPx = px(ctx, "sell");
			fills.push({
				side: "sell",
				qty: below.qty,
				price: fillPx,
				note: `Grille vente @ ${roundSmart(lvl)}`
			});
			owned[i - 1] = {
				price: below.price,
				qty: 0,
				entry: 0
			};
		}
	}
	runtime.lastPrice = last;
	runtime.gridOwned = owned;
	const held = owned.filter((g) => g.qty > 0).length;
	return {
		fills,
		runtime,
		note: fills.length ? fills.map((f) => f.note).join(" · ") : `En attente · ${held}/${prices.length - 1} niveaux chargés`
	};
}
function evalDca(bot, ctx) {
	const runtime = { ...bot.runtime };
	const every = bot.params.intervalMs ?? 3e5;
	const due = runtime.nextDcaAt ?? ctx.now;
	if (ctx.now < due) return {
		fills: [],
		runtime,
		note: `Prochain achat dans ${formatWait(Math.max(0, due - ctx.now))}`
	};
	const fillPx = px(ctx, "buy");
	const qty = orderQty(bot, ctx, fillPx);
	runtime.nextDcaAt = ctx.now + every;
	runtime.lastPrice = ctx.ticker.last;
	if (!(qty > 0)) return {
		fills: [],
		runtime,
		note: "Taille trop faible."
	};
	return {
		fills: [{
			side: "buy",
			qty,
			price: fillPx,
			note: `DCA ${roundSmart(sizeQuoteOf(bot, ctx))} EUR`
		}],
		runtime,
		note: `Achat DCA @ ${roundSmart(fillPx)}`
	};
}
function evalRsi(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(2, bot.params.rsiPeriod ?? 14);
	const os = bot.params.oversold ?? 30;
	const ob = bot.params.overbought ?? 70;
	if (!candles || candles.length < period + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le RSI."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? `En position · RSI ${fmt(runtime.lastRsi)}` : `Hors marché · RSI ${fmt(runtime.lastRsi)}`
	};
	const series = rsi(candles.map((c) => c.close), period);
	const r = series[series.length - 1];
	const prev = series[series.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastRsi = r ?? void 0;
	runtime.lastClose = lastCandle.close;
	if (r == null || prev == null) return {
		fills: [],
		runtime,
		note: "RSI en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && prev >= os && r < os) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `RSI ${r.toFixed(1)} < ${os}`
			});
			runtime.inPosition = true;
			runtime.positionQty = qty;
			runtime.positionAvg = fillPx;
		}
	} else if (runtime.inPosition && runtime.positionQty && prev <= ob && r > ob) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `RSI ${r.toFixed(1)} > ${ob}`
		});
		runtime.inPosition = false;
		runtime.positionQty = 0;
		runtime.positionAvg = 0;
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `RSI ${r.toFixed(1)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalEma(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const fastN = Math.max(2, bot.params.fast ?? 9);
	const slowN = Math.max(fastN + 1, bot.params.slow ?? 21);
	if (!candles || candles.length < slowN + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour les EMA."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `EMA ${fastN}/${slowN} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const closes = candles.map((c) => c.close);
	const fast = ema(closes, fastN);
	const slow = ema(closes, slowN);
	const f = fast[fast.length - 1];
	const s = slow[slow.length - 1];
	const pf = fast[fast.length - 2];
	const ps = slow[slow.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastEmaFast = f ?? void 0;
	runtime.lastEmaSlow = s ?? void 0;
	if (f == null || s == null || pf == null || ps == null) return {
		fills: [],
		runtime,
		note: "EMA en chauffe."
	};
	const fills = [];
	const crossUp = pf <= ps && f > s;
	const crossDown = pf >= ps && f < s;
	if (!runtime.inPosition && crossUp) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `EMA ${fastN} croise au-dessus`
			});
			runtime.inPosition = true;
			runtime.positionQty = qty;
			runtime.positionAvg = fillPx;
		}
	} else if (runtime.inPosition && runtime.positionQty && crossDown) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `EMA ${fastN} croise en-dessous`
		});
		runtime.inPosition = false;
		runtime.positionQty = 0;
		runtime.positionAvg = 0;
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `EMA ${fmt(f)} / ${fmt(s)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalBb(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.bbPeriod ?? 20);
	const mult = bot.params.bbMult ?? 2;
	if (!candles || candles.length < period + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Bollinger."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long · bande médiane" : "Flat · en attente d’un toucher"
	};
	const closes = candles.map((c) => c.close);
	const bands = bollinger(closes, period, mult);
	const i = closes.length - 1;
	const close = closes[i];
	const prevClose = closes[i - 1];
	const lower = bands.lower[i];
	const upper = bands.upper[i];
	const prevLower = bands.lower[i - 1];
	const prevUpper = bands.upper[i - 1];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastClose = close;
	if (lower == null || upper == null || prevLower == null || prevUpper == null) return {
		fills: [],
		runtime,
		note: "Bandes en chauffe."
	};
	const fills = [];
	const touchLow = prevClose > prevLower && close <= lower;
	const touchHigh = prevClose < prevUpper && close >= upper;
	if (!runtime.inPosition && touchLow) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Toucher bande basse"
			});
			runtime.inPosition = true;
			runtime.positionQty = qty;
			runtime.positionAvg = fillPx;
		}
	} else if (runtime.inPosition && runtime.positionQty && touchHigh) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Toucher bande haute"
		});
		runtime.inPosition = false;
		runtime.positionQty = 0;
		runtime.positionAvg = 0;
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Close ${roundSmart(close)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalMacd(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const fastN = bot.params.macdFast ?? 12;
	const slowN = bot.params.macdSlow ?? 26;
	const sigN = bot.params.macdSignal ?? 9;
	if (!candles || candles.length < slowN + sigN + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le MACD."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `MACD · ${runtime.inPosition ? "long" : "flat"}`
	};
	const m = macd(candles.map((c) => c.close), fastN, slowN, sigN);
	const h = m.hist[m.hist.length - 1];
	const ph = m.hist[m.hist.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastMacdHist = h ?? void 0;
	if (h == null || ph == null) return {
		fills: [],
		runtime,
		note: "MACD en chauffe."
	};
	const fills = [];
	const crossUp = ph <= 0 && h > 0;
	const crossDown = ph >= 0 && h < 0;
	if (!runtime.inPosition && crossUp) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Histogramme MACD positif"
			});
			runtime.inPosition = true;
			runtime.positionQty = qty;
			runtime.positionAvg = fillPx;
		}
	} else if (runtime.inPosition && runtime.positionQty && crossDown) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Histogramme MACD négatif"
		});
		runtime.inPosition = false;
		runtime.positionQty = 0;
		runtime.positionAvg = 0;
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Hist ${h >= 0 ? "+" : ""}${h.toFixed(4)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalStoch(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const n = Math.max(5, bot.params.stochN ?? 14);
	const os = bot.params.oversold ?? 20;
	const ob = bot.params.overbought ?? 80;
	if (!candles || candles.length < n + 4) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le Stochastic."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `Stoch ${fmt(runtime.lastStochK)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const s = stochastic(candles, n, 3);
	const k = s.k[s.k.length - 1];
	const d = s.d[s.d.length - 1];
	const pk = s.k[s.k.length - 2];
	const pd = s.d[s.d.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastStochK = k ?? void 0;
	if (k == null || d == null || pk == null || pd == null) return {
		fills: [],
		runtime,
		note: "Stoch en chauffe."
	};
	const fills = [];
	const crossUp = pk <= pd && k > d;
	const crossDown = pk >= pd && k < d;
	if (!runtime.inPosition && crossUp && k < os + 10) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Stoch croise haussier (${k.toFixed(0)})`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && crossDown && k > ob - 10) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `Stoch croise baissier (${k.toFixed(0)})`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `K ${k.toFixed(0)} / D ${d.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalVwap(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	if (!candles || candles.length < 20) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour la VWAP."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long sous/sur VWAP" : "Flat · VWAP"
	};
	const series = vwap(candles);
	const v = series[series.length - 1];
	const pv = series[series.length - 2];
	const close = lastCandle.close;
	const prev = candles[candles.length - 2].close;
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastVwap = v ?? void 0;
	if (v == null || pv == null) return {
		fills: [],
		runtime,
		note: "VWAP en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && prev >= pv && close < v) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Prix sous VWAP"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && prev <= pv && close > v) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Retour au-dessus VWAP"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `VWAP ${roundSmart(v)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalBreakout(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const n = Math.max(5, bot.params.donchian ?? 20);
	if (!candles || candles.length < n + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Donchian."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long breakout" : "En attente de cassure"
	};
	const bands = donchian(candles.slice(0, -1), n);
	const hi = bands.upper[bands.upper.length - 1];
	const lo = bands.lower[bands.lower.length - 1];
	runtime.lastCandleTime = lastCandle.time;
	if (hi == null || lo == null) return {
		fills: [],
		runtime,
		note: "Canal Donchian en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && lastCandle.close > hi) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Cassure ${roundSmart(hi)}`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && lastCandle.close < lo) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `Rupture basse ${roundSmart(lo)}`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Canal ${roundSmart(lo)}–${roundSmart(hi)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalSupertrend(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = bot.params.atrPeriod ?? 10;
	const mult = bot.params.atrMult ?? 3;
	if (!candles || candles.length < period + 5) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Supertrend."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `Supertrend ${runtime.lastTrend ?? "—"}`
	};
	const st = supertrend(candles, period, mult);
	const d = st.dir[st.dir.length - 1];
	const pd = st.dir[st.dir.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastTrend = d ?? void 0;
	runtime.lastSupertrend = st.line[st.line.length - 1] ?? void 0;
	if (!d || !pd) return {
		fills: [],
		runtime,
		note: "Supertrend en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && pd === "down" && d === "up") {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Supertrend haussier"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && pd === "up" && d === "down") {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Supertrend baissier"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Tendance ${d} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalVolume(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const mult = bot.params.volMult ?? 2;
	if (!candles || candles.length < 24) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le volume."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long spike" : "En attente d’un spike"
	};
	const look = candles.slice(-21, -1);
	const avg = look.reduce((s, c) => s + c.volume, 0) / look.length;
	runtime.lastCandleTime = lastCandle.time;
	const spike = avg > 0 && lastCandle.volume > avg * mult;
	const bull = lastCandle.close >= lastCandle.open;
	const fills = [];
	if (!runtime.inPosition && spike && bull) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Volume ×${(lastCandle.volume / avg).toFixed(1)}`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && spike && !bull) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Spike vendeur"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Vol ${spike ? "élevé" : "calme"} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalScalp(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const fastN = bot.params.fast ?? 5;
	const slowN = bot.params.slow ?? 13;
	const rsiN = bot.params.rsiPeriod ?? 7;
	if (!candles || candles.length < slowN + rsiN + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le scalp."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `Scalp · ${runtime.inPosition ? "long" : "flat"}`
	};
	const closes = candles.map((c) => c.close);
	const f = ema(closes, fastN);
	const s = ema(closes, slowN);
	const r = rsi(closes, rsiN);
	const fv = f[f.length - 1];
	const sv = s[s.length - 1];
	const pf = f[f.length - 2];
	const ps = s[s.length - 2];
	const rv = r[r.length - 1];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastEmaFast = fv ?? void 0;
	runtime.lastRsi = rv ?? void 0;
	if (fv == null || sv == null || pf == null || ps == null || rv == null) return {
		fills: [],
		runtime,
		note: "Scalp en chauffe."
	};
	const fills = [];
	const crossUp = pf <= ps && fv > sv;
	const crossDown = pf >= ps && fv < sv;
	if (!runtime.inPosition && crossUp && rv < 70) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Scalp long · RSI ${rv.toFixed(0)}`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && (crossDown || rv > 80)) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: crossDown ? "Scalp exit EMA" : "Scalp RSI chaud"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `EMA ${fastN}/${slowN} RSI ${rv.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalCci(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.cciPeriod ?? 20);
	const os = bot.params.oversold ?? -100;
	const ob = bot.params.overbought ?? 100;
	if (!candles || candles.length < period + 4) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le CCI."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `CCI ${fmt(runtime.lastCci)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const series = cci(candles, period);
	const v = series[series.length - 1];
	const pv = series[series.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastCci = v ?? void 0;
	if (v == null || pv == null) return {
		fills: [],
		runtime,
		note: "CCI en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && pv <= os && v > os) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `CCI ${v.toFixed(0)} sort de survente`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && pv >= ob && v < ob) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `CCI ${v.toFixed(0)} sort de surachat`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `CCI ${v.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalMeanRev(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const n = Math.max(8, bot.params.zWindow ?? 20);
	const zEntry = bot.params.zEntry ?? 1.6;
	if (!candles || candles.length < n + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le z-score."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `Z ${fmt(runtime.lastZ)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const zs = zscore(candles.map((c) => c.close), n);
	const z = zs[zs.length - 1];
	const pz = zs[zs.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastZ = z ?? void 0;
	if (z == null || pz == null) return {
		fills: [],
		runtime,
		note: "Z-score en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && pz > -zEntry && z <= -zEntry) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Z-score ${z.toFixed(2)}`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && (pz < 0 && z >= 0 || z >= zEntry)) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: z >= zEntry ? `Z excessif ${z.toFixed(2)}` : "Retour à la moyenne"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Z ${z.toFixed(2)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalKeltner(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.kcPeriod ?? 20);
	const mult = bot.params.kcMult ?? 1.5;
	if (!candles || candles.length < period + 4) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Keltner."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long Keltner" : "Flat · Keltner"
	};
	const bands = keltner(candles, period, mult);
	const i = candles.length - 1;
	const close = lastCandle.close;
	const prev = candles[i - 1].close;
	const lower = bands.lower[i];
	const upper = bands.upper[i];
	const prevLower = bands.lower[i - 1];
	const prevUpper = bands.upper[i - 1];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastClose = close;
	if (lower == null || upper == null || prevLower == null || prevUpper == null) return {
		fills: [],
		runtime,
		note: "Keltner en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && prev > prevLower && close <= lower) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Toucher Keltner bas"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && prev < prevUpper && close >= upper) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Toucher Keltner haut"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Close ${roundSmart(close)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalRoc(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(2, bot.params.rocPeriod ?? 12);
	if (!candles || candles.length < period + 4) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le ROC."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `ROC ${fmt(runtime.lastRoc)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const series = roc(candles.map((c) => c.close), period);
	const v = series[series.length - 1];
	const pv = series[series.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastRoc = v ?? void 0;
	if (v == null || pv == null) return {
		fills: [],
		runtime,
		note: "ROC en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && pv <= 0 && v > 0) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `ROC +${v.toFixed(2)} %`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && pv >= 0 && v < 0) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `ROC ${v.toFixed(2)} %`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `ROC ${v >= 0 ? "+" : ""}${v.toFixed(2)} % · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalAdx(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.adxPeriod ?? 14);
	const min = bot.params.adxMin ?? 20;
	if (!candles || candles.length < period * 2 + 5) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour l’ADX."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `ADX ${fmt(runtime.lastAdx)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const a = adx(candles, period);
	const i = candles.length - 1;
	const av = a.adx[i];
	const pdi = a.plusDI[i];
	const mdi = a.minusDI[i];
	const pp = a.plusDI[i - 1];
	const pm = a.minusDI[i - 1];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastAdx = av ?? void 0;
	if (av == null || pdi == null || mdi == null || pp == null || pm == null) return {
		fills: [],
		runtime,
		note: "ADX en chauffe."
	};
	const fills = [];
	const strong = av >= min;
	const crossUp = pp <= pm && pdi > mdi;
	const crossDown = pp >= pm && pdi < mdi;
	if (!runtime.inPosition && strong && crossUp) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `ADX ${av.toFixed(0)} +DI haussier`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && (crossDown || av < min * .6)) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: crossDown ? "−DI prend le dessus" : "Tendance trop faible"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `ADX ${av.toFixed(0)} +DI ${pdi.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalWilliams(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const n = Math.max(5, bot.params.wrPeriod ?? 14);
	const os = bot.params.oversold ?? -80;
	const ob = bot.params.overbought ?? -20;
	if (!candles || candles.length < n + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Williams %R."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `%R ${fmt(runtime.lastWr)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const series = williamsR(candles, n);
	const r = series[series.length - 1];
	const prev = series[series.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastWr = r ?? void 0;
	if (r == null || prev == null) return {
		fills: [],
		runtime,
		note: "%R en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && prev <= os && r > os) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `%R ${r.toFixed(0)} sort de survente`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && prev >= ob && r < ob) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `%R ${r.toFixed(0)} quitte le surachat`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `%R ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalIchimoku(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const tenkanN = Math.max(2, bot.params.tenkan ?? 9);
	const kijunN = Math.max(tenkanN + 1, bot.params.kijun ?? 26);
	if (!candles || candles.length < kijunN + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Ichimoku."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `Ichimoku · ${runtime.inPosition ? "long" : "flat"}`
	};
	const cloud = ichimoku(candles, tenkanN, kijunN);
	const i = candles.length - 1;
	const t = cloud.tenkan[i];
	const k = cloud.kijun[i];
	const pt = cloud.tenkan[i - 1];
	const pk = cloud.kijun[i - 1];
	const sa = cloud.senkouA[i];
	const sb = cloud.senkouB[i];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastEmaFast = t ?? void 0;
	runtime.lastEmaSlow = k ?? void 0;
	if (t == null || k == null || pt == null || pk == null) return {
		fills: [],
		runtime,
		note: "Ichimoku en chauffe."
	};
	const cloudTop = sa != null && sb != null ? Math.max(sa, sb) : null;
	const cloudBot = sa != null && sb != null ? Math.min(sa, sb) : null;
	const aboveCloud = cloudTop == null || lastCandle.close > cloudTop;
	const belowCloud = cloudBot == null || lastCandle.close < cloudBot;
	const fills = [];
	const crossUp = pt <= pk && t > k;
	const crossDown = pt >= pk && t < k;
	if (!runtime.inPosition && crossUp && aboveCloud) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Tenkan croise au-dessus du Kijun"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && (crossDown || belowCloud)) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: crossDown ? "Tenkan croise sous le Kijun" : "Clôture sous le nuage"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `Tenkan ${roundSmart(t)} / Kijun ${roundSmart(k)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalPsar(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const step = bot.params.psarAf ?? .02;
	const maxAf = bot.params.psarMax ?? .2;
	if (!candles || candles.length < 8) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le SAR."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `SAR ${runtime.lastTrend ?? "—"}`
	};
	const s = psar(candles, step, maxAf);
	const d = s.dir[s.dir.length - 1];
	const pd = s.dir[s.dir.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastTrend = d ?? void 0;
	runtime.lastSar = s.sar[s.sar.length - 1] ?? void 0;
	if (!d || !pd) return {
		fills: [],
		runtime,
		note: "SAR en chauffe."
	};
	const fills = [];
	if (!runtime.inPosition && pd === "down" && d === "up") {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "SAR haussier"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && pd === "up" && d === "down") {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "SAR baissier"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `SAR ${d} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalSma(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const fastN = Math.max(2, bot.params.fast ?? 50);
	const slowN = Math.max(fastN + 1, bot.params.slow ?? 200);
	if (!candles || candles.length < slowN + 3) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour les SMA."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `SMA ${fastN}/${slowN} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const closes = candles.map((c) => c.close);
	const fast = sma(closes, fastN);
	const slow = sma(closes, slowN);
	const f = fast[fast.length - 1];
	const s = slow[slow.length - 1];
	const pf = fast[fast.length - 2];
	const ps = slow[slow.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastEmaFast = f ?? void 0;
	runtime.lastEmaSlow = s ?? void 0;
	if (f == null || s == null || pf == null || ps == null) return {
		fills: [],
		runtime,
		note: "SMA en chauffe."
	};
	const fills = [];
	const crossUp = pf <= ps && f > s;
	const crossDown = pf >= ps && f < s;
	if (!runtime.inPosition && crossUp) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Golden cross SMA ${fastN}/${slowN}`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && crossDown) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `Death cross SMA ${fastN}/${slowN}`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `SMA ${fmt(f)} / ${fmt(s)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalHa(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	if (!candles || candles.length < 8) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour Heikin-Ashi."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `HA · ${runtime.inPosition ? "long" : "flat"}`
	};
	const ha = heikinAshi(candles);
	const cur = ha[ha.length - 1];
	const prev = ha[ha.length - 2];
	const bull = cur.close >= cur.open;
	const prevBull = prev.close >= prev.open;
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastTrend = bull ? "up" : "down";
	const fills = [];
	if (!runtime.inPosition && bull && !prevBull) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Heikin-Ashi vert"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && !bull && prevBull) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Heikin-Ashi rouge"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `HA ${bull ? "haussier" : "baissier"} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function markLong(runtime, qty, px) {
	runtime.inPosition = true;
	runtime.positionQty = qty;
	runtime.positionAvg = px;
}
function markFlat(runtime) {
	runtime.inPosition = false;
	runtime.positionQty = 0;
	runtime.positionAvg = 0;
}
function applyRisk(bot, ctx, raw) {
	const runtime = { ...raw.runtime };
	let fills = [...raw.fills];
	let note = raw.note;
	const now = ctx.now;
	const last = ctx.ticker.last;
	const day = new Date(now).toISOString().slice(0, 10);
	if (runtime.dayStamp !== day) {
		runtime.dayStamp = day;
		runtime.dayPnl = 0;
		runtime.dayTrades = 0;
	}
	const spreadPct = ctx.ticker.ask > 0 && ctx.ticker.bid > 0 && last > 0 ? (ctx.ticker.ask - ctx.ticker.bid) / last * 100 : 0;
	const maxSpread = bot.params.maxSpreadPct ?? 0;
	if (maxSpread > 0 && spreadPct > maxSpread) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = `Spread ${spreadPct.toFixed(2)} % trop large`;
	}
	const cooldownMs = (bot.params.cooldownSec ?? 0) * 1e3;
	if (cooldownMs > 0 && bot.lastActionAt && now - bot.lastActionAt < cooldownMs) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = `Cooldown ${Math.ceil((cooldownMs - (now - bot.lastActionAt)) / 1e3)}s`;
	}
	const cap = bot.params.maxDailyLoss ?? 0;
	if (cap > 0 && (runtime.dayPnl ?? 0) <= -cap) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) {
			note = `Stop journalier (${cap} EUR)`;
			return {
				fills,
				runtime,
				note
			};
		}
	}
	const maxTrades = bot.params.maxTradesDay ?? 0;
	if (maxTrades > 0 && (runtime.dayTrades ?? 0) >= maxTrades) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = `Quota ${maxTrades} trades / jour`;
	}
	const maxLosses = bot.params.maxConsecutiveLoss ?? 0;
	if (maxLosses > 0 && (runtime.consecutiveLosses ?? 0) >= maxLosses) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = `Pertes consécutives (${maxLosses})`;
	}
	if (runtime.inPosition && runtime.positionQty && runtime.positionAvg) runtime.peakPrice = Math.max(runtime.peakPrice ?? runtime.positionAvg, last);
	else if (!runtime.inPosition) runtime.peakPrice = void 0;
	if (runtime.inPosition && runtime.positionQty && runtime.positionAvg && !fills.some((f) => f.side === "sell")) {
		const pct = (last - runtime.positionAvg) / runtime.positionAvg * 100;
		const sl = bot.params.slPct;
		const tp = bot.params.tpPct;
		const trail = bot.params.trailingPct;
		const peak = runtime.peakPrice ?? runtime.positionAvg;
		if (sl && sl > 0 && pct <= -sl) {
			fills.push({
				side: "sell",
				qty: runtime.positionQty,
				price: px(ctx, "sell"),
				note: `Stop-loss ${pct.toFixed(2)} %`
			});
			markFlat(runtime);
			note = fills[fills.length - 1].note;
		} else if (tp && tp > 0 && pct >= tp) {
			fills.push({
				side: "sell",
				qty: runtime.positionQty,
				price: px(ctx, "sell"),
				note: `Take-profit ${pct.toFixed(2)} %`
			});
			markFlat(runtime);
			note = fills[fills.length - 1].note;
		} else if (trail && trail > 0 && peak > runtime.positionAvg && last <= peak * (1 - trail / 100)) {
			fills.push({
				side: "sell",
				qty: runtime.positionQty,
				price: px(ctx, "sell"),
				note: `Trailing ${trail} % depuis ${roundSmart(peak)}`
			});
			markFlat(runtime);
			note = fills[fills.length - 1].note;
		}
	}
	return {
		fills,
		runtime,
		note
	};
}
function kindTitle(kind) {
	return BOT_KIND_BY_ID[kind]?.title ?? kind;
}
function backtestBot(kind, params, sizeQuote, candles, feeRate, pair = "XBTEUR", opts = {}) {
	if (candles.length < 30) return null;
	const base = PAIR_BY_ID[pair]?.base ?? "BTC";
	const startEquity = Math.max(100, opts.startingBalance ?? 1e4);
	const slip = Math.max(0, (opts.slippageBps ?? 0) / 1e4);
	const warmup = Math.max(20, Math.min(opts.warmup ?? 40, candles.length - 5));
	let bot = {
		id: "bt",
		name: "bt",
		kind,
		venue: "paper",
		status: "running",
		pair,
		interval: opts.interval ?? 15,
		sizeQuote,
		params,
		createdAt: 0,
		lastNote: "",
		stats: { ...EMPTY_STATS },
		runtime: {}
	};
	let paper = resetPaperAccount(startEquity, feeRate);
	const curve = [{
		t: candles[warmup].time * 1e3,
		v: startEquity
	}];
	let barsInPos = 0;
	const firstPx = candles[warmup].close;
	for (let i = warmup; i < candles.length; i++) {
		const c = candles[i];
		const slice = candles.slice(0, i + 1);
		const ticker = {
			id: pair,
			last: c.close,
			bid: c.close * (1 - slip),
			ask: c.close * (1 + slip),
			open: c.open,
			high: c.high,
			low: c.low,
			volume: c.volume,
			vwap: c.close,
			change: 0,
			changePct: 0,
			trades: 0,
			quoteVolume: 0
		};
		const { fills, runtime } = evaluateBot(bot, {
			now: c.time * 1e3,
			ticker,
			candles: slice,
			equity: paperEquity(paper, { [pair]: ticker })
		});
		bot = {
			...bot,
			runtime
		};
		if (runtime.inPosition) barsInPos += 1;
		for (const fill of fills) {
			const px = fill.side === "buy" ? fill.price * (1 + slip) : fill.price * (1 - slip);
			const res = applyPaperFill(paper, {
				botId: "bt",
				pair,
				base,
				side: fill.side,
				qty: fill.qty,
				price: px,
				note: fill.note,
				time: c.time * 1e3
			});
			if (res.ok) {
				paper = res.paper;
				bot = {
					...bot,
					lastActionAt: c.time * 1e3
				};
			}
		}
		if (i === candles.length - 1 || i % 3 === 0 || fills.length) {
			const mark = paper.cash + Object.values(paper.holdings).reduce((s, h) => s + h.qty * c.close, 0);
			curve.push({
				t: c.time * 1e3,
				v: mark
			});
		}
	}
	const last = candles[candles.length - 1].close;
	const eq = paper.cash + Object.values(paper.holdings).reduce((s, h) => s + h.qty * last, 0);
	const sells = paper.trades.filter((t) => t.side === "sell");
	const winsList = sells.filter((t) => t.pnl > 0);
	const lossList = sells.filter((t) => t.pnl <= 0);
	const grossWin = winsList.reduce((s, t) => s + t.pnl, 0);
	const grossLoss = Math.abs(lossList.reduce((s, t) => s + t.pnl, 0));
	let peak = startEquity;
	let maxDd = 0;
	for (const p of curve) {
		peak = Math.max(peak, p.v);
		maxDd = Math.max(maxDd, peak - p.v);
	}
	const buyHold = startEquity / firstPx * last - startEquity;
	const tested = candles.length - warmup;
	return {
		trades: paper.trades.length,
		buys: paper.trades.filter((t) => t.side === "buy").length,
		sells: sells.length,
		wins: winsList.length,
		losses: lossList.length,
		winRate: sells.length ? winsList.length / sells.length * 100 : 0,
		pnl: eq - startEquity,
		pnlPct: (eq - startEquity) / startEquity * 100,
		realizedPnl: paper.realizedPnl,
		fees: paper.feesPaid,
		equity: eq,
		startEquity,
		maxDrawdown: maxDd,
		maxDrawdownPct: peak > 0 ? maxDd / peak * 100 : 0,
		profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0,
		avgWin: winsList.length ? grossWin / winsList.length : 0,
		avgLoss: lossList.length ? -(grossLoss / lossList.length) : 0,
		expectancy: sells.length ? (grossWin - grossLoss) / sells.length : 0,
		buyHoldPnl: buyHold,
		buyHoldPct: buyHold / startEquity * 100,
		bars: tested,
		from: candles[0].time,
		to: candles[candles.length - 1].time,
		interval: opts.interval ?? 15,
		requestedDays: opts.requestedDays ?? 0,
		exposurePct: tested ? barsInPos / tested * 100 : 0,
		equityCurve: curve.slice(-240),
		tradeLog: paper.trades.slice().reverse().map((t) => ({
			time: t.time,
			side: t.side,
			price: t.price,
			pnl: t.pnl,
			note: t.note
		}))
	};
}
function fmt(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return n.toFixed(1);
}
function formatWait(ms) {
	const s = Math.ceil(ms / 1e3);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m} min`;
	const h = Math.floor(m / 60);
	if (h < 48) return `${h} h`;
	return `${Math.floor(h / 24)} j`;
}
function assetPx(asset, tickers) {
	if (asset === "EUR") return 1;
	if (asset === "USD") return 1;
	const direct = tickers[{
		BTC: "XBTEUR",
		XBT: "XBTEUR",
		DOGE: "XDGEUR",
		XDG: "XDGEUR"
	}[asset] ?? `${asset}EUR`];
	if (direct?.last) return direct.last;
	return Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "EUR")?.last ?? 0;
}
function paperEquity(paper, tickers) {
	let v = paper.cash;
	for (const [asset, h] of Object.entries(paper.holdings ?? {})) v += h.qty * assetPx(asset, tickers);
	return v;
}
function applyPaperFill(paper, input) {
	const feeRate = paper.feeRate;
	if (!(input.qty > 0) || !(input.price > 0)) return {
		ok: false,
		message: "Quantité ou prix invalide."
	};
	const notional = input.qty * input.price;
	const fee = notional * feeRate;
	const holdings = { ...paper.holdings };
	const pos = holdings[input.base] ?? {
		qty: 0,
		avg: 0
	};
	let cash = paper.cash;
	let realized = paper.realizedPnl;
	let pnl = 0;
	if (input.side === "buy") {
		const spend = notional + fee;
		if (cash < spend) return {
			ok: false,
			message: `Solde papier insuffisant (${spend.toFixed(2)} EUR requis).`
		};
		const newQty = pos.qty + input.qty;
		const newAvg = newQty > 0 ? (pos.avg * pos.qty + notional) / newQty : 0;
		holdings[input.base] = {
			qty: newQty,
			avg: newAvg
		};
		cash -= spend;
	} else {
		if (pos.qty + 1e-12 < input.qty) return {
			ok: false,
			message: `Position ${input.base} insuffisante.`
		};
		pnl = notional - fee - pos.avg * input.qty;
		const newQty = pos.qty - input.qty;
		if (newQty <= 1e-12) delete holdings[input.base];
		else holdings[input.base] = {
			qty: newQty,
			avg: pos.avg
		};
		cash += notional - fee;
		realized += pnl;
	}
	const trade = {
		id: uid("pt"),
		botId: input.botId,
		pair: input.pair,
		side: input.side,
		amount: input.qty,
		price: input.price,
		fee,
		pnl,
		note: input.note,
		time: input.time ?? Date.now()
	};
	return {
		ok: true,
		paper: {
			...paper,
			cash,
			holdings,
			feesPaid: paper.feesPaid + fee,
			realizedPnl: realized,
			trades: [trade, ...paper.trades].slice(0, 250)
		},
		trade
	};
}
function snapshotEquity(paper, equity) {
	const curve = [...paper.equityCurve, {
		t: Date.now(),
		v: equity
	}].slice(-180);
	return {
		...paper,
		equityCurve: curve
	};
}
function resetPaperAccount(startingBalance, feeRate) {
	const start = Math.max(0, startingBalance);
	return {
		startingBalance: start,
		cash: start,
		holdings: {},
		feesPaid: 0,
		realizedPnl: 0,
		feeRate,
		trades: [],
		equityCurve: [{
			t: Date.now(),
			v: start
		}]
	};
}
function flattenPaper(paper, tickers) {
	let next = paper;
	let sold = 0;
	for (const [asset, h] of Object.entries(paper.holdings)) {
		if (!(h.qty > 0)) continue;
		const pair = Object.values(PAIR_BY_ID).find((p) => p.base === asset && p.quote === "EUR");
		const t = pair ? tickers[pair.id] : void 0;
		const price = t?.bid || t?.last || 0;
		if (!pair || !(price > 0)) continue;
		const res = applyPaperFill(next, {
			botId: "flatten",
			pair: pair.id,
			base: asset,
			side: "sell",
			qty: h.qty,
			price,
			note: "Liquidation papier"
		});
		if (res.ok) {
			next = res.paper;
			sold += 1;
		}
	}
	return {
		paper: next,
		sold
	};
}
function kindNeedsCandles(kind) {
	return BOT_KIND_BY_ID[kind]?.needsCandles ?? false;
}
var TAKER = .0026;
var MAKER = .0016;
var DEFAULT_BALANCES = [
	{
		asset: "USD",
		available: 25e3,
		hold: 0
	},
	{
		asset: "EUR",
		available: 8e3,
		hold: 0
	},
	{
		asset: "BTC",
		available: .12,
		hold: 0
	},
	{
		asset: "ETH",
		available: 1.85,
		hold: 0
	},
	{
		asset: "SOL",
		available: 32,
		hold: 0
	},
	{
		asset: "XRP",
		available: 1200,
		hold: 0
	},
	{
		asset: "ADA",
		available: 2500,
		hold: 0
	},
	{
		asset: "DOGE",
		available: 8e3,
		hold: 0
	}
];
var DEFAULT_SETTINGS = {
	confirmOrders: false,
	displayQuote: "USD",
	makerFee: MAKER,
	takerFee: TAKER
};
var DEFAULT_CONNECTION = {
	baseUrl: "",
	apiKey: "",
	apiSecret: ""
};
function cloneBalances(list) {
	return list.map((b) => ({ ...b }));
}
function getBal(list, asset) {
	const found = list.find((b) => b.asset === asset);
	if (found) return found;
	const created = {
		asset,
		available: 0,
		hold: 0
	};
	list.push(created);
	return created;
}
function pairAssets(pairId) {
	const meta = PAIR_BY_ID[pairId];
	return {
		base: meta?.base ?? "BTC",
		quote: meta?.quote ?? "USD",
		meta
	};
}
function liquidationPrice(entry, leverage, side) {
	const move = (1 / leverage - .006) * entry;
	return side === "long" ? Math.max(entry - move, 0) : entry + move;
}
function makePosition(order, px, now) {
	const side = order.side === "buy" ? "long" : "short";
	return {
		id: uid("pos"),
		pair: order.pair,
		side,
		size: order.amount,
		entry: px,
		leverage: order.leverage,
		margin: order.amount * px / order.leverage,
		liqPrice: liquidationPrice(px, order.leverage, side),
		tp: order.tp,
		sl: order.sl,
		trailingPct: order.trailingPct,
		peak: px,
		openedAt: now
	};
}
function buzz() {
	try {
		navigator.vibrate?.(12);
	} catch {}
}
function clonePaper(paper) {
	return {
		...paper,
		holdings: Object.fromEntries(Object.entries(paper.holdings).map(([k, v]) => [k, { ...v }])),
		trades: [...paper.trades],
		equityCurve: [...paper.equityCurve]
	};
}
var useTradingStore = create()(persist((set, get) => ({
	tickers: {},
	books: {},
	tapes: {},
	watchlist: [
		"XBTUSD",
		"ETHUSD",
		"SOLUSD",
		"XRPUSD",
		"ADAUSD"
	],
	lastPair: DEFAULT_PAIR,
	balances: cloneBalances(DEFAULT_BALANCES),
	orders: [],
	fills: [],
	positions: [],
	alerts: [],
	recurring: [],
	journal: [],
	settings: { ...DEFAULT_SETTINGS },
	connection: { ...DEFAULT_CONNECTION },
	lastTickAt: 0,
	live: false,
	error: null,
	bots: [],
	paper: {
		...DEFAULT_PAPER,
		equityCurve: []
	},
	botCandles: {},
	krakenBalances: {},
	krakenEur: 0,
	krakenSyncAt: 0,
	krakenError: null,
	liveFills: [],
	hydrateTickers: (list) => {
		const tickers = { ...get().tickers };
		for (const t of list) tickers[t.id] = t;
		set({
			tickers,
			lastTickAt: Date.now(),
			live: true,
			error: null
		});
		get().processTick();
		get().runBots();
	},
	setBook: (pair, book) => set({ books: {
		...get().books,
		[pair]: book
	} }),
	setTape: (pair, trades) => set({ tapes: {
		...get().tapes,
		[pair]: trades
	} }),
	setLive: (live, error = null) => set({
		live,
		error
	}),
	setLastPair: (pair) => set({ lastPair: pair }),
	toggleWatch: (pair) => {
		set({ watchlist: get().watchlist.includes(pair) ? get().watchlist.filter((p) => p !== pair) : [pair, ...get().watchlist] });
	},
	placeOrder: (input, opts) => {
		const silent = opts?.silent ?? false;
		const { base, quote, meta } = pairAssets(input.pair);
		const ticker = get().tickers[input.pair];
		if (!ticker) return {
			ok: false,
			message: "Marché indisponible pour le moment."
		};
		if (!meta) return {
			ok: false,
			message: "Paire inconnue."
		};
		if (!(input.amount > 0)) return {
			ok: false,
			message: "Quantité invalide."
		};
		if (input.amount < meta.ordermin) return {
			ok: false,
			message: `Minimum ${meta.ordermin} ${base}.`
		};
		const last = ticker.last;
		const leverage = Math.min(Math.max(input.leverage ?? 1, 1), meta.maxLeverage);
		const isMargin = leverage > 1;
		const now = Date.now();
		const order = {
			id: uid("ord"),
			pair: input.pair,
			side: input.side,
			type: input.type,
			amount: input.amount,
			price: input.price,
			stopPrice: input.stopPrice,
			filled: 0,
			avgPrice: 0,
			status: "open",
			leverage,
			tp: input.tp,
			sl: input.sl,
			trailingPct: input.trailingPct,
			fee: 0,
			createdAt: now,
			updatedAt: now,
			note: input.note
		};
		const shouldFillNow = input.type === "market" || input.type === "limit" && input.price != null && (input.side === "buy" && last <= input.price || input.side === "sell" && last >= input.price);
		const fillPrice = input.type === "market" ? input.side === "buy" ? ticker.ask || last : ticker.bid || last : input.price ?? last;
		const balances = cloneBalances(get().balances);
		const feeRate = shouldFillNow ? get().settings.takerFee : get().settings.makerFee;
		if (isMargin) {
			const marginNeeded = input.amount * fillPrice / leverage;
			const quoteBal = getBal(balances, quote);
			if (quoteBal.available < marginNeeded) return {
				ok: false,
				message: `Marge insuffisante en ${quote}.`
			};
			quoteBal.available -= marginNeeded;
			quoteBal.hold += marginNeeded;
		} else if (input.side === "buy") {
			const quoteBal = getBal(balances, quote);
			const cost = input.amount * (input.price ?? fillPrice);
			const hold = shouldFillNow ? 0 : cost;
			const spend = shouldFillNow ? cost * (1 + feeRate) : cost;
			if (quoteBal.available < spend) return {
				ok: false,
				message: `Solde ${quote} insuffisant.`
			};
			quoteBal.available -= spend;
			if (!shouldFillNow) quoteBal.hold += hold;
		} else {
			const baseBal = getBal(balances, base);
			if (baseBal.available < input.amount) return {
				ok: false,
				message: `Solde ${base} insuffisant.`
			};
			baseBal.available -= input.amount;
			if (!shouldFillNow) baseBal.hold += input.amount;
		}
		if (shouldFillNow) {
			const fee = input.amount * fillPrice * feeRate;
			order.status = "filled";
			order.filled = input.amount;
			order.avgPrice = fillPrice;
			order.fee = fee;
			const fill = {
				id: uid("fill"),
				orderId: order.id,
				pair: input.pair,
				side: input.side,
				amount: input.amount,
				price: fillPrice,
				fee,
				time: now
			};
			if (isMargin) set({
				balances,
				orders: [order, ...get().orders],
				fills: [fill, ...get().fills],
				positions: [makePosition(order, fillPrice, now), ...get().positions]
			});
			else if (input.side === "buy") {
				const baseBal = getBal(balances, base);
				baseBal.available += input.amount;
				set({
					balances,
					orders: [order, ...get().orders],
					fills: [fill, ...get().fills]
				});
			} else {
				const quoteBal = getBal(balances, quote);
				quoteBal.available += input.amount * fillPrice - fee;
				set({
					balances,
					orders: [order, ...get().orders],
					fills: [fill, ...get().fills]
				});
			}
			if (!silent) {
				buzz();
				toast.success(`${input.side === "buy" ? "Achat" : "Vente"} ${meta.display} exécuté`, { description: `${input.amount} ${base} @ ${fillPrice}` });
			}
			return {
				ok: true,
				message: "Ordre exécuté.",
				order
			};
		}
		set({
			balances,
			orders: [order, ...get().orders]
		});
		if (!silent) toast.message("Ordre ouvert", { description: `${meta.display} · ${input.type}` });
		return {
			ok: true,
			message: "Ordre placé.",
			order
		};
	},
	cancelOrder: (id) => {
		const order = get().orders.find((o) => o.id === id && o.status === "open");
		if (!order) return;
		const { base, quote } = pairAssets(order.pair);
		const balances = cloneBalances(get().balances);
		if (order.leverage > 1) {
			const quoteBal = getBal(balances, quote);
			const reserved = (order.price ?? 0) * order.amount / order.leverage;
			quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
			quoteBal.available += reserved;
		} else if (order.side === "buy") {
			const quoteBal = getBal(balances, quote);
			const reserved = (order.price ?? 0) * order.amount;
			quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
			quoteBal.available += reserved;
		} else {
			const baseBal = getBal(balances, base);
			baseBal.hold = Math.max(0, baseBal.hold - order.amount);
			baseBal.available += order.amount;
		}
		set({
			balances,
			orders: get().orders.map((o) => o.id === id ? {
				...o,
				status: "cancelled",
				updatedAt: Date.now()
			} : o)
		});
	},
	closePosition: (id) => {
		const pos = get().positions.find((p) => p.id === id);
		if (!pos) return;
		const ticker = get().tickers[pos.pair];
		if (!ticker) return;
		const { quote } = pairAssets(pos.pair);
		const px = ticker.last;
		const dir = pos.side === "long" ? 1 : -1;
		const pnl = (px - pos.entry) * pos.size * dir;
		const fee = pos.size * px * get().settings.takerFee;
		const balances = cloneBalances(get().balances);
		const quoteBal = getBal(balances, quote);
		quoteBal.hold = Math.max(0, quoteBal.hold - pos.margin);
		quoteBal.available += pos.margin + pnl - fee;
		const fill = {
			id: uid("fill"),
			orderId: pos.id,
			pair: pos.pair,
			side: pos.side === "long" ? "sell" : "buy",
			amount: pos.size,
			price: px,
			fee,
			time: Date.now()
		};
		set({
			balances,
			positions: get().positions.filter((p) => p.id !== id),
			fills: [fill, ...get().fills]
		});
		buzz();
		toast.success("Position clôturée", { description: `PnL ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ${quote}` });
	},
	addAlert: (alert) => {
		set({ alerts: [{
			...alert,
			id: uid("al"),
			createdAt: Date.now()
		}, ...get().alerts] });
	},
	removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
	convert: (from, to, amount) => {
		if (!(amount > 0) || from === to) return {
			ok: false,
			message: "Conversion invalide."
		};
		const tickers = get().tickers;
		const usdOf = (asset, qty) => {
			if (asset === "USD") return qty;
			if (asset === "EUR") {
				const btcUsd = tickers.XBTUSD?.last;
				const btcEur = tickers.XBTEUR?.last;
				if (btcUsd && btcEur) return qty * (btcUsd / btcEur);
				return qty * 1.08;
			}
			const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "USD");
			return t ? qty * t.last : 0;
		};
		const fromUsd = usdOf(from, amount);
		if (!fromUsd) return {
			ok: false,
			message: "Prix introuvable pour cet actif."
		};
		const toQty = usdOf(to, 1);
		if (!toQty) return {
			ok: false,
			message: "Actif d'arrivée indisponible."
		};
		const received = fromUsd / toQty * (1 - get().settings.takerFee);
		const balances = cloneBalances(get().balances);
		const src = getBal(balances, from);
		if (src.available < amount) return {
			ok: false,
			message: "Solde insuffisant."
		};
		src.available -= amount;
		getBal(balances, to).available += received;
		set({ balances });
		toast.success("Conversion exécutée", { description: `${amount} ${from} → ${received.toPrecision(6)} ${to}` });
		return {
			ok: true,
			message: "OK"
		};
	},
	addRecurring: (item) => set({ recurring: [{
		...item,
		id: uid("dca")
	}, ...get().recurring] }),
	toggleRecurring: (id) => set({ recurring: get().recurring.map((r) => r.id === id ? {
		...r,
		active: !r.active
	} : r) }),
	removeRecurring: (id) => set({ recurring: get().recurring.filter((r) => r.id !== id) }),
	addJournal: (entry) => set({ journal: [{
		...entry,
		id: uid("jnl"),
		createdAt: Date.now()
	}, ...get().journal] }),
	removeJournal: (id) => set({ journal: get().journal.filter((j) => j.id !== id) }),
	setSettings: (patch) => set({ settings: {
		...get().settings,
		...patch
	} }),
	setConnection: (patch) => set({ connection: {
		...get().connection,
		...patch
	} }),
	resetDemo: () => {
		set({
			balances: cloneBalances(DEFAULT_BALANCES),
			orders: [],
			fills: [],
			positions: [],
			alerts: [],
			recurring: [],
			journal: []
		});
		toast.message("Compte démo réinitialisé");
	},
	processTick: () => {
		const { tickers, orders, alerts, settings, positions } = get();
		const now = Date.now();
		let balances = cloneBalances(get().balances);
		let nextOrders = [...orders];
		let fills = [...get().fills];
		let nextPositions = [...positions];
		let nextAlerts = [...alerts];
		const nextRecurring = get().recurring.map((r) => ({ ...r }));
		let changed = false;
		for (const order of nextOrders) {
			if (order.status !== "open") continue;
			const t = tickers[order.pair];
			if (!t) continue;
			const last = t.last;
			let hit = false;
			if (order.type === "limit" && order.price != null) hit = order.side === "buy" ? last <= order.price : last >= order.price;
			else if (order.type === "stop" && order.stopPrice != null) hit = order.side === "buy" ? last >= order.stopPrice : last <= order.stopPrice;
			else if (order.type === "stop-limit" && order.stopPrice != null && order.price != null) hit = (order.side === "buy" ? last >= order.stopPrice : last <= order.stopPrice) && (order.side === "buy" ? last <= order.price : last >= order.price);
			if (!hit) continue;
			const { base, quote } = pairAssets(order.pair);
			const px = order.price ?? last;
			const fee = order.amount * px * settings.makerFee;
			order.status = "filled";
			order.filled = order.amount;
			order.avgPrice = px;
			order.fee = fee;
			order.updatedAt = now;
			fills = [{
				id: uid("fill"),
				orderId: order.id,
				pair: order.pair,
				side: order.side,
				amount: order.amount,
				price: px,
				fee,
				time: now
			}, ...fills];
			if (order.leverage > 1) {
				const quoteBal = getBal(balances, quote);
				const reserved = (order.price ?? px) * order.amount / order.leverage;
				quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
				nextPositions = [makePosition(order, px, now), ...nextPositions];
			} else if (order.side === "buy") {
				const quoteBal = getBal(balances, quote);
				const reserved = (order.price ?? px) * order.amount;
				quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
				const leftover = reserved - order.amount * px;
				quoteBal.available += Math.max(leftover, 0);
				getBal(balances, base).available += order.amount;
				quoteBal.available -= fee;
			} else {
				const baseBal = getBal(balances, base);
				baseBal.hold = Math.max(0, baseBal.hold - order.amount);
				getBal(balances, quote).available += order.amount * px - fee;
			}
			changed = true;
			toast.success("Ordre limite exécuté", { description: PAIR_BY_ID[order.pair]?.display });
		}
		nextPositions = nextPositions.map((pos) => {
			const t = tickers[pos.pair];
			if (!t) return pos;
			const last = t.last;
			const peak = pos.side === "long" ? Math.max(pos.peak ?? pos.entry, last) : Math.min(pos.peak ?? pos.entry, last);
			if (peak !== pos.peak) changed = true;
			return {
				...pos,
				peak
			};
		}).filter((pos) => {
			const t = tickers[pos.pair];
			if (!t) return true;
			const last = t.last;
			const hitTp = pos.tp != null && (pos.side === "long" ? last >= pos.tp : last <= pos.tp);
			const hitSl = pos.sl != null && (pos.side === "long" ? last <= pos.sl : last >= pos.sl);
			const hitLiq = pos.side === "long" ? last <= pos.liqPrice : last >= pos.liqPrice;
			const trail = pos.trailingPct;
			const peak = pos.peak ?? pos.entry;
			const hitTrail = trail != null && trail > 0 && (pos.side === "long" ? last <= peak * (1 - trail / 100) : last >= peak * (1 + trail / 100));
			if (!hitTp && !hitSl && !hitLiq && !hitTrail) return true;
			const { quote } = pairAssets(pos.pair);
			const dir = pos.side === "long" ? 1 : -1;
			const pnl = (last - pos.entry) * pos.size * dir;
			const quoteBal = getBal(balances, quote);
			quoteBal.hold = Math.max(0, quoteBal.hold - pos.margin);
			quoteBal.available += pos.margin + pnl;
			changed = true;
			toast.message(hitLiq ? "Liquidation" : hitTrail ? "Trailing stop" : "TP/SL déclenché", { description: PAIR_BY_ID[pos.pair]?.display });
			return false;
		});
		nextAlerts = nextAlerts.map((al) => {
			if (al.triggeredAt) return al;
			const t = tickers[al.pair];
			if (!t) return al;
			if (!(al.condition === "above" ? t.last >= al.price : t.last <= al.price)) return al;
			changed = true;
			toast("Alerte prix", { description: `${PAIR_BY_ID[al.pair]?.display} ${al.condition === "above" ? "≥" : "≤"} ${al.price}` });
			return {
				...al,
				triggeredAt: now
			};
		});
		for (const plan of nextRecurring) {
			if (!plan.active || plan.nextAt > now) continue;
			const t = tickers[plan.pair];
			const meta = PAIR_BY_ID[plan.pair];
			if (!t?.last || !meta) continue;
			const amount = plan.amountQuote / t.last;
			if (amount < meta.ordermin) continue;
			const quoteBal = getBal(balances, meta.quote);
			const fee = plan.amountQuote * settings.takerFee;
			if (quoteBal.available < plan.amountQuote + fee) continue;
			quoteBal.available -= plan.amountQuote + fee;
			getBal(balances, meta.base).available += amount;
			const order = {
				id: uid("ord"),
				pair: plan.pair,
				side: "buy",
				type: "market",
				amount,
				filled: amount,
				avgPrice: t.last,
				status: "filled",
				leverage: 1,
				fee,
				createdAt: now,
				updatedAt: now,
				note: "DCA"
			};
			nextOrders = [order, ...nextOrders];
			fills = [{
				id: uid("fill"),
				orderId: order.id,
				pair: plan.pair,
				side: "buy",
				amount,
				price: t.last,
				fee,
				time: now
			}, ...fills];
			plan.nextAt = now + (plan.cadence === "daily" ? 864e5 : 6048e5);
			changed = true;
			toast.success("Achat récurrent", { description: meta.display });
		}
		if (changed) set({
			balances,
			orders: nextOrders,
			fills,
			positions: nextPositions,
			alerts: nextAlerts,
			recurring: nextRecurring
		});
	},
	createBot: (input) => {
		const pair = toEurPair(input.pair);
		const meta = PAIR_BY_ID[pair];
		const bot = {
			id: uid("bot"),
			name: input.name?.trim() || `${kindTitle(input.kind)} ${meta?.display ?? pair}`,
			kind: input.kind,
			venue: input.venue,
			status: "idle",
			pair,
			interval: input.interval,
			sizeQuote: input.sizeQuote,
			params: input.params,
			createdAt: Date.now(),
			lastNote: "Prêt.",
			stats: { ...EMPTY_STATS },
			runtime: {}
		};
		set({ bots: [bot, ...get().bots] });
		return bot;
	},
	startBot: (id) => {
		const bot = get().bots.find((b) => b.id === id);
		if (!bot) return {
			ok: false,
			message: "Bot introuvable."
		};
		const pair = toEurPair(bot.pair);
		if (PAIR_BY_ID[pair]?.quote !== "EUR") {
			toast.message("Les bots n’opèrent qu’en EUR.");
			return {
				ok: false,
				message: "Les bots n’opèrent qu’en EUR."
			};
		}
		if (bot.venue === "live") {
			const { apiKey, apiSecret } = get().connection;
			if (!apiKey || !apiSecret) {
				toast.message("Ajoute tes clés publique et privée Kraken.");
				return {
					ok: false,
					message: "Ajoute tes clés publique et privée Kraken."
				};
			}
			get().syncKraken();
		}
		if (bot.venue === "live" && !get().tickers[pair] && !get().tickers[bot.pair]) {
			toast.message("Marché indisponible.");
			return {
				ok: false,
				message: "Marché indisponible."
			};
		}
		set({ bots: get().bots.map((b) => b.id === id ? {
			...b,
			pair,
			status: "running",
			startedAt: Date.now(),
			lastNote: "Démarré.",
			error: void 0,
			runtime: b.kind === "dca" ? {
				...b.runtime,
				nextDcaAt: Date.now(),
				inFlight: false
			} : {
				...b.runtime,
				inFlight: false
			}
		} : b) });
		get().runBots();
		return {
			ok: true,
			message: "Bot lancé."
		};
	},
	pauseBot: (id) => {
		set({ bots: get().bots.map((b) => b.id === id ? {
			...b,
			status: "paused",
			lastNote: "En pause."
		} : b) });
	},
	removeBot: (id) => set({ bots: get().bots.filter((b) => b.id !== id) }),
	updateBot: (id, patch) => {
		const bot = get().bots.find((b) => b.id === id);
		if (!bot || bot.status === "running") {
			toast.message("Mets le bot en pause pour le modifier.");
			return;
		}
		set({ bots: get().bots.map((b) => b.id === id ? {
			...b,
			...patch,
			params: patch.params ? {
				...b.params,
				...patch.params
			} : b.params
		} : b) });
	},
	duplicateBot: (id) => {
		const bot = get().bots.find((b) => b.id === id);
		if (!bot) return null;
		const copy = {
			...bot,
			id: uid("bot"),
			name: `${bot.name} copie`,
			status: "idle",
			createdAt: Date.now(),
			startedAt: void 0,
			lastActionAt: void 0,
			lastNote: "Copie prête.",
			error: void 0,
			stats: { ...EMPTY_STATS },
			runtime: {},
			pair: toEurPair(bot.pair)
		};
		set({ bots: [copy, ...get().bots] });
		return copy;
	},
	setPaperStart: (amount) => {
		if (!(amount > 0)) return {
			ok: false,
			message: "Solde de départ invalide."
		};
		if (get().bots.some((b) => b.venue === "paper" && b.status === "running")) return {
			ok: false,
			message: "Pause les bots papier avant de changer le solde."
		};
		set({ paper: resetPaperAccount(amount, get().paper.feeRate) });
		toast.message("Solde papier appliqué", { description: `${amount.toLocaleString("fr-FR")} EUR` });
		return {
			ok: true,
			message: "OK"
		};
	},
	setPaperFee: (rate) => {
		const feeRate = Math.min(Math.max(rate, 0), .05);
		if (feeRate === get().paper.feeRate) return;
		set({ paper: {
			...get().paper,
			feeRate
		} });
		toast.message("Frais papier mis à jour", { description: `${(feeRate * 100).toFixed(2)} % taker` });
	},
	resetPaper: () => {
		if (get().bots.some((b) => b.venue === "paper" && b.status === "running")) {
			toast.message("Pause les bots papier avant de réinitialiser.");
			return;
		}
		const paper = get().paper;
		set({
			paper: resetPaperAccount(paper.startingBalance, paper.feeRate),
			bots: get().bots.map((b) => b.venue === "paper" ? {
				...b,
				stats: { ...EMPTY_STATS },
				runtime: {},
				lastNote: "Compte papier réinitialisé.",
				status: "idle"
			} : b)
		});
		toast.message("Simulation réinitialisée");
	},
	flattenPaperPositions: () => {
		const { paper, sold } = flattenPaper(get().paper, get().tickers);
		set({ paper: snapshotEquity(paper, paperEquity(paper, get().tickers)) });
		if (sold) toast.success(`Positions papier liquidées (${sold})`);
		else toast.message("Rien à liquider");
	},
	setBotCandles: (bag) => set({ botCandles: {
		...get().botCandles,
		...bag
	} }),
	pauseAllBots: (venue) => {
		set({ bots: get().bots.map((b) => b.status === "running" && (!venue || b.venue === venue) ? {
			...b,
			status: "paused",
			lastNote: "Stop global.",
			runtime: {
				...b.runtime,
				inFlight: false
			}
		} : b) });
		toast.message(venue === "live" ? "Bots réels en pause" : "Bots en pause");
	},
	syncKraken: async () => {
		const { apiKey, apiSecret } = get().connection;
		if (!apiKey || !apiSecret) {
			const message = "Clés Kraken manquantes.";
			set({ krakenError: message });
			return {
				ok: false,
				message
			};
		}
		const res = await krakenBalance({ data: {
			apiKey,
			apiSecret
		} });
		set({
			krakenBalances: res.balances,
			krakenEur: res.eur,
			krakenSyncAt: Date.now(),
			krakenError: res.ok ? null : res.message
		});
		get().setConnection({
			testedAt: Date.now(),
			testOk: res.ok,
			testMessage: res.message
		});
		return {
			ok: res.ok,
			message: res.message
		};
	},
	dispatchKrakenFill: async (input) => {
		const { apiKey, apiSecret } = get().connection;
		const fail = (message, pause = false) => {
			set({ bots: get().bots.map((b) => b.id === input.botId ? {
				...b,
				status: pause ? "paused" : b.status === "running" ? "running" : b.status,
				lastNote: message,
				error: message,
				runtime: {
					...input.prevRuntime,
					inFlight: false,
					errorStreak: (b.runtime.errorStreak ?? 0) + 1
				}
			} : b) });
			toast.message("Kraken a refusé l’ordre", { description: message });
		};
		if (!apiKey || !apiSecret) {
			fail("Clés Kraken manquantes.", true);
			return;
		}
		const meta = PAIR_BY_ID[input.pair];
		if (!meta || meta.quote !== "EUR") {
			fail("Paire hors EUR.", true);
			return;
		}
		const volume = formatKrakenVolume(input.qty, meta.lotDecimals);
		if (!(Number(volume) > 0)) {
			fail(`Volume invalide (${volume}).`);
			return;
		}
		if (Number(volume) < meta.ordermin) {
			fail(`Sous le minimum ${meta.ordermin} ${meta.base}.`);
			return;
		}
		const balances = get().krakenBalances;
		if (input.side === "buy" && (get().krakenEur > 0 || Object.keys(balances).length > 0)) {
			const need = input.qty * input.price * 1.004;
			if (get().krakenEur + 1e-9 < need) {
				fail(`EUR insuffisant sur Kraken (${need.toFixed(2)} requis).`, true);
				return;
			}
		}
		if (input.side === "sell") {
			const have = balances[meta.base] ?? 0;
			if (Object.keys(balances).length > 0 && have + 1e-12 < input.qty) {
				fail(`Solde ${meta.base} insuffisant sur Kraken.`, true);
				return;
			}
		}
		const res = await krakenAddOrder({ data: {
			apiKey,
			apiSecret,
			pair: input.pair,
			side: input.side,
			volume
		} });
		const now = Date.now();
		if (!res.ok) {
			const fatal = /Invalid key|Invalid signature|Permission denied|Insufficient funds/i.test(res.message);
			const streak = (get().bots.find((b) => b.id === input.botId)?.runtime.errorStreak ?? 0) + 1;
			fail(res.message, fatal || streak >= 3);
			if (/Invalid key|Invalid signature/i.test(res.message)) get().pauseAllBots("live");
			return;
		}
		const feeRate = get().settings.takerFee;
		const fee = input.qty * input.price * feeRate;
		let pnl = 0;
		if (input.side === "sell" && input.entryAvg && input.entryAvg > 0) pnl = input.qty * input.price - fee - input.entryAvg * input.qty;
		set({
			liveFills: [{
				id: uid("lf"),
				botId: input.botId,
				pair: input.pair,
				side: input.side,
				amount: input.qty,
				price: input.price,
				fee,
				pnl,
				note: input.note,
				time: now,
				txid: res.txid
			}, ...get().liveFills].slice(0, 250),
			bots: get().bots.map((b) => {
				if (b.id !== input.botId) return b;
				const stats = { ...b.stats };
				stats.trades += 1;
				stats.feesPaid += fee;
				stats.volume += input.qty * input.price;
				stats.realizedPnl += pnl;
				if (pnl > 0) stats.wins += 1;
				const dayPnl = (input.intendedRuntime.dayPnl ?? 0) + pnl;
				const dayTrades = (input.intendedRuntime.dayTrades ?? 0) + 1;
				const consecutiveLosses = input.side === "sell" ? pnl < 0 ? (b.runtime.consecutiveLosses ?? 0) + 1 : 0 : b.runtime.consecutiveLosses ?? 0;
				return {
					...b,
					stats,
					lastActionAt: now,
					lastNote: `${input.note}${res.txid ? ` · ${res.txid}` : ""}`,
					error: void 0,
					runtime: {
						...input.intendedRuntime,
						inFlight: false,
						dayPnl,
						dayTrades,
						consecutiveLosses,
						errorStreak: 0
					}
				};
			})
		});
		toast.success("Ordre Kraken", { description: res.message });
		get().syncKraken();
	},
	runBots: () => {
		if (get().bots.filter((b) => b.status === "running").length === 0) return;
		const tickers = get().tickers;
		const now = Date.now();
		let paper = clonePaper(get().paper);
		let botsChanged = false;
		let paperChanged = false;
		const outgoing = [];
		const paperEq = paperEquity(paper, tickers);
		const liveEq = Object.entries(get().krakenBalances).reduce((s, [asset, qty]) => s + eurValue(asset, qty, tickers), 0);
		const nextBots = get().bots.map((bot) => {
			if (bot.status !== "running") return bot;
			const pair = toEurPair(bot.pair);
			const ticker = tickers[pair] ?? tickers[bot.pair];
			if (!ticker?.last) {
				if (bot.lastNote === "Prix indisponible.") return bot;
				botsChanged = true;
				return {
					...bot,
					pair,
					lastNote: "Prix indisponible."
				};
			}
			const meta = PAIR_BY_ID[pair];
			if (!meta || meta.quote !== "EUR") {
				botsChanged = true;
				return {
					...bot,
					status: "error",
					lastNote: "Paire hors EUR."
				};
			}
			const candleKey = `${pair}:${bot.interval}`;
			const candles = get().botCandles[candleKey] ?? get().botCandles[`${bot.pair}:${bot.interval}`];
			if (kindNeedsCandles(bot.kind) && (!candles || candles.length < 10)) {
				if (bot.lastNote.startsWith("Chargement")) return bot;
				botsChanged = true;
				return {
					...bot,
					pair,
					lastNote: "Chargement des chandeliers…"
				};
			}
			if (bot.runtime.inFlight) {
				const since = bot.runtime.inFlightAt ?? bot.lastActionAt ?? 0;
				if (since && now - since > 9e4) {
					botsChanged = true;
					return {
						...bot,
						lastNote: "Timeout Kraken, nouvel essai.",
						runtime: {
							...bot.runtime,
							inFlight: false,
							inFlightAt: void 0
						}
					};
				}
				return bot;
			}
			const { fills, runtime, note } = evaluateBot({
				...bot,
				pair
			}, {
				now,
				ticker,
				candles,
				equity: bot.venue === "paper" ? paperEq : liveEq || paperEq
			});
			let next = {
				...bot,
				pair,
				runtime,
				lastNote: note
			};
			if (note.startsWith("Stop journalier") || note.startsWith("Pertes consécutives") || note.startsWith("Quota")) {
				botsChanged = true;
				return {
					...next,
					status: "paused"
				};
			}
			if (fills.length === 0) {
				if (note === bot.lastNote && runtime.lastPrice === bot.runtime.lastPrice && runtime.lastCandleTime === bot.runtime.lastCandleTime && runtime.nextDcaAt === bot.runtime.nextDcaAt && runtime.peakPrice === bot.runtime.peakPrice) return bot;
				botsChanged = true;
				return next;
			}
			const stats = { ...bot.stats };
			if (bot.venue === "live") {
				const fill = fills.find((f) => f.qty >= meta.ordermin);
				if (!fill) {
					botsChanged = true;
					return {
						...next,
						lastNote: `Sous le minimum ${meta.ordermin} ${meta.base}.`
					};
				}
				botsChanged = true;
				outgoing.push({
					botId: bot.id,
					pair,
					side: fill.side,
					qty: fill.qty,
					price: fill.price,
					note: fill.note,
					prevRuntime: bot.runtime,
					intendedRuntime: runtime,
					entryAvg: bot.runtime.positionAvg
				});
				return {
					...next,
					runtime: {
						...runtime,
						inFlight: true,
						inFlightAt: now
					},
					lastNote: "Envoi de l’ordre à Kraken…"
				};
			}
			for (const fill of fills) {
				if (fill.qty < meta.ordermin) {
					next = {
						...next,
						lastNote: `Sous le minimum ${meta.ordermin} ${meta.base}.`
					};
					continue;
				}
				const res = applyPaperFill(paper, {
					botId: bot.id,
					pair,
					base: meta.base,
					side: fill.side,
					qty: fill.qty,
					price: fill.price,
					note: fill.note
				});
				if (!res.ok) {
					next = {
						...next,
						lastNote: res.message
					};
					continue;
				}
				paper = res.paper;
				paperChanged = true;
				stats.trades += 1;
				stats.feesPaid += res.trade.fee;
				stats.volume += fill.qty * fill.price;
				stats.realizedPnl += res.trade.pnl;
				if (res.trade.pnl > 0) stats.wins += 1;
				const dayPnl = (next.runtime.dayPnl ?? 0) + res.trade.pnl;
				const dayTrades = (next.runtime.dayTrades ?? 0) + 1;
				const consecutiveLosses = fill.side === "sell" ? res.trade.pnl < 0 ? (next.runtime.consecutiveLosses ?? 0) + 1 : 0 : next.runtime.consecutiveLosses ?? 0;
				next = {
					...next,
					stats,
					lastActionAt: now,
					lastNote: fill.note,
					runtime: {
						...next.runtime,
						dayPnl,
						dayTrades,
						consecutiveLosses
					}
				};
				toast.message(bot.name, { description: `${fill.side === "buy" ? "Achat" : "Vente"} papier · frais ${res.trade.fee.toFixed(2)} EUR` });
			}
			botsChanged = true;
			return next;
		});
		if (paperChanged) paper = snapshotEquity(paper, paperEquity(paper, tickers));
		if (botsChanged || paperChanged) set({
			bots: nextBots,
			paper
		});
		for (const o of outgoing) get().dispatchKrakenFill(o);
	}
}), {
	name: "nautilus-desk",
	version: 2,
	storage: typeof window === "undefined" ? void 0 : createJSONStorage(() => localStorage),
	partialize: (s) => ({
		watchlist: s.watchlist,
		lastPair: s.lastPair,
		balances: s.balances,
		orders: s.orders,
		fills: s.fills,
		positions: s.positions,
		alerts: s.alerts,
		recurring: s.recurring,
		journal: s.journal,
		settings: s.settings,
		connection: s.connection,
		bots: s.bots,
		paper: s.paper,
		liveFills: s.liveFills
	}),
	skipHydration: true,
	migrate: (persisted, from) => {
		const s = persisted;
		if (from < 2 && Array.isArray(s.bots)) s.bots = s.bots.map((b) => ({
			...b,
			pair: toEurPair(b.pair),
			status: b.venue === "live" && b.status === "running" ? "paused" : b.status,
			runtime: {
				...b.runtime,
				inFlight: false
			}
		}));
		return s;
	},
	onRehydrateStorage: () => (state) => {
		if (!state) return;
		state.bots = state.bots.map((b) => {
			const pair = toEurPair(b.pair);
			const pauseLive = b.venue === "live" && b.status === "running";
			return {
				...b,
				pair,
				status: pauseLive ? "paused" : b.status,
				lastNote: pauseLive ? "Pause après rechargement — relance pour trader réel." : b.lastNote,
				runtime: {
					...b.runtime,
					inFlight: false,
					inFlightAt: void 0
				}
			};
		});
	}
}));
function eurUsdRate(tickers) {
	const a = tickers.XBTUSD?.last;
	const b = tickers.XBTEUR?.last;
	if (a && b) return a / b;
	return 1.08;
}
function usdValue(asset, qty, tickers) {
	if (asset === "USD") return qty;
	if (asset === "EUR") return qty * eurUsdRate(tickers);
	const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "USD");
	return t ? qty * t.last : 0;
}
function eurValue(asset, qty, tickers) {
	if (asset === "EUR") return qty;
	if (asset === "USD") {
		const fx = eurUsdRate(tickers);
		return fx ? qty / fx : qty / 1.08;
	}
	const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "EUR");
	return t ? qty * t.last : 0;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DFwZ_5tV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function NautilusMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		fill: "none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "8",
				fill: "currentColor",
				className: "text-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M22.5 16c0 4.14-3.02 7.5-6.75 7.5-2.9 0-5.35-2.02-6.3-4.82",
				stroke: "#07080A",
				strokeWidth: "1.7",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M21.2 16c0 3.2-2.32 5.8-5.18 5.8-2.18 0-4.04-1.5-4.8-3.66",
				stroke: "#07080A",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				opacity: "0.85"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M19.6 16c0 2.16-1.55 3.9-3.45 3.9-1.4 0-2.6-.95-3.12-2.32",
				stroke: "#07080A",
				strokeWidth: "1.35",
				strokeLinecap: "round",
				opacity: "0.7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "16.2",
				cy: "16.1",
				r: "1.35",
				fill: "#07080A"
			})
		]
	});
}
function useBotEngine() {
	const runningKey = useTradingStore((s) => s.bots.filter((b) => b.status === "running").map((b) => `${b.id}:${b.pair}:${b.interval}:${b.kind}`).join("|"));
	const fetching = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!runningKey) return;
		let cancelled = false;
		const pull = async () => {
			if (fetching.current) return;
			const bots = useTradingStore.getState().bots.filter((b) => b.status === "running");
			const keys = [...new Set(bots.filter((b) => kindNeedsCandles(b.kind)).map((b) => `${b.pair}:${b.interval}`))];
			if (keys.length === 0) return;
			fetching.current = true;
			const bag = {};
			try {
				await Promise.all(keys.map(async (key) => {
					const [pair, interval] = key.split(":");
					if (!pair || !interval) return;
					try {
						bag[key] = await fetchOhlc({ data: {
							pair,
							interval: Number(interval)
						} });
					} catch {}
				}));
				if (!cancelled && Object.keys(bag).length > 0) {
					useTradingStore.getState().setBotCandles(bag);
					useTradingStore.getState().runBots();
				}
			} finally {
				fetching.current = false;
			}
		};
		pull();
		const id = window.setInterval(() => void pull(), 14e3);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, [runningKey]);
}
function useTickerEngine() {
	(0, import_react.useEffect)(() => {
		useTradingStore.persist.rehydrate();
		let cancelled = false;
		const pull = async () => {
			try {
				const list = await fetchTickers();
				if (!cancelled) useTradingStore.getState().hydrateTickers(list);
			} catch (err) {
				if (!cancelled) {
					if (!(Object.keys(useTradingStore.getState().tickers).length > 0)) useTradingStore.getState().setLive(false, err instanceof Error ? err.message : "Flux marché indisponible");
				}
			}
		};
		pull();
		const id = window.setInterval(() => void pull(), 2200);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, []);
}
function useBookEngine(pair, enabled) {
	(0, import_react.useEffect)(() => {
		if (!pair || !enabled) return;
		let cancelled = false;
		const pull = async () => {
			try {
				const [book, tape] = await Promise.all([fetchDepth({ data: { pair } }), fetchTape({ data: { pair } })]);
				if (cancelled) return;
				useTradingStore.getState().setBook(pair, book);
				useTradingStore.getState().setTape(pair, tape);
			} catch {}
		};
		pull();
		const id = window.setInterval(() => void pull(), 2500);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, [pair, enabled]);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var NAV = [
	{
		to: "/",
		label: "Marchés",
		icon: LayoutGrid,
		match: (p) => p === "/"
	},
	{
		to: "/trade/$pair",
		label: "Trade",
		icon: ChartCandlestick,
		match: (p) => p.startsWith("/trade")
	},
	{
		to: "/bot",
		label: "Bot",
		icon: Bot,
		match: (p) => p.startsWith("/bot")
	},
	{
		to: "/wallet",
		label: "Compte",
		icon: Briefcase,
		match: (p) => p.startsWith("/wallet")
	},
	{
		to: "/orders",
		label: "Ordres",
		icon: ListOrdered,
		match: (p) => p.startsWith("/orders")
	},
	{
		to: "/tools",
		label: "Outils",
		icon: ArrowLeftRight,
		match: (p) => ![
			"/",
			"/wallet",
			"/orders",
			"/bot"
		].includes(p) && !p.startsWith("/trade")
	}
];
function AppShell({ children }) {
	useTickerEngine();
	useBotEngine();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const lastPair = useTradingStore((s) => s.lastPair);
	const live = useTradingStore((s) => s.live);
	const lastTickAt = useTradingStore((s) => s.lastTickAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NautilusMark, { className: "size-7" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold tracking-tight",
						children: "Nautilus"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePill, {
					live,
					at: lastTickAt
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-20 flex-col items-center border-r border-border bg-card pt-5 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NautilusMark, { className: "mb-8 size-9" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-0.5",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const active = item.match(pathname);
							const dest = item.to === "/trade/$pair" ? {
								to: "/trade/$pair",
								params: { pair: lastPair }
							} : { to: item.to };
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								...dest,
								className: cn("flex flex-col items-center gap-1 rounded-md px-2 py-2.5 text-xs font-medium transition-colors duration-150", active ? "text-foreground" : "text-muted-foreground hover:text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid size-9 place-items-center rounded-full", active && "bg-muted"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: cn("size-5", active && "text-accent"),
										strokeWidth: 1.75
									})
								}), item.label]
							}, item.label);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePill, {
							live,
							at: lastTickAt,
							compact: true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-h-dvh pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-20",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-[4.25rem] grid-cols-6",
					children: NAV.map((item) => {
						const Icon = item.icon;
						const active = item.match(pathname);
						const dest = item.to === "/trade/$pair" ? {
							to: "/trade/$pair",
							params: { pair: lastPair }
						} : { to: item.to };
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							...dest,
							className: cn("flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-150", active ? "text-foreground" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-9 place-items-center rounded-full", active && "bg-muted"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: cn("size-4", active && "text-accent"),
									strokeWidth: 1.75
								})
							}), item.label]
						}, item.label);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { style: {
					background: "#181C23",
					border: "1px solid #252A33",
					color: "#F1F3F6"
				} }
			})
		]
	});
}
function LivePill({ live, at, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs font-medium uppercase tracking-wide", live ? "text-buy" : "text-muted-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", live ? "bg-buy" : "bg-subtle") }),
			compact ? live ? "Live" : "Off" : live ? "Kraken live" : "Hors ligne",
			!compact && at > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-subtle normal-case tracking-normal",
				children: new Date(at).toLocaleTimeString("fr-FR", {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit"
				})
			})
		]
	});
}
var styles_default = "/assets/styles-Boqxuctk.css";
var APP_NAME = "Nautilus";
var Route$19 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#090A0C"
			},
			{
				name: "description",
				content: "Terminal de trading mobile connecté à Kraken — marchés, carnet, ordres et outils pro."
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fr",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$18 = () => import("./routes-D-kVJA2q.mjs");
var Route$18 = createFileRoute("/")({
	loader: async () => {
		try {
			return await fetchTickers();
		} catch {
			return [];
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./alerts-BTr1vv5n.mjs");
var Route$17 = createFileRoute("/alerts")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./arb-DURxqp-K.mjs");
var Route$16 = createFileRoute("/arb")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./bot-C4o9Q_Vv.mjs");
var Route$15 = createFileRoute("/bot")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./calculator-CnXKDzgZ.mjs");
var Route$14 = createFileRoute("/calculator")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./connect-Bb_jnwYm.mjs");
var Route$13 = createFileRoute("/connect")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./convert-C_l-lfTN.mjs");
var Route$12 = createFileRoute("/convert")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./correlation-CrDHWT8D.mjs");
var Route$11 = createFileRoute("/correlation")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./dca-MPAo3SpA.mjs");
var Route$10 = createFileRoute("/dca")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./heatmap-CECQ1qBh.mjs");
var Route$9 = createFileRoute("/heatmap")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./journal-CPusxBtM.mjs");
var Route$8 = createFileRoute("/journal")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./orders-CqypMGcy.mjs");
var Route$7 = createFileRoute("/orders")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./risk-C0Pfojr0.mjs");
var Route$6 = createFileRoute("/risk")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./screener-CqVzMwmF.mjs");
var Route$5 = createFileRoute("/screener")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./settings-CXEjZcHJ.mjs");
var Route$4 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./staking-YhCkHCXj.mjs");
var Route$3 = createFileRoute("/staking")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./tools-D0a0Ov7F.mjs");
var Route$2 = createFileRoute("/tools")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./wallet-Y3c_O7Ph.mjs");
var Route$1 = createFileRoute("/wallet")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./trade._pair-D4kw4bmB.mjs");
var Route = createFileRoute("/trade/$pair")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$18.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$19
	}),
	AlertsRoute: Route$17.update({
		id: "/alerts",
		path: "/alerts",
		getParentRoute: () => Route$19
	}),
	ArbRoute: Route$16.update({
		id: "/arb",
		path: "/arb",
		getParentRoute: () => Route$19
	}),
	BotRoute: Route$15.update({
		id: "/bot",
		path: "/bot",
		getParentRoute: () => Route$19
	}),
	CalculatorRoute: Route$14.update({
		id: "/calculator",
		path: "/calculator",
		getParentRoute: () => Route$19
	}),
	ConnectRoute: Route$13.update({
		id: "/connect",
		path: "/connect",
		getParentRoute: () => Route$19
	}),
	ConvertRoute: Route$12.update({
		id: "/convert",
		path: "/convert",
		getParentRoute: () => Route$19
	}),
	CorrelationRoute: Route$11.update({
		id: "/correlation",
		path: "/correlation",
		getParentRoute: () => Route$19
	}),
	DcaRoute: Route$10.update({
		id: "/dca",
		path: "/dca",
		getParentRoute: () => Route$19
	}),
	HeatmapRoute: Route$9.update({
		id: "/heatmap",
		path: "/heatmap",
		getParentRoute: () => Route$19
	}),
	JournalRoute: Route$8.update({
		id: "/journal",
		path: "/journal",
		getParentRoute: () => Route$19
	}),
	OrdersRoute: Route$7.update({
		id: "/orders",
		path: "/orders",
		getParentRoute: () => Route$19
	}),
	RiskRoute: Route$6.update({
		id: "/risk",
		path: "/risk",
		getParentRoute: () => Route$19
	}),
	ScreenerRoute: Route$5.update({
		id: "/screener",
		path: "/screener",
		getParentRoute: () => Route$19
	}),
	SettingsRoute: Route$4.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$19
	}),
	StakingRoute: Route$3.update({
		id: "/staking",
		path: "/staking",
		getParentRoute: () => Route$19
	}),
	ToolsRoute: Route$2.update({
		id: "/tools",
		path: "/tools",
		getParentRoute: () => Route$19
	}),
	WalletRoute: Route$1.update({
		id: "/wallet",
		path: "/wallet",
		getParentRoute: () => Route$19
	}),
	TradePairRoute: Route.update({
		id: "/trade/$pair",
		path: "/trade/$pair",
		getParentRoute: () => Route$19
	})
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { formatPrice as A, fetchKrakenStatus as C, formatDateTime as D, formatCompact as E, formatTime as M, formatFiat as O, vwap as S, fetchOhlcHistory as T, macd as _, useBookEngine as a, usdValue as b, DCA_INTERVALS as c, bollinger as d, defaultParams as f, eurValue as g, eurUsdRate as h, cn as i, formatQty as j, formatPct as k, atr as l, ema as m, Route as n, BOT_CANDLE_INTERVALS as o, defaultSize as p, Route$18 as r, BOT_KIND_BY_ID as s, router_exports as t, backtestBot as u, rsi as v, fetchOhlc as w, useTradingStore as x, stochastic as y };
