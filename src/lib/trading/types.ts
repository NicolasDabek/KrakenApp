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
  /** Last price seen. The alert fires only when the market crosses `price`. */
  armPrice?: number;
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
  notifyFills?: boolean;
  resumeLive?: boolean;
  /** Pause live bots when the price feed goes stale. Default true. */
  watchdog?: boolean;
  /** Pause all bots of a venue when their combined day PnL hits −X EUR. 0 = off. */
  deskDailyLoss?: number;
  /** Pause all bots when marked equity drops this % from its peak. 0 = off. */
  deskDrawdownPct?: number;
  /** Block new buys when open bot inventory exceeds this % of equity. 0 = off. */
  deskMaxExposurePct?: number;
  /** On desk halt for live: also cancel open Kraken orders on bot pairs. Default true. */
  cancelOrdersOnHalt?: boolean;
  /** Periodically re-weight running bot sizes by recent performance (paper by default). */
  allocEnabled?: boolean;
  /** Min capital weight per bot when allocEnabled. Default 0.05. */
  allocMin?: number;
  /** Max capital weight per bot when allocEnabled. Default 0.5. */
  allocMax?: number;
  /** Allow scheduled walk-forward-gated re-opt on live bots (dangerous). Default false. */
  autoOptLive?: boolean;
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
  | "ha"
  | "mfi"
  | "engulf"
  | "obv"
  | "div"
  | "confirm"
  | "mtf";
export type BotVenue = "paper" | "live";
export type BotStatus = "idle" | "running" | "paused" | "error";

export type GridLevelState = {
  /** Trigger / remembered buy level (rebuy after a sell). */
  price: number;
  qty: number;
  /** Actual fill price used for PnL and +X% resale. */
  entry: number;
  /** Virtual buy order waiting for price to trade through `price`. */
  pending?: boolean;
  /** Remembered purchase: survive a band recenter. */
  anchor?: boolean;
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
  pendingFills?: { side: "buy" | "sell"; qty: number; price: number; note: string; entry?: number }[];
  entryAt?: number;
  entryBar?: number;
  scaledOut?: boolean;
  /** Working grid band (set when the range auto-recenters). */
  gridLower?: number;
  gridUpper?: number;
  /** When true, the grid only sells — no new buys. */
  buyPause?: boolean;
  /** Consume-once: market-buy the first lot on the next eval. */
  gridSeedNow?: boolean;
  /** Grid: no new buys until this timestamp (after a lot stop). */
  buyCoolUntil?: number;
  /** Book to restore if the in-flight Kraken order never confirms. */
  flightPrev?: BotRuntime;
  /** Last successful gated auto-opt timestamp. */
  lastAutoOptAt?: number;
  /** Current desk allocation weight (0–1) when allocEnabled. */
  allocWeight?: number;
};

export type BotStats = {
  trades: number;
  wins: number;
  closes: number;
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
  /** Skip buys when ADX is above this. Used to keep mean-reversion out of strong trends. 0 = off. */
  adxCeil?: number;
  /** Skip buys when ADX is below this. Used to keep trend bots out of a dead range. 0 = off. */
  adxFloor?: number;
  /** Once the gain reaches this %, the stop moves to entry plus round-trip fees. 0 = off. */
  beAfterPct?: number;
  /** Mean-reversion: skip a buy when the signal bar fell at least this % versus the previous close. 0 = off. */
  crashPct?: number;
  wrPeriod?: number;
  tenkan?: number;
  kijun?: number;
  psarAf?: number;
  psarMax?: number;
  trendEma?: number;
  slAtr?: number;
  maxHoldMin?: number;
  sessionStart?: number;
  sessionEnd?: number;
  partialTp?: number;
  atrRiskPct?: number;
  /** Grid: sell a lot this % above its purchase price. */
  gridSellPct?: number;
  /** Grid: after a buy, place the next buy this % below the fill. */
  gridBuyPct?: number;
  /** Grid: sell a losing lot this % below purchase, without rebuy. */
  gridSlPct?: number;
  /** Grid: slide the band when price leaves it and no lot is held. */
  gridFollow?: boolean;
  /** Reinvest this % of a winning sell into the next order size. */
  compoundPct?: number;
  /** Grid: add round-trip taker fees on top of the sell %. Default true. */
  gridNetFees?: boolean;
  /** Grid: take the first lot at market when the bot arms. */
  gridSeed?: boolean;
  /** Grid: wait this many minutes after a lot stop before new buys. */
  gridSlCooldownMin?: number;
  /** Cap EUR deployed by this bot (0 = unlimited). */
  budgetQuote?: number;
  /** Multi-timeframe: extra intervals in minutes (primary = bot.interval). */
  mtfIntervals?: number[];
  /** majority = vote; higherAgree = primary action only if highest TF agrees. */
  mtfMode?: "majority" | "higherAgree";
  /** Enable scheduled parameter re-opt with walk-forward gate. */
  autoOpt?: boolean;
  /** Re-opt interval ms (default 7d). */
  autoOptEveryMs?: number;
  /** Minimum out-of-sample Sharpe to accept new params. Default 0. */
  autoOptMinOosSharpe?: number;
};

export type BotEvent = {
  t: number;
  text: string;
  side?: "buy" | "sell";
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
  log?: BotEvent[];
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
