"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import type { IdentityMetrics } from "@/types/behavioral";
import { fadeUp } from "@/lib/motion";
import { motion } from "framer-motion";

interface DisciplineRadarProps {
  metrics: IdentityMetrics | null;
}

const DEFAULT_DATA = [
  { subject: "Integrity", A: 0, fullMark: 100 },
  { subject: "Stability", A: 0, fullMark: 100 },
  { subject: "Consistency", A: 0, fullMark: 100 },
  { subject: "Cognitive", A: 0, fullMark: 100 },
  { subject: "Recovery", A: 0, fullMark: 100 },
];

export function DisciplineRadar({ metrics }: DisciplineRadarProps) {
  const data = metrics ? [
    { subject: "Execution", A: metrics.executionIntegrity, fullMark: 100 },
    { subject: "Stability", A: metrics.emotionalStability, fullMark: 100 },
    { subject: "Consistency", A: metrics.riskConsistency, fullMark: 100 },
    { subject: "Cognitive", A: metrics.cognitiveControl, fullMark: 100 },
    { subject: "Recovery", A: metrics.recoveryRate, fullMark: 100 },
  ] : DEFAULT_DATA;

  return (
    <motion.div variants={fadeUp}>
      <Card className="h-full border-border/50 bg-card/30 backdrop-blur-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase">Trader Identity</span>
          </div>
          <CardTitle className="text-xl">Cognitive Profile</CardTitle>
          <CardDescription>
            Your multi-dimensional behavioral footprint over recent trades.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Identity"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground text-center px-4">
              Log more trades with behavioral metadata to unlock your Cognitive Profile.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
