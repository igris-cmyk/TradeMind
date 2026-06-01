"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const chartLoading = (height = "h-64") => (
  <div className="glass-card rounded-xl p-4">
    <LoadingSkeleton variant="chart" className={height} />
  </div>
);

export const DailyPnlChartLazy = dynamic(
  () => import("@/components/charts/daily-pnl-lwc").then((m) => m.DailyPnlLwc),
  { ssr: false, loading: () => chartLoading() }
);

export const WinRateChartLazy = dynamic(
  () => import("@/components/charts/win-rate-chart").then((m) => m.WinRateChart),
  { ssr: false, loading: () => chartLoading("h-56") }
);

export const DirectionChartLazy = dynamic(
  () => import("@/components/charts/direction-chart").then((m) => m.DirectionChart),
  { ssr: false, loading: () => chartLoading("h-56") }
);

export const CalendarHeatmapLazy = dynamic(
  () => import("@/components/charts/calendar-heatmap").then((m) => m.CalendarHeatmap),
  { ssr: false, loading: () => chartLoading("h-48") }
);
