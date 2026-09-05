import { toast } from "sonner";
import type {
  Balance,
  Bot,
  BotKind,
  BotParams,
  BotRuntime,
  BotVenue,
  Candle,
  ConnectionConfig,
  Fill,
  JournalEntry,
  JournalMood,
  LiveFill,
  NewOrderInput,
  Order,
  OrderBook,
  PaperAccount,
  Position,
  PriceAlert,
  RecurringBuy,
  Settings,
  TapeTrade,
  Ticker,
} from "./types";
import { applyPaperFill, DEFAULT_PAPER, EMPTY_STATS, evaluateBot, flattenPaper, kindNeedsCandles, kindTitle, paperEquity, resetPaperAccount, snapshotEquity } from "./bots";
import { formatKrakenVolume, uid } from "./format";
import { krakenAddOrder, krakenBalance } from "./functions";
import { DEFAULT_PAIR, PAIR_BY_ID, toEurPair } from "./pairs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const TAKER = 0.0026;
const MAKER = 0.0016;

export const DEFAULT_BALANCES: Balance[] = [
  { asset: "USD", available: 25000, hold: 0 },
  { asset: "EUR", available: 8000, hold: 0 },
  { asset: "BTC", available: 0.12, hold: 0 },
  { asset: "ETH", available: 1.85, hold: 0 },
  { asset: "SOL", available: 32, hold: 0 },
  { asset: "XRP", available: 1200, hold: 0 },
  { asset: "ADA", available: 2500, hold: 0 },
  { asset: "DOGE", available: 8000, hold: 0 },
];

const DEFAULT_SETTINGS: Settings = {
  confirmOrders: false,
  displayQuote: "USD",
  makerFee: MAKER,
  takerFee: TAKER,
};

const DEFAULT_CONNECTION: ConnectionConfig = {
  baseUrl: "",
  apiKey: "",
  apiSecret: "",
};

type TradingState = {
  tickers: Record<string, Ticker>;
  books: Record<string, OrderBook>;
  tapes: Record<string, TapeTrade[]>;
  watchlist: string[];
  lastPair: string;
  balances: Balance[];
  orders: Order[];
  fills: Fill[];
  positions: Position[];
  alerts: PriceAlert[];
  recurring: RecurringBuy[];
  journal: JournalEntry[];
  settings: Settings;
  connection: ConnectionConfig;
  lastTickAt: number;
  live: boolean;
  error: string | null;
  bots: Bot[];
  paper: PaperAccount;
  botCandles: Record<string, Candle[]>;
  krakenBalances: Record<string, number>;
  krakenEur: number;
  krakenSyncAt: number;
  krakenError: string | null;
  liveFills: LiveFill[];
  hydrateTickers: (list: Ticker[]) => void;
  setBook: (pair: string, book: OrderBook) => void;
  setTape: (pair: string, trades: TapeTrade[]) => void;
  setLive: (live: boolean, error?: string | null) => void;
  setLastPair: (pair: string) => void;
  toggleWatch: (pair: string) => void;
  placeOrder: (input: NewOrderInput, opts?: { silent?: boolean }) => { ok: boolean; message: string; order?: Order };
  cancelOrder: (id: string) => void;
  closePosition: (id: string) => void;
  addAlert: (alert: Omit<PriceAlert, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  convert: (from: string, to: string, amount: number) => { ok: boolean; message: string };
  addRecurring: (item: Omit<RecurringBuy, "id">) => void;
  toggleRecurring: (id: string) => void;
  removeRecurring: (id: string) => void;
  addJournal: (entry: { pair: string; text: string; mood: JournalMood }) => void;
  removeJournal: (id: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setConnection: (patch: Partial<ConnectionConfig>) => void;
  resetDemo: () => void;
  processTick: () => void;
  createBot: (input: {
    kind: BotKind;
    venue: BotVenue;
    pair: string;
    interval: number;
    sizeQuote: number;
    params: BotParams;
    name?: string;
  }) => Bot;
  startBot: (id: string) => { ok: boolean; message: string };
  pauseBot: (id: string) => void;
  removeBot: (id: string) => void;
  setPaperStart: (amount: number) => { ok: boolean; message: string };
  setPaperFee: (rate: number) => void;
  resetPaper: () => void;
  flattenPaperPositions: () => void;
  setBotCandles: (bag: Record<string, Candle[]>) => void;
  runBots: () => void;
  pauseAllBots: (venue?: BotVenue) => void;
  updateBot: (id: string, patch: Partial<Pick<Bot, "name" | "sizeQuote" | "params" | "interval">>) => void;
  duplicateBot: (id: string) => Bot | null;
  syncKraken: () => Promise<{ ok: boolean; message: string }>;
  dispatchKrakenFill: (input: {
    botId: string;
    pair: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    note: string;
    prevRuntime: BotRuntime;
    intendedRuntime: BotRuntime;
    entryAvg?: number;
  }) => Promise<void>;
};

function cloneBalances(list: Balance[]): Balance[] {
  return list.map((b) => ({ ...b }));
}

function getBal(list: Balance[], asset: string): Balance {
  const found = list.find((b) => b.asset === asset);
  if (found) return found;
  const created = { asset, available: 0, hold: 0 };
  list.push(created);
  return created;
}

function pairAssets(pairId: string) {
  const meta = PAIR_BY_ID[pairId];
  return { base: meta?.base ?? "BTC", quote: meta?.quote ?? "USD", meta };
}

function liquidationPrice(entry: number, leverage: number, side: "long" | "short") {
  const mm = 0.006;
  const move = (1 / leverage - mm) * entry;
  return side === "long" ? Math.max(entry - move, 0) : entry + move;
}

function makePosition(order: Order, px: number, now: number): Position {
  const side = order.side === "buy" ? "long" : "short";
  return {
    id: uid("pos"),
    pair: order.pair,
    side,
    size: order.amount,
    entry: px,
    leverage: order.leverage,
    margin: (order.amount * px) / order.leverage,
    liqPrice: liquidationPrice(px, order.leverage, side),
    tp: order.tp,
    sl: order.sl,
    trailingPct: order.trailingPct,
    peak: px,
    openedAt: now,
  };
}

function buzz() {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* ignore */
  }
}

function clonePaper(paper: PaperAccount): PaperAccount {
  return {
    ...paper,
    holdings: Object.fromEntries(Object.entries(paper.holdings).map(([k, v]) => [k, { ...v }])),
    trades: [...paper.trades],
    equityCurve: [...paper.equityCurve],
  };
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      tickers: {},
      books: {},
      tapes: {},
      watchlist: ["XBTUSD", "ETHUSD", "SOLUSD", "XRPUSD", "ADAUSD"],
      lastPair: DEFAULT_PAIR,
      balances: cloneBalances(DEFAULT_BALANCES),
      orders: [],
      fills: [],
      positions: [],
      alerts: [],
      recurring: [],
      journal: [],
      settings: { ...DEFAULT_SETTINGS },
      connection: { ...DEFAULT_CONNECTION },
      lastTickAt: 0,
      live: false,
      error: null,
      bots: [],
      paper: { ...DEFAULT_PAPER, equityCurve: [] },
      botCandles: {},
      krakenBalances: {},
      krakenEur: 0,
      krakenSyncAt: 0,
      krakenError: null,
      liveFills: [],

      hydrateTickers: (list) => {
        const tickers = { ...get().tickers };
        for (const t of list) tickers[t.id] = t;
        set({ tickers, lastTickAt: Date.now(), live: true, error: null });
        get().processTick();
        get().runBots();
      },

      setBook: (pair, book) => set({ books: { ...get().books, [pair]: book } }),
      setTape: (pair, trades) => set({ tapes: { ...get().tapes, [pair]: trades } }),
      setLive: (live, error = null) => set({ live, error }),
      setLastPair: (pair) => set({ lastPair: pair }),

      toggleWatch: (pair) => {
        const watchlist = get().watchlist.includes(pair)
          ? get().watchlist.filter((p) => p !== pair)
          : [pair, ...get().watchlist];
        set({ watchlist });
      },

      placeOrder: (input, opts) => {
        const silent = opts?.silent ?? false;
        const { base, quote, meta } = pairAssets(input.pair);
        const ticker = get().tickers[input.pair];
        if (!ticker) return { ok: false, message: "Marché indisponible pour le moment." };
        if (!meta) return { ok: false, message: "Paire inconnue." };
        if (!(input.amount > 0)) return { ok: false, message: "Quantité invalide." };
        if (input.amount < meta.ordermin) {
          return { ok: false, message: `Minimum ${meta.ordermin} ${base}.` };
        }

        const last = ticker.last;
        const leverage = Math.min(Math.max(input.leverage ?? 1, 1), meta.maxLeverage);
        const isMargin = leverage > 1;
        const now = Date.now();
        const order: Order = {
          id: uid("ord"),
          pair: input.pair,
          side: input.side,
          type: input.type,
          amount: input.amount,
          price: input.price,
          stopPrice: input.stopPrice,
          filled: 0,
          avgPrice: 0,
          status: "open",
          leverage,
          tp: input.tp,
          sl: input.sl,
          trailingPct: input.trailingPct,
          fee: 0,
          createdAt: now,
          updatedAt: now,
          note: input.note,
        };

        const shouldFillNow =
          input.type === "market" ||
          (input.type === "limit" &&
            input.price != null &&
            ((input.side === "buy" && last <= input.price) ||
              (input.side === "sell" && last >= input.price)));

        const fillPrice =
          input.type === "market"
            ? input.side === "buy"
              ? ticker.ask || last
              : ticker.bid || last
            : (input.price ?? last);

        const balances = cloneBalances(get().balances);
        const feeRate = shouldFillNow ? get().settings.takerFee : get().settings.makerFee;

        if (isMargin) {
          const marginNeeded = (input.amount * fillPrice) / leverage;
          const quoteBal = getBal(balances, quote);
          if (quoteBal.available < marginNeeded) {
            return { ok: false, message: `Marge insuffisante en ${quote}.` };
          }
          quoteBal.available -= marginNeeded;
          quoteBal.hold += marginNeeded;
        } else if (input.side === "buy") {
          const quoteBal = getBal(balances, quote);
          const cost = input.amount * (input.price ?? fillPrice);
          const hold = shouldFillNow ? 0 : cost;
          const spend = shouldFillNow ? cost * (1 + feeRate) : cost;
          if (quoteBal.available < spend) {
            return { ok: false, message: `Solde ${quote} insuffisant.` };
          }
          quoteBal.available -= spend;
          if (!shouldFillNow) quoteBal.hold += hold;
        } else {
          const baseBal = getBal(balances, base);
          if (baseBal.available < input.amount) {
            return { ok: false, message: `Solde ${base} insuffisant.` };
          }
          baseBal.available -= input.amount;
          if (!shouldFillNow) baseBal.hold += input.amount;
        }

        if (shouldFillNow) {
          const fee = input.amount * fillPrice * feeRate;
          order.status = "filled";
          order.filled = input.amount;
          order.avgPrice = fillPrice;
          order.fee = fee;
          const fill: Fill = {
            id: uid("fill"),
            orderId: order.id,
            pair: input.pair,
            side: input.side,
            amount: input.amount,
            price: fillPrice,
            fee,
            time: now,
          };
          if (isMargin) {
            set({
              balances,
              orders: [order, ...get().orders],
              fills: [fill, ...get().fills],
              positions: [makePosition(order, fillPrice, now), ...get().positions],
            });
          } else if (input.side === "buy") {
            const baseBal = getBal(balances, base);
            baseBal.available += input.amount;
            set({
              balances,
              orders: [order, ...get().orders],
              fills: [fill, ...get().fills],
            });
          } else {
            const quoteBal = getBal(balances, quote);
            quoteBal.available += input.amount * fillPrice - fee;
            set({
              balances,
              orders: [order, ...get().orders],
              fills: [fill, ...get().fills],
            });
          }
          if (!silent) {
            buzz();
            toast.success(
              `${input.side === "buy" ? "Achat" : "Vente"} ${meta.display} exécuté`,
              { description: `${input.amount} ${base} @ ${fillPrice}` },
            );
          }
          return { ok: true, message: "Ordre exécuté.", order };
        }

        set({ balances, orders: [order, ...get().orders] });
        if (!silent) toast.message("Ordre ouvert", { description: `${meta.display} · ${input.type}` });
        return { ok: true, message: "Ordre placé.", order };
      },

      cancelOrder: (id) => {
        const order = get().orders.find((o) => o.id === id && o.status === "open");
        if (!order) return;
        const { base, quote } = pairAssets(order.pair);
        const balances = cloneBalances(get().balances);
        if (order.leverage > 1) {
          const quoteBal = getBal(balances, quote);
          const reserved = ((order.price ?? 0) * order.amount) / order.leverage;
          quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
          quoteBal.available += reserved;
        } else if (order.side === "buy") {
          const quoteBal = getBal(balances, quote);
          const reserved = (order.price ?? 0) * order.amount;
          quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
          quoteBal.available += reserved;
        } else {
          const baseBal = getBal(balances, base);
          baseBal.hold = Math.max(0, baseBal.hold - order.amount);
          baseBal.available += order.amount;
        }
        set({
          balances,
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, status: "cancelled", updatedAt: Date.now() } : o,
          ),
        });
      },

      closePosition: (id) => {
        const pos = get().positions.find((p) => p.id === id);
        if (!pos) return;
        const ticker = get().tickers[pos.pair];
        if (!ticker) return;
        const { quote } = pairAssets(pos.pair);
        const px = ticker.last;
        const dir = pos.side === "long" ? 1 : -1;
        const pnl = (px - pos.entry) * pos.size * dir;
        const fee = pos.size * px * get().settings.takerFee;
        const balances = cloneBalances(get().balances);
        const quoteBal = getBal(balances, quote);
        quoteBal.hold = Math.max(0, quoteBal.hold - pos.margin);
        quoteBal.available += pos.margin + pnl - fee;
        const fill: Fill = {
          id: uid("fill"),
          orderId: pos.id,
          pair: pos.pair,
          side: pos.side === "long" ? "sell" : "buy",
          amount: pos.size,
          price: px,
          fee,
          time: Date.now(),
        };
        set({
          balances,
          positions: get().positions.filter((p) => p.id !== id),
          fills: [fill, ...get().fills],
        });
        buzz();
        toast.success("Position clôturée", {
          description: `PnL ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ${quote}`,
        });
      },

      addAlert: (alert) => {
        set({
          alerts: [
            { ...alert, id: uid("al"), createdAt: Date.now() },
            ...get().alerts,
          ],
        });
      },
      removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),

      convert: (from, to, amount) => {
        if (!(amount > 0) || from === to) return { ok: false, message: "Conversion invalide." };
        const tickers = get().tickers;
        const usdOf = (asset: string, qty: number) => {
          if (asset === "USD") return qty;
          if (asset === "EUR") {
            const btcUsd = tickers.XBTUSD?.last;
            const btcEur = tickers.XBTEUR?.last;
            if (btcUsd && btcEur) return qty * (btcUsd / btcEur);
            return qty * 1.08;
          }
          const t = Object.values(tickers).find((x) => PAIR_BY_ID[x.id]?.base === asset && PAIR_BY_ID[x.id]?.quote === "USD");
          return t ? qty * t.last : 0;
        };
        const fromUsd = usdOf(from, amount);
        if (!fromUsd) return { ok: false, message: "Prix introuvable pour cet actif." };
        const toQty = usdOf(to, 1);
        if (!toQty) return { ok: false, message: "Actif d'arrivée indisponible." };
        const received = (fromUsd / toQty) * (1 - get().settings.takerFee);
        const balances = cloneBalances(get().balances);
        const src = getBal(balances, from);
        if (src.available < amount) return { ok: false, message: "Solde insuffisant." };
        src.available -= amount;
        getBal(balances, to).available += received;
        set({ balances });
        toast.success("Conversion exécutée", {
          description: `${amount} ${from} → ${received.toPrecision(6)} ${to}`,
        });
        return { ok: true, message: "OK" };
      },

      addRecurring: (item) =>
        set({ recurring: [{ ...item, id: uid("dca") }, ...get().recurring] }),
      toggleRecurring: (id) =>
        set({
          recurring: get().recurring.map((r) =>
            r.id === id ? { ...r, active: !r.active } : r,
          ),
        }),
      removeRecurring: (id) => set({ recurring: get().recurring.filter((r) => r.id !== id) }),

      addJournal: (entry) =>
        set({
          journal: [
            { ...entry, id: uid("jnl"), createdAt: Date.now() },
            ...get().journal,
          ],
        }),
      removeJournal: (id) => set({ journal: get().journal.filter((j) => j.id !== id) }),

      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      setConnection: (patch) => set({ connection: { ...get().connection, ...patch } }),
      resetDemo: () => {
        set({
          balances: cloneBalances(DEFAULT_BALANCES),
          orders: [],
          fills: [],
          positions: [],
          alerts: [],
          recurring: [],
          journal: [],
        });
        toast.message("Compte démo réinitialisé");
      },

      processTick: () => {
        const { tickers, orders, alerts, settings, positions } = get();
        const now = Date.now();
        let balances = cloneBalances(get().balances);
        let nextOrders = [...orders];
        let fills = [...get().fills];
        let nextPositions = [...positions];
        let nextAlerts = [...alerts];
        const nextRecurring = get().recurring.map((r) => ({ ...r }));
        let changed = false;

        for (const order of nextOrders) {
          if (order.status !== "open") continue;
          const t = tickers[order.pair];
          if (!t) continue;
          const last = t.last;
          let hit = false;
          if (order.type === "limit" && order.price != null) {
            hit =
              order.side === "buy" ? last <= order.price : last >= order.price;
          } else if (order.type === "stop" && order.stopPrice != null) {
            hit =
              order.side === "buy" ? last >= order.stopPrice : last <= order.stopPrice;
          } else if (order.type === "stop-limit" && order.stopPrice != null && order.price != null) {
            const triggered =
              order.side === "buy" ? last >= order.stopPrice : last <= order.stopPrice;
            hit = triggered && (order.side === "buy" ? last <= order.price : last >= order.price);
          }
          if (!hit) continue;
          const { base, quote } = pairAssets(order.pair);
          const px = order.price ?? last;
          const fee = order.amount * px * settings.makerFee;
          order.status = "filled";
          order.filled = order.amount;
          order.avgPrice = px;
          order.fee = fee;
          order.updatedAt = now;
          fills = [
            {
              id: uid("fill"),
              orderId: order.id,
              pair: order.pair,
              side: order.side,
              amount: order.amount,
              price: px,
              fee,
              time: now,
            },
            ...fills,
          ];
          if (order.leverage > 1) {
            const quoteBal = getBal(balances, quote);
            const reserved = ((order.price ?? px) * order.amount) / order.leverage;
            quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
            nextPositions = [makePosition(order, px, now), ...nextPositions];
          } else if (order.side === "buy") {
            const quoteBal = getBal(balances, quote);
            const reserved = (order.price ?? px) * order.amount;
            quoteBal.hold = Math.max(0, quoteBal.hold - reserved);
            const leftover = reserved - order.amount * px;
            quoteBal.available += Math.max(leftover, 0);
            getBal(balances, base).available += order.amount;
            quoteBal.available -= fee;
          } else {
            const baseBal = getBal(balances, base);
            baseBal.hold = Math.max(0, baseBal.hold - order.amount);
            getBal(balances, quote).available += order.amount * px - fee;
          }
          changed = true;
          toast.success("Ordre limite exécuté", { description: PAIR_BY_ID[order.pair]?.display });
        }

        nextPositions = nextPositions
          .map((pos) => {
            const t = tickers[pos.pair];
            if (!t) return pos;
            const last = t.last;
            const peak =
              pos.side === "long"
                ? Math.max(pos.peak ?? pos.entry, last)
                : Math.min(pos.peak ?? pos.entry, last);
            if (peak !== pos.peak) changed = true;
            return { ...pos, peak };
          })
          .filter((pos) => {
            const t = tickers[pos.pair];
            if (!t) return true;
            const last = t.last;
            const hitTp =
              pos.tp != null && (pos.side === "long" ? last >= pos.tp : last <= pos.tp);
            const hitSl =
              pos.sl != null && (pos.side === "long" ? last <= pos.sl : last >= pos.sl);
            const hitLiq = pos.side === "long" ? last <= pos.liqPrice : last >= pos.liqPrice;
            const trail = pos.trailingPct;
            const peak = pos.peak ?? pos.entry;
            const hitTrail =
              trail != null &&
              trail > 0 &&
              (pos.side === "long" ? last <= peak * (1 - trail / 100) : last >= peak * (1 + trail / 100));
            if (!hitTp && !hitSl && !hitLiq && !hitTrail) return true;
            const { quote } = pairAssets(pos.pair);
            const dir = pos.side === "long" ? 1 : -1;
            const pnl = (last - pos.entry) * pos.size * dir;
            const quoteBal = getBal(balances, quote);
            quoteBal.hold = Math.max(0, quoteBal.hold - pos.margin);
            quoteBal.available += pos.margin + pnl;
            changed = true;
            toast.message(hitLiq ? "Liquidation" : hitTrail ? "Trailing stop" : "TP/SL déclenché", {
              description: PAIR_BY_ID[pos.pair]?.display,
            });
            return false;
          });

        nextAlerts = nextAlerts.map((al) => {
          if (al.triggeredAt) return al;
          const t = tickers[al.pair];
          if (!t) return al;
          const hit = al.condition === "above" ? t.last >= al.price : t.last <= al.price;
          if (!hit) return al;
          changed = true;
          toast("Alerte prix", {
            description: `${PAIR_BY_ID[al.pair]?.display} ${al.condition === "above" ? "≥" : "≤"} ${al.price}`,
          });
          return { ...al, triggeredAt: now };
        });

        for (const plan of nextRecurring) {
          if (!plan.active || plan.nextAt > now) continue;
          const t = tickers[plan.pair];
          const meta = PAIR_BY_ID[plan.pair];
          if (!t?.last || !meta) continue;
          const amount = plan.amountQuote / t.last;
          if (amount < meta.ordermin) continue;
          const quoteBal = getBal(balances, meta.quote);
          const fee = plan.amountQuote * settings.takerFee;
          if (quoteBal.available < plan.amountQuote + fee) continue;
          quoteBal.available -= plan.amountQuote + fee;
          getBal(balances, meta.base).available += amount;
          const order: Order = {
            id: uid("ord"),
            pair: plan.pair,
            side: "buy",
            type: "market",
            amount,
            filled: amount,
            avgPrice: t.last,
            status: "filled",
            leverage: 1,
            fee,
            createdAt: now,
            updatedAt: now,
            note: "DCA",
          };
          nextOrders = [order, ...nextOrders];
          fills = [
            {
              id: uid("fill"),
              orderId: order.id,
              pair: plan.pair,
              side: "buy",
              amount,
              price: t.last,
              fee,
              time: now,
            },
            ...fills,
          ];
          plan.nextAt = now + (plan.cadence === "daily" ? 86_400_000 : 604_800_000);
          changed = true;
          toast.success("Achat récurrent", { description: meta.display });
        }

        if (changed) {
          set({
            balances,
            orders: nextOrders,
            fills,
            positions: nextPositions,
            alerts: nextAlerts,
            recurring: nextRecurring,
          });
        }
      },

      createBot: (input) => {
        const pair = toEurPair(input.pair);
        const meta = PAIR_BY_ID[pair];
        const bot: Bot = {
          id: uid("bot"),
          name: input.name?.trim() || `${kindTitle(input.kind)} ${meta?.display ?? pair}`,
          kind: input.kind,
          venue: input.venue,
          status: "idle",
          pair,
          interval: input.interval,
          sizeQuote: input.sizeQuote,
          params: input.params,
          createdAt: Date.now(),
          lastNote: "Prêt.",
          stats: { ...EMPTY_STATS },
          runtime: {},
        };
        set({ bots: [bot, ...get().bots] });
        return bot;
      },

      startBot: (id) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot) return { ok: false, message: "Bot introuvable." };
        const pair = toEurPair(bot.pair);
        if (PAIR_BY_ID[pair]?.quote !== "EUR") {
          toast.message("Les bots n’opèrent qu’en EUR.");
          return { ok: false, message: "Les bots n’opèrent qu’en EUR." };
        }
        if (bot.venue === "live") {
          const { apiKey, apiSecret } = get().connection;
          if (!apiKey || !apiSecret) {
            toast.message("Ajoute tes clés publique et privée Kraken.");
            return { ok: false, message: "Ajoute tes clés publique et privée Kraken." };
          }
          void get().syncKraken();
        }
        if (bot.venue === "live" && !get().tickers[pair] && !get().tickers[bot.pair]) {
          toast.message("Marché indisponible.");
          return { ok: false, message: "Marché indisponible." };
        }
        set({
          bots: get().bots.map((b) =>
            b.id === id
              ? {
                  ...b,
                  pair,
                  status: "running",
                  startedAt: Date.now(),
                  lastNote: "Démarré.",
                  error: undefined,
                  runtime:
                    b.kind === "dca"
                      ? { ...b.runtime, nextDcaAt: Date.now(), inFlight: false }
                      : { ...b.runtime, inFlight: false },
                }
              : b,
          ),
        });
        get().runBots();
        return { ok: true, message: "Bot lancé." };
      },

      pauseBot: (id) => {
        set({
          bots: get().bots.map((b) =>
            b.id === id ? { ...b, status: "paused", lastNote: "En pause." } : b,
          ),
        });
      },

      removeBot: (id) => set({ bots: get().bots.filter((b) => b.id !== id) }),

      updateBot: (id, patch) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot || bot.status === "running") {
          toast.message("Mets le bot en pause pour le modifier.");
          return;
        }
        set({
          bots: get().bots.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...patch,
                  params: patch.params ? { ...b.params, ...patch.params } : b.params,
                }
              : b,
          ),
        });
      },

      duplicateBot: (id) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot) return null;
        const copy: Bot = {
          ...bot,
          id: uid("bot"),
          name: `${bot.name} copie`,
          status: "idle",
          createdAt: Date.now(),
          startedAt: undefined,
          lastActionAt: undefined,
          lastNote: "Copie prête.",
          error: undefined,
          stats: { ...EMPTY_STATS },
          runtime: {},
          pair: toEurPair(bot.pair),
        };
        set({ bots: [copy, ...get().bots] });
        return copy;
      },

      setPaperStart: (amount) => {
        if (!(amount > 0)) return { ok: false, message: "Solde de départ invalide." };
        const running = get().bots.some((b) => b.venue === "paper" && b.status === "running");
        if (running) return { ok: false, message: "Pause les bots papier avant de changer le solde." };
        set({ paper: resetPaperAccount(amount, get().paper.feeRate) });
        toast.message("Solde papier appliqué", { description: `${amount.toLocaleString("fr-FR")} EUR` });
        return { ok: true, message: "OK" };
      },

      setPaperFee: (rate) => {
        const feeRate = Math.min(Math.max(rate, 0), 0.05);
        if (feeRate === get().paper.feeRate) return;
        set({ paper: { ...get().paper, feeRate } });
        toast.message("Frais papier mis à jour", {
          description: `${(feeRate * 100).toFixed(2)} % taker`,
        });
      },

      resetPaper: () => {
        const running = get().bots.some((b) => b.venue === "paper" && b.status === "running");
        if (running) {
          toast.message("Pause les bots papier avant de réinitialiser.");
          return;
        }
        const paper = get().paper;
        set({
          paper: resetPaperAccount(paper.startingBalance, paper.feeRate),
          bots: get().bots.map((b) =>
            b.venue === "paper"
              ? { ...b, stats: { ...EMPTY_STATS }, runtime: {}, lastNote: "Compte papier réinitialisé.", status: "idle" }
              : b,
          ),
        });
        toast.message("Simulation réinitialisée");
      },

      flattenPaperPositions: () => {
        const { paper, sold } = flattenPaper(get().paper, get().tickers);
        const eq = paperEquity(paper, get().tickers);
        set({ paper: snapshotEquity(paper, eq) });
        if (sold) toast.success(`Positions papier liquidées (${sold})`);
        else toast.message("Rien à liquider");
      },

      setBotCandles: (bag) => set({ botCandles: { ...get().botCandles, ...bag } }),

      pauseAllBots: (venue) => {
        set({
          bots: get().bots.map((b) =>
            b.status === "running" && (!venue || b.venue === venue)
              ? { ...b, status: "paused", lastNote: "Stop global.", runtime: { ...b.runtime, inFlight: false } }
              : b,
          ),
        });
        toast.message(venue === "live" ? "Bots réels en pause" : "Bots en pause");
      },

      syncKraken: async () => {
        const { apiKey, apiSecret } = get().connection;
        if (!apiKey || !apiSecret) {
          const message = "Clés Kraken manquantes.";
          set({ krakenError: message });
          return { ok: false, message };
        }
        const res = await krakenBalance({ data: { apiKey, apiSecret } });
        set({
          krakenBalances: res.balances,
          krakenEur: res.eur,
          krakenSyncAt: Date.now(),
          krakenError: res.ok ? null : res.message,
        });
        get().setConnection({
          testedAt: Date.now(),
          testOk: res.ok,
          testMessage: res.message,
        });
        return { ok: res.ok, message: res.message };
      },

      dispatchKrakenFill: async (input) => {
        const { apiKey, apiSecret } = get().connection;
        const fail = (message: string, pause = false) => {
          set({
            bots: get().bots.map((b) =>
              b.id === input.botId
                ? {
                    ...b,
                    status: pause ? "paused" : b.status === "running" ? "running" : b.status,
                    lastNote: message,
                    error: message,
                    runtime: {
                      ...input.prevRuntime,
                      inFlight: false,
                      errorStreak: (b.runtime.errorStreak ?? 0) + 1,
                    },
                  }
                : b,
            ),
          });
          toast.message("Kraken a refusé l’ordre", { description: message });
        };
        if (!apiKey || !apiSecret) {
          fail("Clés Kraken manquantes.", true);
          return;
        }
        const meta = PAIR_BY_ID[input.pair];
        if (!meta || meta.quote !== "EUR") {
          fail("Paire hors EUR.", true);
          return;
        }
        const volume = formatKrakenVolume(input.qty, meta.lotDecimals);
        if (!(Number(volume) > 0)) {
          fail(`Volume invalide (${volume}).`);
          return;
        }
        if (Number(volume) < meta.ordermin) {
          fail(`Sous le minimum ${meta.ordermin} ${meta.base}.`);
          return;
        }
        const balances = get().krakenBalances;
        if (input.side === "buy" && (get().krakenEur > 0 || Object.keys(balances).length > 0)) {
          const need = input.qty * input.price * 1.004;
          if (get().krakenEur + 1e-9 < need) {
            fail(`EUR insuffisant sur Kraken (${need.toFixed(2)} requis).`, true);
            return;
          }
        }
        if (input.side === "sell") {
          const have = balances[meta.base] ?? 0;
          if (Object.keys(balances).length > 0 && have + 1e-12 < input.qty) {
            fail(`Solde ${meta.base} insuffisant sur Kraken.`, true);
            return;
          }
        }
        const res = await krakenAddOrder({
          data: { apiKey, apiSecret, pair: input.pair, side: input.side, volume },
        });
        const now = Date.now();
        if (!res.ok) {
          const fatal = /Invalid key|Invalid signature|Permission denied|Insufficient funds/i.test(res.message);
          const streak = (get().bots.find((b) => b.id === input.botId)?.runtime.errorStreak ?? 0) + 1;
          fail(res.message, fatal || streak >= 3);
          if (/Invalid key|Invalid signature/i.test(res.message)) get().pauseAllBots("live");
          return;
        }
        const feeRate = get().settings.takerFee;
        const fee = input.qty * input.price * feeRate;
        let pnl = 0;
        if (input.side === "sell" && input.entryAvg && input.entryAvg > 0) {
          pnl = input.qty * input.price - fee - input.entryAvg * input.qty;
        }
        const live: LiveFill = {
          id: uid("lf"),
          botId: input.botId,
          pair: input.pair,
          side: input.side,
          amount: input.qty,
          price: input.price,
          fee,
          pnl,
          note: input.note,
          time: now,
          txid: res.txid,
        };
        set({
          liveFills: [live, ...get().liveFills].slice(0, 250),
          bots: get().bots.map((b) => {
            if (b.id !== input.botId) return b;
            const stats = { ...b.stats };
            stats.trades += 1;
            stats.feesPaid += fee;
            stats.volume += input.qty * input.price;
            stats.realizedPnl += pnl;
            if (pnl > 0) stats.wins += 1;
            const dayPnl = (input.intendedRuntime.dayPnl ?? 0) + pnl;
            const dayTrades = (input.intendedRuntime.dayTrades ?? 0) + 1;
            const consecutiveLosses =
              input.side === "sell" ? (pnl < 0 ? (b.runtime.consecutiveLosses ?? 0) + 1 : 0) : (b.runtime.consecutiveLosses ?? 0);
            return {
              ...b,
              stats,
              lastActionAt: now,
              lastNote: `${input.note}${res.txid ? ` · ${res.txid}` : ""}`,
              error: undefined,
              runtime: {
                ...input.intendedRuntime,
                inFlight: false,
                dayPnl,
                dayTrades,
                consecutiveLosses,
                errorStreak: 0,
              },
            };
          }),
        });
        toast.success("Ordre Kraken", { description: res.message });
        void get().syncKraken();
      },

      runBots: () => {
        const running = get().bots.filter((b) => b.status === "running");
        if (running.length === 0) return;
        const tickers = get().tickers;
        const now = Date.now();
        let paper = clonePaper(get().paper);
        let botsChanged = false;
        let paperChanged = false;
        const outgoing: Array<{
          botId: string;
          pair: string;
          side: "buy" | "sell";
          qty: number;
          price: number;
          note: string;
          prevRuntime: BotRuntime;
          intendedRuntime: BotRuntime;
          entryAvg?: number;
        }> = [];
        const paperEq = paperEquity(paper, tickers);
        const liveEq = Object.entries(get().krakenBalances).reduce(
          (s, [asset, qty]) => s + eurValue(asset, qty, tickers),
          0,
        );
        const nextBots: Bot[] = get().bots.map((bot): Bot => {
          if (bot.status !== "running") return bot;
          const pair = toEurPair(bot.pair);
          const ticker = tickers[pair] ?? tickers[bot.pair];
          if (!ticker?.last) {
            if (bot.lastNote === "Prix indisponible.") return bot;
            botsChanged = true;
            return { ...bot, pair, lastNote: "Prix indisponible." };
          }
          const meta = PAIR_BY_ID[pair];
          if (!meta || meta.quote !== "EUR") {
            botsChanged = true;
            return { ...bot, status: "error", lastNote: "Paire hors EUR." };
          }
          const candleKey = `${pair}:${bot.interval}`;
          const candles = get().botCandles[candleKey] ?? get().botCandles[`${bot.pair}:${bot.interval}`];
          if (kindNeedsCandles(bot.kind) && (!candles || candles.length < 10)) {
            if (bot.lastNote.startsWith("Chargement")) return bot;
            botsChanged = true;
            return { ...bot, pair, lastNote: "Chargement des chandeliers…" };
          }
          if (bot.runtime.inFlight) {
            const since = bot.runtime.inFlightAt ?? bot.lastActionAt ?? 0;
            if (since && now - since > 90_000) {
              botsChanged = true;
              return {
                ...bot,
                lastNote: "Timeout Kraken, nouvel essai.",
                runtime: { ...bot.runtime, inFlight: false, inFlightAt: undefined },
              };
            }
            return bot;
          }
          const { fills, runtime, note } = evaluateBot(
            { ...bot, pair },
            { now, ticker, candles, equity: bot.venue === "paper" ? paperEq : liveEq || paperEq },
          );
          let next: Bot = { ...bot, pair, runtime, lastNote: note };
          if (
            note.startsWith("Stop journalier") ||
            note.startsWith("Pertes consécutives") ||
            note.startsWith("Quota")
          ) {
            botsChanged = true;
            return { ...next, status: "paused" };
          }
          if (fills.length === 0) {
            if (
              note === bot.lastNote &&
              runtime.lastPrice === bot.runtime.lastPrice &&
              runtime.lastCandleTime === bot.runtime.lastCandleTime &&
              runtime.nextDcaAt === bot.runtime.nextDcaAt &&
              runtime.peakPrice === bot.runtime.peakPrice
            ) {
              return bot;
            }
            botsChanged = true;
            return next;
          }
          const stats = { ...bot.stats };
          if (bot.venue === "live") {
            const fill = fills.find((f) => f.qty >= meta.ordermin);
            if (!fill) {
              botsChanged = true;
              return { ...next, lastNote: `Sous le minimum ${meta.ordermin} ${meta.base}.` };
            }
            botsChanged = true;
            outgoing.push({
              botId: bot.id,
              pair,
              side: fill.side,
              qty: fill.qty,
              price: fill.price,
              note: fill.note,
              prevRuntime: bot.runtime,
              intendedRuntime: runtime,
              entryAvg: bot.runtime.positionAvg,
            });
            return {
              ...next,
              runtime: { ...runtime, inFlight: true, inFlightAt: now },
              lastNote: "Envoi de l’ordre à Kraken…",
            };
          }
          for (const fill of fills) {
            if (fill.qty < meta.ordermin) {
              next = { ...next, lastNote: `Sous le minimum ${meta.ordermin} ${meta.base}.` };
              continue;
            }
            const res = applyPaperFill(paper, {
              botId: bot.id,
              pair,
              base: meta.base,
              side: fill.side,
              qty: fill.qty,
              price: fill.price,
              note: fill.note,
            });
            if (!res.ok) {
              next = { ...next, lastNote: res.message };
              continue;
            }
            paper = res.paper;
            paperChanged = true;
            stats.trades += 1;
            stats.feesPaid += res.trade.fee;
            stats.volume += fill.qty * fill.price;
            stats.realizedPnl += res.trade.pnl;
            if (res.trade.pnl > 0) stats.wins += 1;
            const dayPnl = (next.runtime.dayPnl ?? 0) + res.trade.pnl;
            const dayTrades = (next.runtime.dayTrades ?? 0) + 1;
            const consecutiveLosses =
              fill.side === "sell"
                ? res.trade.pnl < 0
                  ? (next.runtime.consecutiveLosses ?? 0) + 1
                  : 0
                : (next.runtime.consecutiveLosses ?? 0);
            next = {
              ...next,
              stats,
              lastActionAt: now,
              lastNote: fill.note,
              runtime: { ...next.runtime, dayPnl, dayTrades, consecutiveLosses },
            };
            toast.message(bot.name, {
              description: `${fill.side === "buy" ? "Achat" : "Vente"} papier · frais ${res.trade.fee.toFixed(2)} EUR`,
            });
          }
          botsChanged = true;
          return next;
        });

        if (paperChanged) {
          paper = snapshotEquity(paper, paperEquity(paper, tickers));
        }
        if (botsChanged || paperChanged) {
          set({ bots: nextBots, paper });
        }
        for (const o of outgoing) {
          void get().dispatchKrakenFill(o);
        }
      },
    }),
    {
      name: "nautilus-desk",
      version: 2,
      storage: typeof window === "undefined" ? undefined : createJSONStorage(() => localStorage),
      partialize: (s) => ({
        watchlist: s.watchlist,
        lastPair: s.lastPair,
        balances: s.balances,
        orders: s.orders,
        fills: s.fills,
        positions: s.positions,
        alerts: s.alerts,
        recurring: s.recurring,
        journal: s.journal,
        settings: s.settings,
        connection: s.connection,
        bots: s.bots,
        paper: s.paper,
        liveFills: s.liveFills,
      }),
      skipHydration: true,
      migrate: (persisted, from) => {
        const s = persisted as Record<string, unknown>;
        if (from < 2 && Array.isArray(s.bots)) {
          s.bots = (s.bots as Bot[]).map((b) => ({
            ...b,
            pair: toEurPair(b.pair),
            status: b.venue === "live" && b.status === "running" ? "paused" : b.status,
            runtime: { ...b.runtime, inFlight: false },
          }));
        }
        return s as typeof persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.bots = state.bots.map((b) => {
          const pair = toEurPair(b.pair);
          const pauseLive = b.venue === "live" && b.status === "running";
          const next: Bot = {
            ...b,
            pair,
            status: pauseLive ? "paused" : b.status,
            lastNote: pauseLive ? "Pause après rechargement — relance pour trader réel." : b.lastNote,
            runtime: { ...b.runtime, inFlight: false, inFlightAt: undefined },
          };
          return next;
        });
      },
    },
  ),
);

export function tickerList(tickers: Record<string, Ticker>): Ticker[] {
  return Object.values(tickers);
}

export function eurUsdRate(tickers: Record<string, Ticker>): number {
  const a = tickers.XBTUSD?.last;
  const b = tickers.XBTEUR?.last;
  if (a && b) return a / b;
  return 1.08;
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
