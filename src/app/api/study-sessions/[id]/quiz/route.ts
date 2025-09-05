import { document, documentSummary, studySession } from "@/drizzle";
import { db, docQuiz, docQuizQuestion, user } from "@/drizzle/index";
import { auth } from "@/lib/auth";
import { documentType } from "@/lib/constants";
import { MCQGenerator, QuizQuestionFromAI } from "@/service/mcqGenerator";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

  const studySessionId = Number(resolvedParams.id);
  if (isNaN(studySessionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const quizzes = await db
      .select({
        id: docQuiz.id,
        sessionId: docQuiz.sessionId,
        createdAt: docQuiz.createdAt,
        updatedAt: docQuiz.updatedAt,
        isCompleted: docQuiz.isCompleted,
      })
      .from(docQuiz)
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(eq(studySession.id, studySessionId))
      .orderBy(desc(docQuiz.createdAt))
      .execute();

    return NextResponse.json(quizzes);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 },
    );
  }
}

export async function POST(
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

  const studySessionId = Number(resolvedParams.id);
  if (isNaN(studySessionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const query = await db
      .select({
        id: document.id,
        summary: documentSummary.summary,
        documentMeta: document.meta,
      })
      .from(studySession)
      .innerJoin(document, eq(studySession.id, document.sessionId))
      .innerJoin(documentSummary, eq(documentSummary.documentId, document.id))
      .execute();

    const documentData = query[0];
    const summary = documentData?.summary;
    const documentMeta = documentData?.documentMeta as {
      type: string;
      url: string;
    };

    if (documentData && summary && documentMeta.type === documentType.webUrl) {
      const mcqGen = new MCQGenerator(summary, documentMeta.url);
      await mcqGen.initialize();
      const mcq: QuizQuestionFromAI[] = await mcqGen.generateMcq(10);

      const quiz = await db
        .insert(docQuiz)
        .values({
          sessionId: studySessionId,
        })
        .returning({ id: docQuiz.id })
        .then((res) => res[0]);

      const questions = await db
        .insert(docQuizQuestion)
        .values(
          mcq.map((question) => ({
            quizId: quiz.id,
            question: question.question,
            a: question.a,
            b: question.b,
            c: question.c,
            d: question.d,
            answer: question.answer,
          })),
        )
        .returning();

      return NextResponse.json(questions, { status: 201 });
    }
    throw Error("Couldn't generate MCQ");
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to generate MCQ" },
      { status: 500 },
    );
  }
}
