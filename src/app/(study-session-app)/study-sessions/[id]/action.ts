import { db, documentSummary, document, studySession } from "@/drizzle";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function getStudySessionDocumentSummary(studySessionId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  if (!user) return [];

  const summaries = await db
    .select({
      id: documentSummary.id,
      summary: documentSummary.summary,
    })
    .from(documentSummary)
    .innerJoin(document, eq(document.id, documentSummary.documentId))
    .innerJoin(studySession, eq(studySession.id, document.sessionId))
    .where(
      and(
        eq(studySession.userId, user.id),
        eq(studySession.id, studySessionId),
      ),
    )
    .execute();

  return summaries;
}
