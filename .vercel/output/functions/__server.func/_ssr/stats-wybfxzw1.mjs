//#region node_modules/.nitro/vite/services/ssr/assets/stats-wybfxzw1.js
function rangePosition(low, high, last) {
	if (!Number.isFinite(low) || !Number.isFinite(high) || high === low) return .5;
	return Math.min(1, Math.max(0, (last - low) / (high - low)));
}
function logReturns(closes) {
	const out = [];
	for (let i = 1; i < closes.length; i++) {
		const prev = closes[i - 1] ?? 0;
		const cur = closes[i] ?? 0;
		if (prev > 0 && cur > 0) out.push(Math.log(cur / prev));
	}
	return out;
}
function pearson(xs, ys) {
	const n = Math.min(xs.length, ys.length);
	if (n < 4) return 0;
	let sx = 0;
	let sy = 0;
	let sxx = 0;
	let syy = 0;
	let sxy = 0;
	for (let i = 0; i < n; i++) {
		const x = xs[i] ?? 0;
		const y = ys[i] ?? 0;
		sx += x;
		sy += y;
		sxx += x * x;
		syy += y * y;
		sxy += x * y;
	}
	const cov = sxy - sx * sy / n;
	const vx = sxx - sx * sx / n;
	const vy = syy - sy * sy / n;
	const den = Math.sqrt(vx * vy);
	if (!den) return 0;
	return Math.max(-1, Math.min(1, cov / den));
}
function sizeFromRisk(equity, riskPct, entry, stop) {
	const risk = equity * (riskPct / 100);
	const dist = Math.abs(entry - stop);
	if (!(risk > 0) || !(dist > 0) || !(entry > 0)) return {
		qty: 0,
		risk: 0,
		notional: 0
	};
	const qty = risk / dist;
	return {
		qty,
		risk,
		notional: qty * entry
	};
}
function rewardRisk(entry, stop, target) {
	const risk = Math.abs(entry - stop);
	const reward = Math.abs(target - entry);
	return risk > 0 ? reward / risk : 0;
}
function downloadCsv(filename, rows) {
	const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
//#endregion
export { rewardRisk as a, rangePosition as i, logReturns as n, sizeFromRisk as o, pearson as r, downloadCsv as t };
