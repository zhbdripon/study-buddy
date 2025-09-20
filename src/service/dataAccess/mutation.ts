import { db } from "@/drizzle";
import { document, documentSummary, studySession } from "@/drizzle/schema";
import {
  DbOrTx,
  DocSummaryInsert,
  DocumentsInsert,
  StudySessionInsert,
} from "@/drizzle/types";
import { DataAccessResult, withAuth, withErrorHandling } from "./helpers";

export async function insertStudySessionMutation(
  data: StudySessionInsert,
  tx: DbOrTx = db,
): Promise<DataAccessResult<{ id: number }>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      return await tx
        .insert(studySession)
        .values({
          name: data.name,
          userId: user.id,
        })
        .returning({ id: studySession.id })
        .then((result) => result[0]);
    });
  });
}

export async function insertDocumentMutation(
  data: DocumentsInsert,
  tx: DbOrTx = db,
) {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(document)
        .values({
          sessionId: data.sessionId,
        })
        .returning({ id: document.id })
        .then((result) => result[0]);
    });
  });
}

export async function insertDocumentSummary(
  data: DocSummaryInsert,
  tx: DbOrTx = db,
) {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(documentSummary)
        .values({
          documentId: data.documentId,
          summary: data.summary,
          entire_doc_summary: data.entire_doc_summary,
        })
        .returning({ id: documentSummary.id })
        .then((result) => result[0]);
    });
  });
}
