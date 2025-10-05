import { db, docQuiz, docQuizPerformance, docQuizQuestion } from "@/drizzle";
import {
  DbOrTx,
  DocQuiz,
  DocQuizInsert,
  DocQuizPerformanceInsert,
  DocQuizQuestion,
  DocQuizQuestionInsert,
} from "@/drizzle/types";
import { GenericResult, withAuth, withErrorHandling } from "@/lib/error-utils";
import { eq } from "drizzle-orm";

export async function insertQuizMutation(
  data: DocQuizInsert,
  tx: DbOrTx = db,
): Promise<GenericResult<DocQuiz>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(docQuiz)
        .values(data)
        .returning({
          id: docQuiz.id,
          sessionId: docQuiz.sessionId,
          isCompleted: docQuiz.isCompleted,
          createdAt: docQuiz.createdAt,
          updatedAt: docQuiz.updatedAt,
        })
        .then((res) => res[0]);
    });
  });
}

export async function insertQuizQuestionsMutation(
  data: DocQuizQuestionInsert[],
  tx: DbOrTx = db,
): Promise<GenericResult<DocQuizQuestion[]>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx.insert(docQuizQuestion).values(data).returning({
        id: docQuizQuestion.id,
        quizId: docQuizQuestion.quizId,
        question: docQuizQuestion.question,
        answer: docQuizQuestion.answer,
        a: docQuizQuestion.a,
        b: docQuizQuestion.b,
        c: docQuizQuestion.c,
        d: docQuizQuestion.d,
        createdAt: docQuizQuestion.createdAt,
        updatedAt: docQuizQuestion.updatedAt,
      });
    });
  });
}

export async function insertQuizAnswerMutation(
  data: DocQuizPerformanceInsert,
  tx: DbOrTx = db,
): Promise<GenericResult<DocQuizPerformanceInsert>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(docQuizPerformance)
        .values(data)
        .returning({
          id: docQuizPerformance.id,
          questionId: docQuizPerformance.questionId,
          chosenOption: docQuizPerformance.chosenOption,
          createdAt: docQuizPerformance.createdAt,
          updatedAt: docQuizPerformance.updatedAt,
        })
        .then((res) => res[0]);
    });
  });
}

export async function updateQuizMutation(
  id: number,
  data: Partial<DocQuizInsert>,
  tx: DbOrTx = db,
): Promise<GenericResult<DocQuiz>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .update(docQuiz)
        .set(data)
        .where(eq(docQuiz.id, id))
        .returning({
          id: docQuiz.id,
          sessionId: docQuiz.sessionId,
          isCompleted: docQuiz.isCompleted,
          createdAt: docQuiz.createdAt,
          updatedAt: docQuiz.updatedAt,
        })
        .then((res) => res[0]);
    });
  });
}
