"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Sparkles, ArrowUpRight, ArrowDownRight, BarChart3, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EquityCurveLazy } from "@/components/charts/equity-curve-lazy";
import { PatternAlerts } from "@/components/psychology/pattern-alerts";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTradeStats, useTrades, useTradeAnalytics } from "@/hooks/use-queries";
import { fadeUp, spring, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { data: stats, isLoading: statsLoading } = useTradeStats();
  const { data: tradesData, isLoading: tradesLoading } = useTrades({ limit: "5" });
  const { data: analyticsData } = useTradeAnalytics(30, { live: true });

  const statCards = [
    { label: "Total Trades", value: stats?.totalTrades ?? "—", icon: TrendingUp, color: "text-primary-400" },
    { label: "Win Rate", value: stats ? `${stats.winRate}%` : "—", icon: Target, color: "text-accent-green" },
    {
      label: "Total P&L",
      value: stats ? `${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}` : "—",
      icon: TrendingUp,
      color: stats?.totalPnl >= 0 ? "text-accent-green" : "text-accent-red",
    },
    { label: "Avg R:R", value: stats ? `1:${stats.avgRR}` : "—", icon: BarChart3, color: "text-accent-yellow" },
    {
      label: "Streak",
      value: stats ? (stats.currentStreak > 0 ? `${stats.currentStreak}W` : stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}L` : "0") : "—",
      icon: Flame,
      color: stats?.currentStreak > 0 ? "text-accent-green" : stats?.currentStreak < 0 ? "text-accent-red" : "text-primary-400",
    },
  ];

  const streakMessage = stats?.currentStreak > 2
    ? `🔥 You're on a ${stats.currentStreak}-day winning streak! Keep the discipline.`
    : stats?.currentStreak < -2
    ? `⚠️ ${Math.abs(stats.currentStreak)}-trade losing streak. Consider stepping back and reviewing your last entries.`
    : stats?.totalTrades > 0
    ? `📊 ${stats.totalTrades} trades logged. Your win rate is ${stats.winRate}%.`
    : null;

  return (
    <motion.div 
      className="space-y-6"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      {/* Welcome Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, <span className="gradient-text">{user?.name || "Trader"}</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here&apos;s your trading performance overview.
        </p>
      </motion.div>

      {/* Streak/Insight Banner */}
      {streakMessage && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
            <Sparkles className="h-4 w-4 text-primary-400 shrink-0" />
            <p className="text-sm text-primary-200">{streakMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        <Button className="gap-2" id="log-trade-btn" onClick={() => router.push("/trades/new")}>
          <Plus className="h-4 w-4" />
          Log Trade
        </Button>
        <Button variant="outline" className="gap-2" id="analytics-btn" onClick={() => router.push("/analytics")}>
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4">
                  <LoadingSkeleton variant="text" className="h-3 w-16 mb-2" />
                  <LoadingSkeleton variant="text" className="h-6 w-12" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                transition={spring.snappy}
              >
                <Card className="glass-card group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <stat.icon className={cn("h-3.5 w-3.5", stat.color, "opacity-60 group-hover:opacity-100 transition-opacity")} />
                    </div>
                    <p className={cn("text-xl font-bold font-mono tabular-nums", stat.color)}>
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      {/* Equity Curve */}
      {analyticsData?.equityCurve?.length > 0 && (
        <motion.div variants={fadeUp}>
          <EquityCurveLazy data={analyticsData.equityCurve} />
        </motion.div>
      )}

      {/* Proactive Pattern Alerts */}
      <motion.div variants={fadeUp}>
        <PatternAlerts />
      </motion.div>

      {/* Recent Trades & AI Insights */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-4">
        {/* Recent Trades */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Trades</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push("/trades")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {tradesLoading ? (
                <LoadingSkeleton variant="text" count={5} className="h-11" />
              ) : !tradesData?.trades?.length ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No trades yet"
                  description="Start logging trades to see your equity curve and performance analytics."
                  actionLabel="Log Your First Trade"
                  onAction={() => router.push("/trades/new")}
                />
              ) : (
                <div className="space-y-1">
                  {tradesData.trades.map((trade: Record<string, unknown>) => (
                    <motion.div
                      key={trade.id as string}
                      onClick={() => router.push(`/trades/${trade.id}`)}
                      whileHover={{ x: 2 }}
                      transition={spring.snappy}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center h-7 w-7 rounded-lg",
                          trade.direction === "LONG" ? "bg-accent-green/8" : "bg-accent-red/8"
                        )}>
                          {trade.direction === "LONG" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-accent-green" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-accent-red" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">{trade.pair as string}</p>
                          <p className="text-[11px] text-muted-foreground">{trade.session as string || "—"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-mono font-semibold tabular-nums",
                          (trade.pnl as number) > 0 ? "text-accent-green" : (trade.pnl as number) < 0 ? "text-accent-red" : "text-muted-foreground"
                        )}>
                          {(trade.pnl as number) != null ? `${(trade.pnl as number) >= 0 ? "+" : ""}$${(trade.pnl as number).toFixed(2)}` : "—"}
                        </p>
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wide",
                          trade.status === "WIN" ? "text-accent-green" :
                          trade.status === "LOSS" ? "text-accent-red" :
                          "text-muted-foreground"
                        )}>
                          {trade.status as string}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        <div>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-400" />
                <CardTitle className="text-base">AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.totalTrades >= 5 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-accent-green/5 border border-accent-green/10">
                    <p className="text-xs font-semibold text-accent-green mb-1">Best Pair</p>
                    <p className="text-sm text-foreground">
                      Your strongest performance is in {analyticsData?.pairPerformance?.[0]?.name || "—"}.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-semibold text-primary-300 mb-1">Session Insight</p>
                    <p className="text-sm text-foreground">
                      You perform best during the {analyticsData?.winRateBySession?.[0]?.name || "—"} session.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs" 
                    onClick={() => router.push("/psychology")}
                  >
                    View Full Analysis
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  title="Insights unlock at 5 trades"
                  description="Log a few more trades to receive AI-generated performance insights."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
