"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PerformanceTableProps {
  data: Array<{
    name: string;
    winRate: number;
    pnl: number;
    total: number;
  }>;
  title: string;
  icon?: React.ReactNode;
}

export function PerformanceTable({ data, title, icon }: PerformanceTableProps) {
  if (!data?.length) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[1fr_70px_80px_50px] gap-2 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Name</span>
            <span className="text-right">Win Rate</span>
            <span className="text-right">P&L</span>
            <span className="text-right">Trades</span>
          </div>

          {/* Rows */}
          {data.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[1fr_70px_80px_50px] gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-colors items-center"
            >
              <span className="text-sm font-medium truncate">{item.name}</span>
              <div className="text-right">
                <span className={cn(
                  "text-xs font-mono font-semibold",
                  item.winRate >= 60 ? "text-accent-green" :
                  item.winRate >= 45 ? "text-accent-yellow" :
                  "text-accent-red"
                )}>
                  {item.winRate}%
                </span>
              </div>
              <span className={cn(
                "text-xs font-mono font-semibold text-right",
                item.pnl >= 0 ? "text-accent-green" : "text-accent-red"
              )}>
                {item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground text-right font-mono">
                {item.total}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
