import {
  db,
  docFlashCard,
  docFlashCardQuestion,
  studySession,
  user,
} from "@/drizzle";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; flashCardId: string } },
) {
  const resolvedParams = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 401 });
  }

  const studySessionId = Number(resolvedParams.id);
  if (isNaN(studySessionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const flashCardId = Number(resolvedParams.flashCardId);
  if (isNaN(flashCardId)) {
    return NextResponse.json({ error: "Invalid flashCardId" }, { status: 400 });
  }

  try {
    const flashCards = await db
      .select()
      .from(docFlashCard)
      .innerJoin(studySession, eq(studySession.id, docFlashCard.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(eq(docFlashCard.id, flashCardId))
      .execute();

    if (flashCards.length === 0) {
      return NextResponse.json(
        { error: "No flashcards found for this session" },
        { status: 404 },
      );
    }

    const flashCardQuestions = await db
      .select()
      .from(docFlashCardQuestion)
      .where(eq(docFlashCardQuestion.flashCardId, flashCardId))
      .execute();

    return NextResponse.json(flashCardQuestions);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 },
    );
  }
}
