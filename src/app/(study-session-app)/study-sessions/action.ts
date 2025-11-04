"use server";

import {
  insertDocumentMutation,
  insertDocumentSummary,
  insertStudySessionMutation,
} from "@/app/(study-session-app)/study-sessions/mutation";
import { documentTypes } from "@/lib/shared/constants";
import {
  getDataOrThrow,
  withAuth,
  withErrorHandling,
} from "@/lib/shared/error-utils";
import {
  generateSummaryFromRawText,
  generateURLSummary,
  generateYoutubeSummary,
} from "@/service/document";
import { Buffer } from "buffer";
import pdf from "pdf-parse";

import { extractPdfText } from "@/lib/server/utils";

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

export async function getPdfPageCount(buffer: Buffer) {
  const data = await pdf(buffer);
  return data.numpages;
}

export async function addDocument(formData: FormData) {
  const file = formData.get("file") as File;
  const startPage = formData.get("startPage");
  const endPage = formData.get("endPage");

  if (!file) return { success: false, message: "No File uploaded" };

  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  const maximumPageToIndex = 15;
  let pdfContent: string | undefined = "";

  if ((await getPdfPageCount(buffer)) < maximumPageToIndex) {
    pdfContent = await extractPdfText(buffer);
  } else if (startPage && endPage) {
    pdfContent = await extractPdfText(buffer, +startPage, +endPage);
  }

  if (!pdfContent) {
    return;
    // add return values
  }

  const { title, summary } = getDataOrThrow(
    await withAuth(async () => {
      return withErrorHandling(async () => {
        return await generateSummaryFromRawText(pdfContent);
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
        type: documentTypes.pdf,
        data: pdfContent,
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
