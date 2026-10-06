import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import {
  buildFiscalReport,
  formatFiscalDate,
  legsFromKrakenCsv,
  movesFromFills,
  movesFromLedgers,
  parisDate,
  parisMonth,
  parisYear,
  resolvePeriod,
  type FiscalIdentity,
  type FiscalKind,
  type FiscalMove,
  type FiscalPeriodKind,
  type LedgerLeg,
  type PricePoint,
} from "@/lib/trading/fiscal";
import {
  downloadBytes,
  downloadText,
  fiscalBasename,
  reportToCsv,
  reportToDocx,
  reportToJson,
  reportToPdf,
  reportToText,
  reportToXlsx,
} from "@/lib/trading/fiscal-export";
import { fetchOhlc, krakenLedgers } from "@/lib/trading/functions";
import { formatFiat, uid } from "@/lib/trading/format";
import { PAIR_UNIVERSE } from "@/lib/trading/pairs";
import { eurUsdRate, isLiveConnected, useTradingStore } from "@/lib/trading/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fiscal")({ component: FiscalPage });

const PROFILE_KEY = "nautilus-fiscal-profile";
const MANUAL_KEY = "nautilus-fiscal-manual";
const PRICE_KEY = "nautilus-fiscal-prices";

const EMPTY_ID: FiscalIdentity = { firstName: "", lastName: "", taxId: "", accountRef: "" };

const KINDS: { id: FiscalKind; label: string }[] = [
  { id: "buy", label: "Achat EUR" },
  { id: "sell", label: "Vente EUR" },
  { id: "swap", label: "Échange crypto" },
  { id: "deposit", label: "Dépôt" },
  { id: "withdraw", label: "Retrait" },
  { id: "income", label: "Revenu" },
];

function FiscalPage() {
  const nowYear = parisYear(Date.now());
  const nowMonth = parisMonth(Date.now());
  const connection = useTradingStore((s) => s.connection);
  const tickers = useTradingStore((s) => s.tickers);
  const liveFills = useTradingStore((s) => s.liveFills);
  const krakenFills = useTradingStore((s) => s.krakenFills);
  const paperTrades = useTradingStore((s) => s.paper.trades);
  const linked = isLiveConnected(connection);

  const [kind, setKind] = useState<FiscalPeriodKind>("year");
  const [year, setYear] = useState(nowYear);
  const [month, setMonth] = useState(nowMonth);
  const [from, setFrom] = useState(`${nowYear}-01-01`);
  const [to, setTo] = useState(`${nowYear}-12-31`);
  const [source, setSource] = useState<"kraken" | "desk">(linked ? "kraken" : "desk");
  const [ownWallets, setOwnWallets] = useState(true);
  const [includePaper, setIncludePaper] = useState(false);
  const [identity, setIdentity] = useState<FiscalIdentity>(EMPTY_ID);
  const [manual, setManual] = useState<FiscalMove[]>([]);
  const [legs, setLegs] = useState<LedgerLeg[] | null>(null);
  const [ledgerNote, setLedgerNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pricing, setPricing] = useState(false);
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({});
  const [manualPx, setManualPx] = useState<Record<string, string>>({});
  const [usdText, setUsdText] = useState("");
  const [draftKind, setDraftKind] = useState<FiscalKind>("buy");
  const [draft, setDraft] = useState({ date: `${nowYear}-01-15`, asset: "BTC", qty: "", eur: "", fee: "", quote: "ETH" });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null") as FiscalIdentity | null;
      if (profile) setIdentity({ ...EMPTY_ID, ...profile });
      const saved = JSON.parse(localStorage.getItem(MANUAL_KEY) || "[]") as FiscalMove[];
      if (Array.isArray(saved)) setManual(saved.filter((m) => m && m.asset && m.kind));
      const prices = JSON.parse(localStorage.getItem(PRICE_KEY) || "null") as { usd?: string; manual?: Record<string, string> } | null;
      if (prices?.manual && typeof prices.manual === "object") setManualPx(prices.manual);
      if (typeof prices?.usd === "string") setUsdText(prices.usd);
    } catch {
      /* ignore broken local data */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(identity));
  }, [identity, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(MANUAL_KEY, JSON.stringify(manual));
  }, [manual, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PRICE_KEY, JSON.stringify({ usd: usdText, manual: manualPx }));
  }, [manualPx, usdText, ready]);

  const usdPerEur = eurUsdRate(tickers);
  const typedUsd = Number(usdText.replace(",", "."));
  const eurPerUsd = typedUsd > 0 ? typedUsd : usdPerEur > 0 ? 1 / usdPerEur : undefined;
  const manualPrices = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [asset, raw] of Object.entries(manualPx)) {
      const n = Number(String(raw).replace(",", "."));
      if (n > 0) out[asset] = n;
    }
    return out;
  }, [manualPx]);
  const period = useMemo(
    () => resolvePeriod({ kind, year, month, from, to }),
    [kind, year, month, from, to],
  );

  const report = useMemo(() => {
    const warnings: string[] = [];
    let parsed: FiscalMove[] = [];
    if (source === "kraken") {
      if (legs) {
        const led = movesFromLedgers(legs, { eurPerUsd });
        parsed = led.moves;
        warnings.push(...led.warnings);
      }
    } else {
      const fills = dedupeFills([...krakenFills, ...liveFills]);
      const desk = movesFromFills(fills, "desk", { eurPerUsd });
      parsed = desk.moves;
      warnings.push(...desk.warnings);
      if (includePaper) {
        const paper = movesFromFills(paperTrades, "paper", { eurPerUsd });
        parsed = [...parsed, ...paper.moves];
        warnings.push(...paper.warnings);
      }
    }
    const built = buildFiscalReport([...parsed, ...manual], period, {
      eurPerUsd,
      ownWallets,
      prices: { history, manual: manualPrices },
      sourceLabel: source === "kraken" ? "Grand livre Kraken" : includePaper ? "Bureau + simulation" : "Activité du bureau",
    });
    return { ...built, warnings: [...warnings, ...built.warnings].filter((w, i, all) => all.indexOf(w) === i) };
  }, [source, legs, eurPerUsd, krakenFills, liveFills, includePaper, paperTrades, manual, period, ownWallets, history, manualPrices]);

  const load = async () => {
    if (!linked) {
      toast.message("Ajoute tes clés Kraken pour lire le grand livre.");
      return;
    }
    setBusy(true);
    try {
      const res = await krakenLedgers({ data: { apiKey: connection.apiKey, apiSecret: connection.apiSecret } });
      if (!res.ok) {
        toast.message(res.message);
        setLedgerNote(res.message);
        return;
      }
      setLegs(res.legs);
      setLedgerNote(res.truncated ? `${res.message} (${res.legs.length} / ${res.count})` : `${res.legs.length} écritures`);
      toast.message(res.message);
    } catch {
      toast.message("Grand livre Kraken indisponible");
    } finally {
      setBusy(false);
    }
  };

  const onCsv = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = legsFromKrakenCsv(text);
      if (!parsed.legs.length) {
        toast.message(parsed.warnings[0] ?? "Fichier illisible");
        return;
      }
      setSource("kraken");
      setLegs(parsed.legs);
      setLedgerNote(`${parsed.legs.length} lignes importées`);
      if (parsed.warnings.length) toast.message(parsed.warnings[0]!);
      else toast.message("Export Kraken importé");
    } catch {
      toast.message("Lecture du fichier impossible");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const priceAssets = useMemo(() => {
    const set = new Set<string>();
    for (const row of report.journal) {
      if (row.kind === "fiat" || row.kind === "fee") continue;
      if (row.asset) set.add(row.asset);
    }
    for (const row of report.holdings) set.add(row.asset);
    return [...set].sort();
  }, [report.journal, report.holdings]);

  const loadCourses = async () => {
    if (!priceAssets.length) {
      toast.message("Aucun actif à valoriser.");
      return;
    }
    setPricing(true);
    const next: Record<string, PricePoint[]> = {};
    const missing: string[] = [];
    try {
      for (const asset of priceAssets) {
        const pair = PAIR_UNIVERSE.find((item) => item.base === asset && item.quote === "EUR")?.id;
        if (!pair) {
          missing.push(asset);
          continue;
        }
        const [weekly, daily] = await Promise.all([
          fetchOhlc({ data: { pair, interval: 10080 } }),
          fetchOhlc({ data: { pair, interval: 1440 } }),
        ]);
        const map = new Map<number, number>();
        for (const candle of [...weekly, ...daily]) {
          if (candle.close > 0 && candle.time > 0) map.set(candle.time * 1000, candle.close);
        }
        if (map.size) next[asset] = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([time, eur]) => ({ time, eur }));
        else missing.push(asset);
      }
      setHistory((prev) => ({ ...prev, ...next }));
      const loaded = Object.keys(next).length;
      toast.message(loaded ? `Cours chargés pour ${loaded} actif${loaded > 1 ? "s" : ""}` : "Aucun cours Kraken");
      if (missing.length) toast.message(`Pas de marché EUR : ${missing.join(", ")}`);
    } catch {
      toast.message("Cours Kraken indisponibles");
    } finally {
      setPricing(false);
    }
  };

  const addManual = () => {
    const qty = Number(draft.qty.replace(",", "."));
    const eur = Number(draft.eur.replace(",", "."));
    const fee = Number(draft.fee.replace(",", ".")) || 0;
    const asset = draft.asset.trim().toUpperCase();
    if (!asset || !(qty > 0)) {
      toast.message("Actif et quantité requis.");
      return;
    }
    const [y, m, d] = draft.date.split("-").map(Number);
    if (!y || !m || !d) {
      toast.message("Date invalide.");
      return;
    }
    const time = parisDate(y, m, d, 12);
    const move: FiscalMove = {
      id: uid("fisc"),
      time,
      kind: draftKind,
      asset,
      qty,
      quote: draftKind === "swap" ? draft.quote.trim().toUpperCase() : "EUR",
      quoteQty: draftKind === "swap" ? eur : eur,
      feeEur: fee,
      source: "manual",
      note: "Saisie manuelle",
    };
    if ((draftKind === "buy" || draftKind === "sell" || draftKind === "income") && !(eur > 0)) {
      toast.message("Montant EUR requis.");
      return;
    }
    setManual((rows) => [move, ...rows]);
    toast.message("Mouvement ajouté");
  };

  const base = fiscalBasename(report);
  const exportPdf = () => downloadBytes(`${base}.pdf`, reportToPdf(report, identity), "application/pdf");
  const exportXlsx = () =>
    downloadBytes(`${base}.xlsx`, reportToXlsx(report, identity), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  const exportDocx = () =>
    downloadBytes(
      `${base}.docx`,
      reportToDocx(report, identity),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <PageHeader
        title="Impôts"
        kicker="Plus-values d’actifs numériques, méthode du portefeuille global (formulaire 2086)."
      />

      <p className="text-xs leading-relaxed text-subtle">
        Aide au calcul pour une déclaration française. Ce n’est pas un conseil fiscal : les montants se reportent sur le
        formulaire 2086, et le compte Kraken sur le 3916-bis. Les échanges crypto-crypto ne sont pas imposables.
      </p>

      <section className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Contribuable</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="Prénom">
            <Input value={identity.firstName} onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })} />
          </Field>
          <Field label="Nom">
            <Input value={identity.lastName} onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })} />
          </Field>
          <Field label="N° fiscal">
            <Input value={identity.taxId} onChange={(e) => setIdentity({ ...identity, taxId: e.target.value })} className="font-mono" />
          </Field>
          <Field label="Réf. compte Kraken">
            <Input
              value={identity.accountRef}
              onChange={(e) => setIdentity({ ...identity, accountRef: e.target.value })}
              className="font-mono"
            />
          </Field>
        </div>
      </section>

      <section className="mt-3 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Période</p>
        <Segmented
          className="mt-3"
          value={kind}
          onChange={setKind}
          options={[
            { id: "year", label: "Année civile" },
            { id: "rolling12", label: "12 mois" },
            { id: "month", label: "Un mois" },
            { id: "custom", label: "Personnalisée" },
          ]}
        />
        {kind === "year" && (
          <div className="mt-3 flex flex-wrap gap-1">
            {years(nowYear).map((y) => (
              <Chip key={y} on={year === y} onClick={() => setYear(y)}>
                {y}
              </Chip>
            ))}
          </div>
        )}
        {kind === "month" && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {years(nowYear).map((y) => (
                <Chip key={y} on={year === y} onClick={() => setYear(y)}>
                  {y}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"].map((label, i) => (
                <Chip key={label} on={month === i + 1} onClick={() => setMonth(i + 1)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>
        )}
        {kind === "custom" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Field label="Du">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Au">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {period.label}
          {period.calendarYear
            ? " · le seuil de 305 € et le PFU s’appliquent sur cette année civile."
            : " · le PFU affiché est indicatif : il se liquide sur l’année civile, pas sur une période libre."}
        </p>
      </section>

      <section className="mt-3 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Source</p>
        <Segmented
          className="mt-3"
          value={source}
          onChange={setSource}
          options={[
            { id: "kraken", label: "Kraken réel" },
            { id: "desk", label: "Bureau" },
          ]}
        />
        <button
          type="button"
          onClick={() => setOwnWallets((v) => !v)}
          className={cn(
            "mt-3 h-11 w-full rounded-md text-xs font-medium",
            ownWallets ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
          )}
        >
          {ownWallets ? "Dépôts et retraits ignorés (wallets perso)" : "Dépôts et retraits modifient le stock"}
        </button>
        <div className="mt-3">
          <Field label="1 USD en euros — vide = cours du moment">
            <Input
              inputMode="decimal"
              value={usdText}
              placeholder={usdPerEur > 0 ? (1 / usdPerEur).toLocaleString("fr-FR", { maximumFractionDigits: 4 }) : "0,92"}
              onChange={(e) => setUsdText(e.target.value)}
              className="font-mono"
            />
          </Field>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          onChange={(e) => void onCsv(e.target.files?.[0])}
        />
        <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => fileRef.current?.click()}>
          Importer un CSV Kraken
        </Button>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Grand livre ou historique de trades exporté depuis Kraken. Le fichier n’est pas envoyé : il sert seulement au calcul de cette session.
        </p>
        {source === "kraken" ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Le grand livre Kraken reconstruit achats, ventes, échanges et staking. Les clés restent sur cet appareil.
            </p>
            {ledgerNote && <p className="text-xs text-subtle">{ledgerNote}</p>}
            {!linked && (
              <p className="text-xs text-warning">
                Clés absentes. <Link to="/connect" className="text-accent">Connecter Kraken</Link>
              </p>
            )}
            <Button type="button" className="w-full" disabled={busy || !linked} onClick={() => void load()}>
              {busy ? "Lecture du grand livre…" : legs ? "Recharger le grand livre" : "Charger le grand livre"}
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ordres réels déjà vus par le bureau (bots et historique Kraken synchronisé). Moins complet qu’un grand livre.
            </p>
            <button
              type="button"
              onClick={() => setIncludePaper((v) => !v)}
              className={cn(
                "h-11 w-full rounded-md text-xs font-medium",
                includePaper ? "bg-warning text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {includePaper ? "Simulation incluse — ne pas déclarer" : "Exclure la simulation papier"}
            </button>
          </div>
        )}
      </section>

      {source === "kraken" && !legs && (
        <p className="mt-3 rounded-lg border border-border bg-card px-3 py-3 text-xs leading-relaxed text-warning">
          Grand livre non chargé. Les totaux ci-dessous n’utilisent que les lignes saisies à la main — pas encore tes cessions Kraken.
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Cessions nettes" value={formatFiat(report.totalCessions, "EUR")} />
        <Stat
          label="Plus ou moins-value"
          value={formatFiat(report.net, "EUR")}
          tone={report.net > 0 ? "buy" : report.net < 0 ? "sell" : undefined}
        />
        <Stat
          label={report.exempt ? "Exonéré" : report.indicative ? "PFU indicatif" : `PFU ${report.tax?.label ?? ""}`.trim()}
          value={report.exempt ? "0 €" : report.tax ? formatFiat(report.tax.total, "EUR") : "—"}
        />
        <Stat label="Échanges crypto" value={String(report.swapCount)} />
      </div>
      {report.tax && !report.exempt && (
        <p className="mt-2 text-xs text-muted-foreground">
          IR 12,8 % {formatFiat(report.tax.ir, "EUR")} · prélèvements sociaux{" "}
          {(report.tax.psRate * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} % {formatFiat(report.tax.ps, "EUR")}
          {report.declaration ? ` · base ${report.declaration.reportBox === "3AN" ? report.declaration.reportEuros : report.netEuros} €` : ""}
        </p>
      )}
      {report.declaration && (
        <section className="mt-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Année {report.declaration.year}</p>
            <Badge tone="accent">{report.declaration.exempt ? "Exonéré" : report.declaration.reportBox === "none" ? "Néant" : report.declaration.reportBox}</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Somme des prix de cession nets (ligne 218) {formatFiat(report.declaration.cessionsNet, "EUR")}. Solde des cessions{" "}
            {formatFiat(report.declaration.gain, "EUR")}
            {report.declaration.imputed > 0 ? ` · moins-values antérieures imputées ${formatFiat(report.declaration.imputed, "EUR")}` : ""}.
          </p>
          {report.declaration.exempt ? (
            <p className="mt-2 text-xs leading-relaxed text-foreground">
              Sous le seuil de 305 €. Dépose quand même la 2086 avec les prix de cession. Rien en case 3AN ni 3BN.
            </p>
          ) : report.declaration.reportBox === "3AN" ? (
            <p className="mt-2 text-sm font-medium">
              2042-C, case 3AN : {report.declaration.reportEuros.toLocaleString("fr-FR")} €
            </p>
          ) : report.declaration.reportBox === "3BN" ? (
            <p className="mt-2 text-sm font-medium">
              2042-C, case 3BN : {report.declaration.reportEuros.toLocaleString("fr-FR")} €
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Plus-value absorbée par les moins-values reportables. Rien à inscrire en 3AN.</p>
          )}
          <p className="mt-2 text-xs text-subtle">
            L’option pour le barème de l’impôt sur le revenu se coche en case 3CN. Elle n’est pas chiffrée ici : elle dépend du reste des revenus.
          </p>
        </section>
      )}
      {report.yearSheets.length > 0 && (
        <ul className="mt-2 space-y-1">
          {report.yearSheets.map((y) => (
            <li key={y.year} className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
              <span className="shrink-0">Cessions nettes {y.year}</span>
              <span className="min-w-0 text-right font-mono tabular-nums">
                {formatFiat(y.cessionsNet, "EUR")}
                {y.exempt ? " · ≤ 305 €" : y.lossCreated > 0 ? ` · 3BN ${Math.round(y.lossCreated)} €` : y.taxable > 0 ? ` · 3AN ${Math.round(y.taxable)} €` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cessions imposables</h2>
        {report.cessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucune vente contre des euros sur cette période.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {report.cessions.map((row, i) => (
              <li key={`${row.time}-${row.asset}-${i}`} className="rounded-lg border border-border bg-card px-3 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">
                    {row.asset} · {formatFiscalDate(row.time)}
                  </p>
                  <p className={cn("font-mono text-sm tabular-nums", row.gainEur >= 0 ? "text-buy" : "text-sell")}>
                    {formatFiat(row.gainEur, "EUR")}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  218 {formatFiat(row.netEur, "EUR")} · 214 {formatFiat(row.feesEur, "EUR")} · 212{" "}
                  {formatFiat(row.portfolioEur, "EUR")} · 223 {formatFiat(row.ptaBefore, "EUR")} · imputé{" "}
                  {formatFiat(row.acquiredEur, "EUR")}
                  {row.valuedAtCost ? " · cours manquant" : ""}
                  {row.incomplete ? " · incomplet" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {report.incomes.length > 0 && (
        <section className="mt-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenus (hors 2086)</h2>
          <ul className="mt-2 space-y-1">
            {report.incomes.map((row, i) => (
              <li key={`${row.time}-${i}`} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatFiscalDate(row.time)} · {row.asset} · {row.note ?? "revenu"}
                </span>
                <span className="font-mono tabular-nums">{formatFiat(row.valueEur, "EUR")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-5 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Valeur du portefeuille</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          La case 212 est le cours de chaque actif le jour de la vente, pas son prix d’achat. Les cours Kraken couvrent environ deux ans au jour le jour, et plus loin en clôture hebdomadaire.
        </p>
        <Button type="button" variant="outline" className="mt-3 w-full" disabled={pricing || priceAssets.length === 0} onClick={() => void loadCourses()}>
          {pricing ? "Lecture des cours…" : "Appliquer les cours Kraken"}
        </Button>
        {report.holdings.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">Aucun actif en stock à la fin de la période.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {report.holdings.map((row) => (
              <li key={row.asset} className="flex items-center gap-2">
                <span className="w-14 shrink-0 font-mono text-xs">{row.asset}</span>
                <Input
                  inputMode="decimal"
                  aria-label={`Prix EUR de ${row.asset}`}
                  value={manualPx[row.asset] ?? ""}
                  placeholder={row.priceEur ? String(row.priceEur) : "prix EUR"}
                  onChange={(e) => setManualPx((prev) => ({ ...prev, [row.asset]: e.target.value }))}
                  className="font-mono"
                />
                <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
                  {row.priced ? "cours" : "achat"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">3916-bis</p>
          <Badge tone="accent">Compte étranger</Badge>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Kraken (Payward), compte d’actifs numériques ouvert auprès d’un opérateur étranger.
          Référence : {identity.accountRef.trim() || "à compléter ci-dessus"}.
        </p>
        <p className="mt-2 text-xs text-subtle">
          Prix d’acquisition en début de période {formatFiat(report.openingPta, "EUR")} · en fin{" "}
          {formatFiat(report.closingPta, "EUR")}.
        </p>
      </section>

      {report.warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {report.warnings.map((w) => (
            <li key={w} className="text-xs leading-relaxed text-warning">
              {w}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-5 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium">Mouvement hors Kraken</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Achat payé ailleurs, revenu, ou transfert. Ces lignes restent sur cet appareil et s’ajoutent au calcul.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {KINDS.map((k) => (
            <Chip key={k.id} on={draftKind === k.id} onClick={() => setDraftKind(k.id)}>
              {k.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="Date">
            <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="Actif">
            <Input value={draft.asset} onChange={(e) => setDraft({ ...draft, asset: e.target.value })} className="font-mono" />
          </Field>
          <Field label="Quantité">
            <Input inputMode="decimal" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: e.target.value })} className="font-mono" />
          </Field>
          <Field label={draftKind === "swap" ? "Quantité reçue" : "Montant EUR"}>
            <Input inputMode="decimal" value={draft.eur} onChange={(e) => setDraft({ ...draft, eur: e.target.value })} className="font-mono" />
          </Field>
          {draftKind === "swap" && (
            <Field label="Actif reçu">
              <Input value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} className="font-mono" />
            </Field>
          )}
          {draftKind !== "swap" && draftKind !== "deposit" && draftKind !== "withdraw" && (
            <Field label="Frais EUR">
              <Input inputMode="decimal" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} className="font-mono" />
            </Field>
          )}
        </div>
        <Button type="button" variant="outline" className="mt-3 w-full" onClick={addManual}>
          Ajouter au calcul
        </Button>
        {manual.length > 0 && (
          <ul className="mt-3 divide-y divide-border">
            {manual.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2 text-xs">
                <span className="text-muted-foreground">
                  {formatFiscalDate(m.time)} · {labelKind(m.kind)} {m.asset}
                </span>
                <button type="button" className="text-accent" onClick={() => setManual((rows) => rows.filter((r) => r.id !== m.id))}>
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Exporter</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={exportPdf}>PDF</Button>
          <Button type="button" variant="outline" onClick={exportXlsx}>Excel</Button>
          <Button type="button" variant="outline" onClick={exportDocx}>Word</Button>
          <Button type="button" variant="outline" onClick={() => downloadText(`${base}.csv`, reportToCsv(report), "text/csv;charset=utf-8")}>
            CSV
          </Button>
          <Button type="button" variant="outline" onClick={() => downloadText(`${base}.txt`, reportToText(report, identity), "text/plain;charset=utf-8")}>
            Texte
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadText(`${base}.json`, reportToJson(report, identity), "application/json")}
          >
            JSON
          </Button>
        </div>
      </section>
    </div>
  );
}

function years(current: number): number[] {
  return Array.from({ length: 7 }, (_, i) => current - i);
}

function dedupeFills<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
}

function labelKind(kind: FiscalKind): string {
  return KINDS.find((k) => k.id === kind)?.label ?? kind;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full px-3 text-xs font-medium",
        on ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "buy" | "sell" }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-subtle">{label}</p>
      <p className={cn("mt-1 font-mono text-lg tabular-nums", tone === "buy" && "text-buy", tone === "sell" && "text-sell")}>{value}</p>
    </div>
  );
}
