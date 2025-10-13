"use server";

import {
  insertDocumentMutation,
  insertDocumentSummary,
  insertStudySessionMutation,
} from "@/app/(study-session-app)/study-sessions/mutation";
import { documentTypes } from "@/lib/constants";
import { getDataOrThrow, withAuth, withErrorHandling } from "@/lib/error-utils";
import { generateURLSummary, generateYoutubeSummary } from "@/service/document";

export async function addURL(
  url: string,
  docType: "webUrl" | "youtube",
): Promise<number> {
  const { title, summary } = getDataOrThrow(
    await withAuth(async () => {
      return withErrorHandling(async () => {
        if (docType === documentTypes.youtube) {
          return await generateYoutubeSummary(url);
        }
        return await generateURLSummary(url);
      });
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
        type: docType,
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
