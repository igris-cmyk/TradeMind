import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/trades/stats — aggregated stats for dashboard
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      select: { pnl: true, rrAchieved: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.status === "WIN").length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgRR =
      trades.filter((t) => t.rrAchieved != null).length > 0
        ? trades
            .filter((t) => t.rrAchieved != null)
            .reduce((sum, t) => sum + (t.rrAchieved || 0), 0) /
          trades.filter((t) => t.rrAchieved != null).length
        : 0;

    // Calculate streak
    let currentStreak = 0;
    if (trades.length > 0) {
      const firstStatus = trades[0].status;
      if (firstStatus === "WIN" || firstStatus === "LOSS") {
        currentStreak = 1;
        for (let i = 1; i < trades.length; i++) {
          if (trades[i].status === firstStatus) {
            currentStreak++;
          } else {
            break;
          }
        }
        if (firstStatus === "LOSS") currentStreak = -currentStreak;
      }
    }

    return NextResponse.json({
      totalTrades,
      winRate: Math.round(winRate * 10) / 10,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgRR: Math.round(avgRR * 100) / 100,
      currentStreak,
    });
  } catch (error) {
    console.error("[TRADES_STATS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
