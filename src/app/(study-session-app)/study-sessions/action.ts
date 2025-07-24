"use server";
import { indexWebResource } from "@/service/studySession";
import { db, documents } from "@/drizzle";
import { studySession, StudySessionInsert, DocumentsInsert } from "@/drizzle";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function addURL(url: string, studySessionId?: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  try {
    const { namespace } = await indexWebResource(url);
    if (!namespace) {
      throw new Error("Failed to index web resource");
    }

    if (!studySessionId && user) {
      const newStudySession: StudySessionInsert = {
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
        embeddingPath: namespace,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.insert(documents).values(newDocument);
    }
  } catch (error) {
    console.error("Error adding URL:", error);
  }
}
