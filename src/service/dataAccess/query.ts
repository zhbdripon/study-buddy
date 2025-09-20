import { db, studySession } from "@/drizzle";
import { eq } from "drizzle-orm";
import { DataAccessResult, withAuth, withErrorHandling } from "./helpers";
import { StudySession } from "@/drizzle/types";

export async function queryStudySessions(
  tx = db,
): Promise<DataAccessResult<StudySession[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .select()
        .from(studySession)
        .where(eq(studySession.userId, user.id))
        .execute();
    });
  });
}
