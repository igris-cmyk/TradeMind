import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays, parseISO } from "date-fns";

// GET /api/trades/analytics — aggregated chart data
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30");

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: subDays(new Date(), days) },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        pair: true,
        direction: true,
        entry: true,
        stopLoss: true,
        takeProfit: true,
        pnl: true,
        rrAchieved: true,
        status: true,
        session: true,
        strategyTags: true,
        emotions: true,
        createdAt: true,
      },
    });

    // ─── Equity Curve ────────────────────────────────────────
    let cumPnl = 0;
    const equityCurve = trades.map((t) => {
      cumPnl += t.pnl || 0;
      return {
        date: format(t.createdAt, "MMM dd"),
        fullDate: format(t.createdAt, "yyyy-MM-dd"),
        pnl: t.pnl || 0,
        cumPnl: Math.round(cumPnl * 100) / 100,
        pair: t.pair,
      };
    });

    // ─── Daily P&L ───────────────────────────────────────────
    const dailyMap = new Map<string, number>();
    trades.forEach((t) => {
      const day = format(t.createdAt, "yyyy-MM-dd");
      dailyMap.set(day, (dailyMap.get(day) || 0) + (t.pnl || 0));
    });

    const dailyPnl = Array.from(dailyMap.entries()).map(([date, pnl]) => ({
      date: format(parseISO(date), "MMM dd"),
      fullDate: date,
      pnl: Math.round(pnl * 100) / 100,
    }));

    // ─── Win Rate by Session ─────────────────────────────────
    const sessionMap = new Map<string, { wins: number; total: number }>();
    trades.forEach((t) => {
      if (!t.session) return;
      const existing = sessionMap.get(t.session) || { wins: 0, total: 0 };
      existing.total++;
      if (t.status === "WIN") existing.wins++;
      sessionMap.set(t.session, existing);
    });

    const winRateBySession = Array.from(sessionMap.entries()).map(([session, data]) => ({
      name: session,
      winRate: data.total > 0 ? Math.round((data.wins / data.total) * 1000) / 10 : 0,
      wins: data.wins,
      losses: data.total - data.wins,
      total: data.total,
    }));

    // ─── Win Rate by Pair ────────────────────────────────────
    const pairMap = new Map<string, { wins: number; total: number; pnl: number }>();
    trades.forEach((t) => {
      const existing = pairMap.get(t.pair) || { wins: 0, total: 0, pnl: 0 };
      existing.total++;
      existing.pnl += t.pnl || 0;
      if (t.status === "WIN") existing.wins++;
      pairMap.set(t.pair, existing);
    });

    const pairPerformance = Array.from(pairMap.entries())
      .map(([pair, data]) => ({
        name: pair,
        winRate: data.total > 0 ? Math.round((data.wins / data.total) * 1000) / 10 : 0,
        pnl: Math.round(data.pnl * 100) / 100,
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // ─── Strategy Performance ────────────────────────────────
    const strategyMap = new Map<string, { wins: number; total: number; pnl: number }>();
    trades.forEach((t) => {
      (t.strategyTags || []).forEach((tag) => {
        const existing = strategyMap.get(tag) || { wins: 0, total: 0, pnl: 0 };
        existing.total++;
        existing.pnl += t.pnl || 0;
        if (t.status === "WIN") existing.wins++;
        strategyMap.set(tag, existing);
      });
    });

    const strategyPerformance = Array.from(strategyMap.entries())
      .map(([strategy, data]) => ({
        name: strategy,
        winRate: data.total > 0 ? Math.round((data.wins / data.total) * 1000) / 10 : 0,
        pnl: Math.round(data.pnl * 100) / 100,
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total);

    // ─── Emotion Correlation ─────────────────────────────────
    const emotionMap = new Map<string, { wins: number; total: number; pnl: number }>();
    trades.forEach((t) => {
      (t.emotions || []).forEach((emotion) => {
        const existing = emotionMap.get(emotion) || { wins: 0, total: 0, pnl: 0 };
        existing.total++;
        existing.pnl += t.pnl || 0;
        if (t.status === "WIN") existing.wins++;
        emotionMap.set(emotion, existing);
      });
    });

    const emotionCorrelation = Array.from(emotionMap.entries())
      .map(([emotion, data]) => ({
        name: emotion,
        winRate: data.total > 0 ? Math.round((data.wins / data.total) * 1000) / 10 : 0,
        pnl: Math.round(data.pnl * 100) / 100,
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total);

    // ─── Calendar Data ───────────────────────────────────────
    const calendarData = Array.from(dailyMap.entries()).map(([date, pnl]) => ({
      day: date,
      value: Math.round(pnl * 100) / 100,
    }));

    // ─── Direction Distribution ──────────────────────────────
    const longTrades = trades.filter((t) => t.direction === "LONG");
    const shortTrades = trades.filter((t) => t.direction === "SHORT");

    const directionStats = [
      {
        name: "Long",
        total: longTrades.length,
        wins: longTrades.filter((t) => t.status === "WIN").length,
        pnl: Math.round(longTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100,
      },
      {
        name: "Short",
        total: shortTrades.length,
        wins: shortTrades.filter((t) => t.status === "WIN").length,
        pnl: Math.round(shortTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100,
      },
    ];

    // Fetch user's identityMetrics
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { identityMetrics: true },
    });

    return NextResponse.json({
      equityCurve,
      dailyPnl,
      winRateBySession,
      pairPerformance,
      strategyPerformance,
      emotionCorrelation,
      calendarData,
      directionStats,
      totalTrades: trades.length,
      identityMetrics: user?.identityMetrics || null,
    });
  } catch (error) {
    console.error("[TRADES_ANALYTICS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
