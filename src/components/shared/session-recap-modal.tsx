"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { spring, scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RecapSummary = {
  tradesCount: number;
  totalPnl: number;
  wins: number;
  losses: number;
  winRate: number;
  bestPair: string;
  message: string;
};

export function SessionRecapModal() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<RecapSummary | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 16) return;

    fetch("/api/session-recap")
      .then((r) => r.json())
      .then((data) => {
        if (data.show && data.summary) {
          setSummary(data.summary);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = async () => {
    setOpen(false);
    await fetch("/api/session-recap", { method: "POST" });
  };

  const positive = (summary?.totalPnl ?? 0) >= 0;

  return (
    <AnimatePresence>
      {open && summary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={dismiss}
          />
          <motion.div
            {...scaleIn}
            transition={spring.gentle}
            className="glass-card-elevated relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] p-6 shadow-elevation-4"
          >
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss session recap"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-semibold">Session Recap</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{summary.message}</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <p className="type-label mb-1">Trades</p>
                <p className="type-mono-data">{summary.tradesCount}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <p className="type-label mb-1">P&L</p>
                <p className={cn("type-mono-data", positive ? "text-accent-green" : "text-accent-red")}>
                  {positive ? "+" : ""}${summary.totalPnl.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <p className="type-label mb-1">Win Rate</p>
                <p className="type-mono-data">{summary.winRate}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Best performer today: <span className="text-foreground font-medium">{summary.bestPair}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="glow" className="flex-1 gap-2" onClick={() => { dismiss(); window.location.href = "/psychology"; }}>
                <TrendingUp className="h-4 w-4" />
                Review Psychology
              </Button>
              <Button variant="outline" onClick={dismiss}>
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
