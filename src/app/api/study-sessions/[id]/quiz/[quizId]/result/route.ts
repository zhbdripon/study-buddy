import { db } from "@/drizzle";
import {
  docQuiz,
  docQuizPerformance,
  docQuizQuestion,
  studySession,
  user,
} from "@/drizzle/schema";
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
    const result = await db
      .select({
        id: docQuizPerformance.id,
        quizId: docQuiz.id,
        question: docQuizQuestion.question,
        userAnswer: docQuizPerformance.chosenOption,
        correctAnswer: docQuizQuestion.answer,
        a: docQuizQuestion.a,
        b: docQuizQuestion.b,
        c: docQuizQuestion.c,
        d: docQuizQuestion.d,
      })
      .from(docQuizPerformance)
      .innerJoin(
        docQuizQuestion,
        eq(docQuizQuestion.id, docQuizPerformance.questionId),
      )
      .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(eq(docQuiz.id, quizId))
      .execute();

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch quiz results" },
      { status: 500 },
    );
  }
}
