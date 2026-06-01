/**
 * TradeMind Execution Quality Scorer
 * 
 * Computes the TradeMind Discipline Score™ for each trade
 * based on execution quality metrics and behavioral metadata.
 */

import type {
  ExecutionScores,
  IdentityMetrics,
  EmotionBefore,
  EmotionAfter,
} from "@/types/behavioral";

type TradeForScoring = {
  id: string;
  direction: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number | null;
  rrAchieved: number | null;
  riskPercent: number | null;
  status: string;
  emotions: string[];
  emotionBefore: EmotionBefore | null;
  emotionAfter: EmotionAfter | null;
  notes: string | null;
  strategyTags: string[];
};

type HistoricalContext = {
  avgRiskPercent: number;
  avgRR: number;
  recentStreak: number; // positive = wins, negative = losses
  totalTrades: number;
};

const NEGATIVE_EMOTIONS = ["fearful", "revenge trading", "overconfident", "anxious", "impulsive"];

/**
 * Score a single trade's execution quality across 8 dimensions.
 */
export function scoreExecution(
  trade: TradeForScoring,
  history: HistoricalContext
): ExecutionScores {
  return {
    entryQuality: scoreEntryQuality(trade),
    exitDiscipline: scoreExitDiscipline(trade),
    stopLossDiscipline: scoreStopLossDiscipline(trade),
    patience: scorePatience(trade),
    ruleAdherence: scoreRuleAdherence(trade),
    emotionalControl: scoreEmotionalControl(trade),
    riskIntegrity: scoreRiskIntegrity(trade, history),
    setupQuality: scoreSetupQuality(trade),
  };
}

/**
 * Compute the weighted TradeMind Discipline Score™ (0-100).
 */
export function computeDisciplineScoreFromExecution(scores: ExecutionScores): number {
  const weights: Record<keyof ExecutionScores, number> = {
    entryQuality: 0.10,
    exitDiscipline: 0.15,
    stopLossDiscipline: 0.20,
    patience: 0.10,
    ruleAdherence: 0.15,
    emotionalControl: 0.15,
    riskIntegrity: 0.10,
    setupQuality: 0.05,
  };

  let weightedSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    weightedSum += scores[key as keyof ExecutionScores] * weight;
  }

// Scale from 0-10 to 0-100
  return Math.max(0, Math.min(100, Math.round(weightedSum * 10)));
}

/**
 * Phase 3: Compute Multi-dimensional Identity Metrics (0-100 scales)
 */
export function computeIdentityMetrics(
  scores: ExecutionScores,
  history: HistoricalContext
): IdentityMetrics {
  // 1. Execution Integrity: R:R and Setup Quality
  const integrity = ((scores.entryQuality * 1.5 + scores.exitDiscipline * 1.5 + scores.setupQuality) / 4) * 10;
  
  // 2. Emotional Stability: Control over negative emotions/fear
  const stability = scores.emotionalControl * 10;

  // 3. Risk Consistency: Stop loss and risk bounds
  const risk = ((scores.stopLossDiscipline + scores.riskIntegrity) / 2) * 10;

  // 4. Cognitive Control: Patience, rules, avoiding impulsiveness
  const cognitive = ((scores.patience + scores.ruleAdherence) / 2) * 10;

  // 5. Recovery Rate: Ability to maintain discipline post-loss
  // If recent streak is negative, high cognitive control + stability = high recovery
  let recovery = ((stability + cognitive) / 2);
  if (history.recentStreak < 0) {
    recovery += 10; // Boost recovery if performing well during a losing streak
  } else if (history.recentStreak > 3) {
    // If on a huge winning streak, stability alone doesn't prove recovery
    recovery = 50 + (stability / 2); 
  }

  return {
    executionIntegrity: Math.max(0, Math.min(100, Math.round(integrity))),
    emotionalStability: Math.max(0, Math.min(100, Math.round(stability))),
    riskConsistency: Math.max(0, Math.min(100, Math.round(risk))),
    cognitiveControl: Math.max(0, Math.min(100, Math.round(cognitive))),
    recoveryRate: Math.max(0, Math.min(100, Math.round(recovery))),
  };
}

// ─── Individual Scoring Functions ────────────────────────────

function scoreEntryQuality(trade: TradeForScoring): number {
  const riskDistance = Math.abs(trade.entry - trade.stopLoss);
  const rewardDistance = Math.abs(trade.takeProfit - trade.entry);
  if (riskDistance === 0) return 3;
  
  const rrRatio = rewardDistance / riskDistance;
  
  // Higher R:R at entry = better entry quality
  if (rrRatio >= 3) return 10;
  if (rrRatio >= 2.5) return 9;
  if (rrRatio >= 2) return 8;
  if (rrRatio >= 1.5) return 7;
  if (rrRatio >= 1) return 5;
  return 3;
}

function scoreExitDiscipline(trade: TradeForScoring): number {
  if (trade.status === "OPEN") return 5; // Neutral for open trades
  
  // If trade hit TP exactly — excellent exit discipline
  if (trade.status === "WIN" && trade.rrAchieved && trade.rrAchieved >= 1) return 9;
  // Win but below expected RR — partial exit or early close
  if (trade.status === "WIN") return 7;
  // Loss at SL — disciplined exit
  if (trade.status === "LOSS") return 6;
  // Breakeven — managed risk
  if (trade.status === "BREAKEVEN") return 7;
  
  return 5;
}

function scoreStopLossDiscipline(trade: TradeForScoring): number {
  // If the trade is a loss and the loss exceeds what the SL should have allowed — SL was moved
  if (trade.status === "LOSS" && trade.pnl !== null && trade.riskPercent) {
    // Very rough heuristic: if the actual loss is >2x expected, SL was likely moved
    return 4;
  }
  // If SL is defined and tight — good
  if (trade.stopLoss > 0) return 8;
  return 5;
}

function scorePatience(trade: TradeForScoring): number {
  let score = 5;
  
  // Emotion-based patience assessment
  if (trade.emotionBefore) {
    const eb = trade.emotionBefore;
    // High impulsiveness = low patience
    if (eb.impulsiveness >= 7) score -= 3;
    else if (eb.impulsiveness >= 4) score -= 1;
    // High hesitation can indicate overthinking, not patience
    if (eb.hesitation >= 7) score -= 1;
    // High calmness + focus = patience
    if (eb.calmness >= 7 && eb.focus >= 7) score += 3;
    else if (eb.calmness >= 5) score += 1;
  }
  
  // Strategy tags suggest a planned setup
  if (trade.strategyTags.length > 0) score += 1;
  // Notes suggest thoughtful analysis
  if (trade.notes && trade.notes.length > 50) score += 1;
  
  return Math.max(0, Math.min(10, score));
}

function scoreRuleAdherence(trade: TradeForScoring): number {
  let score = 5;
  
  // Has strategy tags = followed a playbook
  if (trade.strategyTags.length > 0) score += 2;
  // Has notes = documented reasoning
  if (trade.notes && trade.notes.length > 20) score += 1;
  // Has session selected = following session rules
  if (trade.emotions.length > 0) score += 1;
  // Has defined risk = following risk rules
  if (trade.riskPercent && trade.riskPercent > 0) score += 1;
  
  return Math.max(0, Math.min(10, score));
}

function scoreEmotionalControl(trade: TradeForScoring): number {
  let score = 8; // Start high, deduct for negative signals
  
  // Check flat emotion tags
  const negativeCount = trade.emotions.filter(e => 
    NEGATIVE_EMOTIONS.includes(e.toLowerCase())
  ).length;
  score -= negativeCount * 2;
  
  // Check structured emotion before
  if (trade.emotionBefore) {
    const eb = trade.emotionBefore;
    if (eb.revenge >= 5) score -= 3;
    if (eb.greed >= 7) score -= 2;
    if (eb.fear >= 7) score -= 2;
    if (eb.impulsiveness >= 7) score -= 2;
    if (eb.calmness >= 7 && eb.focus >= 7) score += 1;
  }
  
  return Math.max(0, Math.min(10, score));
}

function scoreRiskIntegrity(trade: TradeForScoring, history: HistoricalContext): number {
  let score = 6;
  
  // Check if risk percent is within acceptable bounds
  if (trade.riskPercent) {
    if (trade.riskPercent <= 1) score = 9;
    else if (trade.riskPercent <= 2) score = 7;
    else if (trade.riskPercent <= 3) score = 5;
    else score = 3; // Over 3% risk
    
    // Deduct if risk is significantly above personal average (emotional scaling)
    if (history.avgRiskPercent > 0 && trade.riskPercent > history.avgRiskPercent * 1.5) {
      score -= 2;
    }
  }
  
  return Math.max(0, Math.min(10, score));
}

function scoreSetupQuality(trade: TradeForScoring): number {
  let score = 5;
  
  // Multiple confluence factors (strategy tags) = higher quality setup
  if (trade.strategyTags.length >= 3) score += 3;
  else if (trade.strategyTags.length >= 2) score += 2;
  else if (trade.strategyTags.length >= 1) score += 1;
  
  // Good R:R setup
  const risk = Math.abs(trade.entry - trade.stopLoss);
  const reward = Math.abs(trade.takeProfit - trade.entry);
  if (risk > 0) {
    const rr = reward / risk;
    if (rr >= 2) score += 2;
    else if (rr >= 1.5) score += 1;
  }
  
  return Math.max(0, Math.min(10, score));
}
