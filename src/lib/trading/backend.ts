import type { ConnectionConfig, NewOrderInput } from "./types";

export const BACKEND_ENDPOINTS = [
  { method: "GET", path: "/health", desc: "Ping disponibilité" },
  { method: "GET", path: "/balances", desc: "Soldes du compte" },
  { method: "GET", path: "/tickers", desc: "Relais des tickers (optionnel)" },
  { method: "GET", path: "/orders", desc: "Ordres ouverts et historique" },
  { method: "POST", path: "/orders", desc: "Placer un ordre" },
  { method: "DELETE", path: "/orders/:id", desc: "Annuler un ordre" },
  { method: "GET", path: "/positions", desc: "Positions margin" },
  { method: "POST", path: "/positions/:id/close", desc: "Clôturer une position" },
  { method: "GET", path: "/fills", desc: "Exécutions" },
  { method: "POST", path: "/convert", desc: "Conversion interne" },
  { method: "GET", path: "/alerts", desc: "Alertes prix" },
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

export async function backendRequest<T>(
  conn: ConnectionConfig,
  path: string,
  init: RequestInit = {},
): Promise<BackendResult<T>> {
  const root = conn.baseUrl.trim().replace(/\/$/, "");
  if (!root) {
    return { ok: false, status: 0, message: "URL backend vide — mode démo local." };
  }
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
    return {
      ok: res.ok,
      status: res.status,
      data,
      message: res.ok ? `OK ${res.status}` : text.slice(0, 180) || `HTTP ${res.status}`,
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
