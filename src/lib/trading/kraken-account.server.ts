import { formatKrakenVolume } from "./format";
import { callKrakenPrivate, normalizeKrakenAsset, parseKrakenBalances } from "./kraken-private.server";
import { PAIR_BY_ID, pairForAssets, resolvePairId } from "./pairs";
import type { Fill, NewOrderInput, Order, OrderSide, OrderStatus, OrderType, Position } from "./types";

export type AuthKeys = { apiKey: string; apiSecret: string };
export type SnapshotMode = "light" | "full";

export type TradeBalanceInfo = {
  equity: number;
  free: number;
  margin: number;
  unrealized: number;
};

export type EarnRow = {
  strategyId: string;
  asset: string;
  amount: number;
  apr?: number;
  note: string;
};

export type EarnStrategy = {
  id: string;
  asset: string;
  apr?: number;
  canAllocate: boolean;
  canDeallocate: boolean;
  lockType: string;
  note: string;
};

export type DepositInfo = {
  asset: string;
  method: string;
  address: string;
  tag?: string;
};

export type AccountSnapshot = {
  balances: Record<string, number>;
  eur: number;
  trade?: TradeBalanceInfo;
  orders: Order[];
  fills: Fill[];
  positions: Position[];
  earn: EarnRow[];
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapOrderType(raw: string | undefined): OrderType {
  switch (raw) {
    case "limit":
      return "limit";
    case "stop-loss":
    case "stop-loss-limit":
      return raw === "stop-loss-limit" ? "stop-limit" : "stop";
    case "take-profit":
    case "take-profit-limit":
      return "stop";
    case "trailing-stop":
    case "trailing-stop-limit":
      return "stop";
    default:
      return "market";
  }
}

function mapStatus(raw: string | undefined): OrderStatus {
  if (raw === "canceled" || raw === "expired") return "cancelled";
  if (raw === "closed") return "filled";
  if (raw === "open" || raw === "pending") return "open";
  return "rejected";
}

type RawDescr = {
  pair?: string;
  type?: string;
  ordertype?: string;
  price?: string;
  price2?: string;
  leverage?: string;
  order?: string;
  close?: string;
};

type RawOrder = {
  refid?: string;
  userref?: number;
  status?: string;
  opentm?: number;
  closetm?: number;
  starttm?: number;
  expiretm?: number;
  descr?: RawDescr;
  vol?: string;
  vol_exec?: string;
  cost?: string;
  fee?: string;
  price?: string;
  stopprice?: string;
  misc?: string;
  oflags?: string;
};

function parseOrder(id: string, raw: RawOrder): Order {
  const pair = resolvePairId(raw.descr?.pair) ?? raw.descr?.pair ?? "";
  const side: OrderSide = raw.descr?.type === "sell" ? "sell" : "buy";
  const lev = Number.parseInt(String(raw.descr?.leverage ?? "0"), 10);
  const created = num(raw.opentm) * 1000;
  const updated = num(raw.closetm || raw.opentm) * 1000;
  return {
    id,
    pair,
    side,
    type: mapOrderType(raw.descr?.ordertype),
    amount: num(raw.vol),
    price: num(raw.descr?.price) || undefined,
    stopPrice: num(raw.stopprice || raw.descr?.price2) || undefined,
    filled: num(raw.vol_exec),
    avgPrice: num(raw.price),
    status: mapStatus(raw.status),
    leverage: Number.isFinite(lev) && lev > 1 ? lev : 1,
    fee: num(raw.fee),
    createdAt: created || Date.now(),
    updatedAt: updated || created || Date.now(),
    note: raw.descr?.order,
  };
}

type RawTrade = {
  ordertxid?: string;
  postxid?: string;
  pair?: string;
  time?: number;
  type?: string;
  ordertype?: string;
  price?: string;
  cost?: string;
  fee?: string;
  vol?: string;
  margin?: string;
  misc?: string;
};

function parseFill(id: string, raw: RawTrade): Fill {
  return {
    id,
    orderId: raw.ordertxid ?? id,
    pair: resolvePairId(raw.pair) ?? raw.pair ?? "",
    side: raw.type === "sell" ? "sell" : "buy",
    amount: num(raw.vol),
    price: num(raw.price),
    fee: num(raw.fee),
    time: num(raw.time) * 1000 || Date.now(),
  };
}

type RawPos = {
  ordertxid?: string;
  posstatus?: string;
  pair?: string;
  time?: number;
  type?: string;
  ordertype?: string;
  cost?: string;
  fee?: string;
  vol?: string;
  vol_closed?: string;
  margin?: string;
  value?: string;
  net?: string;
  terms?: string;
  rollovertm?: string;
  misc?: string;
};

function parsePosition(id: string, raw: RawPos): Position {
  const pair = resolvePairId(raw.pair) ?? raw.pair ?? "";
  const size = Math.max(0, num(raw.vol) - num(raw.vol_closed));
  const cost = num(raw.cost);
  const vol = num(raw.vol) || 1;
  const entry = vol ? cost / vol : 0;
  const side = raw.type === "sell" ? "short" : "long";
  const margin = num(raw.margin);
  const leverage = margin > 0 && cost > 0 ? Math.max(1, Math.round(cost / margin)) : 1;
  const last = num(raw.value) && size ? num(raw.value) / size : entry;
  const liq =
    side === "long" ? entry * (1 - 1 / Math.max(leverage, 1) + 0.05) : entry * (1 + 1 / Math.max(leverage, 1) - 0.05);
  return {
    id,
    pair,
    side,
    size,
    entry,
    leverage,
    margin,
    liqPrice: liq,
    peak: last,
    openedAt: num(raw.time) * 1000 || Date.now(),
  };
}

function krakenOrderType(input: NewOrderInput): { ordertype: string; price?: string; price2?: string } {
  if (input.trailingPct && input.trailingPct > 0 && input.type === "stop") {
    return { ordertype: "trailing-stop", price: `+${input.trailingPct.toFixed(2)}` };
  }
  switch (input.type) {
    case "limit":
      return { ordertype: "limit", price: String(input.price ?? "") };
    case "stop":
      return { ordertype: "stop-loss", price: String(input.stopPrice ?? input.price ?? "") };
    case "stop-limit":
      return {
        ordertype: "stop-loss-limit",
        price: String(input.stopPrice ?? ""),
        price2: String(input.price ?? ""),
      };
    default:
      return { ordertype: "market" };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTradeBalance(keys: AuthKeys): Promise<TradeBalanceInfo | undefined> {
  const res = await callKrakenPrivate<Record<string, string>>(keys.apiKey, keys.apiSecret, "TradeBalance", {
    asset: "ZEUR",
  });
  if (!res.ok || !res.result) return undefined;
  return {
    equity: num(res.result.eb),
    free: num(res.result.tf),
    margin: num(res.result.m),
    unrealized: num(res.result.n),
  };
}

export async function fetchOpenOrders(keys: AuthKeys): Promise<Order[]> {
  const res = await callKrakenPrivate<{ open?: Record<string, RawOrder> }>(keys.apiKey, keys.apiSecret, "OpenOrders");
  if (!res.ok) return [];
  return Object.entries(res.result?.open ?? {}).map(([id, raw]) => parseOrder(id, raw));
}

export async function fetchClosedOrders(keys: AuthKeys): Promise<Order[]> {
  const res = await callKrakenPrivate<{ closed?: Record<string, RawOrder> }>(
    keys.apiKey,
    keys.apiSecret,
    "ClosedOrders",
  );
  if (!res.ok) return [];
  return Object.entries(res.result?.closed ?? {}).map(([id, raw]) => parseOrder(id, raw));
}

export async function fetchTradesHistory(keys: AuthKeys): Promise<Fill[]> {
  const res = await callKrakenPrivate<{ trades?: Record<string, RawTrade> }>(
    keys.apiKey,
    keys.apiSecret,
    "TradesHistory",
  );
  if (!res.ok) return [];
  return Object.entries(res.result?.trades ?? {})
    .map(([id, raw]) => parseFill(id, raw))
    .sort((a, b) => b.time - a.time);
}

export async function fetchOpenPositions(keys: AuthKeys): Promise<Position[]> {
  const res = await callKrakenPrivate<Record<string, RawPos>>(keys.apiKey, keys.apiSecret, "OpenPositions", {
    docalcs: "true",
  });
  if (!res.ok || !res.result) return [];
  return Object.entries(res.result)
    .filter(([, raw]) => raw && typeof raw === "object")
    .map(([id, raw]) => parsePosition(id, raw))
    .filter((p) => p.size > 0);
}

export async function fetchEarn(keys: AuthKeys): Promise<EarnRow[]> {
  const res = await callKrakenPrivate<{ converted_to_fiat?: string; items?: unknown[] } | Record<string, unknown>>(
    keys.apiKey,
    keys.apiSecret,
    "Earn/Allocations",
    { converted_asset: "EUR" },
  );
  if (!res.ok || !res.result) return [];
  const items = Array.isArray((res.result as { items?: unknown[] }).items)
    ? ((res.result as { items: unknown[] }).items as Record<string, unknown>[])
    : [];
  return items
    .map((it) => {
      const asset = normalizeKrakenAsset(String(it.native_asset ?? it.asset ?? ""));
      const amount = num(it.amount_allocated ?? it.amount ?? (it.native_alloc as { amount?: string } | undefined)?.amount);
      return {
        strategyId: String(it.strategy_id ?? it.strategyId ?? asset),
        asset,
        amount,
        apr: num(it.apr) || undefined,
        note: String(it.payout ?? it.type ?? "Earn"),
      };
    })
    .filter((r) => r.asset && r.amount > 0);
}

export async function fetchEarnStrategies(keys: AuthKeys): Promise<EarnStrategy[]> {
  const res = await callKrakenPrivate<{ items?: Record<string, unknown>[] }>(
    keys.apiKey,
    keys.apiSecret,
    "Earn/Strategies",
    { limit: "80" },
  );
  if (!res.ok || !res.result) return [];
  const items = res.result.items ?? [];
  return items
    .map((it) => {
      const lock = it.lock_type as { type?: string } | string | undefined;
      const lockType = typeof lock === "string" ? lock : String(lock?.type ?? "flex");
      const aprBlock = it.apr_estimate as { low?: string; high?: string } | undefined;
      const apr = num(it.apr) || num(aprBlock?.high) || num(aprBlock?.low) || undefined;
      return {
        id: String(it.id ?? it.strategy_id ?? ""),
        asset: normalizeKrakenAsset(String(it.native_asset ?? it.asset ?? "")),
        apr,
        canAllocate: it.can_allocate !== false,
        canDeallocate: it.can_deallocate !== false,
        lockType,
        note: String((it.auto_compound as { type?: string } | undefined)?.type ?? lockType),
      };
    })
    .filter((s) => s.id && s.asset);
}

export async function allocateEarn(
  keys: AuthKeys,
  strategyId: string,
  amount: number,
): Promise<{ ok: boolean; message: string }> {
  if (!(amount > 0)) return { ok: false, message: "Montant invalide." };
  const res = await callKrakenPrivate<{ result?: string }>(keys.apiKey, keys.apiSecret, "Earn/Allocate", {
    strategy_id: strategyId,
    amount: String(amount),
  });
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, message: "Allocation Earn envoyée" };
}

export async function deallocateEarn(
  keys: AuthKeys,
  strategyId: string,
  amount: number,
): Promise<{ ok: boolean; message: string }> {
  if (!(amount > 0)) return { ok: false, message: "Montant invalide." };
  const res = await callKrakenPrivate<{ result?: string }>(keys.apiKey, keys.apiSecret, "Earn/Deallocate", {
    strategy_id: strategyId,
    amount: String(amount),
  });
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, message: "Retrait Earn envoyé" };
}

export async function fetchAccountSnapshot(
  keys: AuthKeys,
  mode: SnapshotMode = "full",
): Promise<
  ({ ok: true; message: string } & AccountSnapshot) | ({ ok: false; message: string } & Partial<AccountSnapshot>)
> {
  const bal = await callKrakenPrivate<Record<string, string>>(keys.apiKey, keys.apiSecret, "Balance");
  if (!bal.ok) {
    return { ok: false, message: bal.message, balances: {}, eur: 0, orders: [], fills: [], positions: [], earn: [] };
  }
  const balances = parseKrakenBalances(bal.result);
  if (mode === "light") {
    const [orders, positions] = await Promise.all([fetchOpenOrders(keys), fetchOpenPositions(keys)]);
    return {
      ok: true,
      message: "Soldes et ordres à jour",
      balances,
      eur: balances.EUR ?? 0,
      orders,
      fills: [],
      positions,
      earn: [],
    };
  }
  const [trade, orders, closed, fills, positions, earn] = await Promise.all([
    fetchTradeBalance(keys),
    fetchOpenOrders(keys),
    fetchClosedOrders(keys),
    fetchTradesHistory(keys),
    fetchOpenPositions(keys),
    fetchEarn(keys),
  ]);
  return {
    ok: true,
    message: "Compte Kraken synchronisé",
    balances,
    eur: balances.EUR ?? 0,
    trade,
    orders: [...orders, ...closed].slice(0, 80),
    fills: fills.slice(0, 80),
    positions,
    earn,
  };
}

export async function placeKrakenOrder(
  keys: AuthKeys,
  input: NewOrderInput,
  opts?: { validate?: boolean },
): Promise<{ ok: boolean; message: string; txid?: string; order?: Order }> {
  const meta = PAIR_BY_ID[input.pair];
  if (!meta) return { ok: false, message: "Paire inconnue." };
  const volume = formatKrakenVolume(input.amount, meta.lotDecimals);
  if (!(Number(volume) > 0)) return { ok: false, message: "Quantité invalide." };
  if (Number(volume) < meta.ordermin) {
    return { ok: false, message: `Minimum ${meta.ordermin} ${meta.base}.` };
  }
  const mapped = krakenOrderType(input);
  if (mapped.ordertype !== "market" && mapped.ordertype !== "trailing-stop" && !(Number(mapped.price) > 0)) {
    return { ok: false, message: "Prix manquant." };
  }
  const params: Record<string, string> = {
    pair: input.pair,
    type: input.side,
    ordertype: mapped.ordertype,
    volume,
    oflags: "fciq",
  };
  if (mapped.price) params.price = mapped.price;
  if (mapped.price2) params.price2 = mapped.price2;
  if (input.leverage && input.leverage > 1) params.leverage = String(input.leverage);
  if (input.sl && input.sl > 0) {
    params["close[ordertype]"] = "stop-loss";
    params["close[price]"] = String(input.sl);
  } else if (input.tp && input.tp > 0) {
    params["close[ordertype]"] = "take-profit";
    params["close[price]"] = String(input.tp);
  }
  if (opts?.validate) params.validate = "true";
  const res = await callKrakenPrivate<{ txid?: string[]; descr?: { order?: string } }>(
    keys.apiKey,
    keys.apiSecret,
    "AddOrder",
    params,
  );
  if (!res.ok) return { ok: false, message: res.message };
  const txid = res.result?.txid?.[0];
  const now = Date.now();
  const order: Order = {
    id: txid ?? `kr-${now}`,
    pair: input.pair,
    side: input.side,
    type: input.type,
    amount: input.amount,
    price: input.price,
    stopPrice: input.stopPrice,
    filled: input.type === "market" ? input.amount : 0,
    avgPrice: input.type === "market" ? (input.price ?? 0) : 0,
    status: input.type === "market" ? "filled" : "open",
    leverage: input.leverage && input.leverage > 1 ? input.leverage : 1,
    tp: input.tp,
    sl: input.sl,
    trailingPct: input.trailingPct,
    fee: 0,
    createdAt: now,
    updatedAt: now,
    note: res.result?.descr?.order,
  };
  return {
    ok: true,
    message: res.result?.descr?.order ?? (opts?.validate ? "Ordre valide (non envoyé)" : "Ordre Kraken envoyé"),
    txid,
    order,
  };
}

export async function cancelKrakenOrder(
  keys: AuthKeys,
  txid: string,
): Promise<{ ok: boolean; message: string }> {
  const res = await callKrakenPrivate<{ count?: number }>(keys.apiKey, keys.apiSecret, "CancelOrder", { txid });
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, message: `Annulé (${res.result?.count ?? 1})` };
}

export async function closeKrakenPosition(
  keys: AuthKeys,
  pos: Position,
): Promise<{ ok: boolean; message: string; txid?: string }> {
  const meta = PAIR_BY_ID[pos.pair];
  if (!meta) return { ok: false, message: "Paire inconnue." };
  const volume = formatKrakenVolume(pos.size, meta.lotDecimals);
  const params: Record<string, string> = {
    pair: pos.pair,
    type: pos.side === "long" ? "sell" : "buy",
    ordertype: "market",
    volume,
    oflags: "fciq",
  };
  if (pos.leverage > 1) params.leverage = String(pos.leverage);
  const res = await callKrakenPrivate<{ txid?: string[]; descr?: { order?: string } }>(
    keys.apiKey,
    keys.apiSecret,
    "AddOrder",
    params,
  );
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, message: res.result?.descr?.order ?? "Position clôturée", txid: res.result?.txid?.[0] };
}

async function convertDirect(
  keys: AuthKeys,
  from: string,
  to: string,
  amount: number,
): Promise<{ ok: boolean; message: string; txid?: string }> {
  const direct = pairForAssets(from, to);
  if (!direct) return { ok: false, message: `Pas de marché ${from}/${to}.` };
  const meta = PAIR_BY_ID[direct.pair];
  if (!meta) return { ok: false, message: "Paire inconnue." };
  const volume = formatKrakenVolume(amount, meta.lotDecimals);
  if (!(Number(volume) > 0)) return { ok: false, message: "Quantité invalide." };
  const params: Record<string, string> = {
    pair: direct.pair,
    type: direct.side,
    ordertype: "market",
    volume,
    oflags: direct.side === "buy" ? "viqc,fciq" : "fciq",
  };
  const res = await callKrakenPrivate<{ txid?: string[]; descr?: { order?: string } }>(
    keys.apiKey,
    keys.apiSecret,
    "AddOrder",
    params,
  );
  if (!res.ok) return { ok: false, message: res.message };
  return { ok: true, message: res.result?.descr?.order ?? `${from} → ${to}`, txid: res.result?.txid?.[0] };
}

export async function convertKraken(
  keys: AuthKeys,
  from: string,
  to: string,
  amount: number,
): Promise<{ ok: boolean; message: string; txid?: string }> {
  if (!(amount > 0) || from === to) return { ok: false, message: "Conversion invalide." };
  if (pairForAssets(from, to)) return convertDirect(keys, from, to, amount);
  const via = from === "EUR" || to === "EUR" ? "USD" : "EUR";
  if (!pairForAssets(from, via) || !pairForAssets(via, to)) {
    return { ok: false, message: `Pas de marché ${from}/${to}.` };
  }
  const before = await callKrakenPrivate<Record<string, string>>(keys.apiKey, keys.apiSecret, "Balance");
  const viaBefore = parseKrakenBalances(before.result)[via] ?? 0;
  const step1 = await convertDirect(keys, from, via, amount);
  if (!step1.ok) return step1;
  await sleep(1100);
  const after = await callKrakenPrivate<Record<string, string>>(keys.apiKey, keys.apiSecret, "Balance");
  const received = Math.max(0, (parseKrakenBalances(after.result)[via] ?? 0) - viaBefore);
  if (!(received > 0)) {
    return {
      ok: true,
      message: `${from} → ${via} exécuté. Relance ${via} → ${to} avec le solde reçu.`,
      txid: step1.txid,
    };
  }
  const step2 = await convertDirect(keys, via, to, received);
  if (!step2.ok) {
    return { ok: false, message: `${from} → ${via} OK, mais ${via} → ${to} : ${step2.message}`, txid: step1.txid };
  }
  return { ok: true, message: `${from} → ${to} via ${via}`, txid: step2.txid ?? step1.txid };
}

export async function fetchDepositAddress(
  keys: AuthKeys,
  asset: string,
): Promise<{ ok: boolean; message: string; info?: DepositInfo }> {
  const methods = await callKrakenPrivate<Array<{ method?: string; limit?: boolean }>>(
    keys.apiKey,
    keys.apiSecret,
    "DepositMethods",
    { asset },
  );
  if (!methods.ok) return { ok: false, message: methods.message };
  const method = methods.result?.[0]?.method;
  if (!method) return { ok: false, message: "Aucune méthode de dépôt pour cet actif." };
  const addr = await callKrakenPrivate<Array<{ address?: string; tag?: string; expiretm?: string }>>(
    keys.apiKey,
    keys.apiSecret,
    "DepositAddresses",
    { asset, method },
  );
  if (!addr.ok) return { ok: false, message: addr.message };
  const row = addr.result?.[0];
  if (!row?.address) return { ok: false, message: "Adresse indisponible." };
  return {
    ok: true,
    message: "Adresse de dépôt Kraken",
    info: { asset, method, address: row.address, tag: row.tag },
  };
}
