import { PAIR_BY_ID } from "../pairs.ts";
import type { FiscalMove, FiscalOptions, FiscalSource, LedgerLeg } from "./types.ts";
import { isFiatAsset, normalizeFiscalAsset } from "./assets.ts";
import { pushWarn } from "./common.ts";

export function movesFromLedgers(legs: LedgerLeg[], opts: FiscalOptions = {}): { moves: FiscalMove[]; warnings: string[] } {
  const warnings: string[] = [];
  const groups = new Map<string, LedgerLeg[]>();
  for (const leg of legs) {
    const asset = normalizeFiscalAsset(leg.asset);
    if (!asset || !Number.isFinite(leg.amount)) continue;
    const key = `${leg.type}|${leg.refid || leg.id}`;
    const bucket = groups.get(key) ?? [];
    bucket.push({ ...leg, asset, type: leg.type.toLowerCase() });
    groups.set(key, bucket);
  }

  const moves: FiscalMove[] = [];
  for (const [, bucket] of groups) {
    const type = bucket[0]!.type;
    const time = Math.min(...bucket.map((l) => l.time));
    const id = bucket[0]!.refid || bucket[0]!.id;

    if (type === "margin" || type === "rollover" || type === "settled") {
      pushWarn(warnings, "Activité sur marge ou dérivés ignorée (hors cessions spot de l’art. 150 VH bis).");
      continue;
    }

    if (type === "deposit" || type === "withdrawal" || type === "transfer") {
      for (const leg of bucket) {
        const qty = Math.abs(leg.amount);
        if (!(qty > 0)) continue;
        if (isFiatAsset(leg.asset)) {
          moves.push({
            id: leg.id,
            time: leg.time,
            kind: "fiat",
            asset: leg.asset,
            qty,
            source: "kraken",
            note: type,
          });
          continue;
        }
        const inbound = type === "deposit" || (type === "transfer" && leg.amount > 0);
        const outbound = type === "withdrawal" || (type === "transfer" && leg.amount < 0);
        if (type === "transfer" && !inbound && !outbound) continue;
        moves.push({
          id: leg.id,
          time: leg.time,
          kind: inbound ? "deposit" : "withdraw",
          asset: leg.asset,
          qty,
          source: "kraken",
          note: type === "transfer" ? "Transfert interne Kraken" : type === "deposit" ? "Dépôt" : "Retrait",
        });
      }
      continue;
    }

    if (type === "staking" || type === "earn" || type === "reward" || type === "dividend" || type === "credit") {
      for (const leg of bucket) {
        if (isFiatAsset(leg.asset) || !(leg.amount > 0)) continue;
        moves.push({
          id: leg.id,
          time: leg.time,
          kind: "income",
          asset: leg.asset,
          qty: leg.amount,
          source: "kraken",
          note: type,
        });
      }
      continue;
    }

    if (type !== "trade" && type !== "spend" && type !== "receive" && type !== "sale") {
      pushWarn(warnings, `Mouvement Kraken « ${type} » non classé — à vérifier.`);
      continue;
    }

    const out = new Map<string, { qty: number; fee: number }>();
    const inn = new Map<string, { qty: number; fee: number }>();
    for (const leg of bucket) {
      const bag = leg.amount < 0 ? out : inn;
      const cur = bag.get(leg.asset) ?? { qty: 0, fee: 0 };
      cur.qty += Math.abs(leg.amount);
      cur.fee += Math.abs(leg.fee);
      bag.set(leg.asset, cur);
    }
    const outs = [...out.entries()];
    const ins = [...inn.entries()];
    if (!outs.length || !ins.length) {
      pushWarn(warnings, "Trade Kraken incomplet (une seule jambe) — ignoré.");
      continue;
    }

    const fiatOut = outs.find(([a]) => isFiatAsset(a));
    const fiatIn = ins.find(([a]) => isFiatAsset(a));
    const cryptoOut = outs.find(([a]) => !isFiatAsset(a));
    const cryptoIn = ins.find(([a]) => !isFiatAsset(a));

    if (fiatOut && cryptoIn && fiatOut[0] === "EUR") {
      const feeCrypto = cryptoIn[1].fee;
      const qty = Math.max(0, cryptoIn[1].qty - feeCrypto);
      const feeEur = fiatOut[1].fee + (feeCrypto > 0 && cryptoIn[1].qty > 0 ? (fiatOut[1].qty / cryptoIn[1].qty) * feeCrypto : 0);
      moves.push({
        id,
        time,
        kind: "buy",
        asset: cryptoIn[0],
        qty,
        quote: "EUR",
        quoteQty: fiatOut[1].qty,
        feeEur,
        source: "kraken",
        note: "Achat",
      });
      continue;
    }

    if (fiatIn && cryptoOut && (fiatIn[0] === "EUR" || fiatIn[0] === "USD")) {
      const feeCrypto = cryptoOut[1].fee;
      const qty = cryptoOut[1].qty + feeCrypto;
      const gross = fiatIn[1].qty;
      const fx = fiatIn[0] === "EUR" ? 1 : opts.eurPerUsd;
      if (!(fx && fx > 0)) {
        pushWarn(warnings, "Cession en USD sans taux EUR — ignorée. Recharge avec le marché ouvert.");
        continue;
      }
      const unit = gross / Math.max(cryptoOut[1].qty, 1e-12);
      const feeEur = fiatIn[1].fee * fx + feeCrypto * unit * fx;
      moves.push({
        id,
        time,
        kind: "sell",
        asset: cryptoOut[0],
        qty,
        quote: "EUR",
        quoteQty: gross * fx,
        feeEur,
        source: "kraken",
        note: fiatIn[0] === "USD" ? "Vente USD convertie" : "Vente",
      });
      continue;
    }

    if (cryptoOut && cryptoIn && cryptoOut[0] === cryptoIn[0]) {
      const left = cryptoOut[1].qty + cryptoOut[1].fee;
      const back = Math.max(0, cryptoIn[1].qty - cryptoIn[1].fee);
      const burned = left - back;
      if (burned > 1e-10) {
        moves.push({
          id,
          time,
          kind: "fee",
          asset: cryptoOut[0],
          qty: burned,
          source: "kraken",
          note: "Frais de conversion interne",
        });
      }
      continue;
    }

    if (cryptoOut && cryptoIn) {
      moves.push({
        id,
        time,
        kind: "swap",
        asset: cryptoOut[0],
        qty: cryptoOut[1].qty + cryptoOut[1].fee,
        quote: cryptoIn[0],
        quoteQty: Math.max(0, cryptoIn[1].qty - cryptoIn[1].fee),
        source: "kraken",
        note: "Échange crypto",
      });
      continue;
    }

    pushWarn(warnings, "Trade avec une monnaie autre que EUR/USD — non converti.");
  }

  moves.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  return { moves, warnings };
}

export type FillLike = {
  id: string;
  pair: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  fee: number;
  time: number;
};

export function movesFromFills(
  fills: FillLike[],
  source: FiscalSource,
  opts: FiscalOptions = {},
): { moves: FiscalMove[]; warnings: string[] } {
  const warnings: string[] = [];
  const moves: FiscalMove[] = [];
  for (const fill of fills) {
    const meta = PAIR_BY_ID[fill.pair];
    if (!meta || !(fill.amount > 0) || !(fill.price > 0)) {
      pushWarn(warnings, "Ordre sans paire reconnue — ignoré.");
      continue;
    }
    const quote = meta.quote;
    const notion = fill.amount * fill.price;
    if (quote === "EUR" || (quote === "USD" && opts.eurPerUsd && opts.eurPerUsd > 0)) {
      const fx = quote === "EUR" ? 1 : opts.eurPerUsd!;
      if (quote === "USD") pushWarn(warnings, "Cessions ou achats en USD convertis avec le taux EUR du moment — à recouper.");
      moves.push({
        id: fill.id,
        time: fill.time,
        kind: fill.side === "buy" ? "buy" : "sell",
        asset: normalizeFiscalAsset(meta.base),
        qty: fill.amount,
        quote: "EUR",
        quoteQty: notion * fx,
        feeEur: (fill.fee || 0) * fx,
        source,
        note: fill.side === "buy" ? "Achat" : "Vente",
      });
      continue;
    }
    if (!isFiatAsset(quote)) {
      moves.push({
        id: fill.id,
        time: fill.time,
        kind: "swap",
        asset: fill.side === "sell" ? normalizeFiscalAsset(meta.base) : normalizeFiscalAsset(quote),
        qty: fill.side === "sell" ? fill.amount : notion,
        quote: fill.side === "sell" ? normalizeFiscalAsset(quote) : normalizeFiscalAsset(meta.base),
        quoteQty: fill.side === "sell" ? notion : fill.amount,
        source,
        note: "Échange crypto",
      });
      continue;
    }
    pushWarn(warnings, `Paire ${meta.display} hors EUR/USD — non reprise.`);
  }
  moves.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  return { moves, warnings };
}
