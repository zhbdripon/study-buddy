import {
  db,
  docQuiz,
  docQuizPerformance,
  docQuizQuestion,
  studySession,
  user,
} from "@/drizzle";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { DocQuizOption } from "@/drizzle/types";

export type QuizResult = {
  id: number;
  quizId: number;
  question: string;
  userAnswer: DocQuizOption | null;
  correctAnswer: string;
  a: string;
  b: string;
  c: string;
  d: string;
};

export async function getQuizResult(quizId: string): Promise<QuizResult[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw Error("Session not found");
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
      .where(eq(docQuiz.id, parseInt(quizId)))
      .execute();

    return result;
  } catch (error) {
    console.log(error);
    return Promise.reject("Something went wrong");
  }
}

export type RecentQuiz = {
  id: number;
  sessionId: number;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
};

export async function getRecentQuizzes(
  studySessionId: number,
): Promise<RecentQuiz[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw Error("Session not found");
  }

  try {
    return await db
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
  } catch (error) {
    console.log(error);
    return Promise.reject("Failed to fetch quizzes");
  }
}
