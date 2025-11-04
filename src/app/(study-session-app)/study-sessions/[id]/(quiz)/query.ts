import {
  db,
  docQuiz,
  docQuizPerformance,
  docQuizQuestion,
  studySession,
} from "@/drizzle";
import {
  DbOrTx,
  DocQuiz,
  DocQuizOption,
  DocQuizQuestion,
} from "@/drizzle/types";
import {
  GenericResult,
  withAuth,
  withErrorHandling,
} from "@/lib/shared/error-utils";
import { and, desc, eq } from "drizzle-orm";

export type RecentQuiz = {
  id: number;
  sessionId: number;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
};

export async function queryQuiz(
  quizId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocQuiz>> {
  return await withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select({
          id: docQuiz.id,
          sessionId: docQuiz.sessionId,
          createdAt: docQuiz.createdAt,
          updatedAt: docQuiz.updatedAt,
          isCompleted: docQuiz.isCompleted,
        })
        .from(docQuiz)
        .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
        .where(and(eq(studySession.userId, user.id), eq(docQuiz.id, quizId)))
        .limit(1)
        .execute()
        .then((r) => r[0]);
    });
  });
}

export function queryRecentQuizzes(
  studySessionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<RecentQuiz[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select({
          id: docQuiz.id,
          sessionId: docQuiz.sessionId,
          createdAt: docQuiz.createdAt,
          updatedAt: docQuiz.updatedAt,
          isCompleted: docQuiz.isCompleted,
        })
        .from(docQuiz)
        .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
        .where(
          and(
            eq(studySession.userId, user.id),
            eq(studySession.id, studySessionId),
          ),
        )
        .orderBy(desc(docQuiz.createdAt))
        .execute();
    });
  });
}

export type QuizDataQuestion = {
  id: number;
  quizId: number;
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: string;
  chosenOption: DocQuizOption | null;
  isCompleted: boolean;
};

export async function queryQuizQuestions(
  quizId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<QuizDataQuestion[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select({
          id: docQuizQuestion.id,
          quizId: docQuizQuestion.quizId,
          question: docQuizQuestion.question,
          a: docQuizQuestion.a,
          b: docQuizQuestion.b,
          c: docQuizQuestion.c,
          d: docQuizQuestion.d,
          answer: docQuizQuestion.answer,
          chosenOption: docQuizPerformance.chosenOption,
          isCompleted: docQuiz.isCompleted,
        })
        .from(docQuizQuestion)
        .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
        .leftJoin(
          docQuizPerformance,
          eq(docQuizPerformance.questionId, docQuizQuestion.id),
        )
        .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
        .where(and(eq(docQuiz.id, quizId), eq(studySession.userId, user.id)))
        .execute();
    });
  });
}

export async function queryQuizQuestion(
  studySessionId: number,
  questionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocQuizQuestion>> {
  return await withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select({
          id: docQuizQuestion.id,
          quizId: docQuizQuestion.quizId,
          question: docQuizQuestion.question,
          a: docQuizQuestion.a,
          b: docQuizQuestion.b,
          c: docQuizQuestion.c,
          d: docQuizQuestion.d,
          answer: docQuizQuestion.answer,
          createdAt: docQuizQuestion.createdAt,
          updatedAt: docQuizQuestion.updatedAt,
        })
        .from(docQuizQuestion)
        .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
        .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
        .where(
          and(
            eq(studySession.userId, user.id),
            and(
              eq(docQuizQuestion.id, questionId!),
              eq(studySession.id, studySessionId!),
            ),
          ),
        )
        .limit(1)
        .execute()
        .then((r) => r[0]);
    });
  });
}
