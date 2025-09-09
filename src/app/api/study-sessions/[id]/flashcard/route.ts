import {
  db,
  docFlashCard,
  docFlashCardQuestion,
  document,
  documentSummary,
  studySession,
} from "@/drizzle";
import { auth } from "@/lib/auth";
import { documentType } from "@/lib/constants";
import { FlashCardFromAI, FlashCardService } from "@/service/flashcards";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

      return NextResponse.json(questions, { status: 201 });
    }
    throw Error("Couldn't generate flashcards");
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 },
    );
  }
}
