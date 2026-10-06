import { i as __toESM } from "../_runtime.mjs";
import { D as parisMonth, E as parisDate, It as PAIR_BY_ID, O as parisYear, st as formatFiat } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CQTqeWMb.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Segmented } from "./segmented-DgitihsW.mjs";
import { u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bilan-D6awQQXM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parisDay(ms) {
	return Number(new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/Paris",
		day: "numeric"
	}).format(ms));
}
function periodStart(period, now) {
	if (period === "all") return 0;
	if (period === "7d") return now - 6048e5;
	if (period === "30d") return now - 2592e6;
	return parisDate(parisYear(now), parisMonth(now), parisDay(now));
}
function buildBilan(fills, period, now) {
	const from = periodStart(period, now);
	const picked = fills.filter((fill) => fill.time >= from && fill.amount > 0 && fill.price > 0);
	const map = /* @__PURE__ */ new Map();
	let fees = 0;
	let pnl = 0;
	let volume = 0;
	let buys = 0;
	let sells = 0;
	let wins = 0;
	let losses = 0;
	for (const fill of picked) {
		const row = map.get(fill.pair) ?? {
			pair: fill.pair,
			buys: 0,
			sells: 0,
			fees: 0,
			pnl: 0,
			volume: 0,
			wins: 0
		};
		const notion = fill.amount * fill.price;
		row.fees += fill.fee || 0;
		row.volume += notion;
		fees += fill.fee || 0;
		volume += notion;
		if (fill.side === "buy") {
			row.buys += 1;
			buys += 1;
		} else {
			row.sells += 1;
			sells += 1;
			row.pnl += fill.pnl || 0;
			pnl += fill.pnl || 0;
			if ((fill.pnl || 0) > 0) {
				row.wins += 1;
				wins += 1;
			} else losses += 1;
		}
		map.set(fill.pair, row);
	}
	const rows = [...map.values()].sort((a, b) => b.pnl - a.pnl || b.volume - a.volume);
	return {
		from,
		trades: picked.length,
		buys,
		sells,
		fees,
		pnl,
		volume,
		wins,
		losses,
		winRate: sells > 0 ? wins / sells * 100 : 0,
		rows
	};
}
function csvNum(n) {
	return n.toFixed(2).replace(".", ",");
}
function bilanToCsv(report) {
	const lines = ["paire;achats;ventes;frais_eur;pnl_eur;volume_eur;gains"];
	for (const row of report.rows) lines.push([
		row.pair,
		String(row.buys),
		String(row.sells),
		csvNum(row.fees),
		csvNum(row.pnl),
		csvNum(row.volume),
		String(row.wins)
	].join(";"));
	lines.push([
		"TOTAL",
		String(report.buys),
		String(report.sells),
		csvNum(report.fees),
		csvNum(report.pnl),
		csvNum(report.volume),
		String(report.wins)
	].join(";"));
	return `\uFEFF${lines.join("\n")}`;
}
var PERIODS = [
	{
		id: "today",
		label: "Aujourd’hui"
	},
	{
		id: "7d",
		label: "7 jours"
	},
	{
		id: "30d",
		label: "30 jours"
	},
	{
		id: "all",
		label: "Tout"
	}
];
function downloadCsv(name, text) {
	const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = name;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function BilanPage() {
	const paperTrades = useTradingStore((s) => s.paper.trades);
	const liveFills = useTradingStore((s) => s.liveFills);
	const [period, setPeriod] = (0, import_react.useState)("30d");
	const [venue, setVenue] = (0, import_react.useState)("all");
	const report = (0, import_react.useMemo)(() => {
		return buildBilan([...venue === "live" ? [] : paperTrades.map((trade) => ({
			...trade,
			amount: trade.amount
		})), ...venue === "paper" ? [] : liveFills], period, Date.now());
	}, [
		paperTrades,
		liveFills,
		period,
		venue
	]);
	const tone = report.pnl > 0 ? "text-buy" : report.pnl < 0 ? "text-sell" : "text-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Bilan",
				kicker: "PnL réalisé des bots, papier et Kraken. Rien ne quitte cet appareil."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
				value: period,
				onChange: setPeriod,
				options: PERIODS
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
					value: venue,
					onChange: setVenue,
					options: [
						{
							id: "all",
							label: "Tout"
						},
						{
							id: "paper",
							label: "Papier"
						},
						{
							id: "live",
							label: "Kraken"
						}
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "PnL réalisé",
						value: formatFiat(report.pnl, "EUR"),
						className: tone
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Frais",
						value: formatFiat(report.fees, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Volume",
						value: formatFiat(report.volume, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Ventes gagnantes",
						value: report.sells ? `${report.wins}/${report.sells}` : "—",
						hint: report.sells ? `${report.winRate.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} %` : "Aucune vente"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						report.trades,
						" ordre",
						report.trades > 1 ? "s" : "",
						" · ",
						report.buys,
						" achat",
						report.buys > 1 ? "s" : "",
						" · ",
						report.sells,
						" vente",
						report.sells > 1 ? "s" : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					disabled: report.rows.length === 0,
					onClick: () => downloadCsv(`nautilus-bilan-${period}.csv`, bilanToCsv(report)),
					children: "Exporter CSV"
				})]
			}),
			report.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Aucun ordre sur cette période."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-border rounded-lg border border-border bg-card",
				children: report.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: PAIR_BY_ID[row.pair]?.display ?? row.pair
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								row.buys,
								" achat",
								row.buys > 1 ? "s" : "",
								" · ",
								row.sells,
								" vente",
								row.sells > 1 ? "s" : "",
								" · frais ",
								formatFiat(row.fees, "EUR")
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("font-mono text-sm tabular-nums", row.pnl > 0 ? "text-buy" : row.pnl < 0 ? "text-sell" : "text-foreground"),
						children: formatFiat(row.pnl, "EUR")
					})]
				}, row.pair))
			})
		]
	});
}
function Stat({ label, value, hint, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-mono text-sm tabular-nums", className),
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
//#endregion
export { BilanPage as component };
