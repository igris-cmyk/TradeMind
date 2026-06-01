import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const existing = await prisma.sessionRecap.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } },
    });

    if (existing?.dismissed) {
      return NextResponse.json({ show: false });
    }

    const dayStart = startOfDay(new Date());
    const dayEnd = endOfDay(new Date());

    const todayTrades = await prisma.trade.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      select: { pnl: true, status: true, pair: true, emotions: true },
    });

    if (todayTrades.length === 0) {
      return NextResponse.json({ show: false });
    }

    const totalPnl = todayTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    const wins = todayTrades.filter((t) => t.status === "WIN").length;
    const losses = todayTrades.filter((t) => t.status === "LOSS").length;
    const winRate = Math.round((wins / todayTrades.length) * 100);

    const summary = {
      tradesCount: todayTrades.length,
      totalPnl: Math.round(totalPnl * 100) / 100,
      wins,
      losses,
      winRate,
      bestPair: todayTrades.reduce(
        (best, t) => ((t.pnl || 0) > (best.pnl || 0) ? t : best),
        todayTrades[0]
      ).pair,
      message:
        totalPnl >= 0
          ? `Solid session — +$${totalPnl.toFixed(2)} across ${todayTrades.length} trades.`
          : `Tough session — review your last ${losses} loss(es) before tomorrow.`,
    };

    if (!existing) {
      await prisma.sessionRecap.create({
        data: {
          userId: session.user.id,
          date: today,
          summary,
        },
      });
    }

    return NextResponse.json({ show: true, date: today, summary });
  } catch (error) {
    console.error("[SESSION_RECAP_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = format(new Date(), "yyyy-MM-dd");
    await prisma.sessionRecap.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      create: {
        userId: session.user.id,
        date: today,
        summary: {},
        dismissed: true,
      },
      update: { dismissed: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[SESSION_RECAP_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
