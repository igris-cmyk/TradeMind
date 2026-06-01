"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DirectionChartProps {
  data: Array<{
    name: string;
    total: number;
    wins: number;
    pnl: number;
  }>;
}

const tooltipStyle = {
  background: "rgba(15, 17, 25, 0.92)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#FAFAFA",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  padding: "8px 12px",
};

export function DirectionChart({ data }: DirectionChartProps) {
  if (!data?.length || data.every((d) => d.total === 0)) return null;

  const chartData = data.map((d) => ({
    name: d.name,
    value: d.total,
    winRate: d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0,
    pnl: d.pnl,
  }));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Direction Split</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="colorLong" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="colorShort" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "url(#colorLong)" : "url(#colorShort)"} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value?: number | string | readonly (number | string)[], name?: string | number) => [`${value}`, `${name ?? ""}`]}
                  labelStyle={{ color: "#71717A", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-1">
            {data.map((d, i) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ 
                      background: i === 0 ? "linear-gradient(135deg, #34D399, #059669)" : "linear-gradient(135deg, #FB7185, #E11D48)"
                    }} />
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground">{d.total}</span>
                </div>
                <div className="flex items-center gap-3 pl-[18px]">
                  <span className="text-[11px] text-muted-foreground">
                    WR: <span className={cn(
                      "font-semibold",
                      d.total > 0 && (d.wins / d.total) >= 0.5 ? "text-accent-green" : "text-accent-red"
                    )}>
                      {d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0}%
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    P&L: <span className={cn(
                      "font-semibold font-mono tabular-nums",
                      d.pnl >= 0 ? "text-accent-green" : "text-accent-red"
                    )}>
                      {d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
