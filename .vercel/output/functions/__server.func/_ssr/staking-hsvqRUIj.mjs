import { i as __toESM } from "../_runtime.mjs";
import { dt as formatQty, st as formatFiat } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as krakenEarnStrategies, g as krakenEarnDeallocate, h as krakenEarnAllocate, m as krakenEarn, t as cn } from "./utils-CQTqeWMb.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { c as liveBalanceRows, l as usdValue, s as isLiveConnected, u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staking-hsvqRUIj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APR = [
	{
		asset: "ETH",
		rate: .035,
		note: "On-chain / bonded"
	},
	{
		asset: "SOL",
		rate: .065,
		note: "Délégation"
	},
	{
		asset: "DOT",
		rate: .14,
		note: "Nominators"
	},
	{
		asset: "ADA",
		rate: .03,
		note: "Délégation"
	},
	{
		asset: "ATOM",
		rate: .15,
		note: "Cosmos"
	},
	{
		asset: "TRX",
		rate: .04,
		note: "SR vote"
	},
	{
		asset: "KSM",
		rate: .12,
		note: "Nominators"
	}
];
function StakingPage() {
	const demoBalances = useTradingStore((s) => s.balances);
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const connection = useTradingStore((s) => s.connection);
	const live = isLiveConnected(connection);
	const balances = live ? liveBalanceRows(krakenBalances) : demoBalances;
	const tickers = useTradingStore((s) => s.tickers);
	const [asset, setAsset] = (0, import_react.useState)("SOL");
	const held = balances.find((b) => b.asset === asset)?.available ?? 0;
	const [amount, setAmount] = (0, import_react.useState)(held ? String(held) : "10");
	const [years, setYears] = (0, import_react.useState)("3");
	const [earn, setEarn] = (0, import_react.useState)([]);
	const [strategies, setStrategies] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const reloadEarn = () => {
		if (!live) return;
		krakenEarn({ data: {
			apiKey: connection.apiKey,
			apiSecret: connection.apiSecret
		} }).then((res) => {
			if (res.ok) setEarn(res.rows.map((r) => ({
				strategyId: r.strategyId,
				asset: r.asset,
				amount: r.amount,
				note: r.note
			})));
		});
		krakenEarnStrategies({ data: {
			apiKey: connection.apiKey,
			apiSecret: connection.apiSecret
		} }).then((res) => {
			if (res.ok) setStrategies(res.rows);
		});
	};
	(0, import_react.useEffect)(() => {
		reloadEarn();
	}, [
		live,
		connection.apiKey,
		connection.apiSecret
	]);
	const row = APR.find((r) => r.asset === asset);
	const qty = Number(amount) || 0;
	const y = Math.max(Number(years) || 0, 0);
	const future = (0, import_react.useMemo)(() => qty * Math.pow(1 + row.rate, y), [
		qty,
		row.rate,
		y
	]);
	const usdNow = usdValue(asset, qty, tickers);
	const usdLater = usdValue(asset, future, tickers);
	const matching = strategies.filter((s) => s.asset === asset && s.canAllocate);
	const runAlloc = async (strategyId, n, take) => {
		setBusy(strategyId);
		setMsg(null);
		const res = await (take ? krakenEarnDeallocate : krakenEarnAllocate)({ data: {
			apiKey: connection.apiKey,
			apiSecret: connection.apiSecret,
			strategyId,
			amount: n
		} });
		setMsg(res.message);
		setBusy(null);
		reloadEarn();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Staking",
				kicker: live ? "Allocations Earn Kraken + projection APR" : "Simulation d’APR — hors lockup et slash"
			}),
			live && earn.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mb-4 space-y-2 rounded-lg border border-border bg-card p-3 text-sm",
				children: earn.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						r.asset,
						" · ",
						r.note,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 font-mono tabular-nums",
							children: formatQty(r.amount, 6)
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy === r.strategyId,
						onClick: () => void runAlloc(r.strategyId, r.amount, true),
						children: "Retirer"
					})]
				}, r.strategyId + r.asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto",
				children: APR.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setAsset(r.asset);
						const avail = balances.find((b) => b.asset === r.asset)?.available ?? 0;
						if (avail) setAmount(String(avail));
					},
					className: cn("h-9 shrink-0 rounded-full px-3 text-xs font-medium", asset === r.asset ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
					children: r.asset
				}, r.asset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-1 text-xs text-muted-foreground",
					children: ["Quantité", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						inputMode: "decimal",
						className: "font-mono tabular-nums"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-1 text-xs text-muted-foreground",
					children: ["Années", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: years,
						onChange: (e) => setYears(e.target.value),
						inputMode: "decimal",
						className: "font-mono tabular-nums"
					})]
				})]
			}),
			live && matching.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-2 rounded-lg border border-border bg-card p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Allouer sur Kraken Earn"
				}), matching.slice(0, 4).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [s.lockType, s.apr ? ` · ${(s.apr * 100).toFixed(1)} %` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: !qty || busy === s.id,
						onClick: () => void runAlloc(s.id, qty, false),
						children: "Allouer"
					})]
				}, s.id))]
			}),
			msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: msg
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2 rounded-lg border border-border bg-card p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "APR indicatif",
						v: `${(row.rate * 100).toFixed(1)} %`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Mécanisme",
						v: row.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Valeur actuelle",
						v: formatFiat(usdNow)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: `Après ${y} ans`,
						v: `${formatQty(future, 6)} ${asset}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "USD projeté*",
						v: formatFiat(usdLater)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-subtle",
				children: "*Au prix spot actuel, sans variation de marché."
			})
		]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono tabular-nums",
			children: v
		})]
	});
}
//#endregion
export { StakingPage as component };
