import { toast } from "sonner";
import { allocateByPerformance, applyPaperFill, botAllocScore, botMark, dropFormingCandle, evaluateBot, evaluateDesk, gatedOptimizeBot, kindNeedsCandles, mtfIntervalsOf, paperEquity, snapshotEquity } from "../bots.ts";
import { PAIR_BY_ID, toEurPair } from "../pairs.ts";
import type { Bot, BotRuntime } from "../types";
import { FEED_DEAD_MS, FEED_STALE_MS } from "./defaults.ts";
import { clonePaper, eurValue, pingFill, withLog } from "./helpers.ts";
import { INFLIGHT_TIMEOUT_MS, restoreFlight, snapshotRuntime } from "./positions.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

let lastAllocAt = 0;

/** Moteur des bots : allocation, auto-optimisation et boucle runBots. */
export const createEngineActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "rebalanceAllocations" | "runGatedAutoOpt" | "runBots"> => ({
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
        const multiCandles: Record<number, import("../types").Candle[]> | undefined =
          bot.kind === "mtf"
            ? Object.fromEntries(
                mtfIntervalsOf(bot)
                  .map((tf) => {
                    const raw =
                      get().botCandles[`${pair}:${tf}`] ?? get().botCandles[`${bot.pair}:${tf}`];
                    const closed = dropFormingCandle(raw, tf, now);
                    return closed && closed.length ? ([tf, closed] as const) : null;
                  })
                  .filter((x): x is readonly [number, import("../types").Candle[]] => x != null),
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
});
