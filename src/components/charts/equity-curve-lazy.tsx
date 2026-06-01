"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const EquityChartLwc = dynamic(
  () =>
    import("@/components/charts/equity-chart-lwc").then((m) => m.EquityChartLwc),
  {
    ssr: false,
    loading: () => (
      <div className="glass-card rounded-xl p-6">
        <LoadingSkeleton variant="chart" className="h-[280px]" />
      </div>
    ),
  }
);

interface EquityCurveLazyProps {
  data: Array<{
    date: string;
    fullDate?: string;
    cumPnl: number;
    pnl: number;
    pair: string;
  }>;
}

export function EquityCurveLazy({ data }: EquityCurveLazyProps) {
  if (!data?.length) return null;
  return <EquityChartLwc data={data} />;
}
