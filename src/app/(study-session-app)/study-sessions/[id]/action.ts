"use server";
import {
  db,
  docChat,
  docChatMessage,
  document,
  documentSummary,
  studySession,
} from "@/drizzle";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

import {
  DocChat,
  DocChatInsert,
  DocChatMessage,
  DocChatMessageInsert,
} from "@/drizzle/types";
import { documentType, DocumentType } from "@/lib/constants";
import { DocumentChat } from "@/service/documentChat";
import { indexWebResource } from "@/service/studySession";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";

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

export async function getDocumentChat(
  studySessionId: number,
): Promise<DocChat> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  if (!user) return Promise.reject("User not found");

  const result = await db
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

  return result[0]?.doc_chat;
}

export async function initializeDocumentChat(
  studySessionId: number,
): Promise<DocChat> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  if (!user) {
    throw Error("User not found");
  }

  const result = await db
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

  const doc = result[0]?.documents;

  if (doc && doc.meta) {
    const meta = doc.meta as { type: DocumentType; url: string };

    if (meta.type === documentType.webUrl && meta.url) {
      const result = await indexWebResource(meta.url);

      if (result && result.namespace) {
        return await db
          .insert(docChat)
          .values({
            title: result.namespace,
            sessionId: studySessionId,
            embeddingPath: result.namespace,
            threadId: uuidv4(),
          } as DocChatInsert)
          .returning()
          .then((res) => res[0]);
      }
    }
  }
  return Promise.reject("Something went wrong.");
}

export async function sendChatMessage(
  studySessionId: number,
  message: string,
): Promise<DocChatMessage[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const chat = await getDocumentChat(studySessionId);
  const summaries = await getStudySessionDocumentSummary(studySessionId);
  const summaryData = summaries.reduce((totalSummary, currSummary) => {
    return (totalSummary += currSummary.summary || "");
  }, "");

  const user = session?.user;
  if (!user) {
    throw Error("User not found");
  }

  try {
    const documentChat = new DocumentChat(
      chat.embeddingPath,
      user.id,
      summaryData ? summaryData : undefined,
    );
    await documentChat.initializeChat();
    const messages: BaseMessage[] = await documentChat.sendMessage(
      chat.threadId,
      message,
    );

    return db
      .insert(docChatMessage)
      .values(
        messages.map(
          (message: BaseMessage) =>
            ({
              role: message instanceof HumanMessage ? "user" : "assistant",
              content: message.content,
              chatId: chat.id,
            }) as DocChatMessageInsert,
        ),
      )
      .returning();
  } catch (error) {
    console.log(error);
    return Promise.reject("Something went wrong");
  }
}

export async function getChatMessages(
  studySessionId: number,
): Promise<DocChatMessage[]> {
  const chat = await getDocumentChat(studySessionId);

  if (!chat) {
    return Promise.reject("Chat doesn't exist");
  }

  return db
    .select()
    .from(docChatMessage)
    .where(eq(docChatMessage.chatId, chat.id))
    .execute();
}
