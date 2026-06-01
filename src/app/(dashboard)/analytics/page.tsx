"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Target, Brain } from "lucide-react";
import { useTradeAnalytics } from "@/hooks/use-queries";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { EquityCurveLazy } from "@/components/charts/equity-curve-lazy";
import {
  DailyPnlChartLazy,
  WinRateChartLazy,
  DirectionChartLazy,
  CalendarHeatmapLazy,
} from "@/components/charts/analytics-charts-lazy";
import { PerformanceTable } from "@/components/charts/performance-table";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TIME_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "All", days: 365 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useTradeAnalytics(days);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton variant="text" className="h-7 w-32" />
        <div className="grid lg:grid-cols-2 gap-4">
          <LoadingSkeleton variant="chart" />
          <LoadingSkeleton variant="chart" />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" className="h-56" />
          <LoadingSkeleton variant="card" className="h-56" />
          <LoadingSkeleton variant="card" className="h-56" />
        </div>
      </div>
    );
  }

  if (!data || data.totalTrades === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-xs mt-0.5">In-depth trading performance analysis</p>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No analytics data"
          description="Start logging trades to see performance charts, win rates, and psychology correlations."
          actionLabel="Log Your First Trade"
          onAction={() => window.location.href = "/trades/new"}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {data.totalTrades} trades analysed
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
          {TIME_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setDays(range.days)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150",
                days === range.days
                  ? "bg-primary/15 text-primary-300 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Row 1: Equity Curve + Daily P&L */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-4">
        <EquityCurveLazy data={data.equityCurve} />
        <DailyPnlChartLazy data={data.dailyPnl} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <CalendarHeatmapLazy data={data.calendarData} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-4">
        <WinRateChartLazy data={data.winRateBySession} title="Win Rate by Session" />
        <DirectionChartLazy data={data.directionStats} />
      </motion.div>

      {/* Row 4: Performance Tables */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-4">
        <PerformanceTable
          data={data.pairPerformance}
          title="Pair Performance"
          icon={<BarChart3 className="h-4 w-4 text-primary-400" />}
        />
        <PerformanceTable
          data={data.strategyPerformance}
          title="Strategy Performance"
          icon={<Target className="h-4 w-4 text-primary-400" />}
        />
        <PerformanceTable
          data={data.emotionCorrelation}
          title="Emotion Correlation"
          icon={<Brain className="h-4 w-4 text-primary-400" />}
        />
      </motion.div>
    </motion.div>
  );
}
