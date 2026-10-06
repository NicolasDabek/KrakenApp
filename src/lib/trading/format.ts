const loc = "fr-FR";

export function formatPrice(price: number, decimals: number): string {
  if (!Number.isFinite(price)) return "—";
  const d = Math.max(0, Math.min(decimals, 10));
  return price.toLocaleString(loc, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function formatQty(qty: number, decimals = 6): string {
  if (!Number.isFinite(qty)) return "—";
  if (Math.abs(qty) >= 1000) {
    return qty.toLocaleString(loc, { maximumFractionDigits: 2 });
  }
  return qty.toLocaleString(loc, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/** Accepts 1.5, 1,5, 1 234,56 and 1.234,56. */
export function parseDecimal(raw: string): number | null {
  let t = raw.trim().replace(/[\s\u202f\u00a0]/g, "");
  if (!t) return null;
  const comma = t.lastIndexOf(",");
  const dot = t.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    t = comma > dot ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if (comma >= 0) {
    t = t.replace(",", ".");
  }
  if (!/^[+-]?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function formatFiat(value: number, currency: "USD" | "EUR" = "USD"): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(loc, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toLocaleString(loc, { maximumFractionDigits: 2 })} Md`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toLocaleString(loc, { maximumFractionDigits: 2 })} M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toLocaleString(loc, { maximumFractionDigits: 2 })} k`;
  return n.toLocaleString(loc, { maximumFractionDigits: 2 });
}

export function formatPct(pct: number, digits = 2): string {
  if (!Number.isFinite(pct)) return "—";
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${sign}${Math.abs(pct).toLocaleString(loc, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(loc, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(loc, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function uid(prefix = "n"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatKrakenVolume(qty: number, lotDecimals: number): string {
  const d = Math.min(Math.max(Math.floor(lotDecimals), 0), 8);
  if (!(qty > 0) || !Number.isFinite(qty)) return "0";
  const s = qty.toFixed(d);
  return s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}
