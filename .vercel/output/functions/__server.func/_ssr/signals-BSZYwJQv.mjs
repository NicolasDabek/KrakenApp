import { It as PAIR_BY_ID } from "./kraken.server-CQDHT3_G.mjs";
import { i as rangePosition } from "./stats-wybfxzw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signals-BSZYwJQv.js
function marketSignal(t) {
	if (!t || !(t.last > 0)) return {
		bias: "wait",
		score: 0,
		label: "—",
		reasons: [],
		vsVwapPct: 0,
		rangePos: .5,
		spreadPct: 0
	};
	const vsVwapPct = t.vwap > 0 ? (t.last - t.vwap) / t.vwap * 100 : 0;
	const rangePos = rangePosition(t.low, t.high, t.last);
	const spreadPct = t.ask > 0 && t.bid > 0 ? (t.ask - t.bid) / t.last * 100 : 0;
	let score = 0;
	const reasons = [];
	if (vsVwapPct <= -.12) {
		score += 1;
		reasons.push("Sous la VWAP");
	} else if (vsVwapPct >= .12) {
		score -= 1;
		reasons.push("Au-dessus de la VWAP");
	}
	if (rangePos <= .18) {
		score += 1;
		reasons.push("Bas du range 24h");
	} else if (rangePos >= .82) {
		score -= 1;
		reasons.push("Haut du range 24h");
	}
	if (t.changePct <= -2) {
		score += 1;
		reasons.push("Pression vendeuse 24h");
	} else if (t.changePct >= 2) {
		score -= 1;
		reasons.push("Extension haussière 24h");
	}
	if (spreadPct > .35) reasons.push("Spread large");
	const bias = score >= 2 ? "buy" : score <= -2 ? "sell" : "wait";
	return {
		bias,
		score,
		label: bias === "buy" ? "Acheter" : bias === "sell" ? "Vendre" : "Attendre",
		reasons,
		vsVwapPct,
		rangePos,
		spreadPct
	};
}
function biasTone(bias) {
	if (bias === "buy") return "buy";
	if (bias === "sell") return "sell";
	return "neutral";
}
function assetBoard(tickers) {
	const byBase = /* @__PURE__ */ new Map();
	for (const t of Object.values(tickers)) {
		const meta = PAIR_BY_ID[t.id];
		if (!meta) continue;
		const slot = byBase.get(meta.base) ?? {};
		if (meta.quote === "EUR") slot.eur = t;
		if (meta.quote === "USD") slot.usd = t;
		byBase.set(meta.base, slot);
	}
	const fx = (() => {
		const a = tickers.XBTUSD?.last;
		const b = tickers.XBTEUR?.last;
		return a && b ? a / b : 1.08;
	})();
	const out = [];
	for (const [base, slot] of byBase) {
		if (!(slot.eur ?? slot.usd)) continue;
		const lastEur = slot.eur?.last ?? (slot.usd ? slot.usd.last / fx : 0);
		const lastUsd = slot.usd?.last ?? (slot.eur ? slot.eur.last * fx : 0);
		out.push({
			base,
			pairId: (slot.eur ?? slot.usd).id,
			eur: slot.eur,
			usd: slot.usd,
			lastEur,
			lastUsd,
			changePct: (slot.eur ?? slot.usd).changePct,
			volume: (slot.eur ?? slot.usd).volume,
			quoteVolume: (slot.eur ?? slot.usd).quoteVolume,
			high: (slot.eur ?? slot.usd).high,
			low: (slot.eur ?? slot.usd).low,
			vwap: (slot.eur ?? slot.usd).vwap,
			signal: marketSignal(slot.eur ?? slot.usd)
		});
	}
	out.sort((a, b) => b.quoteVolume - a.quoteVolume);
	return out;
}
//#endregion
export { biasTone as n, marketSignal as r, assetBoard as t };
