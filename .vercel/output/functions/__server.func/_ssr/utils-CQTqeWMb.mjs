import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as number, c as string, n as array, o as object, r as boolean, s as record, t as _enum, u as unknown } from "../_libs/zod.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CQTqeWMb.js
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
var krakenSnapshot = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ mode: _enum(["light", "full"]).optional() })).handler(createSsrRpc("bcb2d0fa6e283f20bfcba8febbee317e1d65ca355196a735562beec035d7f722"));
var krakenLedgers = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(createSsrRpc("1f5031045d7dfde4dd05733b34cbd428ecf97735cac7691b8a6938d33a6b3c78"));
var krakenAddOrder = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	pair: string(),
	side: _enum(["buy", "sell"]),
	volume: string(),
	validate: boolean().optional()
})).handler(createSsrRpc("295860f06ccc7b1a0871bbebec83dd9f3efbae5f2492ac46948d6c60b77029b7"));
var krakenQueryOrder = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ txid: string().min(1) })).handler(createSsrRpc("d1b6bf64e87ecc30dafbb641cfae01167401bc1e188f15cff552a61e3ddfd51f"));
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
var krakenPlaceOrder = createServerFn({ method: "POST" }).validator(PlaceBody).handler(createSsrRpc("df1873452f8cacf055e215fb3004e3097fa0af9973e4dfe5456ca13c2dcd4ea4"));
var krakenCancel = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ txid: string().min(1) })).handler(createSsrRpc("28c024e96e7923b6d874ded4d78b28043c521c7ced163aeddf464ba5d0a612cc"));
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
})).handler(createSsrRpc("d8e572b1f91c693dda76058b57e7f065b945cafa64edec5f1f24ac6e5c772889"));
var krakenConvert = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	from: string(),
	to: string(),
	amount: number().positive()
})).handler(createSsrRpc("a3fef20eac27eebe9d80833157b2063f0deb475289e6bf42c56ccac20fe477c6"));
createServerFn({ method: "POST" }).validator(KrakenAuth).handler(createSsrRpc("ab9fcf7f9963c04ed0b8b8eca74b4b641d796dd9a5e3413fc7fa8fa5046594b9"));
var krakenEarn = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(createSsrRpc("3df8c4f6dd1a72373796cf9e5b07ef7b494c26843363c1a0561d3aaf5e7919a2"));
var krakenEarnStrategies = createServerFn({ method: "POST" }).validator(KrakenAuth).handler(createSsrRpc("9d68835ceec0cf4a0d10bfa854694ed44b29d3cd8ca82446dc99e0fbe9f75a84"));
var krakenEarnAllocate = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	strategyId: string().min(1),
	amount: number().positive()
})).handler(createSsrRpc("627b3d5db6cd75b85837d5209604a8934b598f13531f72e6e7b68749f8f40eda"));
var krakenEarnDeallocate = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({
	strategyId: string().min(1),
	amount: number().positive()
})).handler(createSsrRpc("4b216ca4ccf94cde3e8c3c989ad7cb9b3f86278ff1a84f9fc8e777b0bc264add"));
var krakenDeposit = createServerFn({ method: "POST" }).validator(KrakenAuth.extend({ asset: string().min(2).max(12) })).handler(createSsrRpc("bc74ad6ecdc67d214bfa6b34fc17a9d638833852db05f26f3ba7b238a9eaace0"));
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
createServerFn({ method: "POST" }).validator(object({
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
})).handler(createSsrRpc("51b6c530de93bda0ee3a8dbd7dbbb8536dcb792f349e09f7774cc59909a589d1"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { krakenEarnStrategies as _, fetchOhlcHistory as a, krakenQueryOrder as b, krakenAddOrder as c, krakenClosePosition as d, krakenConvert as f, krakenEarnDeallocate as g, krakenEarnAllocate as h, fetchOhlc as i, krakenBalance as l, krakenEarn as m, fetchDepth as n, fetchTape as o, krakenDeposit as p, fetchKrakenStatus as r, fetchTickers as s, cn as t, krakenCancel as u, krakenLedgers as v, krakenSnapshot as x, krakenPlaceOrder as y };
