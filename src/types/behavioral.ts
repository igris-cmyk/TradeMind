// ─── Phase 2: Cognitive Intelligence Type System ─────────────
// Behavioral metadata, execution scoring, and AI coaching types.

// ─── Emotion State Types ─────────────────────────────────────

/** Pre-trade emotional state — captures the trader's psychological baseline */
export interface EmotionBefore {
  confidence: number;  // 0-10: How confident in the setup
  fear: number;        // 0-10: Fear of loss
  greed: number;       // 0-10: Desire for outsized gain
  revenge: number;     // 0-10: Desire to recover losses
  impulsiveness: number; // 0-10: Acting without plan
  calmness: number;    // 0-10: Mental composure
  hesitation: number;  // 0-10: Uncertainty about entry
  focus: number;       // 0-10: Mental clarity
}

/** Post-trade emotional state — captures the psychological aftermath */
export interface EmotionAfter {
  satisfaction: number;     // 0-10
  frustration: number;      // 0-10
  regret: number;           // 0-10
  emotionalExhaustion: number; // 0-10
  confidenceShift: number;  // -5 to +5 (decreased → increased)
  disappointment: number;   // 0-10
}

/** Default empty emotion before state */
export const DEFAULT_EMOTION_BEFORE: EmotionBefore = {
  confidence: 5, fear: 0, greed: 0, revenge: 0,
  impulsiveness: 0, calmness: 5, hesitation: 0, focus: 5,
};

/** Default empty emotion after state */
export const DEFAULT_EMOTION_AFTER: EmotionAfter = {
  satisfaction: 5, frustration: 0, regret: 0,
  emotionalExhaustion: 0, confidenceShift: 0, disappointment: 0,
};

// ─── Execution Quality Types ─────────────────────────────────

/** AI-computed execution quality scores for each trade */
export interface ExecutionScores {
  entryQuality: number;     // 0-10: Was the entry at optimal price?
  exitDiscipline: number;   // 0-10: Did they exit per plan?
  stopLossDiscipline: number; // 0-10: Was SL respected?
  patience: number;         // 0-10: Did they wait for confirmation?
  ruleAdherence: number;    // 0-10: Did they follow their rules?
  emotionalControl: number; // 0-10: Did emotions influence decisions?
  riskIntegrity: number;    // 0-10: Was risk management sound?
  setupQuality: number;     // 0-10: Quality of the trade setup
}

/** Phase 3: Multi-dimensional cognitive identity scores computed from execution */
export interface IdentityMetrics {
  executionIntegrity: number; // 0-100: Adherence to R:R and setup quality
  emotionalStability: number; // 0-100: Control over fear, tilt, and impulsiveness
  riskConsistency: number;    // 0-100: Strictness of stop loss and risk bounds
  cognitiveControl: number;   // 0-100: Patience and rule adherence
  recoveryRate: number;       // 0-100: Ability to maintain discipline post-loss
}

/** Weighted discipline score computation config */
export const EXECUTION_WEIGHTS: Record<keyof ExecutionScores, number> = {
  entryQuality: 0.10,
  exitDiscipline: 0.15,
  stopLossDiscipline: 0.20,
  patience: 0.10,
  ruleAdherence: 0.15,
  emotionalControl: 0.15,
  riskIntegrity: 0.10,
  setupQuality: 0.05,
};

// ─── Market Context Types ────────────────────────────────────

export type VolatilityLevel = "low" | "medium" | "high" | "extreme";
export type MarketCondition = "trending" | "ranging" | "choppy" | "breakout" | "reversal";

/** Contextual market metadata captured at trade entry */
export interface MarketContext {
  volatility: VolatilityLevel;
  marketCondition: MarketCondition;
  newsProximity: boolean;       // Was there a major news event nearby?
  sessionType: string;          // Asian, London, NY AM, NY PM
}

// ─── Behavioral Pattern Types ────────────────────────────────

export type PatternCategory = "pattern" | "tendency" | "strength" | "trigger";

export type BehaviorAlertSeverity = "info" | "warning" | "critical";

export type BehaviorAlertType =
  | "revenge_trading"
  | "fomo_entry"
  | "emotional_scaling"
  | "tilt_behavior"
  | "overconfidence_cycle"
  | "discipline_decay"
  | "impulsive_exit"
  | "hesitation_pattern";

/** A detected behavioral pattern with evidence */
export interface BehaviorAlert {
  type: BehaviorAlertType;
  severity: BehaviorAlertSeverity;
  title: string;
  description: string;
  evidence: string[];        // Human-readable evidence points
  tradeIds: string[];        // Associated trade IDs
  recommendedAction: string;
  detectedAt: Date;
}

/** Stored behavior memory observation */
export interface BehaviorMemoryRecord {
  id: string;
  category: PatternCategory;
  title: string;
  description: string;
  confidence: number;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  isActive: boolean;
}

// ─── Coaching Types ──────────────────────────────────────────

export type CoachingTone =
  | "stabilizing"    // During winning streaks — prevent overconfidence
  | "cautionary"     // When patterns detected — gentle warning
  | "recovery"       // During losing streaks — calm, process-focused
  | "analytical"     // Normal state — data-driven observations
  | "encouraging";   // After discipline improvement — reinforce growth

export type CoachingTrigger =
  | "post_trade"
  | "streak_alert"
  | "daily_recap"
  | "pattern_detected"
  | "manual";

/** Snapshot of the trader's current psychological state for coaching context */
export interface TraderState {
  currentStreak: number;        // Positive = wins, negative = losses
  recentWinRate: number;        // Last 10 trades win rate
  disciplineScore: number;      // Current composite discipline score
  emotionalTrend: "improving" | "stable" | "deteriorating";
  lastEmotionBefore?: EmotionBefore;
  lastEmotionAfter?: EmotionAfter;
  activePatternsCount: number;  // Number of active behavioral alerts
  totalTrades: number;
  daysSinceLastTrade: number;
}

/** Coaching session record */
export interface CoachingSessionRecord {
  id: string;
  triggerType: CoachingTrigger;
  traderState: TraderState;
  aiResponse: string;
  aiTone: CoachingTone;
  tradeId?: string;
  createdAt: Date;
}

// ─── Insight Types ───────────────────────────────────────────

export type InsightCategory =
  | "psychology"
  | "execution"
  | "risk"
  | "pattern"
  | "recovery"
  | "strength";

export type InsightSeverity = "low" | "medium" | "high" | "positive";

export interface GeneratedInsight {
  category: InsightCategory;
  text: string;
  severity: InsightSeverity;
  isMemoryBacked: boolean;     // Whether this insight references historical memory
  relatedTradeIds?: string[];
}

// ─── Emotion Labels (for UI) ─────────────────────────────────

export const EMOTION_BEFORE_LABELS: Record<keyof EmotionBefore, { label: string; emoji: string; isNegative: boolean }> = {
  confidence: { label: "Confidence", emoji: "💪", isNegative: false },
  fear: { label: "Fear", emoji: "😰", isNegative: true },
  greed: { label: "Greed", emoji: "🤑", isNegative: true },
  revenge: { label: "Revenge", emoji: "😤", isNegative: true },
  impulsiveness: { label: "Impulsive", emoji: "⚡", isNegative: true },
  calmness: { label: "Calm", emoji: "🧘", isNegative: false },
  hesitation: { label: "Hesitation", emoji: "🤔", isNegative: true },
  focus: { label: "Focus", emoji: "🎯", isNegative: false },
};

export const EMOTION_AFTER_LABELS: Record<keyof EmotionAfter, { label: string; emoji: string; isNegative: boolean }> = {
  satisfaction: { label: "Satisfaction", emoji: "😊", isNegative: false },
  frustration: { label: "Frustration", emoji: "😤", isNegative: true },
  regret: { label: "Regret", emoji: "😔", isNegative: true },
  emotionalExhaustion: { label: "Exhaustion", emoji: "😩", isNegative: true },
  confidenceShift: { label: "Confidence Shift", emoji: "📊", isNegative: false },
  disappointment: { label: "Disappointment", emoji: "😞", isNegative: true },
};
