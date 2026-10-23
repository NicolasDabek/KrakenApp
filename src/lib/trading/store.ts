import { toast } from "sonner";
import type { Bot, BotRuntime, Order } from "./types";
import { allocateByPerformance, applyPaperFill, botAllocScore, botInventoryQty, botMark, DEFAULT_PAPER, dropFormingCandle, EMPTY_STATS, evaluateBot, evaluateDesk, flattenPaper, gatedOptimizeBot, kindNeedsCandles, kindTitle, mtfIntervalsOf, paperEquity, parseBotBlueprints, resetPaperAccount, snapshotEquity } from "./bots.ts";
import { uid } from "./format.ts";
import { krakenBalance, krakenCancel, krakenConvert, krakenSnapshot } from "./functions.ts";
import { DEFAULT_PAIR, PAIR_BY_ID, toEurPair } from "./pairs.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BALANCES, DEFAULT_CONNECTION, DEFAULT_SETTINGS, FEED_DEAD_MS, FEED_STALE_MS } from "./store/defaults.ts";
import { createOrderActions, INFLIGHT_TIMEOUT_MS, makePosition, restoreFlight, snapshotRuntime } from "./store/positions.ts";
import type { TradingState } from "./store/state.ts";
import { tradingPersistOptions } from "./store/persistence.ts";
import { cloneBalances, clonePaper, eurValue, getBal, pairAssets, pingFill, withLog } from "./store/helpers.ts";

export { FEED_STALE_MS, FEED_DEAD_MS, DEFAULT_BALANCES } from "./store/defaults.ts";
export { INFLIGHT_TIMEOUT_MS } from "./store/positions.ts";
export { tickerList, eurUsdRate, isLiveConnected, liveBalanceRows, usdValue, eurValue } from "./store/helpers.ts";

let lastAllocAt = 0;

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
      krakenOrders: [],
      krakenFills: [],
      krakenPositions: [],
      deskPeakPaper: DEFAULT_PAPER.startingBalance,
      deskPeakLive: 0,

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

      ...createOrderActions(set, get),
      addAlert: (alert) => {
        const armPrice = get().tickers[alert.pair]?.last;
        set({
          alerts: [
            { ...alert, id: uid("al"), createdAt: Date.now(), armPrice },
            ...get().alerts,
          ],
        });
      },
      removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
      rearmAlert: (id) =>
        set({
          alerts: get().alerts.map((a) =>
            a.id === id ? { ...a, triggeredAt: undefined, armPrice: get().tickers[a.pair]?.last ?? a.armPrice } : a,
          ),
        }),

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

      convertLive: async (from, to, amount) => {
        const { apiKey, apiSecret } = get().connection;
        if (!apiKey || !apiSecret) return { ok: false, message: "Clés Kraken manquantes." };
        const res = await krakenConvert({ data: { apiKey, apiSecret, from, to, amount } });
        if (!res.ok) {
          toast.message("Conversion refusée", { description: res.message });
          return res;
        }
        toast.success("Conversion Kraken", { description: res.message });
        void get().syncKraken("light");
        return res;
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
          if (al.armPrice == null || !Number.isFinite(al.armPrice)) return { ...al, armPrice: t.last };
          const prev = al.armPrice;
          const crossed = al.condition === "above" ? prev < al.price && t.last >= al.price : prev > al.price && t.last <= al.price;
          if (!crossed) return { ...al, armPrice: t.last };
          changed = true;
          toast("Alerte prix", {
            description: `${PAIR_BY_ID[al.pair]?.display} ${al.condition === "above" ? "≥" : "≤"} ${al.price}`,
          });
          return { ...al, triggeredAt: now, armPrice: t.last };
        });

        for (const plan of nextRecurring) {
          if (!plan.active || plan.nextAt > now) continue;
          const t = tickers[plan.pair];
          const meta = PAIR_BY_ID[plan.pair];
          if (!t?.last || !meta) continue;
          const amount = plan.amountQuote / t.last;
          if (amount < meta.ordermin) continue;
          const live = Boolean(get().connection.apiKey && get().connection.apiSecret);
          if (live) {
            plan.nextAt = now + (plan.cadence === "daily" ? 86_400_000 : 604_800_000);
            changed = true;
            void get().placeLiveOrder({
              pair: plan.pair,
              side: "buy",
              type: "market",
              amount,
              note: "DCA",
            });
            continue;
          }
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
          log: [{ t: Date.now(), text: "Créé." }],
        };
        set({ bots: [bot, ...get().bots] });
        return bot;
      },

      startBot: (id) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot) return { ok: false, message: "Bot introuvable." };
        if (bot.runtime.inFlight) {
          toast.message("Un ordre Kraken est encore en cours.");
          return { ok: false, message: "Un ordre Kraken est encore en cours." };
        }
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
          void get().syncKraken("light");
        }
        if (bot.venue === "live" && !get().tickers[pair] && !get().tickers[bot.pair]) {
          toast.message("Marché indisponible.");
          return { ok: false, message: "Marché indisponible." };
        }
        set({
          bots: get().bots.map((b) =>
            b.id === id
              ? withLog(
                  {
                    ...b,
                    pair,
                    status: "running",
                    startedAt: Date.now(),
                    lastNote: "Démarré.",
                    error: undefined,
                    runtime:
                      b.kind === "dca"
                        ? { ...b.runtime, nextDcaAt: Date.now(), inFlight: false, pendingFills: undefined }
                        : {
                            ...b.runtime,
                            inFlight: false,
                            pendingFills: undefined,
                            ...((b.runtime.gridOwned ?? []).some((g) => g.qty > 0)
                              ? {}
                              : { lastPrice: undefined, gridLower: undefined, gridUpper: undefined }),
                            ...(b.kind === "grid" &&
                            b.params.gridSeed &&
                            !(b.runtime.gridOwned ?? []).some((g) => g.qty > 0)
                              ? { gridSeedNow: true }
                              : {}),
                          },
                  },
                  "Démarré.",
                )
              : b,
          ),
        });
        get().runBots();
        return { ok: true, message: "Bot lancé." };
      },

      pauseBot: (id) => {
        set({
          bots: get().bots.map((b) =>
            b.id === id ? withLog({ ...b, status: "paused", lastNote: "En pause." }, "En pause.") : b,
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
          log: [{ t: Date.now(), text: "Copie créée." }],
        };
        set({ bots: [copy, ...get().bots] });
        return copy;
      },

      cloneBotToPair: (id, pair) => {
        const src = get().bots.find((b) => b.id === id);
        if (!src) return null;
        const dest = toEurPair(pair);
        const last = get().tickers[dest]?.last ?? 0;
        const copy = get().duplicateBot(id);
        if (!copy) return null;
        let params = copy.params;
        if (copy.kind === "grid" && last > 0) {
          const lo = copy.params.lower ?? 0;
          const hi = copy.params.upper ?? 0;
          const mid = lo > 0 && hi > lo ? (lo + hi) / 2 : 0;
          if (mid > 0) {
            const scale = last / mid;
            params = { ...copy.params, lower: lo * scale, upper: hi * scale };
          }
        }
        const meta = PAIR_BY_ID[dest];
        const name = `${kindTitle(copy.kind)} ${meta?.display ?? dest}`;
        get().updateBot(copy.id, { pair: dest, name, params });
        return get().bots.find((b) => b.id === copy.id) ?? copy;
      },

      toggleBuyPause: (id) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot) return;
        const next = !bot.runtime.buyPause;
        set({
          bots: get().bots.map((b) =>
            b.id === id
              ? {
                  ...b,
                  runtime: { ...b.runtime, buyPause: next },
                  lastNote: next ? "Achats en pause — reventes actives." : "Achats réarmés.",
                }
              : b,
          ),
        });
        toast.message(next ? "Achats en pause" : "Achats réarmés");
      },

      seedGrid: (id) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot || bot.kind !== "grid") return { ok: false, message: "Pas une grille." };
        if (bot.status !== "running") return { ok: false, message: "Lance le bot d’abord." };
        if ((bot.runtime.gridOwned ?? []).some((g) => g.qty > 0)) {
          return { ok: false, message: "Un lot est déjà ouvert." };
        }
        set({
          bots: get().bots.map((b) =>
            b.id === id ? { ...b, runtime: { ...b.runtime, gridSeedNow: true }, lastNote: "Prise du premier lot…" } : b,
          ),
        });
        get().runBots();
        return { ok: true, message: "Premier lot envoyé." };
      },

      importBots: (raw) => {
        const rows = parseBotBlueprints(raw);
        if (!rows.length) return { ok: false, message: "Aucun bot valide dans le fichier.", count: 0 };
        const created = rows.map((row) => {
          const pair = toEurPair(row.pair);
          const meta = PAIR_BY_ID[pair];
          const bot: Bot = {
            id: uid("bot"),
            name: row.name.trim() || `${kindTitle(row.kind)} ${meta?.display ?? pair}`,
            kind: row.kind,
            venue: row.venue,
            status: "idle",
            pair,
            interval: row.interval,
            sizeQuote: row.sizeQuote,
            params: row.params,
            createdAt: Date.now(),
            lastNote: "Importé.",
            stats: { ...EMPTY_STATS },
            runtime: {},
            log: [{ t: Date.now(), text: "Importé." }],
          };
          return bot;
        });
        set({ bots: [...created, ...get().bots] });
        return { ok: true, message: `${created.length} bot${created.length > 1 ? "s" : ""} importé${created.length > 1 ? "s" : ""}.`, count: created.length };
      },

      setPaperStart: (amount) => {
        if (!(amount > 0)) return { ok: false, message: "Solde de départ invalide." };
        const running = get().bots.some((b) => b.venue === "paper" && b.status === "running");
        if (running) return { ok: false, message: "Pause les bots papier avant de changer le solde." };
        set({ paper: resetPaperAccount(amount, get().paper.feeRate), deskPeakPaper: amount });
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
          deskPeakPaper: paper.startingBalance,
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
        set({
          paper: snapshotEquity(paper, eq),
          bots: get().bots.map((b) =>
            b.venue === "paper"
              ? {
                  ...b,
                  runtime: {
                    ...b.runtime,
                    inPosition: false,
                    positionQty: 0,
                    positionAvg: 0,
                    gridOwned: [],
                    peakPrice: undefined,
                    scaledOut: false,
                    entryAt: undefined,
                    entryBar: undefined,
                  },
                  lastNote: sold ? "Positions papier liquidées." : b.lastNote,
                }
              : b,
          ),
        });
        if (sold) toast.success(`Positions papier liquidées (${sold})`);
        else toast.message("Rien à liquider");
      },

      flattenBot: (id) => {
        const bot = get().bots.find((b) => b.id === id);
        if (!bot) return;
        const ticker = get().tickers[bot.pair];
        const meta = PAIR_BY_ID[bot.pair];
        let qty = botInventoryQty(bot.runtime);
        if (!(qty > 0) || !ticker?.last || !meta) {
          toast.message("Pas de position à clôturer sur ce bot.");
          return;
        }
        if (bot.venue === "live") {
          const bals = get().krakenBalances;
          const have = bals[meta.base] ?? 0;
          if (Object.keys(bals).length > 0) {
            if (!(have > 0)) {
              toast.message(`Solde ${meta.base} insuffisant sur Kraken.`);
              return;
            }
            qty = Math.min(qty, have);
          }
        }
        const price = ticker.bid || ticker.last;
        if (bot.venue === "live") {
          if (bot.runtime.inFlight) {
            toast.message("Ordre déjà en cours.");
            return;
          }
          set({
            bots: get().bots.map((b) =>
              b.id === id
                ? { ...b, runtime: { ...b.runtime, inFlight: true, inFlightAt: Date.now() }, lastNote: "Clôture Kraken…" }
                : b,
            ),
          });
          void get().dispatchKrakenFill({
            botId: id,
            pair: bot.pair,
            side: "sell",
            qty,
            price,
            note: "Clôture manuelle",
            prevRuntime: bot.runtime,
            intendedRuntime: {
              ...bot.runtime,
              inPosition: false,
              positionQty: 0,
              positionAvg: 0,
              gridOwned: [],
              inFlight: false,
              pendingFills: undefined,
            },
            entryAvg: bot.runtime.positionAvg,
          });
          return;
        }
        const res = applyPaperFill(get().paper, {
          botId: id,
          pair: bot.pair,
          base: meta.base,
          side: "sell",
          qty,
          price,
          note: "Clôture manuelle",
        });
        if (!res.ok) {
          toast.message(res.message);
          return;
        }
        const stats = { ...bot.stats };
        stats.trades += 1;
        stats.closes = (stats.closes ?? 0) + 1;
        stats.feesPaid += res.trade.fee;
        stats.volume += qty * price;
        stats.realizedPnl += res.trade.pnl;
        if (res.trade.pnl > 0) stats.wins += 1;
        set({
          paper: snapshotEquity(res.paper, paperEquity(res.paper, get().tickers)),
          bots: get().bots.map((b) =>
            b.id === id
              ? withLog(
                  {
                    ...b,
                    stats,
                    lastNote: "Position clôturée.",
                    lastActionAt: Date.now(),
                    runtime: {
                      ...b.runtime,
                      inPosition: false,
                      positionQty: 0,
                      positionAvg: 0,
                      gridOwned: [],
                    },
                  },
                  "Clôture manuelle",
                  "sell",
                )
              : b,
          ),
        });
        toast.success("Position papier clôturée");
      },

      panicLive: () => {
        const live = get().bots.filter((b) => b.venue === "live");
        get().pauseAllBots("live", { silent: true });
        let closing = 0;
        for (const bot of live) {
          if (botInventoryQty(bot.runtime) > 0) {
            closing += 1;
            get().flattenBot(bot.id);
          }
        }
        toast.message(
          closing ? `Stop d’urgence · ${closing} position${closing > 1 ? "s" : ""} en clôture` : "Bots réels arrêtés",
        );
      },

      setBotCandles: (bag) => set({ botCandles: { ...get().botCandles, ...bag } }),

      pauseAllBots: (venue, opts) => {
        const note = opts?.note ?? "Stop global.";
        set({
          bots: get().bots.map((b) =>
            b.status === "running" && (!venue || b.venue === venue)
              ? {
                  ...b,
                  status: "paused",
                  lastNote: note,
                  runtime: b.runtime.inFlight ? restoreFlight(b.runtime) : { ...b.runtime, inFlight: false },
                }
              : b,
          ),
        });
        if (!opts?.silent) {
          toast.message(opts?.note ?? (venue === "live" ? "Bots réels en pause" : "Bots en pause"));
        }
      },

      cancelOpenOrdersOnHalt: async () => {
        const settings = get().settings;
        if (settings.cancelOrdersOnHalt === false) {
          return { ok: true, message: "Annulation ordres désactivée.", cancelled: 0 };
        }
        const { apiKey, apiSecret } = get().connection;
        if (!apiKey || !apiSecret) return { ok: false, message: "Clés Kraken manquantes.", cancelled: 0 };
        const livePairs = new Set(
          get()
            .bots.filter((b) => b.venue === "live")
            .map((b) => toEurPair(b.pair)),
        );
        const open = get().krakenOrders.filter((o) => o.status === "open");
        const targets = open.filter((o) => {
          const pair = toEurPair(o.pair);
          if (livePairs.has(pair)) return true;
          const note = o.note ?? "";
          return /bot|Bot|grille|RSI|MTF|Nautilus/i.test(note);
        });
        let cancelled = 0;
        for (const order of targets) {
          const res = await krakenCancel({ data: { apiKey, apiSecret, txid: order.id } });
          if (res.ok) {
            cancelled += 1;
            set({
              krakenOrders: get().krakenOrders.map((o) =>
                o.id === order.id ? { ...o, status: "cancelled", updatedAt: Date.now() } : o,
              ),
            });
          }
        }
        if (cancelled > 0) {
          toast.message(`Stop bureau · ${cancelled} ordre${cancelled > 1 ? "s" : ""} Kraken annulé${cancelled > 1 ? "s" : ""}`);
          void get().syncKraken("light");
        }
        return {
          ok: true,
          message: cancelled ? `${cancelled} annulé(s)` : "Aucun ordre ouvert sur les paires bots",
          cancelled,
        };
      },

      rebalanceAllocations: (venue, opts) => {
        const settings = get().settings;
        const minW = settings.allocMin ?? 0.05;
        const maxW = settings.allocMax ?? 0.5;
        const pool = get().bots.filter((b) => b.status === "running" && (!venue || b.venue === venue));
        if (pool.length < 2) return { ok: false, message: "Il faut ≥2 bots actifs pour réallouer." };
        const rows = allocateByPerformance(
          pool.map((b) => ({
            id: b.id,
            score: botAllocScore(b),
            sizeQuote: b.sizeQuote,
            atrRiskPct: b.params.atrRiskPct,
            budgetQuote: b.params.budgetQuote,
          })),
          { min: minW, max: maxW },
        );
        const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
        set({
          bots: get().bots.map((b) => {
            const a = byId[b.id];
            if (!a) return b;
            return {
              ...b,
              sizeQuote: Math.max(10, Math.round(a.sizeQuote * 100) / 100),
              params: {
                ...b.params,
                ...(a.atrRiskPct != null ? { atrRiskPct: Math.round(a.atrRiskPct * 1000) / 1000 } : {}),
                ...(a.budgetQuote != null ? { budgetQuote: Math.round(a.budgetQuote * 100) / 100 } : {}),
              },
              runtime: { ...b.runtime, allocWeight: a.weight },
              lastNote: `Allocation ${(a.weight * 100).toFixed(0)} % · taille ${Math.round(a.sizeQuote)} EUR`,
            };
          }),
        });
        lastAllocAt = Date.now();
        if (!opts?.silent) toast.message("Capital réalloué selon la performance");
        return { ok: true, message: `${rows.length} bots réalloués` };
      },

      runGatedAutoOpt: async () => {
        const settings = get().settings;
        const now = Date.now();
        const candidates = get().bots.filter((b) => {
          if (b.status !== "running" || !b.params.autoOpt) return false;
          if (b.venue === "live" && !settings.autoOptLive) return false;
          const every = b.params.autoOptEveryMs ?? 7 * 24 * 60 * 60 * 1000;
          const last = b.runtime.lastAutoOptAt ?? 0;
          return now - last >= every;
        });
        if (!candidates.length) return { ok: true, message: "Rien à optimiser." };
        const bot = candidates[0]!;
        const pair = toEurPair(bot.pair);
        const candleKey = `${pair}:${bot.interval}`;
        const candles = get().botCandles[candleKey] ?? get().botCandles[`${bot.pair}:${bot.interval}`];
        if (!candles || candles.length < 80) {
          return { ok: false, message: `Auto-opt ${bot.name}: chandeliers insuffisants` };
        }
        const feeRate = bot.venue === "paper" ? get().paper.feeRate : get().settings.takerFee;
        const gated = gatedOptimizeBot(bot.kind, bot.params, bot.sizeQuote, candles, feeRate, pair, {
          minOosSharpe: bot.params.autoOptMinOosSharpe ?? 0,
          interval: bot.interval,
        });
        if (!gated.ok || !gated.params) {
          set({
            bots: get().bots.map((b) =>
              b.id === bot.id
                ? {
                    ...b,
                    runtime: { ...b.runtime, lastAutoOptAt: now },
                    lastNote: `Auto-opt refusé · ${gated.reason}`,
                  }
                : b,
            ),
          });
          return { ok: false, message: gated.reason };
        }
        set({
          bots: get().bots.map((b) =>
            b.id === bot.id
              ? {
                  ...b,
                  params: {
                    ...gated.params!,
                    autoOpt: b.params.autoOpt,
                    autoOptEveryMs: b.params.autoOptEveryMs,
                    autoOptMinOosSharpe: b.params.autoOptMinOosSharpe,
                    mtfIntervals: b.params.mtfIntervals,
                    mtfMode: b.params.mtfMode,
                  },
                  runtime: { ...b.runtime, lastAutoOptAt: now },
                  lastNote: `Auto-opt OK · ${gated.reason}`,
                }
              : b,
          ),
        });
        toast.message(`Auto-opt · ${bot.name}`, { description: gated.reason });
        return { ok: true, message: gated.reason };
      },

      syncKraken: async (mode = "full") => {
        const { apiKey, apiSecret } = get().connection;
        if (!apiKey || !apiSecret) {
          const message = "Clés Kraken manquantes.";
          set({ krakenError: message });
          return { ok: false, message };
        }
        const res = await krakenSnapshot({ data: { apiKey, apiSecret, mode } });
        if (!res.ok) {
          const fallback = await krakenBalance({ data: { apiKey, apiSecret } });
          set({
            krakenBalances: fallback.balances,
            krakenEur: fallback.eur,
            krakenSyncAt: Date.now(),
            krakenError: fallback.ok ? null : fallback.message,
          });
          get().setConnection({
            testedAt: Date.now(),
            testOk: fallback.ok,
            testMessage: fallback.message,
          });
          return { ok: fallback.ok, message: fallback.message };
        }
        const open = (res.orders ?? []).filter((o) => o.status === "open");
        const closedKept =
          mode === "light"
            ? get().krakenOrders.filter((o) => o.status !== "open")
            : (res.orders ?? []).filter((o) => o.status !== "open");
        set({
          krakenBalances: res.balances ?? {},
          krakenEur: res.eur ?? 0,
          krakenOrders: [...open, ...closedKept].slice(0, 80),
          krakenFills: mode === "light" ? get().krakenFills : (res.fills ?? []),
          krakenPositions: res.positions ?? [],
          krakenSyncAt: Date.now(),
          krakenError: null,
        });
        get().setConnection({
          testedAt: Date.now(),
          testOk: true,
          testMessage: res.message,
        });
        return { ok: true, message: res.message };
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
        const settings = get().settings;
        const allBots = get().bots;
        const paperPeak = Math.max(
          get().deskPeakPaper,
          paper.startingBalance,
          paperEq,
          ...paper.equityCurve.map((p) => p.v),
        );
        const livePeak = Math.max(get().deskPeakLive, liveEq);
        if (paperPeak !== get().deskPeakPaper || livePeak !== get().deskPeakLive) {
          set({ deskPeakPaper: paperPeak, deskPeakLive: livePeak });
        }
        const paperDay = allBots.filter((b) => b.venue === "paper").reduce((s, b) => s + (b.runtime.dayPnl ?? 0), 0);
        const paperExposure = running
          .filter((b) => b.venue === "paper")
          .reduce((s, b) => {
            const t = tickers[toEurPair(b.pair)] ?? tickers[b.pair];
            return s + botMark(b.runtime, t?.last ?? 0).exposure;
          }, 0);
        const paperDesk = evaluateDesk({
          equity: paperEq,
          peak: paperPeak,
          dayPnl: paperDay,
          exposure: paperExposure,
          limits: settings,
        });
        if (paperDesk.halt && running.some((b) => b.venue === "paper")) {
          get().pauseAllBots("paper", { note: paperDesk.note ?? "Stop bureau" });
          pingFill(settings, "Nautilus", paperDesk.note ?? "Stop bureau");
          return;
        }
        const liveDay = allBots.filter((b) => b.venue === "live").reduce((s, b) => s + (b.runtime.dayPnl ?? 0), 0);
        const liveExposure = running
          .filter((b) => b.venue === "live")
          .reduce((s, b) => {
            const t = tickers[toEurPair(b.pair)] ?? tickers[b.pair];
            return s + botMark(b.runtime, t?.last ?? 0).exposure;
          }, 0);
        const liveDesk = evaluateDesk({
          equity: liveEq,
          peak: livePeak,
          dayPnl: liveDay,
          exposure: liveExposure,
          limits: settings,
        });
        if (liveDesk.halt && running.some((b) => b.venue === "live")) {
          get().pauseAllBots("live", { note: liveDesk.note ?? "Stop bureau" });
          pingFill(settings, "Nautilus", liveDesk.note ?? "Stop bureau");
          void get().cancelOpenOrdersOnHalt();
          return;
        }
        if (settings.allocEnabled && now - lastAllocAt > 15 * 60_000) {
          const paperN = running.filter((b) => b.venue === "paper").length;
          const liveN = running.filter((b) => b.venue === "live").length;
          if (paperN >= 2) get().rebalanceAllocations("paper", { silent: true });
          if (liveN >= 2) get().rebalanceAllocations("live", { silent: true });
        }

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
          const rawCandles = get().botCandles[candleKey] ?? get().botCandles[`${bot.pair}:${bot.interval}`];
          const candles = kindNeedsCandles(bot.kind)
            ? dropFormingCandle(rawCandles, bot.interval, now)
            : rawCandles;
          if (kindNeedsCandles(bot.kind) && (!candles || candles.length < 10)) {
            if (bot.lastNote.startsWith("Chargement")) return bot;
            botsChanged = true;
            return { ...bot, pair, lastNote: "Chargement des chandeliers…" };
          }
          const multiCandles: Record<number, import("./types").Candle[]> | undefined =
            bot.kind === "mtf"
              ? Object.fromEntries(
                  mtfIntervalsOf(bot)
                    .map((tf) => {
                      const raw =
                        get().botCandles[`${pair}:${tf}`] ?? get().botCandles[`${bot.pair}:${tf}`];
                      const closed = dropFormingCandle(raw, tf, now);
                      return closed && closed.length ? ([tf, closed] as const) : null;
                    })
                    .filter((x): x is readonly [number, import("./types").Candle[]] => x != null),
                )
              : undefined;
          if (bot.kind === "mtf" && (!multiCandles || Object.keys(multiCandles).length < 2)) {
            if (bot.lastNote.startsWith("Multi-TF")) return bot;
            botsChanged = true;
            return { ...bot, pair, lastNote: "Multi-TF : chargement des intervalles…" };
          }
          if (bot.runtime.inFlight) {
            const since = bot.runtime.inFlightAt ?? bot.lastActionAt ?? 0;
            if (since && now - since > INFLIGHT_TIMEOUT_MS) {
              botsChanged = true;
              return withLog(
                {
                  ...bot,
                  status: "paused",
                  lastNote: "Timeout Kraken — pause pour éviter un double ordre. Vérifie l’ordre puis relance.",
                  error: "Timeout Kraken",
                  runtime: restoreFlight(bot.runtime),
                },
                "Timeout Kraken — pause sécurité",
              );
            }
            return bot;
          }
          const queued = (bot.runtime.pendingFills ?? []).filter((f) => f.qty >= meta.ordermin);
          if (queued.length) {
            const fill = queued[0]!;
            const rest = queued.slice(1);
            botsChanged = true;
            outgoing.push({
              botId: bot.id,
              pair,
              side: fill.side,
              qty: fill.qty,
              price: fill.price,
              note: fill.note,
              prevRuntime: bot.runtime,
              intendedRuntime: { ...bot.runtime, pendingFills: rest },
              entryAvg: fill.entry && fill.entry > 0 ? fill.entry : bot.runtime.positionAvg,
            });
            return {
              ...bot,
              pair,
              runtime: { ...bot.runtime, pendingFills: rest, inFlight: true, inFlightAt: now, flightPrev: snapshotRuntime(bot.runtime) },
              lastNote: "Envoi de l’ordre à Kraken…",
            };
          }
          const lastTickAt = get().lastTickAt;
          const watchdog = get().settings.watchdog !== false;
          if (bot.venue === "live" && lastTickAt > 0) {
            const age = now - lastTickAt;
            if (age > FEED_DEAD_MS && watchdog) {
              botsChanged = true;
              return withLog(
                {
                  ...bot,
                  status: "paused",
                  lastNote: "Flux prix figé — pause sécurité.",
                  error: "Flux prix figé",
                },
                "Flux prix figé — pause sécurité",
              );
            }
            if (age > FEED_STALE_MS) {
              if (bot.lastNote.startsWith("Flux prix figé")) return bot;
              botsChanged = true;
              return { ...bot, lastNote: "Flux prix figé — pas d’ordre." };
            }
          }
          const desk = bot.venue === "paper" ? paperDesk : liveDesk;
          const { fills, runtime, note } = evaluateBot(
            { ...bot, pair },
            {
              now,
              ticker,
              candles,
              multiCandles,
              equity: bot.venue === "paper" ? paperEq : liveEq || paperEq,
              quoteBudget:
                bot.venue === "paper"
                  ? desk.blockBuys
                    ? 0
                    : paper.cash
                  : desk.blockBuys
                    ? 0
                    : get().krakenSyncAt > 0
                      ? get().krakenEur
                      : undefined,
              baseBudget:
                bot.venue === "paper"
                  ? paper.holdings[meta.base]?.qty ?? 0
                  : get().krakenSyncAt > 0
                    ? (get().krakenBalances[meta.base] ?? 0)
                    : undefined,
              feeRate: bot.venue === "paper" ? paper.feeRate : get().settings.takerFee,
              maxFills: bot.venue === "live" ? 1 : undefined,
              closedOnly: true,
            },
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
              runtime.peakPrice === bot.runtime.peakPrice &&
              (runtime.gridOwned?.length ?? 0) === (bot.runtime.gridOwned?.length ?? 0) &&
              runtime.buyPause === bot.runtime.buyPause &&
              runtime.gridLower === bot.runtime.gridLower &&
              runtime.buyCoolUntil === bot.runtime.buyCoolUntil &&
              runtime.gridSeedNow === bot.runtime.gridSeedNow
            ) {
              return bot;
            }
            botsChanged = true;
            return next;
          }
          const stats = { ...bot.stats };
          if (bot.venue === "live") {
            const queued = (bot.runtime.pendingFills ?? []).filter((f) => f.qty >= meta.ordermin);
            const fresh = fills.filter((f) => f.qty >= meta.ordermin);
            const valid = queued.length ? queued : fresh;
            if (!valid.length) {
              botsChanged = true;
              return { ...next, lastNote: `Sous le minimum ${meta.ordermin} ${meta.base}.` };
            }
            const fill = valid[0]!;
            const rest = valid.slice(1);
            botsChanged = true;
            outgoing.push({
              botId: bot.id,
              pair,
              side: fill.side,
              qty: fill.qty,
              price: fill.price,
              note: fill.note,
              prevRuntime: bot.runtime,
              intendedRuntime: { ...runtime, pendingFills: rest },
              entryAvg: fill.entry && fill.entry > 0 ? fill.entry : bot.runtime.positionAvg,
            });
            return {
              ...next,
              runtime: { ...runtime, pendingFills: rest, inFlight: true, inFlightAt: now, flightPrev: snapshotRuntime(bot.runtime) },
              lastNote: "Envoi de l’ordre à Kraken…",
            };
          }
          let filled = 0;
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
              costBasis: fill.entry,
            });
            if (!res.ok) {
              next = { ...next, lastNote: res.message };
              continue;
            }
            filled += 1;
            paper = res.paper;
            paperChanged = true;
            stats.trades += 1;
            stats.feesPaid += res.trade.fee;
            stats.volume += fill.qty * fill.price;
            stats.realizedPnl += res.trade.pnl;
            if (fill.side === "sell") {
              stats.closes = (stats.closes ?? 0) + 1;
              if (res.trade.pnl > 0) stats.wins += 1;
            }
            const compound = bot.params.compoundPct ?? 0;
            if (compound > 0 && fill.side === "sell" && res.trade.pnl > 0) {
              next.sizeQuote = Math.max(5, next.sizeQuote + res.trade.pnl * (compound / 100));
            }
            const dayPnl = (next.runtime.dayPnl ?? 0) + res.trade.pnl;
            const dayTrades = (next.runtime.dayTrades ?? 0) + 1;
            const consecutiveLosses =
              fill.side === "sell"
                ? res.trade.pnl < 0
                  ? (next.runtime.consecutiveLosses ?? 0) + 1
                  : 0
                : (next.runtime.consecutiveLosses ?? 0);
            next = withLog(
              {
                ...next,
                stats,
                lastActionAt: now,
                lastNote: fill.note,
                runtime: { ...next.runtime, dayPnl, dayTrades, consecutiveLosses },
              },
              fill.note,
              fill.side,
            );
            toast.message(bot.name, {
              description: `${fill.side === "buy" ? "Achat" : "Vente"} papier · frais ${res.trade.fee.toFixed(2)} EUR`,
            });
            pingFill(
              get().settings,
              bot.name,
              `${fill.side === "buy" ? "Achat" : "Vente"} ${fill.note}`,
            );
          }
          if (filled === 0 && fills.length > 0) {
            next = {
              ...next,
              runtime: {
                ...next.runtime,
                inPosition: bot.runtime.inPosition,
                positionQty: bot.runtime.positionQty,
                positionAvg: bot.runtime.positionAvg,
                gridOwned: bot.runtime.gridOwned,
                peakPrice: bot.runtime.peakPrice,
                nextDcaAt: bot.runtime.nextDcaAt,
                scaledOut: bot.runtime.scaledOut,
                entryAt: bot.runtime.entryAt,
                entryBar: bot.runtime.entryBar,
                gridLower: bot.runtime.gridLower,
                gridUpper: bot.runtime.gridUpper,
                buyPause: bot.runtime.buyPause,
                buyCoolUntil: bot.runtime.buyCoolUntil,
                gridSeedNow: bot.runtime.gridSeedNow,
              },
            };
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
    tradingPersistOptions,
  ),
);
