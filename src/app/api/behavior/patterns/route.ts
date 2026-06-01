import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectPatterns } from "@/lib/ai/pattern-detector";
import type { EmotionBefore } from "@/types/behavioral";
import { hasPremiumAccess } from "@/lib/entitlements";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasPremiumAccess(session.user.id))) {
      return NextResponse.json({ error: "Premium plan required" }, { status: 403 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        pnl: true,
        emotions: true,
        emotionBefore: true,
        riskPercent: true,
        disciplineScore: true,
        createdAt: true,
        session: true,
      },
    });

    const tradeSlices = trades.map(t => ({
      id: t.id,
      status: t.status,
      pnl: t.pnl,
      emotions: t.emotions,
      emotionBefore: t.emotionBefore as EmotionBefore | null,
      riskPercent: t.riskPercent,
      disciplineScore: t.disciplineScore,
      createdAt: t.createdAt,
      session: t.session,
    }));

    const patterns = detectPatterns(tradeSlices);

    return NextResponse.json({ patterns });
  } catch (error) {
    console.error("[PATTERNS_GET]", error);
    return NextResponse.json({ error: "Failed to detect patterns" }, { status: 500 });
  }
}
