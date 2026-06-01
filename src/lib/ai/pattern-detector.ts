/**
 * TradeMind Behavioral Pattern Detector
 * 
 * Detects anomalous behavioral patterns across trade history:
 * revenge trading, FOMO, tilt, overconfidence cycles, emotional scaling.
 */

import type { BehaviorAlert, EmotionBefore } from "@/types/behavioral";

type TradeSlice = {
  id: string;
  status: string;
  pnl: number | null;
  emotions: string[];
  emotionBefore: EmotionBefore | null;
  riskPercent: number | null;
  disciplineScore: number | null;
  createdAt: Date;
  session: string | null;
};

const REVENGE_KEYWORDS = ["revenge", "frustrated", "fomo", "angry", "impulsive"];

/**
 * Run all pattern detection algorithms on a trader's history.
 * Returns an array of detected behavioral alerts sorted by severity.
 */
export function detectPatterns(trades: TradeSlice[]): BehaviorAlert[] {
  if (trades.length < 3) return [];

  const sorted = [...trades].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const alerts: BehaviorAlert[] = [];

  const revenge = detectRevengeTrading(sorted);
  if (revenge) alerts.push(revenge);

  const fomo = detectFOMO(sorted);
  if (fomo) alerts.push(fomo);

  const tilt = detectTiltBehavior(sorted);
  if (tilt) alerts.push(tilt);

  const overconfidence = detectOverconfidenceCycle(sorted);
  if (overconfidence) alerts.push(overconfidence);

  const emotionalScaling = detectEmotionalScaling(sorted);
  if (emotionalScaling) alerts.push(emotionalScaling);

  const disciplineDecay = detectDisciplineDecay(sorted);
  if (disciplineDecay) alerts.push(disciplineDecay);

  // Sort: critical → warning → info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

// ─── Pattern Detectors ───────────────────────────────────────

function detectRevengeTrading(trades: TradeSlice[]): BehaviorAlert | null {
  // Look for losses followed quickly by more trades with revenge/negative emotions
  const recentTrades = trades.slice(0, 10);
  let revengeCount = 0;
  const evidenceTradeIds: string[] = [];
  const evidence: string[] = [];

  for (let i = 0; i < recentTrades.length; i++) {
    const trade = recentTrades[i];
    if (trade.status === "LOSS") {
      // Check if next trade has revenge emotions
      if (i > 0) {
        const nextTrade = recentTrades[i - 1]; // More recent
        const hasRevengeEmotion = nextTrade.emotions.some(e =>
          REVENGE_KEYWORDS.includes(e.toLowerCase())
        );
        const hasRevengeBeforeState = nextTrade.emotionBefore?.revenge
          ? nextTrade.emotionBefore.revenge >= 5
          : false;

        if (hasRevengeEmotion || hasRevengeBeforeState) {
          revengeCount++;
          evidenceTradeIds.push(nextTrade.id);
          evidence.push(`Trade after loss showed revenge mindset (${nextTrade.createdAt.toLocaleDateString()})`);
        }
      }
    }
  }

  if (revengeCount >= 2) {
    return {
      type: "revenge_trading",
      severity: "critical",
      title: "Revenge Trading Detected",
      description: `${revengeCount} instances of trading with a revenge mindset after losses in your recent history. This pattern typically leads to compounding losses.`,
      evidence,
      tradeIds: evidenceTradeIds,
      recommendedAction: "After any loss, take a mandatory 15-minute break. Close your charts and review your rules before re-entering.",
      detectedAt: new Date(),
    };
  }

  return null;
}

function detectFOMO(trades: TradeSlice[]): BehaviorAlert | null {
  // Detect rapid entries (multiple trades in quick succession) with high impulsiveness
  const recentTrades = trades.slice(0, 15);
  let fomoCount = 0;
  const evidenceTradeIds: string[] = [];
  const evidence: string[] = [];

  for (let i = 1; i < recentTrades.length; i++) {
    const current = recentTrades[i - 1];
    const previous = recentTrades[i];
    const timeDiff = current.createdAt.getTime() - previous.createdAt.getTime();
    const minutesBetween = timeDiff / (1000 * 60);

    // Two trades within 5 minutes with impulsive emotions
    if (minutesBetween < 5) {
      const isImpulsive = current.emotionBefore?.impulsiveness
        ? current.emotionBefore.impulsiveness >= 6
        : current.emotions.some(e => e.toLowerCase() === "impulsive");

      if (isImpulsive) {
        fomoCount++;
        evidenceTradeIds.push(current.id);
        evidence.push(`Impulsive entry ${Math.round(minutesBetween)}min after previous trade`);
      }
    }
  }

  if (fomoCount >= 2) {
    return {
      type: "fomo_entry",
      severity: "warning",
      title: "FOMO Entry Pattern",
      description: `${fomoCount} trades entered rapidly with impulsive emotions. FOMO entries typically have lower win rates.`,
      evidence,
      tradeIds: evidenceTradeIds,
      recommendedAction: "Wait for your setup confirmation checklist before entering. Set a 3-minute timer after spotting a setup.",
      detectedAt: new Date(),
    };
  }

  return null;
}

function detectTiltBehavior(trades: TradeSlice[]): BehaviorAlert | null {
  // Tilt = progressive emotional deterioration across consecutive trades
  const recentTrades = trades.slice(0, 8);
  if (recentTrades.length < 4) return null;

  let consecutiveLosses = 0;
  let emotionalEscalation = 0;
  const evidenceTradeIds: string[] = [];
  const evidence: string[] = [];

  for (const trade of recentTrades) {
    if (trade.status === "LOSS") {
      consecutiveLosses++;
      const negativeEmotions = trade.emotions.filter(e =>
        REVENGE_KEYWORDS.includes(e.toLowerCase())
      ).length;
      
      if (negativeEmotions > 0) emotionalEscalation++;
      if (trade.emotionBefore && (trade.emotionBefore.fear >= 7 || trade.emotionBefore.revenge >= 5)) {
        emotionalEscalation++;
      }

      evidenceTradeIds.push(trade.id);
    } else {
      break; // Streak broken
    }
  }

  if (consecutiveLosses >= 3 && emotionalEscalation >= 2) {
    evidence.push(`${consecutiveLosses} consecutive losses with escalating negative emotions`);
    evidence.push(`Emotional intensity increased across the losing streak`);

    return {
      type: "tilt_behavior",
      severity: "critical",
      title: "Tilt Behavior Active",
      description: "You are on tilt. Consecutive losses combined with escalating emotional intensity indicate impaired decision-making.",
      evidence,
      tradeIds: evidenceTradeIds,
      recommendedAction: "Stop trading immediately. Walk away for at least 1 hour. Review your process, not your P&L.",
      detectedAt: new Date(),
    };
  }

  return null;
}

function detectOverconfidenceCycle(trades: TradeSlice[]): BehaviorAlert | null {
  // Pattern: Win streak → increased risk → larger loss
  const recentTrades = trades.slice(0, 20);
  if (recentTrades.length < 5) return null;

  let winStreak = 0;
  let riskIncrease = false;
  let subsequentLoss = false;
  const evidenceTradeIds: string[] = [];
  const evidence: string[] = [];

  // Find win streaks followed by risk increase
  for (let i = recentTrades.length - 1; i >= 0; i--) {
    const trade = recentTrades[i];
    if (trade.status === "WIN") {
      winStreak++;
    } else if (winStreak >= 3 && trade.status === "LOSS") {
      // Check if risk was elevated during this loss
      if (trade.riskPercent && trade.riskPercent > 2) {
        riskIncrease = true;
        subsequentLoss = true;
        evidenceTradeIds.push(trade.id);
        evidence.push(`After ${winStreak}-trade win streak, risk increased to ${trade.riskPercent}%`);
        evidence.push("Subsequent loss was larger than average due to oversizing");
      }
      winStreak = 0;
    } else {
      winStreak = 0;
    }
  }

  if (riskIncrease && subsequentLoss) {
    return {
      type: "overconfidence_cycle",
      severity: "warning",
      title: "Overconfidence Cycle Detected",
      description: "You tend to increase position size after winning streaks, leading to outsized losses that erase gains.",
      evidence,
      tradeIds: evidenceTradeIds,
      recommendedAction: "Lock your risk percentage at a fixed value regardless of recent performance. Wins don't change your edge.",
      detectedAt: new Date(),
    };
  }

  return null;
}

function detectEmotionalScaling(trades: TradeSlice[]): BehaviorAlert | null {
  // Detect correlation between emotional intensity and position sizing
  const tradesWithRisk = trades.filter(t => t.riskPercent && t.emotionBefore);
  if (tradesWithRisk.length < 5) return null;

  let highEmotionHighRisk = 0;
  const evidenceTradeIds: string[] = [];
  const evidence: string[] = [];
  const avgRisk = tradesWithRisk.reduce((sum, t) => sum + (t.riskPercent || 0), 0) / tradesWithRisk.length;

  for (const trade of tradesWithRisk) {
    if (!trade.emotionBefore || !trade.riskPercent) continue;
    const emotionalIntensity = (trade.emotionBefore.greed + trade.emotionBefore.revenge + trade.emotionBefore.impulsiveness) / 3;
    
    if (emotionalIntensity >= 5 && trade.riskPercent > avgRisk * 1.3) {
      highEmotionHighRisk++;
      evidenceTradeIds.push(trade.id);
      evidence.push(`High emotional intensity (${emotionalIntensity.toFixed(1)}/10) with ${trade.riskPercent}% risk (avg: ${avgRisk.toFixed(1)}%)`);
    }
  }

  if (highEmotionHighRisk >= 3) {
    return {
      type: "emotional_scaling",
      severity: "warning",
      title: "Emotional Position Scaling",
      description: "Your position sizes increase when emotional intensity is high. This creates asymmetric risk exposure.",
      evidence: evidence.slice(0, 3),
      tradeIds: evidenceTradeIds,
      recommendedAction: "Pre-commit to your position size before analyzing any setup. Write it down before opening your charts.",
      detectedAt: new Date(),
    };
  }

  return null;
}

function detectDisciplineDecay(trades: TradeSlice[]): BehaviorAlert | null {
  // Look for declining discipline scores over time
  const scoredTrades = trades.filter(t => t.disciplineScore !== null).slice(0, 20);
  if (scoredTrades.length < 5) return null;

  const recentAvg = scoredTrades.slice(0, 5).reduce((s, t) => s + (t.disciplineScore || 0), 0) / 5;
  const olderAvg = scoredTrades.slice(-5).reduce((s, t) => s + (t.disciplineScore || 0), 0) / 5;

  if (olderAvg - recentAvg >= 15) {
    return {
      type: "discipline_decay",
      severity: "warning",
      title: "Discipline Score Declining",
      description: `Your discipline score has dropped from ${Math.round(olderAvg)} to ${Math.round(recentAvg)} over your recent trades.`,
      evidence: [
        `Recent 5-trade average: ${Math.round(recentAvg)}`,
        `Previous 5-trade average: ${Math.round(olderAvg)}`,
        `Decline of ${Math.round(olderAvg - recentAvg)} points`,
      ],
      tradeIds: scoredTrades.slice(0, 5).map(t => t.id),
      recommendedAction: "Review your recent trade notes. Identify what changed in your process and recommit to your rules.",
      detectedAt: new Date(),
    };
  }

  return null;
}
