/**
 * Façade publique des bots : le code est découpé dans `./bots/` (un module par
 * stratégie dans `bots/strategies/`, plus `common`, `evaluate`, `stats`, `backtest`,
 * `paper`, `catalog` et `blueprint`). Les imports existants de `./bots.ts` restent valables.
 */
export {
  BOT_KINDS,
  BOT_KIND_BY_ID,
  DCA_INTERVALS,
  BOT_CANDLE_INTERVALS,
  defaultParams,
  profitDefaults,
  riskPresetFor,
  defaultSize,
  kindTitle,
  kindNeedsCandles,
  RISK_PRESETS,
} from "./bots/catalog.ts";
export {
  EMPTY_STATS,
  dropFormingCandle,
  botInventoryQty,
  botMark,
  botDeployed,
  remainingQuoteBudget,
  formatWait,
} from "./bots/common.ts";
export type { BotFill, BotEvalCtx } from "./bots/common.ts";
export { evaluateDesk, evaluateBot } from "./bots/evaluate.ts";
export type { DeskLimits, DeskSnapshot } from "./bots/evaluate.ts";
export { botWinRate, allocateByPerformance, botAllocScore, monteCarloPnl } from "./bots/stats.ts";
export type { MonteCarloResult, AllocInput, AllocResult } from "./bots/stats.ts";
export {
  backtestBot,
  backtestWarmup,
  previewSignal,
  paramVariants,
  optimizeBot,
  compareStrategies,
  walkForward,
  applyStressScenario,
  STRESS_SCENARIOS,
  gatedOptimizeBot,
} from "./bots/backtest.ts";
export type {
  BacktestResult,
  BacktestOpts,
  OptRow,
  StrategyScore,
  WalkForwardResult,
  StressScenarioId,
  GatedOptResult,
} from "./bots/backtest.ts";
export {
  DEFAULT_PAPER,
  assetPx,
  paperEquity,
  applyPaperFill,
  snapshotEquity,
  resetPaperAccount,
  flattenPaper,
} from "./bots/paper.ts";
export { botBlueprint, parseBotBlueprints } from "./bots/blueprint.ts";
export type { BotBlueprint } from "./bots/blueprint.ts";
export {
  gridChartLevels,
  GRID_PRESETS,
  gridFeePadPct,
  applyGridPreset,
} from "./bots/strategies/grid.ts";
export type { GridChartLevel } from "./bots/strategies/grid.ts";
export { mtfIntervalsOf, resampleCandles } from "./bots/strategies/mtf.ts";
