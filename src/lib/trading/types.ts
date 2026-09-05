export type Ticker = {
  id: string;
  last: number;
  bid: number;
  ask: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  vwap: number;
  change: number;
  changePct: number;
  trades: number;
  quoteVolume: number;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type BookLevel = {
  price: number;
  size: number;
  total: number;
};

export type OrderBook = {
  bids: BookLevel[];
  asks: BookLevel[];
  spread: number;
  spreadPct: number;
};

export type TapeTrade = {
  id: string;
  price: number;
  size: number;
  side: "buy" | "sell";
  time: number;
};

export type OrderType = "market" | "limit" | "stop" | "stop-limit";
export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "filled" | "cancelled" | "rejected";

export type Order = {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price?: number;
  stopPrice?: number;
  filled: number;
  avgPrice: number;
  status: OrderStatus;
  leverage: number;
  tp?: number;
  sl?: number;
  trailingPct?: number;
  fee: number;
  createdAt: number;
  updatedAt: number;
  note?: string;
};

export type Position = {
  id: string;
  pair: string;
  side: "long" | "short";
  size: number;
  entry: number;
  leverage: number;
  margin: number;
  liqPrice: number;
  tp?: number;
  sl?: number;
  trailingPct?: number;
  peak: number;
  openedAt: number;
};

export type Fill = {
  id: string;
  orderId: string;
  pair: string;
  side: OrderSide;
  amount: number;
  price: number;
  fee: number;
  time: number;
};

export type Balance = {
  asset: string;
  available: number;
  hold: number;
};

export type PriceAlert = {
  id: string;
  pair: string;
  condition: "above" | "below";
  price: number;
  note: string;
  createdAt: number;
  triggeredAt?: number;
};

export type ConnectionConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  testedAt?: number;
  testOk?: boolean;
  testMessage?: string;
};

export type Settings = {
  confirmOrders: boolean;
  displayQuote: "USD" | "EUR";
  makerFee: number;
  takerFee: number;
};

export type RecurringBuy = {
  id: string;
  pair: string;
  amountQuote: number;
  cadence: "daily" | "weekly";
  nextAt: number;
  active: boolean;
};

export type JournalMood = "plan" | "win" | "loss" | "note";

export type JournalEntry = {
  id: string;
  pair: string;
  text: string;
  mood: JournalMood;
  createdAt: number;
};

export type NewOrderInput = {
  pair: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price?: number;
  stopPrice?: number;
  leverage?: number;
  tp?: number;
  sl?: number;
  trailingPct?: number;
  note?: string;
};

export type BotKind =
  | "grid"
  | "dca"
  | "rsi"
  | "ema"
  | "bollinger"
  | "macd"
  | "stoch"
  | "vwap"
  | "breakout"
  | "supertrend"
  | "volume"
  | "scalp"
  | "cci"
  | "meanrev"
  | "keltner"
  | "roc"
  | "adx"
  | "williams"
  | "ichimoku"
  | "psar"
  | "sma"
  | "ha";
export type BotVenue = "paper" | "live";
export type BotStatus = "idle" | "running" | "paused" | "error";

export type GridLevelState = {
  price: number;
  qty: number;
  entry: number;
};

export type BotRuntime = {
  lastPrice?: number;
  lastCandleTime?: number;
  lastRsi?: number;
  lastEmaFast?: number;
  lastEmaSlow?: number;
  lastMacdHist?: number;
  lastClose?: number;
  lastStochK?: number;
  lastVwap?: number;
  lastSupertrend?: number;
  lastTrend?: "up" | "down";
  lastCci?: number;
  lastZ?: number;
  lastRoc?: number;
  lastAdx?: number;
  lastWr?: number;
  lastSar?: number;
  peakPrice?: number;
  gridOwned?: GridLevelState[];
  nextDcaAt?: number;
  inPosition?: boolean;
  positionQty?: number;
  positionAvg?: number;
  inFlight?: boolean;
  inFlightAt?: number;
  dayStamp?: string;
  dayPnl?: number;
  dayTrades?: number;
  consecutiveLosses?: number;
  errorStreak?: number;
};;

export type BotStats = {
  trades: number;
  wins: number;
  feesPaid: number;
  realizedPnl: number;
  volume: number;
};

export type BotParams = {
  lower?: number;
  upper?: number;
  levels?: number;
  intervalMs?: number;
  rsiPeriod?: number;
  oversold?: number;
  overbought?: number;
  fast?: number;
  slow?: number;
  bbPeriod?: number;
  bbMult?: number;
  macdFast?: number;
  macdSlow?: number;
  macdSignal?: number;
  stochN?: number;
  donchian?: number;
  atrPeriod?: number;
  atrMult?: number;
  volMult?: number;
  slPct?: number;
  tpPct?: number;
  cooldownSec?: number;
  maxDailyLoss?: number;
  trailingPct?: number;
  maxSpreadPct?: number;
  maxTradesDay?: number;
  maxConsecutiveLoss?: number;
  sizePct?: number;
  cciPeriod?: number;
  zWindow?: number;
  zEntry?: number;
  kcPeriod?: number;
  kcMult?: number;
  rocPeriod?: number;
  adxPeriod?: number;
  adxMin?: number;
  wrPeriod?: number;
  tenkan?: number;
  kijun?: number;
  psarAf?: number;
  psarMax?: number;
};

export type Bot = {
  id: string;
  name: string;
  kind: BotKind;
  venue: BotVenue;
  status: BotStatus;
  pair: string;
  interval: number;
  sizeQuote: number;
  params: BotParams;
  createdAt: number;
  startedAt?: number;
  lastActionAt?: number;
  lastNote: string;
  error?: string;
  stats: BotStats;
  runtime: BotRuntime;
};

export type PaperHolding = {
  qty: number;
  avg: number;
};

export type PaperTrade = {
  id: string;
  botId: string;
  pair: string;
  side: OrderSide;
  amount: number;
  price: number;
  fee: number;
  pnl: number;
  note: string;
  time: number;
};

export type LiveFill = {
  id: string;
  botId: string;
  pair: string;
  side: OrderSide;
  amount: number;
  price: number;
  fee: number;
  pnl: number;
  note: string;
  time: number;
  txid?: string;
};

export type EquityPoint = {
  t: number;
  v: number;
};

export type PaperAccount = {
  startingBalance: number;
  cash: number;
  holdings: Record<string, PaperHolding>;
  feesPaid: number;
  realizedPnl: number;
  feeRate: number;
  trades: PaperTrade[];
  equityCurve: EquityPoint[];
};
