import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJournalSchema } from "@/validators/journal";

// GET /api/journal
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [entriesWithTrade, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          trade: {
            select: {
              userId: true,
              pair: true,
              direction: true,
              status: true,
              pnl: true,
            },
          },
        },
      }),
      prisma.journalEntry.count({ where: { userId: session.user.id } }),
    ]);

    const entries = entriesWithTrade.map((entry) => {
      const { trade, ...rest } = entry;
      return {
        ...rest,
        trade:
          trade?.userId === session.user.id
            ? {
                pair: trade.pair,
                direction: trade.direction,
                status: trade.status,
                pnl: trade.pnl,
              }
            : null,
      };
    });

    return NextResponse.json({
      entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[JOURNAL_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/journal
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createJournalSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    if (validated.data.tradeId) {
      const trade = await prisma.trade.findFirst({
        where: { id: validated.data.tradeId, userId: session.user.id },
        select: { id: true },
      });

      if (!trade) {
        return NextResponse.json({ error: "Trade not found" }, { status: 404 });
      }
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        ...validated.data,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[JOURNAL_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
