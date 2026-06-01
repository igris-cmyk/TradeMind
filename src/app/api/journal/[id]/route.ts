import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateJournalSchema } from "@/validators/journal";

interface RouteParams {
  params: { id: string };
}

// PUT /api/journal/[id]
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateJournalSchema.safeParse({ ...body, id: params.id });

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await prisma.journalEntry.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = validated.data;

    if (updateData.tradeId) {
      const trade = await prisma.trade.findFirst({
        where: { id: updateData.tradeId, userId: session.user.id },
        select: { id: true },
      });

      if (!trade) {
        return NextResponse.json({ error: "Trade not found" }, { status: 404 });
      }
    }

    const entry = await prisma.journalEntry.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("[JOURNAL_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/journal/[id]
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.journalEntry.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.journalEntry.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[JOURNAL_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
