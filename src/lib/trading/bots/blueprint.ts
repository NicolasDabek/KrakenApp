import type { Bot, BotKind, BotParams, BotVenue } from "../types.ts";
import { BOT_KINDS } from "./catalog.ts";

export type BotBlueprint = {
  name: string;
  kind: BotKind;
  venue: BotVenue;
  pair: string;
  interval: number;
  sizeQuote: number;
  params: BotParams;
};

export function botBlueprint(bot: Bot): BotBlueprint {
  return {
    name: bot.name,
    kind: bot.kind,
    venue: bot.venue,
    pair: bot.pair,
    interval: bot.interval,
    sizeQuote: bot.sizeQuote,
    params: { ...bot.params },
  };
}

export function parseBotBlueprints(raw: unknown): BotBlueprint[] {
  const root = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  const list = Array.isArray(raw) ? raw : Array.isArray(root?.bots) ? (root!.bots as unknown[]) : null;
  if (!list) return [];
  const kinds = new Set(BOT_KINDS.map((k) => k.id));
  const out: BotBlueprint[] = [];
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const kind = r.kind;
    if (typeof kind !== "string" || !kinds.has(kind as BotKind)) continue;
    const pair = typeof r.pair === "string" ? r.pair : "";
    const sizeQuote = Number(r.sizeQuote);
    if (!(sizeQuote > 0) || !pair) continue;
    out.push({
      name: typeof r.name === "string" ? r.name : "",
      kind: kind as BotKind,
      venue: r.venue === "live" ? "live" : "paper",
      pair,
      interval: Number(r.interval) > 0 ? Number(r.interval) : 60,
      sizeQuote,
      params: r.params && typeof r.params === "object" ? (r.params as BotParams) : {},
    });
  }
  return out;
}
