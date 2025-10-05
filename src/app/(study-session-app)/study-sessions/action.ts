"use server";

import {
  insertDocumentMutation,
  insertDocumentSummary,
  insertStudySessionMutation,
} from "@/app/(study-session-app)/study-sessions/mutation";
import { documentType } from "@/lib/constants";
import { getDataOrThrow, withAuth, withErrorHandling } from "@/lib/error-utils";
import { generateURLSummary } from "@/service/studySession";

export async function addURL(url: string): Promise<number> {
  const { title, summary } = getDataOrThrow(
    await withAuth(async () => {
      return withErrorHandling(async () => await generateURLSummary(url));
    }),
  );

  const { id: studySessionId } = getDataOrThrow(
    await insertStudySessionMutation({
      name: title ?? "Untitled session",
    }),
  );

  const { id: documentId } = getDataOrThrow(
    await insertDocumentMutation({
      sessionId: studySessionId,
      meta: {
        type: documentType.webUrl,
        url,
      },
    }),
  );

  getDataOrThrow(
    await insertDocumentSummary({
      documentId: documentId,
      summary,
      entire_doc_summary: true,
    }),
  );

  return Promise.resolve(studySessionId);
}
