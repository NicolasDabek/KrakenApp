import { Activity, ArrowUpRight, BadgeCheck, BarChart3, Combine, Cloud, Compass, Crosshair, Flame, Gauge, Grip, Layers, LineChart, Milestone, Navigation, Repeat, Rocket, Split, Target, Volume2, Zap } from "lucide-react";
import type { BotKind } from "@/lib/trading/types";

export const KIND_ICON: Record<BotKind, typeof Grip> = {
  grid: Grip,
  dca: Repeat,
  rsi: Activity,
  macd: BarChart3,
  stoch: Gauge,
  vwap: Milestone,
  breakout: Rocket,
  supertrend: Compass,
  volume: Volume2,
  scalp: Zap,
  cci: Crosshair,
  meanrev: Target,
  keltner: Layers,
  roc: ArrowUpRight,
  adx: Navigation,
  ichimoku: Cloud,
  sma: LineChart,
  engulf: Flame,
  div: Split,
  confirm: BadgeCheck,
  mtf: Combine,
};
