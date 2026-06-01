/**
 * TradeMind Insight Generator
 * 
 * Generates elite-level behavioral insights from real trade data.
 * Memory-aware, personalized, and never generic.
 */

import type { GeneratedInsight } from "@/types/behavioral";
import type { EmotionBefore } from "@/types/behavioral";

type TradeForInsight = {
  id: string;
  status: string;
  pnl: number | null;
  emotions: string[];
  session: string | null;
  strategyTags: string[];
  riskPercent: number | null;
  disciplineScore: number | null;
  sleepQuality?: number | null;
  fatigueLevel?: number | null;
  emotionBefore?: EmotionBefore | null;
  createdAt: Date;
};

/**
 * Generate data-driven insights from a trader's actual trade history.
 * Returns 3-5 personalized insights.
 */
export function generateInsightsFromData(trades: TradeForInsight[]): GeneratedInsight[] {
  if (trades.length < 3) return [];

  const insights: GeneratedInsight[] = [];
  const closed = trades.filter(t => t.status !== "OPEN");
  const losses = closed.filter(t => t.status === "LOSS");

  // 1. Emotion-performance correlation
  const emotionInsight = analyzeEmotionPerformance(closed);
  if (emotionInsight) insights.push(emotionInsight);

  // 2. Session performance analysis
  const sessionInsight = analyzeSessionPerformance(closed);
  if (sessionInsight) insights.push(sessionInsight);

  // 3. Strategy effectiveness
  const strategyInsight = analyzeStrategyEffectiveness(closed);
  if (strategyInsight) insights.push(strategyInsight);

  // 4. Risk consistency
  const riskInsight = analyzeRiskConsistency(closed);
  if (riskInsight) insights.push(riskInsight);

  // 5. Discipline trend
  const disciplineInsight = analyzeDisciplineTrend(trades);
  if (disciplineInsight) insights.push(disciplineInsight);

  // 6. Fear-based exits
  const fearInsight = analyzeFearExits(losses);
  if (fearInsight) insights.push(fearInsight);

  // 7. Hidden Correlation: Sleep & Discipline
  const sleepInsight = analyzeSleepCorrelation(trades);
  if (sleepInsight) insights.push(sleepInsight);

  // 8. Hidden Correlation: Fatigue & Impulsiveness
  const fatigueInsight = analyzeFatigueCorrelation(trades);
  if (fatigueInsight) insights.push(fatigueInsight);

  return insights.slice(0, 5);
}

function analyzeEmotionPerformance(trades: TradeForInsight[]): GeneratedInsight | null {
  const emotionGroups: Record<string, { wins: number; total: number; tradeIds: string[] }> = {};

  for (const trade of trades) {
    for (const emotion of trade.emotions) {
      if (!emotionGroups[emotion]) emotionGroups[emotion] = { wins: 0, total: 0, tradeIds: [] };
      emotionGroups[emotion].total++;
      emotionGroups[emotion].tradeIds.push(trade.id);
      if (trade.status === "WIN") emotionGroups[emotion].wins++;
    }
  }

  // Find worst-performing emotion
  let worstEmotion = "";
  let worstWinRate = 1;
  for (const [emotion, data] of Object.entries(emotionGroups)) {
    if (data.total >= 3) {
      const winRate = data.wins / data.total;
      if (winRate < worstWinRate) {
        worstWinRate = winRate;
        worstEmotion = emotion;
      }
    }
  }

  if (worstEmotion && worstWinRate < 0.4) {
    const data = emotionGroups[worstEmotion];
    return {
      category: "psychology",
      text: `When trading with "${worstEmotion}" tagged, your win rate drops to ${Math.round(worstWinRate * 100)}% across ${data.total} trades. This emotion is costing you edge.`,
      severity: worstWinRate < 0.25 ? "high" : "medium",
      isMemoryBacked: false,
      relatedTradeIds: data.tradeIds.slice(0, 5),
    };
  }
  return null;
}

function analyzeSessionPerformance(trades: TradeForInsight[]): GeneratedInsight | null {
  const sessionGroups: Record<string, { wins: number; total: number; pnl: number }> = {};

  for (const trade of trades) {
    const session = trade.session || "Unknown";
    if (!sessionGroups[session]) sessionGroups[session] = { wins: 0, total: 0, pnl: 0 };
    sessionGroups[session].total++;
    if (trade.status === "WIN") sessionGroups[session].wins++;
    sessionGroups[session].pnl += trade.pnl || 0;
  }

  const sessions = Object.entries(sessionGroups).filter(([, d]) => d.total >= 3);
  if (sessions.length < 2) return null;

  sessions.sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total));
  const best = sessions[0];
  const worst = sessions[sessions.length - 1];
  const bestWR = Math.round((best[1].wins / best[1].total) * 100);
  const worstWR = Math.round((worst[1].wins / worst[1].total) * 100);

  if (bestWR - worstWR >= 15) {
    return {
      category: "execution",
      text: `Your ${best[0]} session win rate (${bestWR}%) significantly outperforms ${worst[0]} (${worstWR}%). Consider focusing execution during ${best[0]}.`,
      severity: "positive",
      isMemoryBacked: false,
    };
  }
  return null;
}

function analyzeStrategyEffectiveness(trades: TradeForInsight[]): GeneratedInsight | null {
  const stratGroups: Record<string, { wins: number; total: number }> = {};

  for (const trade of trades) {
    for (const tag of trade.strategyTags) {
      if (!stratGroups[tag]) stratGroups[tag] = { wins: 0, total: 0 };
      stratGroups[tag].total++;
      if (trade.status === "WIN") stratGroups[tag].wins++;
    }
  }

  const strats = Object.entries(stratGroups).filter(([, d]) => d.total >= 3);
  if (strats.length === 0) return null;

  strats.sort((a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total));
  const best = strats[0];
  const bestWR = Math.round((best[1].wins / best[1].total) * 100);

  if (bestWR >= 60) {
    return {
      category: "execution",
      text: `Your "${best[0]}" strategy has a ${bestWR}% win rate across ${best[1].total} trades. This is your highest-edge setup — prioritize it.`,
      severity: "positive",
      isMemoryBacked: false,
    };
  }
  return null;
}

function analyzeRiskConsistency(trades: TradeForInsight[]): GeneratedInsight | null {
  const risks = trades.filter(t => t.riskPercent && t.riskPercent > 0).map(t => t.riskPercent!);
  if (risks.length < 5) return null;

  const avg = risks.reduce((s, r) => s + r, 0) / risks.length;
  const variance = risks.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / risks.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > avg * 0.5) {
    return {
      category: "risk",
      text: `Your risk per trade varies significantly (${Math.round(avg * 10) / 10}% avg ± ${Math.round(stdDev * 10) / 10}%). Inconsistent sizing introduces unnecessary variance to your equity curve.`,
      severity: "medium",
      isMemoryBacked: false,
    };
  }
  return null;
}

function analyzeDisciplineTrend(trades: TradeForInsight[]): GeneratedInsight | null {
  const scored = trades.filter(t => t.disciplineScore !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (scored.length < 6) return null;

  const r3 = scored.slice(0, 3).reduce((s, t) => s + (t.disciplineScore || 0), 0) / 3;
  const o3 = scored.slice(3, 6).reduce((s, t) => s + (t.disciplineScore || 0), 0) / 3;

  if (r3 > o3 + 10) {
    return {
      category: "psychology",
      text: `Your discipline score has improved from ${Math.round(o3)} to ${Math.round(r3)} over your recent trades. The process improvements are measurable.`,
      severity: "positive",
      isMemoryBacked: false,
    };
  }
  if (r3 < o3 - 10) {
    return {
      category: "psychology",
      text: `Discipline score declined from ${Math.round(o3)} to ${Math.round(r3)}. Review what changed in your recent process.`,
      severity: "high",
      isMemoryBacked: false,
    };
  }
  return null;
}

function analyzeFearExits(losses: TradeForInsight[]): GeneratedInsight | null {
  const fearLosses = losses.filter(t =>
    t.emotions.some(e => e.toLowerCase().includes("fear") || e.toLowerCase().includes("anxious"))
  );

  if (fearLosses.length >= 3 && losses.length >= 5) {
    const pct = Math.round((fearLosses.length / losses.length) * 100);
    return {
      category: "psychology",
      text: `${pct}% of your losses involved fear or anxiety tags. Fear-based exits often cut winners short and amplify losing streaks.`,
      severity: "high",
      isMemoryBacked: false,
      relatedTradeIds: fearLosses.map(t => t.id).slice(0, 5),
    };
  }
  return null;
}

function analyzeSleepCorrelation(trades: TradeForInsight[]): GeneratedInsight | null {
  const withSleep = trades.filter(t => t.sleepQuality !== undefined && t.sleepQuality !== null);
  if (withSleep.length < 5) return null;

  let lowSleepScoreSum = 0;
  let lowSleepCount = 0;
  let highSleepScoreSum = 0;
  let highSleepCount = 0;

  for (const t of withSleep) {
    if (!t.disciplineScore) continue;
    if (t.sleepQuality! <= 2) {
      lowSleepScoreSum += t.disciplineScore;
      lowSleepCount++;
    } else if (t.sleepQuality! >= 4) {
      highSleepScoreSum += t.disciplineScore;
      highSleepCount++;
    }
  }

  if (lowSleepCount >= 3 && highSleepCount >= 3) {
    const lowAvg = lowSleepScoreSum / lowSleepCount;
    const highAvg = highSleepScoreSum / highSleepCount;

    if (highAvg - lowAvg >= 15) {
      return {
        category: "psychology",
        text: `Your discipline score averages ${Math.round(highAvg)} on high-sleep days, but plummets to ${Math.round(lowAvg)} on low-sleep days. Biological fatigue is actively deteriorating your execution integrity.`,
        severity: "medium",
        isMemoryBacked: false,
      };
    }
  }
  return null;
}

function analyzeFatigueCorrelation(trades: TradeForInsight[]): GeneratedInsight | null {
  const withFatigue = trades.filter(t => t.fatigueLevel !== undefined && t.fatigueLevel !== null && t.emotionBefore);
  if (withFatigue.length < 5) return null;

  let highFatigueImpulsiveCount = 0;
  let highFatigueTotal = 0;

  for (const t of withFatigue) {
    if (t.fatigueLevel! >= 4) {
      highFatigueTotal++;
      const emotionBefore = t.emotionBefore;
      if (emotionBefore && emotionBefore.impulsiveness >= 6) {
        highFatigueImpulsiveCount++;
      }
    }
  }

  if (highFatigueTotal >= 4) {
    const pct = (highFatigueImpulsiveCount / highFatigueTotal) * 100;
    if (pct >= 50) {
      return {
        category: "psychology",
        text: `${Math.round(pct)}% of your trades taken while highly fatigued show elevated impulsiveness. You are substituting cognitive processing with emotional reflexes when tired.`,
        severity: "high",
        isMemoryBacked: false,
      };
    }
  }
  return null;
}
