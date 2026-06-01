"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, type Time } from "lightweight-charts";
import { chartTheme, baseChartOptions, pnlColor } from "@/lib/chart-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyPnlLwcProps {
  data: Array<{ date: string; fullDate?: string; pnl: number }>;
}

export function DailyPnlLwc({ data }: DailyPnlLwcProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const chart = createChart(containerRef.current, {
      ...baseChartOptions(),
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: chartTheme.text,
        fontFamily: chartTheme.fontFamily,
      },
    });

    const series = chart.addHistogramSeries({
      priceFormat: { type: "custom", formatter: (p: number) => `$${p.toFixed(0)}` },
    });

    // Ensure strictly unique ascending time values
    const sortedData = [...data].sort((a, b) => {
      const tA = new Date(a.fullDate || a.date || 0).getTime();
      const tB = new Date(b.fullDate || b.date || 0).getTime();
      return tA - tB;
    });

    let prevTime = 0;
    const chartData = sortedData.map((d) => {
      let time = Math.floor(new Date(d.fullDate || d.date || Date.now()).getTime() / 1000);
      if (time <= prevTime) time = prevTime + 1;
      prevTime = time;
      return {
        time: time as Time,
        value: d.pnl,
        color: pnlColor(d.pnl),
      };
    });

    series.setData(chartData);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data]);

  if (!data?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily P&L</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-[280px] w-full min-h-[280px]" />
      </CardContent>
    </Card>
  );
}
