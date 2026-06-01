/**
 * TradeMind Adaptive Coaching Engine
 * 
 * Determines coaching tone and generates context-rich AI prompts
 * based on trader state, memory, and detected patterns.
 */

import type {
  CoachingTone,
  TraderState,
  BehaviorMemoryRecord,
  BehaviorAlert,
} from "@/types/behavioral";

/**
 * Determine the appropriate coaching tone based on trader's current state.
 */
export function determineCoachingTone(state: TraderState): CoachingTone {
  if (state.currentStreak <= -3 && state.emotionalTrend === "deteriorating") {
    return "recovery";
  }
  if (state.activePatternsCount >= 2) return "cautionary";
  if (state.currentStreak >= 3) return "stabilizing";
  if (state.emotionalTrend === "improving" && state.disciplineScore >= 70) return "encouraging";
  return "analytical";
}

/**
 * Generate a comprehensive coaching prompt with full context.
 */
export function generateCoachingPrompt(
  state: TraderState,
  memories: BehaviorMemoryRecord[],
  activeAlerts: BehaviorAlert[],
  memorySummary: string
): string {
  const tone = determineCoachingTone(state);

  let toneInstructions = "";
  if (tone === "recovery") {
    toneInstructions = `TONE: Stabilizing, calm, emotionally grounding. Focus on process, not PnL. De-escalate panic or tilt. Speak slowly and deliberately. Avoid cheerleading.`;
  } else if (tone === "analytical") {
    toneInstructions = `TONE: Performance-oriented, data-driven, precise. Provide cold, objective feedback based on metrics. Neutral and professional.`;
  } else if (tone === "cautionary") {
    toneInstructions = `TONE: Controlled, warning-oriented, firm. Highlight the immediate behavioral risk. Tell them what not to do next. Be direct but not scolding.`;
  } else if (tone === "stabilizing") {
    toneInstructions = `TONE: Grounding. Prevent overconfidence during this winning streak. Remind them that edge plays out over 1000 trades, not the last 3.`;
  } else {
    toneInstructions = `TONE: Confident, affirming, consistency-oriented. Acknowledge growth without inflating ego.`;
  }

  return `You are an elite quantitative performance psychologist advising a professional trader.
Your goal is to provide deep, statistically-grounded, and behaviorally realistic analysis.
NEVER sound like a motivational speaker. NEVER use the words "buckle up", "you got this", or "stay strong".
NEVER sound like a generic AI chatbot.

${toneInstructions}

TRADER DATA SUMMARY:
- Recent Streak: ${state.currentStreak > 0 ? `${state.currentStreak}W` : state.currentStreak < 0 ? `${Math.abs(state.currentStreak)}L` : "0"}
- Recent Win Rate: ${Math.round(state.recentWinRate * 100)}%
- Current Discipline Score: ${state.disciplineScore}/100
- Emotional Trend: ${state.emotionalTrend.toUpperCase()}
- Total Logged Trades: ${state.totalTrades}

BEHAVIORAL MEMORY LOGS:
${memorySummary}

${activeAlerts.length > 0 ? `ACTIVE RISK ALERTS (ADDRESS THESE DIRECTLY):\n${activeAlerts.map(a => `- [${a.severity.toUpperCase()}] ${a.title}: ${a.description}`).join("\n")}` : ""}

Provide 2 to 3 short paragraphs of coaching. Reference their specific historical data and active alerts. Give ONE precise, actionable behavioral rule for their next session.`;
}

/**
 * Build a snapshot of the trader's current state from trade data.
 */
export function buildTraderState(params: {
  trades: Array<{ status: string; pnl: number | null; disciplineScore: number | null; createdAt: Date }>;
  activePatternsCount: number;
}): TraderState {
  const { trades, activePatternsCount } = params;
  const sorted = [...trades].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  let currentStreak = 0;
  for (const trade of sorted) {
    if (trade.status === "WIN") { if (currentStreak < 0) break; currentStreak++; }
    else if (trade.status === "LOSS") { if (currentStreak > 0) break; currentStreak--; }
    else break;
  }

  const closed = sorted.filter(t => t.status !== "OPEN").slice(0, 10);
  const recentWinRate = closed.length > 0 ? closed.filter(t => t.status === "WIN").length / closed.length : 0;

  const scored = sorted.filter(t => t.disciplineScore !== null).slice(0, 10);
  const r5 = scored.slice(0, 5);
  const o5 = scored.slice(5, 10);
  const rAvg = r5.length > 0 ? r5.reduce((s, t) => s + (t.disciplineScore || 0), 0) / r5.length : 50;
  const oAvg = o5.length > 0 ? o5.reduce((s, t) => s + (t.disciplineScore || 0), 0) / o5.length : rAvg;

  let emotionalTrend: "improving" | "stable" | "deteriorating" = "stable";
  if (rAvg > oAvg + 5) emotionalTrend = "improving";
  else if (rAvg < oAvg - 5) emotionalTrend = "deteriorating";

  const daysSinceLastTrade = sorted.length > 0
    ? Math.floor((Date.now() - sorted[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    currentStreak,
    recentWinRate,
    disciplineScore: Math.round(rAvg),
    emotionalTrend,
    activePatternsCount,
    totalTrades: trades.length,
    daysSinceLastTrade,
  };
}
