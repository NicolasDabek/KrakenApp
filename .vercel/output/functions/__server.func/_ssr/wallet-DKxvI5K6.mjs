import { i as __toESM } from "../_runtime.mjs";
import { It as PAIR_BY_ID, dt as formatQty, lt as formatPct, st as formatFiat } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as krakenDeposit, t as cn } from "./utils-CQTqeWMb.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { t as Sheet } from "./sheet-hSSPeHqD.mjs";
import { t as Badge } from "./badge-Cl68uAGu.mjs";
import { c as liveBalanceRows, l as usdValue, s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-DKxvI5K6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WalletPage() {
	const demoBalances = useTradingStore((s) => s.balances);
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const connection = useTradingStore((s) => s.connection);
	const live = isLiveConnected(connection);
	const balances = live ? liveBalanceRows(krakenBalances) : demoBalances;
	const tickers = useTradingStore((s) => s.tickers);
	const quote = useTradingStore((s) => s.settings.displayQuote);
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [asset, setAsset] = (0, import_react.useState)("BTC");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [deposit, setDeposit] = (0, import_react.useState)(null);
	const [depositBusy, setDepositBusy] = (0, import_react.useState)(false);
	const rows = (0, import_react.useMemo)(() => {
		return balances.map((b) => {
			const usd = usdValue(b.asset, b.available + b.hold, tickers);
			const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === b.asset && PAIR_BY_ID[x.id]?.quote === "USD");
			return {
				...b,
				usd,
				changePct: t?.changePct ?? 0
			};
		}).filter((b) => b.available + b.hold > 0 || b.usd > .5).sort((a, b) => b.usd - a.usd);
	}, [balances, tickers]);
	const totalUsd = rows.reduce((s, r) => s + r.usd, 0);
	const dayPnl = rows.reduce((s, r) => s + r.usd * (r.changePct / 100), 0);
	const dayPct = totalUsd ? dayPnl / (totalUsd - dayPnl) * 100 : 0;
	const fx = usdValue("EUR", 1, tickers) || 1.08;
	const shown = quote === "EUR" ? totalUsd / fx : totalUsd;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Valeur estimée"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-3xl font-medium tabular-nums tracking-tight",
						children: formatFiat(shown, quote)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("mt-1 font-mono text-sm tabular-nums", dayPnl >= 0 ? "text-buy" : "text-sell"),
						children: [
							formatFiat(dayPnl, "USD"),
							" · ",
							formatPct(dayPct),
							" / 24h"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: live ? "buy" : "warn",
						children: live ? "Kraken" : "Démo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocRing, { slices: rows.map((r) => ({
						id: r.asset,
						pct: totalUsd ? r.usd / totalUsd * 100 : 0
					})) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex h-2 overflow-hidden rounded-full bg-muted",
				children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					title: r.asset,
					className: "h-full",
					style: {
						width: `${totalUsd ? r.usd / totalUsd * 100 : 0}%`,
						background: `color-mix(in oklab, var(--color-accent) ${100 - i * 12}%, var(--color-foreground))`
					}
				}, r.asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground",
				children: rows.slice(0, 6).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					r.asset,
					" ",
					totalUsd ? Math.round(r.usd / totalUsd * 100) : 0,
					"%"
				] }, r.asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setSheet("in"),
					children: "Déposer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setSheet("out"),
					children: "Retirer"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-border",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: r.asset
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs tabular-nums text-muted-foreground",
						children: [formatQty(r.available, 8), r.hold > 0 ? ` · ${formatQty(r.hold, 6)} bloqué` : ""]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm tabular-nums",
							children: formatFiat(r.usd)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("font-mono text-xs tabular-nums", r.changePct >= 0 ? "text-buy" : "text-sell"),
							children: formatPct(r.changePct)
						})]
					})]
				}, r.asset))
			}),
			sheet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				title: sheet === "in" ? "Dépôt" : "Retrait",
				onClose: () => setSheet(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 px-4 pb-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: live ? sheet === "in" ? "Adresse générée via l’API Kraken DepositAddresses." : "Les retraits on-chain restent sur Kraken.com (droit Withdrawal non utilisé ici)." : "Simulation locale. Connecte tes clés pour une adresse de dépôt réelle."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: asset,
							onChange: (e) => setAsset(e.target.value.toUpperCase()),
							placeholder: "Actif"
						}),
						sheet === "out" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: amount,
							onChange: (e) => setAmount(e.target.value),
							placeholder: "Montant",
							inputMode: "decimal"
						}),
						sheet === "in" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-muted-foreground",
							children: deposit ?? (live ? "Appuie pour demander l’adresse Kraken" : `nautilus-demo-${asset.toLowerCase()}`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: depositBusy,
							onClick: () => {
								if (sheet === "out") {
									setSheet(null);
									return;
								}
								if (!live) {
									setSheet(null);
									return;
								}
								setDepositBusy(true);
								krakenDeposit({ data: {
									apiKey: connection.apiKey,
									apiSecret: connection.apiSecret,
									asset
								} }).then((res) => {
									setDeposit(res.ok && res.info ? `${res.info.method} · ${res.info.address}${res.info.tag ? ` · tag ${res.info.tag}` : ""}` : res.message);
								}).finally(() => setDepositBusy(false));
							},
							children: sheet === "in" ? live ? depositBusy ? "…" : "Obtenir l’adresse" : "J’ai compris" : "Fermer"
						})
					]
				})
			})
		]
	});
}
function AllocRing({ slices }) {
	const r = 15;
	const c = 2 * Math.PI * r;
	let acc = 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 40 40",
		className: "size-16 -rotate-90",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "20",
			cy: "20",
			r,
			fill: "none",
			stroke: "var(--color-muted)",
			strokeWidth: "6"
		}), slices.map((s, i) => {
			const dash = s.pct / 100 * c;
			const gap = c - dash;
			const el = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "20",
				cy: "20",
				r,
				fill: "none",
				stroke: `color-mix(in oklab, var(--color-accent) ${100 - i * 14}%, var(--color-foreground))`,
				strokeWidth: "6",
				strokeDasharray: `${dash} ${gap}`,
				strokeDashoffset: -acc
			}, s.id);
			acc += dash;
			return el;
		})]
	});
}
//#endregion
export { WalletPage as component };
