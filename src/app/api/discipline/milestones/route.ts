import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unlocks = await prisma.milestoneUnlock.findMany({
      where: { userId: session.user.id },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json({ unlocks });
  } catch (error) {
    console.error("[MILESTONES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
