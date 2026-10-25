import { DEFAULT_PAPER } from "./bots.ts";
import { DEFAULT_PAIR } from "./pairs.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BALANCES, DEFAULT_CONNECTION, DEFAULT_SETTINGS } from "./store/defaults.ts";
import { createOrderActions } from "./store/positions.ts";
import type { TradingState } from "./store/state.ts";
import { tradingPersistOptions } from "./store/persistence.ts";
import { cloneBalances } from "./store/helpers.ts";
import { createMarketActions } from "./store/market.ts";
import { createAlertActions } from "./store/alerts.ts";
import { createConvertActions } from "./store/convert.ts";
import { createSettingsActions } from "./store/settings.ts";
import { createTickActions } from "./store/tick.ts";
import { createBotActions } from "./store/bots.ts";
import { createPaperActions } from "./store/paper.ts";
import { createRiskActions } from "./store/risk.ts";
import { createEngineActions } from "./store/engine.ts";
import { createKrakenActions } from "./store/kraken.ts";

export { FEED_STALE_MS, FEED_DEAD_MS, DEFAULT_BALANCES } from "./store/defaults.ts";
export { INFLIGHT_TIMEOUT_MS } from "./store/positions.ts";
export { tickerList, eurUsdRate, isLiveConnected, liveBalanceRows, usdValue, eurValue } from "./store/helpers.ts";

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

      ...createMarketActions(set, get),
      ...createOrderActions(set, get),
      ...createAlertActions(set, get),
      ...createConvertActions(set, get),
      ...createSettingsActions(set, get),
      ...createTickActions(set, get),
      ...createBotActions(set, get),
      ...createPaperActions(set, get),
      ...createRiskActions(set, get),
      ...createEngineActions(set, get),
      ...createKrakenActions(set, get),
    }),
    tradingPersistOptions,
  ),
);
