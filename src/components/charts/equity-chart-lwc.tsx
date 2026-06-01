"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type AreaData,
  type Time,
} from "lightweight-charts";
import { chartTheme, baseChartOptions, pnlColor } from "@/lib/chart-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EquityChartLwcProps {
  data: Array<{
    date: string;
    fullDate?: string;
    cumPnl: number;
    pnl: number;
    pair: string;
  }>;
}

export function EquityChartLwc({ data }: EquityChartLwcProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  const lastPnl = data[data.length - 1]?.cumPnl ?? 0;
  const isPositive = lastPnl >= 0;
  const lineColor = pnlColor(lastPnl);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const chart = createChart(containerRef.current, {
      ...baseChartOptions(),
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: chartTheme.text,
        fontFamily: chartTheme.fontFamily,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addAreaSeries({
      lineColor,
      topColor: isPositive ? chartTheme.positiveFill : chartTheme.negativeFill,
      bottomColor: "rgba(0, 0, 0, 0)",
      lineWidth: 2,
      crosshairMarkerVisible: true,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `$${price.toFixed(2)}`,
      },
    });

    // Ensure data is sorted ascending and timestamps are strictly unique numbers (seconds)
    const sortedData = [...data].sort((a, b) => {
      const tA = new Date(a.fullDate || a.date || 0).getTime();
      const tB = new Date(b.fullDate || b.date || 0).getTime();
      return tA - tB;
    });

    let prevTime = 0;
    const chartData: AreaData<Time>[] = sortedData.map((d) => {
      // Lightweight charts needs unix timestamps in seconds for intraday data
      let time = Math.floor(new Date(d.fullDate || d.date || Date.now()).getTime() / 1000);
      
      // Enforce strictly ascending time values to satisfy library assertions
      if (time <= prevTime) {
        time = prevTime + 1;
      }
      prevTime = time;

      return {
        time: time as Time,
        value: d.cumPnl,
      };
    });

    series.setData(chartData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, isPositive, lineColor]);

  if (!data?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Equity Curve</CardTitle>
          <span
            className={`text-xs font-mono font-semibold tabular-nums ${
              isPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isPositive ? "+" : ""}${lastPnl.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="h-[280px] w-full min-h-[280px]"
          role="img"
          aria-label="Equity curve chart"
        />
      </CardContent>
    </Card>
  );
}
