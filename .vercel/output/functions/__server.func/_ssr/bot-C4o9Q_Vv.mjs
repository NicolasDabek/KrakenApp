import { i as __toESM } from "../_runtime.mjs";
import { c as backtestFetchInterval, i as PAIR_BY_ID, l as intervalLabel, n as EUR_PAIRS, u as toEurPair } from "./pairs-DHGeMw8F.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as Crosshair, B as ChartCandlestick, E as Grip, F as CircleDot, J as Activity, K as ArrowUpRight, M as Compass, P as Cloud, R as ChartColumn, S as Milestone, T as Layers, b as Pause, c as Target, g as Repeat, h as Rocket, i as Volume2, j as Copy, k as Gauge, o as TrendingUp, r as Waves, s as Trash2, t as Zap, u as Square, v as Play, x as Navigation, y as Percent, z as ChartLine } from "../_libs/lucide-react.mjs";
import { D as formatDateTime, O as formatFiat, T as fetchOhlcHistory, c as DCA_INTERVALS, f as defaultParams, g as eurValue, i as cn, j as formatQty, k as formatPct, o as BOT_CANDLE_INTERVALS, p as defaultSize, s as BOT_KIND_BY_ID, u as backtestBot, x as useTradingStore } from "./router-DFwZ_5tV.mjs";
import { t as Button } from "./button-D7MFyafD.mjs";
import { t as Input } from "./input-D6ATNCG-.mjs";
import { t as Sheet } from "./sheet-hSSPeHqD.mjs";
import { t as Badge } from "./badge-CZ4ysjJY.mjs";
import { t as Segmented } from "./segmented-DWqh5B1n.mjs";
import { t as downloadCsv } from "./stats-wybfxzw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bot-C4o9Q_Vv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_ICON = {
	grid: Grip,
	dca: Repeat,
	rsi: Activity,
	ema: TrendingUp,
	bollinger: Waves,
	macd: ChartColumn,
	stoch: Gauge,
	vwap: Milestone,
	breakout: Rocket,
	supertrend: Compass,
	volume: Volume2,
	scalp: Zap,
	cci: Crosshair,
	meanrev: Target,
	keltner: Layers,
	roc: ArrowUpRight,
	adx: Navigation,
	williams: Percent,
	ichimoku: Cloud,
	psar: CircleDot,
	sma: ChartLine,
	ha: ChartCandlestick
};
var KIND_GROUPS = [
	{
		title: "Accumulation",
		ids: ["grid", "dca"]
	},
	{
		title: "Reversion",
		ids: [
			"rsi",
			"bollinger",
			"stoch",
			"vwap",
			"cci",
			"meanrev",
			"keltner",
			"williams"
		]
	},
	{
		title: "Tendance",
		ids: [
			"ema",
			"sma",
			"macd",
			"breakout",
			"supertrend",
			"adx",
			"roc",
			"ichimoku",
			"psar",
			"ha"
		]
	},
	{
		title: "Court terme",
		ids: ["scalp", "volume"]
	}
];
function BotPage() {
	const [venue, setVenue] = (0, import_react.useState)("paper");
	const [composer, setComposer] = (0, import_react.useState)(null);
	const bots = useTradingStore((s) => s.bots);
	const paper = useTradingStore((s) => s.paper);
	const lastPair = useTradingStore((s) => s.lastPair);
	const visible = bots.filter((b) => b.venue === venue);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold tracking-tight",
				children: "Bots"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Automatisation spot EUR sur Kraken. Simulation avec frais, réel via tes clés API."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
					value: venue,
					onChange: setVenue,
					options: [{
						id: "paper",
						label: "Simulation"
					}, {
						id: "live",
						label: "Réel"
					}]
				})
			}),
			venue === "paper" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Nouveau bot · paires EUR"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-5",
					children: KIND_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-[11px] uppercase tracking-wide text-subtle",
						children: group.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-2 gap-2",
						children: group.ids.map((id) => {
							const kind = BOT_KIND_BY_ID[id];
							if (!kind) return null;
							const Icon = KIND_ICON[kind.id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setComposer(kind.id),
								className: "flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors duration-150 hover:bg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 place-items-center rounded-md bg-muted text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										strokeWidth: 1.75
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: kind.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs leading-relaxed text-muted-foreground",
									children: kind.blurb
								})] })]
							}) }, kind.id);
						})
					})] }, group.title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: venue === "paper" ? "Bots papier" : "Bots réels"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: visible.length
					})]
				}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 py-6 text-center text-sm text-muted-foreground",
					children: [
						"Aucun bot ",
						venue === "paper" ? "en simulation" : "réel",
						". Choisis une stratégie ci-dessus."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: visible.map((bot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BotCard, { bot }, bot.id))
				})]
			}),
			venue === "paper" && paper.trades.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperJournal, {}),
			venue === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveJournal, {}),
			composer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {
				kind: composer,
				venue,
				defaultPair: lastPair,
				onClose: () => setComposer(null)
			})
		]
	});
}
function LivePanel() {
	const connection = useTradingStore((s) => s.connection);
	const setConnection = useTradingStore((s) => s.setConnection);
	const syncKraken = useTradingStore((s) => s.syncKraken);
	const pauseAllBots = useTradingStore((s) => s.pauseAllBots);
	const krakenEur = useTradingStore((s) => s.krakenEur);
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const krakenError = useTradingStore((s) => s.krakenError);
	const krakenSyncAt = useTradingStore((s) => s.krakenSyncAt);
	const [apiKey, setApiKey] = (0, import_react.useState)(connection.apiKey);
	const [apiSecret, setApiSecret] = (0, import_react.useState)(connection.apiSecret);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setApiKey(connection.apiKey);
		setApiSecret(connection.apiSecret);
	}, [connection.apiKey, connection.apiSecret]);
	const save = () => setConnection({
		apiKey: apiKey.trim(),
		apiSecret: apiSecret.trim()
	});
	const test = async () => {
		save();
		setBusy(true);
		await syncKraken();
		setBusy(false);
	};
	const holdings = Object.entries(krakenBalances).filter(([a, q]) => a !== "EUR" && q > 0).slice(0, 6);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Solde Kraken (EUR)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight",
						children: formatFiat(krakenEur, "EUR")
					}),
					krakenSyncAt > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-subtle",
						children: ["Sync ", formatDateTime(krakenSyncAt)]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: connection.testOk ? "buy" : "warn",
					children: connection.testOk ? "Clés OK" : "Hors ligne"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-relaxed text-muted-foreground",
				children: "Clé publique et clé privée Kraken (Spot). Droits : Query funds + Create & modify orders. Les clés restent sur cet appareil."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Clé publique (API Key)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: apiKey,
						onChange: (e) => setApiKey(e.target.value),
						autoComplete: "off"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Clé privée (API Secret)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: apiSecret,
						onChange: (e) => setApiSecret(e.target.value),
						autoComplete: "off"
					})
				})]
			}),
			krakenError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-sell",
				children: krakenError
			}),
			holdings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground",
				children: holdings.map(([asset, qty]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: asset }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums",
						children: formatQty(qty, 6)
					})]
				}, asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => void test(),
					disabled: busy,
					children: busy ? "Test…" : "Tester Kraken"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "sell",
					onClick: () => pauseAllBots("live"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }), "Stop réel"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/connect",
				className: "mt-2 block text-center text-xs text-accent",
				children: "Page connexion complète"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[11px] leading-relaxed text-subtle",
				children: "Les bots réels envoient des ordres marché spot EUR. Ils se mettent en pause au rechargement de la page."
			})
		]
	});
}
function PaperPanel() {
	const paper = useTradingStore((s) => s.paper);
	const tickers = useTradingStore((s) => s.tickers);
	const setPaperStart = useTradingStore((s) => s.setPaperStart);
	const setPaperFee = useTradingStore((s) => s.setPaperFee);
	const resetPaper = useTradingStore((s) => s.resetPaper);
	const flattenPaperPositions = useTradingStore((s) => s.flattenPaperPositions);
	const [start, setStart] = (0, import_react.useState)(String(paper.startingBalance));
	const [feePct, setFeePct] = (0, import_react.useState)((paper.feeRate * 100).toFixed(2));
	const holdings = Object.entries(paper.holdings ?? {}).filter(([, h]) => h.qty > 0);
	const marked = holdings.reduce((s, [asset, h]) => s + eurValue(asset, h.qty, tickers), 0);
	const equity = paper.cash + marked;
	const pnl = equity - paper.startingBalance;
	const pnlPct = paper.startingBalance ? pnl / paper.startingBalance * 100 : 0;
	(0, import_react.useEffect)(() => {
		setStart(String(paper.startingBalance));
		setFeePct((paper.feeRate * 100).toFixed(2));
	}, [paper.startingBalance, paper.feeRate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Équité simulation (EUR)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight",
						children: formatFiat(equity, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("mt-1 font-mono text-sm tabular-nums", pnl >= 0 ? "text-buy" : "text-sell"),
						children: [
							pnl >= 0 ? "+" : "",
							formatFiat(pnl, "EUR"),
							" · ",
							formatPct(pnlPct)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, { points: paper.equityCurve.map((p) => p.v) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-3 gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cash",
						value: formatFiat(paper.cash, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Frais payés",
						value: formatFiat(paper.feesPaid, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Réalisé",
						value: formatFiat(paper.realizedPnl, "EUR"),
						tone: paper.realizedPnl >= 0 ? "buy" : "sell"
					})
				]
			}),
			holdings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1.5 border-t border-border pt-3",
				children: holdings.map(([asset, h]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							asset,
							" · ",
							formatQty(h.qty, 6),
							" @ ",
							formatFiat(h.avg, "EUR")
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums",
						children: formatFiat(eurValue(asset, h.qty, tickers), "EUR")
					})]
				}, asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Solde de départ (EUR)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Solde de départ (EUR)",
						inputMode: "decimal",
						value: start,
						onChange: (e) => setStart(e.target.value),
						className: "font-mono tabular-nums"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Frais taker (%)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Frais taker (%)",
						inputMode: "decimal",
						value: feePct,
						onChange: (e) => setFeePct(e.target.value),
						className: "font-mono tabular-nums"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs leading-relaxed text-subtle",
				children: [
					"Chaque ordre marché prélève ce taux à l’achat et à la vente. Round-trip ≈",
					" ",
					(Number(feePct) * 2 || 0).toFixed(2),
					" %. Paires EUR uniquement."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => {
						const n = Number(start);
						const f = Number(feePct) / 100;
						if (Number.isFinite(f)) setPaperFee(f);
						if (n !== paper.startingBalance) setPaperStart(n);
					},
					children: "Appliquer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: flattenPaperPositions,
					children: "Tout vendre"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "mt-1 w-full",
				onClick: resetPaper,
				children: "Réinitialiser la simulation"
			})
		]
	});
}
function PaperJournal() {
	const trades = useTradingStore((s) => s.paper.trades);
	const exportCsv = () => {
		downloadCsv("nautilus-bots-eur.csv", [[
			"time",
			"pair",
			"side",
			"amount",
			"price",
			"fee",
			"pnl",
			"note"
		], ...trades.map((t) => [
			new Date(t.time).toISOString(),
			PAIR_BY_ID[t.pair]?.display ?? t.pair,
			t.side,
			String(t.amount),
			String(t.price),
			String(t.fee),
			String(t.pnl),
			t.note
		])]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Journal papier"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: exportCsv,
				children: "Export CSV"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 divide-y divide-border rounded-lg border border-border bg-card",
			children: trades.slice(0, 24).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: t.side === "buy" ? "text-buy" : "text-sell",
								children: t.side === "buy" ? "Achat" : "Vente"
							}),
							" ",
							PAIR_BY_ID[t.pair]?.display ?? t.pair
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: [
							t.note,
							" · frais ",
							formatFiat(t.fee, "EUR")
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: formatDateTime(t.time)
					}), t.side === "sell" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("font-mono text-xs tabular-nums", t.pnl >= 0 ? "text-buy" : "text-sell"),
						children: [t.pnl >= 0 ? "+" : "", formatFiat(t.pnl, "EUR")]
					})]
				})]
			}, t.id))
		})]
	});
}
function LiveJournal() {
	const fills = useTradingStore((s) => s.liveFills);
	if (fills.length === 0) return null;
	const exportCsv = () => {
		downloadCsv("nautilus-bots-live-eur.csv", [[
			"time",
			"pair",
			"side",
			"amount",
			"price",
			"fee",
			"pnl",
			"txid",
			"note"
		], ...fills.map((t) => [
			new Date(t.time).toISOString(),
			PAIR_BY_ID[t.pair]?.display ?? t.pair,
			t.side,
			String(t.amount),
			String(t.price),
			String(t.fee),
			String(t.pnl),
			t.txid ?? "",
			t.note
		])]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Journal réel Kraken"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: exportCsv,
				children: "Export CSV"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 divide-y divide-border rounded-lg border border-border bg-card",
			children: fills.slice(0, 24).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: t.side === "buy" ? "text-buy" : "text-sell",
								children: t.side === "buy" ? "Achat" : "Vente"
							}),
							" ",
							PAIR_BY_ID[t.pair]?.display ?? t.pair
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: [
							t.note,
							" · frais ",
							formatFiat(t.fee, "EUR")
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: formatDateTime(t.time)
					}), t.side === "sell" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("font-mono text-xs tabular-nums", t.pnl >= 0 ? "text-buy" : "text-sell"),
						children: [t.pnl >= 0 ? "+" : "", formatFiat(t.pnl, "EUR")]
					})]
				})]
			}, t.id))
		})]
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-muted px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] uppercase tracking-wide text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-0.5 font-mono text-xs tabular-nums", tone === "buy" && "text-buy", tone === "sell" && "text-sell"),
			children: value
		})]
	});
}
function Spark({ points }) {
	const d = (0, import_react.useMemo)(() => {
		if (points.length < 2) return null;
		const min = Math.min(...points);
		const span = Math.max(...points) - min || 1;
		return points.map((p, i) => {
			return `${i / (points.length - 1) * 100},${22 - (p - min) / span * 20}`;
		}).join(" ");
	}, [points]);
	if (!d) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "accent",
		children: "Papier"
	});
	const up = points[points.length - 1] >= points[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 100 24",
		className: "h-8 w-28 shrink-0",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: up ? "var(--color-buy)" : "var(--color-sell)",
			strokeWidth: "1.6",
			strokeLinejoin: "round",
			strokeLinecap: "round",
			points: d
		})
	});
}
function BotCard({ bot }) {
	const startBot = useTradingStore((s) => s.startBot);
	const pauseBot = useTradingStore((s) => s.pauseBot);
	const removeBot = useTradingStore((s) => s.removeBot);
	const duplicateBot = useTradingStore((s) => s.duplicateBot);
	const ticker = useTradingStore((s) => s.tickers[bot.pair]);
	const connection = useTradingStore((s) => s.connection);
	const Icon = KIND_ICON[bot.kind] ?? Grip;
	const meta = PAIR_BY_ID[bot.pair];
	const running = bot.status === "running";
	const winRate = bot.stats.trades > 0 ? bot.stats.wins / bot.stats.trades * 100 : 0;
	const uPnl = bot.runtime.inPosition && bot.runtime.positionQty && bot.runtime.positionAvg && ticker?.last ? (ticker.last - bot.runtime.positionAvg) * bot.runtime.positionQty : 0;
	const launch = () => {
		const res = startBot(bot.id);
		if (!res.ok) toast.message(res.message);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-9 shrink-0 place-items-center rounded-md bg-muted text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: bot.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: [
								meta?.display ?? bot.pair,
								" · ",
								formatFiat(bot.sizeQuote, "EUR"),
								" / ordre",
								ticker ? ` · ${formatQty(ticker.last, meta?.pairDecimals ?? 2)}` : ""
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: running ? "buy" : bot.status === "error" ? "sell" : "neutral",
					children: running ? "Actif" : bot.status === "paused" ? "Pause" : bot.status === "error" ? "Erreur" : "Arrêté"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-relaxed text-muted-foreground",
				children: bot.lastNote
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Trades",
						value: String(bot.stats.trades)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Frais",
						value: formatFiat(bot.stats.feesPaid, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "PnL",
						value: formatFiat(bot.stats.realizedPnl, "EUR"),
						tone: bot.stats.realizedPnl >= 0 ? "buy" : "sell"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Win rate",
						value: bot.stats.trades ? `${Math.round(winRate)} %` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Non réalisé",
						value: formatFiat(uPnl, "EUR"),
						tone: uPnl > 0 ? "buy" : uPnl < 0 ? "sell" : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Jour",
						value: formatFiat(bot.runtime.dayPnl ?? 0, "EUR"),
						tone: (bot.runtime.dayPnl ?? 0) >= 0 ? "buy" : "sell"
					})
				]
			}),
			bot.venue === "live" && !connection.apiKey && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-warning",
				children: "Clés Kraken requises pour lancer."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [
					running ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						className: "flex-1",
						onClick: () => pauseBot(bot.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-3.5" }), "Pause"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "buy",
						className: "flex-1",
						onClick: launch,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), "Lancer"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => duplicateBot(bot.id),
						"aria-label": "Dupliquer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => removeBot(bot.id),
						"aria-label": "Supprimer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
					})
				]
			})
		]
	});
}
function Composer({ kind, venue, defaultPair, onClose }) {
	const createBot = useTradingStore((s) => s.createBot);
	const startBot = useTradingStore((s) => s.startBot);
	const feeRate = useTradingStore((s) => s.paper.feeRate);
	const hasKeys = useTradingStore((s) => Boolean(s.connection.apiKey && s.connection.apiSecret));
	const info = BOT_KIND_BY_ID[kind];
	const initialPair = toEurPair(defaultPair);
	const [pair, setPair] = (0, import_react.useState)(EUR_PAIRS.some((p) => p.id === initialPair) ? initialPair : "XBTEUR");
	const pairLast = useTradingStore((s) => s.tickers[pair]?.last ?? 0);
	const [size, setSize] = (0, import_react.useState)(String(defaultSize(kind)));
	const [interval, setIntervalId] = (0, import_react.useState)(60);
	const [params, setParams] = (0, import_react.useState)(() => defaultParams(kind, pairLast || 100));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [bt, setBt] = (0, import_react.useState)(null);
	const [btBusy, setBtBusy] = (0, import_react.useState)(false);
	const [btDays, setBtDays] = (0, import_react.useState)(30);
	const [btCapital, setBtCapital] = (0, import_react.useState)("10000");
	const [btSlip, setBtSlip] = (0, import_react.useState)("5");
	const seeded = (0, import_react.useRef)(pairLast > 0);
	(0, import_react.useEffect)(() => {
		if (kind !== "grid" || seeded.current || !(pairLast > 0)) return;
		setParams((p) => ({
			...defaultParams("grid", pairLast),
			slPct: p.slPct,
			tpPct: p.tpPct,
			cooldownSec: p.cooldownSec
		}));
		seeded.current = true;
	}, [kind, pairLast]);
	const patch = (p) => setParams((prev) => ({
		...prev,
		...p
	}));
	const runBacktest = async () => {
		setBtBusy(true);
		try {
			const fetchInterval = backtestFetchInterval(btDays, interval);
			if (fetchInterval !== interval) setIntervalId(fetchInterval);
			const since = Math.floor(Date.now() / 1e3) - btDays * 86400;
			const hist = await fetchOhlcHistory({ data: {
				pair,
				interval: fetchInterval,
				since,
				days: btDays
			} });
			const candles = hist.candles;
			const used = hist.interval;
			const n = Number(size);
			const capital = Number(btCapital);
			const slip = Number(btSlip);
			if (candles.length < 30) {
				setBt(null);
				toast.message("Historique trop court pour ce backtest");
				return;
			}
			const result = backtestBot(kind, params, n > 0 ? n : 100, candles, feeRate, pair, {
				startingBalance: capital > 0 ? capital : 1e4,
				slippageBps: Number.isFinite(slip) ? slip : 0,
				interval: used,
				requestedDays: btDays
			});
			setBt(result);
			if (!result) toast.message("Pas assez de barres pour cette stratégie");
		} catch {
			setBt(null);
			toast.message("Historique Kraken indisponible");
		} finally {
			setBtBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title: info.title,
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3 px-4 pb-6 pt-2",
			onSubmit: (e) => {
				e.preventDefault();
				const n = Number(size);
				if (!(n > 0)) return;
				if (venue === "live" && !hasKeys) return;
				setBusy(true);
				const bot = createBot({
					kind,
					venue,
					pair,
					interval,
					sizeQuote: n,
					params: {
						...params,
						cooldownSec: params.cooldownSec ?? (venue === "live" ? 20 : 0),
						maxSpreadPct: params.maxSpreadPct ?? (venue === "live" ? .35 : 0)
					}
				});
				const res = startBot(bot.id);
				if (!res.ok) toast.message(res.message);
				setBusy(false);
				onClose();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: info.blurb
				}),
				pairLast > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs tabular-nums text-subtle",
					children: [
						"Dernier prix ",
						formatQty(pairLast, 6),
						" EUR"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Paire EUR",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: pair,
						onChange: (e) => {
							setPair(e.target.value);
							setBt(null);
							if (kind === "grid") {
								const px = useTradingStore.getState().tickers[e.target.value]?.last ?? pairLast;
								setParams((p) => ({
									...defaultParams("grid", px || 100),
									slPct: p.slPct,
									tpPct: p.tpPct
								}));
							}
						},
						className: "h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
						children: EUR_PAIRS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.display
						}, p.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Taille par ordre (EUR)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: size,
						onChange: (e) => setSize(e.target.value),
						className: "font-mono tabular-nums"
					})
				}),
				kind === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Bas",
							value: params.lower,
							onChange: (v) => patch({ lower: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Haut",
							value: params.upper,
							onChange: (v) => patch({ upper: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Niveaux",
							value: params.levels ?? 8,
							onChange: (v) => patch({ levels: v })
						})
					]
				}),
				kind === "dca" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Cadence",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: DCA_INTERVALS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => patch({ intervalMs: c.id }),
							className: cn("h-9 rounded-full px-3 text-xs font-medium", params.intervalMs === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
							children: c.label
						}, c.id))
					})
				}),
				kind === "rsi" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Période",
							value: params.rsiPeriod ?? 14,
							onChange: (v) => patch({ rsiPeriod: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Survente",
							value: params.oversold ?? 30,
							onChange: (v) => patch({ oversold: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Surachat",
							value: params.overbought ?? 70,
							onChange: (v) => patch({ overbought: v })
						})
					]
				}),
				(kind === "ema" || kind === "scalp") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "EMA rapide",
						value: params.fast ?? (kind === "scalp" ? 5 : 9),
						onChange: (v) => patch({ fast: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "EMA lente",
						value: params.slow ?? (kind === "scalp" ? 13 : 21),
						onChange: (v) => patch({ slow: v })
					})]
				}),
				kind === "bollinger" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Période",
						value: params.bbPeriod ?? 20,
						onChange: (v) => patch({ bbPeriod: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Écart-type",
						value: params.bbMult ?? 2,
						onChange: (v) => patch({ bbMult: v })
					})]
				}),
				kind === "macd" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Rapide",
							value: params.macdFast ?? 12,
							onChange: (v) => patch({ macdFast: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Lent",
							value: params.macdSlow ?? 26,
							onChange: (v) => patch({ macdSlow: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Signal",
							value: params.macdSignal ?? 9,
							onChange: (v) => patch({ macdSignal: v })
						})
					]
				}),
				kind === "stoch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "N",
							value: params.stochN ?? 14,
							onChange: (v) => patch({ stochN: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Survente",
							value: params.oversold ?? 20,
							onChange: (v) => patch({ oversold: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Surachat",
							value: params.overbought ?? 80,
							onChange: (v) => patch({ overbought: v })
						})
					]
				}),
				kind === "breakout" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Fenêtre Donchian",
					value: params.donchian ?? 20,
					onChange: (v) => patch({ donchian: v })
				}),
				kind === "supertrend" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "ATR",
						value: params.atrPeriod ?? 10,
						onChange: (v) => patch({ atrPeriod: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Mult",
						value: params.atrMult ?? 3,
						onChange: (v) => patch({ atrMult: v })
					})]
				}),
				kind === "volume" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Seuil × moyenne",
					value: params.volMult ?? 2,
					onChange: (v) => patch({ volMult: v })
				}),
				kind === "cci" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Période",
							value: params.cciPeriod ?? 20,
							onChange: (v) => patch({ cciPeriod: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Survente",
							value: params.oversold ?? -100,
							onChange: (v) => patch({ oversold: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Surachat",
							value: params.overbought ?? 100,
							onChange: (v) => patch({ overbought: v })
						})
					]
				}),
				kind === "meanrev" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Fenêtre",
						value: params.zWindow ?? 20,
						onChange: (v) => patch({ zWindow: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "|Z| entrée",
						value: params.zEntry ?? 1.6,
						onChange: (v) => patch({ zEntry: v })
					})]
				}),
				kind === "keltner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Période",
						value: params.kcPeriod ?? 20,
						onChange: (v) => patch({ kcPeriod: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "ATR ×",
						value: params.kcMult ?? 1.5,
						onChange: (v) => patch({ kcMult: v })
					})]
				}),
				kind === "roc" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Période ROC",
					value: params.rocPeriod ?? 12,
					onChange: (v) => patch({ rocPeriod: v })
				}),
				kind === "adx" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Période",
						value: params.adxPeriod ?? 14,
						onChange: (v) => patch({ adxPeriod: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "ADX min",
						value: params.adxMin ?? 20,
						onChange: (v) => patch({ adxMin: v })
					})]
				}),
				kind === "williams" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "N",
							value: params.wrPeriod ?? 14,
							onChange: (v) => patch({ wrPeriod: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Survente",
							value: params.oversold ?? -80,
							onChange: (v) => patch({ oversold: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Surachat",
							value: params.overbought ?? -20,
							onChange: (v) => patch({ overbought: v })
						})
					]
				}),
				kind === "ichimoku" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Tenkan",
						value: params.tenkan ?? 9,
						onChange: (v) => patch({ tenkan: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Kijun",
						value: params.kijun ?? 26,
						onChange: (v) => patch({ kijun: v })
					})]
				}),
				kind === "psar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "AF",
						value: params.psarAf ?? .02,
						onChange: (v) => patch({ psarAf: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "AF max",
						value: params.psarMax ?? .2,
						onChange: (v) => patch({ psarMax: v })
					})]
				}),
				kind === "sma" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "SMA rapide",
						value: params.fast ?? 50,
						onChange: (v) => patch({ fast: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "SMA lente",
						value: params.slow ?? 200,
						onChange: (v) => patch({ slow: v })
					})]
				}),
				info.needsCandles && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Unité de temps",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: BOT_CANDLE_INTERVALS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setIntervalId(c.id);
								setBt(null);
							},
							className: cn("h-9 rounded-full px-3 text-xs font-medium", interval === c.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
							children: c.label
						}, c.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "SL %",
							value: params.slPct ?? 0,
							onChange: (v) => patch({ slPct: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "TP %",
							value: params.tpPct ?? 0,
							onChange: (v) => patch({ tpPct: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Trailing %",
							value: params.trailingPct ?? 0,
							onChange: (v) => patch({ trailingPct: v })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Pause s",
							value: params.cooldownSec ?? (venue === "live" ? 20 : 0),
							onChange: (v) => patch({ cooldownSec: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Spread max %",
							value: params.maxSpreadPct ?? (venue === "live" ? .35 : 0),
							onChange: (v) => patch({ maxSpreadPct: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "% équité / ordre",
							value: params.sizePct ?? 0,
							onChange: (v) => patch({ sizePct: v })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Perte max / jour (EUR)",
						value: params.maxDailyLoss ?? 0,
						onChange: (v) => patch({ maxDailyLoss: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Trades max / jour",
						value: params.maxTradesDay ?? 0,
						onChange: (v) => patch({ maxTradesDay: v })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stop après N pertes d’affilée",
					value: params.maxConsecutiveLoss ?? 0,
					onChange: (v) => patch({ maxConsecutiveLoss: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] leading-relaxed text-subtle",
					children: "0 = désactivé. Le pourcentage d’équité remplace la taille fixe dès qu’il est positif."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-muted/40 p-3 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-foreground",
							children: "Backtest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
							label: "Fenêtre",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1",
								children: [
									7,
									30,
									90
								].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => {
										setBtDays(d);
										setIntervalId(backtestFetchInterval(d, 15));
										setBt(null);
									},
									className: cn("h-9 rounded-full px-3 text-xs font-medium", btDays === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
									children: [d, " j"]
								}, d))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1.5 text-[11px] leading-relaxed text-subtle",
								children: [
									"Kraken ne livre que ~720 bougies. ",
									intervalLabel(backtestFetchInterval(btDays, interval)),
									" pour ",
									btDays,
									" j (15 m ≈ 7 j, 1 h ≈ 30 j, 4 h ≈ 90 j)."
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Capital (EUR)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									value: btCapital,
									onChange: (e) => setBtCapital(e.target.value),
									className: "font-mono tabular-nums"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Slippage (bps)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									inputMode: "decimal",
									value: btSlip,
									onChange: (e) => setBtSlip(e.target.value),
									className: "font-mono tabular-nums"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "w-full",
							onClick: () => void runBacktest(),
							disabled: btBusy,
							children: btBusy ? "Backtest…" : "Lancer le backtest"
						}),
						bt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BacktestReport, {
							result: bt,
							pair
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Mode :",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: venue === "paper" ? "simulation EUR, frais inclus" : "réel Kraken (clés API)"
						})
					]
				}),
				venue === "live" && !hasKeys && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-sell",
					children: "Enregistre tes clés Kraken dans le panneau Réel avant de lancer."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					disabled: busy || venue === "live" && !hasKeys,
					children: "Créer et lancer"
				})
			]
		})
	});
}
function BacktestReport({ result, pair }) {
	const better = result.pnl >= result.buyHoldPnl;
	const exportCsv = () => {
		downloadCsv(`nautilus-backtest-${pair}.csv`, [[
			"time",
			"side",
			"price",
			"pnl",
			"note"
		], ...result.tradeLog.map((t) => [
			new Date(t.time).toISOString(),
			t.side,
			String(t.price),
			String(t.pnl),
			t.note
		])]);
	};
	const from = result.from ? (/* @__PURE__ */ new Date(result.from * 1e3)).toLocaleDateString("fr-FR") : "—";
	const to = result.to ? (/* @__PURE__ */ new Date(result.to * 1e3)).toLocaleDateString("fr-FR") : "—";
	const spanDays = result.from && result.to ? Math.max(1, Math.round((result.to - result.from) / 86400)) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						from,
						" → ",
						to,
						" · ",
						spanDays,
						" j · ",
						intervalLabel(result.interval),
						" · ",
						result.bars,
						" barres"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-1 font-mono text-lg tabular-nums", result.pnl >= 0 ? "text-buy" : "text-sell"),
					children: [
						result.pnl >= 0 ? "+" : "",
						formatFiat(result.pnl, "EUR"),
						" · ",
						formatPct(result.pnlPct)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, { points: result.equityCurve.map((p) => p.v) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Trades",
						value: String(result.trades)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Win rate",
						value: `${result.winRate.toFixed(0)} %`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Facteur",
						value: result.profitFactor.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Drawdown",
						value: formatPct(-result.maxDrawdownPct),
						tone: "sell"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Frais",
						value: formatFiat(result.fees, "EUR")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Expo.",
						value: `${result.exposurePct.toFixed(0)} %`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Buy & hold ",
					formatPct(result.buyHoldPct),
					" (",
					formatFiat(result.buyHoldPnl, "EUR"),
					") · le bot",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: better ? "text-buy" : "text-sell",
						children: better ? "surperforme" : "sous-performe"
					}),
					" · ",
					"espérance ",
					formatFiat(result.expectancy, "EUR"),
					" / vente"
				]
			}),
			result.tradeLog.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "ghost",
				className: "w-full",
				onClick: exportCsv,
				children: "Export CSV des trades"
			})
		]
	});
}
function NumField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			inputMode: "decimal",
			value: value ?? "",
			onChange: (e) => onChange(Number(e.target.value)),
			className: "font-mono tabular-nums"
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "block text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1",
			children
		})]
	});
}
//#endregion
export { BotPage as component };
