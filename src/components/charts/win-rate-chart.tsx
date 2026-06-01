"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WinRateChartProps {
  data: Array<{
    name: string;
    winRate: number;
    wins: number;
    losses: number;
    total: number;
  }>;
  title: string;
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

export function WinRateChart({ data, title }: WinRateChartProps) {
  if (!data?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#3F3F46"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#3F3F46"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "rgba(99, 102, 241, 0.03)" }}
                contentStyle={tooltipStyle}
                formatter={(value?: number | string | readonly (number | string)[], name?: string | number) => {
                  if (name === "winRate") return [`${value}%`, "Win Rate"];
                  return [`${value}`, `${name ?? ""}`];
                }}
                labelStyle={{ color: "#71717A", fontSize: "11px" }}
              />
              <Bar
                dataKey="winRate"
                fill="#6366F1"
                radius={[0, 3, 3, 0]}
                maxBarSize={24}
                fillOpacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
