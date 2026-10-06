import { A as pingKraken, M as queryKrakenOrder, R as EMPTY_STATS, S as getTrades, a as closeKrakenPosition, b as getOhlcHistory, c as fetchAccountSnapshot, d as fetchEarn, f as fetchEarnStrategies, i as cancelKrakenOrder, j as placeKrakenOrder, k as parseKrakenBalances, m as fetchOpenOrders, nt as evaluateBot, o as convertKraken, p as fetchKrakenLedgers, r as callKrakenPrivate, s as deallocateEarn, t as allocateEarn, u as fetchDepositAddress, v as getDepth, x as getTickers, y as getOhlc } from "./kraken.server-CQDHT3_G.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as number, c as string, n as array, o as object, r as boolean, s as record, t as _enum, u as unknown } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-Beq-iJgl.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var krakenSnapshot_createServerFn_handler = createServerRpc({
	id: "bcb2d0fa6e283f20bfcba8febbee317e1d65ca355196a735562beec035d7f722",
	name: "krakenSnapshot",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenSnapshot.__executeServer(opts));
var krakenSnapshot = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ mode: _enum(["light", "full"]).optional() })).handler(krakenSnapshot_createServerFn_handler, async ({ data }) => {
	return fetchAccountSnapshot(data, data.mode ?? "full");
});
var krakenLedgers_createServerFn_handler = createServerRpc({
	id: "1f5031045d7dfde4dd05733b34cbd428ecf97735cac7691b8a6938d33a6b3c78",
	name: "krakenLedgers",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenLedgers.__executeServer(opts));
var krakenLedgers = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(krakenLedgers_createServerFn_handler, async ({ data }) => {
	return fetchKrakenLedgers(data);
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
var krakenQueryOrder_createServerFn_handler = createServerRpc({
	id: "d1b6bf64e87ecc30dafbb641cfae01167401bc1e188f15cff552a61e3ddfd51f",
	name: "krakenQueryOrder",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenQueryOrder.__executeServer(opts));
var krakenQueryOrder = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ txid: string().min(1) })).handler(krakenQueryOrder_createServerFn_handler, async ({ data }) => {
	const order = await queryKrakenOrder({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, data.txid);
	if (!order) return {
		ok: false,
		message: "Ordre introuvable",
		order: void 0
	};
	return {
		ok: true,
		message: "OK",
		order
	};
});
var PlaceBody = KrakenAuth.extend({
	pair: string(),
	side: _enum(["buy", "sell"]),
	type: _enum([
		"market",
		"limit",
		"stop",
		"stop-limit"
	]),
	amount: number().positive(),
	price: number().optional(),
	stopPrice: number().optional(),
	leverage: number().optional(),
	tp: number().optional(),
	sl: number().optional(),
	trailingPct: number().optional(),
	note: string().optional(),
	validate: boolean().optional()
});
var krakenPlaceOrder_createServerFn_handler = createServerRpc({
	id: "df1873452f8cacf055e215fb3004e3097fa0af9973e4dfe5456ca13c2dcd4ea4",
	name: "krakenPlaceOrder",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenPlaceOrder.__executeServer(opts));
var krakenPlaceOrder = createServerFn({ method: "POST" }).validator(PlaceBody).handler(krakenPlaceOrder_createServerFn_handler, async ({ data }) => {
	const input = {
		pair: data.pair,
		side: data.side,
		type: data.type,
		amount: data.amount,
		price: data.price,
		stopPrice: data.stopPrice,
		leverage: data.leverage,
		tp: data.tp,
		sl: data.sl,
		trailingPct: data.trailingPct,
		note: data.note
	};
	return placeKrakenOrder({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, input, { validate: data.validate });
});
var krakenCancel_createServerFn_handler = createServerRpc({
	id: "28c024e96e7923b6d874ded4d78b28043c521c7ced163aeddf464ba5d0a612cc",
	name: "krakenCancel",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenCancel.__executeServer(opts));
var krakenCancel = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ txid: string().min(1) })).handler(krakenCancel_createServerFn_handler, async ({ data }) => {
	return cancelKrakenOrder({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, data.txid);
});
var krakenClosePosition_createServerFn_handler = createServerRpc({
	id: "d8e572b1f91c693dda76058b57e7f065b945cafa64edec5f1f24ac6e5c772889",
	name: "krakenClosePosition",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenClosePosition.__executeServer(opts));
var krakenClosePosition = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	id: string(),
	pair: string(),
	side: _enum(["long", "short"]),
	size: number().positive(),
	leverage: number(),
	entry: number(),
	margin: number(),
	liqPrice: number(),
	openedAt: number(),
	peak: number().optional()
})).handler(krakenClosePosition_createServerFn_handler, async ({ data }) => {
	const pos = {
		id: data.id,
		pair: data.pair,
		side: data.side,
		size: data.size,
		entry: data.entry,
		leverage: data.leverage,
		margin: data.margin,
		liqPrice: data.liqPrice,
		peak: data.peak ?? data.entry,
		openedAt: data.openedAt
	};
	return closeKrakenPosition({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, pos);
});
var krakenConvert_createServerFn_handler = createServerRpc({
	id: "a3fef20eac27eebe9d80833157b2063f0deb475289e6bf42c56ccac20fe477c6",
	name: "krakenConvert",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenConvert.__executeServer(opts));
var krakenConvert = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	from: string(),
	to: string(),
	amount: number().positive()
})).handler(krakenConvert_createServerFn_handler, async ({ data }) => {
	return convertKraken({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, data.from, data.to, data.amount);
});
var krakenOpenOrders_createServerFn_handler = createServerRpc({
	id: "ab9fcf7f9963c04ed0b8b8eca74b4b641d796dd9a5e3413fc7fa8fa5046594b9",
	name: "krakenOpenOrders",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenOpenOrders.__executeServer(opts));
var krakenOpenOrders = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(krakenOpenOrders_createServerFn_handler, async ({ data }) => {
	const orders = await fetchOpenOrders(data);
	return {
		ok: true,
		message: "OK",
		count: orders.length,
		orders
	};
});
var krakenEarn_createServerFn_handler = createServerRpc({
	id: "3df8c4f6dd1a72373796cf9e5b07ef7b494c26843363c1a0561d3aaf5e7919a2",
	name: "krakenEarn",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenEarn.__executeServer(opts));
var krakenEarn = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(krakenEarn_createServerFn_handler, async ({ data }) => {
	return {
		ok: true,
		message: "OK",
		rows: await fetchEarn(data)
	};
});
var krakenEarnStrategies_createServerFn_handler = createServerRpc({
	id: "9d68835ceec0cf4a0d10bfa854694ed44b29d3cd8ca82446dc99e0fbe9f75a84",
	name: "krakenEarnStrategies",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenEarnStrategies.__executeServer(opts));
var krakenEarnStrategies = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(krakenEarnStrategies_createServerFn_handler, async ({ data }) => {
	return {
		ok: true,
		message: "OK",
		rows: await fetchEarnStrategies(data)
	};
});
var krakenEarnAllocate_createServerFn_handler = createServerRpc({
	id: "627b3d5db6cd75b85837d5209604a8934b598f13531f72e6e7b68749f8f40eda",
	name: "krakenEarnAllocate",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenEarnAllocate.__executeServer(opts));
var krakenEarnAllocate = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	strategyId: string().min(1),
	amount: number().positive()
})).handler(krakenEarnAllocate_createServerFn_handler, async ({ data }) => {
	return allocateEarn({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, data.strategyId, data.amount);
});
var krakenEarnDeallocate_createServerFn_handler = createServerRpc({
	id: "4b216ca4ccf94cde3e8c3c989ad7cb9b3f86278ff1a84f9fc8e777b0bc264add",
	name: "krakenEarnDeallocate",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenEarnDeallocate.__executeServer(opts));
var krakenEarnDeallocate = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	strategyId: string().min(1),
	amount: number().positive()
})).handler(krakenEarnDeallocate_createServerFn_handler, async ({ data }) => {
	return deallocateEarn({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, data.strategyId, data.amount);
});
var krakenDeposit_createServerFn_handler = createServerRpc({
	id: "bc74ad6ecdc67d214bfa6b34fc17a9d638833852db05f26f3ba7b238a9eaace0",
	name: "krakenDeposit",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenDeposit.__executeServer(opts));
var krakenDeposit = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ asset: string().min(2).max(12) })).handler(krakenDeposit_createServerFn_handler, async ({ data }) => {
	return fetchDepositAddress({
		apiKey: data.apiKey,
		apiSecret: data.apiSecret
	}, data.asset);
});
var BotKindSchema = _enum([
	"grid",
	"dca",
	"rsi",
	"ema",
	"bollinger",
	"macd",
	"stoch",
	"vwap",
	"breakout",
	"supertrend",
	"volume",
	"scalp",
	"cci",
	"meanrev",
	"keltner",
	"roc",
	"adx",
	"williams",
	"ichimoku",
	"psar",
	"sma",
	"ha",
	"mfi",
	"engulf",
	"obv",
	"div"
]);
var krakenEvaluateBot_createServerFn_handler = createServerRpc({
	id: "51b6c530de93bda0ee3a8dbd7dbbb8536dcb792f349e09f7774cc59909a589d1",
	name: "krakenEvaluateBot",
	filename: "src/lib/trading/functions.ts"
}, (opts) => krakenEvaluateBot.__executeServer(opts));
var krakenEvaluateBot = createServerFn({ method: "POST" }).validator(object({
	kind: BotKindSchema,
	pair: string(),
	interval: number(),
	sizeQuote: number().positive(),
	params: record(string(), unknown()),
	runtime: record(string(), unknown()).optional(),
	ticker: object({
		id: string(),
		last: number(),
		bid: number(),
		ask: number(),
		open: number(),
		high: number(),
		low: number(),
		volume: number(),
		vwap: number(),
		change: number(),
		changePct: number(),
		trades: number(),
		quoteVolume: number()
	}),
	candles: array(object({
		time: number(),
		open: number(),
		high: number(),
		low: number(),
		close: number(),
		volume: number()
	})).optional(),
	equity: number().optional()
})).handler(krakenEvaluateBot_createServerFn_handler, async ({ data }) => {
	const bot = {
		id: "eval",
		name: "eval",
		kind: data.kind,
		venue: "live",
		status: "running",
		pair: data.pair,
		interval: data.interval,
		sizeQuote: data.sizeQuote,
		params: data.params,
		createdAt: 0,
		lastNote: "",
		stats: { ...EMPTY_STATS },
		runtime: data.runtime ?? {}
	};
	const result = evaluateBot(bot, {
		now: Date.now(),
		ticker: data.ticker,
		candles: data.candles,
		equity: data.equity,
		closedOnly: true
	});
	return {
		ok: true,
		message: result.note,
		fills: result.fills,
		runtime: result.runtime
	};
});
//#endregion
export { fetchDepth_createServerFn_handler, fetchKrakenStatus_createServerFn_handler, fetchOhlcHistory_createServerFn_handler, fetchOhlc_createServerFn_handler, fetchTape_createServerFn_handler, fetchTickers_createServerFn_handler, krakenAddOrder_createServerFn_handler, krakenBalance_createServerFn_handler, krakenCancel_createServerFn_handler, krakenClosePosition_createServerFn_handler, krakenConvert_createServerFn_handler, krakenDeposit_createServerFn_handler, krakenEarnAllocate_createServerFn_handler, krakenEarnDeallocate_createServerFn_handler, krakenEarnStrategies_createServerFn_handler, krakenEarn_createServerFn_handler, krakenEvaluateBot_createServerFn_handler, krakenLedgers_createServerFn_handler, krakenOpenOrders_createServerFn_handler, krakenPlaceOrder_createServerFn_handler, krakenQueryOrder_createServerFn_handler, krakenSnapshot_createServerFn_handler };
