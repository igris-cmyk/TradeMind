"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export function DisciplineGauge({ score }: { score: number }) {
  const percentage = Math.max(0, Math.min(100, score));
  
  const color = 
    percentage >= 70 ? "text-accent-green bg-accent-green" :
    percentage >= 40 ? "text-accent-yellow bg-accent-yellow" :
    "text-accent-red bg-accent-red";

  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="glass-card flex flex-col justify-center items-center p-4">
      <CardHeader className="p-0 pb-2 flex-row items-center gap-2">
        <Target className="h-4 w-4 text-primary-400" />
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Discipline Score™
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/20"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            className={cn(color.split(" ")[0])}
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-bold font-mono", color.split(" ")[0])}>
            {percentage}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
