"use server";
import {
  db,
  docFlashCard,
  docFlashCardQuestion,
  document,
  documentSummary,
  studySession,
  user,
} from "@/drizzle";
import { DocFlashCard, DocFlashCardQuestion } from "@/drizzle/types";
import { auth } from "@/lib/auth";
import { documentType } from "@/lib/constants";
import { FlashCardFromAI, FlashCardService } from "@/service/flashcards";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getRecentFlashCards(
  studySessionId: number,
): Promise<DocFlashCard[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw Error("Session not found");
  }

  try {
    const result = await db
      .select({
        id: docFlashCard.id,
        sessionId: docFlashCard.sessionId,
        createdAt: docFlashCard.createdAt,
        updatedAt: docFlashCard.updatedAt,
      })
      .from(docFlashCard)
      .innerJoin(studySession, eq(studySession.id, docFlashCard.sessionId))
      .innerJoin(user, eq(user.id, session.user.id))
      .where(eq(studySession.id, studySessionId))
      .orderBy(desc(docFlashCard.createdAt))
      .limit(10)
      .execute();
    return result;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

export async function createFlashCard(
  studySessionId: number,
): Promise<FlashCardData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw Error("Session not found");
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
      .innerJoin(user, eq(user.id, session.user.id))
      .execute();

    const documentData = query[0];
    const summary = documentData?.summary;
    const documentMeta = documentData?.documentMeta as {
      type: string;
      url: string;
    };

    if (documentData && summary && documentMeta.type === documentType.webUrl) {
      const flashCardService = new FlashCardService(summary, documentMeta.url);
      await flashCardService.initialize();
      const flashCardQuestions: FlashCardFromAI[] =
        await flashCardService.generateFlashCards(10);

      const flashCard = await db
        .insert(docFlashCard)
        .values({
          sessionId: studySessionId,
        })
        .returning({ id: docFlashCard.id })
        .then((res) => res[0]);

      const questions = await db
        .insert(docFlashCardQuestion)
        .values(
          flashCardQuestions.map((item) => ({
            flashCardId: flashCard.id,
            question: item.question,
            answer: item.answer,
          })),
        )
        .returning();

      return {
        id: flashCard.id,
        questions: questions as DocFlashCardQuestion[],
      } as FlashCardData;
    }
    throw Error("Couldn't generate flashcards");
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

export type FlashCardData = {
  id: number;
  questions: DocFlashCardQuestion[];
};

export async function getFlashCardData(
  studySessionId: number,
  flashCardId: number,
): Promise<FlashCardData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) return Promise.reject("User not found");

  try {
    const flashCards = await db
      .select({ id: docFlashCard.id })
      .from(docFlashCard)
      .innerJoin(studySession, eq(studySession.id, docFlashCard.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(
        and(
          eq(docFlashCard.id, flashCardId),
          eq(studySession.id, studySessionId),
        ),
      )
      .execute();

    if (flashCards.length === 0) {
      throw Error("No flashcards found for this session");
    }

    const flashCardQuestions = await db
      .select()
      .from(docFlashCardQuestion)
      .where(eq(docFlashCardQuestion.flashCardId, flashCardId))
      .execute();

    return {
      id: flashCards[0]?.id,
      questions: flashCardQuestions as DocFlashCardQuestion[],
    };
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}
