import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshots = await prisma.disciplineSnapshot.findMany({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "asc" },
      take: 90,
      select: { score: true, recordedAt: true },
    });

    return NextResponse.json({
      history: snapshots.map((s) => ({
        date: s.recordedAt.toISOString().slice(0, 10),
        score: s.score,
      })),
    });
  } catch (error) {
    console.error("[DISCIPLINE_HISTORY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
