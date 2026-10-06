import { i as __toESM } from "../_runtime.mjs";
import { A as pingKraken, At as uid, Bt as toEurPair, H as applyPaperFill, It as PAIR_BY_ID, J as botInventoryQty, L as DEFAULT_PAPER, Nt as DEFAULT_PAIR, Ot as snapshotEquity, R as EMPTY_STATS, S as getTrades, Tt as resetPaperAccount, Y as botMark, a as closeKrakenPosition, b as getOhlcHistory, bt as paperEquity, c as fetchAccountSnapshot, ct as formatKrakenVolume, d as fetchEarn, et as dropFormingCandle, f as fetchEarnStrategies, g as fetchTradesHistory, gt as kindTitle, h as fetchOpenPositions, ht as kindNeedsCandles, i as cancelKrakenOrder, it as flattenPaper, j as placeKrakenOrder, k as parseKrakenBalances, l as fetchClosedOrders, m as fetchOpenOrders, nt as evaluateBot, o as convertKraken, r as callKrakenPrivate, rt as evaluateDesk, s as deallocateEarn, t as allocateEarn, u as fetchDepositAddress, v as getDepth, x as getTickers, xt as parseBotBlueprints, y as getOhlc } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, S as useRouter, _ as Outlet, b as createRootRoute, f as Scripts, g as createRouter, m as useRouterState, p as HeadContent, v as lazyRouteComponent, x as Link, y as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as number, c as string, i as literal, l as union, o as object } from "../_libs/zod.mjs";
import { b as krakenQueryOrder, c as krakenAddOrder, d as krakenClosePosition, f as krakenConvert, i as fetchOhlc, l as krakenBalance, n as fetchDepth, o as fetchTape, s as fetchTickers, t as cn, u as krakenCancel, x as krakenSnapshot, y as krakenPlaceOrder } from "./utils-CQTqeWMb.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { $ as Briefcase, A as ListOrdered, Z as ChartCandlestick, et as Bot, j as LayoutGrid, o as TriangleAlert, ot as ArrowLeftRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-CM7_unS8.js
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
	takerFee: TAKER,
	notifyFills: false,
	resumeLive: false,
	watchdog: true,
	deskDailyLoss: 0,
	deskDrawdownPct: 0,
	deskMaxExposurePct: 0
};
var DEFAULT_CONNECTION = {
	baseUrl: "",
	apiKey: "",
	apiSecret: ""
};
function cloneBalances(list) {
	return list.map((b) => ({ ...b }));
}
function pingFill(settings, title, body) {
	if (!settings.notifyFills || typeof Notification === "undefined") return;
	if (Notification.permission !== "granted") return;
	try {
		new Notification(title, { body });
	} catch {}
}
function snapshotRuntime(runtime) {
	const copy = { ...runtime };
	delete copy.flightPrev;
	delete copy.inFlight;
	delete copy.inFlightAt;
	return copy;
}
function restoreFlight(runtime) {
	if (!runtime.flightPrev) return {
		...runtime,
		inFlight: false,
		inFlightAt: void 0
	};
	return {
		...runtime.flightPrev,
		inFlight: false,
		inFlightAt: void 0,
		flightPrev: void 0
	};
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
function withLog(bot, text, side) {
	return {
		...bot,
		log: [{
			t: Date.now(),
			text,
			side
		}, ...bot.log ?? []].slice(0, 40)
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
	krakenOrders: [],
	krakenFills: [],
	krakenPositions: [],
	deskPeakPaper: DEFAULT_PAPER.startingBalance,
	deskPeakLive: 0,
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
	placeLiveOrder: async (input) => {
		const { apiKey, apiSecret } = get().connection;
		if (!apiKey || !apiSecret) return {
			ok: false,
			message: "Clés Kraken manquantes."
		};
		const last = get().tickers[input.pair]?.last ?? input.price ?? 0;
		const res = await krakenPlaceOrder({ data: {
			apiKey,
			apiSecret,
			pair: input.pair,
			side: input.side,
			type: input.type,
			amount: input.amount,
			price: input.price ?? last,
			stopPrice: input.stopPrice,
			leverage: input.leverage,
			tp: input.tp,
			sl: input.sl,
			trailingPct: input.trailingPct,
			note: input.note
		} });
		if (!res.ok) {
			toast.message("Kraken a refusé l’ordre", { description: res.message });
			return {
				ok: false,
				message: res.message
			};
		}
		if (res.order) set({ krakenOrders: [res.order, ...get().krakenOrders.filter((o) => o.id !== res.order.id)].slice(0, 80) });
		toast.success("Ordre Kraken", { description: res.message });
		get().syncKraken("light");
		return {
			ok: true,
			message: res.message,
			order: res.order
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
	cancelLiveOrder: async (id) => {
		const { apiKey, apiSecret } = get().connection;
		if (!apiKey || !apiSecret) return {
			ok: false,
			message: "Clés Kraken manquantes."
		};
		const res = await krakenCancel({ data: {
			apiKey,
			apiSecret,
			txid: id
		} });
		if (!res.ok) {
			toast.message("Annulation refusée", { description: res.message });
			return res;
		}
		set({ krakenOrders: get().krakenOrders.map((o) => o.id === id ? {
			...o,
			status: "cancelled",
			updatedAt: Date.now()
		} : o) });
		toast.message("Ordre annulé");
		get().syncKraken("light");
		return res;
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
	closeLivePosition: async (id) => {
		const pos = get().krakenPositions.find((p) => p.id === id) ?? get().positions.find((p) => p.id === id);
		if (!pos) return {
			ok: false,
			message: "Position introuvable."
		};
		const { apiKey, apiSecret } = get().connection;
		if (!apiKey || !apiSecret) return {
			ok: false,
			message: "Clés Kraken manquantes."
		};
		const res = await krakenClosePosition({ data: {
			apiKey,
			apiSecret,
			id: pos.id,
			pair: pos.pair,
			side: pos.side,
			size: pos.size,
			leverage: pos.leverage,
			entry: pos.entry,
			margin: pos.margin,
			liqPrice: pos.liqPrice,
			openedAt: pos.openedAt,
			peak: pos.peak
		} });
		if (!res.ok) {
			toast.message("Clôture refusée", { description: res.message });
			return res;
		}
		toast.success("Position clôturée", { description: res.message });
		get().syncKraken("light");
		return res;
	},
	addAlert: (alert) => {
		const armPrice = get().tickers[alert.pair]?.last;
		set({ alerts: [{
			...alert,
			id: uid("al"),
			createdAt: Date.now(),
			armPrice
		}, ...get().alerts] });
	},
	removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
	rearmAlert: (id) => set({ alerts: get().alerts.map((a) => a.id === id ? {
		...a,
		triggeredAt: void 0,
		armPrice: get().tickers[a.pair]?.last ?? a.armPrice
	} : a) }),
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
	convertLive: async (from, to, amount) => {
		const { apiKey, apiSecret } = get().connection;
		if (!apiKey || !apiSecret) return {
			ok: false,
			message: "Clés Kraken manquantes."
		};
		const res = await krakenConvert({ data: {
			apiKey,
			apiSecret,
			from,
			to,
			amount
		} });
		if (!res.ok) {
			toast.message("Conversion refusée", { description: res.message });
			return res;
		}
		toast.success("Conversion Kraken", { description: res.message });
		get().syncKraken("light");
		return res;
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
			if (al.armPrice == null || !Number.isFinite(al.armPrice)) return {
				...al,
				armPrice: t.last
			};
			const prev = al.armPrice;
			if (!(al.condition === "above" ? prev < al.price && t.last >= al.price : prev > al.price && t.last <= al.price)) return {
				...al,
				armPrice: t.last
			};
			changed = true;
			toast("Alerte prix", { description: `${PAIR_BY_ID[al.pair]?.display} ${al.condition === "above" ? "≥" : "≤"} ${al.price}` });
			return {
				...al,
				triggeredAt: now,
				armPrice: t.last
			};
		});
		for (const plan of nextRecurring) {
			if (!plan.active || plan.nextAt > now) continue;
			const t = tickers[plan.pair];
			const meta = PAIR_BY_ID[plan.pair];
			if (!t?.last || !meta) continue;
			const amount = plan.amountQuote / t.last;
			if (amount < meta.ordermin) continue;
			if (Boolean(get().connection.apiKey && get().connection.apiSecret)) {
				plan.nextAt = now + (plan.cadence === "daily" ? 864e5 : 6048e5);
				changed = true;
				get().placeLiveOrder({
					pair: plan.pair,
					side: "buy",
					type: "market",
					amount,
					note: "DCA"
				});
				continue;
			}
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
			runtime: {},
			log: [{
				t: Date.now(),
				text: "Créé."
			}]
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
		if (bot.runtime.inFlight) {
			toast.message("Un ordre Kraken est encore en cours.");
			return {
				ok: false,
				message: "Un ordre Kraken est encore en cours."
			};
		}
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
			get().syncKraken("light");
		}
		if (bot.venue === "live" && !get().tickers[pair] && !get().tickers[bot.pair]) {
			toast.message("Marché indisponible.");
			return {
				ok: false,
				message: "Marché indisponible."
			};
		}
		set({ bots: get().bots.map((b) => b.id === id ? withLog({
			...b,
			pair,
			status: "running",
			startedAt: Date.now(),
			lastNote: "Démarré.",
			error: void 0,
			runtime: b.kind === "dca" ? {
				...b.runtime,
				nextDcaAt: Date.now(),
				inFlight: false,
				pendingFills: void 0
			} : {
				...b.runtime,
				inFlight: false,
				pendingFills: void 0,
				...(b.runtime.gridOwned ?? []).some((g) => g.qty > 0) ? {} : {
					lastPrice: void 0,
					gridLower: void 0,
					gridUpper: void 0
				},
				...b.kind === "grid" && b.params.gridSeed && !(b.runtime.gridOwned ?? []).some((g) => g.qty > 0) ? { gridSeedNow: true } : {}
			}
		}, "Démarré.") : b) });
		get().runBots();
		return {
			ok: true,
			message: "Bot lancé."
		};
	},
	pauseBot: (id) => {
		set({ bots: get().bots.map((b) => b.id === id ? withLog({
			...b,
			status: "paused",
			lastNote: "En pause."
		}, "En pause.") : b) });
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
			pair: toEurPair(bot.pair),
			log: [{
				t: Date.now(),
				text: "Copie créée."
			}]
		};
		set({ bots: [copy, ...get().bots] });
		return copy;
	},
	cloneBotToPair: (id, pair) => {
		if (!get().bots.find((b) => b.id === id)) return null;
		const dest = toEurPair(pair);
		const last = get().tickers[dest]?.last ?? 0;
		const copy = get().duplicateBot(id);
		if (!copy) return null;
		let params = copy.params;
		if (copy.kind === "grid" && last > 0) {
			const lo = copy.params.lower ?? 0;
			const hi = copy.params.upper ?? 0;
			const mid = lo > 0 && hi > lo ? (lo + hi) / 2 : 0;
			if (mid > 0) {
				const scale = last / mid;
				params = {
					...copy.params,
					lower: lo * scale,
					upper: hi * scale
				};
			}
		}
		const meta = PAIR_BY_ID[dest];
		const name = `${kindTitle(copy.kind)} ${meta?.display ?? dest}`;
		get().updateBot(copy.id, {
			pair: dest,
			name,
			params
		});
		return get().bots.find((b) => b.id === copy.id) ?? copy;
	},
	toggleBuyPause: (id) => {
		const bot = get().bots.find((b) => b.id === id);
		if (!bot) return;
		const next = !bot.runtime.buyPause;
		set({ bots: get().bots.map((b) => b.id === id ? {
			...b,
			runtime: {
				...b.runtime,
				buyPause: next
			},
			lastNote: next ? "Achats en pause — reventes actives." : "Achats réarmés."
		} : b) });
		toast.message(next ? "Achats en pause" : "Achats réarmés");
	},
	seedGrid: (id) => {
		const bot = get().bots.find((b) => b.id === id);
		if (!bot || bot.kind !== "grid") return {
			ok: false,
			message: "Pas une grille."
		};
		if (bot.status !== "running") return {
			ok: false,
			message: "Lance le bot d’abord."
		};
		if ((bot.runtime.gridOwned ?? []).some((g) => g.qty > 0)) return {
			ok: false,
			message: "Un lot est déjà ouvert."
		};
		set({ bots: get().bots.map((b) => b.id === id ? {
			...b,
			runtime: {
				...b.runtime,
				gridSeedNow: true
			},
			lastNote: "Prise du premier lot…"
		} : b) });
		get().runBots();
		return {
			ok: true,
			message: "Premier lot envoyé."
		};
	},
	importBots: (raw) => {
		const rows = parseBotBlueprints(raw);
		if (!rows.length) return {
			ok: false,
			message: "Aucun bot valide dans le fichier.",
			count: 0
		};
		const created = rows.map((row) => {
			const pair = toEurPair(row.pair);
			const meta = PAIR_BY_ID[pair];
			return {
				id: uid("bot"),
				name: row.name.trim() || `${kindTitle(row.kind)} ${meta?.display ?? pair}`,
				kind: row.kind,
				venue: row.venue,
				status: "idle",
				pair,
				interval: row.interval,
				sizeQuote: row.sizeQuote,
				params: row.params,
				createdAt: Date.now(),
				lastNote: "Importé.",
				stats: { ...EMPTY_STATS },
				runtime: {},
				log: [{
					t: Date.now(),
					text: "Importé."
				}]
			};
		});
		set({ bots: [...created, ...get().bots] });
		return {
			ok: true,
			message: `${created.length} bot${created.length > 1 ? "s" : ""} importé${created.length > 1 ? "s" : ""}.`,
			count: created.length
		};
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
		set({
			paper: resetPaperAccount(amount, get().paper.feeRate),
			deskPeakPaper: amount
		});
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
			deskPeakPaper: paper.startingBalance,
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
		const eq = paperEquity(paper, get().tickers);
		set({
			paper: snapshotEquity(paper, eq),
			bots: get().bots.map((b) => b.venue === "paper" ? {
				...b,
				runtime: {
					...b.runtime,
					inPosition: false,
					positionQty: 0,
					positionAvg: 0,
					gridOwned: [],
					peakPrice: void 0,
					scaledOut: false,
					entryAt: void 0,
					entryBar: void 0
				},
				lastNote: sold ? "Positions papier liquidées." : b.lastNote
			} : b)
		});
		if (sold) toast.success(`Positions papier liquidées (${sold})`);
		else toast.message("Rien à liquider");
	},
	flattenBot: (id) => {
		const bot = get().bots.find((b) => b.id === id);
		if (!bot) return;
		const ticker = get().tickers[bot.pair];
		const meta = PAIR_BY_ID[bot.pair];
		let qty = botInventoryQty(bot.runtime);
		if (!(qty > 0) || !ticker?.last || !meta) {
			toast.message("Pas de position à clôturer sur ce bot.");
			return;
		}
		if (bot.venue === "live") {
			const bals = get().krakenBalances;
			const have = bals[meta.base] ?? 0;
			if (Object.keys(bals).length > 0) {
				if (!(have > 0)) {
					toast.message(`Solde ${meta.base} insuffisant sur Kraken.`);
					return;
				}
				qty = Math.min(qty, have);
			}
		}
		const price = ticker.bid || ticker.last;
		if (bot.venue === "live") {
			if (bot.runtime.inFlight) {
				toast.message("Ordre déjà en cours.");
				return;
			}
			set({ bots: get().bots.map((b) => b.id === id ? {
				...b,
				runtime: {
					...b.runtime,
					inFlight: true,
					inFlightAt: Date.now()
				},
				lastNote: "Clôture Kraken…"
			} : b) });
			get().dispatchKrakenFill({
				botId: id,
				pair: bot.pair,
				side: "sell",
				qty,
				price,
				note: "Clôture manuelle",
				prevRuntime: bot.runtime,
				intendedRuntime: {
					...bot.runtime,
					inPosition: false,
					positionQty: 0,
					positionAvg: 0,
					gridOwned: [],
					inFlight: false,
					pendingFills: void 0
				},
				entryAvg: bot.runtime.positionAvg
			});
			return;
		}
		const res = applyPaperFill(get().paper, {
			botId: id,
			pair: bot.pair,
			base: meta.base,
			side: "sell",
			qty,
			price,
			note: "Clôture manuelle"
		});
		if (!res.ok) {
			toast.message(res.message);
			return;
		}
		const stats = { ...bot.stats };
		stats.trades += 1;
		stats.closes = (stats.closes ?? 0) + 1;
		stats.feesPaid += res.trade.fee;
		stats.volume += qty * price;
		stats.realizedPnl += res.trade.pnl;
		if (res.trade.pnl > 0) stats.wins += 1;
		set({
			paper: snapshotEquity(res.paper, paperEquity(res.paper, get().tickers)),
			bots: get().bots.map((b) => b.id === id ? withLog({
				...b,
				stats,
				lastNote: "Position clôturée.",
				lastActionAt: Date.now(),
				runtime: {
					...b.runtime,
					inPosition: false,
					positionQty: 0,
					positionAvg: 0,
					gridOwned: []
				}
			}, "Clôture manuelle", "sell") : b)
		});
		toast.success("Position papier clôturée");
	},
	panicLive: () => {
		const live = get().bots.filter((b) => b.venue === "live");
		get().pauseAllBots("live", { silent: true });
		let closing = 0;
		for (const bot of live) if (botInventoryQty(bot.runtime) > 0) {
			closing += 1;
			get().flattenBot(bot.id);
		}
		toast.message(closing ? `Stop d’urgence · ${closing} position${closing > 1 ? "s" : ""} en clôture` : "Bots réels arrêtés");
	},
	setBotCandles: (bag) => set({ botCandles: {
		...get().botCandles,
		...bag
	} }),
	pauseAllBots: (venue, opts) => {
		const note = opts?.note ?? "Stop global.";
		set({ bots: get().bots.map((b) => b.status === "running" && (!venue || b.venue === venue) ? {
			...b,
			status: "paused",
			lastNote: note,
			runtime: b.runtime.inFlight ? restoreFlight(b.runtime) : {
				...b.runtime,
				inFlight: false
			}
		} : b) });
		if (!opts?.silent) toast.message(opts?.note ?? (venue === "live" ? "Bots réels en pause" : "Bots en pause"));
	},
	syncKraken: async (mode = "full") => {
		const { apiKey, apiSecret } = get().connection;
		if (!apiKey || !apiSecret) {
			const message = "Clés Kraken manquantes.";
			set({ krakenError: message });
			return {
				ok: false,
				message
			};
		}
		const res = await krakenSnapshot({ data: {
			apiKey,
			apiSecret,
			mode
		} });
		if (!res.ok) {
			const fallback = await krakenBalance({ data: {
				apiKey,
				apiSecret
			} });
			set({
				krakenBalances: fallback.balances,
				krakenEur: fallback.eur,
				krakenSyncAt: Date.now(),
				krakenError: fallback.ok ? null : fallback.message
			});
			get().setConnection({
				testedAt: Date.now(),
				testOk: fallback.ok,
				testMessage: fallback.message
			});
			return {
				ok: fallback.ok,
				message: fallback.message
			};
		}
		const open = (res.orders ?? []).filter((o) => o.status === "open");
		const closedKept = mode === "light" ? get().krakenOrders.filter((o) => o.status !== "open") : (res.orders ?? []).filter((o) => o.status !== "open");
		set({
			krakenBalances: res.balances ?? {},
			krakenEur: res.eur ?? 0,
			krakenOrders: [...open, ...closedKept].slice(0, 80),
			krakenFills: mode === "light" ? get().krakenFills : res.fills ?? [],
			krakenPositions: res.positions ?? [],
			krakenSyncAt: Date.now(),
			krakenError: null
		});
		get().setConnection({
			testedAt: Date.now(),
			testOk: true,
			testMessage: res.message
		});
		return {
			ok: true,
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
		if (input.side === "buy") {
			const known = get().krakenSyncAt > 0 || get().krakenEur > 0 || Object.keys(balances).length > 0;
			const need = input.qty * input.price * 1.004;
			if (known && get().krakenEur + 1e-9 < need) {
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
		let fillPx = input.price;
		let fillQty = input.qty;
		let fee = fillQty * fillPx * feeRate;
		if (res.txid) try {
			const q = await krakenQueryOrder({ data: {
				apiKey,
				apiSecret,
				txid: res.txid
			} });
			if (q.ok && q.order) {
				if (q.order.avgPrice > 0) fillPx = q.order.avgPrice;
				if (q.order.filled > 0) fillQty = q.order.filled;
				if (q.order.fee > 0) fee = q.order.fee;
				else fee = fillQty * fillPx * feeRate;
			}
		} catch {}
		let pnl = 0;
		if (input.side === "sell" && input.entryAvg && input.entryAvg > 0) pnl = fillQty * fillPx - fee - input.entryAvg * fillQty;
		set({
			liveFills: [{
				id: uid("lf"),
				botId: input.botId,
				pair: input.pair,
				side: input.side,
				amount: fillQty,
				price: fillPx,
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
				stats.volume += fillQty * fillPx;
				stats.realizedPnl += pnl;
				if (input.side === "sell") {
					stats.closes = (stats.closes ?? 0) + 1;
					if (pnl > 0) stats.wins += 1;
				}
				const compound = b.params.compoundPct ?? 0;
				const sizeQuote = compound > 0 && input.side === "sell" && pnl > 0 ? Math.max(5, b.sizeQuote + pnl * (compound / 100)) : b.sizeQuote;
				const dayPnl = (input.intendedRuntime.dayPnl ?? 0) + pnl;
				const dayTrades = (input.intendedRuntime.dayTrades ?? 0) + 1;
				const consecutiveLosses = input.side === "sell" ? pnl < 0 ? (b.runtime.consecutiveLosses ?? 0) + 1 : 0 : b.runtime.consecutiveLosses ?? 0;
				return withLog({
					...b,
					stats,
					sizeQuote,
					lastActionAt: now,
					lastNote: `${input.note}${res.txid ? ` · ${res.txid}` : ""}`,
					error: void 0,
					runtime: {
						...input.intendedRuntime,
						inFlight: false,
						inFlightAt: void 0,
						dayPnl,
						dayTrades,
						consecutiveLosses,
						errorStreak: 0
					}
				}, input.note, input.side);
			})
		});
		toast.success("Ordre Kraken", { description: res.message });
		pingFill(get().settings, "Kraken", `${input.note}${res.txid ? ` · ${res.txid}` : ""}`);
		get().syncKraken("light");
	},
	runBots: () => {
		const running = get().bots.filter((b) => b.status === "running");
		if (running.length === 0) return;
		const tickers = get().tickers;
		const now = Date.now();
		let paper = clonePaper(get().paper);
		let botsChanged = false;
		let paperChanged = false;
		const outgoing = [];
		const paperEq = paperEquity(paper, tickers);
		const liveEq = Object.entries(get().krakenBalances).reduce((s, [asset, qty]) => s + eurValue(asset, qty, tickers), 0);
		const settings = get().settings;
		const allBots = get().bots;
		const paperPeak = Math.max(get().deskPeakPaper, paper.startingBalance, paperEq, ...paper.equityCurve.map((p) => p.v));
		const livePeak = Math.max(get().deskPeakLive, liveEq);
		if (paperPeak !== get().deskPeakPaper || livePeak !== get().deskPeakLive) set({
			deskPeakPaper: paperPeak,
			deskPeakLive: livePeak
		});
		const paperDay = allBots.filter((b) => b.venue === "paper").reduce((s, b) => s + (b.runtime.dayPnl ?? 0), 0);
		const paperExposure = running.filter((b) => b.venue === "paper").reduce((s, b) => {
			const t = tickers[toEurPair(b.pair)] ?? tickers[b.pair];
			return s + botMark(b.runtime, t?.last ?? 0).exposure;
		}, 0);
		const paperDesk = evaluateDesk({
			equity: paperEq,
			peak: paperPeak,
			dayPnl: paperDay,
			exposure: paperExposure,
			limits: settings
		});
		if (paperDesk.halt && running.some((b) => b.venue === "paper")) {
			get().pauseAllBots("paper", { note: paperDesk.note ?? "Stop bureau" });
			pingFill(settings, "Nautilus", paperDesk.note ?? "Stop bureau");
			return;
		}
		const liveDay = allBots.filter((b) => b.venue === "live").reduce((s, b) => s + (b.runtime.dayPnl ?? 0), 0);
		const liveExposure = running.filter((b) => b.venue === "live").reduce((s, b) => {
			const t = tickers[toEurPair(b.pair)] ?? tickers[b.pair];
			return s + botMark(b.runtime, t?.last ?? 0).exposure;
		}, 0);
		const liveDesk = evaluateDesk({
			equity: liveEq,
			peak: livePeak,
			dayPnl: liveDay,
			exposure: liveExposure,
			limits: settings
		});
		if (liveDesk.halt && running.some((b) => b.venue === "live")) {
			get().pauseAllBots("live", { note: liveDesk.note ?? "Stop bureau" });
			pingFill(settings, "Nautilus", liveDesk.note ?? "Stop bureau");
			return;
		}
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
			const rawCandles = get().botCandles[candleKey] ?? get().botCandles[`${bot.pair}:${bot.interval}`];
			const candles = kindNeedsCandles(bot.kind) ? dropFormingCandle(rawCandles, bot.interval, now) : rawCandles;
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
					return withLog({
						...bot,
						status: "paused",
						lastNote: "Timeout Kraken — pause pour éviter un double ordre. Vérifie l’ordre puis relance.",
						error: "Timeout Kraken",
						runtime: restoreFlight(bot.runtime)
					}, "Timeout Kraken — pause sécurité");
				}
				return bot;
			}
			const queued = (bot.runtime.pendingFills ?? []).filter((f) => f.qty >= meta.ordermin);
			if (queued.length) {
				const fill = queued[0];
				const rest = queued.slice(1);
				botsChanged = true;
				outgoing.push({
					botId: bot.id,
					pair,
					side: fill.side,
					qty: fill.qty,
					price: fill.price,
					note: fill.note,
					prevRuntime: bot.runtime,
					intendedRuntime: {
						...bot.runtime,
						pendingFills: rest
					},
					entryAvg: fill.entry && fill.entry > 0 ? fill.entry : bot.runtime.positionAvg
				});
				return {
					...bot,
					pair,
					runtime: {
						...bot.runtime,
						pendingFills: rest,
						inFlight: true,
						inFlightAt: now,
						flightPrev: snapshotRuntime(bot.runtime)
					},
					lastNote: "Envoi de l’ordre à Kraken…"
				};
			}
			const lastTickAt = get().lastTickAt;
			const watchdog = get().settings.watchdog !== false;
			if (bot.venue === "live" && lastTickAt > 0) {
				const age = now - lastTickAt;
				if (age > 4e4 && watchdog) {
					botsChanged = true;
					return withLog({
						...bot,
						status: "paused",
						lastNote: "Flux prix figé — pause sécurité.",
						error: "Flux prix figé"
					}, "Flux prix figé — pause sécurité");
				}
				if (age > 18e3) {
					if (bot.lastNote.startsWith("Flux prix figé")) return bot;
					botsChanged = true;
					return {
						...bot,
						lastNote: "Flux prix figé — pas d’ordre."
					};
				}
			}
			const desk = bot.venue === "paper" ? paperDesk : liveDesk;
			const { fills, runtime, note } = evaluateBot({
				...bot,
				pair
			}, {
				now,
				ticker,
				candles,
				equity: bot.venue === "paper" ? paperEq : liveEq || paperEq,
				quoteBudget: bot.venue === "paper" ? desk.blockBuys ? 0 : paper.cash : desk.blockBuys ? 0 : get().krakenSyncAt > 0 ? get().krakenEur : void 0,
				baseBudget: bot.venue === "paper" ? paper.holdings[meta.base]?.qty ?? 0 : get().krakenSyncAt > 0 ? get().krakenBalances[meta.base] ?? 0 : void 0,
				feeRate: bot.venue === "paper" ? paper.feeRate : get().settings.takerFee,
				maxFills: bot.venue === "live" ? 1 : void 0,
				closedOnly: true
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
				if (note === bot.lastNote && runtime.lastPrice === bot.runtime.lastPrice && runtime.lastCandleTime === bot.runtime.lastCandleTime && runtime.nextDcaAt === bot.runtime.nextDcaAt && runtime.peakPrice === bot.runtime.peakPrice && (runtime.gridOwned?.length ?? 0) === (bot.runtime.gridOwned?.length ?? 0) && runtime.buyPause === bot.runtime.buyPause && runtime.gridLower === bot.runtime.gridLower && runtime.buyCoolUntil === bot.runtime.buyCoolUntil && runtime.gridSeedNow === bot.runtime.gridSeedNow) return bot;
				botsChanged = true;
				return next;
			}
			const stats = { ...bot.stats };
			if (bot.venue === "live") {
				const queued = (bot.runtime.pendingFills ?? []).filter((f) => f.qty >= meta.ordermin);
				const fresh = fills.filter((f) => f.qty >= meta.ordermin);
				const valid = queued.length ? queued : fresh;
				if (!valid.length) {
					botsChanged = true;
					return {
						...next,
						lastNote: `Sous le minimum ${meta.ordermin} ${meta.base}.`
					};
				}
				const fill = valid[0];
				const rest = valid.slice(1);
				botsChanged = true;
				outgoing.push({
					botId: bot.id,
					pair,
					side: fill.side,
					qty: fill.qty,
					price: fill.price,
					note: fill.note,
					prevRuntime: bot.runtime,
					intendedRuntime: {
						...runtime,
						pendingFills: rest
					},
					entryAvg: fill.entry && fill.entry > 0 ? fill.entry : bot.runtime.positionAvg
				});
				return {
					...next,
					runtime: {
						...runtime,
						pendingFills: rest,
						inFlight: true,
						inFlightAt: now,
						flightPrev: snapshotRuntime(bot.runtime)
					},
					lastNote: "Envoi de l’ordre à Kraken…"
				};
			}
			let filled = 0;
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
					note: fill.note,
					costBasis: fill.entry
				});
				if (!res.ok) {
					next = {
						...next,
						lastNote: res.message
					};
					continue;
				}
				filled += 1;
				paper = res.paper;
				paperChanged = true;
				stats.trades += 1;
				stats.feesPaid += res.trade.fee;
				stats.volume += fill.qty * fill.price;
				stats.realizedPnl += res.trade.pnl;
				if (fill.side === "sell") {
					stats.closes = (stats.closes ?? 0) + 1;
					if (res.trade.pnl > 0) stats.wins += 1;
				}
				const compound = bot.params.compoundPct ?? 0;
				if (compound > 0 && fill.side === "sell" && res.trade.pnl > 0) next.sizeQuote = Math.max(5, next.sizeQuote + res.trade.pnl * (compound / 100));
				const dayPnl = (next.runtime.dayPnl ?? 0) + res.trade.pnl;
				const dayTrades = (next.runtime.dayTrades ?? 0) + 1;
				const consecutiveLosses = fill.side === "sell" ? res.trade.pnl < 0 ? (next.runtime.consecutiveLosses ?? 0) + 1 : 0 : next.runtime.consecutiveLosses ?? 0;
				next = withLog({
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
				}, fill.note, fill.side);
				toast.message(bot.name, { description: `${fill.side === "buy" ? "Achat" : "Vente"} papier · frais ${res.trade.fee.toFixed(2)} EUR` });
				pingFill(get().settings, bot.name, `${fill.side === "buy" ? "Achat" : "Vente"} ${fill.note}`);
			}
			if (filled === 0 && fills.length > 0) next = {
				...next,
				runtime: {
					...next.runtime,
					inPosition: bot.runtime.inPosition,
					positionQty: bot.runtime.positionQty,
					positionAvg: bot.runtime.positionAvg,
					gridOwned: bot.runtime.gridOwned,
					peakPrice: bot.runtime.peakPrice,
					nextDcaAt: bot.runtime.nextDcaAt,
					scaledOut: bot.runtime.scaledOut,
					entryAt: bot.runtime.entryAt,
					entryBar: bot.runtime.entryBar,
					gridLower: bot.runtime.gridLower,
					gridUpper: bot.runtime.gridUpper,
					buyPause: bot.runtime.buyPause,
					buyCoolUntil: bot.runtime.buyCoolUntil,
					gridSeedNow: bot.runtime.gridSeedNow
				}
			};
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
	version: 3,
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
		bots: s.bots.map((b) => ({
			...b,
			log: (b.log ?? []).slice(0, 24),
			runtime: {
				...b.runtime.flightPrev ? b.runtime.flightPrev : b.runtime,
				inFlight: false,
				inFlightAt: void 0,
				pendingFills: void 0,
				flightPrev: void 0
			}
		})),
		paper: {
			...s.paper,
			trades: s.paper.trades.slice(0, 200),
			equityCurve: s.paper.equityCurve.slice(-120)
		},
		liveFills: s.liveFills.slice(0, 200),
		deskPeakPaper: s.deskPeakPaper,
		deskPeakLive: s.deskPeakLive
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
		if (!(state.deskPeakPaper > 0)) state.deskPeakPaper = state.paper?.startingBalance ?? DEFAULT_PAPER.startingBalance;
		if (!(state.deskPeakLive >= 0)) state.deskPeakLive = 0;
		state.bots = state.bots.map((b) => {
			const pair = toEurPair(b.pair);
			const pauseLive = b.venue === "live" && b.status === "running" && !state.settings.resumeLive;
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
function isLiveConnected(connection) {
	return Boolean(connection.apiKey && connection.apiSecret);
}
function liveBalanceRows(krakenBalances, hold = {}) {
	return Object.entries(krakenBalances).filter(([, q]) => q > 0).map(([asset, available]) => ({
		asset,
		available,
		hold: hold[asset] ?? 0
	})).sort((a, b) => b.available - a.available);
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
//#region node_modules/.nitro/vite/services/ssr/assets/router-DCxDvC4F.js
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
				children: (error instanceof Error ? error.message : "") || "An unexpected error occurred. Try reloading the page."
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
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
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
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
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
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
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
						const rows = await fetchOhlc({ data: {
							pair,
							interval: Number(interval)
						} });
						bag[key] = dropFormingCandle(rows, Number(interval), Date.now()) ?? rows;
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
		let ticks = 0;
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
		const syncAccount = async () => {
			const conn = useTradingStore.getState().connection;
			if (!isLiveConnected(conn)) return;
			ticks += 1;
			try {
				await useTradingStore.getState().syncKraken(ticks % 4 === 1 ? "full" : "light");
			} catch {}
		};
		pull();
		syncAccount();
		const id = window.setInterval(() => void pull(), 2200);
		const acc = window.setInterval(() => void syncAccount(), 22e3);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.clearInterval(acc);
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
	const runningBots = useTradingStore((s) => s.bots.reduce((n, b) => n + (b.status === "running" ? 1 : 0), 0));
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
					at: lastTickAt,
					compact: true
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("relative grid size-9 place-items-center rounded-full", active && "bg-muted"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: cn("size-5", active && "text-accent"),
										strokeWidth: 1.75
									}), item.to === "/bot" && runningBots > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-buy px-1 text-[9px] font-semibold text-buy-foreground",
										children: runningBots
									})]
								}), item.label]
							}, `desk-${item.label}`);
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("relative grid size-9 place-items-center rounded-full", active && "bg-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: cn("size-4", active && "text-accent"),
									strokeWidth: 1.75
								}), item.to === "/bot" && runningBots > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-0 top-0 grid min-w-3.5 place-items-center rounded-full bg-buy px-0.5 text-[8px] font-semibold text-buy-foreground",
									children: runningBots
								})]
							}), item.label]
						}, `tab-${item.label}`);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { style: {
					background: "var(--color-popover)",
					border: "1px solid var(--color-border)",
					color: "var(--color-popover-foreground)"
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
var styles_default = "/assets/styles-DEJ36-xT.css";
var APP_NAME = "Nautilus";
var Route$22 = createRootRoute({
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
var $$splitComponentImporter$20 = () => import("./routes-Bpo1dgvS.mjs");
var Route$21 = createFileRoute("/")({
	loader: async () => {
		try {
			return await fetchTickers();
		} catch {
			return [];
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./alerts-C2BSFA4N.mjs");
var Route$20 = createFileRoute("/alerts")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./arb-5Bufphj2.mjs");
var Route$19 = createFileRoute("/arb")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./bilan-D6awQQXM.mjs");
var Route$18 = createFileRoute("/bilan")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./bot-YPXcWyHH.mjs");
var Route$17 = createFileRoute("/bot")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./calculator-CHf44oNl.mjs");
var Route$16 = createFileRoute("/calculator")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./connect-Dkp-8rqS.mjs");
var Route$15 = createFileRoute("/connect")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./convert-DgrsxURa.mjs");
var Route$14 = createFileRoute("/convert")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./correlation-ZdF9XvG4.mjs");
var Route$13 = createFileRoute("/correlation")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./dca-CF7Y44IK.mjs");
var Route$12 = createFileRoute("/dca")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./fiscal-CgN233cf.mjs");
var Route$11 = createFileRoute("/fiscal")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./heatmap-B1P-mHAZ.mjs");
var Route$10 = createFileRoute("/heatmap")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./journal-B60gwJK4.mjs");
var Route$9 = createFileRoute("/journal")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./orders-B-XeVhuB.mjs");
var Route$8 = createFileRoute("/orders")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./risk-Cacx3rJu.mjs");
var Route$7 = createFileRoute("/risk")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./screener-2IhJ_x90.mjs");
var Route$6 = createFileRoute("/screener")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./settings-CxMddLwg.mjs");
var Route$5 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./staking-hsvqRUIj.mjs");
var Route$4 = createFileRoute("/staking")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./tools-CRVrTbpK.mjs");
var Route$3 = createFileRoute("/tools")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./wallet-DKxvI5K6.mjs");
var Route$2 = createFileRoute("/wallet")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./trade._pair-C-20vNlX.mjs");
var Route$1 = createFileRoute("/trade/$pair")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var V1_CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, X-API-Key, X-API-Secret"
};
function json(data, status = 200) {
	return Response.json(data, {
		status,
		headers: V1_CORS
	});
}
function keysFrom(request) {
	return {
		apiKey: request.headers.get("x-api-key") ?? "",
		apiSecret: request.headers.get("x-api-secret") ?? ""
	};
}
function needKeys(keys) {
	if (keys.apiKey.length < 8 || keys.apiSecret.length < 16) return json({
		ok: false,
		message: "En-têtes X-API-Key et X-API-Secret requis."
	}, 401);
	return null;
}
async function readBody(request) {
	return await request.json();
}
async function handleV1(method, request, splat) {
	const path = splat.replace(/\/$/, "");
	const url = new URL(request.url);
	const keys = keysFrom(request);
	try {
		if (method === "GET" && (path === "health" || path === "")) {
			const ping = await pingKraken();
			return json({
				ok: ping.ok,
				message: ping.ok ? "Nautilus backend" : "Kraken injoignable",
				ms: ping.ms
			});
		}
		if (method === "GET" && path === "tickers") return json({
			ok: true,
			tickers: await getTickers()
		});
		if (method === "GET" && path === "ohlc") {
			const pair = url.searchParams.get("pair") ?? "XBTEUR";
			const interval = Number(url.searchParams.get("interval") ?? 60);
			return json({
				ok: true,
				candles: await getOhlc(pair, interval)
			});
		}
		if (method === "GET" && path === "ohlc/history") {
			const pair = url.searchParams.get("pair") ?? "XBTEUR";
			const interval = Number(url.searchParams.get("interval") ?? 15);
			const days = Number(url.searchParams.get("days") ?? 7);
			const since = Number(url.searchParams.get("since") ?? 0);
			return json({
				ok: true,
				...await getOhlcHistory(pair, interval, since, days)
			});
		}
		if (method === "GET" && path === "depth") {
			const pair = url.searchParams.get("pair") ?? "XBTEUR";
			return json({
				ok: true,
				book: await getDepth(pair)
			});
		}
		if (method === "GET" && path === "trades") {
			const pair = url.searchParams.get("pair") ?? "XBTEUR";
			return json({
				ok: true,
				trades: await getTrades(pair)
			});
		}
		if (method === "POST" && path === "bots/evaluate") {
			const body = await readBody(request);
			if (!body?.kind || !body.pair || !body.ticker) return json({
				ok: false,
				message: "kind, pair et ticker requis."
			}, 400);
			const bot = {
				id: "eval",
				name: "eval",
				kind: body.kind,
				venue: "live",
				status: "running",
				pair: body.pair,
				interval: body.interval || 15,
				sizeQuote: body.sizeQuote || 50,
				params: body.params ?? {},
				createdAt: 0,
				lastNote: "",
				stats: { ...EMPTY_STATS },
				runtime: body.runtime ?? {}
			};
			const result = evaluateBot(bot, {
				now: Date.now(),
				ticker: body.ticker,
				candles: body.candles,
				equity: body.equity
			});
			return json({
				ok: true,
				message: result.note,
				fills: result.fills,
				runtime: result.runtime
			});
		}
		const denied = needKeys(keys);
		if (denied) return denied;
		if (method === "POST" && path === "keys/test") {
			const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Balance");
			if (!res.ok) return json({
				ok: false,
				message: res.message,
				balances: {},
				eur: 0
			}, 400);
			const balances = parseKrakenBalances(res.result);
			return json({
				ok: true,
				message: "Clés Kraken valides",
				balances,
				eur: balances.EUR ?? 0
			});
		}
		if (method === "GET" && (path === "account" || path === "account/full")) {
			const snap = await fetchAccountSnapshot(keys, "full");
			return json(snap, snap.ok ? 200 : 400);
		}
		if (method === "GET" && path === "account/light") {
			const snap = await fetchAccountSnapshot(keys, "light");
			return json(snap, snap.ok ? 200 : 400);
		}
		if (method === "GET" && path === "balances") {
			const res = await callKrakenPrivate(keys.apiKey, keys.apiSecret, "Balance");
			if (!res.ok) return json({
				ok: false,
				message: res.message,
				balances: {},
				eur: 0
			}, 400);
			const balances = parseKrakenBalances(res.result);
			return json({
				ok: true,
				message: "OK",
				balances,
				eur: balances.EUR ?? 0
			});
		}
		if (method === "GET" && path === "orders") {
			const [open, closed] = await Promise.all([fetchOpenOrders(keys), fetchClosedOrders(keys)]);
			return json({
				ok: true,
				message: "OK",
				orders: [...open, ...closed].slice(0, 80)
			});
		}
		if (method === "GET" && path === "fills") return json({
			ok: true,
			message: "OK",
			fills: (await fetchTradesHistory(keys)).slice(0, 80)
		});
		if (method === "GET" && path === "positions") return json({
			ok: true,
			message: "OK",
			positions: await fetchOpenPositions(keys)
		});
		if (method === "GET" && path === "earn") return json({
			ok: true,
			message: "OK",
			earn: await fetchEarn(keys)
		});
		if (method === "GET" && path === "earn/strategies") return json({
			ok: true,
			message: "OK",
			strategies: await fetchEarnStrategies(keys)
		});
		if (method === "GET" && path.startsWith("deposit/")) {
			const asset = path.slice(8);
			const res = await fetchDepositAddress(keys, asset);
			return json(res, res.ok ? 200 : 400);
		}
		if (method === "POST" && (path === "orders" || path === "bots/order")) {
			const body = await readBody(request);
			const amount = body.amount ?? Number(body.volume);
			const input = {
				pair: body.pair,
				side: body.side,
				type: body.type ?? "market",
				amount,
				price: body.price,
				stopPrice: body.stopPrice,
				leverage: body.leverage,
				tp: body.tp,
				sl: body.sl,
				trailingPct: body.trailingPct,
				note: body.note ?? (path === "bots/order" ? "bot" : void 0)
			};
			const res = await placeKrakenOrder(keys, input, { validate: body.validate });
			return json(res, res.ok ? 200 : 400);
		}
		if (method === "POST" && path === "convert") {
			const body = await readBody(request);
			const res = await convertKraken(keys, body.from, body.to, Number(body.amount));
			return json(res, res.ok ? 200 : 400);
		}
		if (method === "POST" && path.endsWith("/close") && path.startsWith("positions/")) {
			const body = await readBody(request);
			const res = await closeKrakenPosition(keys, body);
			return json(res, res.ok ? 200 : 400);
		}
		if (method === "POST" && path === "earn/allocate") {
			const body = await readBody(request);
			const res = await allocateEarn(keys, body.strategyId, Number(body.amount));
			return json(res, res.ok ? 200 : 400);
		}
		if (method === "POST" && path === "earn/deallocate") {
			const body = await readBody(request);
			const res = await deallocateEarn(keys, body.strategyId, Number(body.amount));
			return json(res, res.ok ? 200 : 400);
		}
		if (method === "DELETE" && path.startsWith("orders/")) {
			const txid = path.slice(7);
			const res = await cancelKrakenOrder(keys, txid);
			return json(res, res.ok ? 200 : 400);
		}
		return json({
			ok: false,
			message: `Route inconnue: /api/v1/${path}`
		}, 404);
	} catch (err) {
		return json({
			ok: false,
			message: err instanceof Error ? err.message : "Erreur backend"
		}, 500);
	}
}
var Route = createFileRoute("/api/v1/$")({ server: { handlers: {
	GET: async ({ request, params }) => handleV1("GET", request, params._splat ?? ""),
	POST: async ({ request, params }) => handleV1("POST", request, params._splat ?? ""),
	DELETE: async ({ request, params }) => handleV1("DELETE", request, params._splat ?? ""),
	OPTIONS: async () => new Response(null, {
		status: 204,
		headers: V1_CORS
	})
} } });
var rootRouteChildren = {
	IndexRoute: Route$21.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$22
	}),
	AlertsRoute: Route$20.update({
		id: "/alerts",
		path: "/alerts",
		getParentRoute: () => Route$22
	}),
	ArbRoute: Route$19.update({
		id: "/arb",
		path: "/arb",
		getParentRoute: () => Route$22
	}),
	BilanRoute: Route$18.update({
		id: "/bilan",
		path: "/bilan",
		getParentRoute: () => Route$22
	}),
	BotRoute: Route$17.update({
		id: "/bot",
		path: "/bot",
		getParentRoute: () => Route$22
	}),
	CalculatorRoute: Route$16.update({
		id: "/calculator",
		path: "/calculator",
		getParentRoute: () => Route$22
	}),
	ConnectRoute: Route$15.update({
		id: "/connect",
		path: "/connect",
		getParentRoute: () => Route$22
	}),
	ConvertRoute: Route$14.update({
		id: "/convert",
		path: "/convert",
		getParentRoute: () => Route$22
	}),
	CorrelationRoute: Route$13.update({
		id: "/correlation",
		path: "/correlation",
		getParentRoute: () => Route$22
	}),
	DcaRoute: Route$12.update({
		id: "/dca",
		path: "/dca",
		getParentRoute: () => Route$22
	}),
	FiscalRoute: Route$11.update({
		id: "/fiscal",
		path: "/fiscal",
		getParentRoute: () => Route$22
	}),
	HeatmapRoute: Route$10.update({
		id: "/heatmap",
		path: "/heatmap",
		getParentRoute: () => Route$22
	}),
	JournalRoute: Route$9.update({
		id: "/journal",
		path: "/journal",
		getParentRoute: () => Route$22
	}),
	OrdersRoute: Route$8.update({
		id: "/orders",
		path: "/orders",
		getParentRoute: () => Route$22
	}),
	RiskRoute: Route$7.update({
		id: "/risk",
		path: "/risk",
		getParentRoute: () => Route$22
	}),
	ScreenerRoute: Route$6.update({
		id: "/screener",
		path: "/screener",
		getParentRoute: () => Route$22
	}),
	SettingsRoute: Route$5.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$22
	}),
	StakingRoute: Route$4.update({
		id: "/staking",
		path: "/staking",
		getParentRoute: () => Route$22
	}),
	ToolsRoute: Route$3.update({
		id: "/tools",
		path: "/tools",
		getParentRoute: () => Route$22
	}),
	WalletRoute: Route$2.update({
		id: "/wallet",
		path: "/wallet",
		getParentRoute: () => Route$22
	}),
	TradePairRoute: Route$1.update({
		id: "/trade/$pair",
		path: "/trade/$pair",
		getParentRoute: () => Route$22
	}),
	ApiV1SplatRoute: Route.update({
		id: "/api/v1/$",
		path: "/api/v1/$",
		getParentRoute: () => Route$22
	})
};
var routeTree = Route$22._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { eurUsdRate as a, liveBalanceRows as c, useBookEngine as i, usdValue as l, Route$1 as n, eurValue as o, Route$21 as r, isLiveConnected as s, router_exports as t, useTradingStore as u };
