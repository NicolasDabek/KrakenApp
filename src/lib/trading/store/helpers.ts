import type { Balance, Bot, ConnectionConfig, PaperAccount, Settings, Ticker } from "../types";
import { PAIR_BY_ID } from "../pairs.ts";

export function cloneBalances(list: Balance[]): Balance[] {
  return list.map((b) => ({ ...b }));
}

export function pingFill(settings: Settings, title: string, body: string) {
  if (!settings.notifyFills || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    /* ignore blocked notifications */
  }
}

export function getBal(list: Balance[], asset: string): Balance {
  const found = list.find((b) => b.asset === asset);
  if (found) return found;
  const created = { asset, available: 0, hold: 0 };
  list.push(created);
  return created;
}

export function pairAssets(pairId: string) {
  const meta = PAIR_BY_ID[pairId];
  return { base: meta?.base ?? "BTC", quote: meta?.quote ?? "USD", meta };
}

export function buzz() {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* ignore */
  }
}

export function clonePaper(paper: PaperAccount): PaperAccount {
  return {
    ...paper,
    holdings: Object.fromEntries(Object.entries(paper.holdings).map(([k, v]) => [k, { ...v }])),
    trades: [...paper.trades],
    equityCurve: [...paper.equityCurve],
  };
}

export function withLog(bot: Bot, text: string, side?: "buy" | "sell"): Bot {
  return {
    ...bot,
    log: [{ t: Date.now(), text, side }, ...(bot.log ?? [])].slice(0, 40),
  };
}

export function tickerList(tickers: Record<string, Ticker>): Ticker[] {
  return Object.values(tickers);
}

export function eurUsdRate(tickers: Record<string, Ticker>): number {
  const a = tickers.XBTUSD?.last;
  const b = tickers.XBTEUR?.last;
  if (a && b) return a / b;
  return 1.08;
}

export function isLiveConnected(connection: ConnectionConfig): boolean {
  return Boolean(connection.apiKey && connection.apiSecret);
}

export function liveBalanceRows(
  krakenBalances: Record<string, number>,
  hold: Record<string, number> = {},
): Balance[] {
  return Object.entries(krakenBalances)
    .filter(([, q]) => q > 0)
    .map(([asset, available]) => ({ asset, available, hold: hold[asset] ?? 0 }))
    .sort((a, b) => b.available - a.available);
}

export function usdValue(asset: string, qty: number, tickers: Record<string, Ticker>): number {
  if (asset === "USD") return qty;
  if (asset === "EUR") return qty * eurUsdRate(tickers);
  const t = Object.values(tickers).find(
    (x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "USD",
  );
  return t ? qty * t.last : 0;
}

export function eurValue(asset: string, qty: number, tickers: Record<string, Ticker>): number {
  if (asset === "EUR") return qty;
  if (asset === "USD") {
    const fx = eurUsdRate(tickers);
    return fx ? qty / fx : qty / 1.08;
  }
  const t = Object.values(tickers).find(
    (x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "EUR",
  );
  return t ? qty * t.last : 0;
}
