"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  Clock,
  Brain,
  Target,
  Trash2,
  Camera,
  Sparkles,
} from "lucide-react";
import { useTrade, useDeleteTrade } from "@/hooks/use-queries";
import { useAnalyzeTrade } from "@/hooks/use-ai";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import { fadeUp, stagger } from "@/lib/motion";

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading } = useTrade(params.id as string);
  const deleteTrade = useDeleteTrade();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <LoadingSkeleton variant="text" className="h-7 w-32" />
        <div className="grid lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" className="lg:col-span-2 h-[320px]" />
          <LoadingSkeleton variant="card" className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!data?.trade) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground">Trade not found</p>
        <Button variant="outline" className="mt-4" size="sm" onClick={() => router.push("/trades")}>
          Back to Trades
        </Button>
      </div>
    );
  }

  const trade = data.trade;
  const isLong = trade.direction === "LONG";
  const isProfitable = (trade.pnl || 0) > 0;

  return (
    <motion.div 
      className="space-y-5"
      variants={stagger.container(0.06)}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <motion.h1 layoutId={`trade-pair-${trade.id}`} className="text-lg font-semibold tracking-tight">{trade.pair}</motion.h1>
              <span className={cn(
                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase",
                isLong ? "bg-accent-green/10 text-accent-green border border-accent-green/20" : "bg-accent-red/10 text-accent-red border border-accent-red/20"
              )}>
                {isLong ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trade.direction}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase",
                trade.status === "WIN" ? "bg-accent-green/10 text-accent-green border border-accent-green/20" :
                trade.status === "LOSS" ? "bg-accent-red/10 text-accent-red border border-accent-red/20" :
                "bg-primary/10 text-primary-300 border border-primary/20"
              )}>
                {trade.status}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3 text-muted-foreground/60" />
              {new Date(trade.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-accent-red border-transparent hover:bg-accent-red/5 hover:border-accent-red/10 hover:text-accent-red gap-1 text-xs"
          onClick={() => {
            deleteTrade.mutate(trade.id);
            router.push("/trades");
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price Metrics Card */}
          <motion.div variants={fadeUp}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Entry Price</p>
                    <p className="text-base font-mono font-bold text-foreground tabular-nums">{(trade.entry as number)?.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-accent-red/60 uppercase tracking-wider mb-1 font-semibold">Stop Loss</p>
                    <p className="text-base font-mono font-bold text-accent-red tabular-nums">{(trade.stopLoss as number)?.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-accent-green/60 uppercase tracking-wider mb-1 font-semibold">Take Profit</p>
                    <p className="text-base font-mono font-bold text-accent-green tabular-nums">{(trade.takeProfit as number)?.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Risk/Reward</p>
                    <p className={cn("text-base font-mono font-bold tabular-nums",
                      (trade.rrAchieved || 0) >= 2 ? "text-accent-green" : "text-accent-yellow"
                    )}>
                      {trade.rrAchieved ? `1:${(trade.rrAchieved as number).toFixed(1)}` : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk & Output Card */}
          <motion.div variants={fadeUp}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Risk Percent</p>
                    <p className="text-sm font-mono text-foreground tabular-nums">{trade.riskPercent ? `${trade.riskPercent}%` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Risk Amount</p>
                    <p className="text-sm font-mono text-foreground tabular-nums">{trade.riskAmount ? `$${(trade.riskAmount as number).toFixed(2)}` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Trading Session</p>
                    <p className="text-sm text-foreground">{trade.session || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Outcome P&L</p>
                    <p className={cn("text-lg font-mono font-bold tabular-nums",
                      isProfitable ? "text-accent-green" : "text-accent-red"
                    )}>
                      {trade.pnl != null ? `${trade.pnl >= 0 ? "+" : ""}$${(trade.pnl as number).toFixed(2)}` : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Playbook Rules / Setup Tags */}
          {trade.strategyTags?.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="glass-card">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Target className="h-3.5 w-3.5 text-primary-400" />
                    Playbook Setups
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {trade.strategyTags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-medium border border-primary/20 bg-primary/10 text-primary-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trade Reflections / Notes */}
          {trade.notes && (
            <motion.div variants={fadeUp}>
              <Card className="glass-card">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reflections & Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground/90 whitespace-pre-wrap leading-relaxed">{trade.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Screenshots Grid */}
          {trade.screenshots?.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="glass-card">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Camera className="h-3.5 w-3.5 text-primary-400" />
                    Execution Screenshots
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trade.screenshots.map((url: string, i: number) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="group relative block overflow-hidden rounded-xl border border-white/[0.06] shadow-elevation-1 bg-white/[0.01]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={url} 
                          alt={`Screenshot ${i + 1}`} 
                          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-medium text-white px-2.5 py-1 bg-black/55 rounded-full backdrop-blur-sm shadow-elevation-1">
                            Zoom chart
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Tagged Emotions */}
          {trade.emotions?.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="glass-card">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Brain className="h-3.5 w-3.5 text-primary-400" />
                    Mental States
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {trade.emotions.map((emotion: string) => {
                      const isNeg = ["Fearful", "Revenge Trading", "Overconfident", "Anxious", "Impulsive"].includes(emotion);
                      return (
                        <span key={emotion} className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium border",
                          isNeg ? "border-accent-red/20 bg-accent-red/5 text-accent-red" : "border-accent-green/20 bg-accent-green/5 text-accent-green"
                        )}>
                          {emotion}
                        </span>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* AI Analysis feedback */}
          <motion.div variants={fadeUp}>
            <Card className="glass-card">
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                  AI Deep Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {trade.aiAnalysis ? (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/90">{trade.aiAnalysis.summary}</p>
                    
                    <div className="grid grid-cols-2 gap-3 border-t border-b border-white/[0.04] py-3">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Execution Score</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base font-mono font-bold text-primary-400">
                            {trade.aiAnalysis.qualityScore}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">/10</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">Risk Score</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-base font-mono font-bold text-primary-400">
                            {trade.aiAnalysis.riskScore}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">/10</span>
                        </div>
                      </div>
                    </div>

                    {trade.aiAnalysis.mistakes?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-accent-red uppercase tracking-wider block mb-1.5">Detected Mistakes</span>
                        <ul className="space-y-1">
                          {trade.aiAnalysis.mistakes.map((mistake: string, i: number) => (
                            <li key={i} className="text-xs text-muted-foreground/90 flex items-start gap-2 leading-relaxed">
                              <span className="text-accent-red mt-0.5 shrink-0">•</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Synthesize AI-powered execution grading, detailed risk matrix auditing, and cognitive psychological advice.
                    </p>
                    <AnalyzeTradeButton tradeId={trade.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function AnalyzeTradeButton({ tradeId }: { tradeId: string }) {
  const { mutate: analyzeTrade, isPending } = useAnalyzeTrade();
  const { user } = useCurrentUser();
  const router = useRouter();

  if (user?.plan === "FREE") {
    return (
      <Button
        onClick={() => router.push("/settings/pricing")}
        className="w-full text-xs"
        variant="glow"
      >
        Upgrade to Pro
      </Button>
    );
  }

  return (
    <Button
      onClick={() => analyzeTrade(tradeId)}
      loading={isPending}
      className="w-full text-xs"
    >
      Generate AI Analysis
    </Button>
  );
}
