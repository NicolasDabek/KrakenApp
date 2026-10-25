import { toast } from "sonner";
import { EMPTY_STATS, kindTitle, parseBotBlueprints } from "../bots.ts";
import { uid } from "../format.ts";
import { PAIR_BY_ID, toEurPair } from "../pairs.ts";
import type { Bot } from "../types";
import { withLog } from "./helpers.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Cycle de vie des bots (création, démarrage, pause, édition, import). */
export const createBotActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "createBot" | "startBot" | "pauseBot" | "removeBot" | "updateBot" | "duplicateBot" | "cloneBotToPair" | "toggleBuyPause" | "seedGrid" | "importBots" | "setBotCandles"> => ({
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

    setBotCandles: (bag) => set({ botCandles: { ...get().botCandles, ...bag } }),
});
