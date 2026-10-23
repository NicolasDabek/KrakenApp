import type { CessionRow, FiscalDeclaration, FiscalMove, FiscalOptions, FiscalPeriod, FiscalReport, HoldingSnap, IncomeRow, JournalRow, PricePoint, YearCessions, YearSheet } from "./types.ts";
import { CESSION_EXEMPT_EUR, pfuForYear, taxOn } from "./rules.ts";
import { cents, pushWarn } from "./common.ts";
import { parisYear } from "./dates.ts";

function portfolioValue(holdings: Map<string, number>, px: Map<string, number>): { value: number; missing: string[] } {
  let value = 0;
  const missing: string[] = [];
  for (const [asset, qty] of holdings) {
    if (!(qty > 1e-12)) continue;
    const price = px.get(asset);
    if (!(price && price > 0)) {
      missing.push(asset);
      continue;
    }
    value += qty * price;
  }
  return { value, missing };
}

function indexPrices(history: Record<string, PricePoint[]> | undefined): Map<string, PricePoint[]> {
  const map = new Map<string, PricePoint[]>();
  if (!history) return map;
  for (const [asset, rows] of Object.entries(history)) {
    const clean = rows
      .filter((row) => row && row.eur > 0 && Number.isFinite(row.time))
      .sort((a, b) => a.time - b.time);
    if (clean.length) map.set(asset, clean);
  }
  return map;
}

function priceAt(series: PricePoint[] | undefined, time: number): number | undefined {
  if (!series?.length) return undefined;
  let lo = 0;
  let hi = series.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (series[mid]!.time <= time) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans >= 0 ? series[ans]!.eur : undefined;
}

function marketPrice(opts: FiscalOptions, history: Map<string, PricePoint[]>, asset: string, time: number): number | undefined {
  const manual = opts.prices?.manual?.[asset];
  if (manual && manual > 0) return manual;
  return priceAt(history.get(asset), time);
}

function buildYearSheets(rows: CessionRow[]): YearSheet[] {
  const by = new Map<number, { net: number; gain: number }>();
  for (const row of rows) {
    const year = parisYear(row.time);
    const cur = by.get(year) ?? { net: 0, gain: 0 };
    cur.net += row.netEur;
    cur.gain += row.gainEur;
    by.set(year, cur);
  }
  const years = [...by.keys()].sort((a, b) => a - b);
  if (!years.length) return [];
  const lots: { year: number; left: number }[] = [];
  const sheets: YearSheet[] = [];
  for (let year = years[0]!; year <= years[years.length - 1]!; year++) {
    for (const lot of lots) {
      if (year - lot.year > 10) lot.left = 0;
    }
    const cur = by.get(year);
    if (!cur) continue;
    const cessionsNet = cents(cur.net);
    const gain = cents(cur.gain);
    const exempt = cessionsNet <= CESSION_EXEMPT_EUR;
    let imputed = 0;
    let taxable = 0;
    let lossCreated = 0;
    if (!exempt && gain > 0) {
      let left = gain;
      for (const lot of lots) {
        if (!(lot.left > 0) || year - lot.year > 10 || year <= lot.year) continue;
        const take = Math.min(lot.left, left);
        lot.left = cents(lot.left - take);
        left = cents(left - take);
        imputed = cents(imputed + take);
        if (!(left > 0)) break;
      }
      taxable = left;
    } else if (!exempt && gain < 0) {
      lossCreated = cents(-gain);
      lots.push({ year, left: lossCreated });
    }
    const rates = pfuForYear(year);
    sheets.push({
      year,
      cessionsNet,
      gain,
      exempt,
      imputed,
      taxable: exempt ? 0 : taxable,
      lossCreated: exempt ? 0 : lossCreated,
      rateLabel: rates.label,
      tax: exempt ? null : taxOn(taxable, year),
    });
  }
  return sheets;
}

export function buildFiscalReport(moves: FiscalMove[], period: FiscalPeriod, opts: FiscalOptions = {}): FiscalReport {
  const warnings: string[] = [];
  const sorted = [...moves].sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
  const holdings = new Map<string, number>();
  const px = new Map<string, number>();
  const history = indexPrices(opts.prices?.history);
  let pta = 0;
  let ever = 0;
  let openingPta: number | null = null;
  let snapPta: number | null = null;
  let snapHoldings: Map<string, number> | null = null;
  let snapPx: Map<string, number> | null = null;
  const allCessions: CessionRow[] = [];
  const incomes: IncomeRow[] = [];
  let swapCount = 0;
  let simulated = false;
  let sawCostValuation = false;

  const addQty = (asset: string, qty: number) => {
    holdings.set(asset, (holdings.get(asset) ?? 0) + qty);
  };

  const snap = () => {
    if (snapPta != null) return;
    snapPta = pta;
    snapHoldings = new Map(holdings);
    snapPx = new Map(px);
  };

  for (const move of sorted) {
    if (move.time > period.end) snap();
    if (move.source === "paper") simulated = true;
    if (openingPta == null && move.time >= period.start) openingPta = pta;

    if (move.kind === "fiat") continue;

    if (move.kind === "fee") {
      addQty(move.asset, -move.qty);
      continue;
    }

    if (move.kind === "deposit") {
      if (opts.ownWallets && move.source !== "manual") continue;
      addQty(move.asset, move.qty);
      pushWarn(
        warnings,
        "Dépôt crypto sans prix d’acquisition : le stock augmente, pas le prix de revient. Ajoute un achat manuel si ces unités ont été payées ailleurs.",
      );
      continue;
    }

    if (move.kind === "withdraw") {
      if (opts.ownWallets && move.source !== "manual") continue;
      addQty(move.asset, -move.qty);
      pushWarn(
        warnings,
        "Retrait crypto sorti du stock suivi. Si les unités sont encore à toi, coche « wallets perso » pour les garder dans la valeur globale.",
      );
      continue;
    }

    if (move.kind === "buy") {
      const fee = Math.max(0, move.feeEur ?? 0);
      const cost = Math.max(0, move.quoteQty ?? 0) + fee;
      const qty = move.qty;
      if (!(qty > 0) || !(cost > 0)) continue;
      addQty(move.asset, qty);
      pta += cost;
      ever += cost;
      px.set(move.asset, cost / qty);
      continue;
    }

    if (move.kind === "swap") {
      const outQty = move.qty;
      const inAsset = move.quote ?? "";
      const inQty = move.quoteQty ?? 0;
      if (!inAsset || !(outQty > 0) || !(inQty > 0)) continue;
      addQty(move.asset, -outQty);
      addQty(inAsset, inQty);
      const outPx = px.get(move.asset);
      const inPx = px.get(inAsset);
      if (outPx && outPx > 0) px.set(inAsset, (outQty * outPx) / inQty);
      else if (inPx && inPx > 0) px.set(move.asset, (inQty * inPx) / outQty);
      swapCount += 1;
      continue;
    }

    if (move.kind === "income") {
      const known = px.get(move.asset);
      const value = move.quoteQty && move.quoteQty > 0 ? move.quoteQty : known && known > 0 ? move.qty * known : 0;
      addQty(move.asset, move.qty);
      if (value > 0 && move.qty > 0) {
        px.set(move.asset, value / move.qty);
        pta += value;
        ever += value;
      } else {
        pushWarn(warnings, `Revenu ${move.asset} sans prix EUR — stock augmenté, prix de revient inchangé.`);
      }
      if (move.time >= period.start && move.time <= period.end) {
        incomes.push({
          time: move.time,
          asset: move.asset,
          qty: move.qty,
          valueEur: cents(value),
          note: move.note,
        });
      }
      continue;
    }

    if (move.kind !== "sell") continue;

    const gross = Math.max(0, move.quoteQty ?? 0);
    const fees = Math.max(0, move.feeEur ?? 0);
    const net = Math.max(0, gross - fees);
    const qty = move.qty;
    if (!(qty > 0) || !(gross > 0)) continue;

    const held = holdings.get(move.asset) ?? 0;
    if (held + 1e-8 < qty) {
      pushWarn(warnings, `Vente de ${move.asset} supérieure au stock suivi — plus-value peut-être trop haute (prix de revient incomplet).`);
      holdings.set(move.asset, qty);
    }
    px.set(move.asset, net / qty);
    const marks = new Map(px);
    let valuedAtCost = false;
    for (const [asset, heldQty] of holdings) {
      if (!(heldQty > 1e-12) || asset === move.asset) continue;
      const market = marketPrice(opts, history, asset, move.time);
      if (market && market > 0) {
        marks.set(asset, market);
        px.set(asset, market);
      } else if ((px.get(asset) ?? 0) > 0) {
        valuedAtCost = true;
      }
    }
    if (valuedAtCost) sawCostValuation = true;
    const valued = portfolioValue(holdings, marks);
    let portfolio = valued.value;
    let incomplete = valued.missing.length > 0 || valuedAtCost;
    if (valued.missing.length) {
      pushWarn(warnings, `Prix manquant pour ${valued.missing.join(", ")} — valeur globale incomplète.`);
    }
    if (!(portfolio > 0)) {
      portfolio = net;
      incomplete = true;
    }
    let fraction = portfolio > 0 ? net / portfolio : 1;
    if (fraction > 1) {
      fraction = 1;
      incomplete = true;
      pushWarn(warnings, "Fraction de cession plafonnée à 100 % (valeur de portefeuille inférieure au prix de cession).");
    }
    const acquired = pta * fraction;
    const gain = net - acquired;
    const ptaBefore = pta;
    const ptaEver = ever;
    const ptaOut = Math.max(0, ever - pta);
    pta = Math.max(0, pta - acquired);
    addQty(move.asset, -qty);

    allCessions.push({
      time: move.time,
      asset: move.asset,
      qty,
      grossEur: cents(gross),
      feesEur: cents(fees),
      netEur: cents(net),
      portfolioEur: cents(portfolio),
      ptaEver: cents(ptaEver),
      ptaOut: cents(ptaOut),
      ptaBefore: cents(ptaBefore),
      acquiredEur: cents(acquired),
      gainEur: cents(gain),
      valuedAtCost,
      incomplete,
      note: move.note,
    });
  }

  snap();
  if (openingPta == null) openingPta = pta;

  if (sawCostValuation) {
    pushWarn(
      warnings,
      "Case 212 incomplète : un autre actif est valorisé au prix d'acquisition, pas au cours du jour de la cession. Charge les cours Kraken ou saisis un prix.",
    );
  }

  const cessions = allCessions.filter((row) => row.time >= period.start && row.time <= period.end);
  const yearSheets = buildYearSheets(allCessions);
  const yearCessions: YearCessions[] = yearSheets.map((sheet) => ({
    year: sheet.year,
    total: sheet.cessionsNet,
    exempt: sheet.exempt,
  }));

  const totalCessions = cents(cessions.reduce((s, c) => s + c.netEur, 0));
  const totalGains = cents(cessions.filter((c) => c.gainEur > 0).reduce((s, c) => s + c.gainEur, 0));
  const totalLosses = cents(cessions.filter((c) => c.gainEur < 0).reduce((s, c) => s + c.gainEur, 0));
  const net = cents(cessions.reduce((s, c) => s + c.gainEur, 0));
  const singleYear = period.calendarYear != null;
  const sheet = singleYear ? yearSheets.find((row) => row.year === period.calendarYear) : undefined;
  const exempt = Boolean(sheet?.exempt);
  const indicative = !singleYear;
  const tax = sheet ? sheet.tax : net > 0 ? taxOn(net, parisYear(period.end)) : null;
  const declaration: FiscalDeclaration | null = sheet
    ? {
        year: sheet.year,
        cessionsNet: sheet.cessionsNet,
        gain: sheet.gain,
        exempt: sheet.exempt,
        imputed: sheet.imputed,
        taxable: sheet.taxable,
        lossCreated: sheet.lossCreated,
        reportBox: sheet.exempt ? "none" : sheet.taxable > 0 ? "3AN" : sheet.lossCreated > 0 ? "3BN" : "none",
        reportEuros: sheet.exempt ? 0 : Math.round(sheet.taxable > 0 ? sheet.taxable : sheet.lossCreated),
      }
    : null;

  const endHoldings = snapHoldings ?? holdings;
  const endPx = snapPx ?? px;
  const endPta = snapPta ?? pta;
  const holdingRows: HoldingSnap[] = [];
  for (const [asset, qty] of endHoldings) {
    if (!(qty > 1e-8)) continue;
    const market = marketPrice(opts, history, asset, period.end);
    const cost = endPx.get(asset);
    const price = market && market > 0 ? market : cost && cost > 0 ? cost : 0;
    holdingRows.push({
      asset,
      qty,
      priceEur: cents(price),
      valueEur: cents(qty * price),
      priced: Boolean(market && market > 0),
    });
  }
  holdingRows.sort((a, b) => b.valueEur - a.valueEur || a.asset.localeCompare(b.asset));

  const journal: JournalRow[] = sorted.map((move) => ({
    time: move.time,
    kind: move.kind,
    asset: move.asset,
    qty: move.qty,
    quote: move.quote,
    quoteQty: move.quoteQty,
    feeEur: move.feeEur,
    source: move.source,
    note: move.note,
    inPeriod: move.time >= period.start && move.time <= period.end,
  }));

  if (simulated) {
    pushWarn(warnings, "La simulation papier est incluse. Ne la reporte pas sur une déclaration réelle.");
  }
  if (exempt && sheet) {
    pushWarn(
      warnings,
      `Cessions nettes ${period.calendarYear} ≤ ${CESSION_EXEMPT_EUR} € (ligne 218) : plus-values exonérées. La 2086 reste à déposer, sans montant en 3AN ni 3BN.`,
    );
  }
  if (sheet && sheet.imputed > 0) {
    pushWarn(
      warnings,
      `Moins-values antérieures imputées : ${sheet.imputed.toLocaleString("fr-FR")} €. Le report tient compte de l'historique chargé, sur 10 ans.`,
    );
  }

  return {
    period,
    sourceLabel: opts.sourceLabel ?? "Activité",
    simulated,
    cessions,
    incomes,
    swapCount,
    openingPta: cents(openingPta),
    closingPta: cents(endPta),
    totalCessions,
    totalGains,
    totalLosses,
    net,
    netEuros: Math.round(net),
    yearCessions,
    yearSheets,
    declaration,
    holdings: holdingRows,
    journal,
    exempt,
    tax: exempt ? null : tax,
    indicative,
    warnings,
    incomplete: cessions.some((c) => c.incomplete) || warnings.some((w) => w.includes("incompl")),
  };
}
