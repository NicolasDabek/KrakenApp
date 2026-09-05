import { a as PAIR_BY_RESULT, c as backtestFetchInterval, i as PAIR_BY_ID, s as TICKER_QUERY } from "./pairs-DHGeMw8F.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as object, i as number, n as boolean, o as string, t as _enum } from "../_libs/zod.mjs";
import { createHash, createHmac } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-DRWSMmh4.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
async function getOhlc(pair, interval, since) {
	const extra = since && since > 0 ? `&since=${since}` : "";
	const raw = await kraken(`OHLC?pair=${encodeURIComponent(pair)}&interval=${interval}${extra}`, since ? 2e4 : 8e3);
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
	const raw = await kraken(`Depth?pair=${encodeURIComponent(pair)}&count=24`, 1200);
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
var fetchTickers_createServerFn_handler = createServerRpc({
	id: "e16641418aeb50959e3d1284bbc9dd597e614fce64673f9adb36d0ee53b07be0",
	name: "fetchTickers",
	filename: "src/lib/trading/functions.ts"
}, (opts) => fetchTickers.__executeServer(opts));
var fetchTickers = createServerFn({ method: "GET" }).handler(fetchTickers_createServerFn_handler, async () => {
	return getTickers();
});
var fetchOhlc_createServerFn_handler = createServerRpc({
	id: "8772bde06fd3b1b686b3346c87fead6921b0fb6576e05303090fdf81b8786fc8",
	name: "fetchOhlc",
	filename: "src/lib/trading/functions.ts"
}, (opts) => fetchOhlc.__executeServer(opts));
var fetchOhlc = createServerFn({ method: "GET" }).validator(object({
	pair: string(),
	interval: number()
})).handler(fetchOhlc_createServerFn_handler, async ({ data }) => {
	return getOhlc(data.pair, data.interval);
});
var fetchOhlcHistory_createServerFn_handler = createServerRpc({
	id: "1099c53d3ec617e217b8324f62489c20d06fd0cd92c18b84dffcc8dfa3d607ab",
	name: "fetchOhlcHistory",
	filename: "src/lib/trading/functions.ts"
}, (opts) => fetchOhlcHistory.__executeServer(opts));
var fetchOhlcHistory = createServerFn({ method: "GET" }).validator(object({
	pair: string(),
	interval: number(),
	since: number(),
	days: number().optional()
})).handler(fetchOhlcHistory_createServerFn_handler, async ({ data }) => {
	return getOhlcHistory(data.pair, data.interval, data.since, data.days);
});
var fetchDepth_createServerFn_handler = createServerRpc({
	id: "9be116d3b8b632e923a3646001b672c20e3e643bc52de74a8a2414ab23a2d2f8",
	name: "fetchDepth",
	filename: "src/lib/trading/functions.ts"
}, (opts) => fetchDepth.__executeServer(opts));
var fetchDepth = createServerFn({ method: "GET" }).validator(object({ pair: string() })).handler(fetchDepth_createServerFn_handler, async ({ data }) => {
	return getDepth(data.pair);
});
var fetchTape_createServerFn_handler = createServerRpc({
	id: "f9fe717c7f772686ea2785ca1940f9df0d41261ec4ba590c7f11e547a983765e",
	name: "fetchTape",
	filename: "src/lib/trading/functions.ts"
}, (opts) => fetchTape.__executeServer(opts));
var fetchTape = createServerFn({ method: "GET" }).validator(object({ pair: string() })).handler(fetchTape_createServerFn_handler, async ({ data }) => {
	return getTrades(data.pair);
});
var fetchKrakenStatus_createServerFn_handler = createServerRpc({
	id: "0ca6acfa61d32a187269693f72acf34a0e5e2ac80171b1abb7806ea4608c6af7",
	name: "fetchKrakenStatus",
	filename: "src/lib/trading/functions.ts"
}, (opts) => fetchKrakenStatus.__executeServer(opts));
var fetchKrakenStatus = createServerFn({ method: "GET" }).handler(fetchKrakenStatus_createServerFn_handler, async () => {
	return pingKraken();
});
var KrakenAuth = object({
	apiKey: string().min(4),
	apiSecret: string().min(8)
});
var krakenBalance_createServerFn_handler = createServerRpc({
	id: "5045e2c37d5a791ac2e0adc2f4eda7dc334496191d3d42c1c93179d879a11bde",
	name: "krakenBalance",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenBalance.__executeServer(opts));
var krakenBalance = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(krakenBalance_createServerFn_handler, async ({ data }) => {
	const res = await callKrakenPrivate(data.apiKey, data.apiSecret, "Balance");
	if (!res.ok) return {
		ok: false,
		message: res.message,
		balances: {},
		eur: 0
	};
	const balances = parseKrakenBalances(res.result);
	return {
		ok: true,
		message: "Clés Kraken valides",
		balances,
		eur: balances.EUR ?? 0
	};
});
var krakenAddOrder_createServerFn_handler = createServerRpc({
	id: "295860f06ccc7b1a0871bbebec83dd9f3efbae5f2492ac46948d6c60b77029b7",
	name: "krakenAddOrder",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenAddOrder.__executeServer(opts));
var krakenAddOrder = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	pair: string(),
	side: _enum(["buy", "sell"]),
	volume: string(),
	validate: boolean().optional()
})).handler(krakenAddOrder_createServerFn_handler, async ({ data }) => {
	const params = {
		pair: data.pair,
		type: data.side,
		ordertype: "market",
		volume: data.volume,
		oflags: "fciq"
	};
	if (data.validate) params.validate = "true";
	const res = await callKrakenPrivate(data.apiKey, data.apiSecret, "AddOrder", params);
	if (!res.ok) return {
		ok: false,
		message: res.message,
		txid: void 0
	};
	return {
		ok: true,
		message: res.result?.descr?.order ?? (data.validate ? "Ordre valide (non envoyé)" : "Ordre Kraken envoyé"),
		txid: res.result?.txid?.[0]
	};
});
var krakenOpenOrders_createServerFn_handler = createServerRpc({
	id: "ab9fcf7f9963c04ed0b8b8eca74b4b641d796dd9a5e3413fc7fa8fa5046594b9",
	name: "krakenOpenOrders",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenOpenOrders.__executeServer(opts));
var krakenOpenOrders = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(krakenOpenOrders_createServerFn_handler, async ({ data }) => {
	const res = await callKrakenPrivate(data.apiKey, data.apiSecret, "OpenOrders");
	if (!res.ok) return {
		ok: false,
		message: res.message,
		count: 0
	};
	return {
		ok: true,
		message: "OK",
		count: Object.keys(res.result?.open ?? {}).length
	};
});
//#endregion
export { fetchDepth_createServerFn_handler, fetchKrakenStatus_createServerFn_handler, fetchOhlcHistory_createServerFn_handler, fetchOhlc_createServerFn_handler, fetchTape_createServerFn_handler, fetchTickers_createServerFn_handler, krakenAddOrder_createServerFn_handler, krakenBalance_createServerFn_handler, krakenOpenOrders_createServerFn_handler };
