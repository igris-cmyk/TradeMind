"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, type Time } from "lightweight-charts";
import { chartTheme, baseChartOptions } from "@/lib/chart-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DisciplineHistoryChartProps {
  data: Array<{ date: string; score: number }>;
}

export function DisciplineHistoryChart({ data }: DisciplineHistoryChartProps) {
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

    const series = chart.addLineSeries({
      color: chartTheme.primary,
      lineWidth: 2,
    });

    // Ensure strictly unique ascending time values
    const sortedData = [...data].sort((a, b) => {
      const tA = new Date(a.date || 0).getTime();
      const tB = new Date(b.date || 0).getTime();
      return tA - tB;
    });

    let prevTime = 0;
    const chartData = sortedData.map((d) => {
      let time = Math.floor(new Date(d.date || Date.now()).getTime() / 1000);
      if (time <= prevTime) time = prevTime + 1;
      prevTime = time;
      return {
        time: time as Time,
        value: d.score,
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

  if (!data.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Discipline Score History</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-[160px] w-full" aria-label="Discipline score over time" />
      </CardContent>
    </Card>
  );
}
