import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Radar, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { botBlueprint, BOT_KIND_BY_ID } from "@/lib/trading/bots";
import { formatDateTime, formatFiat, formatPct } from "@/lib/trading/format";
import { EUR_PAIRS, PAIR_BY_ID } from "@/lib/trading/pairs";
import { marketSignal } from "@/lib/trading/signals";
import { downloadCsv } from "@/lib/trading/stats";
import { useTradingStore } from "@/lib/trading/store";
import type { BotKind, BotVenue } from "@/lib/trading/types";
import { cn } from "@/lib/utils";
import { BotCard } from "@/components/bot/bot-card";
import { KIND_ICON } from "@/components/bot/kind-icons";
import { Lab } from "@/components/bot/lab";
import { LiveJournal } from "@/components/bot/live-journal";
import { Cockpit } from "@/components/bot/cockpit";
import { Composer } from "@/components/bot/composer";
import { LivePanel } from "@/components/bot/live-panel";
import { PaperPanel } from "@/components/bot/paper-panel";

export const Route = createFileRoute("/bot")({ component: BotPage });

const KIND_GROUPS: { title: string; ids: BotKind[] }[] = [
  { title: "Accumulation", ids: ["grid", "dca"] },
  { title: "Reversion", ids: ["rsi", "bollinger", "stoch", "vwap", "cci", "meanrev", "keltner", "williams", "mfi", "div", "mtf"] },
  { title: "Tendance", ids: ["ema", "sma", "macd", "breakout", "supertrend", "adx", "roc", "ichimoku", "psar", "ha", "obv", "confirm"] },
  { title: "Court terme", ids: ["scalp", "volume", "engulf"] },
];

function BotPage() {
  const [venue, setVenue] = useState<BotVenue>("paper");
  const [composer, setComposer] = useState<BotKind | null>(null);
  const bots = useTradingStore((s) => s.bots);
  const paper = useTradingStore((s) => s.paper);
  const lastPair = useTradingStore((s) => s.lastPair);
  const visible = bots.filter((b) => b.venue === venue);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bots</h1>
        <p className="mt-1 text-sm text-muted-foreground">
        Automatisation spot EUR sur Kraken. Simulation avec frais, réel via tes clés API.
      </p>
      </div>

      <Cockpit venue={venue} />
      <EurRadar />
      <Lab />

      <div className="mt-4">
        <Segmented
          value={venue}
          onChange={setVenue}
          options={[
            { id: "paper", label: "Simulation" },
            { id: "live", label: "Réel" },
          ]}
        />
      </div>

      {venue === "paper" ? <PaperPanel /> : <LivePanel />}

      <section className="mt-7">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nouveau bot · paires EUR</h2>
        <div className="mt-3 space-y-5">
          {KIND_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] uppercase tracking-wide text-subtle">{group.title}</p>
              <ul className="grid grid-cols-2 gap-2">
                {group.ids.map((id) => {
                  const kind = BOT_KIND_BY_ID[id];
                  if (!kind) return null;
                  const Icon = KIND_ICON[kind.id];
                  return (
                    <li key={kind.id}>
                      <button
                        type="button"
                        onClick={() => setComposer(kind.id)}
                        className="flex h-full w-full flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors duration-150 hover:bg-muted"
                      >
                        <span className="grid size-9 place-items-center rounded-md bg-muted text-accent">
                          <Icon className="size-4" strokeWidth={1.75} />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{kind.title}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{kind.blurb}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {venue === "paper" ? "Bots papier" : "Bots réels"}
          </h2>
          <BotIo venue={venue} count={visible.length} />
        </div>
        {visible.length === 0 ? (
          <p className="mt-6 py-6 text-center text-sm text-muted-foreground">
            Aucun bot {venue === "paper" ? "en simulation" : "réel"}. Choisis une stratégie ci-dessus.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {visible.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </ul>
        )}
      </section>

      {venue === "paper" && paper.trades.length > 0 && <PaperJournal />}
      {venue === "live" && <LiveJournal />}

      {composer && (
        <Composer
          kind={composer}
          venue={venue}
          defaultPair={lastPair}
          onClose={() => setComposer(null)}
        />
      )}
    </div>
  );
}

function EurRadar() {
  const tickers = useTradingStore((s) => s.tickers);
  const bots = useTradingStore((s) => s.bots);
  const rows = useMemo(() => {
    return EUR_PAIRS.map((p) => {
      const t = tickers[p.id];
      const sig = marketSignal(t);
      const n = bots.filter((b) => b.pair === p.id && b.status === "running").length;
      return { p, t, sig, n, move: Math.abs(t?.changePct ?? 0) };
    }).sort((a, b) => b.move - a.move);
  }, [tickers, bots]);
  const hot = rows.filter((r) => r.t).slice(0, 12);
  if (hot.length === 0) return null;
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Radar EUR</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Les 12 plus gros mouvements 24h. Un point = bot actif.
          </p>
        </div>
        <Radar className="size-4 shrink-0 text-accent" strokeWidth={1.75} />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-1">
        {hot.map((row) => {
          const pct = row.t?.changePct ?? 0;
          return (
            <li key={row.p.id}>
              <Link
                to="/trade/$pair"
                params={{ pair: row.p.id }}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      row.sig.bias === "buy" ? "bg-buy" : row.sig.bias === "sell" ? "bg-sell" : "bg-subtle",
                    )}
                  />
                  <span className="truncate text-xs font-medium">{row.p.displayBase}</span>
                  {row.n > 0 && <span className="size-1.5 shrink-0 rounded-full bg-accent" />}
                </span>
                <span className={cn("shrink-0 font-mono text-xs tabular-nums", pct >= 0 ? "text-buy" : "text-sell")}>
                  {formatPct(pct)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PaperJournal() {
  const trades = useTradingStore((s) => s.paper.trades);
  const exportCsv = () => {
    downloadCsv("nautilus-bots-eur.csv", [
      ["time", "pair", "side", "amount", "price", "fee", "pnl", "note"],
      ...trades.map((t) => [
        new Date(t.time).toISOString(),
        PAIR_BY_ID[t.pair]?.display ?? t.pair,
        t.side,
        String(t.amount),
        String(t.price),
        String(t.fee),
        String(t.pnl),
        t.note,
      ]),
    ]);
  };
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Journal papier</h2>
        <Button size="sm" variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
        {trades.slice(0, 24).map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <span className={t.side === "buy" ? "text-buy" : "text-sell"}>
                  {t.side === "buy" ? "Achat" : "Vente"}
                </span>{" "}
                {PAIR_BY_ID[t.pair]?.display ?? t.pair}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.note} · frais {formatFiat(t.fee, "EUR")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-xs tabular-nums text-muted-foreground">{formatDateTime(t.time)}</p>
              {t.side === "sell" && (
                <p className={cn("font-mono text-xs tabular-nums", t.pnl >= 0 ? "text-buy" : "text-sell")}>
                  {t.pnl >= 0 ? "+" : ""}
                  {formatFiat(t.pnl, "EUR")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BotIo({ venue, count }: { venue: BotVenue; count: number }) {
  const bots = useTradingStore((s) => s.bots);
  const importBots = useTradingStore((s) => s.importBots);
  const inputRef = useRef<HTMLInputElement>(null);
  const mine = bots.filter((b) => b.venue === venue);

  const exportMine = () => {
    const payload = { v: 1, bots: mine.map(botBlueprint) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nautilus-bots-${venue}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.message(`${mine.length} bot${mine.length > 1 ? "s" : ""} exporté${mine.length > 1 ? "s" : ""}`);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 text-xs text-subtle">{count}</span>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          void file.text().then((text) => {
            try {
              const res = importBots(JSON.parse(text));
              toast.message(res.message);
            } catch {
              toast.message("Fichier JSON illisible");
            }
          });
        }}
      />
      <Button size="sm" variant="ghost" onClick={exportMine} disabled={mine.length === 0} aria-label="Exporter">
        <Download className="size-3.5" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()} aria-label="Importer">
        <Upload className="size-3.5" />
      </Button>
    </div>
  );
}
