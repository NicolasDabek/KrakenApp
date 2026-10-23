const FIAT = new Set(["EUR", "USD", "GBP", "CHF", "CAD", "JPY", "AUD"]);

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
  ZGBP: "GBP",
};

export function normalizeFiscalAsset(code: string): string {
  let raw = code.trim().toUpperCase();
  if (!raw) return "";
  raw = raw.replace(/\.(S|F|B|M|T|P|HOLD)$/, "");
  if (ASSET_MAP[raw]) return ASSET_MAP[raw]!;
  return raw.replace(/^Z(?=EUR|USD|GBP|CHF|CAD|JPY|AUD)/, "").replace(/^X(?=[A-Z]{3}$)/, "");
}

export function isFiatAsset(asset: string): boolean {
  return FIAT.has(asset);
}
