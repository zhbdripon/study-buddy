import { db, docFlashCard, studySession, user } from "@/drizzle";
import { DocFlashCard } from "@/drizzle/types";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
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
