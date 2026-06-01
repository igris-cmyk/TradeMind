import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { retrieveTraderMemory, buildMemorySummary } from "@/lib/ai/memory-engine";
import { hasPremiumAccess } from "@/lib/entitlements";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await hasPremiumAccess(session.user.id))) {
      return NextResponse.json({ error: "Premium plan required" }, { status: 403 });
    }

    const [memories, summary] = await Promise.all([
      retrieveTraderMemory(session.user.id),
      buildMemorySummary(session.user.id),
    ]);

    return NextResponse.json({ memories, summary });
  } catch (error) {
    console.error("[MEMORY_GET]", error);
    return NextResponse.json({ error: "Failed to retrieve memory" }, { status: 500 });
  }
}
