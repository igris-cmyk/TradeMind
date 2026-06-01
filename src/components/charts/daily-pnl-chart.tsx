"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyPnlChartProps {
  data: Array<{
    date: string;
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

export function DailyPnlChart({ data }: DailyPnlChartProps) {
  if (!data?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily P&L</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                stroke="#3F3F46"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#3F3F46"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(99, 102, 241, 0.03)" }}
                contentStyle={tooltipStyle}
                formatter={(value?: number | string | readonly (number | string)[]) => [`$${Number(value ?? 0).toFixed(2)}`, "P&L"]}
                labelStyle={{ color: "#71717A", fontSize: "11px" }}
              />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={32}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10B981" : "#F43F5E"}
                    fillOpacity={0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
