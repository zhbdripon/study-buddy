"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db, document, documentSummary, studySession } from "@/drizzle";
import {
  DocSummaryInsert,
  DocumentsInsert,
  StudySession,
  StudySessionInsert,
} from "@/drizzle/types";
import { auth } from "@/lib/auth";
import { documentType } from "@/lib/constants";
import { generateURLSummary } from "@/service/studySession";

export async function addURL(
  url: string,
  studySessionId?: number,
): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;
  try {
    const { title, summary } = await generateURLSummary(url);

    if (!summary) {
      throw new Error("Failed to summarize the resource");
    }

    if (!studySessionId && user) {
      const newStudySession: StudySessionInsert = {
        name: title ?? "Untitled session",
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      studySessionId = await db
        .insert(studySession)
        .values(newStudySession)
        .returning({ id: studySession.id })
        .then((result) => result[0].id);
    }

    if (studySessionId) {
      const newDocument: DocumentsInsert = {
        sessionId: studySessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        meta: {
          type: documentType.webUrl,
          url,
        },
      };
      const createdNewDocument = await db
        .insert(document)
        .values(newDocument)
        .returning({ id: document.id })
        .then((result) => result[0]);

      if (summary && createdNewDocument) {
        await db.insert(documentSummary).values({
          sessionId: studySessionId,
          documentId: createdNewDocument.id,
          summary: summary,
          entire_doc_summary: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as DocSummaryInsert);
      }
    }

    return Promise.resolve(studySessionId!);
  } catch (error) {
    console.error("Error adding URL:", error);
    return Promise.reject(error);
  }
}

export async function getStudySessions(): Promise<StudySession[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) return [];

  return db
    .select()
    .from(studySession)
    .where(eq(studySession.userId, user.id))
    .execute();
}
