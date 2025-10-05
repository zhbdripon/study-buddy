import {
  db,
  docChat,
  docChatMessage,
  document,
  documentSummary,
  studySession,
} from "@/drizzle";
import {
  DbOrTx,
  DocChat,
  DocChatMessage,
  DocSummary,
  Documents,
  StudySession,
} from "@/drizzle/types";
import { and, eq } from "drizzle-orm";
import {
  GenericResult,
  withAuth,
  withErrorHandling,
} from "../../../lib/error-utils";

export async function queryStudySessions(
  tx: DbOrTx = db,
): Promise<GenericResult<StudySession[]>> {
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

export async function queryStudySessionDocumentSummary(
  studySessionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocSummary[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      const summaries = await tx
        .select()
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

      return summaries.map((row) => row.doc_summary);
    });
  });
}

export async function queryDocuments(
  studySessionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<Documents[]>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      const result = await tx
        .select()
        .from(document)
        .innerJoin(studySession, eq(studySession.id, studySessionId))
        .where(
          and(
            eq(studySession.userId, user.id),
            eq(document.sessionId, studySessionId),
          ),
        )
        .limit(1)
        .execute();

      return result.map((row) => row.documents);
    });
  });
}

export async function queryDocumentChat(
  studySessionId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocChat>> {
  return withAuth((user) => {
    return withErrorHandling(async () => {
      const result = await tx
        .select()
        .from(docChat)
        .innerJoin(studySession, eq(studySession.id, docChat.sessionId))
        .where(
          and(
            eq(studySession.userId, user.id),
            eq(studySession.id, studySessionId),
          ),
        )
        .execute();

      return result[0].doc_chat;
    });
  });
}

export async function queryDocumentChatMessages(
  docChatId: number,
  tx: DbOrTx = db,
): Promise<GenericResult<DocChatMessage[]>> {
  return withAuth(() => {
    return withErrorHandling(async () => {
      return await tx
        .select()
        .from(docChatMessage)
        .where(eq(docChatMessage.chatId, docChatId))
        .execute();
    });
  });
}
