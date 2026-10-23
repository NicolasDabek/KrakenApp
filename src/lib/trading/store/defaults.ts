import type { Balance, ConnectionConfig, Settings } from "../types";

const TAKER = 0.0026;

const MAKER = 0.0016;

export const FEED_STALE_MS = 18_000;

export const FEED_DEAD_MS = 40_000;

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

export const DEFAULT_SETTINGS: Settings = {
  confirmOrders: false,
  displayQuote: "USD",
  makerFee: MAKER,
  takerFee: TAKER,
  notifyFills: false,
  resumeLive: false,
  watchdog: true,
  deskDailyLoss: 0,
  deskDrawdownPct: 0,
  deskMaxExposurePct: 0,
  cancelOrdersOnHalt: true,
  allocEnabled: false,
  allocMin: 0.05,
  allocMax: 0.5,
  autoOptLive: false,
};

export const DEFAULT_CONNECTION: ConnectionConfig = {
  baseUrl: "",
  apiKey: "",
  apiSecret: "",
};
