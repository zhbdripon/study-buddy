import {
  db,
  docQuiz,
  docQuizPerformance,
  docQuizQuestion,
  studySession,
  user,
} from "@/drizzle";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const quizId = Number(resolvedParams.quizId);
  if (isNaN(quizId)) {
    return NextResponse.json({ error: "Invalid quizId" }, { status: 400 });
  }

  try {
    const question = await db
      .select({
        id: docQuizQuestion.id,
        quizId: docQuiz.id,
        question: docQuizQuestion.question,
        a: docQuizQuestion.a,
        b: docQuizQuestion.b,
        c: docQuizQuestion.c,
        d: docQuizQuestion.d,
        answer: docQuizQuestion.answer,
        chosenOption: docQuizPerformance.chosenOption,
      })
      .from(docQuizQuestion)
      .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
      .leftJoin(
        docQuizPerformance,
        eq(docQuizPerformance.questionId, docQuizQuestion.id),
      )
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(eq(docQuiz.id, quizId))
      .execute();

    return NextResponse.json(question);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch quiz question" },
      { status: 500 },
    );
  }
}
