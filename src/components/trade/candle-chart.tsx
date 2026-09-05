import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { fetchOhlc } from "@/lib/trading/functions";
import { atr, bollinger, ema, macd, rsi, stochastic, vwap, type IndicatorId } from "@/lib/trading/indicators";
import { INTERVALS, PAIR_BY_ID, type IntervalId } from "@/lib/trading/pairs";
import { useTradingStore } from "@/lib/trading/store";
import type { Candle } from "@/lib/trading/types";
import { cn } from "@/lib/utils";

const INDICATORS: { id: IndicatorId; label: string }[] = [
  { id: "none", label: "Off" },
  { id: "ema", label: "EMA" },
  { id: "bb", label: "BB" },
  { id: "vwap", label: "VWAP" },
  { id: "rsi", label: "RSI" },
  { id: "macd", label: "MACD" },
  { id: "atr", label: "ATR" },
  { id: "stoch", label: "Stoch" },
];

type SeriesBag = {
  chart: IChartApi;
  sub?: IChartApi;
  candle: ISeriesApi<"Candlestick">;
  vol: ISeriesApi<"Histogram">;
};

export function CandleChart({ pair }: { pair: string }) {
  const [interval, setIntervalId] = useState<IntervalId>(60);
  const [indicator, setIndicator] = useState<IndicatorId>("ema");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const host = useRef<HTMLDivElement>(null);
  const sub = useRef<HTMLDivElement>(null);
  const bag = useRef<SeriesBag | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const last = useTradingStore((s) => s.tickers[pair]?.last);

  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOhlc({ data: { pair, interval } })
      .then((rows) => {
        if (!cancelled) setCandles(rows);
      })
      .catch(() => {
        if (!cancelled) setCandles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pair, interval]);

  useEffect(() => {
    const el = host.current;
    if (!el || loading || candles.length < 2) return;
    let disposed = false;
    const ro = new ResizeObserver(() => {
      const node = host.current;
      if (bag.current && node) bag.current.chart.resize(node.clientWidth, node.clientHeight);
    });

    void (async () => {
      const lc = await import("lightweight-charts");
      if (disposed || !host.current) return;
      const node = host.current;
      const created = lc.createChart(node, {
        autoSize: true,
        layout: {
          background: { type: lc.ColorType.Solid, color: "#090A0C" },
          textColor: "#8B929E",
          fontFamily: "IBM Plex Sans, sans-serif",
          attributionLogo: false,
        },
        grid: {
          vertLines: { color: "#252A33" },
          horzLines: { color: "#252A33" },
        },
        rightPriceScale: { borderColor: "#252A33" },
        timeScale: { borderColor: "#252A33", timeVisible: interval < 1440, secondsVisible: false },
        crosshair: { mode: lc.CrosshairMode.Normal },
      });
      const candleSeries = created.addSeries(lc.CandlestickSeries, {
        upColor: "#2FBE8F",
        downColor: "#E85D6C",
        borderVisible: false,
        wickUpColor: "#2FBE8F",
        wickDownColor: "#E85D6C",
      });
      candleSeries.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );
      const vol = created.addSeries(lc.HistogramSeries, {
        priceScaleId: "vol",
        priceFormat: { type: "volume" },
      });
      created.priceScale("vol").applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } });
      vol.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? "rgba(47,190,143,0.35)" : "rgba(232,93,108,0.35)",
        })),
      );

      const closes = candles.map((c) => c.close);
      const overlay = (values: (number | null)[], color: string) => {
        const line = created.addSeries(lc.LineSeries, {
          color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        line.setData(
          candles.flatMap((c, i) => {
            const v = values[i];
            return v == null ? [] : [{ time: c.time as UTCTimestamp, value: v }];
          }),
        );
      };

      if (indicator === "ema") {
        overlay(ema(closes, 20), "#5B8CFF");
        overlay(ema(closes, 50), "#D4A054");
      }
      if (indicator === "bb") {
        const bb = bollinger(closes, 20, 2);
        overlay(bb.upper, "rgba(91,140,255,0.55)");
        overlay(bb.mid, "#5B8CFF");
        overlay(bb.lower, "rgba(91,140,255,0.55)");
      }
      if (indicator === "vwap") overlay(vwap(candles), "#D4A054");

      const pane = indicator === "rsi" || indicator === "macd" || indicator === "atr" || indicator === "stoch";
      let subChart: IChartApi | undefined;
      if (pane && sub.current) {
        subChart = lc.createChart(sub.current, {
          autoSize: true,
          layout: {
            background: { type: lc.ColorType.Solid, color: "#090A0C" },
            textColor: "#8B929E",
            fontFamily: "IBM Plex Sans, sans-serif",
            attributionLogo: false,
          },
          grid: { vertLines: { color: "#252A33" }, horzLines: { color: "#252A33" } },
          rightPriceScale: { borderColor: "#252A33" },
          timeScale: { visible: false, borderColor: "#252A33" },
        });
        created.timeScale().subscribeVisibleLogicalRangeChange((range) => {
          if (range) subChart?.timeScale().setVisibleLogicalRange(range);
        });
        if (indicator === "rsi") {
          const series = subChart.addSeries(lc.LineSeries, { color: "#5B8CFF", lineWidth: 1 });
          const values = rsi(closes, 14);
          series.setData(
            candles.flatMap((c, i) => {
              const v = values[i];
              return v == null ? [] : [{ time: c.time as UTCTimestamp, value: v }];
            }),
          );
        } else if (indicator === "macd") {
          const m = macd(closes);
          const hist = subChart.addSeries(lc.HistogramSeries, { priceLineVisible: false });
          hist.setData(
            candles.flatMap((c, i) => {
              const v = m.hist[i];
              return v == null
                ? []
                : [
                    {
                      time: c.time as UTCTimestamp,
                      value: v,
                      color: v >= 0 ? "rgba(47,190,143,0.7)" : "rgba(232,93,108,0.7)",
                    },
                  ];
            }),
          );
          const line = subChart.addSeries(lc.LineSeries, { color: "#5B8CFF", lineWidth: 1 });
          line.setData(
            candles.flatMap((c, i) => {
              const v = m.line[i];
              return v == null ? [] : [{ time: c.time as UTCTimestamp, value: v }];
            }),
          );
        } else if (indicator === "atr") {
          const series = subChart.addSeries(lc.LineSeries, { color: "#D4A054", lineWidth: 1 });
          const values = atr(candles, 14);
          series.setData(
            candles.flatMap((c, i) => {
              const v = values[i];
              return v == null ? [] : [{ time: c.time as UTCTimestamp, value: v }];
            }),
          );
        } else {
          const st = stochastic(candles);
          const kLine = subChart.addSeries(lc.LineSeries, { color: "#5B8CFF", lineWidth: 1 });
          kLine.setData(
            candles.flatMap((c, i) => {
              const v = st.k[i];
              return v == null ? [] : [{ time: c.time as UTCTimestamp, value: v }];
            }),
          );
          const dLine = subChart.addSeries(lc.LineSeries, { color: "#D4A054", lineWidth: 1 });
          dLine.setData(
            candles.flatMap((c, i) => {
              const v = st.d[i];
              return v == null ? [] : [{ time: c.time as UTCTimestamp, value: v }];
            }),
          );
        }
      }

      created.timeScale().fitContent();
      bag.current = { chart: created, sub: subChart, candle: candleSeries, vol };
      ro.observe(node);
    })();

    return () => {
      disposed = true;
      ro.disconnect();
      bag.current?.chart.remove();
      bag.current?.sub?.remove();
      bag.current = null;
    };
    // Recreate only when the fetched series or overlays change — not on live ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, pair, interval, indicator]);

  useEffect(() => {
    if (!last || !Number.isFinite(last)) return;
    const prev = candlesRef.current;
    if (prev.length === 0) return;
    const cur = prev[prev.length - 1]!;
    const step = interval * 60;
    const now = Math.floor(Date.now() / 1000);
    let next: Candle;
    if (now >= cur.time + step) {
      const newTime = cur.time + Math.floor((now - cur.time) / step) * step;
      next = { time: newTime, open: last, high: last, low: last, close: last, volume: 0 };
      candlesRef.current = [...prev, next];
    } else {
      if (cur.close === last) return;
      next = {
        ...cur,
        close: last,
        high: Math.max(cur.high, last),
        low: Math.min(cur.low, last),
      };
      candlesRef.current = [...prev.slice(0, -1), next];
    }
    try {
      bag.current?.candle.update({
        time: next.time as UTCTimestamp,
        open: next.open,
        high: next.high,
        low: next.low,
        close: next.close,
      });
    } catch {
      /* series not ready */
    }
  }, [last, interval]);

  const pane = indicator === "rsi" || indicator === "macd" || indicator === "atr" || indicator === "stoch";
  const meta = PAIR_BY_ID[pair];

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
        {INTERVALS.map((tf) => (
          <button
            key={tf.id}
            type="button"
            onClick={() => setIntervalId(tf.id)}
            className={cn(
              "h-8 shrink-0 rounded-sm px-2.5 text-xs font-medium",
              interval === tf.id ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {tf.label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        {INDICATORS.map((ind) => (
          <button
            key={ind.id}
            type="button"
            onClick={() => setIndicator(ind.id)}
            className={cn(
              "h-8 shrink-0 rounded-sm px-2.5 text-xs font-medium",
              indicator === ind.id ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {ind.label}
          </button>
        ))}
      </div>
      <div className="relative min-h-64 flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center text-sm text-muted-foreground">
            Chargement {meta?.display}…
          </div>
        )}
        <div ref={host} className={cn("w-full", pane ? "h-52" : "h-72")} />
        {pane && <div ref={sub} className="h-24 w-full border-t border-border" />}
      </div>
    </div>
  );
}
