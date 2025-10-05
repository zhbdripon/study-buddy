import { db, docFlashCard, docFlashCardQuestion } from "@/drizzle";
import {
  DbOrTx,
  DocFlashCard,
  DocFlashCardInsert,
  DocFlashCardQuestion,
  DocFlashCardQuestionInsert,
} from "@/drizzle/types";
import { GenericResult, withAuth, withErrorHandling } from "@/lib/error-utils";

export function insertFlashCardMutation(
  flashCardData: DocFlashCardInsert,
  tx: DbOrTx = db,
): Promise<GenericResult<DocFlashCard>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(docFlashCard)
        .values(flashCardData)
        .returning({
          id: docFlashCard.id,
          sessionId: docFlashCard.sessionId,
          createdAt: docFlashCard.createdAt,
          updatedAt: docFlashCard.updatedAt,
        })
        .execute()
        .then((res) => res[0]);
    });
  });
}

export function insertFlashCardQuestionMutation(
  flashCardQuestionData: DocFlashCardQuestionInsert[],
  tx: DbOrTx = db,
): Promise<GenericResult<DocFlashCardQuestion[]>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(docFlashCardQuestion)
        .values(flashCardQuestionData)
        .returning({
          id: docFlashCardQuestion.id,
          flashCardId: docFlashCardQuestion.flashCardId,
          question: docFlashCardQuestion.question,
          answer: docFlashCardQuestion.answer,
          isAnsweredCorrect: docFlashCardQuestion.isAnsweredCorrect,
          createdAt: docFlashCardQuestion.createdAt,
          updatedAt: docFlashCardQuestion.updatedAt,
        })
        .execute();
    });
  });
}
