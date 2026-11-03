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
  // Suivi de position : quantité cumulée et prix moyen pondéré, pour que SL / TP / durée max s'appliquent.
  // L'heure d'entrée (premier achat) est posée par applyRisk et conservée pendant l'accumulation.
  const heldQty = runtime.inPosition && (runtime.positionQty ?? 0) > 0 ? runtime.positionQty! : 0;
  const heldAvg = heldQty > 0 ? (runtime.positionAvg ?? fillPx) : 0;
  const newQty = heldQty + qty;
  runtime.inPosition = true;
  runtime.positionQty = newQty;
  runtime.positionAvg = (heldQty * heldAvg + qty * fillPx) / newQty;
  return {
    fills: [{ side: "buy", qty, price: fillPx, note: `DCA ${roundSmart(sizeQuoteOf(bot, ctx))} EUR` }],
    runtime,
    note: `Achat DCA @ ${roundSmart(fillPx)}`,
  };
}
