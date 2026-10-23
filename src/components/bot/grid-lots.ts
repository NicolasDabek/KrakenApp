import type { Bot } from "@/lib/trading/types";

export function gridLots(bot: Bot) {
  const rows = bot.runtime.gridOwned ?? [];
  return {
    held: rows.filter((g) => g.qty > 0),
    pending: rows.filter((g) => g.pending),
  };
}
