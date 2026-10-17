import { uid } from "../format.ts";
import { PAIR_BY_ID } from "../pairs.ts";
import type { PaperAccount, PaperTrade, Ticker } from "../types.ts";

export const DEFAULT_PAPER: PaperAccount = {
  startingBalance: 10_000,
  cash: 10_000,
  holdings: {},
  feesPaid: 0,
  realizedPnl: 0,
  feeRate: 0.0026,
  trades: [],
  equityCurve: [],
};

export function assetPx(asset: string, tickers: Record<string, Ticker>): number {
  if (asset === "EUR") return 1;
  if (asset === "USD") {
    const usd = tickers.XBTUSD?.last;
    const eur = tickers.XBTEUR?.last;
    if (usd && eur) return eur / usd;
    return 1 / 1.08;
  }
  const aliases: Record<string, string> = { BTC: "XBTEUR", XBT: "XBTEUR", DOGE: "XDGEUR", XDG: "XDGEUR" };
  const direct = tickers[aliases[asset] ?? `${asset}EUR`];
  if (direct?.last) return direct.last;
  const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "EUR");
  return t?.last ?? 0;
}

export function paperEquity(paper: PaperAccount, tickers: Record<string, Ticker>): number {
  let v = paper.cash;
  for (const [asset, h] of Object.entries(paper.holdings ?? {})) {
    v += h.qty * assetPx(asset, tickers);
  }
  return v;
}

export function applyPaperFill(
  paper: PaperAccount,
  input: {
    botId: string;
    pair: string;
    base: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    note: string;
    time?: number;
    /** Sell this lot at its own purchase price instead of the blended average. */
    costBasis?: number;
  },
): { ok: true; paper: PaperAccount; trade: PaperTrade } | { ok: false; message: string } {
  const feeRate = paper.feeRate;
  if (!(input.qty > 0) || !(input.price > 0)) return { ok: false, message: "Quantité ou prix invalide." };
  const notional = input.qty * input.price;
  const fee = notional * feeRate;
  const holdings = { ...paper.holdings };
  const pos = holdings[input.base] ?? { qty: 0, avg: 0 };
  let cash = paper.cash;
  let realized = paper.realizedPnl;
  let pnl = 0;
  const basisQty = input.side === "sell" && input.costBasis && input.costBasis > 0 ? input.costBasis : pos.avg;

  if (input.side === "buy") {
    const spend = notional + fee;
    if (cash < spend) return { ok: false, message: `Solde papier insuffisant (${spend.toFixed(2)} EUR requis).` };
    const newQty = pos.qty + input.qty;
    const newAvg = newQty > 0 ? (pos.avg * pos.qty + notional) / newQty : 0;
    holdings[input.base] = { qty: newQty, avg: newAvg };
    cash -= spend;
  } else {
    if (pos.qty + 1e-12 < input.qty) {
      return { ok: false, message: `Position ${input.base} insuffisante.` };
    }
    pnl = notional - fee - basisQty * input.qty;
    const newQty = pos.qty - input.qty;
    if (newQty <= 1e-12) delete holdings[input.base];
    else {
      const costLeft = Math.max(0, pos.avg * pos.qty - basisQty * input.qty);
      holdings[input.base] = { qty: newQty, avg: costLeft / newQty };
    }
    cash += notional - fee;
    realized += pnl;
  }

  const trade: PaperTrade = {
    id: uid("pt"),
    botId: input.botId,
    pair: input.pair,
    side: input.side,
    amount: input.qty,
    price: input.price,
    fee,
    pnl,
    note: input.note,
    time: input.time ?? Date.now(),
  };

  const next: PaperAccount = {
    ...paper,
    cash,
    holdings,
    feesPaid: paper.feesPaid + fee,
    realizedPnl: realized,
    trades: [trade, ...paper.trades].slice(0, 250),
  };
  return { ok: true, paper: next, trade };
}

export function snapshotEquity(paper: PaperAccount, equity: number): PaperAccount {
  const curve = [...paper.equityCurve, { t: Date.now(), v: equity }].slice(-180);
  return { ...paper, equityCurve: curve };
}

export function resetPaperAccount(startingBalance: number, feeRate: number): PaperAccount {
  const start = Math.max(0, startingBalance);
  return {
    startingBalance: start,
    cash: start,
    holdings: {},
    feesPaid: 0,
    realizedPnl: 0,
    feeRate,
    trades: [],
    equityCurve: [{ t: Date.now(), v: start }],
  };
}

export function flattenPaper(
  paper: PaperAccount,
  tickers: Record<string, Ticker>,
): { paper: PaperAccount; sold: number } {
  let next = paper;
  let sold = 0;
  for (const [asset, h] of Object.entries(paper.holdings)) {
    if (!(h.qty > 0)) continue;
    const pair = Object.values(PAIR_BY_ID).find((p) => p.base === asset && p.quote === "EUR");
    const t = pair ? tickers[pair.id] : undefined;
    const price = t?.bid || t?.last || 0;
    if (!pair || !(price > 0)) continue;
    const res = applyPaperFill(next, {
      botId: "flatten",
      pair: pair.id,
      base: asset,
      side: "sell",
      qty: h.qty,
      price,
      note: "Liquidation papier",
    });
    if (res.ok) {
      next = res.paper;
      sold += 1;
    }
  }
  return { paper: next, sold };
}
