"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { useInsights, useGenerateInsights } from "@/hooks/use-ai";
import { useTradeAnalytics, useTrades } from "@/hooks/use-queries";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PerformanceTable } from "@/components/charts/performance-table";
import { BehavioralTimeline } from "@/components/psychology/behavioral-timeline";
import { CoachingPanel } from "@/components/psychology/coaching-panel";
import { PatternAlerts } from "@/components/psychology/pattern-alerts";
import { DisciplineRadar } from "@/components/psychology/discipline-radar";
import { cn } from "@/lib/utils";
import { fadeUp, spring, stagger } from "@/lib/motion";

export default function PsychologyPage() {
  const { data: insightsData, isLoading: insightsLoading } = useInsights();
  const { mutate: generateInsights, isPending: generating } = useGenerateInsights();
  const { data: analyticsData, isLoading: analyticsLoading } = useTradeAnalytics(30);
  const { data: tradesData } = useTrades({ limit: "50" });
  const { user } = useCurrentUser();
  const router = useRouter();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="h-4 w-4 text-accent-red" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-accent-yellow" />;
      case "positive": return <CheckCircle2 className="h-4 w-4 text-accent-green" />;
      default: return <TrendingUp className="h-4 w-4 text-primary-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-accent-red/5 border-accent-red/10 text-accent-red";
      case "medium": return "bg-accent-yellow/5 border-accent-yellow/10 text-accent-yellow";
      case "positive": return "bg-accent-green/5 border-accent-green/10 text-accent-green";
      default: return "bg-primary/5 border-primary/10 text-primary-300";
    }
  };

  const timelineData = tradesData?.trades?.filter((t: Record<string, unknown>) => t.disciplineScore !== null) || [];

  return (
    <motion.div 
      className="space-y-6"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary-400" />
            Cognitive Intelligence Hub
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Your behavioral operating system and AI performance coach.
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="relative space-y-6">
        {/* Paywall Overlay */}
        {user?.plan === "FREE" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md rounded-xl border border-white/[0.06] p-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4">
              <Lock className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="text-lg font-bold mb-1">Unlock Cognitive Intelligence</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Upgrade to Pro to access behavioral pattern detection, execution scoring, and the adaptive AI coach.
            </p>
            <Button
              onClick={() => router.push("/settings/pricing")}
              variant="glow"
            >
              Upgrade to Pro
            </Button>
          </div>
        )}

        <div className={cn("space-y-6 transition-all", user?.plan === "FREE" ? "opacity-20 pointer-events-none select-none blur-sm" : "")}>
          
          {/* Top Row: Timeline, Coaching, Radar */}
          <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <BehavioralTimeline data={timelineData} />
            </div>
            <div className="xl:col-span-1">
              <DisciplineRadar metrics={analyticsData?.identityMetrics || null} />
            </div>
            <div className="xl:col-span-1">
              <CoachingPanel />
            </div>
          </div>

          {/* Pattern Alerts */}
          <PatternAlerts />

          {/* Bottom Row: Data & Insights */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Left Column: AI Coach Insights */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card overflow-hidden h-full">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-primary-400" />
                      Behavioral Insights
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Data-driven insights from your trade history and AI memory.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => generateInsights()}
                    loading={generating}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  {insightsLoading ? (
                    <LoadingSkeleton variant="text" count={3} className="h-16" />
                  ) : !insightsData?.length ? (
                    <EmptyState
                      icon={Brain}
                      title="No insights yet"
                      description="Log more trades with emotional metadata to generate insights."
                      actionLabel="Generate Now"
                      onAction={() => generateInsights()}
                    />
                  ) : (
                    <div className="space-y-3">
                      {insightsData.map((insight: { id: string, severity: string, category: string, text: string, generatedAt: string }) => (
                        <motion.div
                          variants={fadeUp}
                          transition={spring.gentle}
                          key={insight.id}
                          className={cn(
                            "p-3 rounded-lg border text-sm leading-relaxed",
                            getSeverityColor(insight.severity)
                          )}
                        >
                          <div className="flex gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {getSeverityIcon(insight.severity)}
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                {insight.category}
                              </span>
                              <p className="text-foreground text-xs sm:text-sm">
                                {insight.text}
                              </p>
                              <span className="text-[9px] text-muted-foreground/60 mt-1.5 block font-mono">
                                {new Date(insight.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Emotion Stats */}
            <div className="space-y-4">
              <Card className="glass-card h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-400" />
                    Emotion Impact on Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <LoadingSkeleton variant="text" count={4} className="h-10" />
                  ) : !analyticsData?.emotionCorrelation?.length ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Not enough data. Tag your emotions when logging trades.
                    </p>
                  ) : (
                    <PerformanceTable 
                      data={analyticsData.emotionCorrelation} 
                      title="Emotion Performance" 
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
