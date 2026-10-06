import { createHash, createHmac } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/pairs-vD0TEx-j.js
var ASSET_DISPLAY = {
	XBT: "BTC",
	XXBT: "BTC",
	XDG: "DOGE",
	XXDG: "DOGE",
	XETH: "ETH",
	XXRP: "XRP",
	XLTC: "LTC",
	XXLM: "XLM",
	XXMR: "XMR"
};
function displayAsset(code) {
	return ASSET_DISPLAY[code] ?? code.replace(/^Z(?=USD|EUR|GBP|JPY|CAD)/, "");
}
function pair(id, resultKey, wsname, base, quote, pairDecimals, lotDecimals, tickSize, ordermin, maxLeverage) {
	const displayBase = displayAsset(base);
	const displayQuote = displayAsset(quote);
	return {
		id,
		resultKey,
		wsname,
		base: displayBase,
		quote: displayQuote,
		displayBase,
		display: `${displayBase}/${displayQuote}`,
		pairDecimals,
		lotDecimals,
		tickSize,
		ordermin,
		maxLeverage
	};
}
var PAIR_UNIVERSE = [
	pair("XBTUSD", "XXBTZUSD", "XBT/USD", "XBT", "USD", 1, 8, .1, 5e-5, 10),
	pair("XBTEUR", "XXBTZEUR", "XBT/EUR", "XBT", "EUR", 1, 8, .1, 5e-5, 10),
	pair("ETHUSD", "XETHZUSD", "ETH/USD", "ETH", "USD", 2, 8, .01, .001, 10),
	pair("ETHEUR", "XETHZEUR", "ETH/EUR", "ETH", "EUR", 2, 8, .01, .001, 10),
	pair("SOLUSD", "SOLUSD", "SOL/USD", "SOL", "USD", 2, 8, .01, .06, 10),
	pair("SOLEUR", "SOLEUR", "SOL/EUR", "SOL", "EUR", 2, 8, .01, .06, 10),
	pair("XRPUSD", "XXRPZUSD", "XRP/USD", "XRP", "USD", 5, 8, 1e-5, 1.65, 10),
	pair("XRPEUR", "XXRPZEUR", "XRP/EUR", "XRP", "EUR", 5, 8, 1e-5, 1.65, 10),
	pair("ADAUSD", "ADAUSD", "ADA/USD", "ADA", "USD", 6, 8, 1e-6, 20, 10),
	pair("ADAEUR", "ADAEUR", "ADA/EUR", "ADA", "EUR", 6, 8, 1e-6, 20, 10),
	pair("XDGUSD", "XDGUSD", "XDG/USD", "XDG", "USD", 7, 8, 1e-7, 50, 10),
	pair("XDGEUR", "XDGEUR", "XDG/EUR", "XDG", "EUR", 7, 8, 1e-7, 50, 10),
	pair("AVAXUSD", "AVAXUSD", "AVAX/USD", "AVAX", "USD", 3, 8, .001, .5, 10),
	pair("AVAXEUR", "AVAXEUR", "AVAX/EUR", "AVAX", "EUR", 3, 8, .001, .5, 10),
	pair("DOTUSD", "DOTUSD", "DOT/USD", "DOT", "USD", 4, 8, 1e-4, 3.9, 5),
	pair("DOTEUR", "DOTEUR", "DOT/EUR", "DOT", "EUR", 4, 8, 1e-4, 3.9, 5),
	pair("LINKUSD", "LINKUSD", "LINK/USD", "LINK", "USD", 5, 8, 1e-5, .55, 10),
	pair("LINKEUR", "LINKEUR", "LINK/EUR", "LINK", "EUR", 5, 8, 1e-5, .55, 10),
	pair("LTCUSD", "XLTCZUSD", "LTC/USD", "LTC", "USD", 2, 8, .01, .1, 10),
	pair("LTCEUR", "XLTCZEUR", "LTC/EUR", "LTC", "EUR", 2, 8, .01, .1, 10),
	pair("BCHUSD", "BCHUSD", "BCH/USD", "BCH", "USD", 2, 8, .01, .01, 5),
	pair("BCHEUR", "BCHEUR", "BCH/EUR", "BCH", "EUR", 2, 8, .01, .01, 5),
	pair("UNIUSD", "UNIUSD", "UNI/USD", "UNI", "USD", 4, 8, 1e-4, 1.5, 5),
	pair("UNIEUR", "UNIEUR", "UNI/EUR", "UNI", "EUR", 4, 8, 1e-4, 1.5, 5),
	pair("ATOMUSD", "ATOMUSD", "ATOM/USD", "ATOM", "USD", 4, 8, 1e-4, 3.5, 5),
	pair("ATOMEUR", "ATOMEUR", "ATOM/EUR", "ATOM", "EUR", 4, 8, 1e-4, 3.5, 5),
	pair("NEARUSD", "NEARUSD", "NEAR/USD", "NEAR", "USD", 4, 8, 1e-4, 4, 5),
	pair("NEAREUR", "NEAREUR", "NEAR/EUR", "NEAR", "EUR", 4, 8, 1e-4, 4, 5),
	pair("APTUSD", "APTUSD", "APT/USD", "APT", "USD", 4, 8, 1e-4, 9, 4),
	pair("APTEUR", "APTEUR", "APT/EUR", "APT", "EUR", 4, 8, 1e-4, 9, 4),
	pair("SUIUSD", "SUIUSD", "SUI/USD", "SUI", "USD", 4, 5, 1e-4, 5, 10),
	pair("SUIEUR", "SUIEUR", "SUI/EUR", "SUI", "EUR", 4, 5, 1e-4, 5, 10),
	pair("AAVEUSD", "AAVEUSD", "AAVE/USD", "AAVE", "USD", 2, 8, .01, .05, 5),
	pair("AAVEEUR", "AAVEEUR", "AAVE/EUR", "AAVE", "EUR", 2, 8, .01, .05, 5),
	pair("FILUSD", "FILUSD", "FIL/USD", "FIL", "USD", 3, 8, .001, 7, 5),
	pair("FILEUR", "FILEUR", "FIL/EUR", "FIL", "EUR", 3, 8, .001, 7, 5),
	pair("TRXUSD", "TRXUSD", "TRX/USD", "TRX", "USD", 6, 8, 1e-6, 16, 5),
	pair("TRXEUR", "TRXEUR", "TRX/EUR", "TRX", "EUR", 6, 8, 1e-6, 16, 5),
	pair("XLMUSD", "XXLMZUSD", "XLM/USD", "XLM", "USD", 6, 8, 1e-6, 30, 5),
	pair("XLMEUR", "XXLMZEUR", "XLM/EUR", "XLM", "EUR", 6, 8, 1e-6, 30, 5),
	pair("XMRUSD", "XXMRZUSD", "XMR/USD", "XMR", "USD", 2, 8, .01, .01, 5),
	pair("XMREUR", "XXMRZEUR", "XMR/EUR", "XMR", "EUR", 2, 8, .01, .01, 5),
	pair("HBARUSD", "HBARUSD", "HBAR/USD", "HBAR", "USD", 5, 5, 1e-5, 55, 5),
	pair("HBAREUR", "HBAREUR", "HBAR/EUR", "HBAR", "EUR", 5, 5, 1e-5, 55, 5),
	pair("TAOUSD", "TAOUSD", "TAO/USD", "TAO", "USD", 4, 5, 1e-4, .02, 5),
	pair("TAOEUR", "TAOEUR", "TAO/EUR", "TAO", "EUR", 4, 5, 1e-4, .02, 5),
	pair("RENDERUSD", "RENDERUSD", "RENDER/USD", "RENDER", "USD", 3, 5, .001, 2.5, 5),
	pair("RENDEREUR", "RENDEREUR", "RENDER/EUR", "RENDER", "EUR", 3, 5, .001, 2.5, 5),
	pair("INJUSD", "INJUSD", "INJ/USD", "INJ", "USD", 3, 8, .001, 1, 5),
	pair("INJEUR", "INJEUR", "INJ/EUR", "INJ", "EUR", 3, 8, .001, 1, 5),
	pair("OPUSD", "OPUSD", "OP/USD", "OP", "USD", 4, 5, 1e-4, 50, 5),
	pair("OPEUR", "OPEUR", "OP/EUR", "OP", "EUR", 4, 5, 1e-4, 50, 5),
	pair("ARBUSD", "ARBUSD", "ARB/USD", "ARB", "USD", 4, 5, 1e-4, 50, 5),
	pair("ARBEUR", "ARBEUR", "ARB/EUR", "ARB", "EUR", 4, 5, 1e-4, 50, 5),
	pair("SEIUSD", "SEIUSD", "SEI/USD", "SEI", "USD", 5, 5, 1e-5, 100, 3),
	pair("SEIEUR", "SEIEUR", "SEI/EUR", "SEI", "EUR", 5, 5, 1e-5, 100, 3),
	pair("ONDOUSD", "ONDOUSD", "ONDO/USD", "ONDO", "USD", 5, 5, 1e-5, 15, 5),
	pair("ONDOEUR", "ONDOEUR", "ONDO/EUR", "ONDO", "EUR", 5, 5, 1e-5, 15, 5),
	pair("FETUSD", "FETUSD", "FET/USD", "FET", "USD", 4, 8, 1e-4, 18, 3),
	pair("FETEUR", "FETEUR", "FET/EUR", "FET", "EUR", 4, 8, 1e-4, 18, 3),
	pair("PEPEUSD", "PEPEUSD", "PEPE/USD", "PEPE", "USD", 9, 5, 1e-9, 15e5, 5),
	pair("PEPEEUR", "PEPEEUR", "PEPE/EUR", "PEPE", "EUR", 9, 5, 1e-9, 15e5, 5),
	pair("SHIBUSD", "SHIBUSD", "SHIB/USD", "SHIB", "USD", 9, 5, 1e-9, 77e4, 5),
	pair("SHIBEUR", "SHIBEUR", "SHIB/EUR", "SHIB", "EUR", 9, 5, 1e-9, 77e4, 5),
	pair("WIFUSD", "WIFUSD", "WIF/USD", "WIF", "USD", 4, 5, 1e-4, 25, 3),
	pair("WIFEUR", "WIFEUR", "WIF/EUR", "WIF", "EUR", 4, 5, 1e-4, 25, 3),
	pair("LDOUSD", "LDOUSD", "LDO/USD", "LDO", "USD", 3, 8, .001, 15, 4),
	pair("LDOEUR", "LDOEUR", "LDO/EUR", "LDO", "EUR", 3, 8, .001, 15, 4)
];
var PAIR_BY_ID = Object.fromEntries(PAIR_UNIVERSE.map((p) => [p.id, p]));
var PAIR_BY_RESULT = Object.fromEntries(PAIR_UNIVERSE.map((p) => [p.resultKey, p]));
var TICKER_QUERY = PAIR_UNIVERSE.map((p) => p.id).join(",");
var DEFAULT_PAIR = "XBTEUR";
var EUR_PAIRS = PAIR_UNIVERSE.filter((p) => p.quote === "EUR");
function toEurPair(id) {
	const meta = PAIR_BY_ID[id];
	if (meta?.quote === "EUR") return id;
	return PAIR_UNIVERSE.find((p) => p.base === (meta?.base ?? "") && p.quote === "EUR")?.id ?? "XBTEUR";
}
var INTERVALS = [
	{
		id: 1,
		label: "1m"
	},
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
	},
	{
		id: 10080,
		label: "1s"
	}
];
var BACKTEST_INTERVALS = [
	1,
	5,
	15,
	30,
	60,
	240,
	1440,
	10080
];
/**
* Finest Kraken interval that can cover `days` within ~720 bars.
* 7 j → 15 m, 30 j → 1 h, 90 j → 4 h. Never finer than `requested`.
*/
function backtestFetchInterval(days, requested = 15) {
	const minutesNeeded = Math.max(1, Math.round(days)) * 1440;
	const covering = BACKTEST_INTERVALS.find((i) => i * 720 >= minutesNeeded) ?? 10080;
	return Math.max(requested, covering);
}
function resolvePairId(raw) {
	if (!raw) return void 0;
	const trimmed = raw.trim();
	if (PAIR_BY_ID[trimmed]) return trimmed;
	if (PAIR_BY_RESULT[trimmed]) return PAIR_BY_RESULT[trimmed].id;
	const compact = trimmed.replace("/", "").toUpperCase().replace(/^XBT/, "XBT");
	if (PAIR_BY_ID[compact]) return compact;
	const swapped = compact.replace(/^XXBT/, "XBT").replace(/ZUSD$/, "USD").replace(/ZEUR$/, "EUR");
	if (PAIR_BY_ID[swapped]) return swapped;
	const ws = PAIR_UNIVERSE.find((p) => p.wsname === trimmed || p.wsname.replace("/", "") === compact);
	if (ws) return ws.id;
	const asXbt = compact.replace(/^BTC/, "XBT");
	if (PAIR_BY_ID[asXbt]) return asXbt;
	const asBtc = compact.replace(/^XBT/, "XBT");
	if (PAIR_BY_ID[asBtc]) return asBtc;
	return PAIR_UNIVERSE.find((p) => p.display.replace("/", "") === compact.replace("XBT", "BTC"))?.id;
}
function intervalLabel(id) {
	return INTERVALS.find((i) => i.id === id)?.label ?? `${id}m`;
}
function pairForAssets(from, to) {
	const a = from === "BTC" ? "BTC" : from;
	const b = to === "BTC" ? "BTC" : to;
	const direct = PAIR_UNIVERSE.find((p) => p.base === a && p.quote === b);
	if (direct) return {
		pair: direct.id,
		side: "sell"
	};
	const inv = PAIR_UNIVERSE.find((p) => p.base === b && p.quote === a);
	if (inv) return {
		pair: inv.id,
		side: "buy"
	};
	return null;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/bots-ZtuEd8dj.js
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
function mfi(candles, period = 14) {
	const out = [];
	const pos = [];
	const neg = [];
	let prevTp = null;
	for (let i = 0; i < candles.length; i++) {
		const c = candles[i];
		const tp = (c.high + c.low + c.close) / 3;
		const flow = tp * c.volume;
		if (prevTp == null) {
			pos.push(0);
			neg.push(0);
		} else if (tp >= prevTp) {
			pos.push(flow);
			neg.push(0);
		} else {
			pos.push(0);
			neg.push(flow);
		}
		prevTp = tp;
		if (i < period) {
			out.push(null);
			continue;
		}
		let p = 0;
		let n = 0;
		for (let j = i - period + 1; j <= i; j++) {
			p += pos[j] ?? 0;
			n += neg[j] ?? 0;
		}
		if (n <= 0) out.push(100);
		else out.push(100 - 100 / (1 + p / n));
	}
	return out;
}
function obv(candles) {
	const out = [];
	let acc = 0;
	for (let i = 0; i < candles.length; i++) {
		if (i === 0) {
			out.push(0);
			continue;
		}
		const prev = candles[i - 1].close;
		const cur = candles[i].close;
		if (cur > prev) acc += candles[i].volume;
		else if (cur < prev) acc -= candles[i].volume;
		out.push(acc);
	}
	return out;
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
/** Accepts 1.5, 1,5, 1 234,56 and 1.234,56. */
function parseDecimal(raw) {
	let t = raw.trim().replace(/[\s\u202f\u00a0]/g, "");
	if (!t) return null;
	const comma = t.lastIndexOf(",");
	const dot = t.lastIndexOf(".");
	if (comma >= 0 && dot >= 0) t = comma > dot ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
	else if (comma >= 0) t = t.replace(",", ".");
	if (!/^[+-]?\d+(\.\d+)?$/.test(t)) return null;
	const n = Number(t);
	return Number.isFinite(n) ? n : null;
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
var BOT_KINDS = [
	{
		id: "grid",
		title: "Grille",
		blurb: "Lots mémorisés : revente à +X % du prix d’achat, nouvel achat plus bas, rachat au prix d’origine après une vente.",
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
	},
	{
		id: "mfi",
		title: "Money Flow",
		blurb: "RSI pondéré par le volume : entre en sous-flux, sort en sur-flux.",
		needsCandles: true
	},
	{
		id: "engulf",
		title: "Engulfing",
		blurb: "Entre sur une bougie d’engloutissement haussière, sort à la baissière.",
		needsCandles: true
	},
	{
		id: "obv",
		title: "OBV",
		blurb: "Suit le flux de volume : entre quand l’OBV croise au-dessus de son EMA.",
		needsCandles: true
	},
	{
		id: "div",
		title: "Divergence RSI",
		blurb: "Achète une divergence haussière prix / RSI, sort en surachat.",
		needsCandles: true
	},
	{
		id: "confirm",
		title: "Confirmation",
		blurb: "N’entre que si EMA, MACD et RSI sont d’accord — moins de faux signaux.",
		needsCandles: true
	}
];
var BOT_KIND_BY_ID = Object.fromEntries(BOT_KINDS.map((k) => [k.id, k]));
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
	closes: 0,
	feesPaid: 0,
	realizedPnl: 0,
	volume: 0
};
/** Drop the current Kraken OHLC frame if it has not closed yet. */
function dropFormingCandle(candles, intervalMin, nowMs) {
	if (!candles?.length || !(intervalMin > 0) || !(nowMs > 0)) return candles;
	const closeAt = candles[candles.length - 1].time + intervalMin * 60;
	if (nowMs / 1e3 + .5 < closeAt) return candles.slice(0, -1);
	return candles;
}
function botInventoryQty(runtime) {
	const pos = runtime.positionQty ?? 0;
	if (pos > 0) return pos;
	return (runtime.gridOwned ?? []).reduce((s, g) => s + (g.qty > 0 ? g.qty : 0), 0);
}
function botMark(runtime, last) {
	const qty = botInventoryQty(runtime);
	const avg = runtime.positionAvg ?? 0;
	return {
		qty,
		avg,
		exposure: qty > 0 && last > 0 ? qty * last : 0,
		unrealized: qty > 0 && avg > 0 && last > 0 ? (last - avg) * qty : 0
	};
}
/** Cash actually tied up in open lots (entry × qty), not marked value. */
function botDeployed(runtime) {
	const lots = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
	if (lots.length) return lots.reduce((s, g) => s + g.qty * g.entry, 0);
	const qty = runtime.positionQty ?? 0;
	const avg = runtime.positionAvg ?? 0;
	return qty > 0 && avg > 0 ? qty * avg : 0;
}
/** Remaining EUR this bot may still spend. `undefined` = unlimited. */
function remainingQuoteBudget(params, runtime, available) {
	const cap = params.budgetQuote ?? 0;
	const leftover = cap > 0 ? Math.max(0, cap - botDeployed(runtime)) : void 0;
	if (available == null && leftover == null) return void 0;
	if (available == null) return leftover;
	if (leftover == null) return Math.max(0, available);
	return Math.max(0, Math.min(available, leftover));
}
function gridChartLevels(bot, feeRate) {
	const pad = gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
	const sellPct = (bot.params.gridSellPct ?? 1.5) + pad;
	const out = [];
	const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
	const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
	if (lo > 0) out.push({
		price: lo,
		kind: "band",
		title: "Plancher"
	});
	if (hi > 0) out.push({
		price: hi,
		kind: "band",
		title: "Plafond"
	});
	for (const g of bot.runtime.gridOwned ?? []) if (g.pending && g.price > 0) out.push({
		price: g.price,
		kind: "buy",
		title: "Achat"
	});
	else if (g.qty > 0 && g.entry > 0) {
		out.push({
			price: g.entry,
			kind: "entry",
			title: "Lot"
		});
		out.push({
			price: g.entry * (1 + sellPct / 100),
			kind: "sell",
			title: "Vente"
		});
	}
	return out.slice(0, 16);
}
function evaluateDesk(input) {
	const peak = Math.max(input.peak, input.equity, 0);
	const drawdownPct = peak > 0 ? Math.max(0, (peak - input.equity) / peak * 100) : 0;
	const daily = input.limits.deskDailyLoss ?? 0;
	const dd = input.limits.deskDrawdownPct ?? 0;
	const exp = input.limits.deskMaxExposurePct ?? 0;
	let halt = null;
	let note = null;
	if (daily > 0 && input.dayPnl <= -daily) {
		halt = "daily";
		note = `Stop bureau · perte jour ${daily} EUR`;
	} else if (dd > 0 && drawdownPct >= dd) {
		halt = "drawdown";
		note = `Stop bureau · drawdown ${dd} %`;
	}
	const overExp = exp > 0 && input.equity > 0 && input.exposure / input.equity * 100 >= exp;
	const blockBuys = halt != null || overExp;
	if (!note && overExp) note = `Exposition max ${exp} %`;
	return {
		equity: input.equity,
		peak,
		dayPnl: input.dayPnl,
		exposure: input.exposure,
		drawdownPct,
		halt,
		blockBuys,
		note
	};
}
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
	return {
		...baseParams(kind, last),
		...profitDefaults(kind)
	};
}
var MEAN_REVERSION = /* @__PURE__ */ new Set([
	"rsi",
	"bollinger",
	"stoch",
	"vwap",
	"cci",
	"meanrev",
	"keltner",
	"williams",
	"mfi",
	"div"
]);
var RANGE_BREAK = /* @__PURE__ */ new Set([
	"breakout",
	"volume",
	"engulf"
]);
/** Defaults that cut the two usual ways these bots lose money: knife-catches and fee churn. */
function profitDefaults(kind) {
	if (kind === "grid" || kind === "dca") return {};
	if (RANGE_BREAK.has(kind)) return {
		slPct: 2.5,
		slAtr: 0,
		beAfterPct: 1.2,
		adxCeil: 0,
		adxFloor: 0
	};
	if (MEAN_REVERSION.has(kind)) return {
		adxCeil: 32,
		adxFloor: 0,
		slPct: 3.5,
		slAtr: 0,
		beAfterPct: 1.2,
		crashPct: 2.5
	};
	return {
		adxFloor: 18,
		adxCeil: 0,
		slPct: 0,
		slAtr: 2,
		beAfterPct: 1.2
	};
}
/** Risk chips must not arm the overlay stop on a grid — that flattens every lot. */
function riskPresetFor(kind, preset) {
	if (kind !== "grid") return preset.params;
	const { slPct, tpPct, trailingPct, slAtr, partialTp, maxHoldMin, trendEma, ...rest } = preset.params;
	return {
		...rest,
		slPct: 0,
		tpPct: 0,
		trailingPct: 0,
		slAtr: 0,
		partialTp: 0,
		maxHoldMin: 0,
		trendEma: 0,
		gridSlPct: slPct && slPct > 0 ? slPct : 0
	};
}
function tradingDay(ms) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Paris",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(ms);
}
function baseParams(kind, last) {
	if (kind === "grid") return {
		lower: roundSmart(last * .96),
		upper: roundSmart(last * 1.04),
		levels: 8,
		gridSellPct: 1.5,
		gridBuyPct: 1,
		gridSlPct: 0,
		gridFollow: false,
		compoundPct: 0,
		gridNetFees: true,
		gridSeed: false,
		budgetQuote: 0
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
	if (kind === "mfi") return {
		rsiPeriod: 14,
		oversold: 20,
		overbought: 80
	};
	if (kind === "engulf") return {};
	if (kind === "obv") return { fast: 20 };
	if (kind === "div") return {
		rsiPeriod: 14,
		oversold: 40,
		overbought: 70
	};
	if (kind === "confirm") return {
		fast: 9,
		slow: 21,
		rsiPeriod: 14,
		oversold: 35,
		overbought: 70,
		macdFast: 12,
		macdSlow: 26,
		macdSignal: 9
	};
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
	const candles = ctx.closedOnly ? dropFormingCandle(ctx.candles, bot.interval, ctx.now) : ctx.candles;
	const next = {
		...ctx,
		candles,
		quoteBudget: remainingQuoteBudget(bot.params, bot.runtime, ctx.quoteBudget)
	};
	return applyRisk(bot, next, evaluateRaw(bot, next));
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
		case "mfi": return evalMfi(bot, ctx);
		case "engulf": return evalEngulf(bot, ctx);
		case "obv": return evalObv(bot, ctx);
		case "div": return evalDiv(bot, ctx);
		case "confirm": return evalConfirm(bot, ctx);
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
	const risk = bot.params.atrRiskPct;
	if (risk && risk > 0 && ctx.equity && ctx.equity > 0 && ctx.candles && ctx.candles.length > 16) {
		const series = atr(ctx.candles, 14);
		const av = series[series.length - 1];
		const last = ctx.ticker.last;
		if (av != null && av > 0 && last > 0) return Math.max(0, ctx.equity * (risk / 100) / av * last);
	}
	const pct = bot.params.sizePct;
	if (pct && pct > 0 && ctx.equity && ctx.equity > 0) return Math.max(0, ctx.equity * (pct / 100));
	return bot.sizeQuote;
}
function orderQty(bot, ctx, price) {
	return qtyFromQuote(sizeQuoteOf(bot, ctx), price);
}
var GRID_PRESETS = [
	{
		id: "tight",
		label: "Serrée",
		sell: .8,
		buy: .5,
		levels: 10,
		band: .04
	},
	{
		id: "std",
		label: "Standard",
		sell: 1.5,
		buy: 1,
		levels: 8,
		band: .08
	},
	{
		id: "wide",
		label: "Large",
		sell: 3,
		buy: 2,
		levels: 6,
		band: .14
	}
];
/** Extra sell % so a advertised take-profit is net of a round-trip taker fee. */
function gridFeePadPct(feeRate, net = true) {
	if (!net || !(feeRate && feeRate > 0)) return 0;
	return feeRate * 2 * 100;
}
function applyGridPreset(last, preset, extra = {}) {
	const half = preset.band / 2;
	return {
		...defaultParams("grid", last),
		gridSellPct: preset.sell,
		gridBuyPct: preset.buy,
		levels: preset.levels,
		lower: roundSmart(last * (1 - half)),
		upper: roundSmart(last * (1 + half)),
		...extra
	};
}
function nearPx(a, b) {
	if (!(a > 0) || !(b > 0)) return false;
	return Math.abs(a - b) / Math.max(a, b) < 5e-4;
}
function evalGrid(bot, ctx) {
	const pad = gridFeePadPct(ctx.feeRate, bot.params.gridNetFees !== false);
	const sellPct = (bot.params.gridSellPct ?? 1.5) + pad;
	const buyPct = bot.params.gridBuyPct ?? 1;
	const lotSl = bot.params.gridSlPct ?? 0;
	const maxLots = Math.max(1, Math.min(24, Math.round(bot.params.levels ?? 8)));
	const paramLo = bot.params.lower ?? 0;
	const paramHi = bot.params.upper ?? 0;
	const runtime = { ...bot.runtime };
	if (!(sellPct > 0) || !(buyPct > 0)) return {
		fills: [],
		runtime,
		note: "Pourcentages de grille invalides."
	};
	if (paramLo > 0 && paramHi > 0 && !(paramHi > paramLo)) return {
		fills: [],
		runtime,
		note: "Fourchette de grille invalide."
	};
	let bandLo = runtime.gridLower ?? paramLo;
	let bandHi = runtime.gridUpper ?? paramHi;
	const last = ctx.ticker.last;
	const prev = runtime.lastPrice;
	const fills = [];
	const pathLow = ctx.barLow ?? (prev != null && prev > 0 ? Math.min(prev, last) : last);
	const pathHigh = ctx.barHigh ?? (prev != null && prev > 0 ? Math.max(prev, last) : last);
	const fee = ctx.feeRate ?? 0;
	const fillCap = Math.max(1, Math.min(32, ctx.maxFills ?? 32));
	let quoteLeft = ctx.quoteBudget;
	let baseLeft = ctx.baseBudget;
	const buyPause = Boolean(runtime.buyPause);
	if ((runtime.buyCoolUntil ?? 0) > 0 && ctx.now >= runtime.buyCoolUntil) runtime.buyCoolUntil = void 0;
	let cooling = (runtime.buyCoolUntil ?? 0) > ctx.now;
	const wantSeed = Boolean(runtime.gridSeedNow) || Boolean(bot.params.gridSeed && (prev == null || !(prev > 0)));
	const quoteSize = sizeQuoteOf(bot, ctx);
	const qtyAt = (price) => qtyFromQuote(quoteSize, price);
	let lots = (runtime.gridOwned ?? []).map((g) => ({ ...g }));
	let recentered = false;
	const skipSell = /* @__PURE__ */ new Set();
	const skipBuy = /* @__PURE__ */ new Set();
	const inBand = (p) => {
		if (bandLo > 0 && p < bandLo * .999) return false;
		if (bandHi > 0 && p > bandHi * 1.001) return false;
		return true;
	};
	const addPending = (raw, kind) => {
		const p = roundSmart(raw);
		if (!(p > 0) || kind !== "rebuy" && !inBand(p)) return -1;
		const near = lots.findIndex((g) => g.pending && nearPx(g.price, p));
		if (near >= 0) {
			if (kind !== "rebuy") return -1;
			lots[near] = {
				...lots[near],
				price: p,
				anchor: true
			};
			return near;
		}
		if (lots.some((g) => g.qty > 0 && (nearPx(g.entry, p) || nearPx(g.price, p)))) return -1;
		const held = lots.filter((g) => g.qty > 0).length;
		const pendingN = lots.filter((g) => g.pending).length;
		if (kind === "step" && held >= maxLots) return -1;
		if (held + pendingN >= Math.max(maxLots * 2, maxLots + 1)) return -1;
		lots.push({
			price: p,
			qty: 0,
			entry: 0,
			pending: true,
			anchor: kind === "rebuy" ? true : void 0
		});
		return lots.length - 1;
	};
	const armBait = () => {
		const bait = last * (1 - buyPct / 100);
		const floored = bandLo > 0 ? Math.max(bait, bandLo) : bait;
		addPending(bandHi > 0 ? Math.min(floored, bandHi) : floored, "step");
	};
	const canBuy = (qty, price) => {
		if (fills.length >= fillCap) return false;
		if (buyPause || cooling) return false;
		if (quoteLeft == null) return true;
		return qty * price * (1 + fee) <= quoteLeft + 1e-9;
	};
	const canSell = (qty) => {
		if (fills.length >= fillCap) return false;
		if (baseLeft == null) return true;
		return qty <= baseLeft + 1e-12;
	};
	const spendBuy = (qty, price) => {
		if (quoteLeft != null) quoteLeft -= qty * price * (1 + fee);
		if (baseLeft != null) baseLeft += qty;
	};
	const spendSell = (qty) => {
		if (baseLeft != null) baseLeft -= qty;
	};
	const seedLot = () => {
		if (buyPause || lots.some((g) => g.qty > 0)) return false;
		if (!(last > 0) || !inBand(last)) return false;
		const fillPx = px(ctx, "buy");
		const qty = qtyAt(fillPx);
		if (!(qty > 0) || !canBuy(qty, fillPx)) return false;
		fills.push({
			side: "buy",
			qty,
			price: fillPx,
			note: `Grille lot initial @ ${roundSmart(fillPx)}`
		});
		spendBuy(qty, fillPx);
		lots.push({
			price: fillPx,
			qty,
			entry: fillPx,
			pending: false
		});
		skipSell.add(lots.length - 1);
		addPending(fillPx * (1 - buyPct / 100), "step");
		return true;
	};
	const trySeed = () => {
		if (!wantSeed) {
			runtime.gridSeedNow = false;
			return false;
		}
		const ok = seedLot();
		runtime.gridSeedNow = !ok;
		return ok;
	};
	if (bot.params.gridFollow && bandLo > 0 && bandHi > bandLo && last > 0) {
		if (lots.filter((g) => g.qty > 0).length === 0 && (last > bandHi || last < bandLo)) {
			const width = bandHi - bandLo;
			bandLo = roundSmart(Math.max(last - width / 2, last * .5));
			bandHi = roundSmart(last + width / 2);
			runtime.gridLower = bandLo;
			runtime.gridUpper = bandHi;
			lots = lots.filter((g) => g.qty > 0 || g.pending && (g.anchor || inBand(g.price)));
			recentered = true;
		}
	}
	const hadBook = lots.some((g) => g.qty > 0 || g.pending);
	const cold = prev == null || !(prev > 0);
	if (cold) {
		trySeed();
		if (!lots.some((g) => g.qty > 0 || g.pending) && !buyPause && !cooling) armBait();
		if (!lots.some((g) => g.pending)) {
			runtime.lastPrice = last;
			runtime.gridOwned = lots.filter((g) => g.qty > 0 || g.pending);
			return {
				fills,
				runtime,
				note: fills.length ? fills.map((f) => f.note).join(" · ") : recentered ? "Fourchette recentrée — grille armée." : "Grille armée — en attente d’un croisement."
			};
		}
	} else trySeed();
	let guard = 0;
	let progressed = true;
	while (progressed && guard++ < 32 && fills.length < fillCap) {
		progressed = false;
		if (lotSl > 0) for (let i = 0; i < lots.length; i++) {
			if (fills.length >= fillCap) break;
			const g = lots[i];
			if (skipSell.has(i) || !(g.qty > 0) || !(g.entry > 0)) continue;
			const stopAt = g.entry * (1 - lotSl / 100);
			if (!(pathLow <= stopAt)) continue;
			if (!canSell(g.qty)) continue;
			const fillPx = ctx.barLow != null ? stopAt : px(ctx, "sell");
			fills.push({
				side: "sell",
				qty: g.qty,
				price: fillPx,
				note: `Stop lot −${lotSl}% (achat ${roundSmart(g.entry)})`,
				entry: g.entry
			});
			spendSell(g.qty);
			lots[i] = {
				price: g.price,
				qty: 0,
				entry: 0,
				pending: false
			};
			skipSell.add(i);
			progressed = true;
			const coolMin = bot.params.gridSlCooldownMin ?? 0;
			if (coolMin > 0) {
				runtime.buyCoolUntil = Math.max(runtime.buyCoolUntil ?? 0, ctx.now + coolMin * 6e4);
				cooling = true;
			}
		}
		for (let i = 0; i < lots.length; i++) {
			if (fills.length >= fillCap) break;
			const g = lots[i];
			if (skipSell.has(i) || !(g.qty > 0) || !(g.entry > 0)) continue;
			const sellAt = g.entry * (1 + sellPct / 100);
			if (!(pathHigh >= sellAt)) continue;
			if (!canSell(g.qty)) continue;
			const fillPx = ctx.barHigh != null ? sellAt : px(ctx, "sell");
			fills.push({
				side: "sell",
				qty: g.qty,
				price: fillPx,
				note: `Grille vente +${Number(sellPct.toFixed(2))}% (achat ${roundSmart(g.entry)})`,
				entry: g.entry
			});
			spendSell(g.qty);
			const rebuy = g.entry;
			lots[i] = {
				price: g.price,
				qty: 0,
				entry: 0,
				pending: false
			};
			skipSell.add(i);
			progressed = true;
			const idx = addPending(rebuy, "rebuy");
			if (idx >= 0) skipBuy.add(idx);
		}
		if (buyPause || cooling) continue;
		const pendingIdx = lots.map((g, i) => ({
			g,
			i
		})).filter(({ g, i }) => g.pending && !(g.qty > 0) && !skipBuy.has(i)).sort((a, b) => b.g.price - a.g.price);
		for (const { i } of pendingIdx) {
			if (fills.length >= fillCap) break;
			const g = lots[i];
			if (!g?.pending || skipBuy.has(i)) continue;
			const trigger = g.price;
			if (!(pathLow <= trigger)) continue;
			const fillPx = ctx.barLow != null ? trigger : px(ctx, "buy");
			const qty = qtyAt(fillPx);
			if (!(qty > 0) || !canBuy(qty, fillPx)) continue;
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Grille achat @ ${roundSmart(trigger)}`
			});
			spendBuy(qty, fillPx);
			lots[i] = {
				price: trigger,
				qty,
				entry: fillPx,
				pending: false
			};
			skipSell.add(i);
			progressed = true;
			addPending(fillPx * (1 - buyPct / 100), "step");
		}
	}
	let cleaned = lots.filter((g) => g.qty > 0 || g.pending);
	if (cleaned.length === 0 && !buyPause && !cooling) {
		lots.length = 0;
		armBait();
		cleaned = lots.filter((g) => g.qty > 0 || g.pending);
	}
	runtime.lastPrice = last;
	runtime.gridOwned = cleaned;
	runtime.gridLower = bandLo || void 0;
	runtime.gridUpper = bandHi || void 0;
	const held = cleaned.filter((g) => g.qty > 0);
	const pending = cleaned.filter((g) => g.pending);
	const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
	const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
	const wait = (buyPause ? "Achats en pause · " : "") + (cooling ? "Pause achats après stop lot · " : "") + (recentered ? "Fourchette recentrée · " : "") + `En attente · ${held.length} lot${held.length > 1 ? "s" : ""} · ${pending.length} ordre${pending.length > 1 ? "s" : ""} d’achat` + (nextBuy ? ` · achat ${roundSmart(nextBuy)}` : "") + (nextSell ? ` · vente ${roundSmart(nextSell)}` : "");
	return {
		fills,
		runtime,
		note: fills.length ? fills.map((f) => f.note).join(" · ") : cold && !hadBook ? recentered ? "Fourchette recentrée — grille armée." : "Grille armée — en attente d’un croisement." : wait
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
function evalMfi(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.rsiPeriod ?? 14);
	const os = bot.params.oversold ?? 20;
	const ob = bot.params.overbought ?? 80;
	if (!candles || candles.length < period + 4) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour le MFI."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `MFI ${fmt(runtime.lastRsi)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const series = mfi(candles, period);
	const r = series[series.length - 1];
	const prev = series[series.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastRsi = r ?? void 0;
	if (r == null || prev == null) return {
		fills: [],
		runtime,
		note: "MFI en chauffe."
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
				note: `MFI ${r.toFixed(1)} < ${os}`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && prev <= ob && r > ob) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `MFI ${r.toFixed(1)} > ${ob}`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `MFI ${r.toFixed(1)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalEngulf(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	if (!candles || candles.length < 6) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour l’engloutissement."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long engulf" : "En attente d’un engulf"
	};
	const cur = lastCandle;
	const prev = candles[candles.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	const prevBear = prev.close < prev.open;
	const prevBull = prev.close > prev.open;
	const bullEngulf = prevBear && cur.close > cur.open && cur.close >= prev.open && cur.open <= prev.close;
	const bearEngulf = prevBull && cur.close < cur.open && cur.close <= prev.open && cur.open >= prev.close;
	const fills = [];
	if (!runtime.inPosition && bullEngulf) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "Engloutissement haussier"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && bearEngulf) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "Engloutissement baissier"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `PA ${bullEngulf ? "bull" : bearEngulf ? "bear" : "neutre"} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalObv(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.fast ?? 20);
	if (!candles || candles.length < period + 6) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour l’OBV."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `OBV · ${runtime.inPosition ? "long" : "flat"}`
	};
	const series = obv(candles);
	const mean = ema(series, period);
	const o = series[series.length - 1];
	const e = mean[mean.length - 1];
	const po = series[series.length - 2];
	const pe = mean[mean.length - 2];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastEmaFast = e ?? void 0;
	if (e == null || pe == null) return {
		fills: [],
		runtime,
		note: "OBV en chauffe."
	};
	const fills = [];
	const crossUp = po <= pe && o > e;
	const crossDown = po >= pe && o < e;
	if (!runtime.inPosition && crossUp) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: "OBV croise au-dessus de l’EMA"
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && crossDown) {
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: "OBV croise sous l’EMA"
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `OBV ${o >= e ? "haussier" : "baissier"} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalDiv(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const period = Math.max(5, bot.params.rsiPeriod ?? 14);
	const look = 12;
	const os = bot.params.oversold ?? 40;
	const ob = bot.params.overbought ?? 70;
	if (!candles || candles.length < period + look + 4) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour la divergence RSI."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: `Div RSI ${fmt(runtime.lastRsi)} · ${runtime.inPosition ? "long" : "flat"}`
	};
	const closes = candles.map((c) => c.close);
	const series = rsi(closes, period);
	const i = closes.length - 1;
	const r = series[i];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastRsi = r ?? void 0;
	runtime.lastClose = lastCandle.close;
	if (r == null) return {
		fills: [],
		runtime,
		note: "RSI en chauffe."
	};
	const windowCloses = closes.slice(i - look, i);
	const windowRsi = series.slice(i - look, i).filter((v) => v != null);
	const fills = [];
	if (windowCloses.length >= look && windowRsi.length >= 4) {
		const minP = Math.min(...windowCloses);
		const minR = Math.min(...windowRsi);
		const bullDiv = lastCandle.close <= minP && r > minR && r < os + 10;
		if (!runtime.inPosition && bullDiv) {
			const fillPx = px(ctx, "buy");
			const qty = orderQty(bot, ctx, fillPx);
			if (qty > 0) {
				fills.push({
					side: "buy",
					qty,
					price: fillPx,
					note: `Divergence haussière RSI ${r.toFixed(0)}`
				});
				markLong(runtime, qty, fillPx);
			}
		} else if (runtime.inPosition && runtime.positionQty && r > ob) {
			const fillPx = px(ctx, "sell");
			fills.push({
				side: "sell",
				qty: runtime.positionQty,
				price: fillPx,
				note: `RSI ${r.toFixed(0)} > ${ob}`
			});
			markFlat(runtime);
		}
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `RSI ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
	};
}
function evalConfirm(bot, ctx) {
	const runtime = { ...bot.runtime };
	const candles = ctx.candles;
	const fastN = Math.max(2, bot.params.fast ?? 9);
	const slowN = Math.max(fastN + 1, bot.params.slow ?? 21);
	const rsiN = Math.max(2, bot.params.rsiPeriod ?? 14);
	const os = bot.params.oversold ?? 35;
	const ob = bot.params.overbought ?? 70;
	const macdFast = bot.params.macdFast ?? 12;
	const macdSlow = bot.params.macdSlow ?? 26;
	const macdSig = bot.params.macdSignal ?? 9;
	const need = Math.max(slowN, rsiN, macdSlow + macdSig) + 4;
	if (!candles || candles.length < need) return {
		fills: [],
		runtime,
		note: "Chandeliers insuffisants pour la confirmation."
	};
	const lastCandle = candles[candles.length - 1];
	if (runtime.lastCandleTime === lastCandle.time) return {
		fills: [],
		runtime,
		note: runtime.inPosition ? "Long · confirmation" : "Hors marché · en attente des 3 filtres"
	};
	const closes = candles.map((c) => c.close);
	const fast = ema(closes, fastN);
	const slow = ema(closes, slowN);
	const rSeries = rsi(closes, rsiN);
	const m = macd(closes, macdFast, macdSlow, macdSig);
	const i = closes.length - 1;
	const f = fast[i];
	const s = slow[i];
	const r = rSeries[i];
	const pr = rSeries[i - 1];
	const h = m.hist[i];
	const ph = m.hist[i - 1];
	const pf = fast[i - 1];
	const ps = slow[i - 1];
	runtime.lastCandleTime = lastCandle.time;
	runtime.lastEmaFast = f ?? void 0;
	runtime.lastEmaSlow = s ?? void 0;
	runtime.lastRsi = r ?? void 0;
	runtime.lastMacdHist = h ?? void 0;
	if (f == null || s == null || r == null || pr == null || h == null || ph == null) return {
		fills: [],
		runtime,
		note: "Confirmation en chauffe."
	};
	const trendUp = f > s;
	const macdUp = h > 0;
	const rsiRecover = pr < os && r >= os;
	const rsiDrop = pr <= ob && r > ob;
	const macdDown = ph >= 0 && h < 0;
	const deathCross = pf != null && ps != null && pf >= ps && f < s;
	const fills = [];
	if (!runtime.inPosition && trendUp && macdUp && rsiRecover) {
		const fillPx = px(ctx, "buy");
		const qty = orderQty(bot, ctx, fillPx);
		if (qty > 0) {
			fills.push({
				side: "buy",
				qty,
				price: fillPx,
				note: `Confirmé · RSI ${r.toFixed(0)} + MACD + EMA`
			});
			markLong(runtime, qty, fillPx);
		}
	} else if (runtime.inPosition && runtime.positionQty && (rsiDrop || macdDown || deathCross)) {
		const why = deathCross ? "EMA croise à la baisse" : macdDown ? "MACD négatif" : `RSI ${r.toFixed(0)} > ${ob}`;
		const fillPx = px(ctx, "sell");
		fills.push({
			side: "sell",
			qty: runtime.positionQty,
			price: fillPx,
			note: `Sortie · ${why}`
		});
		markFlat(runtime);
	}
	return {
		fills,
		runtime,
		note: fills.length ? fills[0].note : `EMA ${trendUp ? "haussier" : "baissier"} · MACD ${macdUp ? "pos" : "neg"} · RSI ${r.toFixed(0)} · ${runtime.inPosition ? "long" : "flat"}`
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
function syncGridPosition(runtime, fills) {
	const held = (runtime.gridOwned ?? []).filter((g) => g.qty > 0);
	if (held.length) {
		const qty = held.reduce((s, g) => s + g.qty, 0);
		const avg = qty > 0 ? held.reduce((s, g) => s + g.qty * g.entry, 0) / qty : 0;
		runtime.inPosition = true;
		runtime.positionQty = qty;
		runtime.positionAvg = avg;
	} else if (!fills.some((f) => f.side === "buy")) {
		runtime.inPosition = false;
		runtime.positionQty = 0;
		runtime.positionAvg = 0;
	}
}
function regimeNote(bot, ctx) {
	if (bot.kind === "grid" || bot.kind === "dca") return null;
	const ceil = bot.params.adxCeil ?? 0;
	const floor = bot.params.adxFloor ?? 0;
	if (!(ceil > 0) && !(floor > 0)) return null;
	const candles = ctx.candles;
	const period = Math.max(5, Math.round(bot.params.adxPeriod ?? 14));
	if (!candles || candles.length < period * 2 + 2) return null;
	const v = adx(candles, period).adx[candles.length - 1];
	if (v == null || !Number.isFinite(v)) return null;
	if (ceil > 0 && v > ceil) return `ADX ${v.toFixed(0)} — pas d’achat en tendance forte`;
	if (floor > 0 && v < floor) return `ADX ${v.toFixed(0)} — range, pas de suivi`;
	return null;
}
function crashNote(bot, ctx) {
	if (!MEAN_REVERSION.has(bot.kind)) return null;
	const crash = bot.params.crashPct ?? 0;
	if (!(crash > 0)) return null;
	const candles = ctx.candles;
	if (!candles || candles.length < 2) return null;
	const last = candles[candles.length - 1];
	const prev = candles[candles.length - 2].close;
	if (!(prev > 0)) return null;
	const drop = (prev - last.close) / prev * 100;
	if (drop >= crash) return `Bougie −${drop.toFixed(1)} % — pas d’achat dans le krach`;
	return null;
}
function buyBlockReason(bot, ctx, runtime) {
	const last = ctx.ticker.last;
	const now = ctx.now;
	const trendN = bot.params.trendEma ?? 0;
	if (trendN > 0 && ctx.candles && ctx.candles.length >= trendN + 2) {
		const series = ema(ctx.candles.map((c) => c.close), Math.round(trendN));
		const e = series[series.length - 1];
		if (e != null && last < e) return `Filtre EMA${Math.round(trendN)} baissier`;
	}
	const regime = regimeNote(bot, ctx) ?? crashNote(bot, ctx);
	if (regime) return regime;
	const spreadPct = ctx.ticker.ask > 0 && ctx.ticker.bid > 0 && last > 0 ? (ctx.ticker.ask - ctx.ticker.bid) / last * 100 : 0;
	const maxSpread = bot.params.maxSpreadPct ?? 0;
	if (maxSpread > 0 && spreadPct > maxSpread) return `Spread ${spreadPct.toFixed(2)} % trop large`;
	const cooldownMs = (bot.params.cooldownSec ?? 0) * 1e3;
	if (cooldownMs > 0 && bot.lastActionAt && now - bot.lastActionAt < cooldownMs) return `Cooldown ${Math.ceil((cooldownMs - (now - bot.lastActionAt)) / 1e3)}s`;
	const sessionStart = bot.params.sessionStart;
	const sessionEnd = bot.params.sessionEnd;
	if (sessionStart != null && sessionEnd != null && (sessionStart !== 0 || sessionEnd !== 0) && sessionStart !== sessionEnd && !inUtcSession(now, sessionStart, sessionEnd)) return `Hors session ${sessionStart}h–${sessionEnd}h UTC`;
	const cap = bot.params.maxDailyLoss ?? 0;
	if (cap > 0 && (runtime.dayPnl ?? 0) <= -cap) return `Stop journalier (${cap} EUR)`;
	const maxTrades = bot.params.maxTradesDay ?? 0;
	if (maxTrades > 0 && (runtime.dayTrades ?? 0) >= maxTrades) return `Quota ${maxTrades} trades / jour`;
	const maxLosses = bot.params.maxConsecutiveLoss ?? 0;
	if (maxLosses > 0 && (runtime.consecutiveLosses ?? 0) >= maxLosses) return `Pertes consécutives (${maxLosses})`;
	return null;
}
function applyRisk(bot, ctx, raw) {
	const prev = bot.runtime;
	let runtime = { ...raw.runtime };
	let fills = [...raw.fills];
	let note = raw.note;
	const now = ctx.now;
	const last = ctx.ticker.last;
	const low = ctx.barLow ?? last;
	const high = ctx.barHigh ?? last;
	const day = tradingDay(now);
	if (runtime.dayStamp !== day) {
		runtime.dayStamp = day;
		runtime.dayPnl = 0;
		runtime.dayTrades = 0;
	}
	if (bot.kind === "grid") syncGridPosition(runtime, fills);
	const blockBuys = buyBlockReason(bot, ctx, runtime);
	let gridReplayed = false;
	if (blockBuys && fills.some((f) => f.side === "buy") && bot.kind === "grid") {
		const replay = evaluateRaw({
			...bot,
			runtime: {
				...bot.runtime,
				buyPause: true
			}
		}, ctx);
		fills = [...replay.fills];
		runtime = {
			...replay.runtime,
			buyPause: bot.runtime.buyPause
		};
		syncGridPosition(runtime, fills);
		gridReplayed = true;
		note = fills.length ? replay.note : blockBuys;
	}
	const hadBuy = !gridReplayed && fills.some((f) => f.side === "buy");
	const trendN = bot.params.trendEma ?? 0;
	if (trendN > 0 && ctx.candles && ctx.candles.length >= trendN + 2) {
		const series = ema(ctx.candles.map((c) => c.close), Math.round(trendN));
		const e = series[series.length - 1];
		if (e != null && last < e) {
			fills = fills.filter((f) => f.side === "sell");
			if (fills.length === 0) note = `Filtre EMA${Math.round(trendN)} baissier`;
		}
	}
	const regime = regimeNote(bot, ctx) ?? crashNote(bot, ctx);
	if (regime) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = regime;
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
	const sessionStart = bot.params.sessionStart;
	const sessionEnd = bot.params.sessionEnd;
	if (sessionStart != null && sessionEnd != null && (sessionStart !== 0 || sessionEnd !== 0) && sessionStart !== sessionEnd && !inUtcSession(now, sessionStart, sessionEnd)) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = `Hors session ${sessionStart}h–${sessionEnd}h UTC`;
	}
	const cap = bot.params.maxDailyLoss ?? 0;
	if (cap > 0 && (runtime.dayPnl ?? 0) <= -cap) {
		fills = fills.filter((f) => f.side === "sell");
		if (fills.length === 0) note = `Stop journalier (${cap} EUR)`;
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
	const keptBuy = fills.some((f) => f.side === "buy");
	if (hadBuy && !keptBuy) {
		runtime.inPosition = prev.inPosition;
		runtime.positionQty = prev.positionQty;
		runtime.positionAvg = prev.positionAvg;
		runtime.gridOwned = prev.gridOwned;
		runtime.gridLower = prev.gridLower;
		runtime.gridUpper = prev.gridUpper;
		runtime.buyPause = prev.buyPause;
		runtime.peakPrice = prev.peakPrice;
		runtime.nextDcaAt = prev.nextDcaAt;
		runtime.scaledOut = prev.scaledOut;
		runtime.entryAt = prev.entryAt;
		runtime.entryBar = prev.entryBar;
		runtime.buyCoolUntil = prev.buyCoolUntil;
		runtime.gridSeedNow = prev.gridSeedNow;
		if (fills.length === 0) {
			runtime.lastPrice = prev.lastPrice;
			runtime.lastCandleTime = prev.lastCandleTime;
		}
	}
	if (runtime.inPosition && runtime.positionQty && runtime.positionAvg) runtime.peakPrice = Math.max(runtime.peakPrice ?? runtime.positionAvg, high);
	else if (!runtime.inPosition) runtime.peakPrice = void 0;
	if (runtime.inPosition && runtime.positionQty && runtime.positionAvg && !fills.some((f) => f.side === "sell")) {
		const avg = runtime.positionAvg;
		const pctLow = (low - avg) / avg * 100;
		const pctHigh = (high - avg) / avg * 100;
		const sl = bot.params.slPct;
		const rawTp = bot.params.tpPct ?? 0;
		const feePct = ((ctx.feeRate ?? 0) * 2 + (rawTp > 0 ? .001 : 0)) * 100;
		const tp = rawTp > 0 ? Math.max(rawTp, feePct) : 0;
		const trail = bot.params.trailingPct;
		const be = bot.params.beAfterPct ?? 0;
		const slAtr = bot.params.slAtr ?? 0;
		const peak = runtime.peakPrice ?? avg;
		const holdMin = bot.params.maxHoldMin ?? 0;
		const partial = bot.params.partialTp ?? 0;
		const justEntered = Boolean(keptBuy && !prev.inPosition);
		let atrStop = false;
		if (slAtr > 0 && ctx.candles && ctx.candles.length > 16) {
			const a = atr(ctx.candles, 14);
			const av = a[a.length - 1];
			if (av != null && low <= avg - slAtr * av) atrStop = true;
		}
		const sellPx = (limit) => ctx.barLow != null || ctx.barHigh != null ? limit : px(ctx, "sell");
		const closeAll = (price, why) => {
			fills.push({
				side: "sell",
				qty: runtime.positionQty,
				price,
				note: why
			});
			flattenGrid(runtime);
			markFlat(runtime);
			note = why;
		};
		const perLot = bot.kind === "grid" && (bot.params.gridSlPct ?? 0) > 0;
		const peakGain = (peak - avg) / avg * 100;
		const lockPx = avg * (1 + (ctx.feeRate ?? 0) * 2);
		if (sl && sl > 0 && pctLow <= -sl && !perLot) closeAll(sellPx(avg * (1 - sl / 100)), `Stop-loss ${pctLow.toFixed(2)} %`);
		else if (!justEntered && be > 0 && peakGain >= be && low <= lockPx && bot.kind !== "grid") closeAll(sellPx(lockPx), `Gain verrouillé après +${be} %`);
		else if (atrStop && bot.kind !== "grid") {
			const a = atr(ctx.candles, 14);
			closeAll(sellPx(avg - slAtr * (a[a.length - 1] ?? 0)), `Stop ATR ×${slAtr}`);
		} else if (tp && tp > 0 && pctHigh >= tp && bot.kind !== "grid") {
			const tpPx = sellPx(avg * (1 + tp / 100));
			if (partial > 0 && partial < 100 && !runtime.scaledOut) {
				const qty = runtime.positionQty * (partial / 100);
				if (qty > 0) {
					fills.push({
						side: "sell",
						qty,
						price: tpPx,
						note: `TP partiel ${partial.toFixed(0)} %`
					});
					runtime.positionQty = runtime.positionQty - qty;
					runtime.scaledOut = true;
					note = fills[fills.length - 1].note;
				}
			} else closeAll(tpPx, `Take-profit ${pctHigh.toFixed(2)} %`);
		} else if (trail && trail > 0 && !justEntered && bot.kind !== "grid" && peakGain >= Math.max(trail, ((ctx.feeRate ?? 0) * 2 + .001) * 100) && low <= peak * (1 - trail / 100)) closeAll(sellPx(peak * (1 - trail / 100)), `Trailing ${trail} % depuis ${roundSmart(peak)}`);
		else if (holdMin > 0 && bot.kind !== "grid" && runtime.entryAt && now - runtime.entryAt >= holdMin * 6e4) closeAll(px(ctx, "sell"), `Sortie temps ${holdMin} min`);
	}
	if (keptBuy && !prev.inPosition) {
		runtime.entryAt = now;
		runtime.entryBar = ctx.candles?.[ctx.candles.length - 1]?.time;
		runtime.scaledOut = false;
	}
	if (!runtime.inPosition) {
		runtime.entryAt = void 0;
		runtime.entryBar = void 0;
		runtime.scaledOut = false;
	}
	return {
		fills,
		runtime,
		note
	};
}
function inUtcSession(now, start, end) {
	const h = new Date(now).getUTCHours() + new Date(now).getUTCMinutes() / 60;
	if (start < end) return h >= start && h < end;
	return h >= start || h < end;
}
function flattenGrid(runtime) {
	runtime.gridOwned = [];
}
function kindTitle(kind) {
	return BOT_KIND_BY_ID[kind]?.title ?? kind;
}
function backtestBot(kind, params, sizeQuote, candles, feeRate, pair = "XBTEUR", opts = {}) {
	if (candles.length < 30) return null;
	const base = PAIR_BY_ID[pair]?.base ?? "BTC";
	const startEquity = Math.max(100, opts.startingBalance ?? 1e4);
	const slip = Math.max(0, (opts.slippageBps ?? 0) / 1e4);
	const need = backtestWarmup(kind, params);
	const warmup = Math.max(need, Math.min(opts.warmup ?? need, candles.length - 8));
	if (candles.length < warmup + 8) return null;
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
			equity: paperEquity(paper, { [pair]: ticker }),
			barHigh: c.high,
			barLow: c.low,
			quoteBudget: paper.cash,
			baseBudget: paper.holdings[base]?.qty ?? 0,
			feeRate
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
				time: c.time * 1e3,
				costBasis: fill.entry
			});
			if (res.ok) {
				paper = res.paper;
				bot = {
					...bot,
					lastActionAt: c.time * 1e3
				};
				const compound = params.compoundPct ?? 0;
				if (compound > 0 && fill.side === "sell" && res.trade.pnl > 0) bot = {
					...bot,
					sizeQuote: Math.max(5, bot.sizeQuote + res.trade.pnl * (compound / 100))
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
	const { sharpe, sortino } = riskRatios(curve, candles[warmup].time, candles[candles.length - 1].time);
	const chrono = [...paper.trades].reverse();
	const holds = [];
	let opened = null;
	for (const t of chrono) {
		if (t.side === "buy" && opened == null) opened = t.time;
		if (t.side === "sell" && opened != null) {
			holds.push((t.time - opened) / 6e4);
			opened = null;
		}
	}
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
		})),
		openQty: Object.values(paper.holdings).reduce((s, h) => s + h.qty, 0),
		calmar: maxDd > 0 ? (eq - startEquity) / maxDd : eq > startEquity ? 99 : 0,
		sharpe,
		sortino,
		avgHoldMin: holds.length ? holds.reduce((s, n) => s + n, 0) / holds.length : 0
	};
}
function fmt(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return n.toFixed(1);
}
function riskRatios(curve, from, to) {
	if (curve.length < 4) return {
		sharpe: 0,
		sortino: 0
	};
	const rets = [];
	for (let i = 1; i < curve.length; i++) {
		const prev = curve[i - 1].v;
		if (prev > 0) rets.push(curve[i].v / prev - 1);
	}
	if (rets.length < 3) return {
		sharpe: 0,
		sortino: 0
	};
	const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
	const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
	const std = Math.sqrt(variance);
	const down = rets.filter((r) => r < 0);
	const downVar = down.length ? down.reduce((s, r) => s + r * r, 0) / down.length : 0;
	const downStd = Math.sqrt(downVar);
	const years = Math.max(1 / 365, (to - from) / 31557600);
	const perYear = rets.length / years;
	const scale = Math.sqrt(Math.max(1, perYear));
	return {
		sharpe: std > 0 ? mean / std * scale : 0,
		sortino: downStd > 0 ? mean / downStd * scale : mean > 0 ? 99 : 0
	};
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
function backtestWarmup(kind, params) {
	const n = (v, d) => Math.max(2, Math.round(v ?? d));
	switch (kind) {
		case "sma": return n(params.slow, 200) + 8;
		case "ema":
		case "scalp": return n(params.slow, 21) + 8;
		case "ichimoku": return n(params.kijun, 26) * 2 + 8;
		case "macd": return n(params.macdSlow, 26) + n(params.macdSignal, 9) + 8;
		case "adx": return n(params.adxPeriod, 14) * 3 + 8;
		case "supertrend": return n(params.atrPeriod, 10) + 16;
		case "breakout": return n(params.donchian, 20) + 6;
		case "obv": return n(params.fast, 20) + 8;
		case "div": return n(params.rsiPeriod, 14) + 20;
		case "confirm": return Math.max(n(params.slow, 21), n(params.macdSlow, 26) + n(params.macdSignal, 9), n(params.rsiPeriod, 14)) + 8;
		default: return 48;
	}
}
function botWinRate(stats) {
	const n = stats.closes > 0 ? stats.closes : 0;
	if (n <= 0) return 0;
	return stats.wins / n * 100;
}
function previewSignal(kind, params, sizeQuote, ctx, pair = "XBTEUR") {
	const { fills, note } = evaluateBot({
		id: "pv",
		name: "pv",
		kind,
		venue: "paper",
		status: "running",
		pair,
		interval: 60,
		sizeQuote,
		params,
		createdAt: 0,
		lastNote: "",
		stats: { ...EMPTY_STATS },
		runtime: {}
	}, ctx);
	return {
		note,
		side: fills.some((f) => f.side === "buy") ? "buy" : fills.some((f) => f.side === "sell") ? "sell" : "hold"
	};
}
function paramVariants(kind, base) {
	const rows = [{
		params: base,
		label: "Actuel"
	}];
	const add = (label, p) => rows.push({
		params: {
			...base,
			...p
		},
		label
	});
	if (kind === "rsi" || kind === "mfi" || kind === "stoch" || kind === "div" || kind === "confirm") {
		for (const os of [
			20,
			25,
			30,
			35
		]) for (const ob of [
			65,
			70,
			75,
			80
		]) add(`os ${os} / ob ${ob}`, {
			oversold: os,
			overbought: ob
		});
		if (kind === "confirm") {
			add("EMA 8/21", {
				fast: 8,
				slow: 21
			});
			add("EMA 12/26", {
				fast: 12,
				slow: 26
			});
		}
	} else if (kind === "williams") for (const os of [
		-90,
		-80,
		-70
	]) for (const ob of [
		-30,
		-20,
		-10
	]) add(`os ${os} / ob ${ob}`, {
		oversold: os,
		overbought: ob
	});
	else if (kind === "cci") for (const os of [
		-150,
		-100,
		-80
	]) for (const ob of [
		80,
		100,
		150
	]) add(`os ${os} / ob ${ob}`, {
		oversold: os,
		overbought: ob
	});
	else if (kind === "ema" || kind === "scalp" || kind === "sma" || kind === "obv") for (const fast of [
		5,
		8,
		9,
		12,
		21
	]) for (const slow of [
		13,
		21,
		50,
		200
	]) {
		if (kind === "obv") {
			add(`EMA ${fast}`, { fast });
			break;
		}
		if (slow > fast) add(`${fast}/${slow}`, {
			fast,
			slow
		});
	}
	else if (kind === "macd") {
		add("8/17/9", {
			macdFast: 8,
			macdSlow: 17,
			macdSignal: 9
		});
		add("12/26/9", {
			macdFast: 12,
			macdSlow: 26,
			macdSignal: 9
		});
		add("5/35/5", {
			macdFast: 5,
			macdSlow: 35,
			macdSignal: 5
		});
	} else if (kind === "bollinger") for (const p of [
		14,
		20,
		30
	]) for (const m of [
		1.5,
		2,
		2.5
	]) add(`n${p} ×${m}`, {
		bbPeriod: p,
		bbMult: m
	});
	else if (kind === "breakout") for (const d of [
		10,
		20,
		55
	]) add(`Donchian ${d}`, { donchian: d });
	else if (kind === "supertrend") for (const a of [
		7,
		10,
		14
	]) for (const m of [2, 3]) add(`ATR${a} ×${m}`, {
		atrPeriod: a,
		atrMult: m
	});
	else if (kind === "meanrev") for (const z of [
		1.2,
		1.6,
		2,
		2.5
	]) add(`|Z| ${z}`, { zEntry: z });
	else if (kind === "grid") {
		const lo = base.lower ?? 100;
		const hi = base.upper ?? 110;
		const mid = (lo + hi) / 2;
		const tightLo = mid * .99;
		const tightHi = mid * 1.01;
		if (tightLo < tightHi) add("serrée 2%", {
			lower: tightLo,
			upper: tightHi,
			levels: 6
		});
		add("large 8%", {
			lower: mid * .96,
			upper: mid * 1.04,
			levels: 8
		});
		add("12 lots", {
			lower: lo,
			upper: hi,
			levels: 12
		});
		add("revente 0.8% / rachat 0.5%", {
			gridSellPct: .8,
			gridBuyPct: .5
		});
		add("revente 1.5% / rachat 1%", {
			gridSellPct: 1.5,
			gridBuyPct: 1
		});
		add("revente 2.5% / rachat 1.5%", {
			gridSellPct: 2.5,
			gridBuyPct: 1.5
		});
		add("stop lot 3%", { gridSlPct: 3 });
		add("suivi de fourchette", { gridFollow: true });
		add("premier lot marché", { gridSeed: true });
		add("revente brute", { gridNetFees: false });
		add("pause 30 min après stop", {
			gridSlPct: 3,
			gridSlCooldownMin: 30
		});
	}
	return rows.slice(0, 18);
}
function optimizeBot(kind, base, sizeQuote, candles, feeRate, pair, opts = {}) {
	const scored = [];
	for (const row of paramVariants(kind, base)) {
		const result = backtestBot(kind, row.params, sizeQuote, candles, feeRate, pair, opts);
		if (!result || result.sells < 1) continue;
		scored.push({
			params: row.params,
			label: row.label,
			result
		});
	}
	scored.sort((a, b) => {
		const sa = a.result.calmar !== 99 ? a.result.calmar : a.result.pnlPct;
		return (b.result.calmar !== 99 ? b.result.calmar : b.result.pnlPct) - sa;
	});
	return scored.slice(0, 6);
}
function assetPx(asset, tickers) {
	if (asset === "EUR") return 1;
	if (asset === "USD") {
		const usd = tickers.XBTUSD?.last;
		const eur = tickers.XBTEUR?.last;
		if (usd && eur) return eur / usd;
		return 1 / 1.08;
	}
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
	const basisQty = input.side === "sell" && input.costBasis && input.costBasis > 0 ? input.costBasis : pos.avg;
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
		pnl = notional - fee - basisQty * input.qty;
		const newQty = pos.qty - input.qty;
		if (newQty <= 1e-12) delete holdings[input.base];
		else {
			const costLeft = Math.max(0, pos.avg * pos.qty - basisQty * input.qty);
			holdings[input.base] = {
				qty: newQty,
				avg: costLeft / newQty
			};
		}
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
function botBlueprint(bot) {
	return {
		name: bot.name,
		kind: bot.kind,
		venue: bot.venue,
		pair: bot.pair,
		interval: bot.interval,
		sizeQuote: bot.sizeQuote,
		params: { ...bot.params }
	};
}
function parseBotBlueprints(raw) {
	const root = raw && typeof raw === "object" ? raw : null;
	const list = Array.isArray(raw) ? raw : Array.isArray(root?.bots) ? root.bots : null;
	if (!list) return [];
	const kinds = new Set(BOT_KINDS.map((k) => k.id));
	const out = [];
	for (const row of list) {
		if (!row || typeof row !== "object") continue;
		const r = row;
		const kind = r.kind;
		if (typeof kind !== "string" || !kinds.has(kind)) continue;
		const pair = typeof r.pair === "string" ? r.pair : "";
		const sizeQuote = Number(r.sizeQuote);
		if (!(sizeQuote > 0) || !pair) continue;
		out.push({
			name: typeof r.name === "string" ? r.name : "",
			kind,
			venue: r.venue === "live" ? "live" : "paper",
			pair,
			interval: Number(r.interval) > 0 ? Number(r.interval) : 60,
			sizeQuote,
			params: r.params && typeof r.params === "object" ? r.params : {}
		});
	}
	return out;
}
function kindNeedsCandles(kind) {
	return BOT_KIND_BY_ID[kind]?.needsCandles ?? false;
}
var RISK_PRESETS = [
	{
		id: "prudent",
		label: "Prudent",
		params: {
			slPct: 2,
			tpPct: 4,
			trailingPct: 1.5,
			cooldownSec: 90,
			maxSpreadPct: .25,
			maxDailyLoss: 150,
			maxTradesDay: 8,
			maxConsecutiveLoss: 3,
			trendEma: 50,
			slAtr: 1.5,
			maxHoldMin: 720,
			partialTp: 50
		}
	},
	{
		id: "balanced",
		label: "Équilibré",
		params: {
			slPct: 3,
			tpPct: 6,
			trailingPct: 2,
			cooldownSec: 30,
			maxSpreadPct: .4,
			maxDailyLoss: 300,
			maxTradesDay: 16,
			maxConsecutiveLoss: 5,
			trendEma: 21,
			slAtr: 0,
			maxHoldMin: 0,
			partialTp: 0
		}
	},
	{
		id: "aggressive",
		label: "Agressif",
		params: {
			slPct: 5,
			tpPct: 12,
			trailingPct: 0,
			cooldownSec: 0,
			maxSpreadPct: .8,
			maxDailyLoss: 0,
			maxTradesDay: 0,
			maxConsecutiveLoss: 0,
			trendEma: 0,
			slAtr: 0,
			maxHoldMin: 0,
			partialTp: 0
		}
	}
];
function compareStrategies(candles, feeRate, pair, sizeQuote, opts = {}) {
	const last = candles[candles.length - 1]?.close ?? 100;
	const rows = [];
	for (const kind of BOT_KINDS) {
		const result = backtestBot(kind.id, defaultParams(kind.id, last), sizeQuote, candles, feeRate, pair, opts);
		if (!result || result.sells < 1) continue;
		rows.push({
			kind: kind.id,
			title: kind.title,
			result
		});
	}
	rows.sort((a, b) => {
		const sa = a.result.calmar !== 99 ? a.result.calmar : a.result.pnlPct;
		return (b.result.calmar !== 99 ? b.result.calmar : b.result.pnlPct) - sa;
	});
	return rows;
}
function walkForward(kind, params, sizeQuote, candles, feeRate, pair, opts = {}) {
	const split = Math.max(40, Math.floor(candles.length * .7));
	const warmup = backtestWarmup(kind, params);
	const is = backtestBot(kind, params, sizeQuote, candles.slice(0, split), feeRate, pair, opts);
	const oosStart = Math.max(0, split - warmup);
	return {
		inSample: is,
		outSample: backtestBot(kind, params, sizeQuote, candles.slice(oosStart), feeRate, pair, opts)
	};
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a += 1831565813;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
/** Shuffle closed-trade PnLs to estimate a 5/50/95 terminal outcome. */
function monteCarloPnl(pnls, startEquity, samples = 200, seed = 1) {
	if (pnls.length < 3 || !(startEquity > 0) || samples < 8) return null;
	const rand = mulberry32(seed);
	const terminals = [];
	let ruin = 0;
	for (let i = 0; i < samples; i++) {
		const order = pnls.slice();
		for (let j = order.length - 1; j > 0; j--) {
			const k = Math.floor(rand() * (j + 1));
			const tmp = order[j];
			order[j] = order[k];
			order[k] = tmp;
		}
		let eq = startEquity;
		for (const p of order) {
			eq += p;
			if (eq <= startEquity * .5) {
				ruin += 1;
				break;
			}
		}
		terminals.push(eq - startEquity);
	}
	terminals.sort((a, b) => a - b);
	const at = (q) => terminals[Math.min(terminals.length - 1, Math.max(0, Math.floor(q * (terminals.length - 1))))];
	const mean = terminals.reduce((s, n) => s + n, 0) / terminals.length;
	return {
		samples,
		p5: at(.05),
		p50: at(.5),
		p95: at(.95),
		mean,
		ruinPct: ruin / samples * 100
	};
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/kraken.server-CQDHT3_G.js
/** PFU : 12,8 % d'impôt sur le revenu (inchangé). */
var PFU_IR = .128;
/** Prélèvements sociaux jusqu'aux revenus 2025. */
var PFU_PS = .172;
/** Prélèvements sociaux dès le 1er janvier 2026 (LFSS 2026, CSG +1,4 pt). */
var PFU_PS_2026 = .186;
function pfuForYear(year) {
	const ps = year >= 2026 ? PFU_PS_2026 : PFU_PS;
	return {
		ir: PFU_IR,
		ps,
		total: PFU_IR + ps,
		label: year >= 2026 ? "31,4 %" : "30 %"
	};
}
var FIAT = /* @__PURE__ */ new Set([
	"EUR",
	"USD",
	"GBP",
	"CHF",
	"CAD",
	"JPY",
	"AUD"
]);
var ASSET_MAP$1 = {
	XXBT: "BTC",
	XBT: "BTC",
	XETH: "ETH",
	XXRP: "XRP",
	XLTC: "LTC",
	XXLM: "XLM",
	XXMR: "XMR",
	XXDG: "DOGE",
	XDG: "DOGE",
	ZEUR: "EUR",
	ZUSD: "USD",
	ZGBP: "GBP"
};
var MONTHS = [
	"janvier",
	"février",
	"mars",
	"avril",
	"mai",
	"juin",
	"juillet",
	"août",
	"septembre",
	"octobre",
	"novembre",
	"décembre"
];
function normalizeFiscalAsset(code) {
	let raw = code.trim().toUpperCase();
	if (!raw) return "";
	raw = raw.replace(/\.(S|F|B|M|T|P|HOLD)$/, "");
	if (ASSET_MAP$1[raw]) return ASSET_MAP$1[raw];
	return raw.replace(/^Z(?=EUR|USD|GBP|CHF|CAD|JPY|AUD)/, "").replace(/^X(?=[A-Z]{3}$)/, "");
}
function isFiatAsset(asset) {
	return FIAT.has(asset);
}
function parisOffset(utc) {
	const dtf = new Intl.DateTimeFormat("en-US", {
		timeZone: "Europe/Paris",
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
	const parts = Object.fromEntries(dtf.formatToParts(new Date(utc)).map((p) => [p.type, p.value]));
	const hour = parts.hour === "24" ? 0 : Number(parts.hour);
	return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), hour, Number(parts.minute), Number(parts.second)) - utc;
}
function parisDate(year, month, day, hour = 0, minute = 0, second = 0) {
	const guess = Date.UTC(year, month - 1, day, hour, minute, second);
	return guess - parisOffset(guess);
}
function parisYear(ms) {
	const dtf = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Paris",
		year: "numeric"
	});
	return Number(dtf.format(ms));
}
function parisMonth(ms) {
	return Number(new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Paris",
		month: "numeric"
	}).format(ms));
}
function formatFiscalDate(ms) {
	return new Intl.DateTimeFormat("fr-FR", {
		timeZone: "Europe/Paris",
		day: "2-digit",
		month: "2-digit",
		year: "numeric"
	}).format(ms);
}
function resolvePeriod(input) {
	const now = input.now ?? Date.now();
	if (input.kind === "rolling12") return {
		kind: "rolling12",
		start: now - 31536e6,
		end: now,
		label: "12 derniers mois"
	};
	if (input.kind === "month") {
		const year = input.year ?? parisYear(now);
		const month = Math.min(12, Math.max(1, input.month ?? 1));
		return {
			kind: "month",
			start: parisDate(year, month, 1),
			end: (month === 12 ? parisDate(year + 1, 1, 1) : parisDate(year, month + 1, 1)) - 1,
			label: `${MONTHS[month - 1]} ${year}`
		};
	}
	if (input.kind === "custom") {
		const from = parseDay(input.from) ?? parisDate(parisYear(now), 1, 1);
		const toDay = parseDay(input.to);
		const end = toDay != null ? toDay + 864e5 - 1 : now;
		const start = Math.min(from, end);
		return {
			kind: "custom",
			start,
			end: Math.max(end, start),
			label: `${formatFiscalDate(start)} – ${formatFiscalDate(Math.max(end, start))}`
		};
	}
	const year = input.year ?? parisYear(now);
	return {
		kind: "year",
		start: parisDate(year, 1, 1),
		end: parisDate(year + 1, 1, 1) - 1,
		label: `Année ${year}`,
		calendarYear: year
	};
}
function parseDay(iso) {
	if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return null;
	return parisDate(y, m, d);
}
function cents(n) {
	return Math.round(n * 100) / 100;
}
function pushWarn(list, text) {
	if (!list.includes(text)) list.push(text);
}
function movesFromLedgers(legs, opts = {}) {
	const warnings = [];
	const groups = /* @__PURE__ */ new Map();
	for (const leg of legs) {
		const asset = normalizeFiscalAsset(leg.asset);
		if (!asset || !Number.isFinite(leg.amount)) continue;
		const key = `${leg.type}|${leg.refid || leg.id}`;
		const bucket = groups.get(key) ?? [];
		bucket.push({
			...leg,
			asset,
			type: leg.type.toLowerCase()
		});
		groups.set(key, bucket);
	}
	const moves = [];
	for (const [, bucket] of groups) {
		const type = bucket[0].type;
		const time = Math.min(...bucket.map((l) => l.time));
		const id = bucket[0].refid || bucket[0].id;
		if (type === "margin" || type === "rollover" || type === "settled") {
			pushWarn(warnings, "Activité sur marge ou dérivés ignorée (hors cessions spot de l’art. 150 VH bis).");
			continue;
		}
		if (type === "deposit" || type === "withdrawal" || type === "transfer") {
			for (const leg of bucket) {
				const qty = Math.abs(leg.amount);
				if (!(qty > 0)) continue;
				if (isFiatAsset(leg.asset)) {
					moves.push({
						id: leg.id,
						time: leg.time,
						kind: "fiat",
						asset: leg.asset,
						qty,
						source: "kraken",
						note: type
					});
					continue;
				}
				const inbound = type === "deposit" || type === "transfer" && leg.amount > 0;
				const outbound = type === "withdrawal" || type === "transfer" && leg.amount < 0;
				if (type === "transfer" && !inbound && !outbound) continue;
				moves.push({
					id: leg.id,
					time: leg.time,
					kind: inbound ? "deposit" : "withdraw",
					asset: leg.asset,
					qty,
					source: "kraken",
					note: type === "transfer" ? "Transfert interne Kraken" : type === "deposit" ? "Dépôt" : "Retrait"
				});
			}
			continue;
		}
		if (type === "staking" || type === "earn" || type === "reward" || type === "dividend" || type === "credit") {
			for (const leg of bucket) {
				if (isFiatAsset(leg.asset) || !(leg.amount > 0)) continue;
				moves.push({
					id: leg.id,
					time: leg.time,
					kind: "income",
					asset: leg.asset,
					qty: leg.amount,
					source: "kraken",
					note: type
				});
			}
			continue;
		}
		if (type !== "trade" && type !== "spend" && type !== "receive" && type !== "sale") {
			pushWarn(warnings, `Mouvement Kraken « ${type} » non classé — à vérifier.`);
			continue;
		}
		const out = /* @__PURE__ */ new Map();
		const inn = /* @__PURE__ */ new Map();
		for (const leg of bucket) {
			const bag = leg.amount < 0 ? out : inn;
			const cur = bag.get(leg.asset) ?? {
				qty: 0,
				fee: 0
			};
			cur.qty += Math.abs(leg.amount);
			cur.fee += Math.abs(leg.fee);
			bag.set(leg.asset, cur);
		}
		const outs = [...out.entries()];
		const ins = [...inn.entries()];
		if (!outs.length || !ins.length) {
			pushWarn(warnings, "Trade Kraken incomplet (une seule jambe) — ignoré.");
			continue;
		}
		const fiatOut = outs.find(([a]) => isFiatAsset(a));
		const fiatIn = ins.find(([a]) => isFiatAsset(a));
		const cryptoOut = outs.find(([a]) => !isFiatAsset(a));
		const cryptoIn = ins.find(([a]) => !isFiatAsset(a));
		if (fiatOut && cryptoIn && fiatOut[0] === "EUR") {
			const feeCrypto = cryptoIn[1].fee;
			const qty = Math.max(0, cryptoIn[1].qty - feeCrypto);
			const feeEur = fiatOut[1].fee + (feeCrypto > 0 && cryptoIn[1].qty > 0 ? fiatOut[1].qty / cryptoIn[1].qty * feeCrypto : 0);
			moves.push({
				id,
				time,
				kind: "buy",
				asset: cryptoIn[0],
				qty,
				quote: "EUR",
				quoteQty: fiatOut[1].qty,
				feeEur,
				source: "kraken",
				note: "Achat"
			});
			continue;
		}
		if (fiatIn && cryptoOut && (fiatIn[0] === "EUR" || fiatIn[0] === "USD")) {
			const feeCrypto = cryptoOut[1].fee;
			const qty = cryptoOut[1].qty + feeCrypto;
			const gross = fiatIn[1].qty;
			const fx = fiatIn[0] === "EUR" ? 1 : opts.eurPerUsd;
			if (!(fx && fx > 0)) {
				pushWarn(warnings, "Cession en USD sans taux EUR — ignorée. Recharge avec le marché ouvert.");
				continue;
			}
			const unit = gross / Math.max(cryptoOut[1].qty, 1e-12);
			const feeEur = fiatIn[1].fee * fx + feeCrypto * unit * fx;
			moves.push({
				id,
				time,
				kind: "sell",
				asset: cryptoOut[0],
				qty,
				quote: "EUR",
				quoteQty: gross * fx,
				feeEur,
				source: "kraken",
				note: fiatIn[0] === "USD" ? "Vente USD convertie" : "Vente"
			});
			continue;
		}
		if (cryptoOut && cryptoIn && cryptoOut[0] === cryptoIn[0]) {
			const burned = cryptoOut[1].qty + cryptoOut[1].fee - Math.max(0, cryptoIn[1].qty - cryptoIn[1].fee);
			if (burned > 1e-10) moves.push({
				id,
				time,
				kind: "fee",
				asset: cryptoOut[0],
				qty: burned,
				source: "kraken",
				note: "Frais de conversion interne"
			});
			continue;
		}
		if (cryptoOut && cryptoIn) {
			moves.push({
				id,
				time,
				kind: "swap",
				asset: cryptoOut[0],
				qty: cryptoOut[1].qty + cryptoOut[1].fee,
				quote: cryptoIn[0],
				quoteQty: Math.max(0, cryptoIn[1].qty - cryptoIn[1].fee),
				source: "kraken",
				note: "Échange crypto"
			});
			continue;
		}
		pushWarn(warnings, "Trade avec une monnaie autre que EUR/USD — non converti.");
	}
	moves.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
	return {
		moves,
		warnings
	};
}
var CSV_MAX_ROWS = 2e4;
function parseCsvTable(text) {
	const src = text.replace(/^\uFEFF/, "");
	const headerLine = src.split(/\r?\n/).find((line) => line.trim()) ?? "";
	const delim = (headerLine.match(/;/g) ?? []).length > (headerLine.match(/,/g) ?? []).length ? ";" : ",";
	const rows = [];
	let row = [];
	let cell = "";
	let quoted = false;
	for (let i = 0; i < src.length; i++) {
		const ch = src[i];
		if (quoted) {
			if (ch === "\"") {
				if (src[i + 1] === "\"") {
					cell += "\"";
					i += 1;
				} else quoted = false;
			} else cell += ch;
			continue;
		}
		if (ch === "\"") quoted = true;
		else if (ch === delim) {
			row.push(cell);
			cell = "";
		} else if (ch === "\n") {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else if (ch !== "\r") cell += ch;
	}
	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}
	return rows.filter((record) => record.some((value) => value.trim()));
}
function csvIndex(headers, ...names) {
	return headers.findIndex((header) => names.includes(header));
}
function csvTime(raw) {
	const text = raw.trim();
	if (!text) return null;
	if (/^\d+(\.\d+)?$/.test(text)) {
		const n = Number(text);
		return n > 0xe8d4a51000 ? Math.round(n) : Math.round(n * 1e3);
	}
	const iso = text.includes("T") ? text : text.replace(" ", "T");
	const zoned = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
	const ms = Date.parse(zoned);
	return Number.isFinite(ms) ? ms : null;
}
/** Kraken ledger export or trades history CSV. Stays on device; no API call. */
function legsFromKrakenCsv(text) {
	const warnings = [];
	const table = parseCsvTable(text);
	if (table.length < 2) return {
		legs: [],
		warnings: ["Fichier vide ou sans ligne de données."]
	};
	const headers = table[0].map((header) => header.trim().toLowerCase());
	const rows = table.slice(1);
	const ledger = csvIndex(headers, "asset") >= 0 && csvIndex(headers, "amount", "montant") >= 0;
	const trades = csvIndex(headers, "pair") >= 0 && csvIndex(headers, "vol", "volume") >= 0;
	if (!ledger && !trades) return {
		legs: [],
		warnings: ["Export non reconnu. Il faut un grand livre Kraken (asset, amount) ou un historique de trades (pair, vol)."]
	};
	const slice = rows.slice(0, CSV_MAX_ROWS);
	if (rows.length > CSV_MAX_ROWS) pushWarn(warnings, `Import limité aux ${CSV_MAX_ROWS} premières lignes.`);
	const legs = ledger ? legsFromLedgerRows(headers, slice, warnings) : legsFromTradeRows(headers, slice, warnings);
	if (!legs.length) pushWarn(warnings, "Aucune ligne exploitable dans ce fichier.");
	return {
		legs,
		warnings
	};
}
function legsFromLedgerRows(headers, rows, warnings) {
	const iTime = csvIndex(headers, "time", "date");
	const iType = csvIndex(headers, "type");
	const iAsset = csvIndex(headers, "asset");
	const iAmount = csvIndex(headers, "amount", "montant");
	const iFee = csvIndex(headers, "fee", "frais");
	const iRef = csvIndex(headers, "refid", "ref");
	const iId = csvIndex(headers, "txid", "id");
	const legs = [];
	rows.forEach((row, index) => {
		const time = csvTime(row[iTime] ?? "");
		const asset = (row[iAsset] ?? "").trim();
		const amount = parseDecimal(row[iAmount] ?? "") ?? NaN;
		if (time == null || !asset || !Number.isFinite(amount)) return;
		legs.push({
			id: (row[iId] ?? "").trim() || `csv-${index}`,
			refid: (row[iRef] ?? "").trim() || (row[iId] ?? "").trim() || `csv-${index}`,
			time,
			type: ((row[iType] ?? "").trim() || "trade").toLowerCase(),
			asset,
			amount,
			fee: Math.abs(parseDecimal(row[iFee] ?? "") ?? 0)
		});
	});
	if (rows.length && !legs.length) pushWarn(warnings, "Les dates ou montants du grand livre n’ont pas pu être lus.");
	return legs;
}
function legsFromTradeRows(headers, rows, warnings) {
	const iTime = csvIndex(headers, "time", "date");
	const iType = csvIndex(headers, "type");
	const iPair = csvIndex(headers, "pair");
	const iVol = csvIndex(headers, "vol", "volume");
	const iCost = csvIndex(headers, "cost");
	const iFee = csvIndex(headers, "fee", "frais");
	const iPrice = csvIndex(headers, "price");
	const iId = csvIndex(headers, "txid", "id");
	const legs = [];
	let skipped = 0;
	rows.forEach((row, index) => {
		const pair = resolvePairId((row[iPair] ?? "").trim());
		const meta = pair ? PAIR_BY_ID[pair] : void 0;
		const time = csvTime(row[iTime] ?? "");
		const vol = parseDecimal(row[iVol] ?? "") ?? 0;
		const cost = parseDecimal(row[iCost] ?? "") ?? (parseDecimal(row[iPrice] ?? "") ?? 0) * vol;
		const side = (row[iType] ?? "").trim().toLowerCase();
		if (!meta || time == null || !(vol > 0) || !(cost > 0) || side !== "buy" && side !== "sell") {
			skipped += 1;
			return;
		}
		const id = (row[iId] ?? "").trim() || `csv-${index}`;
		const fee = Math.abs(parseDecimal(row[iFee] ?? "") ?? 0);
		const quote = meta.quote;
		const base = meta.base;
		if (side === "buy") {
			legs.push({
				id: `${id}-q`,
				refid: id,
				time,
				type: "trade",
				asset: quote,
				amount: -cost,
				fee
			});
			legs.push({
				id: `${id}-b`,
				refid: id,
				time,
				type: "trade",
				asset: base,
				amount: vol,
				fee: 0
			});
		} else {
			legs.push({
				id: `${id}-b`,
				refid: id,
				time,
				type: "trade",
				asset: base,
				amount: -vol,
				fee: 0
			});
			legs.push({
				id: `${id}-q`,
				refid: id,
				time,
				type: "trade",
				asset: quote,
				amount: cost,
				fee
			});
		}
	});
	if (skipped) pushWarn(warnings, `${skipped} trade${skipped > 1 ? "s" : ""} ignoré${skipped > 1 ? "s" : ""} (paire ou montant illisible).`);
	return legs;
}
function movesFromFills(fills, source, opts = {}) {
	const warnings = [];
	const moves = [];
	for (const fill of fills) {
		const meta = PAIR_BY_ID[fill.pair];
		if (!meta || !(fill.amount > 0) || !(fill.price > 0)) {
			pushWarn(warnings, "Ordre sans paire reconnue — ignoré.");
			continue;
		}
		const quote = meta.quote;
		const notion = fill.amount * fill.price;
		if (quote === "EUR" || quote === "USD" && opts.eurPerUsd && opts.eurPerUsd > 0) {
			const fx = quote === "EUR" ? 1 : opts.eurPerUsd;
			if (quote === "USD") pushWarn(warnings, "Cessions ou achats en USD convertis avec le taux EUR du moment — à recouper.");
			moves.push({
				id: fill.id,
				time: fill.time,
				kind: fill.side === "buy" ? "buy" : "sell",
				asset: normalizeFiscalAsset(meta.base),
				qty: fill.amount,
				quote: "EUR",
				quoteQty: notion * fx,
				feeEur: (fill.fee || 0) * fx,
				source,
				note: fill.side === "buy" ? "Achat" : "Vente"
			});
			continue;
		}
		if (!isFiatAsset(quote)) {
			moves.push({
				id: fill.id,
				time: fill.time,
				kind: "swap",
				asset: fill.side === "sell" ? normalizeFiscalAsset(meta.base) : normalizeFiscalAsset(quote),
				qty: fill.side === "sell" ? fill.amount : notion,
				quote: fill.side === "sell" ? normalizeFiscalAsset(quote) : normalizeFiscalAsset(meta.base),
				quoteQty: fill.side === "sell" ? notion : fill.amount,
				source,
				note: "Échange crypto"
			});
			continue;
		}
		pushWarn(warnings, `Paire ${meta.display} hors EUR/USD — non reprise.`);
	}
	moves.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
	return {
		moves,
		warnings
	};
}
function portfolioValue(holdings, px) {
	let value = 0;
	const missing = [];
	for (const [asset, qty] of holdings) {
		if (!(qty > 1e-12)) continue;
		const price = px.get(asset);
		if (!(price && price > 0)) {
			missing.push(asset);
			continue;
		}
		value += qty * price;
	}
	return {
		value,
		missing
	};
}
function indexPrices(history) {
	const map = /* @__PURE__ */ new Map();
	if (!history) return map;
	for (const [asset, rows] of Object.entries(history)) {
		const clean = rows.filter((row) => row && row.eur > 0 && Number.isFinite(row.time)).sort((a, b) => a.time - b.time);
		if (clean.length) map.set(asset, clean);
	}
	return map;
}
function priceAt(series, time) {
	if (!series?.length) return void 0;
	let lo = 0;
	let hi = series.length - 1;
	let ans = -1;
	while (lo <= hi) {
		const mid = lo + hi >> 1;
		if (series[mid].time <= time) {
			ans = mid;
			lo = mid + 1;
		} else hi = mid - 1;
	}
	return ans >= 0 ? series[ans].eur : void 0;
}
function marketPrice(opts, history, asset, time) {
	const manual = opts.prices?.manual?.[asset];
	if (manual && manual > 0) return manual;
	return priceAt(history.get(asset), time);
}
function taxOn(baseEuros, year) {
	const rates = pfuForYear(year);
	const base = Math.round(baseEuros);
	if (!(base > 0)) return null;
	const ir = cents(base * rates.ir);
	const ps = cents(base * rates.ps);
	return {
		ir,
		ps,
		total: cents(ir + ps),
		label: rates.label,
		psRate: rates.ps
	};
}
function buildYearSheets(rows) {
	const by = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const year = parisYear(row.time);
		const cur = by.get(year) ?? {
			net: 0,
			gain: 0
		};
		cur.net += row.netEur;
		cur.gain += row.gainEur;
		by.set(year, cur);
	}
	const years = [...by.keys()].sort((a, b) => a - b);
	if (!years.length) return [];
	const lots = [];
	const sheets = [];
	for (let year = years[0]; year <= years[years.length - 1]; year++) {
		for (const lot of lots) if (year - lot.year > 10) lot.left = 0;
		const cur = by.get(year);
		if (!cur) continue;
		const cessionsNet = cents(cur.net);
		const gain = cents(cur.gain);
		const exempt = cessionsNet <= 305;
		let imputed = 0;
		let taxable = 0;
		let lossCreated = 0;
		if (!exempt && gain > 0) {
			let left = gain;
			for (const lot of lots) {
				if (!(lot.left > 0) || year - lot.year > 10 || year <= lot.year) continue;
				const take = Math.min(lot.left, left);
				lot.left = cents(lot.left - take);
				left = cents(left - take);
				imputed = cents(imputed + take);
				if (!(left > 0)) break;
			}
			taxable = left;
		} else if (!exempt && gain < 0) {
			lossCreated = cents(-gain);
			lots.push({
				year,
				left: lossCreated
			});
		}
		const rates = pfuForYear(year);
		sheets.push({
			year,
			cessionsNet,
			gain,
			exempt,
			imputed,
			taxable: exempt ? 0 : taxable,
			lossCreated: exempt ? 0 : lossCreated,
			rateLabel: rates.label,
			tax: exempt ? null : taxOn(taxable, year)
		});
	}
	return sheets;
}
function buildFiscalReport(moves, period, opts = {}) {
	const warnings = [];
	const sorted = [...moves].sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
	const holdings = /* @__PURE__ */ new Map();
	const px = /* @__PURE__ */ new Map();
	const history = indexPrices(opts.prices?.history);
	let pta = 0;
	let ever = 0;
	let openingPta = null;
	let snapPta = null;
	let snapHoldings = null;
	let snapPx = null;
	const allCessions = [];
	const incomes = [];
	let swapCount = 0;
	let simulated = false;
	let sawCostValuation = false;
	const addQty = (asset, qty) => {
		holdings.set(asset, (holdings.get(asset) ?? 0) + qty);
	};
	const snap = () => {
		if (snapPta != null) return;
		snapPta = pta;
		snapHoldings = new Map(holdings);
		snapPx = new Map(px);
	};
	for (const move of sorted) {
		if (move.time > period.end) snap();
		if (move.source === "paper") simulated = true;
		if (openingPta == null && move.time >= period.start) openingPta = pta;
		if (move.kind === "fiat") continue;
		if (move.kind === "fee") {
			addQty(move.asset, -move.qty);
			continue;
		}
		if (move.kind === "deposit") {
			if (opts.ownWallets && move.source !== "manual") continue;
			addQty(move.asset, move.qty);
			pushWarn(warnings, "Dépôt crypto sans prix d’acquisition : le stock augmente, pas le prix de revient. Ajoute un achat manuel si ces unités ont été payées ailleurs.");
			continue;
		}
		if (move.kind === "withdraw") {
			if (opts.ownWallets && move.source !== "manual") continue;
			addQty(move.asset, -move.qty);
			pushWarn(warnings, "Retrait crypto sorti du stock suivi. Si les unités sont encore à toi, coche « wallets perso » pour les garder dans la valeur globale.");
			continue;
		}
		if (move.kind === "buy") {
			const fee = Math.max(0, move.feeEur ?? 0);
			const cost = Math.max(0, move.quoteQty ?? 0) + fee;
			const qty = move.qty;
			if (!(qty > 0) || !(cost > 0)) continue;
			addQty(move.asset, qty);
			pta += cost;
			ever += cost;
			px.set(move.asset, cost / qty);
			continue;
		}
		if (move.kind === "swap") {
			const outQty = move.qty;
			const inAsset = move.quote ?? "";
			const inQty = move.quoteQty ?? 0;
			if (!inAsset || !(outQty > 0) || !(inQty > 0)) continue;
			addQty(move.asset, -outQty);
			addQty(inAsset, inQty);
			const outPx = px.get(move.asset);
			const inPx = px.get(inAsset);
			if (outPx && outPx > 0) px.set(inAsset, outQty * outPx / inQty);
			else if (inPx && inPx > 0) px.set(move.asset, inQty * inPx / outQty);
			swapCount += 1;
			continue;
		}
		if (move.kind === "income") {
			const known = px.get(move.asset);
			const value = move.quoteQty && move.quoteQty > 0 ? move.quoteQty : known && known > 0 ? move.qty * known : 0;
			addQty(move.asset, move.qty);
			if (value > 0 && move.qty > 0) {
				px.set(move.asset, value / move.qty);
				pta += value;
				ever += value;
			} else pushWarn(warnings, `Revenu ${move.asset} sans prix EUR — stock augmenté, prix de revient inchangé.`);
			if (move.time >= period.start && move.time <= period.end) incomes.push({
				time: move.time,
				asset: move.asset,
				qty: move.qty,
				valueEur: cents(value),
				note: move.note
			});
			continue;
		}
		if (move.kind !== "sell") continue;
		const gross = Math.max(0, move.quoteQty ?? 0);
		const fees = Math.max(0, move.feeEur ?? 0);
		const net = Math.max(0, gross - fees);
		const qty = move.qty;
		if (!(qty > 0) || !(gross > 0)) continue;
		if ((holdings.get(move.asset) ?? 0) + 1e-8 < qty) {
			pushWarn(warnings, `Vente de ${move.asset} supérieure au stock suivi — plus-value peut-être trop haute (prix de revient incomplet).`);
			holdings.set(move.asset, qty);
		}
		px.set(move.asset, net / qty);
		const marks = new Map(px);
		let valuedAtCost = false;
		for (const [asset, heldQty] of holdings) {
			if (!(heldQty > 1e-12) || asset === move.asset) continue;
			const market = marketPrice(opts, history, asset, move.time);
			if (market && market > 0) {
				marks.set(asset, market);
				px.set(asset, market);
			} else if ((px.get(asset) ?? 0) > 0) valuedAtCost = true;
		}
		if (valuedAtCost) sawCostValuation = true;
		const valued = portfolioValue(holdings, marks);
		let portfolio = valued.value;
		let incomplete = valued.missing.length > 0 || valuedAtCost;
		if (valued.missing.length) pushWarn(warnings, `Prix manquant pour ${valued.missing.join(", ")} — valeur globale incomplète.`);
		if (!(portfolio > 0)) {
			portfolio = net;
			incomplete = true;
		}
		let fraction = portfolio > 0 ? net / portfolio : 1;
		if (fraction > 1) {
			fraction = 1;
			incomplete = true;
			pushWarn(warnings, "Fraction de cession plafonnée à 100 % (valeur de portefeuille inférieure au prix de cession).");
		}
		const acquired = pta * fraction;
		const gain = net - acquired;
		const ptaBefore = pta;
		const ptaEver = ever;
		const ptaOut = Math.max(0, ever - pta);
		pta = Math.max(0, pta - acquired);
		addQty(move.asset, -qty);
		allCessions.push({
			time: move.time,
			asset: move.asset,
			qty,
			grossEur: cents(gross),
			feesEur: cents(fees),
			netEur: cents(net),
			portfolioEur: cents(portfolio),
			ptaEver: cents(ptaEver),
			ptaOut: cents(ptaOut),
			ptaBefore: cents(ptaBefore),
			acquiredEur: cents(acquired),
			gainEur: cents(gain),
			valuedAtCost,
			incomplete,
			note: move.note
		});
	}
	snap();
	if (openingPta == null) openingPta = pta;
	if (sawCostValuation) pushWarn(warnings, "Case 212 incomplète : un autre actif est valorisé au prix d'acquisition, pas au cours du jour de la cession. Charge les cours Kraken ou saisis un prix.");
	const cessions = allCessions.filter((row) => row.time >= period.start && row.time <= period.end);
	const yearSheets = buildYearSheets(allCessions);
	const yearCessions = yearSheets.map((sheet) => ({
		year: sheet.year,
		total: sheet.cessionsNet,
		exempt: sheet.exempt
	}));
	const totalCessions = cents(cessions.reduce((s, c) => s + c.netEur, 0));
	const totalGains = cents(cessions.filter((c) => c.gainEur > 0).reduce((s, c) => s + c.gainEur, 0));
	const totalLosses = cents(cessions.filter((c) => c.gainEur < 0).reduce((s, c) => s + c.gainEur, 0));
	const net = cents(cessions.reduce((s, c) => s + c.gainEur, 0));
	const singleYear = period.calendarYear != null;
	const sheet = singleYear ? yearSheets.find((row) => row.year === period.calendarYear) : void 0;
	const exempt = Boolean(sheet?.exempt);
	const indicative = !singleYear;
	const tax = sheet ? sheet.tax : net > 0 ? taxOn(net, parisYear(period.end)) : null;
	const declaration = sheet ? {
		year: sheet.year,
		cessionsNet: sheet.cessionsNet,
		gain: sheet.gain,
		exempt: sheet.exempt,
		imputed: sheet.imputed,
		taxable: sheet.taxable,
		lossCreated: sheet.lossCreated,
		reportBox: sheet.exempt ? "none" : sheet.taxable > 0 ? "3AN" : sheet.lossCreated > 0 ? "3BN" : "none",
		reportEuros: sheet.exempt ? 0 : Math.round(sheet.taxable > 0 ? sheet.taxable : sheet.lossCreated)
	} : null;
	const endHoldings = snapHoldings ?? holdings;
	const endPx = snapPx ?? px;
	const endPta = snapPta ?? pta;
	const holdingRows = [];
	for (const [asset, qty] of endHoldings) {
		if (!(qty > 1e-8)) continue;
		const market = marketPrice(opts, history, asset, period.end);
		const cost = endPx.get(asset);
		const price = market && market > 0 ? market : cost && cost > 0 ? cost : 0;
		holdingRows.push({
			asset,
			qty,
			priceEur: cents(price),
			valueEur: cents(qty * price),
			priced: Boolean(market && market > 0)
		});
	}
	holdingRows.sort((a, b) => b.valueEur - a.valueEur || a.asset.localeCompare(b.asset));
	const journal = sorted.map((move) => ({
		time: move.time,
		kind: move.kind,
		asset: move.asset,
		qty: move.qty,
		quote: move.quote,
		quoteQty: move.quoteQty,
		feeEur: move.feeEur,
		source: move.source,
		note: move.note,
		inPeriod: move.time >= period.start && move.time <= period.end
	}));
	if (simulated) pushWarn(warnings, "La simulation papier est incluse. Ne la reporte pas sur une déclaration réelle.");
	if (exempt && sheet) pushWarn(warnings, `Cessions nettes ${period.calendarYear} ≤ 305 € (ligne 218) : plus-values exonérées. La 2086 reste à déposer, sans montant en 3AN ni 3BN.`);
	if (sheet && sheet.imputed > 0) pushWarn(warnings, `Moins-values antérieures imputées : ${sheet.imputed.toLocaleString("fr-FR")} €. Le report tient compte de l'historique chargé, sur 10 ans.`);
	return {
		period,
		sourceLabel: opts.sourceLabel ?? "Activité",
		simulated,
		cessions,
		incomes,
		swapCount,
		openingPta: cents(openingPta),
		closingPta: cents(endPta),
		totalCessions,
		totalGains,
		totalLosses,
		net,
		netEuros: Math.round(net),
		yearCessions,
		yearSheets,
		declaration,
		holdings: holdingRows,
		journal,
		exempt,
		tax: exempt ? null : tax,
		indicative,
		warnings,
		incomplete: cessions.some((c) => c.incomplete) || warnings.some((w) => w.includes("incompl"))
	};
}
var ROOT = "https://api.kraken.com";
var lastNonce = 0;
function nextNonce() {
	const n = Date.now() * 1e3;
	lastNonce = n > lastNonce ? n : lastNonce + 1;
	return String(lastNonce);
}
async function callKrakenPrivate(apiKey, apiSecret, method, params = {}) {
	const key = apiKey.trim();
	const secret = apiSecret.trim();
	if (key.length < 8 || secret.length < 16) return {
		ok: false,
		message: "Clés Kraken incomplètes."
	};
	const path = `/0/private/${method}`;
	const nonce = nextNonce();
	const body = new URLSearchParams({
		nonce,
		...params
	}).toString();
	let sign;
	try {
		const hash = createHash("sha256").update(nonce + body).digest();
		const hmac = createHmac("sha512", Buffer.from(secret, "base64"));
		hmac.update(path);
		hmac.update(hash);
		sign = hmac.digest("base64");
	} catch {
		return {
			ok: false,
			message: "Secret API Kraken invalide (base64 attendu)."
		};
	}
	try {
		const res = await fetch(`${ROOT}${path}`, {
			method: "POST",
			headers: {
				"API-Key": key,
				"API-Sign": sign,
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": "Nautilus-Trading-Terminal/1.0"
			},
			body,
			signal: AbortSignal.timeout(2e4)
		});
		const json = await res.json();
		if (json.error?.length) return {
			ok: false,
			message: json.error.join(", ")
		};
		if (!res.ok) return {
			ok: false,
			message: `Kraken HTTP ${res.status}`
		};
		return {
			ok: true,
			message: "OK",
			result: json.result
		};
	} catch (err) {
		return {
			ok: false,
			message: err instanceof Error ? err.message : "Kraken injoignable"
		};
	}
}
var ASSET_MAP = {
	XXBT: "BTC",
	XBT: "BTC",
	XETH: "ETH",
	XXRP: "XRP",
	XLTC: "LTC",
	XXLM: "XLM",
	XXMR: "XMR",
	XXDG: "DOGE",
	XDG: "DOGE",
	ZEUR: "EUR",
	ZUSD: "USD"
};
function normalizeKrakenAsset(code) {
	if (ASSET_MAP[code]) return ASSET_MAP[code];
	return code.replace(/^Z(?=EUR|USD|GBP)/, "").replace(/^X(?=[A-Z]{3}$)/, "");
}
function parseKrakenBalances(raw) {
	const out = {};
	if (!raw) return out;
	for (const [code, value] of Object.entries(raw)) {
		const n = Number(value);
		if (!Number.isFinite(n) || n === 0) continue;
		const asset = normalizeKrakenAsset(code);
		out[asset] = (out[asset] ?? 0) + n;
	}
	return out;
}
function num$1(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function mapOrderType(raw) {
	switch (raw) {
		case "limit": return "limit";
		case "stop-loss":
		case "stop-loss-limit": return raw === "stop-loss-limit" ? "stop-limit" : "stop";
		case "take-profit":
		case "take-profit-limit": return "stop";
		case "trailing-stop":
		case "trailing-stop-limit": return "stop";
		default: return "market";
	}
}
function mapStatus(raw) {
	if (raw === "canceled" || raw === "expired") return "cancelled";
	if (raw === "closed") return "filled";
	if (raw === "open" || raw === "pending") return "open";
	return "rejected";
}
function parseOrder(id, raw) {
	const pair = resolvePairId(raw.descr?.pair) ?? raw.descr?.pair ?? "";
	const side = raw.descr?.type === "sell" ? "sell" : "buy";
	const lev = Number.parseInt(String(raw.descr?.leverage ?? "0"), 10);
	const created = num$1(raw.opentm) * 1e3;
	const updated = num$1(raw.closetm || raw.opentm) * 1e3;
	return {
		id,
		pair,
		side,
		type: mapOrderType(raw.descr?.ordertype),
		amount: num$1(raw.vol),
		price: num$1(raw.descr?.price) || void 0,
		stopPrice: num$1(raw.stopprice || raw.descr?.price2) || void 0,
		filled: num$1(raw.vol_exec),
		avgPrice: num$1(raw.price),
		status: mapStatus(raw.status),
		leverage: Number.isFinite(lev) && lev > 1 ? lev : 1,
		fee: num$1(raw.fee),
		createdAt: created || Date.now(),
		updatedAt: updated || created || Date.now(),
		note: raw.descr?.order
	};
}
function parseFill(id, raw) {
	return {
		id,
		orderId: raw.ordertxid ?? id,
		pair: resolvePairId(raw.pair) ?? raw.pair ?? "",
		side: raw.type === "sell" ? "sell" : "buy",
		amount: num$1(raw.vol),
		price: num$1(raw.price),
		fee: num$1(raw.fee),
		time: num$1(raw.time) * 1e3 || Date.now()
	};
}
function parsePosition(id, raw) {
	const pair = resolvePairId(raw.pair) ?? raw.pair ?? "";
	const size = Math.max(0, num$1(raw.vol) - num$1(raw.vol_closed));
	const cost = num$1(raw.cost);
	const vol = num$1(raw.vol) || 1;
	const entry = vol ? cost / vol : 0;
	const side = raw.type === "sell" ? "short" : "long";
	const margin = num$1(raw.margin);
	const leverage = margin > 0 && cost > 0 ? Math.max(1, Math.round(cost / margin)) : 1;
	const last = num$1(raw.value) && size ? num$1(raw.value) / size : entry;
	return {
		id,
		pair,
		side,
		size,
		entry,
		leverage,
		margin,
		liqPrice: side === "long" ? entry * (1 - 1 / Math.max(leverage, 1) + .05) : entry * (1 + 1 / Math.max(leverage, 1) - .05),
		peak: last,
		openedAt: num$1(raw.time) * 1e3 || Date.now()
	};
}
function krakenOrderType(input) {
	if (input.trailingPct && input.trailingPct > 0 && input.type === "stop") return {
		ordertype: "trailing-stop",
		price: `+${input.trailingPct.toFixed(2)}`
	};
	switch (input.type) {
		case "limit": return {
			ordertype: "limit",
			price: String(input.price ?? "")
		};
		case "stop": return {
			ordertype: "stop-loss",
			price: String(input.stopPrice ?? input.price ?? "")
		};
		case "stop-limit": return {
			ordertype: "stop-loss-limit",
			price: String(input.stopPrice ?? ""),
			price2: String(input.price ?? "")
		};
		default: return { ordertype: "market" };
	}
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchTradeBalance(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "TradeBalance", { asset: "ZEUR" });
	if (!res.ok || !res.result) return void 0;
	return {
		equity: num$1(res.result.eb),
		free: num$1(res.result.tf),
		margin: num$1(res.result.m),
		unrealized: num$1(res.result.n)
	};
}
async function fetchOpenOrders(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "OpenOrders");
	if (!res.ok) return [];
	return Object.entries(res.result?.open ?? {}).map(([id, raw]) => parseOrder(id, raw));
}
async function fetchClosedOrders(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "ClosedOrders");
	if (!res.ok) return [];
	return Object.entries(res.result?.closed ?? {}).map(([id, raw]) => parseOrder(id, raw));
}
async function queryKrakenOrder(keys, txid) {
	const id = txid.trim();
	if (!id) return void 0;
	for (let i = 0; i < 3; i++) {
		if (i > 0) await sleep(350);
		const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "QueryOrders", { txid: id });
		if (!res.ok || !res.result) continue;
		const raw = res.result[id] ?? Object.values(res.result)[0];
		if (!raw) continue;
		const order = parseOrder(id, raw);
		if (order.status === "filled" || order.avgPrice > 0 || order.filled > 0) return order;
		if (i === 2) return order;
	}
}
async function fetchTradesHistory(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "TradesHistory");
	if (!res.ok) return [];
	return Object.entries(res.result?.trades ?? {}).map(([id, raw]) => parseFill(id, raw)).sort((a, b) => b.time - a.time);
}
/** Full spot ledger (paginated). Needed to rebuild the French acquisition price. */
async function fetchKrakenLedgers(keys) {
	const legs = [];
	let ofs = 0;
	let count = 0;
	const maxPages = 40;
	for (let page = 0; page < maxPages; page++) {
		if (page > 0) await sleep(280);
		const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Ledgers", { ofs: String(ofs) });
		if (!res.ok || !res.result) {
			if (page === 0) return {
				ok: false,
				message: res.message,
				legs: [],
				truncated: false,
				count: 0
			};
			return {
				ok: true,
				message: res.message,
				legs,
				truncated: true,
				count
			};
		}
		count = Number(res.result.count ?? count) || count;
		const batch = Object.entries(res.result.ledger ?? {});
		if (!batch.length) break;
		for (const [id, raw] of batch) legs.push({
			id,
			refid: raw.refid || id,
			time: Math.round((Number(raw.time) || 0) * 1e3),
			type: String(raw.type || "unknown").toLowerCase(),
			asset: normalizeFiscalAsset(String(raw.asset || "")),
			amount: Number(raw.amount) || 0,
			fee: Number(raw.fee) || 0
		});
		ofs += batch.length;
		if (count > 0 && ofs >= count || batch.length < 50) break;
	}
	const truncated = count > legs.length;
	return {
		ok: true,
		message: truncated ? "Historique Kraken tronqué (2 000 écritures max)." : "Grand livre chargé",
		legs,
		truncated,
		count
	};
}
async function fetchOpenPositions(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "OpenPositions", { docalcs: "true" });
	if (!res.ok || !res.result) return [];
	return Object.entries(res.result).filter(([, raw]) => raw && typeof raw === "object").map(([id, raw]) => parsePosition(id, raw)).filter((p) => p.size > 0);
}
async function fetchEarn(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Earn/Allocations", { converted_asset: "EUR" });
	if (!res.ok || !res.result) return [];
	return (Array.isArray(res.result.items) ? res.result.items : []).map((it) => {
		const asset = normalizeKrakenAsset(String(it.native_asset ?? it.asset ?? ""));
		const amount = num$1(it.amount_allocated ?? it.amount ?? it.native_alloc?.amount);
		return {
			strategyId: String(it.strategy_id ?? it.strategyId ?? asset),
			asset,
			amount,
			apr: num$1(it.apr) || void 0,
			note: String(it.payout ?? it.type ?? "Earn")
		};
	}).filter((r) => r.asset && r.amount > 0);
}
async function fetchEarnStrategies(keys) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Earn/Strategies", { limit: "80" });
	if (!res.ok || !res.result) return [];
	return (res.result.items ?? []).map((it) => {
		const lock = it.lock_type;
		const lockType = typeof lock === "string" ? lock : String(lock?.type ?? "flex");
		const aprBlock = it.apr_estimate;
		const apr = num$1(it.apr) || num$1(aprBlock?.high) || num$1(aprBlock?.low) || void 0;
		return {
			id: String(it.id ?? it.strategy_id ?? ""),
			asset: normalizeKrakenAsset(String(it.native_asset ?? it.asset ?? "")),
			apr,
			canAllocate: it.can_allocate !== false,
			canDeallocate: it.can_deallocate !== false,
			lockType,
			note: String(it.auto_compound?.type ?? lockType)
		};
	}).filter((s) => s.id && s.asset);
}
async function allocateEarn(keys, strategyId, amount) {
	if (!(amount > 0)) return {
		ok: false,
		message: "Montant invalide."
	};
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Earn/Allocate", {
		strategy_id: strategyId,
		amount: String(amount)
	});
	if (!res.ok) return {
		ok: false,
		message: res.message
	};
	return {
		ok: true,
		message: "Allocation Earn envoyée"
	};
}
async function deallocateEarn(keys, strategyId, amount) {
	if (!(amount > 0)) return {
		ok: false,
		message: "Montant invalide."
	};
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Earn/Deallocate", {
		strategy_id: strategyId,
		amount: String(amount)
	});
	if (!res.ok) return {
		ok: false,
		message: res.message
	};
	return {
		ok: true,
		message: "Retrait Earn envoyé"
	};
}
async function fetchAccountSnapshot(keys, mode = "full") {
	const bal = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Balance");
	if (!bal.ok) return {
		ok: false,
		message: bal.message,
		balances: {},
		eur: 0,
		orders: [],
		fills: [],
		positions: [],
		earn: []
	};
	const balances = parseKrakenBalances(bal.result);
	if (mode === "light") {
		const [orders, positions] = await Promise.all([fetchOpenOrders(keys), fetchOpenPositions(keys)]);
		return {
			ok: true,
			message: "Soldes et ordres à jour",
			balances,
			eur: balances.EUR ?? 0,
			orders,
			fills: [],
			positions,
			earn: []
		};
	}
	const [trade, orders, closed, fills, positions, earn] = await Promise.all([
		fetchTradeBalance(keys),
		fetchOpenOrders(keys),
		fetchClosedOrders(keys),
		fetchTradesHistory(keys),
		fetchOpenPositions(keys),
		fetchEarn(keys)
	]);
	return {
		ok: true,
		message: "Compte Kraken synchronisé",
		balances,
		eur: balances.EUR ?? 0,
		trade,
		orders: [...orders, ...closed].slice(0, 80),
		fills: fills.slice(0, 80),
		positions,
		earn
	};
}
async function placeKrakenOrder(keys, input, opts) {
	const meta = PAIR_BY_ID[input.pair];
	if (!meta) return {
		ok: false,
		message: "Paire inconnue."
	};
	const volume = formatKrakenVolume(input.amount, meta.lotDecimals);
	if (!(Number(volume) > 0)) return {
		ok: false,
		message: "Quantité invalide."
	};
	if (Number(volume) < meta.ordermin) return {
		ok: false,
		message: `Minimum ${meta.ordermin} ${meta.base}.`
	};
	const mapped = krakenOrderType(input);
	if (mapped.ordertype !== "market" && mapped.ordertype !== "trailing-stop" && !(Number(mapped.price) > 0)) return {
		ok: false,
		message: "Prix manquant."
	};
	const params = {
		pair: input.pair,
		type: input.side,
		ordertype: mapped.ordertype,
		volume,
		oflags: "fciq"
	};
	if (mapped.price) params.price = mapped.price;
	if (mapped.price2) params.price2 = mapped.price2;
	if (input.leverage && input.leverage > 1) params.leverage = String(input.leverage);
	if (input.sl && input.sl > 0) {
		params["close[ordertype]"] = "stop-loss";
		params["close[price]"] = String(input.sl);
	} else if (input.tp && input.tp > 0) {
		params["close[ordertype]"] = "take-profit";
		params["close[price]"] = String(input.tp);
	}
	if (opts?.validate) params.validate = "true";
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "AddOrder", params);
	if (!res.ok) return {
		ok: false,
		message: res.message
	};
	const txid = res.result?.txid?.[0];
	const now = Date.now();
	const order = {
		id: txid ?? `kr-${now}`,
		pair: input.pair,
		side: input.side,
		type: input.type,
		amount: input.amount,
		price: input.price,
		stopPrice: input.stopPrice,
		filled: input.type === "market" ? input.amount : 0,
		avgPrice: input.type === "market" ? input.price ?? 0 : 0,
		status: input.type === "market" ? "filled" : "open",
		leverage: input.leverage && input.leverage > 1 ? input.leverage : 1,
		tp: input.tp,
		sl: input.sl,
		trailingPct: input.trailingPct,
		fee: 0,
		createdAt: now,
		updatedAt: now,
		note: res.result?.descr?.order
	};
	return {
		ok: true,
		message: res.result?.descr?.order ?? (opts?.validate ? "Ordre valide (non envoyé)" : "Ordre Kraken envoyé"),
		txid,
		order
	};
}
async function cancelKrakenOrder(keys, txid) {
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "CancelOrder", { txid });
	if (!res.ok) return {
		ok: false,
		message: res.message
	};
	return {
		ok: true,
		message: `Annulé (${res.result?.count ?? 1})`
	};
}
async function closeKrakenPosition(keys, pos) {
	const meta = PAIR_BY_ID[pos.pair];
	if (!meta) return {
		ok: false,
		message: "Paire inconnue."
	};
	const volume = formatKrakenVolume(pos.size, meta.lotDecimals);
	const params = {
		pair: pos.pair,
		type: pos.side === "long" ? "sell" : "buy",
		ordertype: "market",
		volume,
		oflags: "fciq"
	};
	if (pos.leverage > 1) params.leverage = String(pos.leverage);
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "AddOrder", params);
	if (!res.ok) return {
		ok: false,
		message: res.message
	};
	return {
		ok: true,
		message: res.result?.descr?.order ?? "Position clôturée",
		txid: res.result?.txid?.[0]
	};
}
async function convertDirect(keys, from, to, amount) {
	const direct = pairForAssets(from, to);
	if (!direct) return {
		ok: false,
		message: `Pas de marché ${from}/${to}.`
	};
	const meta = PAIR_BY_ID[direct.pair];
	if (!meta) return {
		ok: false,
		message: "Paire inconnue."
	};
	const volume = formatKrakenVolume(amount, meta.lotDecimals);
	if (!(Number(volume) > 0)) return {
		ok: false,
		message: "Quantité invalide."
	};
	const params = {
		pair: direct.pair,
		type: direct.side,
		ordertype: "market",
		volume,
		oflags: direct.side === "buy" ? "viqc,fciq" : "fciq"
	};
	const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "AddOrder", params);
	if (!res.ok) return {
		ok: false,
		message: res.message
	};
	return {
		ok: true,
		message: res.result?.descr?.order ?? `${from} → ${to}`,
		txid: res.result?.txid?.[0]
	};
}
async function convertKraken(keys, from, to, amount) {
	if (!(amount > 0) || from === to) return {
		ok: false,
		message: "Conversion invalide."
	};
	if (pairForAssets(from, to)) return convertDirect(keys, from, to, amount);
	const via = from === "EUR" || to === "EUR" ? "USD" : "EUR";
	if (!pairForAssets(from, via) || !pairForAssets(via, to)) return {
		ok: false,
		message: `Pas de marché ${from}/${to}.`
	};
	const viaBefore = parseKrakenBalances((await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Balance")).result)[via] ?? 0;
	const step1 = await convertDirect(keys, from, via, amount);
	if (!step1.ok) return step1;
	await sleep(1100);
	const after = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Balance");
	const received = Math.max(0, (parseKrakenBalances(after.result)[via] ?? 0) - viaBefore);
	if (!(received > 0)) return {
		ok: true,
		message: `${from} → ${via} exécuté. Relance ${via} → ${to} avec le solde reçu.`,
		txid: step1.txid
	};
	const step2 = await convertDirect(keys, via, to, received);
	if (!step2.ok) return {
		ok: false,
		message: `${from} → ${via} OK, mais ${via} → ${to} : ${step2.message}`,
		txid: step1.txid
	};
	return {
		ok: true,
		message: `${from} → ${to} via ${via}`,
		txid: step2.txid ?? step1.txid
	};
}
async function fetchDepositAddress(keys, asset) {
	const methods = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "DepositMethods", { asset });
	if (!methods.ok) return {
		ok: false,
		message: methods.message
	};
	const method = methods.result?.[0]?.method;
	if (!method) return {
		ok: false,
		message: "Aucune méthode de dépôt pour cet actif."
	};
	const addr = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "DepositAddresses", {
		asset,
		method
	});
	if (!addr.ok) return {
		ok: false,
		message: addr.message
	};
	const row = addr.result?.[0];
	if (!row?.address) return {
		ok: false,
		message: "Adresse indisponible."
	};
	return {
		ok: true,
		message: "Adresse de dépôt Kraken",
		info: {
			asset,
			method,
			address: row.address,
			tag: row.tag
		}
	};
}
var KRAKEN = "https://api.kraken.com/0/public";
var cache = /* @__PURE__ */ new Map();
async function kraken(path, ttlMs) {
	const hit = cache.get(path);
	if (hit && Date.now() - hit.at < ttlMs) return hit.data;
	try {
		const res = await fetch(`${KRAKEN}/${path}`, { headers: { "User-Agent": "Nautilus-Trading-Terminal/1.0" } });
		if (!res.ok) throw new Error(`Kraken HTTP ${res.status}`);
		const json = await res.json();
		if (json.error?.length) throw new Error(json.error.join(", "));
		cache.set(path, {
			at: Date.now(),
			data: json.result
		});
		return json.result;
	} catch (err) {
		if (hit) return hit.data;
		throw err;
	}
}
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function parseTickers(raw) {
	const out = [];
	for (const [key, t] of Object.entries(raw)) {
		const meta = PAIR_BY_RESULT[key] ?? PAIR_BY_ID[key];
		if (!meta) continue;
		const last = num(t.c?.[0]);
		const open = num(t.o);
		const change = last - open;
		const changePct = open ? change / open * 100 : 0;
		const volume = num(t.v?.[1]);
		const vwap = num(t.p?.[1]);
		out.push({
			id: meta.id,
			last,
			bid: num(t.b?.[0]),
			ask: num(t.a?.[0]),
			open,
			high: num(t.h?.[1]),
			low: num(t.l?.[1]),
			volume,
			vwap,
			change,
			changePct,
			trades: num(t.t?.[1]),
			quoteVolume: volume * vwap
		});
	}
	const rank = Object.fromEntries(PAIR_BY_ID ? Object.keys(PAIR_BY_ID).map((id, i) => [id, i]) : []);
	out.sort((a, b) => (rank[a.id] ?? 99) - (rank[b.id] ?? 99));
	return out;
}
async function getTickers() {
	return parseTickers(await kraken(`Ticker?pair=${TICKER_QUERY}`, 1800));
}
var OHLC_INTERVALS = /* @__PURE__ */ new Set([
	1,
	5,
	15,
	30,
	60,
	240,
	1440,
	10080,
	21600
]);
async function getOhlc(pair, interval, since) {
	const krakenPair = (PAIR_BY_ID[pair] ?? PAIR_BY_RESULT[pair])?.id ?? pair;
	const iv = OHLC_INTERVALS.has(interval) ? interval : 60;
	const extra = since && since > 0 ? `&since=${since}` : "";
	const raw = await kraken(`OHLC?pair=${encodeURIComponent(krakenPair)}&interval=${iv}${extra}`, since ? 2e4 : 8e3);
	return (Object.values(raw).find((v) => Array.isArray(v) && Array.isArray(v[0])) ?? []).map((row) => ({
		time: num(row[0]),
		open: num(row[1]),
		high: num(row[2]),
		low: num(row[3]),
		close: num(row[4]),
		volume: num(row[6])
	}));
}
/** Last ~720 bars. Drops the uncommitted current frame. `since` never rewinds on Kraken. */
async function getOhlcHistory(pair, interval, since, days) {
	const now = Math.floor(Date.now() / 1e3);
	const span = days && days > 0 ? days : (now - Math.max(0, since)) / 86400;
	const used = backtestFetchInterval(span, interval);
	const raw = await getOhlc(pair, used);
	if (raw.length === 0) return {
		candles: [],
		interval: used
	};
	const frameSec = used * 60;
	const frameStart = Math.floor(now / frameSec) * frameSec;
	const committed = raw[raw.length - 1].time >= frameStart ? raw.slice(0, -1) : raw;
	const cut = since > 0 ? since : now - Math.round(span) * 86400;
	const windowed = committed.filter((c) => c.time >= cut);
	return {
		candles: windowed.length ? windowed : committed,
		interval: used
	};
}
function levels(rows, side) {
	const sorted = [...rows].map((r) => ({
		price: num(r[0]),
		size: num(r[1]),
		total: 0
	})).sort((a, b) => side === "bid" ? b.price - a.price : a.price - b.price);
	let acc = 0;
	return sorted.map((l) => {
		acc += l.size;
		return {
			...l,
			total: acc
		};
	});
}
async function getDepth(pair) {
	const raw = await kraken(`Depth?pair=${encodeURIComponent(pair)}&count=500`, 1200);
	const book = Object.values(raw)[0] ?? {
		bids: [],
		asks: []
	};
	const bids = levels(book.bids ?? [], "bid");
	const asks = levels(book.asks ?? [], "ask");
	const bestBid = bids[0]?.price ?? 0;
	const bestAsk = asks[0]?.price ?? 0;
	const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
	const mid = (bestAsk + bestBid) / 2;
	return {
		bids,
		asks,
		spread,
		spreadPct: mid ? spread / mid * 100 : 0
	};
}
async function getTrades(pair) {
	const raw = await kraken(`Trades?pair=${encodeURIComponent(pair)}`, 1500);
	return (Object.values(raw).find((v) => Array.isArray(v) && Array.isArray(v[0])) ?? []).slice(-40).reverse().map((row, i) => ({
		id: String(row[6] ?? `${row[2]}-${i}`),
		price: num(row[0]),
		size: num(row[1]),
		side: row[3] === "b" ? "buy" : "sell",
		time: Math.round(num(row[2]) * 1e3)
	}));
}
async function pingKraken() {
	const t0 = Date.now();
	await kraken("Time", 5e3);
	return {
		ok: true,
		ms: Date.now() - t0
	};
}
//#endregion
export { defaultSize as $, pingKraken as A, uid as At, RISK_PRESETS as B, toEurPair as Bt, legsFromKrakenCsv as C, previewSignal as Ct, parisMonth as D, rsi as Dt, parisDate as E, riskPresetFor as Et, BOT_KIND_BY_ID as F, INTERVALS as Ft, bollinger as G, applyPaperFill as H, DCA_INTERVALS as I, PAIR_BY_ID as It, botInventoryQty as J, botBlueprint as K, DEFAULT_PAPER as L, PAIR_UNIVERSE as Lt, queryKrakenOrder as M, walkForward as Mt, resolvePeriod as N, DEFAULT_PAIR as Nt, parisYear as O, snapshotEquity as Ot, BOT_CANDLE_INTERVALS as P, EUR_PAIRS as Pt, defaultParams as Q, EMPTY_STATS as R, backtestFetchInterval as Rt, getTrades as S, parseDecimal as St, movesFromLedgers as T, resetPaperAccount as Tt, atr as U, applyGridPreset as V, backtestBot as W, botWinRate as X, botMark as Y, compareStrategies as Z, formatFiscalDate as _, macd as _t, closeKrakenPosition as a, formatCompact as at, getOhlcHistory as b, paperEquity as bt, fetchAccountSnapshot as c, formatKrakenVolume as ct, fetchEarn as d, formatQty as dt, dropFormingCandle as et, fetchEarnStrategies as f, formatTime as ft, fetchTradesHistory as g, kindTitle as gt, fetchOpenPositions as h, kindNeedsCandles as ht, cancelKrakenOrder as i, flattenPaper as it, placeKrakenOrder as j, vwap as jt, parseKrakenBalances as k, stochastic as kt, fetchClosedOrders as l, formatPct as lt, fetchOpenOrders as m, gridFeePadPct as mt, buildFiscalReport as n, evaluateBot as nt, convertKraken as o, formatDateTime as ot, fetchKrakenLedgers as p, gridChartLevels as pt, botDeployed as q, callKrakenPrivate as r, evaluateDesk as rt, deallocateEarn as s, formatFiat as st, allocateEarn as t, ema as tt, fetchDepositAddress as u, formatPrice as ut, getDepth as v, monteCarloPnl as vt, movesFromFills as w, profitDefaults as wt, getTickers as x, parseBotBlueprints as xt, getOhlc as y, optimizeBot as yt, GRID_PRESETS as z, intervalLabel as zt };
