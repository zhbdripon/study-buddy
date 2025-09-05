import { db } from "@/drizzle";
import {
  docQuiz,
  docQuizPerformance,
  docQuizQuestion,
  studySession,
  user,
} from "@/drizzle/schema";
import { DocQuizOption } from "@/drizzle/types";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function validateParams(params) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { error: "Session not found", status: 401 };
  }

  const studySessionId = Number(params.id);
  if (isNaN(studySessionId)) {
    return { error: "Invalid document session", status: 400 };
  }

  const quizId = Number(params.quizId);
  if (isNaN(quizId)) {
    return { error: "Invalid quizId", status: 400 };
  }

  const questionId = Number(params.questionId);
  if (isNaN(questionId)) {
    return { error: "Invalid questionId", status: 400 };
  }

  return { session, studySessionId, quizId, questionId };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; quizId: string; questionId: string } },
) {
  const resolvedParams = await params;

  const { error, status, ...rest } = await validateParams(resolvedParams);
  if (error) return NextResponse.json({ error }, { status });

  const { studySessionId, questionId } = rest;

  const question = await db
    .select({
      id: docQuizQuestion.id,
      quizId: docQuizQuestion.quizId,
    })
    .from(docQuizQuestion)
    .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
    .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
    .innerJoin(user, eq(user.id, studySession.userId))
    .where(
      and(
        eq(docQuizQuestion.id, questionId!),
        eq(studySession.id, studySessionId!),
      ),
    )
    .execute()
    .then((res) => res[0]);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  try {
    const body: { answer: DocQuizOption } = await req.json();
    await db
      .insert(docQuizPerformance)
      .values({
        questionId: question.id,
        chosenOption: body.answer,
      })
      .execute();
  } catch (error) {
    console.error("Error inserting quiz performance:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: 201 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; quizId: string; questionId: string } },
) {
  const resolvedParams = await params;

  const { error, status, ...rest } = await validateParams(resolvedParams);
  if (error) return NextResponse.json({ error }, { status });

  const { studySessionId, questionId } = rest;

  const quizPerformance = await db
    .select({ id: docQuizPerformance.id })
    .from(docQuizPerformance)
    .innerJoin(
      docQuizQuestion,
      eq(docQuizQuestion.id, docQuizPerformance.questionId),
    )
    .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
    .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
    .innerJoin(user, eq(user.id, studySession.userId))
    .where(
      and(
        eq(docQuizQuestion.id, questionId!),
        eq(studySession.id, studySessionId!),
      ),
    )
    .execute()
    .then((res) => res[0]);

  if (!quizPerformance) {
    return NextResponse.json(
      { error: "Quiz performance not found" },
      { status: 404 },
    );
  }

  try {
    const body: { answer: DocQuizOption } = await req.json();
    await db
      .update(docQuizPerformance)
      .set({
        chosenOption: body.answer,
      })
      .where(eq(docQuizPerformance.id, quizPerformance.id))
      .execute();
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error updating quiz answer:", error);
    return NextResponse.json(
      { error: "Failed to update answer" },
      { status: 500 },
    );
  }
}
