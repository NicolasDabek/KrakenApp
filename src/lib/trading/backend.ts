import type { ConnectionConfig, NewOrderInput } from "./types";

export const NATIVE_API_ROOT = "/api/v1";

export const BACKEND_ENDPOINTS = [
  { method: "GET", path: "/health", desc: "Ping Kraken + backend" },
  { method: "GET", path: "/tickers", desc: "Tickers publics" },
  { method: "GET", path: "/ohlc", desc: "Chandeliers" },
  { method: "GET", path: "/ohlc/history", desc: "Historique backtest" },
  { method: "GET", path: "/depth", desc: "Carnet" },
  { method: "GET", path: "/trades", desc: "Tape" },
  { method: "POST", path: "/keys/test", desc: "Valider les clés API" },
  { method: "GET", path: "/account", desc: "Snapshot complet du compte" },
  { method: "GET", path: "/balances", desc: "Soldes" },
  { method: "GET", path: "/orders", desc: "Ordres ouverts et historique" },
  { method: "POST", path: "/orders", desc: "Placer un ordre (marché, limite, stop)" },
  { method: "DELETE", path: "/orders/:id", desc: "Annuler un ordre" },
  { method: "GET", path: "/positions", desc: "Positions margin" },
  { method: "POST", path: "/positions/:id/close", desc: "Clôturer une position" },
  { method: "GET", path: "/fills", desc: "Exécutions" },
  { method: "POST", path: "/convert", desc: "Conversion marché" },
  { method: "GET", path: "/earn", desc: "Allocations Earn" },
  { method: "GET", path: "/earn/strategies", desc: "Stratégies Earn" },
  { method: "POST", path: "/earn/allocate", desc: "Allouer au staking" },
  { method: "POST", path: "/earn/deallocate", desc: "Retirer du staking" },
  { method: "GET", path: "/deposit/:asset", desc: "Adresse de dépôt" },
  { method: "POST", path: "/bots/evaluate", desc: "Évaluer une stratégie bot" },
  { method: "POST", path: "/bots/order", desc: "Ordre marché bot" },
] as const;

export type BackendResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  message: string;
};

function authHeaders(conn: ConnectionConfig): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (conn.apiKey) headers["X-API-Key"] = conn.apiKey;
  if (conn.apiSecret) headers["X-API-Secret"] = conn.apiSecret;
  return headers;
}

export function resolveBackendRoot(conn: ConnectionConfig): string {
  const root = conn.baseUrl.trim().replace(/\/$/, "");
  if (root) return root;
  if (typeof window !== "undefined") return `${window.location.origin}${NATIVE_API_ROOT}`;
  return NATIVE_API_ROOT;
}

export async function backendRequest<T>(
  conn: ConnectionConfig,
  path: string,
  init: RequestInit = {},
): Promise<BackendResult<T>> {
  const root = resolveBackendRoot(conn);
  try {
    const res = await fetch(`${root}${path}`, {
      ...init,
      headers: {
        ...authHeaders(conn),
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    const text = await res.text();
    let data: T | undefined;
    try {
      data = text ? (JSON.parse(text) as T) : undefined;
    } catch {
      data = undefined;
    }
    const payload = data as { message?: string; ok?: boolean } | undefined;
    return {
      ok: res.ok && payload?.ok !== false,
      status: res.status,
      data,
      message: payload?.message ?? (res.ok ? `OK ${res.status}` : text.slice(0, 180) || `HTTP ${res.status}`),
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : "Réseau indisponible",
    };
  }
}

export function orderPayload(input: NewOrderInput) {
  return {
    pair: input.pair,
    side: input.side,
    type: input.type,
    amount: input.amount,
    price: input.price,
    stopPrice: input.stopPrice,
    leverage: input.leverage ?? 1,
    takeProfit: input.tp,
    stopLoss: input.sl,
    trailingPct: input.trailingPct,
  };
}
