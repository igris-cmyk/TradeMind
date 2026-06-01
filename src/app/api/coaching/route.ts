import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildTraderState, generateCoachingPrompt, determineCoachingTone } from "@/lib/ai/coaching-engine";
import { detectPatterns } from "@/lib/ai/pattern-detector";
import { retrieveTraderMemory, buildMemorySummary } from "@/lib/ai/memory-engine";
import type { EmotionBefore, BehaviorAlert } from "@/types/behavioral";
import { hasPremiumAccess } from "@/lib/entitlements";
import { env } from "@/lib/env";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasPremiumAccess(session.user.id))) {
      return NextResponse.json({ error: "Premium plan required" }, { status: 403 });
    }

    // Fetch recent trades
    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, status: true, pnl: true, emotions: true,
        emotionBefore: true, riskPercent: true, disciplineScore: true,
        createdAt: true, session: true,
      },
    });

    if (trades.length < 3) {
      return NextResponse.json({
        response: "Log at least 3 trades to receive personalized coaching. The more data I have, the more precise my observations become.",
        tone: "analytical",
      });
    }

    // Build context
    const tradeSlices = trades.map(t => ({
      id: t.id, status: t.status, pnl: t.pnl,
      emotions: t.emotions,
      emotionBefore: t.emotionBefore as EmotionBefore | null,
      riskPercent: t.riskPercent, disciplineScore: t.disciplineScore,
      createdAt: t.createdAt, session: t.session,
    }));

    const patterns = detectPatterns(tradeSlices);
    const traderState = buildTraderState({
      trades: trades.map(t => ({
        status: t.status, pnl: t.pnl,
        disciplineScore: t.disciplineScore, createdAt: t.createdAt,
      })),
      activePatternsCount: patterns.length,
    });

    const [memories, memorySummary] = await Promise.all([
      retrieveTraderMemory(session.user.id, { limit: 10 }),
      buildMemorySummary(session.user.id),
    ]);

    const tone = determineCoachingTone(traderState);

    // Check for OpenAI API key
    const hasApiKey = !!env.OPENAI_API_KEY;

    let response: string;

    if (hasApiKey) {
      const { generateText } = await import("ai");
      const { openai } = await import("@ai-sdk/openai");

      const prompt = generateCoachingPrompt(traderState, memories, patterns as BehaviorAlert[], memorySummary);
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxOutputTokens: 500,
      });
      response = text;
    } else {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "AI coaching is not configured" },
          { status: 503 }
        );
      }

      // Intelligent mock based on actual trader state
      await new Promise(r => setTimeout(r, 1000));
      response = generateMockCoaching(traderState, patterns as BehaviorAlert[]);
    }

    // Save coaching session
    const saved = await prisma.coachingSession.create({
      data: {
        userId: session.user.id,
        triggerType: "manual",
        traderState: traderState as unknown as Prisma.InputJsonValue,
        aiResponse: response,
        aiTone: tone,
      },
    });

    return NextResponse.json({
      id: saved.id,
      response,
      tone,
      traderState,
      patternsDetected: patterns.length,
    });
  } catch (error) {
    console.error("[COACHING_POST]", error);
    return NextResponse.json({ error: "Failed to generate coaching" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasPremiumAccess(session.user.id))) {
      return NextResponse.json({ error: "Premium plan required" }, { status: 403 });
    }

    const sessions = await prisma.coachingSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[COACHING_GET]", error);
    return NextResponse.json({ error: "Failed to fetch coaching" }, { status: 500 });
  }
}

function generateMockCoaching(state: TraderState, alerts: BehaviorAlert[]): string {
  if (state.currentStreak <= -3) {
    return `You're ${Math.abs(state.currentStreak)} trades deep into a losing streak, and your discipline score sits at ${state.disciplineScore}/100. This is where most traders make their costliest mistakes — not during the streak itself, but in the desperate attempts to recover from it.\n\nYour recent win rate of ${Math.round(state.recentWinRate * 100)}% tells me the edge isn't gone, but your execution is compromised. Step away from the charts for at least one full session. When you return, trade at half your normal position size for the next 3 trades. Rebuild confidence through process, not P&L.`;
  }

  if (state.currentStreak >= 3) {
    return `${state.currentStreak} consecutive wins. Your discipline score is ${state.disciplineScore}/100 and win rate sits at ${Math.round(state.recentWinRate * 100)}%. This is precisely the moment your risk management gets tested.\n\nStreaks create a false sense of invincibility. The data shows your edge is real, but it doesn't change. Keep your position sizing locked at your pre-defined level. The traders who survive are the ones who trade the same size on trade 50 as they did on trade 5.`;
  }

  if (alerts.length > 0) {
    const alert = alerts[0];
    return `I've detected a ${alert.title.toLowerCase()} pattern in your recent activity. ${alert.description}\n\n${alert.recommendedAction}\n\nYour current discipline score is ${state.disciplineScore}/100. Focus on bringing this back above 70 before scaling any positions.`;
  }

  return `Across ${state.totalTrades} trades, your discipline score averages ${state.disciplineScore}/100 with a recent win rate of ${Math.round(state.recentWinRate * 100)}%. Your emotional trend is ${state.emotionalTrend}.\n\nTag emotions on every trade entry and exit. The behavioral data you're building now becomes the foundation for deeper pattern recognition. The more honest your self-reporting, the more precise my observations become.`;
}

type TraderState = {
  currentStreak: number;
  recentWinRate: number;
  disciplineScore: number;
  emotionalTrend: string;
  activePatternsCount: number;
  totalTrades: number;
  daysSinceLastTrade: number;
};
