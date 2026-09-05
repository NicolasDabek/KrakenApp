import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PAIR_BY_ID, PAIR_UNIVERSE } from "@/lib/trading/pairs";
import { formatDateTime } from "@/lib/trading/format";
import { useTradingStore } from "@/lib/trading/store";
import type { JournalMood } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({ component: JournalPage });

const MOODS: { id: JournalMood; label: string }[] = [
  { id: "plan", label: "Plan" },
  { id: "note", label: "Note" },
  { id: "win", label: "Gain" },
  { id: "loss", label: "Perte" },
];

function JournalPage() {
  const lastPair = useTradingStore((s) => s.lastPair);
  const journal = useTradingStore((s) => s.journal);
  const addJournal = useTradingStore((s) => s.addJournal);
  const removeJournal = useTradingStore((s) => s.removeJournal);
  const [pair, setPair] = useState(lastPair);
  const [mood, setMood] = useState<JournalMood>("plan");
  const [text, setText] = useState("");

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <PageHeader title="Journal" kicker="Plans, notes et post-mortem — stockés sur l’appareil" />
      <form
        className="space-y-3 rounded-lg border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          addJournal({ pair, mood, text: text.trim() });
          setText("");
        }}
      >
        <label className="block text-xs text-muted-foreground">
          Paire
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"
          >
            {PAIR_UNIVERSE.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-1 overflow-x-auto">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium",
                mood === m.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Thèse, invalidation, émotion…"
          className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/60"
        />
        <Button type="submit" className="w-full">
          Enregistrer
        </Button>
      </form>
      <ul className="mt-6 divide-y divide-border">
        {journal.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Journal vide.</p>}
        {journal.map((j) => (
          <li key={j.id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {PAIR_BY_ID[j.pair]?.display} · {MOODS.find((m) => m.id === j.mood)?.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{j.text}</p>
                <p className="mt-1 text-xs text-subtle">{formatDateTime(j.createdAt)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeJournal(j.id)}>
                Suppr.
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
