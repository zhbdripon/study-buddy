import {
  db,
  docFlashCard,
  docFlashCardQuestion,
  studySession,
} from "@/drizzle";
import { DbOrTx, DocFlashCard, DocFlashCardQuestion } from "@/drizzle/types";
import {
  GenericResult,
  withAuth,
  withErrorHandling,
} from "@/lib/shared/error-utils";
import { and, desc, eq } from "drizzle-orm";

export function queryRecentFlashCards(
  studySessionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocFlashCard[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select({
          id: docFlashCard.id,
          sessionId: docFlashCard.sessionId,
          createdAt: docFlashCard.createdAt,
          updatedAt: docFlashCard.updatedAt,
        })
        .from(docFlashCard)
        .innerJoin(studySession, eq(studySession.id, docFlashCard.sessionId))
        .where(
          and(
            eq(studySession.id, studySessionId),
            eq(studySession.userId, user.id),
          ),
        )
        .orderBy(desc(docFlashCard.createdAt))
        .limit(10)
        .execute();
    });
  });
}

export function queryFlashCardQuestions(
  flashCardId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocFlashCardQuestion[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select({
          id: docFlashCardQuestion.id,
          flashCardId: docFlashCardQuestion.flashCardId,
          question: docFlashCardQuestion.question,
          answer: docFlashCardQuestion.answer,
          isAnsweredCorrect: docFlashCardQuestion.isAnsweredCorrect,
          createdAt: docFlashCardQuestion.createdAt,
          updatedAt: docFlashCardQuestion.updatedAt,
        })
        .from(docFlashCardQuestion)
        .innerJoin(
          docFlashCard,
          eq(docFlashCard.id, docFlashCardQuestion.flashCardId),
        )
        .innerJoin(studySession, eq(studySession.id, docFlashCard.sessionId))
        .where(
          and(
            eq(docFlashCard.id, flashCardId),
            eq(studySession.userId, user.id),
          ),
        )
        .execute();
    });
  });
}
