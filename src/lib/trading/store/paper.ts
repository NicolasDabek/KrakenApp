import { toast } from "sonner";
import { EMPTY_STATS, flattenPaper, paperEquity, resetPaperAccount, snapshotEquity } from "../bots.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Compte papier des bots. */
export const createPaperActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "setPaperStart" | "setPaperFee" | "resetPaper" | "flattenPaperPositions"> => ({
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
});
