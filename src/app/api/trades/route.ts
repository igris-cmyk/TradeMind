import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTradeSchema } from "@/validators/trade";

const SORTABLE_TRADE_FIELDS = new Set(["createdAt", "updatedAt", "pair", "status", "pnl", "rrAchieved"]);

// GET /api/trades — list trades for current user
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const pair = searchParams.get("pair");
    const search = searchParams.get("search");
    const session_filter = searchParams.get("session");
    const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const parsedLimit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 20;
    const requestedSortBy = searchParams.get("sortBy") || "createdAt";
    const sortBy = SORTABLE_TRADE_FIELDS.has(requestedSortBy) ? requestedSortBy : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) where.status = status;
    if (pair) where.pair = pair;
    if (search) {
      where.pair = { contains: search, mode: "insensitive" };
    }
    if (session_filter) where.session = session_filter;

    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          aiAnalysis: {
            select: { qualityScore: true, summary: true },
          },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    return NextResponse.json({
      trades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[TRADES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/trades — create new trade
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createTradeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        ...validated.data,
      },
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error("[TRADES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
