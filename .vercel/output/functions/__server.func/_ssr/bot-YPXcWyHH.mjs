import { i as __toESM } from "../_runtime.mjs";
import { $ as defaultSize, B as RISK_PRESETS, Bt as toEurPair, Ct as previewSignal, Et as riskPresetFor, F as BOT_KIND_BY_ID, I as DCA_INTERVALS, It as PAIR_BY_ID, J as botInventoryQty, K as botBlueprint, Mt as walkForward, P as BOT_CANDLE_INTERVALS, Pt as EUR_PAIRS, Q as defaultParams, Rt as backtestFetchInterval, V as applyGridPreset, W as backtestBot, X as botWinRate, Y as botMark, Z as compareStrategies, bt as paperEquity, dt as formatQty, ht as kindNeedsCandles, lt as formatPct, mt as gridFeePadPct, ot as formatDateTime, q as botDeployed, rt as evaluateDesk, st as formatFiat, vt as monteCarloPnl, wt as profitDefaults, yt as optimizeBot, z as GRID_PRESETS, zt as intervalLabel } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as fetchOhlcHistory, i as fetchOhlc, t as cn } from "./utils-CQTqeWMb.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Crosshair, D as Pause, E as Pencil, G as CirclePlus, H as Compass, I as Gauge, K as CircleDot, L as Flame, M as Layers, N as Grip, O as Navigation, R as Droplets, S as Radar, T as Percent, V as Copy, W as Cloud, X as ChartLine, Y as ChartColumn, Z as ChartCandlestick, a as Upload, at as ArrowUpRight, c as Trash2, d as Square, f as Split, i as Volume2, it as BadgeCheck, k as Milestone, l as Target, m as ShieldAlert, r as Waves, rt as Ban, s as TrendingUp, st as Activity, t as Zap, v as Rocket, w as Play, x as Radio, y as Repeat, z as Download } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { t as Segmented } from "./segmented-DgitihsW.mjs";
import { t as Sheet } from "./sheet-hSSPeHqD.mjs";
import { t as Badge } from "./badge-Cl68uAGu.mjs";
import { t as downloadCsv } from "./stats-wybfxzw1.mjs";
import { r as marketSignal } from "./signals-BSZYwJQv.mjs";
import { o as eurValue, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bot-YPXcWyHH.js
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
	ha: ChartCandlestick,
	mfi: Droplets,
	engulf: Flame,
	obv: Radio,
	div: Split,
	confirm: BadgeCheck
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
			"williams",
			"mfi",
			"div"
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
			"ha",
			"obv",
			"confirm"
		]
	},
	{
		title: "Court terme",
		ids: [
			"scalp",
			"volume",
			"engulf"
		]
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cockpit, { venue }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EurRadar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lab, {}),
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BotIo, {
						venue,
						count: visible.length
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
function Cockpit({ venue }) {
	const bots = useTradingStore((s) => s.bots);
	const pauseAllBots = useTradingStore((s) => s.pauseAllBots);
	const panicLive = useTradingStore((s) => s.panicLive);
	const lastTickAt = useTradingStore((s) => s.lastTickAt);
	const liveFeed = useTradingStore((s) => s.live);
	const tickers = useTradingStore((s) => s.tickers);
	const paper = useTradingStore((s) => s.paper);
	const settings = useTradingStore((s) => s.settings);
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const deskPeakPaper = useTradingStore((s) => s.deskPeakPaper);
	const deskPeakLive = useTradingStore((s) => s.deskPeakLive);
	const [confirmPanic, setConfirmPanic] = (0, import_react.useState)(false);
	const mine = bots.filter((b) => b.venue === venue);
	const running = mine.filter((b) => b.status === "running");
	const day = mine.reduce((s, b) => s + (b.runtime.dayPnl ?? 0), 0);
	const pnl = mine.reduce((s, b) => s + b.stats.realizedPnl, 0);
	const stale = lastTickAt > 0 && Date.now() - lastTickAt > 18e3;
	const marks = mine.map((b) => botMark(b.runtime, tickers[b.pair]?.last ?? 0));
	const uPnl = marks.reduce((s, m) => s + m.unrealized, 0);
	const exposure = marks.reduce((s, m) => s + m.exposure, 0);
	const equity = venue === "paper" ? paperEquity(paper, tickers) : Object.entries(krakenBalances).reduce((s, [asset, qty]) => s + eurValue(asset, qty, tickers), 0);
	const peak = venue === "paper" ? Math.max(deskPeakPaper, paper.startingBalance, equity, ...paper.equityCurve.map((p) => p.v)) : Math.max(deskPeakLive, equity);
	const desk = evaluateDesk({
		equity,
		peak,
		dayPnl: day,
		exposure,
		limits: settings
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid grid-cols-3 gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: "Actifs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 font-mono text-lg tabular-nums",
					children: [running.length, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: ["/", mine.length]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: "PnL jour"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-1 font-mono text-lg tabular-nums", day >= 0 ? "text-buy" : "text-sell"),
					children: formatFiat(day, "EUR")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: "Réalisé"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-1 font-mono text-lg tabular-nums", pnl >= 0 ? "text-buy" : "text-sell"),
					children: formatFiat(pnl, "EUR")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: "Non réalisé"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-1 font-mono text-lg tabular-nums", uPnl >= 0 ? "text-buy" : "text-sell"),
					children: formatFiat(uPnl, "EUR")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: "Exposition"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-lg tabular-nums",
					children: formatFiat(exposure, "EUR")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-card px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wide text-subtle",
					children: "Drawdown"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-1 font-mono text-lg tabular-nums", desk.drawdownPct > 0 ? "text-sell" : "text-muted-foreground"),
					children: formatPct(-desk.drawdownPct)
				})]
			}),
			desk.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-3 rounded-lg border border-border bg-card px-3 py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-warning",
					children: desk.note
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-3 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Flux ",
						liveFeed && !stale ? "live" : stale ? "figé" : "en attente",
						venue === "live" ? " · réel Kraken" : " · simulation"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: stale ? "warn" : liveFeed ? "buy" : "neutral",
					children: stale ? "Figé" : liveFeed ? "OK" : "—"
				})]
			}),
			running.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "col-span-3",
				onClick: () => pauseAllBots(venue),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }), "Tout mettre en pause"]
			}),
			venue === "live" && mine.length > 0 && (confirmPanic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
				prompt: "Pause tous les bots réels et vend le spot EUR ouvert.",
				confirmLabel: "Confirmer le stop",
				onConfirm: () => {
					panicLive();
					setConfirmPanic(false);
				},
				onCancel: () => setConfirmPanic(false)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "sell",
				className: "col-span-3",
				onClick: () => setConfirmPanic(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-3.5" }), "Stop d’urgence (pause + vendre)"]
			}))
		]
	});
}
function EurRadar() {
	const tickers = useTradingStore((s) => s.tickers);
	const bots = useTradingStore((s) => s.bots);
	const hot = (0, import_react.useMemo)(() => {
		return EUR_PAIRS.map((p) => {
			const t = tickers[p.id];
			return {
				p,
				t,
				sig: marketSignal(t),
				n: bots.filter((b) => b.pair === p.id && b.status === "running").length,
				move: Math.abs(t?.changePct ?? 0)
			};
		}).sort((a, b) => b.move - a.move);
	}, [tickers, bots]).filter((r) => r.t).slice(0, 12);
	if (hot.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Radar EUR"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
				children: "Les 12 plus gros mouvements 24h. Un point = bot actif."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, {
				className: "size-4 shrink-0 text-accent",
				strokeWidth: 1.75
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 grid grid-cols-2 gap-1",
			children: hot.map((row) => {
				const pct = row.t?.changePct ?? 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/trade/$pair",
					params: { pair: row.p.id },
					className: "flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", row.sig.bias === "buy" ? "bg-buy" : row.sig.bias === "sell" ? "bg-sell" : "bg-subtle") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-xs font-medium",
								children: row.p.displayBase
							}),
							row.n > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 shrink-0 rounded-full bg-accent" })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("shrink-0 font-mono text-xs tabular-nums", pct >= 0 ? "text-buy" : "text-sell"),
						children: formatPct(pct)
					})]
				}) }, row.p.id);
			})
		})]
	});
}
function Lab() {
	const lastPair = useTradingStore((s) => s.lastPair);
	const feeRate = useTradingStore((s) => s.paper.feeRate);
	const [pair, setPair] = (0, import_react.useState)(() => {
		const p = toEurPair(lastPair);
		return EUR_PAIRS.some((x) => x.id === p) ? p : "XBTEUR";
	});
	const [days, setDays] = (0, import_react.useState)(30);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [rows, setRows] = (0, import_react.useState)(null);
	const run = async () => {
		setBusy(true);
		try {
			const fetchInterval = backtestFetchInterval(days, 60);
			const since = Math.floor(Date.now() / 1e3) - days * 86400;
			const hist = await fetchOhlcHistory({ data: {
				pair,
				interval: fetchInterval,
				since,
				days
			} });
			if (hist.candles.length < 40) {
				toast.message("Historique trop court pour comparer");
				setRows([]);
				return;
			}
			const ranked = compareStrategies(hist.candles, feeRate, pair, 200, {
				startingBalance: 1e4,
				slippageBps: 5,
				interval: hist.interval,
				requestedDays: days
			});
			setRows(ranked);
			if (!ranked.length) toast.message("Aucune stratégie n’a clôturé de trade");
		} catch {
			toast.message("Historique Kraken indisponible");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-start justify-between gap-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Laboratoire"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
					children: "Backtest les 27 stratégies sur la même fenêtre, classées par Calmar."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Paire",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: pair,
						onChange: (e) => {
							setPair(e.target.value);
							setRows(null);
						},
						className: "h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground",
						children: EUR_PAIRS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.display
						}, p.id))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Fenêtre",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: [
							7,
							30,
							90
						].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setDays(d);
								setRows(null);
							},
							className: cn("h-9 rounded-full px-3 text-xs font-medium", days === d ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
							children: [d, " j"]
						}, d))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				className: "mt-3 w-full",
				disabled: busy,
				onClick: () => void run(),
				children: busy ? "Comparaison…" : "Comparer les stratégies"
			}),
			rows && rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1",
				children: rows.slice(0, 8).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 truncate",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono tabular-nums text-subtle",
								children: [i + 1, "."]
							}),
							" ",
							row.title
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("shrink-0 font-mono tabular-nums", row.result.pnl >= 0 ? "text-buy" : "text-sell"),
						children: [
							formatPct(row.result.pnlPct),
							" · ",
							row.result.sharpe.toFixed(1),
							"σ"
						]
					})]
				}, row.kind))
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
				children: "Les bots réels envoient des ordres marché spot EUR. Un timeout Kraken met le bot en pause (pas de double ordre). Le garde-fou flux est dans Paramètres. Par défaut ils se mettent en pause au rechargement."
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
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
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
				onClick: () => useTradingStore.getState().pauseAllBots("paper"),
				children: "Pause des bots papier"
			}),
			confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
				prompt: "Efface cash, lots et stats des bots papier.",
				confirmLabel: "Réinitialiser",
				onConfirm: () => {
					resetPaper();
					setConfirmReset(false);
				},
				onCancel: () => setConfirmReset(false)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "mt-1 w-full",
				onClick: () => setConfirmReset(true),
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
function Spark({ points, empty = "badge" }) {
	const d = (0, import_react.useMemo)(() => {
		if (points.length < 2) return null;
		const min = Math.min(...points);
		const span = Math.max(...points) - min || 1;
		return points.map((p, i) => {
			return `${i / (points.length - 1) * 100},${22 - (p - min) / span * 20}`;
		}).join(" ");
	}, [points]);
	if (!d) return empty === "badge" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "accent",
		children: "Papier"
	}) : null;
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
function BotIo({ venue, count }) {
	const bots = useTradingStore((s) => s.bots);
	const importBots = useTradingStore((s) => s.importBots);
	const inputRef = (0, import_react.useRef)(null);
	const mine = bots.filter((b) => b.venue === venue);
	const exportMine = () => {
		const payload = {
			v: 1,
			bots: mine.map(botBlueprint)
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `nautilus-bots-${venue}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast.message(`${mine.length} bot${mine.length > 1 ? "s" : ""} exporté${mine.length > 1 ? "s" : ""}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mr-1 text-xs text-subtle",
				children: count
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: "application/json,.json",
				className: "hidden",
				onChange: (e) => {
					const file = e.target.files?.[0];
					e.target.value = "";
					if (!file) return;
					file.text().then((text) => {
						try {
							const res = importBots(JSON.parse(text));
							toast.message(res.message);
						} catch {
							toast.message("Fichier JSON illisible");
						}
					});
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: exportMine,
				disabled: mine.length === 0,
				"aria-label": "Exporter",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => inputRef.current?.click(),
				"aria-label": "Importer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" })
			})
		]
	});
}
function BotCard({ bot }) {
	const startBot = useTradingStore((s) => s.startBot);
	const pauseBot = useTradingStore((s) => s.pauseBot);
	const removeBot = useTradingStore((s) => s.removeBot);
	const duplicateBot = useTradingStore((s) => s.duplicateBot);
	const toggleBuyPause = useTradingStore((s) => s.toggleBuyPause);
	const seedGrid = useTradingStore((s) => s.seedGrid);
	const ticker = useTradingStore((s) => s.tickers[bot.pair]);
	const paperFee = useTradingStore((s) => s.paper.feeRate);
	const liveFee = useTradingStore((s) => s.settings.takerFee);
	const connection = useTradingStore((s) => s.connection);
	const paperTrades = useTradingStore((s) => s.paper.trades);
	const liveFills = useTradingStore((s) => s.liveFills);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const Icon = KIND_ICON[bot.kind] ?? Grip;
	const meta = PAIR_BY_ID[bot.pair];
	const running = bot.status === "running";
	const winRate = botWinRate(bot.stats);
	const uPnl = botMark(bot.runtime, ticker?.last ?? 0).unrealized;
	const sparkPts = (0, import_react.useMemo)(() => {
		const rows = (bot.venue === "paper" ? paperTrades : liveFills).filter((t) => t.botId === bot.id);
		const pts = [0];
		let acc = 0;
		for (const t of [...rows].reverse()) {
			if (t.side !== "sell") continue;
			acc += t.pnl;
			pts.push(acc);
		}
		return pts;
	}, [
		bot.id,
		bot.venue,
		paperTrades,
		liveFills
	]);
	const launch = () => {
		const res = startBot(bot.id);
		if (!res.ok) toast.message(res.message);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setOpen(true),
				className: "flex w-full items-start justify-between gap-3 text-left",
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
								ticker ? ` · ${formatQty(ticker.last, meta?.pairDecimals ?? 2)}` : "",
								kindNeedsCandles(bot.kind) ? ` · ${intervalLabel(bot.interval)}` : ""
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col items-end gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: running ? "buy" : bot.status === "error" ? "sell" : "neutral",
						children: bot.runtime.inFlight ? "Envoi…" : running ? bot.runtime.buyPause ? "Vente seule" : "Actif" : bot.status === "paused" ? "Pause" : bot.status === "error" ? "Erreur" : "Arrêté"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
						points: sparkPts,
						empty: "none"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-relaxed text-muted-foreground",
				children: bot.lastNote
			}),
			bot.kind === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridStatus, {
				bot,
				last: ticker?.last,
				feeRate: bot.venue === "live" ? liveFee : paperFee
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
						value: bot.stats.closes ? `${Math.round(winRate)} %` : "—"
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
			confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmBar, {
				prompt: "Supprimer ce bot et son journal local.",
				confirmLabel: "Supprimer",
				onConfirm: () => {
					removeBot(bot.id);
					setConfirmDelete(false);
				},
				onCancel: () => setConfirmDelete(false)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					bot.kind === "grid" && running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => toggleBuyPause(bot.id),
						"aria-label": bot.runtime.buyPause ? "Reprendre les achats" : "Pause achats",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "size-3.5" })
					}),
					bot.kind === "grid" && running && !(bot.runtime.gridOwned ?? []).some((g) => g.qty > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							const res = seedGrid(bot.id);
							toast.message(res.message);
						},
						"aria-label": "Prendre le premier lot",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setOpen(true),
						"aria-label": "Détail",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" })
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
						onClick: () => setConfirmDelete(true),
						"aria-label": "Supprimer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
					})
				]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BotDetail, {
				botId: bot.id,
				onClose: () => setOpen(false)
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
	const ticker = useTradingStore((s) => s.tickers[pair]);
	const [name, setName] = (0, import_react.useState)("");
	const [size, setSize] = (0, import_react.useState)(String(defaultSize(kind)));
	const [interval, setIntervalId] = (0, import_react.useState)(60);
	const [params, setParams] = (0, import_react.useState)(() => defaultParams(kind, pairLast || 100));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [bt, setBt] = (0, import_react.useState)(null);
	const [btBusy, setBtBusy] = (0, import_react.useState)(false);
	const [btDays, setBtDays] = (0, import_react.useState)(30);
	const [btCapital, setBtCapital] = (0, import_react.useState)("10000");
	const [btSlip, setBtSlip] = (0, import_react.useState)("5");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [opt, setOpt] = (0, import_react.useState)(null);
	const [optBusy, setOptBusy] = (0, import_react.useState)(false);
	const [wf, setWf] = (0, import_react.useState)(null);
	const [wfBusy, setWfBusy] = (0, import_react.useState)(false);
	const histRef = (0, import_react.useRef)(null);
	const previewCandles = (0, import_react.useRef)(null);
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
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (!kindNeedsCandles(kind)) {
			setPreview(null);
			return;
		}
		fetchOhlc({ data: {
			pair,
			interval
		} }).then((rows) => {
			if (cancelled) return;
			previewCandles.current = rows;
			const t = useTradingStore.getState().tickers[pair];
			if (!t) return;
			const n = Number(size);
			setPreview(previewSignal(kind, params, n > 0 ? n : 100, {
				now: Date.now(),
				ticker: t,
				candles: rows,
				equity: 1e4
			}, pair));
		}).catch(() => {
			if (!cancelled) setPreview(null);
		});
		return () => {
			cancelled = true;
		};
	}, [
		kind,
		pair,
		interval
	]);
	(0, import_react.useEffect)(() => {
		const rows = previewCandles.current;
		const t = ticker;
		if (!rows || !t || !kindNeedsCandles(kind)) return;
		const n = Number(size);
		setPreview(previewSignal(kind, params, n > 0 ? n : 100, {
			now: Date.now(),
			ticker: t,
			candles: rows,
			equity: 1e4
		}, pair));
	}, [
		kind,
		params,
		size,
		ticker,
		pair
	]);
	const saveBot = (launch) => {
		const n = Number(size);
		if (!(n > 0)) return;
		if (venue === "live" && !hasKeys) return;
		const stacked = useTradingStore.getState().bots.filter((b) => b.venue === venue && b.pair === pair && b.status === "running").length;
		setBusy(true);
		const bot = createBot({
			kind,
			venue,
			pair,
			interval,
			sizeQuote: n,
			name: name.trim() || void 0,
			params: {
				...params,
				cooldownSec: params.cooldownSec ?? (venue === "live" ? 20 : 0),
				maxSpreadPct: params.maxSpreadPct ?? (venue === "live" ? .35 : 0)
			}
		});
		if (launch) {
			const res = startBot(bot.id);
			if (!res.ok) toast.message(res.message);
			else if (stacked > 0) toast.message(`${stacked + 1} bots actifs sur ${PAIR_BY_ID[pair]?.display ?? pair}`);
		} else toast.message(stacked > 0 ? `Bot créé · ${stacked} déjà actif${stacked > 1 ? "s" : ""} sur cette paire` : "Bot créé à l’arrêt");
		setBusy(false);
		onClose();
	};
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
			histRef.current = candles;
			setBt(result);
			setOpt(null);
			setWf(null);
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
				saveBot(true);
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
				preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("rounded-md px-3 py-2 text-xs leading-relaxed", preview.side === "buy" ? "bg-buy/15 text-buy" : preview.side === "sell" ? "bg-sell/15 text-sell" : "bg-muted text-muted-foreground"),
					children: [
						"Maintenant : ",
						preview.side === "buy" ? "signal achat" : preview.side === "sell" ? "signal vente" : "pas de signal",
						" — ",
						preview.note
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nom",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: `${info.title} ${PAIR_BY_ID[pair]?.display ?? pair}`
					})
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindParamsFields, {
					kind,
					params,
					patch,
					last: pairLast || 100,
					sizeQuote: Number(size) || defaultSize(kind),
					feeRate
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Profil de risque",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: RISK_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => patch(riskPresetFor(kind, p)),
							className: "h-9 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground",
							children: p.label
						}, p.id))
					})
				}),
				kind !== "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Filtre EMA tendance",
							value: params.trendEma ?? 0,
							onChange: (v) => patch({ trendEma: v })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Stop ATR ×",
							value: params.slAtr ?? 0,
							onChange: (v) => patch({ slAtr: v })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "TP partiel %",
							value: params.partialTp ?? 0,
							onChange: (v) => patch({ partialTp: v })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Max hold (min)",
							value: params.maxHoldMin ?? 0,
							onChange: (v) => patch({ maxHoldMin: v })
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Session UTC début",
						value: params.sessionStart ?? 0,
						onChange: (v) => patch({ sessionStart: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Session UTC fin",
						value: params.sessionEnd ?? 0,
						onChange: (v) => patch({ sessionEnd: v })
					})]
				}),
				kind !== "grid" && kind !== "dca" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "ADX max",
							value: params.adxCeil ?? 0,
							onChange: (v) => patch({ adxCeil: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "ADX min",
							value: params.adxFloor ?? 0,
							onChange: (v) => patch({ adxFloor: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Krach %",
							value: params.crashPct ?? 0,
							onChange: (v) => patch({ crashPct: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Verrou %",
							value: params.beAfterPct ?? 0,
							onChange: (v) => patch({ beAfterPct: v })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] leading-relaxed text-subtle",
					children: "Profil gain déjà actif sur un nouveau bot. ADX max bloque la réversion en tendance forte, ADX min ignore le range pour le suivi. Krach : pas d’achat de réversion si la bougie chute de ce %. Verrou : dès ce gain, le stop remonte au prix d’achat plus les frais. Un TP plus petit que l’aller-retour de frais est relevé. 0 = off. Rien ici ne garantit un bénéfice."
				})] }),
				kind !== "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] leading-relaxed text-subtle",
					children: "Filtre EMA : n’achète que si le prix est au-dessus de l’EMA. Stop ATR : clôture si le prix recule de N × ATR. Le trailing ne s’arme qu’une fois le gain au moins égal au trailing. TP partiel vend ce % puis laisse courir. Session 0/0 = 24h. Hold max force la sortie. 0 = off."
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Risque ATR % équité",
					value: params.atrRiskPct ?? 0,
					onChange: (v) => patch({ atrRiskPct: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] leading-relaxed text-subtle",
					children: "Risque ATR : taille = (équité × %) / ATR. Prioritaire sur le % d’équité fixe."
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
										setBt(null);
										setOpt(null);
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
						bt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							className: "w-full",
							disabled: optBusy || !histRef.current,
							onClick: () => {
								const candles = histRef.current;
								if (!candles) return;
								setOptBusy(true);
								try {
									const n = Number(size);
									const rows = optimizeBot(kind, params, n > 0 ? n : 100, candles, feeRate, pair, {
										startingBalance: Number(btCapital) > 0 ? Number(btCapital) : 1e4,
										slippageBps: Number(btSlip) || 0,
										interval: bt.interval,
										requestedDays: btDays
									});
									setOpt(rows);
									if (!rows.length) toast.message("Pas assez de trades pour comparer");
								} finally {
									setOptBusy(false);
								}
							},
							children: optBusy ? "Optimisation…" : "Optimiser les paramètres"
						}),
						opt && opt.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1.5",
							children: opt.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setParams(row.params);
									setBt(row.result);
								},
								className: "flex w-full items-center justify-between rounded-md bg-background px-3 py-2 text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: row.result.pnl >= 0 ? "text-buy" : "text-sell",
									children: [
										formatPct(row.result.pnlPct),
										" · DD ",
										row.result.maxDrawdownPct.toFixed(0),
										"%"
									]
								})]
							}) }, row.label))
						}),
						bt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							className: "w-full",
							disabled: wfBusy || !histRef.current,
							onClick: () => {
								const candles = histRef.current;
								if (!candles) return;
								setWfBusy(true);
								try {
									const n = Number(size);
									setWf(walkForward(kind, params, n > 0 ? n : 100, candles, feeRate, pair, {
										startingBalance: Number(btCapital) > 0 ? Number(btCapital) : 1e4,
										slippageBps: Number(btSlip) || 0,
										interval: bt.interval,
										requestedDays: btDays
									}));
								} finally {
									setWfBusy(false);
								}
							},
							children: wfBusy ? "Walk-forward…" : "Validation walk-forward (70/30)"
						}),
						wf && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-background px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-subtle",
									children: "In-sample"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("mt-1 font-mono tabular-nums", (wf.inSample?.pnl ?? 0) >= 0 ? "text-buy" : "text-sell"),
									children: wf.inSample ? formatPct(wf.inSample.pnlPct) : "—"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-background px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-subtle",
									children: "Out-of-sample"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("mt-1 font-mono tabular-nums", (wf.outSample?.pnl ?? 0) >= 0 ? "text-buy" : "text-sell"),
									children: wf.outSample ? formatPct(wf.outSample.pnlPct) : "—"
								})]
							})]
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: busy || venue === "live" && !hasKeys,
						onClick: () => saveBot(false),
						children: "Créer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || venue === "live" && !hasKeys,
						children: "Créer et lancer"
					})]
				})
			]
		})
	});
}
function BacktestReport({ result, pair }) {
	const better = result.pnl >= result.buyHoldPnl;
	const mc = (0, import_react.useMemo)(() => monteCarloPnl(result.tradeLog.filter((t) => t.side === "sell").map((t) => t.pnl), result.startEquity), [result]);
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
						label: "Calmar",
						value: result.calmar.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sharpe",
						value: result.sharpe.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sortino",
						value: result.sortino.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Hold moy.",
						value: `${result.avgHoldMin.toFixed(0)} min`
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
					" / vente",
					result.openQty > 0 ? ` · position ouverte ${formatQty(result.openQty, 6)}` : ""
				]
			}),
			mc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Monte Carlo ",
					mc.samples,
					" mélanges · p5 ",
					formatFiat(mc.p5, "EUR"),
					" · médiane ",
					formatFiat(mc.p50, "EUR"),
					" · p95",
					" ",
					formatFiat(mc.p95, "EUR"),
					mc.ruinPct > 0 ? ` · ruine ${mc.ruinPct.toFixed(0)} %` : ""
				]
			}),
			result.tradeLog.slice(0, 8).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1 text-[11px] text-muted-foreground",
				children: result.tradeLog.slice(0, 8).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2 font-mono tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: t.side === "buy" ? "text-buy" : "text-sell",
						children: [
							t.side === "buy" ? "Achat" : "Vente",
							" ",
							formatQty(t.price, 2)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: t.pnl >= 0 ? "text-buy" : "text-sell",
						children: t.side === "sell" ? formatFiat(t.pnl, "EUR") : t.note
					})]
				}, `${t.time}-${i}`))
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
function BotDetail({ botId, onClose }) {
	const bot = useTradingStore((s) => s.bots.find((b) => b.id === botId));
	const updateBot = useTradingStore((s) => s.updateBot);
	const flattenBot = useTradingStore((s) => s.flattenBot);
	const cloneBotToPair = useTradingStore((s) => s.cloneBotToPair);
	const paperAll = useTradingStore((s) => s.paper.trades);
	const feeRate = useTradingStore((s) => s.paper.feeRate);
	const seedGrid = useTradingStore((s) => s.seedGrid);
	const liveAll = useTradingStore((s) => s.liveFills);
	const paperTrades = paperAll.filter((t) => t.botId === botId).slice(0, 12);
	const liveTrades = liveAll.filter((t) => t.botId === botId).slice(0, 12);
	const ticker = useTradingStore((s) => bot ? s.tickers[bot.pair] : void 0);
	const liveFee = useTradingStore((s) => s.settings.takerFee);
	const [name, setName] = (0, import_react.useState)(bot?.name ?? "");
	const [size, setSize] = (0, import_react.useState)(String(bot?.sizeQuote ?? 0));
	const [params, setParams] = (0, import_react.useState)(bot?.params ?? {});
	const [clonePair, setClonePair] = (0, import_react.useState)(bot?.pair ?? "ETHEUR");
	const [confirmFlat, setConfirmFlat] = (0, import_react.useState)(false);
	if (!bot) return null;
	const running = bot.status === "running";
	const trades = bot.venue === "live" ? liveTrades : paperTrades;
	const info = BOT_KIND_BY_ID[bot.kind];
	const patch = (p) => setParams((prev) => ({
		...prev,
		...p
	}));
	const deployed = botDeployed(bot.runtime);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		title: bot.name,
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 px-4 pb-6 pt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: info?.blurb
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						PAIR_BY_ID[bot.pair]?.display,
						" · ",
						intervalLabel(bot.interval),
						" · ",
						bot.lastNote
					]
				}),
				ticker && botInventoryQty(bot.runtime) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs tabular-nums",
					children: [
						"Position ",
						formatQty(botInventoryQty(bot.runtime), 6),
						" @ ",
						formatFiat(bot.runtime.positionAvg ?? 0, "EUR"),
						deployed > 0 ? ` · déployé ${formatFiat(deployed, "EUR")}` : ""
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Hors marché"
				}),
				bot.kind === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridBook, {
					bot,
					last: ticker?.last,
					feeRate: bot.venue === "live" ? liveFee : feeRate
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nom",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						disabled: running
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Taille par ordre (EUR)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: size,
						onChange: (e) => setSize(e.target.value),
						disabled: running,
						className: "font-mono tabular-nums"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindParamsFields, {
					kind: bot.kind,
					params,
					patch,
					last: ticker?.last || bot.params.lower || 100,
					sizeQuote: Number(size) || bot.sizeQuote,
					feeRate: bot.venue === "live" ? liveFee : feeRate
				}),
				bot.kind !== "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "SL %",
								value: params.slPct ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									slPct: v
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "TP %",
								value: params.tpPct ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									tpPct: v
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "Trailing %",
								value: params.trailingPct ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									trailingPct: v
								}))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Filtre EMA",
							value: params.trendEma ?? 0,
							onChange: (v) => setParams((p) => ({
								...p,
								trendEma: v
							}))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Stop ATR ×",
							value: params.slAtr ?? 0,
							onChange: (v) => setParams((p) => ({
								...p,
								slAtr: v
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "TP partiel %",
							value: params.partialTp ?? 0,
							onChange: (v) => setParams((p) => ({
								...p,
								partialTp: v
							}))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Max hold min",
							value: params.maxHoldMin ?? 0,
							onChange: (v) => setParams((p) => ({
								...p,
								maxHoldMin: v
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "ADX max",
								value: params.adxCeil ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									adxCeil: v
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "ADX min",
								value: params.adxFloor ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									adxFloor: v
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "Krach %",
								value: params.crashPct ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									crashPct: v
								}))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "Verrou %",
								value: params.beAfterPct ?? 0,
								onChange: (v) => setParams((p) => ({
									...p,
									beAfterPct: v
								}))
							})
						]
					}),
					!running && bot.kind !== "dca" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => setParams((p) => ({
							...p,
							...profitDefaults(bot.kind)
						})),
						children: "Appliquer le profil gain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Session début",
							value: params.sessionStart ?? 0,
							onChange: (v) => setParams((p) => ({
								...p,
								sessionStart: v
							}))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Session fin",
							value: params.sessionEnd ?? 0,
							onChange: (v) => setParams((p) => ({
								...p,
								sessionEnd: v
							}))
						})]
					})
				] }),
				bot.kind === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stop global % (aplatit toute la grille)",
					value: params.slPct ?? 0,
					onChange: (v) => setParams((p) => ({
						...p,
						slPct: v
					}))
				}),
				running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-warning",
					children: "Mets le bot en pause pour modifier les paramètres."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: running,
						onClick: () => {
							const n = Number(size);
							updateBot(bot.id, {
								name: name.trim() || bot.name,
								sizeQuote: n > 0 ? n : bot.sizeQuote,
								params
							});
							toast.message("Paramètres enregistrés");
							onClose();
						},
						children: "Enregistrer"
					}), confirmFlat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "sell",
						onClick: () => {
							flattenBot(bot.id);
							setConfirmFlat(false);
						},
						children: "Confirmer"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => setConfirmFlat(true),
						children: "Clôturer la position"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Cloner sur une autre paire",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: clonePair,
							onChange: (e) => setClonePair(e.target.value),
							className: "h-11 min-w-0 flex-1 rounded-md border border-border bg-muted px-3 text-sm text-foreground",
							children: EUR_PAIRS.filter((p) => p.id !== bot.pair).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.display
							}, p.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => {
								const copy = cloneBotToPair(bot.id, clonePair);
								if (copy) {
									toast.message(`${copy.name} créé`);
									onClose();
								}
							},
							children: "Cloner"
						})]
					})
				}),
				bot.kind === "grid" && running && !(bot.runtime.gridOwned ?? []).some((g) => g.qty > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					className: "w-full",
					onClick: () => {
						const res = seedGrid(bot.id);
						toast.message(res.message);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "size-3.5" }), "Prendre le premier lot au marché"]
				}),
				trades.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					className: "w-full",
					onClick: () => {
						downloadCsv(`nautilus-bot-${bot.pair}.csv`, [[
							"time",
							"side",
							"price",
							"qty",
							"pnl",
							"note"
						], ...trades.map((t) => [
							new Date(t.time).toISOString(),
							t.side,
							String(t.price),
							String(t.amount),
							String(t.pnl),
							t.note ?? ""
						])]);
					},
					children: "Exporter les fills (CSV)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/trade/$pair",
					params: { pair: bot.pair },
					className: "block text-center text-xs text-accent",
					children: ["Ouvrir le carnet ", PAIR_BY_ID[bot.pair]?.display]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Journal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 divide-y divide-border rounded-lg border border-border",
					children: [(bot.log ?? []).slice(0, 12).length === 0 && trades.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-3 text-xs text-muted-foreground",
						children: "Aucun événement."
					}), (bot.log ?? []).slice(0, 10).map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-3 py-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular-nums text-subtle",
							children: formatDateTime(e.t)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-muted-foreground",
							children: e.text
						})]
					}, `${e.t}-${i}`))]
				})] }),
				trades.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: "Derniers fills"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1",
					children: trades.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: t.side === "buy" ? "text-buy" : "text-sell",
							children: t.side === "buy" ? "Achat" : "Vente"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular-nums",
							children: formatFiat(t.pnl, "EUR")
						})]
					}, t.id))
				})] })
			]
		})
	});
}
function KindParamsFields({ kind, params, patch, last, sizeQuote, feeRate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		kind === "grid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridParamsFields, {
			params,
			patch,
			last,
			sizeQuote,
			feeRate
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
		kind === "scalp" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
			label: "RSI scalp",
			value: params.rsiPeriod ?? 7,
			onChange: (v) => patch({ rsiPeriod: v })
		}),
		kind === "mfi" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Période",
					value: params.rsiPeriod ?? 14,
					onChange: (v) => patch({ rsiPeriod: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Sous-flux",
					value: params.oversold ?? 20,
					onChange: (v) => patch({ oversold: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Sur-flux",
					value: params.overbought ?? 80,
					onChange: (v) => patch({ overbought: v })
				})
			]
		}),
		kind === "engulf" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs leading-relaxed text-subtle",
			children: "Pas de paramètre d’indicateur — uniquement le motif de bougie."
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
		kind === "obv" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
			label: "EMA de l’OBV",
			value: params.fast ?? 20,
			onChange: (v) => patch({ fast: v })
		}),
		kind === "div" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Période RSI",
					value: params.rsiPeriod ?? 14,
					onChange: (v) => patch({ rsiPeriod: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Zone basse",
					value: params.oversold ?? 40,
					onChange: (v) => patch({ oversold: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Sortie",
					value: params.overbought ?? 70,
					onChange: (v) => patch({ overbought: v })
				})
			]
		}),
		kind === "confirm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-relaxed text-subtle",
					children: "Achat seulement si l’EMA rapide est au-dessus de la lente, le MACD est positif, et le RSI sort de survente."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "EMA rapide",
						value: params.fast ?? 9,
						onChange: (v) => patch({ fast: v })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "EMA lente",
						value: params.slow ?? 21,
						onChange: (v) => patch({ slow: v })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Période RSI",
							value: params.rsiPeriod ?? 14,
							onChange: (v) => patch({ rsiPeriod: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Survente",
							value: params.oversold ?? 35,
							onChange: (v) => patch({ oversold: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
							label: "Surachat",
							value: params.overbought ?? 70,
							onChange: (v) => patch({ overbought: v })
						})
					]
				})
			]
		})
	] });
}
function GridParamsFields({ params, patch, last, sizeQuote, feeRate }) {
	const pad = gridFeePadPct(feeRate, params.gridNetFees !== false);
	const levels = params.levels ?? 8;
	const exposure = Math.max(0, sizeQuote) * levels;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-muted-foreground",
				children: "Chaque lot se revend à +X % de son prix d’achat. Après un achat, un nouvel ordre est placé Y % plus bas. Après une vente, le bot rachète au prix d’achat mémorisé."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: GRID_PRESETS.map((pre) => {
					const on = params.gridSellPct === pre.sell && params.gridBuyPct === pre.buy && (params.levels ?? 8) === pre.levels;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => patch(applyGridPreset(last || 100, pre, {
							slPct: params.slPct,
							tpPct: params.tpPct,
							cooldownSec: params.cooldownSec,
							gridNetFees: params.gridNetFees,
							gridSeed: params.gridSeed,
							compoundPct: params.compoundPct,
							gridSlPct: params.gridSlPct,
							gridFollow: params.gridFollow,
							gridSlCooldownMin: params.gridSlCooldownMin,
							budgetQuote: params.budgetQuote
						})),
						className: cn("h-9 rounded-full px-3 text-xs font-medium", on ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
						children: pre.label
					}, pre.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Revente %",
					value: params.gridSellPct ?? 1.5,
					onChange: (v) => patch({ gridSellPct: v })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Rachat plus bas %",
					value: params.gridBuyPct ?? 1,
					onChange: (v) => patch({ gridBuyPct: v })
				})]
			}),
			pad > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: [
					"Revente nette ",
					params.gridSellPct ?? 1.5,
					" % → déclenchement à ",
					(params.gridSellPct ?? 1.5) + pad,
					" % brut (frais aller-retour)."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Plancher",
						value: params.lower,
						onChange: (v) => patch({ lower: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Plafond",
						value: params.upper,
						onChange: (v) => patch({ upper: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
						label: "Lots max",
						value: levels,
						onChange: (v) => patch({ levels: v })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: [
					"Exposition max ",
					formatFiat(exposure, "EUR"),
					" (",
					levels,
					" × ",
					formatFiat(sizeQuote, "EUR"),
					")"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Stop lot %",
					value: params.gridSlPct ?? 0,
					onChange: (v) => patch({ gridSlPct: v })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: "Réinvestir %",
					value: params.compoundPct ?? 0,
					onChange: (v) => patch({ compoundPct: v })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
				label: "Pause achats après stop (min)",
				value: params.gridSlCooldownMin ?? 0,
				onChange: (v) => patch({ gridSlCooldownMin: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
				label: "Budget max (EUR, 0 = illimité)",
				value: params.budgetQuote ?? 0,
				onChange: (v) => patch({ budgetQuote: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => patch({ gridFollow: !params.gridFollow }),
				className: cn("h-11 w-full rounded-md text-xs font-medium", params.gridFollow ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
				children: params.gridFollow ? "Suivi de fourchette activé" : "Suivi de fourchette désactivé"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => patch({ gridNetFees: params.gridNetFees === false }),
				className: cn("h-11 w-full rounded-md text-xs font-medium", params.gridNetFees !== false ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
				children: params.gridNetFees !== false ? "Revente nette de frais" : "Revente brute (hors frais)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => patch({ gridSeed: !params.gridSeed }),
				className: cn("h-11 w-full rounded-md text-xs font-medium", params.gridSeed ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
				children: params.gridSeed ? "Premier lot au marché au lancement" : "Attendre un creux pour le premier lot"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-subtle",
				children: "Stop lot : coupe un lot perdant sans le racheter. Pause après stop : aucun nouvel achat pendant X minutes. Réinvestir : ajoute X % du gain à la taille du prochain ordre. Suivi : recentre plancher/plafond si le prix sort de la bande et qu’aucun lot n’est ouvert."
			})
		]
	});
}
function gridLots(bot) {
	const rows = bot.runtime.gridOwned ?? [];
	return {
		held: rows.filter((g) => g.qty > 0),
		pending: rows.filter((g) => g.pending)
	};
}
function GridStatus({ bot, last, feeRate }) {
	const { held, pending } = gridLots(bot);
	if (!held.length && !pending.length && !(last && (bot.params.lower ?? 0) > 0)) return null;
	const sellPct = (bot.params.gridSellPct ?? 1.5) + gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
	const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
	const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
	const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
	const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
	const deployed = botDeployed(bot.runtime);
	const cap = bot.params.budgetQuote ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 space-y-2",
		children: [lo > 0 && hi > lo && last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridLadder, {
			lo,
			hi,
			last,
			nextBuy,
			nextSell
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-mono text-xs tabular-nums text-subtle",
			children: [
				held.length,
				" lot",
				held.length > 1 ? "s" : "",
				pending.length ? ` · ${pending.length} achat${pending.length > 1 ? "s" : ""}` : "",
				nextBuy ? ` · achat ${formatFiat(nextBuy, "EUR")}` : "",
				nextSell ? ` · vente ${formatFiat(nextSell, "EUR")}` : "",
				deployed > 0 ? ` · ${formatFiat(deployed, "EUR")}` : "",
				cap > 0 ? ` / ${formatFiat(cap, "EUR")}` : "",
				bot.runtime.inFlight ? " · envoi…" : ""
			]
		})]
	});
}
function GridLadder({ lo, hi, last, nextBuy, nextSell }) {
	const span = hi - lo;
	const pct = (p) => Math.max(0, Math.min(100, (p - lo) / span * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-2 rounded-full bg-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-y-0 left-0 rounded-full bg-accent/30",
				style: { width: `${pct(Math.min(last, hi))}%` }
			}),
			nextBuy != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-buy",
				style: { left: `${pct(nextBuy)}%` }
			}),
			nextSell != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sell",
				style: { left: `${pct(nextSell)}%` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground",
				style: { left: `${pct(last)}%` }
			})
		]
	});
}
function GridBook({ bot, last, feeRate }) {
	const { held, pending } = gridLots(bot);
	const sellPct = (bot.params.gridSellPct ?? 1.5) + gridFeePadPct(feeRate, bot.params.gridNetFees !== false);
	const lo = bot.runtime.gridLower ?? bot.params.lower ?? 0;
	const hi = bot.runtime.gridUpper ?? bot.params.upper ?? 0;
	const nextSell = held.map((g) => g.entry * (1 + sellPct / 100)).sort((a, b) => a - b)[0];
	const nextBuy = pending.map((g) => g.price).sort((a, b) => b - a)[0];
	if (!held.length && !pending.length && !(lo > 0 && hi > lo && last)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 rounded-lg border border-border bg-muted px-3 py-2",
		children: [
			lo > 0 && hi > lo && last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridLadder, {
				lo,
				hi,
				last,
				nextBuy,
				nextSell
			}) : null,
			held.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Lots en portefeuille"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1 space-y-1",
				children: held.slice().sort((a, b) => b.entry - a.entry).map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2 font-mono text-xs tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						formatQty(g.qty, 6),
						" @ ",
						formatFiat(g.entry, "EUR")
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-buy",
						children: ["vente ", formatFiat(g.entry * (1 + sellPct / 100), "EUR")]
					})]
				}, `h-${g.entry}-${i}`))
			})] }),
			pending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: "Ordres d’achat"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1 space-y-1",
				children: pending.slice().sort((a, b) => b.price - a.price).map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2 font-mono text-xs tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["limite ", formatFiat(g.price, "EUR")] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "en attente"
					})]
				}, `p-${g.price}-${i}`))
			})] })
		]
	});
}
function NumField({ label, value, onChange }) {
	const [raw, setRaw] = (0, import_react.useState)(() => value == null || Number.isNaN(value) ? "" : String(value));
	(0, import_react.useEffect)(() => {
		const parsed = Number(raw.replace(",", "."));
		if (raw === "" || raw === "-" || raw === "." || raw === "-." || Number.isNaN(parsed) || parsed !== value) {
			if (Number.isFinite(parsed) && parsed === value) return;
			setRaw(value == null || Number.isNaN(value) ? "" : String(value));
		}
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			inputMode: "decimal",
			value: raw,
			onChange: (e) => {
				const t = e.target.value.replace(",", ".");
				if (t !== "" && !/^-?\d*\.?\d*$/.test(t)) return;
				setRaw(t);
				if (t === "" || t === "-" || t === "." || t === "-.") return;
				const n = Number(t);
				if (Number.isFinite(n)) onChange(n);
			},
			onBlur: () => {
				setRaw(value == null || Number.isNaN(value) ? "" : String(value));
			},
			className: "font-mono tabular-nums"
		})
	});
}
function ConfirmBar({ prompt, confirmLabel, onConfirm, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "col-span-3 mt-2 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground",
				children: prompt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "sell",
				onClick: onConfirm,
				children: confirmLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: onCancel,
				children: "Annuler"
			})
		]
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
