"use server";

import { db } from "@/drizzle";
import {
  docChat,
  docChatMessage,
  document,
  documentSummary,
  studySession,
} from "@/drizzle/schema";
import {
  DbOrTx,
  DocChat,
  DocChatInsert,
  DocChatMessage,
  DocChatMessageInsert,
  DocSummaryInsert,
  DocumentsInsert,
  StudySessionInsert,
} from "@/drizzle/types";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  GenericResult,
  withAuth,
  withErrorHandling,
} from "../../../lib/error-utils";

export async function insertStudySessionMutation(
  data: StudySessionInsert,
  tx: DbOrTx = db,
): Promise<GenericResult<{ id: number }>> {
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
          meta: data.meta,
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

export async function deleteStudySessionMutation(
  studySessionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<{ success: boolean }>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      await tx
        .delete(studySession)
        .where(
          and(
            eq(studySession.userId, user.id),
            eq(studySession.id, studySessionId),
          ),
        );

      revalidatePath("/study-sessions");
      return { success: true };
    });
  });
}

export async function insertDocumentChatMutation(
  data: DocChatInsert,
  tx: DbOrTx = db,
): Promise<GenericResult<DocChat>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .insert(docChat)
        .values(data)
        .returning({
          id: docChat.id,
          sessionId: docChat.sessionId,
          title: docChat.title,
          embeddingPath: docChat.embeddingPath,
          threadId: docChat.threadId,
          createdAt: docChat.createdAt,
          updatedAt: docChat.updatedAt,
        })
        .then((res) => res[0]);
    });
  });
}

export async function insertDocChatMessagesMutation(
  data: DocChatMessageInsert[],
  tx: DbOrTx = db,
): Promise<GenericResult<DocChatMessage[]>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx.insert(docChatMessage).values(data).returning({
        id: docChatMessage.id,
        chatId: docChatMessage.chatId,
        role: docChatMessage.role,
        content: docChatMessage.content,
        parentMessageId: docChatMessage.parentMessageId,
        createdAt: docChatMessage.createdAt,
        updatedAt: docChatMessage.updatedAt,
      });
    });
  });
}

// You can add more mutation functions as needed
