import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PAPER } from "./bots.ts";
import {
  DEFAULT_BALANCES,
  eurUsdRate,
  eurValue,
  isLiveConnected,
  liveBalanceRows,
  tickerList,
  usdValue,
  useTradingStore,
} from "./store.ts";
import type { Bot, NewOrderInput, Ticker } from "./types.ts";

function ticker(id: string, last: number, extra: Partial<Ticker> = {}): Ticker {
  return {
    id,
    last,
    bid: last * 0.9995,
    ask: last * 1.0005,
    open: last,
    high: last * 1.02,
    low: last * 0.98,
    volume: 10,
    vwap: last,
    change: 0,
    changePct: 0,
    trades: 4,
    quoteVolume: last * 10,
    ...extra,
  };
}

function resetStore() {
  useTradingStore.setState({
    tickers: {},
    books: {},
    tapes: {},
    watchlist: ["XBTUSD", "ETHUSD", "SOLUSD", "XRPUSD", "ADAUSD"],
    lastPair: "XBTEUR",
    balances: DEFAULT_BALANCES.map((b) => ({ ...b })),
    orders: [],
    fills: [],
    positions: [],
    alerts: [],
    recurring: [],
    journal: [],
    settings: { confirmOrders: false, displayQuote: "USD", makerFee: 0.0016, takerFee: 0.0026 },
    connection: { baseUrl: "", apiKey: "", apiSecret: "" },
    lastTickAt: 0,
    live: false,
    error: null,
    bots: [],
    paper: {
      ...DEFAULT_PAPER,
      holdings: {},
      trades: [],
      equityCurve: [],
    },
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
  });
}

function seedTickers(list: Ticker[] = [ticker("XBTEUR", 90_000), ticker("XBTUSD", 97_200)]) {
  const tickers: Record<string, Ticker> = {};
  for (const t of list) tickers[t.id] = t;
  useTradingStore.setState({ tickers, live: true, error: null });
}

function bal(asset: string) {
  return useTradingStore.getState().balances.find((b) => b.asset === asset);
}

beforeEach(() => {
  resetStore();
});

describe("store helpers", () => {
  it("lists tickers, detects live keys and prices EUR/USD", () => {
    const xs = [ticker("XBTEUR", 90_000), ticker("XBTUSD", 99_000)];
    const map = Object.fromEntries(xs.map((t) => [t.id, t]));
    assert.equal(tickerList(map).length, 2);
    assert.equal(eurUsdRate(map), 99_000 / 90_000);
    assert.equal(eurUsdRate({}), 1.08);
    assert.equal(isLiveConnected({ baseUrl: "", apiKey: "", apiSecret: "" }), false);
    assert.equal(isLiveConnected({ baseUrl: "", apiKey: "k", apiSecret: "s" }), true);
    assert.equal(usdValue("USD", 10, map), 10);
    assert.ok(Math.abs(usdValue("EUR", 10, map) - 10 * (99_000 / 90_000)) < 1e-9);
    assert.equal(usdValue("BTC", 0.1, map), 9_900);
    assert.equal(eurValue("EUR", 5, map), 5);
    assert.ok(Math.abs(eurValue("USD", 99_000 / 90_000, map) - 1) < 1e-9);
    assert.equal(eurValue("BTC", 0.1, map), 9_000);
    const rows = liveBalanceRows({ EUR: 12, BTC: 0, SOL: 3 }, { SOL: 1 });
    assert.deepEqual(
      rows.map((r) => r.asset),
      ["EUR", "SOL"],
    );
    assert.equal(rows.find((r) => r.asset === "SOL")?.hold, 1);
  });
});

describe("watchlist / settings / journal", () => {
  it("toggles pairs, last pair, settings, journal and connection", () => {
    const s = useTradingStore.getState();
    s.setLastPair("ETHEUR");
    assert.equal(useTradingStore.getState().lastPair, "ETHEUR");
    s.toggleWatch("XBTEUR");
    assert.ok(useTradingStore.getState().watchlist.includes("XBTEUR"));
    s.toggleWatch("XBTEUR");
    assert.equal(useTradingStore.getState().watchlist.includes("XBTEUR"), false);
    s.setSettings({ displayQuote: "EUR", confirmOrders: true });
    assert.equal(useTradingStore.getState().settings.displayQuote, "EUR");
    s.setConnection({ apiKey: "abc", apiSecret: "secret-secret" });
    assert.equal(useTradingStore.getState().connection.apiKey, "abc");
    s.addJournal({ pair: "XBTEUR", text: "breakout", mood: "note" });
    assert.equal(useTradingStore.getState().journal.length, 1);
    s.removeJournal(useTradingStore.getState().journal[0]!.id);
    assert.equal(useTradingStore.getState().journal.length, 0);
    s.setLive(false, "down");
    assert.equal(useTradingStore.getState().live, false);
    assert.equal(useTradingStore.getState().error, "down");
    s.setBook("XBTEUR", { bids: [], asks: [], spread: 0, spreadPct: 0 });
    s.setTape("XBTEUR", [{ id: "1", price: 1, size: 1, side: "buy", time: 1 }]);
    assert.ok(useTradingStore.getState().books.XBTEUR);
    assert.equal(useTradingStore.getState().tapes.XBTEUR?.length, 1);
  });
});

describe("demo orders", () => {
  it("rejects missing ticker, unknown pair, dust and empty size", () => {
    const s = useTradingStore.getState();
    const missing = s.placeOrder({ pair: "XBTEUR", side: "buy", type: "market", amount: 0.01 });
    assert.equal(missing.ok, false);
    seedTickers();
    const dust = s.placeOrder({ pair: "XBTEUR", side: "buy", type: "market", amount: 0.00000001 });
    assert.equal(dust.ok, false);
    assert.match(dust.message, /Minimum/);
    const zero = s.placeOrder({ pair: "XBTEUR", side: "buy", type: "market", amount: 0 });
    assert.equal(zero.ok, false);
  });

  it("fills a market buy and a market sell, applying taker fees", () => {
    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_100, bid: 99_900 })]);
    const s = useTradingStore.getState();
    const eur0 = bal("EUR")!.available;
    const btc0 = bal("BTC")!.available;
    const buy = s.placeOrder({ pair: "XBTEUR", side: "buy", type: "market", amount: 0.01 }, { silent: true });
    assert.equal(buy.ok, true);
    assert.equal(buy.order?.status, "filled");
    assert.equal(buy.order?.avgPrice, 100_100);
    assert.ok(Math.abs(bal("BTC")!.available - (btc0 + 0.01)) < 1e-9);
    const spent = 0.01 * 100_100 * 1.0026;
    assert.ok(Math.abs(eur0 - bal("EUR")!.available - spent) < 1e-6);
    assert.equal(useTradingStore.getState().fills.length, 1);

    const sell = s.placeOrder({ pair: "XBTEUR", side: "sell", type: "market", amount: 0.01 }, { silent: true });
    assert.equal(sell.ok, true);
    assert.ok(Math.abs(bal("BTC")!.available - btc0) < 1e-9);
  });

  it("parks a limit buy on the book and refunds on cancel", () => {
    seedTickers([ticker("XBTEUR", 100_000)]);
    const s = useTradingStore.getState();
    const eur0 = bal("EUR")!.available;
    const res = s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "limit", amount: 0.01, price: 90_000 },
      { silent: true },
    );
    assert.equal(res.ok, true);
    assert.equal(res.order?.status, "open");
    assert.ok(bal("EUR")!.hold > 0);
    assert.ok(bal("EUR")!.available < eur0);
    s.cancelOrder(res.order!.id);
    const after = useTradingStore.getState().orders.find((o) => o.id === res.order!.id);
    assert.equal(after?.status, "cancelled");
    assert.equal(bal("EUR")!.hold, 0);
    assert.ok(Math.abs(bal("EUR")!.available - eur0) < 1e-6);
  });

  it("fills a resting limit when last crosses the price", () => {
    seedTickers([ticker("XBTEUR", 100_000)]);
    const s = useTradingStore.getState();
    const placed = s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "limit", amount: 0.01, price: 95_000 },
      { silent: true },
    );
    assert.equal(placed.order?.status, "open");
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 94_000) } });
    s.processTick();
    const filled = useTradingStore.getState().orders.find((o) => o.id === placed.order!.id);
    assert.equal(filled?.status, "filled");
    assert.ok(useTradingStore.getState().fills.length >= 1);
  });

  it("triggers a stop buy when last rallies through the stop", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const s = useTradingStore.getState();
    const placed = s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "stop", amount: 0.01, stopPrice: 95_000, price: 95_000 },
      { silent: true },
    );
    assert.equal(placed.order?.status, "open");
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 96_000) } });
    s.processTick();
    assert.equal(useTradingStore.getState().orders.find((o) => o.id === placed.order!.id)?.status, "filled");
  });

  it("opens a leveraged position then closes it for PnL", () => {
    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 })]);
    const s = useTradingStore.getState();
    const eur0 = bal("EUR")!.available;
    const res = s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "market", amount: 0.02, leverage: 2, tp: 110_000, sl: 90_000 },
      { silent: true },
    );
    assert.equal(res.ok, true);
    assert.equal(useTradingStore.getState().positions.length, 1);
    const pos = useTradingStore.getState().positions[0]!;
    assert.equal(pos.side, "long");
    assert.equal(pos.leverage, 2);
    assert.ok(pos.liqPrice < pos.entry);
    assert.ok(bal("EUR")!.hold > 0);
    assert.ok(bal("EUR")!.available < eur0);

    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 105_000) } });
    s.closePosition(pos.id);
    assert.equal(useTradingStore.getState().positions.length, 0);
    assert.ok(bal("EUR")!.available > eur0 - 1);
  });

  it("closes a long on take-profit during processTick", () => {
    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 })]);
    const s = useTradingStore.getState();
    s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "market", amount: 0.02, leverage: 3, tp: 103_000 },
      { silent: true },
    );
    assert.equal(useTradingStore.getState().positions.length, 1);
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 104_000) } });
    s.processTick();
    assert.equal(useTradingStore.getState().positions.length, 0);
  });

  it("refuses a buy the demo wallet cannot afford", () => {
    seedTickers();
    const res = useTradingStore.getState().placeOrder({
      pair: "XBTEUR",
      side: "buy",
      type: "market",
      amount: 50,
    });
    assert.equal(res.ok, false);
    assert.match(res.message, /insuffisant/);
  });

  it("resetDemo wipes orders, fills and positions but keeps settings", () => {
    seedTickers();
    const s = useTradingStore.getState();
    s.setSettings({ displayQuote: "EUR" });
    s.placeOrder({ pair: "XBTEUR", side: "buy", type: "market", amount: 0.01 }, { silent: true });
    s.resetDemo();
    assert.equal(useTradingStore.getState().orders.length, 0);
    assert.equal(useTradingStore.getState().fills.length, 0);
    assert.equal(useTradingStore.getState().settings.displayQuote, "EUR");
    assert.equal(bal("EUR")?.available, 8000);
  });
});

describe("alerts / convert / recurring", () => {
  it("fires an above-alert then rearms it", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const s = useTradingStore.getState();
    s.addAlert({ pair: "XBTEUR", price: 95_000, condition: "above", note: "break" });
    assert.equal(useTradingStore.getState().alerts.length, 1);
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 96_000) } });
    s.processTick();
    const hit = useTradingStore.getState().alerts[0]!;
    assert.ok(hit.triggeredAt);
    s.rearmAlert(hit.id);
    assert.equal(useTradingStore.getState().alerts[0]!.triggeredAt, undefined);
    s.removeAlert(hit.id);
    assert.equal(useTradingStore.getState().alerts.length, 0);
  });

  it("converts EUR to BTC at the live ticker minus taker fee", () => {
    seedTickers([ticker("XBTEUR", 90_000), ticker("XBTUSD", 97_200)]);
    const s = useTradingStore.getState();
    const eur0 = bal("EUR")!.available;
    const btc0 = bal("BTC")!.available;
    const bad = s.convert("EUR", "EUR", 10);
    assert.equal(bad.ok, false);
    const res = s.convert("EUR", "BTC", 900);
    assert.equal(res.ok, true);
    assert.ok(bal("EUR")!.available < eur0);
    assert.ok(bal("BTC")!.available > btc0);
  });

  it("executes a due recurring buy on the demo wallet", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const s = useTradingStore.getState();
    s.addRecurring({
      pair: "XBTEUR",
      amountQuote: 90,
      cadence: "daily",
      nextAt: Date.now() - 1_000,
      active: true,
    });
    const id = useTradingStore.getState().recurring[0]!.id;
    s.processTick();
    const plan = useTradingStore.getState().recurring.find((r) => r.id === id)!;
    assert.ok(plan.nextAt > Date.now() - 1_000);
    assert.ok(useTradingStore.getState().fills.some((f) => f.pair === "XBTEUR"));
    s.toggleRecurring(id);
    assert.equal(useTradingStore.getState().recurring[0]!.active, false);
    s.removeRecurring(id);
    assert.equal(useTradingStore.getState().recurring.length, 0);
  });
});

describe("paper bots", () => {
  function makeDca() {
    return useTradingStore.getState().createBot({
      kind: "dca",
      venue: "paper",
      pair: "XBTUSD",
      interval: 15,
      sizeQuote: 200,
      params: { intervalMs: 60_000 },
      name: "DCA test",
    });
  }

  it("maps USD pairs to EUR, starts idle, then runs a paper fill", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const bot = makeDca();
    assert.equal(bot.pair, "XBTEUR");
    assert.equal(bot.status, "idle");
    assert.equal(bot.name, "DCA test");
    const cash0 = useTradingStore.getState().paper.cash;
    const started = useTradingStore.getState().startBot(bot.id);
    assert.equal(started.ok, true);
    assert.equal(useTradingStore.getState().bots[0]!.status, "running");
    const after = useTradingStore.getState();
    assert.ok(after.paper.cash < cash0);
    assert.ok((after.paper.holdings.BTC?.qty ?? 0) > 0);
    assert.ok(after.bots[0]!.stats.trades >= 1);
    assert.ok((after.bots[0]!.log?.length ?? 0) >= 1);
  });

  it("refuses a live start without keys and pauses a running bot", () => {
    seedTickers();
    const live = useTradingStore.getState().createBot({
      kind: "dca",
      venue: "live",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: { intervalMs: 60_000 },
    });
    const res = useTradingStore.getState().startBot(live.id);
    assert.equal(res.ok, false);
    assert.match(res.message, /clés/i);

    const paper = makeDca();
    useTradingStore.getState().startBot(paper.id);
    useTradingStore.getState().pauseBot(paper.id);
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === paper.id)?.status, "paused");
    useTradingStore.getState().updateBot(paper.id, { name: "renamed", sizeQuote: 80 });
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === paper.id)?.name, "renamed");
    const copy = useTradingStore.getState().duplicateBot(paper.id);
    assert.ok(copy);
    assert.equal(copy!.status, "idle");
    assert.match(copy!.name, /copie/);
    useTradingStore.getState().removeBot(copy!.id);
    assert.equal(useTradingStore.getState().bots.some((b) => b.id === copy!.id), false);
  });

  it("blocks paper-balance edits while a paper bot is running", () => {
    seedTickers();
    const bot = makeDca();
    useTradingStore.getState().startBot(bot.id);
    const blocked = useTradingStore.getState().setPaperStart(5_000);
    assert.equal(blocked.ok, false);
    useTradingStore.getState().pauseAllBots("paper");
    const ok = useTradingStore.getState().setPaperStart(5_000);
    assert.equal(ok.ok, true);
    assert.equal(useTradingStore.getState().paper.startingBalance, 5_000);
    useTradingStore.getState().setPaperFee(0.01);
    assert.equal(useTradingStore.getState().paper.feeRate, 0.01);
    useTradingStore.getState().resetPaper();
    assert.equal(useTradingStore.getState().paper.cash, 5_000);
  });

  it("flattens an open paper position on a bot", () => {
    seedTickers([ticker("XBTEUR", 90_000, { bid: 89_900 })]);
    const bot = makeDca();
    useTradingStore.setState({
      paper: {
        ...DEFAULT_PAPER,
        cash: 1_000,
        holdings: { BTC: { qty: 0.02, avg: 80_000 } },
        trades: [],
        equityCurve: [],
      },
      bots: [
        {
          ...bot,
          runtime: { inPosition: true, positionQty: 0.02, positionAvg: 80_000 },
        } as Bot,
      ],
    });
    useTradingStore.getState().flattenBot(bot.id);
    const after = useTradingStore.getState().bots.find((b) => b.id === bot.id)!;
    assert.equal(after.runtime.inPosition, false);
    assert.equal(after.runtime.positionQty, 0);
    assert.ok(useTradingStore.getState().paper.holdings.BTC == null);
    assert.ok(after.stats.closes >= 1);
  });

  it("live order/cancel/convert/sync refuse missing keys", async () => {
    const s = useTradingStore.getState();
    const input: NewOrderInput = { pair: "XBTEUR", side: "buy", type: "market", amount: 0.01 };
    assert.equal((await s.placeLiveOrder(input)).ok, false);
    assert.equal((await s.cancelLiveOrder("x")).ok, false);
    assert.equal((await s.convertLive("EUR", "BTC", 10)).ok, false);
    assert.equal((await s.syncKraken("light")).ok, false);
    assert.match(useTradingStore.getState().krakenError ?? "", /manquantes/);
    assert.equal(s.startBot("missing").ok, false);
    assert.equal(s.duplicateBot("missing"), null);
  });
});

describe("demo extras — shorts, stops, hydrate, convert errors", () => {
  it("hydrates tickers, fills a limit sell and refunds a cancelled sell", () => {
    const s = useTradingStore.getState();
    s.hydrateTickers([ticker("XBTEUR", 90_000)]);
    assert.equal(useTradingStore.getState().live, true);
    assert.ok(useTradingStore.getState().tickers.XBTEUR);

    const btc0 = bal("BTC")!.available;
    const sell = s.placeOrder(
      { pair: "XBTEUR", side: "sell", type: "limit", amount: 0.01, price: 100_000 },
      { silent: true },
    );
    assert.equal(sell.ok, true);
    assert.equal(sell.order?.status, "open");
    assert.ok(bal("BTC")!.hold > 0);
    assert.ok(bal("BTC")!.available < btc0);

    s.cancelOrder(sell.order!.id);
    assert.equal(bal("BTC")!.hold, 0);
    assert.ok(Math.abs(bal("BTC")!.available - btc0) < 1e-9);

    const liveSell = s.placeOrder(
      { pair: "XBTEUR", side: "sell", type: "limit", amount: 0.01, price: 80_000 },
      { silent: true },
    );
    assert.equal(liveSell.order?.status, "filled");
  });

  it("fills a stop-limit buy, liquidates a leveraged long and trails a position", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const s = useTradingStore.getState();
    const sl = s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "stop-limit", amount: 0.01, stopPrice: 95_000, price: 96_000 },
      { silent: true },
    );
    assert.equal(sl.order?.status, "open");
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 95_500) } });
    s.processTick();
    assert.equal(useTradingStore.getState().orders.find((o) => o.id === sl.order!.id)?.status, "filled");

    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 })]);
    s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "market", amount: 0.02, leverage: 10 },
      { silent: true },
    );
    assert.equal(useTradingStore.getState().positions.length, 1);
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 80_000) } });
    s.processTick();
    assert.equal(useTradingStore.getState().positions.length, 0);

    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 })]);
    s.placeOrder(
      { pair: "XBTEUR", side: "buy", type: "market", amount: 0.02, leverage: 3, trailingPct: 2 },
      { silent: true },
    );
    const pos = useTradingStore.getState().positions[0]!;
    useTradingStore.setState({
      positions: [{ ...pos, peak: 110_000 }],
      tickers: { XBTEUR: ticker("XBTEUR", 107_000) },
    });
    s.processTick();
    assert.equal(useTradingStore.getState().positions.length, 0);
  });

  it("opens a short, fires a below-alert and rejects bad conversions", () => {
    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 }), ticker("XBTUSD", 108_000)]);
    const s = useTradingStore.getState();
    const short = s.placeOrder(
      { pair: "XBTEUR", side: "sell", type: "market", amount: 0.02, leverage: 2 },
      { silent: true },
    );
    assert.equal(short.ok, true);
    assert.equal(useTradingStore.getState().positions[0]?.side, "short");
    s.closePosition(useTradingStore.getState().positions[0]!.id);
    assert.equal(useTradingStore.getState().positions.length, 0);

    s.addAlert({ pair: "XBTEUR", price: 90_000, condition: "below", note: "dump" });
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 89_000), XBTUSD: ticker("XBTUSD", 96_000) } });
    s.processTick();
    assert.ok(useTradingStore.getState().alerts[0]?.triggeredAt);

    assert.equal(s.convert("EUR", "FOO", 10).ok, false);
    assert.equal(s.convert("EUR", "BTC", 9_999_999).ok, false);
    assert.equal(s.convert("EUR", "BTC", 0).ok, false);
  });

  it("pauses a paper bot on a daily-loss stop and clamps paper fees", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const bot = useTradingStore.getState().createBot({
      kind: "dca",
      venue: "paper",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: { intervalMs: 1, maxDailyLoss: 10 },
    });
    useTradingStore.setState({
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === bot.id
          ? { ...b, runtime: { dayStamp: new Date().toISOString().slice(0, 10), dayPnl: -40 } }
          : b,
      ),
    });
    useTradingStore.getState().startBot(bot.id);
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === bot.id)?.status, "paused");

    useTradingStore.getState().pauseAllBots();
    useTradingStore.getState().setPaperFee(9);
    assert.equal(useTradingStore.getState().paper.feeRate, 0.05);
    useTradingStore.getState().setPaperFee(-1);
    assert.equal(useTradingStore.getState().paper.feeRate, 0);
    assert.equal(useTradingStore.getState().setPaperStart(0).ok, false);

    useTradingStore.setState({
      paper: {
        ...DEFAULT_PAPER,
        cash: 100,
        holdings: { BTC: { qty: 0.01, avg: 80_000 } },
        trades: [],
        equityCurve: [],
      },
    });
    useTradingStore.getState().flattenPaperPositions();
    assert.ok(useTradingStore.getState().paper.holdings.BTC == null);

    const running = useTradingStore.getState().createBot({
      kind: "dca",
      venue: "paper",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: { intervalMs: 60_000 },
    });
    useTradingStore.getState().startBot(running.id);
    useTradingStore.getState().updateBot(running.id, { name: "should-not" });
    assert.notEqual(useTradingStore.getState().bots.find((b) => b.id === running.id)?.name, "should-not");
  });

  it("refuses a live flatten without a position and a dispatch without keys", async () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const bot = useTradingStore.getState().createBot({
      kind: "dca",
      venue: "live",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: {},
    });
    useTradingStore.getState().flattenBot(bot.id);
    await useTradingStore.getState().dispatchKrakenFill({
      botId: bot.id,
      pair: "XBTEUR",
      side: "buy",
      qty: 0.01,
      price: 90_000,
      note: "test",
      prevRuntime: {},
      intendedRuntime: {},
    });
    const after = useTradingStore.getState().bots.find((b) => b.id === bot.id)!;
    assert.equal(after.status, "paused");
    assert.match(after.lastNote ?? "", /clés|manquantes/i);
  });

  it("flattens grid lots without positionQty and pauses live on stale feed or in-flight timeout", () => {
    seedTickers([ticker("XBTEUR", 90_000, { bid: 89_900 })]);
    const grid = useTradingStore.getState().createBot({
      kind: "grid",
      venue: "paper",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 80,
      params: { lower: 80_000, upper: 100_000, levels: 4, gridSellPct: 1.5, gridBuyPct: 1 },
    });
    useTradingStore.setState({
      paper: {
        ...DEFAULT_PAPER,
        cash: 1_000,
        holdings: { BTC: { qty: 0.01, avg: 88_000 } },
        trades: [],
        equityCurve: [],
      },
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === grid.id
          ? {
              ...b,
              runtime: { gridOwned: [{ price: 88_000, qty: 0.01, entry: 88_000 }] },
            }
          : b,
      ),
    });
    useTradingStore.getState().flattenBot(grid.id);
    const flat = useTradingStore.getState().bots.find((b) => b.id === grid.id)!;
    assert.equal(flat.runtime.positionQty ?? 0, 0);
    assert.equal((flat.runtime.gridOwned ?? []).length, 0);

    useTradingStore.setState({
      lastTickAt: Date.now(),
      tickers: {
        ...useTradingStore.getState().tickers,
        XBTEUR: {
          id: "XBTEUR",
          last: 90_000,
          bid: 89_950,
          ask: 90_050,
          open: 90_000,
          high: 90_000,
          low: 90_000,
          volume: 1,
          vwap: 90_000,
          change: 0,
          changePct: 0,
          trades: 0,
          quoteVolume: 0,
        },
      },
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === grid.id
          ? { ...b, status: "running" as const, runtime: {}, params: { ...b.params, lower: 80_000, upper: 100_000 } }
          : b,
      ),
    });
    const seeded = useTradingStore.getState().seedGrid(grid.id);
    assert.equal(seeded.ok, true);
    const afterSeed = useTradingStore.getState().bots.find((b) => b.id === grid.id)!;
    assert.equal(afterSeed.runtime.gridSeedNow, false);
    assert.ok(
      (afterSeed.runtime.gridOwned ?? []).some((g) => g.qty > 0) || afterSeed.lastNote.includes("lot"),
    );

    const live = useTradingStore.getState().createBot({
      kind: "dca",
      venue: "live",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: { intervalMs: 60_000 },
    });
    useTradingStore.setState({
      lastTickAt: Date.now() - 50_000,
      settings: { ...useTradingStore.getState().settings, watchdog: true },
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === live.id ? { ...b, status: "running" as const } : b,
      ),
    });
    useTradingStore.getState().runBots();
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === live.id)?.status, "paused");

    useTradingStore.setState({
      lastTickAt: Date.now(),
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === live.id
          ? {
              ...b,
              status: "running",
              runtime: { inFlight: true, inFlightAt: Date.now() - 120_000 },
            }
          : b,
      ),
    });
    useTradingStore.getState().runBots();
    const timed = useTradingStore.getState().bots.find((b) => b.id === live.id)!;
    assert.equal(timed.status, "paused");
    assert.equal(timed.runtime.inFlight, false);
    assert.match(timed.lastNote, /timeout/i);

    const gridLive = useTradingStore.getState().createBot({
      kind: "grid",
      venue: "live",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: { lower: 80_000, upper: 100_000 },
    });
    useTradingStore.setState({
      lastTickAt: Date.now(),
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === gridLive.id
          ? {
              ...b,
              status: "running" as const,
              runtime: {
                inFlight: true,
                inFlightAt: Date.now() - 120_000,
                inPosition: true,
                positionQty: 0.01,
                gridOwned: [{ price: 90_000, qty: 0.01, entry: 90_000 }],
                flightPrev: {
                  lastPrice: 90_000,
                  gridOwned: [{ price: 89_000, qty: 0, entry: 0, pending: true, anchor: true }],
                },
              },
            }
          : b,
      ),
    });
    useTradingStore.getState().runBots();
    const restored = useTradingStore.getState().bots.find((b) => b.id === gridLive.id)!;
    assert.equal(restored.status, "paused");
    assert.equal(restored.runtime.inFlight, false);
    assert.equal(restored.runtime.flightPrev, undefined);
    assert.equal(restored.runtime.positionQty ?? 0, 0);
    assert.equal(restored.runtime.gridOwned?.[0]?.pending, true);
    useTradingStore.setState({
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === gridLive.id ? { ...b, status: "running" as const, runtime: { ...b.runtime, inFlight: true, inFlightAt: Date.now() } } : b,
      ),
    });
    const blocked = useTradingStore.getState().startBot(gridLive.id);
    assert.equal(blocked.ok, false);

    useTradingStore.setState({
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === live.id ? { ...b, status: "running" as const, runtime: { positionQty: 0 } } : b,
      ),
    });
    useTradingStore.getState().panicLive();
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === live.id)?.status, "paused");
  });
});

describe("store extras — books, duplicate, pause venue, stops", () => {
  it("duplicates a bot, pauses only paper and removes it", () => {
    seedTickers();
    const s = useTradingStore.getState();
    const paper = s.createBot({
      kind: "dca",
      venue: "paper",
      pair: "XBTUSD",
      interval: 15,
      sizeQuote: 40,
      params: { intervalMs: 60_000 },
      name: "alpha",
    });
    assert.equal(useTradingStore.getState().bots[0]?.pair, "XBTEUR");
    const copy = s.duplicateBot(paper.id);
    assert.ok(copy);
    assert.notEqual(copy!.id, paper.id);
    assert.match(copy!.name, /copie/);
    assert.equal(copy!.status, "idle");
    assert.equal(s.duplicateBot("missing"), null);

    s.startBot(paper.id);
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === paper.id)?.status, "running");
    const live = s.createBot({
      kind: "grid",
      venue: "live",
      pair: "ETHEUR",
      interval: 15,
      sizeQuote: 80,
      params: {},
    });
    useTradingStore.setState({
      bots: useTradingStore.getState().bots.map((b) => (b.id === live.id ? { ...b, status: "running" } : b)),
    });
    s.pauseAllBots("paper");
    const after = useTradingStore.getState().bots;
    assert.equal(after.find((b) => b.id === paper.id)?.status, "paused");
    assert.equal(after.find((b) => b.id === live.id)?.status, "running");
    s.pauseBot(live.id);
    s.removeBot(live.id);
    assert.equal(useTradingStore.getState().bots.some((b) => b.id === live.id), false);

    s.setBotCandles({ "XBTEUR:15": [{ time: 1, open: 1, high: 1, low: 1, close: 1, volume: 1 }] });
    assert.equal(useTradingStore.getState().botCandles["XBTEUR:15"]?.length, 1);
    s.resetPaper();
    assert.equal(useTradingStore.getState().paper.cash, useTradingStore.getState().paper.startingBalance);
    s.updateBot(paper.id, { name: "renamed", sizeQuote: 75 });
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === paper.id)?.name, "renamed");
    const imported = s.importBots({
      v: 1,
      bots: [{ kind: "grid", venue: "paper", pair: "ETHEUR", interval: 60, sizeQuote: 50, params: { gridSellPct: 2 }, name: "importé" }],
    });
    assert.equal(imported.ok, true);
    assert.equal(imported.count, 1);
    assert.ok(useTradingStore.getState().bots.some((b) => b.name === "importé"));
    const grid = useTradingStore.getState().bots.find((b) => b.name === "importé")!;
    s.toggleBuyPause(grid.id);
    assert.equal(useTradingStore.getState().bots.find((b) => b.id === grid.id)?.runtime.buyPause, true);

    seedTickers([ticker("XBTEUR", 100_000), ticker("ETHEUR", 3_000)]);
    const src = s.createBot({
      kind: "grid",
      venue: "paper",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 80,
      params: { lower: 90_000, upper: 110_000, gridSellPct: 1.5, gridBuyPct: 1, levels: 6 },
      name: "grille btc",
    });
    const cloned = s.cloneBotToPair(src.id, "ETHEUR");
    assert.ok(cloned);
    assert.equal(cloned!.pair, "ETHEUR");
    assert.ok((cloned!.params.lower ?? 0) < 4_000);
    assert.ok((cloned!.params.upper ?? 0) > (cloned!.params.lower ?? 0));
    assert.match(cloned!.name, /ETH/i);
    assert.equal(s.cloneBotToPair("missing", "ETHEUR"), null);

    useTradingStore.setState({ deskPeakPaper: 12_500 });
    s.resetPaper();
    assert.equal(useTradingStore.getState().deskPeakPaper, useTradingStore.getState().paper.startingBalance);
  });

  it("triggers a stop sell, a short stop-loss and a weekly recurring buy", () => {
    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 })]);
    const s = useTradingStore.getState();
    const stop = s.placeOrder(
      { pair: "XBTEUR", side: "sell", type: "stop", amount: 0.01, stopPrice: 95_000 },
      { silent: true },
    );
    assert.equal(stop.order?.status, "open");
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 94_000) } });
    s.processTick();
    assert.equal(useTradingStore.getState().orders.find((o) => o.id === stop.order!.id)?.status, "filled");

    seedTickers([ticker("XBTEUR", 100_000, { ask: 100_000, bid: 100_000 })]);
    s.placeOrder(
      { pair: "XBTEUR", side: "sell", type: "market", amount: 0.02, leverage: 2, sl: 110_000 },
      { silent: true },
    );
    assert.equal(useTradingStore.getState().positions[0]?.side, "short");
    useTradingStore.setState({ tickers: { XBTEUR: ticker("XBTEUR", 111_000) } });
    s.processTick();
    assert.equal(useTradingStore.getState().positions.length, 0);

    seedTickers([ticker("XBTEUR", 90_000)]);
    const eur0 = bal("EUR")!.available;
    s.addRecurring({ pair: "XBTEUR", amountQuote: 100, cadence: "weekly", nextAt: Date.now() - 1, active: true });
    const recId = useTradingStore.getState().recurring[0]!.id;
    s.processTick();
    assert.ok(bal("EUR")!.available < eur0);
    s.toggleRecurring(recId);
    assert.equal(useTradingStore.getState().recurring[0]?.active, false);
    s.removeRecurring(recId);
    assert.equal(useTradingStore.getState().recurring.length, 0);

    s.addAlert({ pair: "XBTEUR", price: 1, condition: "above", note: "x" });
    s.removeAlert(useTradingStore.getState().alerts[0]!.id);
    assert.equal(useTradingStore.getState().alerts.length, 0);
    s.cancelOrder("missing");
    s.closePosition("missing");
    assert.equal(usdValue("FOO", 1, useTradingStore.getState().tickers), 0);
    assert.equal(eurValue("FOO", 1, useTradingStore.getState().tickers), 0);
  });

  it("refuses a live start without Kraken keys", () => {
    const s = useTradingStore.getState();
    const bot = s.createBot({
      kind: "dca",
      venue: "live",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: {},
    });
    const res = s.startBot(bot.id);
    assert.equal(res.ok, false);
    assert.match(res.message, /clés/i);
  });
});

describe("desk circuit breaker", () => {
  it("pauses paper bots when the daily loss limit is hit", () => {
    seedTickers([ticker("XBTEUR", 90_000)]);
    const s = useTradingStore.getState();
    const bot = s.createBot({
      kind: "dca",
      venue: "paper",
      pair: "XBTEUR",
      interval: 15,
      sizeQuote: 50,
      params: { intervalMs: 60_000 },
    });
    useTradingStore.setState({
      settings: { ...useTradingStore.getState().settings, deskDailyLoss: 40 },
      bots: useTradingStore.getState().bots.map((b) =>
        b.id === bot.id
          ? {
              ...b,
              status: "running" as const,
              runtime: { dayPnl: -80, dayStamp: new Date().toISOString().slice(0, 10) },
            }
          : b,
      ),
    });
    useTradingStore.getState().runBots();
    const after = useTradingStore.getState().bots.find((b) => b.id === bot.id)!;
    assert.equal(after.status, "paused");
    assert.match(after.lastNote, /bureau|jour/i);
  });
});

