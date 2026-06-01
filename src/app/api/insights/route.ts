import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInsightsFromData } from "@/lib/ai/insight-generator";
import { hasPremiumAccess } from "@/lib/entitlements";
import type { EmotionBefore } from "@/types/behavioral";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasPremiumAccess(session.user.id))) {
      return NextResponse.json({ error: "Premium plan required" }, { status: 403 });
    }

    // Fetch the user's trades for analysis
    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100, // Look at the last 100 trades for insights
      select: {
        id: true,
        status: true,
        pnl: true,
        emotions: true,
        session: true,
        strategyTags: true,
        riskPercent: true,
        disciplineScore: true,
        sleepQuality: true,
        fatigueLevel: true,
        emotionBefore: true,
        createdAt: true,
      },
    });

    if (trades.length < 3) {
      return NextResponse.json(
        { error: "Log at least 3 trades to generate insights." },
        { status: 400 }
      );
    }

    // Generate data-driven insights
    const generatedInsights = generateInsightsFromData(
      trades.map((trade) => ({
        ...trade,
        emotionBefore: trade.emotionBefore as EmotionBefore | null,
      }))
    );

    if (generatedInsights.length === 0) {
      return NextResponse.json(
        { error: "Not enough varied data to generate meaningful insights yet." },
        { status: 400 }
      );
    }

    // Save to DB
    const savedInsights = await Promise.all(
      generatedInsights.map((insight) =>
        prisma.insight.create({
          data: {
            userId: session.user.id,
            category: insight.category,
            text: insight.text,
            severity: insight.severity,
          },
        })
      )
    );

    return NextResponse.json(savedInsights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
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

    const insights = await prisma.insight.findMany({
      where: { userId: session.user.id },
      orderBy: { generatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json(insights);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
