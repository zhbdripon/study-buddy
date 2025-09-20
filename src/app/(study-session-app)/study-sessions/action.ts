"use server";

import { documentType } from "@/lib/constants";
import {
  throwError,
  withAuth,
  withErrorHandling,
} from "@/service/dataAccess/helpers";
import {
  insertDocumentMutation,
  insertDocumentSummary,
  insertStudySessionMutation,
} from "@/service/dataAccess/mutation";
import { generateURLSummary } from "@/service/studySession";

export async function addURL(url: string): Promise<number> {
  const { title, summary } = throwError(
    await withAuth(async () => {
      return withErrorHandling(async () => await generateURLSummary(url));
    }),
  );

  const { id: studySessionId } = throwError(
    await insertStudySessionMutation({
      name: title ?? "Untitled session",
    }),
  );

  const { id: documentId } = throwError(
    await insertDocumentMutation({
      sessionId: studySessionId,
      meta: {
        type: documentType.webUrl,
        url,
      },
    }),
  );

  throwError(
    await insertDocumentSummary({
      documentId: documentId,
      summary,
      entire_doc_summary: true,
    }),
  );

  return Promise.resolve(studySessionId);
}
