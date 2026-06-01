import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const csvRowSchema = z.object({
  pair: z.string().min(1),
  direction: z.string().toUpperCase().refine((val) => ["LONG", "SHORT"].includes(val), {
    message: "Direction must be LONG or SHORT",
  }),
  entry: z.coerce.number().positive(),
  stopLoss: z.coerce.number().positive(),
  takeProfit: z.coerce.number().positive(),
  pnl: z.coerce.number().optional().nullable(),
  rrAchieved: z.coerce.number().optional().nullable(),
  status: z.string().toUpperCase().pipe(z.enum(["WIN", "LOSS", "BREAKEVEN", "OPEN"])).default("OPEN"),
  session: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trades } = await req.json();

    if (!Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json({ error: "Invalid or empty trades array" }, { status: 400 });
    }

    const validTrades = [];
    const errors = [];

    // Validate each row
    for (let i = 0; i < trades.length; i++) {
      const row = trades[i];
      const parsed = csvRowSchema.safeParse(row);

      if (parsed.success) {
        validTrades.push({
          userId: session.user.id,
          ...parsed.data,
          strategyTags: [],
          emotions: [],
          screenshots: [],
        });
      } else {
        errors.push(`Row ${i + 1}: ${parsed.error.issues[0]?.message}`);
      }
    }

    if (validTrades.length === 0) {
      return NextResponse.json(
        { error: "No valid trades found to import.", details: errors },
        { status: 400 }
      );
    }

    // Bulk insert
    const result = await prisma.trade.createMany({
      data: validTrades,
    });

    return NextResponse.json({
      success: true,
      imported: result.count,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[CSV_IMPORT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error during import" },
      { status: 500 }
    );
  }
}
