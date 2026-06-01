"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EquityCurveProps {
  data: Array<{
    date: string;
    cumPnl: number;
    pnl: number;
    pair: string;
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

export function EquityCurve({ data }: EquityCurveProps) {
  if (!data?.length) return null;

  const isPositive = data[data.length - 1]?.cumPnl >= 0;
  const lineColor = isPositive ? "#10B981" : "#F43F5E";

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Equity Curve</CardTitle>
          <span className={`text-xs font-mono font-semibold tabular-nums ${isPositive ? "text-accent-green" : "text-accent-red"}`}>
            {isPositive ? "+" : ""}${data[data.length - 1]?.cumPnl.toFixed(2)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
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
                cursor={{ stroke: "rgba(99, 102, 241, 0.15)", strokeWidth: 1 }}
                contentStyle={tooltipStyle}
                formatter={(value?: number | string | readonly (number | string)[]) => [`$${Number(value ?? 0).toFixed(2)}`, "Equity"]}
                labelStyle={{ color: "#71717A", fontSize: "11px" }}
              />
              <Area
                type="monotone"
                dataKey="cumPnl"
                stroke={lineColor}
                strokeWidth={1.5}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
