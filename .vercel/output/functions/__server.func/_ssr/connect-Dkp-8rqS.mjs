import { i as __toESM } from "../_runtime.mjs";
import { dt as formatQty, st as formatFiat } from "./kraken.server-CQDHT3_G.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as fetchKrakenStatus } from "./utils-CQTqeWMb.mjs";
import { t as PageHeader } from "./page-header-C1B_YvkN.mjs";
import { t as Button } from "./button-C4JPhzGd.mjs";
import { t as Input } from "./input-Bh1uix8E.mjs";
import { t as Badge } from "./badge-Cl68uAGu.mjs";
import { u as useTradingStore } from "./router-DCxDvC4F.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connect-Dkp-8rqS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NATIVE_API_ROOT = "/api/v1";
var BACKEND_ENDPOINTS = [
	{
		method: "GET",
		path: "/health",
		desc: "Ping Kraken + backend"
	},
	{
		method: "GET",
		path: "/tickers",
		desc: "Tickers publics"
	},
	{
		method: "GET",
		path: "/ohlc",
		desc: "Chandeliers"
	},
	{
		method: "GET",
		path: "/ohlc/history",
		desc: "Historique backtest"
	},
	{
		method: "GET",
		path: "/depth",
		desc: "Carnet"
	},
	{
		method: "GET",
		path: "/trades",
		desc: "Tape"
	},
	{
		method: "POST",
		path: "/keys/test",
		desc: "Valider les clés API"
	},
	{
		method: "GET",
		path: "/account",
		desc: "Snapshot complet du compte"
	},
	{
		method: "GET",
		path: "/balances",
		desc: "Soldes"
	},
	{
		method: "GET",
		path: "/orders",
		desc: "Ordres ouverts et historique"
	},
	{
		method: "POST",
		path: "/orders",
		desc: "Placer un ordre (marché, limite, stop)"
	},
	{
		method: "DELETE",
		path: "/orders/:id",
		desc: "Annuler un ordre"
	},
	{
		method: "GET",
		path: "/positions",
		desc: "Positions margin"
	},
	{
		method: "POST",
		path: "/positions/:id/close",
		desc: "Clôturer une position"
	},
	{
		method: "GET",
		path: "/fills",
		desc: "Exécutions"
	},
	{
		method: "POST",
		path: "/convert",
		desc: "Conversion marché"
	},
	{
		method: "GET",
		path: "/earn",
		desc: "Allocations Earn"
	},
	{
		method: "GET",
		path: "/earn/strategies",
		desc: "Stratégies Earn"
	},
	{
		method: "POST",
		path: "/earn/allocate",
		desc: "Allouer au staking"
	},
	{
		method: "POST",
		path: "/earn/deallocate",
		desc: "Retirer du staking"
	},
	{
		method: "GET",
		path: "/deposit/:asset",
		desc: "Adresse de dépôt"
	},
	{
		method: "POST",
		path: "/bots/evaluate",
		desc: "Évaluer une stratégie bot"
	},
	{
		method: "POST",
		path: "/bots/order",
		desc: "Ordre marché bot"
	}
];
function authHeaders(conn) {
	const headers = { Accept: "application/json" };
	if (conn.apiKey) headers["X-API-Key"] = conn.apiKey;
	if (conn.apiSecret) headers["X-API-Secret"] = conn.apiSecret;
	return headers;
}
function resolveBackendRoot(conn) {
	const root = conn.baseUrl.trim().replace(/\/$/, "");
	if (root) return root;
	if (typeof window !== "undefined") return `${window.location.origin}${NATIVE_API_ROOT}`;
	return NATIVE_API_ROOT;
}
async function backendRequest(conn, path, init = {}) {
	const root = resolveBackendRoot(conn);
	try {
		const res = await fetch(`${root}${path}`, {
			...init,
			headers: {
				...authHeaders(conn),
				...init.body ? { "Content-Type": "application/json" } : {},
				...init.headers
			}
		});
		const text = await res.text();
		let data;
		try {
			data = text ? JSON.parse(text) : void 0;
		} catch {
			data = void 0;
		}
		const payload = data;
		return {
			ok: res.ok && payload?.ok !== false,
			status: res.status,
			data,
			message: payload?.message ?? (res.ok ? `OK ${res.status}` : text.slice(0, 180) || `HTTP ${res.status}`)
		};
	} catch (err) {
		return {
			ok: false,
			status: 0,
			message: err instanceof Error ? err.message : "Réseau indisponible"
		};
	}
}
function ConnectPage() {
	const connection = useTradingStore((s) => s.connection);
	const setConnection = useTradingStore((s) => s.setConnection);
	const syncKraken = useTradingStore((s) => s.syncKraken);
	const krakenEur = useTradingStore((s) => s.krakenEur);
	const krakenBalances = useTradingStore((s) => s.krakenBalances);
	const [baseUrl, setBaseUrl] = (0, import_react.useState)(connection.baseUrl);
	const [apiKey, setApiKey] = (0, import_react.useState)(connection.apiKey);
	const [apiSecret, setApiSecret] = (0, import_react.useState)(connection.apiSecret);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [kraken, setKraken] = (0, import_react.useState)(null);
	const save = () => setConnection({
		baseUrl,
		apiKey: apiKey.trim(),
		apiSecret: apiSecret.trim()
	});
	const testKraken = async () => {
		save();
		setBusy(true);
		await syncKraken();
		setBusy(false);
	};
	const testBackend = async () => {
		save();
		setBusy(true);
		const res = await backendRequest({
			...connection,
			baseUrl,
			apiKey,
			apiSecret
		}, "/health");
		setConnection({
			baseUrl,
			apiKey,
			apiSecret,
			testMessage: res.message
		});
		setBusy(false);
	};
	const pingPublic = async () => {
		try {
			const s = await fetchKrakenStatus();
			setKraken(s);
		} catch {
			setKraken({
				ok: false,
				ms: 0
			});
		}
	};
	const holdings = Object.entries(krakenBalances).filter(([, q]) => q > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl px-4 py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Connexion",
				kicker: "Clés stockées sur cet appareil"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: connection.testOk ? "buy" : "warn",
				children: connection.testOk ? "Kraken OK" : "Non testé"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Branche tes clés API Kraken pour que les bots réels passent des ordres spot EUR. Droits : Query funds + Create & modify orders. Évite Withdrawal."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-1 text-xs text-muted-foreground",
						children: ["Clé publique (API Key)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: apiKey,
							onChange: (e) => setApiKey(e.target.value),
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block space-y-1 text-xs text-muted-foreground",
						children: ["Clé privée (Private Key / Secret)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: apiSecret,
							onChange: (e) => setApiSecret(e.target.value),
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							type: "button",
							onClick: save,
							children: "Enregistrer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							onClick: () => void testKraken(),
							disabled: busy,
							children: busy ? "Test…" : "Tester Kraken"
						})]
					}),
					connection.testMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: connection.testOk ? "text-sm text-buy" : "text-sm text-sell",
						children: connection.testMessage
					}),
					connection.testOk && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-muted p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "EUR disponible"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-lg tabular-nums",
								children: formatFiat(krakenEur, "EUR")
							}),
							holdings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-xs text-muted-foreground",
								children: holdings.slice(0, 8).map(([asset, qty]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: asset }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: formatQty(qty, 6)
									})]
								}, asset))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						type: "button",
						className: "w-full",
						onClick: () => void pingPublic(),
						children: ["Ping Kraken public ", kraken ? `· ${kraken.ok ? `${kraken.ms} ms` : "échec"}` : ""]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-lg border border-border bg-card p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Backend Nautilus"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Backend intégré /api/v1 : marchés, soldes, ordres, bots, conversion, Earn. Tes clés signent chaque appel et ne sont jamais stockées sur le serveur. Les bots réels tournent tant que l’app est ouverte."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block space-y-1 text-xs text-muted-foreground",
						children: ["URL backend (laisser vide = backend intégré)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: baseUrl,
							onChange: (e) => setBaseUrl(e.target.value),
							placeholder: "/api/v1"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "mt-3 w-full",
						type: "button",
						onClick: () => void testBackend(),
						disabled: busy,
						children: "Tester /health"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1.5 font-mono text-xs text-muted-foreground",
						children: BACKEND_ENDPOINTS.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: e.method
							}),
							" ",
							e.path
						] }, `${e.method}-${e.path}`))
					})
				]
			})
		]
	});
}
//#endregion
export { ConnectPage as component };
