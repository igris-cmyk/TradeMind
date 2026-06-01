import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { scoreExecution, computeDisciplineScoreFromExecution, computeIdentityMetrics } from "@/lib/ai/execution-scorer";
import type { EmotionBefore, EmotionAfter } from "@/types/behavioral";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { hasPremiumAccess } from "@/lib/entitlements";
import { env } from "@/lib/env";

const aiAnalysisSchema = z.object({
  summary: z.string(),
  mistakes: z.array(z.string()),
  emotionalPatterns: z.array(z.string()),
});

// Initialize Redis only if tokens are provided
const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Create a new ratelimiter, that allows 5 requests per 1 hour
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
    })
  : null;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasPremiumAccess(session.user.id))) {
      return NextResponse.json({ error: "Premium plan required" }, { status: 403 });
    }

    const tradeId = params.id;

    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
      const { success, limit, reset, remaining } = await ratelimit.limit(`ai_analyze_${session.user.id}_${ip}`);
      
      if (!success) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            }
          }
        );
      }
    }

    const trade = await prisma.trade.findFirst({ 
      where: { id: tradeId, userId: session.user.id } 
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // 1. Compute Execution Quality (Phase 2 Intelligence)
    const recentHistory = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { riskPercent: true, rrAchieved: true, status: true }
    });

    const avgRiskPercent = recentHistory.reduce((s, t) => s + (t.riskPercent || 0), 0) / (recentHistory.length || 1);
    const avgRR = recentHistory.reduce((s, t) => s + (t.rrAchieved || 0), 0) / (recentHistory.length || 1);

    let recentStreak = 0;
    for (const t of recentHistory) {
      if (t.status === "WIN") { if (recentStreak < 0) break; recentStreak++; }
      else if (t.status === "LOSS") { if (recentStreak > 0) break; recentStreak--; }
      else break;
    }

    const tradeForScoring = {
      ...trade,
      emotionBefore: trade.emotionBefore as EmotionBefore | null,
      emotionAfter: trade.emotionAfter as EmotionAfter | null,
    };

    const historyContext = {
      avgRiskPercent,
      avgRR,
      recentStreak,
      totalTrades: recentHistory.length,
    };

    const executionScores = scoreExecution(tradeForScoring, historyContext);
    
    const disciplineScore = computeDisciplineScoreFromExecution(executionScores);
    
    const identityMetrics = computeIdentityMetrics(executionScores, historyContext);

    // Update trade with new scores
    await prisma.trade.update({
      where: { id: trade.id },
      data: {
        executionScores: executionScores as unknown as Prisma.InputJsonValue,
        disciplineScore,
        identityMetrics: identityMetrics as unknown as Prisma.InputJsonValue,
      }
    });

    // Compute and update User's Global Identity (average of last 10 scored trades)
    const recentScoredTrades = await prisma.trade.findMany({
      where: { userId: session.user.id, identityMetrics: { not: Prisma.DbNull } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { identityMetrics: true }
    });

    if (recentScoredTrades.length > 0) {
      const sums = { executionIntegrity: 0, emotionalStability: 0, riskConsistency: 0, cognitiveControl: 0, recoveryRate: 0 };
      for (const t of recentScoredTrades) {
        const m = t.identityMetrics as unknown as Record<string, number>;
        sums.executionIntegrity += m.executionIntegrity || 0;
        sums.emotionalStability += m.emotionalStability || 0;
        sums.riskConsistency += m.riskConsistency || 0;
        sums.cognitiveControl += m.cognitiveControl || 0;
        sums.recoveryRate += m.recoveryRate || 0;
      }
      const count = recentScoredTrades.length;
      const globalIdentity = {
        executionIntegrity: Math.round(sums.executionIntegrity / count),
        emotionalStability: Math.round(sums.emotionalStability / count),
        riskConsistency: Math.round(sums.riskConsistency / count),
        cognitiveControl: Math.round(sums.cognitiveControl / count),
        recoveryRate: Math.round(sums.recoveryRate / count),
      };

      await prisma.user.update({
        where: { id: session.user.id },
        data: { identityMetrics: globalIdentity as unknown as Prisma.InputJsonValue }
      });
    }

    // 2. Generate AI Summary
    const hasApiKey = !!env.OPENAI_API_KEY;
    let analysisData;

    if (hasApiKey) {
      const prompt = `Analyze the following trading journal entry as a professional trading coach.
      
Trade Details:
Pair: ${trade.pair}
Direction: ${trade.direction}
Entry: ${trade.entry}
Stop Loss: ${trade.stopLoss}
Take Profit: ${trade.takeProfit}
PnL: ${trade.pnl}
Emotions: ${trade.emotions.join(", ")}
Strategies: ${trade.strategyTags.join(", ")}
Notes: ${trade.notes}
Discipline Score: ${disciplineScore}/100

Provide a summary, identify any mistakes made, and note any emotional patterns. Be concise and professional.`;

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: aiAnalysisSchema,
        prompt,
      });
      analysisData = object;
    } else {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "AI analysis is not configured" },
          { status: 503 }
        );
      }

      // Mock Response for Testing Environment
      await new Promise((resolve) => setTimeout(resolve, 1500));
      analysisData = {
        summary: "This trade showed reasonable execution based on the metrics. Ensure you continue following your system rules and managing risk appropriately.",
        mistakes: ["Potential hesitation before entry", "Missed optimal exit point"],
        emotionalPatterns: ["Fear", "Hesitation"],
      };
    }

    // Save to DB
    const savedAnalysis = await prisma.aIAnalysis.upsert({
      where: { tradeId },
      create: {
        tradeId,
        summary: analysisData.summary,
        mistakes: analysisData.mistakes,
        emotionalPatterns: analysisData.emotionalPatterns,
        riskScore: executionScores.riskIntegrity, // Map execution score to legacy risk score
        qualityScore: Math.round(disciplineScore / 10), // Map discipline to legacy 1-10 quality score
        rawResponse: { ...analysisData, executionScores: executionScores as unknown as Prisma.InputJsonValue },
      },
      update: {
        summary: analysisData.summary,
        mistakes: analysisData.mistakes,
        emotionalPatterns: analysisData.emotionalPatterns,
        riskScore: executionScores.riskIntegrity,
        qualityScore: Math.round(disciplineScore / 10),
        rawResponse: { ...analysisData, executionScores: executionScores as unknown as Prisma.InputJsonValue },
      },
    });

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("Error analyzing trade:", error);
    return NextResponse.json(
      { error: "Failed to analyze trade" },
      { status: 500 }
    );
  }
}
