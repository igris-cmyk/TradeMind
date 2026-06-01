"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Flame,
  Brain,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useDiscipline, useDisciplineHistory } from "@/hooks/use-queries";
import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const DisciplineHistoryChart = dynamic(
  () => import("@/components/charts/discipline-history-chart").then((m) => m.DisciplineHistoryChart),
  { ssr: false, loading: () => <LoadingSkeleton variant="chart" className="h-[160px]" /> }
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp, spring, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DisciplineMilestone } from "@/lib/discipline";

const iconMap = {
  flame: Flame,
  shield: Shield,
  brain: Brain,
  target: Target,
  sparkles: Sparkles,
};

function ScoreRing({ score, delta }: { score: number; delta: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#10B981" : score >= 40 ? "#6366F1" : "#F59E0B";

  return (
    <div className="relative flex items-center justify-center h-28 w-28">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ ...spring.gentle, duration: 1 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono tabular-nums">{score}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
          Discipline
        </span>
        {delta !== 0 && (
          <span
            className={cn(
              "text-[10px] font-semibold mt-0.5",
              delta > 0 ? "text-accent-green" : "text-accent-red"
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function DisciplinePanel({ compact = false }: { compact?: boolean }) {
  const { data, isLoading } = useDiscipline();
  const { data: historyData } = useDisciplineHistory();
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (!data || celebratedRef.current) return;
    const newlyAchieved = data.milestones?.filter(
      (m: { achieved: boolean; progress?: number }) =>
        m.achieved && (m.progress === undefined || m.progress >= 100)
    );
    if (newlyAchieved?.length > 0) {
      const latest = newlyAchieved[newlyAchieved.length - 1];
      toast.success(`Milestone unlocked: ${latest.title}`, {
        description: latest.description,
        duration: 5000,
      });
      celebratedRef.current = true;
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <LoadingSkeleton variant="card" className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      variants={stagger.container(0.05)}
      initial="initial"
      animate="animate"
      className={cn(compact ? "space-y-3" : "space-y-4")}
    >
      <motion.div variants={fadeUp}>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary-400" />
              Discipline Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ScoreRing score={data.disciplineScore} delta={data.scoreDelta} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-green/5 border border-accent-green/10">
                  <Flame className="h-4 w-4 text-accent-green shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-accent-green">
                      {data.revengeFreeDays} days revenge-free
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {data.revengeFreeDays >= 7
                        ? "Elite emotional control"
                        : `${7 - data.revengeFreeDays} days to Disciplined Week`}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {data.achievedMilestones}/{data.totalMilestones} milestones unlocked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {data.insights?.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          {data.insights.slice(0, compact ? 2 : 4).map((insight: { type: string; message: string }, i: number) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-xs",
                insight.type === "positive"
                  ? "bg-accent-green/5 border-accent-green/10"
                  : insight.type === "warning"
                  ? "bg-accent-yellow/5 border-accent-yellow/10"
                  : "bg-primary/5 border-primary/10"
              )}
            >
              {insight.type === "positive" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-accent-green shrink-0 mt-0.5" />
              ) : insight.type === "warning" ? (
                <AlertTriangle className="h-3.5 w-3.5 text-accent-yellow shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-primary-400 shrink-0 mt-0.5" />
              )}
              <p className="text-foreground leading-relaxed">{insight.message}</p>
            </div>
          ))}
        </motion.div>
      )}

      {!compact && historyData?.history?.length > 1 && (
        <motion.div variants={fadeUp}>
          <DisciplineHistoryChart data={historyData.history} />
        </motion.div>
      )}

      {!compact && data.milestones?.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.milestones.map((m: DisciplineMilestone) => {
                const Icon = iconMap[m.icon];
                return (
                  <motion.div
                    key={m.id}
                    whileHover={{ x: 2 }}
                    transition={spring.snappy}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
                      m.achieved
                        ? "bg-accent-green/5 border-accent-green/15"
                        : "bg-white/[0.01] border-white/[0.04]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                        m.achieved ? "bg-accent-green/10" : "bg-white/[0.03]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          m.achieved ? "text-accent-green" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {m.description}
                      </p>
                      {!m.achieved && m.progress != null && (
                        <div className="mt-1.5 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            className="h-full bg-primary/60 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${m.progress}%` }}
                            transition={spring.gentle}
                          />
                        </div>
                      )}
                    </div>
                    {m.achieved && (
                      <CheckCircle2 className="h-4 w-4 text-accent-green shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
