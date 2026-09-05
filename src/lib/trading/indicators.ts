import type { Candle } from "./types";

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] ?? 0;
    if (i >= period) sum -= values[i - period] ?? 0;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += values[j] ?? 0;
      prev = sum / period;
    } else {
      prev = v * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

export function bollinger(values: number[], period = 20, mult = 2) {
  const mid = sma(values, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    const m = mid[i];
    if (m == null || i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = (values[j] ?? 0) - m;
      variance += d * d;
    }
    const sd = Math.sqrt(variance / period);
    upper.push(m + mult * sd);
    lower.push(m - mult * sd);
  }
  return { mid, upper, lower };
}

export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [];
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      out.push(null);
      continue;
    }
    const ch = (values[i] ?? 0) - (values[i - 1] ?? 0);
    const gain = Math.max(ch, 0);
    const loss = Math.max(-ch, 0);
    if (i <= period) {
      avgGain += gain;
      avgLoss += loss;
      if (i < period) {
        out.push(null);
        continue;
      }
      avgGain /= period;
      avgLoss /= period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out.push(100 - 100 / (1 + rs));
  }
  return out;
}

export function macd(values: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const line: (number | null)[] = values.map((_, i) => {
    const a = emaFast[i];
    const b = emaSlow[i];
    return a != null && b != null ? a - b : null;
  });
  const compact = line.map((v) => v ?? 0);
  const signalLine = ema(compact, signal).map((v, i) => (line[i] == null ? null : v));
  const hist = line.map((v, i) => {
    const s = signalLine[i];
    return v != null && s != null ? v - s : null;
  });
  return { line, signal: signalLine, hist };
}

export function vwap(candles: Candle[]): (number | null)[] {
  const out: (number | null)[] = [];
  let pv = 0;
  let vol = 0;
  for (const c of candles) {
    const typical = (c.high + c.low + c.close) / 3;
    pv += typical * c.volume;
    vol += c.volume;
    out.push(vol > 0 ? pv / vol : null);
  }
  return out;
}

export function atr(candles: Candle[], period = 14): (number | null)[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    if (i === 0) {
      tr.push(c.high - c.low);
      continue;
    }
    const prev = candles[i - 1]!.close;
    tr.push(Math.max(c.high - c.low, Math.abs(c.high - prev), Math.abs(c.low - prev)));
  }
  return sma(tr, period);
}

export function stochastic(candles: Candle[], n = 14, dPeriod = 3) {
  const k: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < n - 1) {
      k.push(null);
      continue;
    }
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - n + 1; j <= i; j++) {
      hi = Math.max(hi, candles[j]!.high);
      lo = Math.min(lo, candles[j]!.low);
    }
    const den = hi - lo;
    k.push(den === 0 ? 50 : ((candles[i]!.close - lo) / den) * 100);
  }
  const compact = k.map((v) => v ?? 50);
  const d = sma(compact, dPeriod).map((v, i) => (k[i] == null ? null : v));
  return { k, d };
}

export function donchian(candles: Candle[], n = 20) {
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < n - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - n + 1; j <= i; j++) {
      hi = Math.max(hi, candles[j]!.high);
      lo = Math.min(lo, candles[j]!.low);
    }
    upper.push(hi);
    lower.push(lo);
  }
  return { upper, lower };
}

export function supertrend(candles: Candle[], period = 10, mult = 3) {
  const atrs = atr(candles, period);
  const line: (number | null)[] = [];
  const dir: ("up" | "down" | null)[] = [];
  let prevLine: number | null = null;
  let prevDir: "up" | "down" = "up";
  for (let i = 0; i < candles.length; i++) {
    const a = atrs[i];
    const c = candles[i]!;
    if (a == null) {
      line.push(null);
      dir.push(null);
      continue;
    }
    const mid = (c.high + c.low) / 2;
    const up = mid + mult * a;
    const dn = mid - mult * a;
    let d: "up" | "down" = prevDir;
    let l = prevDir === "up" ? dn : up;
    if (prevLine != null) {
      if (prevDir === "up") {
        l = Math.max(dn, prevLine);
        if (c.close < l) d = "down";
      } else {
        l = Math.min(up, prevLine);
        if (c.close > l) d = "up";
      }
    }
    prevLine = d === "up" ? (d === prevDir ? l : dn) : d === prevDir ? l : up;
    if (d !== prevDir) prevLine = d === "up" ? dn : up;
    prevDir = d;
    line.push(prevLine);
    dir.push(d);
  }
  return { line, dir };
}

export function zscore(values: number[], period = 20): (number | null)[] {
  const mid = sma(values, period);
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    const m = mid[i];
    if (m == null) {
      out.push(null);
      continue;
    }
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = (values[j] ?? 0) - m;
      v += d * d;
    }
    const sd = Math.sqrt(v / period);
    out.push(sd === 0 ? 0 : ((values[i] ?? 0) - m) / sd);
  }
  return out;
}

export function roc(values: number[], period = 12): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      out.push(null);
      continue;
    }
    const prev = values[i - period] ?? 0;
    const cur = values[i] ?? 0;
    out.push(prev > 0 ? ((cur - prev) / prev) * 100 : null);
  }
  return out;
}

export function cci(candles: Candle[], period = 20): (number | null)[] {
  const tp = candles.map((c) => (c.high + c.low + c.close) / 3);
  const mid = sma(tp, period);
  const out: (number | null)[] = [];
  for (let i = 0; i < tp.length; i++) {
    const m = mid[i];
    if (m == null) {
      out.push(null);
      continue;
    }
    let mad = 0;
    for (let j = i - period + 1; j <= i; j++) mad += Math.abs((tp[j] ?? 0) - m);
    mad /= period;
    out.push(mad === 0 ? 0 : ((tp[i] ?? 0) - m) / (0.015 * mad));
  }
  return out;
}

export function keltner(candles: Candle[], period = 20, mult = 1.5) {
  const typical = candles.map((c) => (c.high + c.low + c.close) / 3);
  const mid = ema(typical, period);
  const a = atr(candles, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    const m = mid[i];
    const av = a[i];
    if (m == null || av == null) {
      upper.push(null);
      lower.push(null);
    } else {
      upper.push(m + mult * av);
      lower.push(m - mult * av);
    }
  }
  return { mid, upper, lower };
}

export function adx(candles: Candle[], period = 14) {
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    if (i === 0) {
      plusDM.push(0);
      minusDM.push(0);
      tr.push(c.high - c.low);
      continue;
    }
    const p = candles[i - 1]!;
    const up = c.high - p.high;
    const down = p.low - c.low;
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
    tr.push(Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)));
  }
  const wilder = (arr: number[]) => {
    const out: (number | null)[] = [];
    let prev = 0;
    for (let i = 0; i < arr.length; i++) {
      if (i < period) {
        prev += arr[i]!;
        out.push(i === period - 1 ? prev : null);
        continue;
      }
      prev = prev - prev / period + arr[i]!;
      out.push(prev);
    }
    return out;
  };
  const str = wilder(tr);
  const sp = wilder(plusDM);
  const smn = wilder(minusDM);
  const plusDI: (number | null)[] = [];
  const minusDI: (number | null)[] = [];
  const dx: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    const t = str[i];
    const p = sp[i];
    const m = smn[i];
    if (t == null || p == null || m == null || !(t > 0)) {
      plusDI.push(null);
      minusDI.push(null);
      dx.push(null);
      continue;
    }
    const pdi = (100 * p) / t;
    const mdi = (100 * m) / t;
    plusDI.push(pdi);
    minusDI.push(mdi);
    const den = pdi + mdi;
    dx.push(den === 0 ? 0 : (100 * Math.abs(pdi - mdi)) / den);
  }
  const adxLine: (number | null)[] = [];
  let acc = 0;
  let seeded = 0;
  let prevAdx: number | null = null;
  for (let i = 0; i < dx.length; i++) {
    const v = dx[i];
    if (v == null) {
      adxLine.push(null);
      continue;
    }
    if (prevAdx == null) {
      acc += v;
      seeded += 1;
      if (seeded < period) {
        adxLine.push(null);
        continue;
      }
      prevAdx = acc / period;
      adxLine.push(prevAdx);
    } else {
      prevAdx = (prevAdx * (period - 1) + v) / period;
      adxLine.push(prevAdx);
    }
  }
  return { adx: adxLine, plusDI, minusDI };
}

export function williamsR(candles: Candle[], n = 14): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < n - 1) {
      out.push(null);
      continue;
    }
    let hi = -Infinity;
    let lo = Infinity;
    for (let j = i - n + 1; j <= i; j++) {
      hi = Math.max(hi, candles[j]!.high);
      lo = Math.min(lo, candles[j]!.low);
    }
    const den = hi - lo;
    out.push(den === 0 ? -50 : ((hi - candles[i]!.close) / den) * -100);
  }
  return out;
}

function midHL(candles: Candle[], period: number, i: number): number | null {
  if (i < period - 1) return null;
  let hi = -Infinity;
  let lo = Infinity;
  for (let j = i - period + 1; j <= i; j++) {
    hi = Math.max(hi, candles[j]!.high);
    lo = Math.min(lo, candles[j]!.low);
  }
  return (hi + lo) / 2;
}

export function ichimoku(candles: Candle[], tenkanN = 9, kijunN = 26) {
  const tenkan: (number | null)[] = [];
  const kijun: (number | null)[] = [];
  const senkouA: (number | null)[] = [];
  const senkouB: (number | null)[] = [];
  const span = 52;
  for (let i = 0; i < candles.length; i++) {
    const t = midHL(candles, tenkanN, i);
    const k = midHL(candles, kijunN, i);
    tenkan.push(t);
    kijun.push(k);
    senkouA.push(t != null && k != null ? (t + k) / 2 : null);
    senkouB.push(midHL(candles, span, i));
  }
  return { tenkan, kijun, senkouA, senkouB };
}

export function psar(candles: Candle[], step = 0.02, maxAf = 0.2) {
  const sar: (number | null)[] = [];
  const dir: ("up" | "down" | null)[] = [];
  if (candles.length === 0) return { sar, dir };
  let up = candles[1] ? candles[1].close >= candles[0]!.close : true;
  let af = step;
  let ep = up ? candles[0]!.high : candles[0]!.low;
  let acc = up ? candles[0]!.low : candles[0]!.high;
  sar.push(acc);
  dir.push(up ? "up" : "down");
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]!;
    acc = up ? acc + af * (ep - acc) : acc - af * (acc - ep);
    if (up) {
      if (candles[i - 1]) acc = Math.min(acc, candles[i - 1]!.low);
      if (i >= 2) acc = Math.min(acc, candles[i - 2]!.low);
    } else {
      if (candles[i - 1]) acc = Math.max(acc, candles[i - 1]!.high);
      if (i >= 2) acc = Math.max(acc, candles[i - 2]!.high);
    }
    let flipped = false;
    if (up && c.low < acc) {
      up = false;
      acc = ep;
      ep = c.low;
      af = step;
      flipped = true;
    } else if (!up && c.high > acc) {
      up = true;
      acc = ep;
      ep = c.high;
      af = step;
      flipped = true;
    }
    if (!flipped) {
      if (up && c.high > ep) {
        ep = c.high;
        af = Math.min(maxAf, af + step);
      } else if (!up && c.low < ep) {
        ep = c.low;
        af = Math.min(maxAf, af + step);
      }
    }
    sar.push(acc);
    dir.push(up ? "up" : "down");
  }
  return { sar, dir };
}

export function heikinAshi(candles: Candle[]): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    const haClose = (c.open + c.high + c.low + c.close) / 4;
    const prev = out[i - 1];
    const haOpen = prev ? (prev.open + prev.close) / 2 : (c.open + c.close) / 2;
    out.push({
      time: c.time,
      open: haOpen,
      high: Math.max(c.high, haOpen, haClose),
      low: Math.min(c.low, haOpen, haClose),
      close: haClose,
      volume: c.volume,
    });
  }
  return out;
}

export type IndicatorId = "ema" | "bb" | "vwap" | "rsi" | "macd" | "atr" | "stoch" | "none";

