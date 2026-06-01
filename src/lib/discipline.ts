/**
 * Discipline & retention scoring — computed from trade history.
 * No DB schema changes; pure analytics for psychology UX.
 */

export type DisciplineMilestone = {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  progress?: number;
  icon: "flame" | "shield" | "brain" | "target" | "sparkles";
};

export type DisciplineInsight = {
  type: "positive" | "warning" | "neutral";
  message: string;
};

type TradeSlice = {
  status: string;
  pnl: number | null;
  emotions: string[];
  createdAt: Date;
  riskPercent: number | null;
};

const REVENGE_EMOTIONS = ["revenge", "frustrated", "fomo", "angry", "impulsive"];

export function computeDisciplineScore(trades: TradeSlice[]): number {
  if (trades.length === 0) return 0;

  let score = 50;

  const withEmotions = trades.filter((t) => t.emotions.length > 0).length;
  const emotionRate = withEmotions / trades.length;
  score += Math.min(20, emotionRate * 25);

  const closed = trades.filter((t) => t.status !== "OPEN");
  if (closed.length >= 3) {
    const revengeTagged = closed.filter((t) =>
      t.emotions.some((e) => REVENGE_EMOTIONS.includes(e.toLowerCase()))
    ).length;
    const revengeRate = revengeTagged / closed.length;
    score -= Math.min(25, revengeRate * 40);
  }

  const recent = [...trades].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  let lossStreak = 0;
  for (const t of recent) {
    if (t.status === "LOSS") lossStreak++;
    else break;
  }
  if (lossStreak >= 3) score -= 15;
  else if (lossStreak === 0 && recent.some((t) => t.status === "WIN")) score += 10;

  const wins = closed.filter((t) => t.status === "WIN").length;
  const winRate = closed.length > 0 ? wins / closed.length : 0;
  if (winRate >= 0.5 && closed.length >= 5) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function countRevengeFreeDays(trades: TradeSlice[]): number {
  const sorted = [...trades].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  let days = 0;
  const seenDays = new Set<string>();

  for (const t of sorted) {
    const day = t.createdAt.toISOString().slice(0, 10);
    if (seenDays.has(day)) continue;
    seenDays.add(day);

    const isRevenge =
      t.emotions.some((e) => REVENGE_EMOTIONS.includes(e.toLowerCase())) ||
      (t.status === "LOSS" && days > 0 && !t.emotions.length);

    if (isRevenge && t.status === "LOSS") break;
    if (t.status === "LOSS" && t.emotions.some((e) => REVENGE_EMOTIONS.includes(e.toLowerCase())))
      break;

    days++;
    if (days >= 30) break;
  }

  return Math.min(days, 30);
}

export function buildMilestones(
  trades: TradeSlice[],
  disciplineScore: number,
  revengeFreeDays: number
): DisciplineMilestone[] {
  const total = trades.length;
  const withEmotions = trades.filter((t) => t.emotions.length > 0).length;

  return [
    {
      id: "first-10",
      title: "Foundation Builder",
      description: "Log 10 trades with consistent journaling",
      achieved: total >= 10,
      progress: Math.min(100, (total / 10) * 100),
      icon: "target",
    },
    {
      id: "emotion-awareness",
      title: "Emotion Tracker",
      description: "Tag emotions on 50% of your trades",
      achieved: total > 0 && withEmotions / total >= 0.5,
      progress: total > 0 ? Math.min(100, (withEmotions / total) * 100) : 0,
      icon: "brain",
    },
    {
      id: "revenge-free-7",
      title: "Disciplined Week",
      description: "7 days without revenge-tagged trades",
      achieved: revengeFreeDays >= 7,
      progress: Math.min(100, (revengeFreeDays / 7) * 100),
      icon: "shield",
    },
    {
      id: "score-70",
      title: "Elite Discipline",
      description: "Reach a discipline score of 70+",
      achieved: disciplineScore >= 70,
      progress: Math.min(100, disciplineScore),
      icon: "sparkles",
    },
    {
      id: "win-streak-3",
      title: "Hot Streak",
      description: "3 consecutive winning trades",
      achieved: hasWinStreak(trades, 3),
      icon: "flame",
    },
  ];
}

function hasWinStreak(trades: TradeSlice[], n: number): boolean {
  const sorted = [...trades].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  let streak = 0;
  for (const t of sorted) {
    if (t.status === "WIN") streak++;
    else if (t.status === "LOSS" || t.status === "BREAKEVEN") break;
    if (streak >= n) return true;
  }
  return false;
}

export function buildDisciplineInsights(
  trades: TradeSlice[],
  disciplineScore: number,
  revengeFreeDays: number
): DisciplineInsight[] {
  const insights: DisciplineInsight[] = [];

  if (revengeFreeDays >= 7) {
    insights.push({
      type: "positive",
      message: `You've avoided revenge trading for ${revengeFreeDays} days. Keep protecting your capital.`,
    });
  } else if (revengeFreeDays >= 3) {
    insights.push({
      type: "neutral",
      message: `${revengeFreeDays} days clean — ${7 - revengeFreeDays} more to unlock your Disciplined Week milestone.`,
    });
  }

  const sorted = [...trades].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  let lossStreak = 0;
  for (const t of sorted) {
    if (t.status === "LOSS") lossStreak++;
    else break;
  }
  if (lossStreak >= 3) {
    insights.push({
      type: "warning",
      message: `${lossStreak}-trade losing streak detected. Consider stepping away until your next session.`,
    });
  }

  if (disciplineScore >= 70) {
    insights.push({
      type: "positive",
      message: `Discipline score at ${disciplineScore} — you're trading with institutional-level self-awareness.`,
    });
  } else if (disciplineScore < 40 && trades.length >= 5) {
    insights.push({
      type: "warning",
      message: "Tag emotions on every trade to improve your discipline score and unlock deeper insights.",
    });
  }

  const emotionRate =
    trades.length > 0
      ? trades.filter((t) => t.emotions.length > 0).length / trades.length
      : 0;
  if (emotionRate < 0.3 && trades.length >= 3) {
    insights.push({
      type: "neutral",
      message: "Only " + Math.round(emotionRate * 100) + "% of trades have emotion tags. Power users tag 80%+.",
    });
  }

  if (insights.length === 0 && trades.length > 0) {
    insights.push({
      type: "neutral",
      message: "Log more trades with emotion tags to unlock personalized behavioral coaching.",
    });
  }

  return insights;
}
