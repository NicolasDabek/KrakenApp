import { toast } from "sonner";
import { krakenConvert } from "../functions.ts";
import { PAIR_BY_ID } from "../pairs.ts";
import { cloneBalances, getBal } from "./helpers.ts";
import type { StoreGet, StoreSet, TradingState } from "./state.ts";

/** Conversions papier et réelles. */
export const createConvertActions = (set: StoreSet, get: StoreGet): Pick<TradingState, "convert" | "convertLive"> => ({
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
});
