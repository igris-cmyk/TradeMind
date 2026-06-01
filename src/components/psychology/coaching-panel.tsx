"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, ShieldAlert, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, spring } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGenerateCoaching, useCoachingHistory } from "@/hooks/use-behavior";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import type { CoachingTone, TraderState } from "@/types/behavioral";

const TONE_META: Record<CoachingTone, { icon: React.ElementType; color: string; bg: string }> = {
  stabilizing: { icon: ShieldAlert, color: "text-primary-300", bg: "bg-primary/10 border-primary/20" },
  cautionary: { icon: ShieldAlert, color: "text-accent-yellow", bg: "bg-accent-yellow/10 border-accent-yellow/20" },
  recovery: { icon: Activity, color: "text-accent-red", bg: "bg-accent-red/10 border-accent-red/20" },
  analytical: { icon: Brain, color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  encouraging: { icon: Zap, color: "text-accent-green", bg: "bg-accent-green/10 border-accent-green/20" },
};

export function CoachingPanel() {
  const { data: history, isLoading: loadingHistory } = useCoachingHistory();
  const generate = useGenerateCoaching();

  const latestSession = history?.sessions?.[0];
  const state: TraderState | undefined = latestSession?.traderState;

  if (loadingHistory) {
    return <LoadingSkeleton variant="card" className="h-64" />;
  }

  return (
    <Card className="glass-card overflow-hidden relative">
      {/* Background glow based on tone */}
      {latestSession && (
        <div 
          className={cn(
            "absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-1000",
            latestSession.aiTone === "recovery" ? "bg-accent-red" :
            latestSession.aiTone === "cautionary" ? "bg-accent-yellow" :
            latestSession.aiTone === "stabilizing" ? "bg-primary" :
            latestSession.aiTone === "encouraging" ? "bg-accent-green" : "bg-primary"
          )} 
        />
      )}

      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary-400" />
              Adaptive AI Coach
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Context-aware behavioral guidance
            </CardDescription>
          </div>
          <Button
            onClick={() => generate.mutate()}
            loading={generate.isPending}
            variant="glow"
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <Sparkles className="h-3 w-3" />
            {latestSession ? "Request Review" : "Initialize Coach"}
          </Button>
        </div>

        {state && (
          <motion.div variants={fadeUp} className="flex gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Score: <span className="font-mono font-semibold text-foreground">{state.disciplineScore}/100</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green/50" />
              WR: <span className="font-mono font-semibold text-foreground">{Math.round(state.recentWinRate * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow/50" />
              Streak: <span className="font-mono font-semibold text-foreground">{state.currentStreak}</span>
            </div>
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="pt-5 relative z-10">
        {!latestSession ? (
          <div className="text-center py-8">
            <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Initialize the coach to receive personalized behavioral guidance based on your trading history.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.gentle}
            className="space-y-4"
          >
            {/* Tone Badge */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider",
              TONE_META[latestSession.aiTone as CoachingTone].bg,
              TONE_META[latestSession.aiTone as CoachingTone].color
            )}>
              {(() => {
                const ToneIcon = TONE_META[latestSession.aiTone as CoachingTone].icon;
                return <ToneIcon className="h-3 w-3" />;
              })()}
              {latestSession.aiTone} Mode
            </div>

            {/* AI Response Text */}
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {latestSession.aiResponse}
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>{new Date(latestSession.createdAt).toLocaleString()}</span>
              {(state?.activePatternsCount ?? 0) > 0 && (
                <span className="text-accent-yellow">
                  {state?.activePatternsCount} active pattern{(state?.activePatternsCount ?? 0) > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
