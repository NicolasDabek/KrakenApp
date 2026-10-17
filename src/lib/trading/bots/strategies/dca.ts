import type { Bot, BotRuntime } from "../../types.ts";
import { formatWait, orderQty, px, roundSmart, sizeQuoteOf } from "../common.ts";
import type { BotEvalCtx, BotFill } from "../common.ts";

export function evalDca(bot: Bot, ctx: BotEvalCtx): { fills: BotFill[]; runtime: BotRuntime; note: string } {
  const runtime: BotRuntime = { ...bot.runtime };
  const every = bot.params.intervalMs ?? 300_000;
  const due = runtime.nextDcaAt ?? ctx.now;
  if (ctx.now < due) {
    const wait = Math.max(0, due - ctx.now);
    return {
      fills: [],
      runtime,
      note: `Prochain achat dans ${formatWait(wait)}`,
    };
  }
  const fillPx = px(ctx, "buy");
  const qty = orderQty(bot, ctx, fillPx);
  runtime.nextDcaAt = ctx.now + every;
  runtime.lastPrice = ctx.ticker.last;
  if (!(qty > 0)) return { fills: [], runtime, note: "Taille trop faible." };
  return {
    fills: [{ side: "buy", qty, price: fillPx, note: `DCA ${roundSmart(sizeQuoteOf(bot, ctx))} EUR` }],
    runtime,
    note: `Achat DCA @ ${roundSmart(fillPx)}`,
  };
}
