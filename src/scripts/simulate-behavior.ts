import { scoreExecution, computeIdentityMetrics, computeDisciplineScoreFromExecution } from "../lib/ai/execution-scorer";
import { generateInsightsFromData } from "../lib/ai/insight-generator";
import { detectPatterns } from "../lib/ai/pattern-detector";

type SyntheticTrade = {
  id: string;
  status: string;
  direction: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  rrAchieved: number;
  riskPercent: number;
  disciplineScore: number | null;
  session: string | null;
  emotions: string[];
  strategyTags: string[];
  notes: string;
  createdAt: Date;
  emotionBefore: {
    confidence: number;
    fear: number;
    greed: number;
    revenge: number;
    impulsiveness: number;
    calmness: number;
    hesitation: number;
    focus: number;
  };
  emotionAfter: {
    satisfaction: number;
    frustration: number;
    regret: number;
    emotionalExhaustion: number;
    confidenceShift: number;
    disappointment: number;
  };
};

/**
 * TradeMind Intelligence Simulation & Audit Script
 * 
 * Generates extreme behavioral edge-cases to stress-test the intelligence
 * engines and ensure outputs are emotionally realistic, statistically grounded,
 * and completely devoid of "chatbot" genericness.
 */

// --- 1. Synthetic Profiles ---

function createTiltCycleProfile(): SyntheticTrade[] {
  const trades: SyntheticTrade[] = [];
  const baseDate = new Date();
  
  // 3 normal trades
  for (let i = 0; i < 3; i++) {
    trades.push({
      id: `tc_${i}`,
      status: "WIN",
      direction: "LONG",
      entry: 100, stopLoss: 90, takeProfit: 120,
      pnl: 200, rrAchieved: 2, riskPercent: 1,
      disciplineScore: null, session: "NY AM",
      emotions: ["calm"], strategyTags: ["Breakout"], notes: "Clean setup",
      createdAt: new Date(baseDate.getTime() - (10 - i) * 86400000),
      emotionBefore: { confidence: 7, fear: 1, greed: 2, revenge: 0, impulsiveness: 1, calmness: 8, hesitation: 1, focus: 8 },
      emotionAfter: { satisfaction: 8, frustration: 0, regret: 0, emotionalExhaustion: 1, confidenceShift: 1, disappointment: 0 }
    });
  }

  // 1 initial loss
  trades.push({
    id: `tc_loss`, status: "LOSS", direction: "SHORT",
    entry: 100, stopLoss: 105, takeProfit: 90, pnl: -100, rrAchieved: -1, riskPercent: 1.5,
    disciplineScore: null, session: "NY AM",
    emotions: ["frustrated"], strategyTags: ["Mean Reversion"], notes: "Stopped out",
    createdAt: new Date(baseDate.getTime() - 2 * 86400000),
    emotionBefore: { confidence: 6, fear: 3, greed: 4, revenge: 0, impulsiveness: 3, calmness: 6, hesitation: 2, focus: 6 },
    emotionAfter: { satisfaction: 1, frustration: 7, regret: 4, emotionalExhaustion: 3, confidenceShift: -2, disappointment: 6 }
  });

  // 3 Revenge trades scaling risk
  for (let i = 1; i <= 3; i++) {
    trades.push({
      id: `tc_rev_${i}`, status: "LOSS", direction: "LONG",
      entry: 100, stopLoss: 90 - (i * 2), takeProfit: 150, pnl: -200 * i, rrAchieved: -1, riskPercent: 1 + i, // Scaling risk!
      disciplineScore: null, session: "NY AM",
      emotions: ["revenge", "fearful", "impulsive"], strategyTags: [], notes: "Need to make it back",
      createdAt: new Date(baseDate.getTime() - (2 * 86400000) + (i * 3600000)), // Same day, subsequent hours
      emotionBefore: { confidence: 4, fear: 7, greed: 8, revenge: 9, impulsiveness: 9, calmness: 1, hesitation: 0, focus: 2 },
      emotionAfter: { satisfaction: 0, frustration: 10, regret: 9, emotionalExhaustion: 9, confidenceShift: -4, disappointment: 10 }
    });
  }

  return trades;
}

function createPerfectRobotProfile(): SyntheticTrade[] {
  const trades: SyntheticTrade[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < 15; i++) {
    const isWin = i % 3 !== 0; // 66% win rate
    trades.push({
      id: `rob_${i}`, status: isWin ? "WIN" : "LOSS", direction: "LONG",
      entry: 100, stopLoss: 95, takeProfit: 110,
      pnl: isWin ? 200 : -100, rrAchieved: isWin ? 2 : -1, riskPercent: 1.0, // Perfect consistent risk
      disciplineScore: null, session: "London",
      emotions: ["calm", "focused"], strategyTags: ["A+ Setup"], notes: "Followed the plan",
      createdAt: new Date(baseDate.getTime() - (15 - i) * 86400000),
      emotionBefore: { confidence: 8, fear: 0, greed: 0, revenge: 0, impulsiveness: 0, calmness: 9, hesitation: 0, focus: 9 },
      emotionAfter: { satisfaction: isWin ? 7 : 5, frustration: 0, regret: 0, emotionalExhaustion: 1, confidenceShift: 0, disappointment: isWin ? 0 : 2 }
    });
  }
  return trades;
}

// --- 2. Validation Runner ---

function runValidation() {
  console.log("==========================================");
  console.log("🧠 TRADEMIND COGNITIVE ENGINE AUDIT");
  console.log("==========================================\n");

  const profiles = [
    { name: "Tilt & Revenge Cycle", trades: createTiltCycleProfile() },
    { name: "Perfect Robot Execution", trades: createPerfectRobotProfile() },
  ];

  for (const profile of profiles) {
    console.log(`\n\n=== 🧑‍💻 AUDITING PROFILE: ${profile.name} ===\n`);
    
    // Calculate Discipline & Identity for the last trade
    const lastTrade = profile.trades[profile.trades.length - 1];
    
    // Build history context
    let recentStreak = 0;
    for (const t of profile.trades) {
      if (t.status === "WIN") { if (recentStreak < 0) recentStreak = 0; recentStreak++; }
      else if (t.status === "LOSS") { if (recentStreak > 0) recentStreak = 0; recentStreak--; }
    }
    
    const context = {
      avgRiskPercent: profile.trades.reduce((s: number, t: SyntheticTrade) => s + t.riskPercent, 0) / profile.trades.length,
      avgRR: profile.trades.reduce((s: number, t: SyntheticTrade) => s + t.rrAchieved, 0) / profile.trades.length,
      recentStreak,
      totalTrades: profile.trades.length
    };

    const scores = scoreExecution(lastTrade, context);
    const disciplineScore = computeDisciplineScoreFromExecution(scores);
    const identity = computeIdentityMetrics(scores, context);

    console.log(`[DISCIPLINE SCORE] ${disciplineScore}/100`);
    console.log(`[IDENTITY METRICS]`);
    console.log(`  - Execution Integrity: ${identity.executionIntegrity}`);
    console.log(`  - Emotional Stability: ${identity.emotionalStability}`);
    console.log(`  - Risk Consistency:    ${identity.riskConsistency}`);
    console.log(`  - Cognitive Control:   ${identity.cognitiveControl}`);
    console.log(`  - Recovery Rate:       ${identity.recoveryRate}`);

    // Detect Patterns
    const patterns = detectPatterns(profile.trades);
    console.log(`\n[ACTIVE PATTERNS DETECTED: ${patterns.length}]`);
    patterns.forEach(p => console.log(`  🚨 [${p.severity.toUpperCase()}] ${p.title} - ${p.description}`));

    // Generate Insights
    const insights = generateInsightsFromData(profile.trades);
    console.log(`\n[DEEP INSIGHTS GENERATED: ${insights.length}]`);
    insights.forEach(i => console.log(`  💡 [${i.category}] ${i.text}`));
  }
  
  console.log("\n==========================================");
  console.log("✅ AUDIT COMPLETE");
  console.log("==========================================\n");
}

runValidation();
