"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { chartTheme, baseChartOptions } from "@/lib/chart-theme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

export function BehavioralTimeline({ data }: { data: Array<Record<string, unknown>> }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data?.length) return;

    const chart = createChart(chartContainerRef.current, {
      ...baseChartOptions(),
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: chartTheme.text,
        fontFamily: "var(--font-geist-sans), sans-serif",
      },
    });

    const series = chart.addAreaSeries({
      lineColor: "rgba(167, 139, 250, 1)", // Primary-400
      topColor: "rgba(167, 139, 250, 0.4)",
      bottomColor: "rgba(167, 139, 250, 0.0)",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 0, minMove: 1 },
    });

    // Format data and ensure uniqueness/sorting
    const formattedData = data
      .map(d => ({
        time: Math.floor(new Date(d.createdAt as string | number | Date).getTime() / 1000) as UTCTimestamp,
        value: (d.disciplineScore as number | null) ?? 50,
      }))
      .sort((a, b) => a.time - b.time);

    // Deduplicate timestamps
    const uniqueData = [];
    let lastTime = 0;
    for (const d of formattedData) {
      if (d.time <= lastTime) {
        d.time = (lastTime + 1) as UTCTimestamp;
      }
      lastTime = d.time;
      uniqueData.push(d);
    }

    series.setData(uniqueData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary-400" />
          Behavioral Timeline System™
        </CardTitle>
        <CardDescription className="text-xs">
          Your discipline score evolution over time. Consistent &gt;70 indicates institutional-grade control.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(data && data.length > 0) ? (
          <div ref={chartContainerRef} className="h-[250px] w-full" />
        ) : (
          <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
            Not enough data to plot timeline. Keep journaling.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
