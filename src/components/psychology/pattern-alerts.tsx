"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingDown, Target, BrainCircuit, Activity, X } from "lucide-react";
import { useState } from "react";
import { useBehaviorPatterns } from "@/hooks/use-behavior";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { BehaviorAlert, BehaviorAlertSeverity, BehaviorAlertType } from "@/types/behavioral";

const ALERT_META: Record<BehaviorAlertType, { icon: React.ElementType }> = {
  revenge_trading: { icon: Activity },
  fomo_entry: { icon: TrendingDown },
  emotional_scaling: { icon: Target },
  tilt_behavior: { icon: AlertTriangle },
  overconfidence_cycle: { icon: BrainCircuit },
  discipline_decay: { icon: TrendingDown },
  impulsive_exit: { icon: Activity },
  hesitation_pattern: { icon: Target },
};

const SEVERITY_COLORS: Record<BehaviorAlertSeverity, string> = {
  critical: "bg-accent-red/10 border-accent-red/20 text-accent-red shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  warning: "bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow",
  info: "bg-primary/10 border-primary/20 text-primary-300",
};

export function PatternAlerts() {
  const { data, isLoading } = useBehaviorPatterns();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const patterns: BehaviorAlert[] = data?.patterns || [];
  const activePatterns = patterns.filter(p => !dismissed.has(p.type));

  if (isLoading || activePatterns.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {activePatterns.map((alert) => {
          const meta = ALERT_META[alert.type];
          const Icon = meta?.icon || AlertTriangle;

          return (
            <motion.div
              key={alert.type}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={spring.snappy}
              className={cn(
                "relative p-4 rounded-xl border backdrop-blur-sm",
                SEVERITY_COLORS[alert.severity]
              )}
            >
              <button
                onClick={() => setDismissed(prev => new Set(prev).add(alert.type))}
                className="absolute top-3 right-3 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  <div className="p-2 rounded-lg bg-background/50 border border-current/20">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                        {alert.severity} ALERT
                      </span>
                    </div>
                    <h4 className="font-semibold mt-0.5">{alert.title}</h4>
                  </div>

                  <p className="text-sm opacity-90 leading-relaxed max-w-[95%]">
                    {alert.description}
                  </p>

                  <div className="pt-2 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Evidence</p>
                    <ul className="text-xs space-y-1 opacity-80 list-disc list-inside">
                      {alert.evidence.slice(0, 2).map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-background/50 border border-current/20">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    Action: {alert.recommendedAction}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
