import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["delete", "update_status"]),
  status: z.enum(["WIN", "LOSS", "BREAKEVEN", "OPEN"]).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { ids, action, status } = parsed.data;
    const where = { id: { in: ids }, userId: session.user.id };

    if (action === "delete") {
      await prisma.trade.deleteMany({ where });
      return NextResponse.json({ deleted: ids.length });
    }

    if (action === "update_status" && status) {
      await prisma.trade.updateMany({ where, data: { status } });
      return NextResponse.json({ updated: ids.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[TRADES_BULK]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
