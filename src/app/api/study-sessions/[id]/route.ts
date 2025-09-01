import { db } from "@/drizzle/index";
import { studySession } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const resolvedParams = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 401 });
  }

  const id = Number(resolvedParams.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const result = await db.delete(studySession).where(eq(studySession.id, id));
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Study session not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete study session" },
      { status: 500 },
    );
  }
}
