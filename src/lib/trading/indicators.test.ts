import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  adx,
  atr,
  bollinger,
  cci,
  donchian,
  ema,
  heikinAshi,
  ichimoku,
  keltner,
  macd,
  mfi,
  obv,
  psar,
  roc,
  rsi,
  sma,
  stochastic,
  supertrend,
  vwap,
  williamsR,
  zscore,
} from "./indicators.ts";
import type { Candle } from "./types.ts";

function candlesFrom(closes: number[], volume = 10): Candle[] {
  return closes.map((close, i) => {
    const open = i === 0 ? close : closes[i - 1]!;
    const high = Math.max(open, close) + 0.5;
    const low = Math.min(open, close) - 0.5;
    return {
      time: 1_700_000_000 + i * 60,
      open,
      high,
      low,
      close,
      volume,
    };
  });
}

const lastNum = (arr: (number | null)[]) => {
  const v = arr[arr.length - 1];
  assert.ok(v != null && Number.isFinite(v), "expected a numeric last value");
  return v;
};

describe("sma / ema / rsi / macd", () => {
  it("computes a trailing simple average", () => {
    const out = sma([1, 2, 3, 4, 5], 3);
    assert.deepEqual(out, [null, null, 2, 3, 4]);
  });

  it("seeds EMA on the SMA then decays", () => {
    const out = ema([1, 2, 3, 4, 5], 3);
    assert.equal(out[0], null);
    assert.equal(out[1], null);
    assert.equal(out[2], 2);
    const k = 2 / 4;
    assert.ok(Math.abs((out[3] ?? 0) - (4 * k + 2 * (1 - k))) < 1e-12);
  });

  it("pushes RSI toward 100 on a pure rally and toward 0 on a dump", () => {
    const up = rsi(Array.from({ length: 40 }, (_, i) => 10 + i), 14);
    const down = rsi(Array.from({ length: 40 }, (_, i) => 50 - i), 14);
    assert.ok(lastNum(up) > 90);
    assert.ok(lastNum(down) < 10);
  });

  it("builds a MACD line, signal and histogram of equal length", () => {
    const values = Array.from({ length: 80 }, (_, i) => 100 + Math.sin(i / 4) * 5);
    const m = macd(values);
    assert.equal(m.line.length, values.length);
    assert.equal(m.signal.length, values.length);
    assert.equal(m.hist.length, values.length);
    assert.ok(m.line.slice(-1)[0] != null);
  });

  it("flips MACD histogram sign on a dump-then-rally", () => {
    const dump = Array.from({ length: 40 }, (_, i) => 120 - i);
    const rally = Array.from({ length: 40 }, (_, i) => 80 + i * 1.4);
    const m = macd([...dump, ...rally], 5, 13, 5);
    const last = m.hist[m.hist.length - 1];
    const mid = m.hist[40];
    assert.ok(mid != null && last != null);
    assert.ok(mid < 0);
    assert.ok(last > 0);
  });
});

describe("bands, oscillators, trend", () => {
  const wave = Array.from({ length: 80 }, (_, i) => 100 + Math.sin(i / 5) * 8);
  const cs = candlesFrom(wave);

  it("places Bollinger bands around the SMA", () => {
    const bb = bollinger(wave, 20, 2);
    const i = wave.length - 1;
    assert.ok(bb.lower[i]! < bb.mid[i]!);
    assert.ok(bb.upper[i]! > bb.mid[i]!);
  });

  it("tracks VWAP as volume-weighted typical price", () => {
    const v = vwap(cs);
    assert.equal(v.length, cs.length);
    assert.ok(lastNum(v) > 0);
  });

  it("keeps ATR positive on ranging candles", () => {
    assert.ok(lastNum(atr(cs, 14)) > 0);
  });

  it("computes stochastic %K/%D in 0..100", () => {
    const s = stochastic(cs, 14, 3);
    const k = lastNum(s.k);
    const d = lastNum(s.d);
    assert.ok(k >= 0 && k <= 100);
    assert.ok(d >= 0 && d <= 100);
  });

  it("exposes Donchian highs and lows", () => {
    const d = donchian(cs, 20);
    assert.ok(lastNum(d.upper) >= lastNum(d.lower));
  });

  it("flips Supertrend direction on a long move", () => {
    const up = candlesFrom(Array.from({ length: 60 }, (_, i) => 50 + i));
    const st = supertrend(up, 10, 3);
    assert.equal(st.dir[st.dir.length - 1], "up");
  });

  it("returns z-score 0 on a flat series and ROC on a trend", () => {
    const z = zscore(Array.from({ length: 30 }, () => 7), 20);
    assert.equal(lastNum(z), 0);
    const r = roc(Array.from({ length: 20 }, (_, i) => 100 + i), 10);
    assert.ok(lastNum(r) > 0);
  });

  it("computes CCI, Keltner, ADX, Williams, Ichimoku, PSAR, MFI", () => {
    assert.ok(Number.isFinite(lastNum(cci(cs, 20))));
    const kc = keltner(cs, 20, 1.5);
    assert.ok(lastNum(kc.upper) > lastNum(kc.lower));
    const a = adx(cs, 14);
    assert.ok(lastNum(a.adx) >= 0);
    const wr = lastNum(williamsR(cs, 14));
    assert.ok(wr <= 0 && wr >= -100);
    const ich = ichimoku(cs);
    assert.ok(ich.tenkan[ich.tenkan.length - 1] != null);
    const p = psar(cs);
    assert.ok(p.sar[p.sar.length - 1] != null);
    assert.ok(p.dir[p.dir.length - 1] === "up" || p.dir[p.dir.length - 1] === "down");
    const mf = mfi(cs, 14);
    const lastMfi = lastNum(mf);
    assert.ok(lastMfi >= 0 && lastMfi <= 100);
  });

  it("smooths Heikin-Ashi opens from the previous HA candle", () => {
    const ha = heikinAshi(cs);
    assert.equal(ha.length, cs.length);
    const i = 4;
    const prev = ha[i - 1]!;
    const cur = ha[i]!;
    assert.ok(Math.abs(cur.open - (prev.open + prev.close) / 2) < 1e-9);
  });

  it("returns empty or null series on degenerate input", () => {
    assert.deepEqual(sma([], 3), []);
    assert.deepEqual(ema([1], 5), [null]);
    assert.ok(rsi([1, 2], 14).every((v) => v == null));
    assert.deepEqual(vwap([]), []);
    assert.equal(heikinAshi([]).length, 0);
    const emptyPsar = psar([]);
    assert.equal(emptyPsar.sar.length, 0);
    const z = zscore([1, 1, 1], 5);
    assert.ok(z.every((v) => v == null));
    const r = roc([10, 0, 12], 1);
    assert.equal(r[2], null);
  });

  it("pins MFI at 100 on a pure inflow and stochastic at 50 on a flat range", () => {
    const up = candlesFrom(Array.from({ length: 20 }, (_, i) => 10 + i), 5);
    const mf = mfi(up, 10);
    assert.equal(mf[mf.length - 1], 100);
    const flat = candlesFrom(Array.from({ length: 20 }, () => 50));
    const st = stochastic(flat, 14, 3);
    assert.equal(st.k[st.k.length - 1], 50);
    const wr = williamsR(flat, 14);
    assert.equal(wr[wr.length - 1], -50);
  });

  it("accumulates OBV on up-closes and subtracts on down-closes", () => {
    const cs = candlesFrom([10, 11, 12, 11]);
    cs[1]!.volume = 5;
    cs[2]!.volume = 3;
    cs[3]!.volume = 4;
    const series = obv(cs);
    assert.equal(series[0], 0);
    assert.equal(series[1], 5);
    assert.equal(series[2], 8);
    assert.equal(series[3], 4);
  });
});
