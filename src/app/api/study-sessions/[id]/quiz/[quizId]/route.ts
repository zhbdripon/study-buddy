import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { docQuiz, studySession, user } from "@/drizzle/schema";
import { DocQuizInsert } from "@/drizzle/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; quizId: string } },
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
    return NextResponse.json(
      { error: "Invalid document session" },
      { status: 400 },
    );
  }

  const quizId = Number(resolvedParams.quizId);
  if (isNaN(quizId)) {
    return NextResponse.json({ error: "Invalid quizId" }, { status: 400 });
  }

  try {
    const quiz = await db
      .select()
      .from(docQuiz)
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(and(eq(docQuiz.id, quizId), eq(studySession.id, studySessionId)))
      .execute();

    if (quiz.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const body = (await req.json()) as Pick<DocQuizInsert, "isCompleted">;

    await db.update(docQuiz).set(body).where(eq(docQuiz.id, quizId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to mark quiz as completed" },
      { status: 500 },
    );
  }
}
