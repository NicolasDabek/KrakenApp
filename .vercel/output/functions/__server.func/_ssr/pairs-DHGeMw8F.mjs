//#region node_modules/.nitro/vite/services/ssr/assets/pairs-DHGeMw8F.js
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
function intervalLabel(id) {
	return INTERVALS.find((i) => i.id === id)?.label ?? `${id}m`;
}
//#endregion
export { PAIR_BY_RESULT as a, backtestFetchInterval as c, PAIR_BY_ID as i, intervalLabel as l, EUR_PAIRS as n, PAIR_UNIVERSE as o, INTERVALS as r, TICKER_QUERY as s, DEFAULT_PAIR as t, toEurPair as u };
