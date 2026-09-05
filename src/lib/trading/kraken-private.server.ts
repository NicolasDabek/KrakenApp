import { createHash, createHmac } from "node:crypto";

const ROOT = "https://api.kraken.com";

export type KrakenPrivateResult<T = unknown> = {
  ok: boolean;
  message: string;
  result?: T;
};

let lastNonce = 0;

function nextNonce(): string {
  const n = Date.now() * 1000;
  lastNonce = n > lastNonce ? n : lastNonce + 1;
  return String(lastNonce);
}

export async function callKrakenPrivate<T = unknown>(
  apiKey: string,
  apiSecret: string,
  method: string,
  params: Record<string, string> = {},
): Promise<KrakenPrivateResult<T>> {
  const key = apiKey.trim();
  const secret = apiSecret.trim();
  if (key.length < 8 || secret.length < 16) {
    return { ok: false, message: "Clés Kraken incomplètes." };
  }
  const path = `/0/private/${method}`;
  const nonce = nextNonce();
  const body = new URLSearchParams({ nonce, ...params }).toString();
  let sign: string;
  try {
    const hash = createHash("sha256").update(nonce + body).digest();
    const hmac = createHmac("sha512", Buffer.from(secret, "base64"));
    hmac.update(path);
    hmac.update(hash);
    sign = hmac.digest("base64");
  } catch {
    return { ok: false, message: "Secret API Kraken invalide (base64 attendu)." };
  }

  try {
    const res = await fetch(`${ROOT}${path}`, {
      method: "POST",
      headers: {
        "API-Key": key,
        "API-Sign": sign,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Nautilus-Trading-Terminal/1.0",
      },
      body,
      signal: AbortSignal.timeout(20_000),
    });
    const json = (await res.json()) as { error?: string[]; result?: T };
    if (json.error?.length) {
      return { ok: false, message: json.error.join(", ") };
    }
    if (!res.ok) {
      return { ok: false, message: `Kraken HTTP ${res.status}` };
    }
    return { ok: true, message: "OK", result: json.result };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Kraken injoignable",
    };
  }
}

const ASSET_MAP: Record<string, string> = {
  XXBT: "BTC",
  XBT: "BTC",
  XETH: "ETH",
  XXRP: "XRP",
  XLTC: "LTC",
  XXLM: "XLM",
  XXMR: "XMR",
  XXDG: "DOGE",
  XDG: "DOGE",
  ZEUR: "EUR",
  ZUSD: "USD",
};

export function normalizeKrakenAsset(code: string): string {
  if (ASSET_MAP[code]) return ASSET_MAP[code]!;
  return code.replace(/^Z(?=EUR|USD|GBP)/, "").replace(/^X(?=[A-Z]{3}$)/, "");
}

export function parseKrakenBalances(raw: Record<string, string> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const [code, value] of Object.entries(raw)) {
    const n = Number(value);
    if (!Number.isFinite(n) || n === 0) continue;
    const asset = normalizeKrakenAsset(code);
    out[asset] = (out[asset] ?? 0) + n;
  }
  return out;
}