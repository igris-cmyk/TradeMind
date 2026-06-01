import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeDisciplineScore,
  countRevengeFreeDays,
  buildMilestones,
  buildDisciplineInsights,
} from "@/lib/discipline";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const trades = await prisma.trade.findMany({
      where: { userId },
      select: {
        status: true,
        pnl: true,
        emotions: true,
        createdAt: true,
        riskPercent: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const slices = trades.map((t) => ({
      status: t.status,
      pnl: t.pnl,
      emotions: t.emotions,
      createdAt: t.createdAt,
      riskPercent: t.riskPercent,
    }));

    const disciplineScore = computeDisciplineScore(slices);
    const revengeFreeDays = countRevengeFreeDays(slices);
    const milestones = buildMilestones(slices, disciplineScore, revengeFreeDays);
    const insights = buildDisciplineInsights(
      slices,
      disciplineScore,
      revengeFreeDays
    );

    const today = startOfDay(new Date());
    const existingSnapshot = await prisma.disciplineSnapshot.findFirst({
      where: { userId, recordedAt: { gte: today } },
    });
    if (!existingSnapshot) {
      await prisma.disciplineSnapshot.create({
        data: { userId, score: disciplineScore },
      });
    }

    const achieved = milestones.filter((m) => m.achieved);
    for (const m of achieved) {
      await prisma.milestoneUnlock.upsert({
        where: { userId_milestoneId: { userId, milestoneId: m.id } },
        create: {
          userId,
          milestoneId: m.id,
          title: m.title,
        },
        update: {},
      });
    }

    const storedUnlocks = await prisma.milestoneUnlock.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    const milestonesWithDates = milestones.map((m) => {
      const stored = storedUnlocks.find((u) => u.milestoneId === m.id);
      return {
        ...m,
        unlockedAt: stored?.unlockedAt?.toISOString() ?? null,
      };
    });

    const yesterday = await prisma.disciplineSnapshot.findFirst({
      where: {
        userId,
        recordedAt: { lt: today },
      },
      orderBy: { recordedAt: "desc" },
    });
    const scoreDelta = yesterday
      ? disciplineScore - yesterday.score
      : 0;

    return NextResponse.json({
      disciplineScore,
      scoreDelta,
      revengeFreeDays,
      milestones: milestonesWithDates,
      insights,
      achievedMilestones: achieved.length,
      totalMilestones: milestones.length,
      unlocks: storedUnlocks,
    });
  } catch (error) {
    console.error("[DISCIPLINE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
