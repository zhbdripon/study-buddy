"use server";
import {
  DocFlashCardQuestion,
  DocFlashCardQuestionInsert,
} from "@/drizzle/types";
import { documentType } from "@/lib/constants";
import { getDataOrThrow } from "@/lib/error-utils";
import { FlashCardFromAI, FlashCardService } from "@/service/flashcards";
import { queryDocuments, queryStudySessionDocumentSummary } from "../../query";
import {
  insertFlashCardMutation,
  insertFlashCardQuestionMutation,
} from "./mutation";
import { queryFlashCardQuestions } from "./query";

export type FlashCardData = {
  id: number;
  questions: DocFlashCardQuestion[];
};

export async function createFlashCard(
  studySessionId: number,
): Promise<FlashCardData> {
  const document = getDataOrThrow(await queryDocuments(studySessionId))[0];
  const summary = getDataOrThrow(
    await queryStudySessionDocumentSummary(studySessionId),
  )[0].summary;
  const documentMeta = document?.meta as {
    type: string;
    url: string;
  };

  if (summary && documentMeta.type === documentType.webUrl) {
    const flashCardService = new FlashCardService(summary, documentMeta.url);
    await flashCardService.initialize();
    const flashCardQuestionsFromAI: FlashCardFromAI[] =
      await flashCardService.generateFlashCards(10);

    const flashCard = getDataOrThrow(
      await insertFlashCardMutation({
        sessionId: studySessionId,
      }),
    );

    const flashCardQuestions = flashCardQuestionsFromAI.map(
      (item) =>
        ({
          flashCardId: flashCard.id,
          question: item.question,
          answer: item.answer,
        }) as DocFlashCardQuestionInsert,
    );

    const questions = await getDataOrThrow(
      await insertFlashCardQuestionMutation(flashCardQuestions),
    );

    return {
      id: flashCard.id,
      questions: questions as DocFlashCardQuestion[],
    } as FlashCardData;
  } else {
    throw new Error("No document or summary found for the study session");
  }
}

export async function getFlashCardData(
  flashCardId: number,
): Promise<FlashCardData> {
  const flashCardQuestions = getDataOrThrow(
    await queryFlashCardQuestions(flashCardId),
  );

  return {
    id: flashCardId,
    questions: flashCardQuestions as DocFlashCardQuestion[],
  };
}
