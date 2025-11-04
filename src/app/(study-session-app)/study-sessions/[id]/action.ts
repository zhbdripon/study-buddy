"use server";
import { v4 as uuidv4 } from "uuid";

import {
  insertDocChatMessagesMutation,
  insertDocumentChatMutation,
} from "@/app/(study-session-app)/study-sessions/mutation";
import {
  queryDocumentChat,
  queryDocuments,
  queryStudySessionDocumentSummary,
} from "@/app/(study-session-app)/study-sessions/query";
import { DocChat, DocChatMessage, DocChatMessageInsert } from "@/drizzle/types";
import { documentTypes, DocumentType } from "@/lib/shared/constants";
import {
  getDataOrThrow,
  withAuth,
  withErrorHandling,
} from "@/lib/shared/error-utils";
import { DocumentChat } from "@/service/documentChat";
import { indexWebResource, indexYoutubeResource } from "@/service/document";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { revalidatePath } from "next/cache";

export async function initializeDocumentChat(
  studySessionId: number,
): Promise<DocChat> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [document, ...rest] = getDataOrThrow(
    await queryDocuments(studySessionId),
  );

  if (document && document.meta) {
    const meta = document.meta as {
      type: Extract<DocumentType, "webUrl" | "youtube">;
      url: string;
    };
    let indexedData: { namespace: string } | null = null;

    if (meta.type === documentTypes.youtube && meta.url) {
      indexedData = await indexYoutubeResource(meta.url);
    } else if (meta.type === documentTypes.webUrl && meta.url) {
      indexedData = await indexWebResource(meta.url);
    } else {
      return Promise.reject(
        "Unsupported document type for chat initialization",
      );
    }

    const chat = getDataOrThrow(
      await insertDocumentChatMutation({
        title: indexedData.namespace,
        sessionId: studySessionId,
        embeddingPath: indexedData.namespace,
        threadId: uuidv4(),
      }),
    );

    revalidatePath(`/study-sessions/${studySessionId}`);
    return Promise.resolve(chat);
  }
  return Promise.reject("Couldn't initialize chat");
}

export async function sendChatMessage(
  studySessionId: number,
  message: string,
): Promise<DocChatMessage[]> {
  const messages = getDataOrThrow(
    await withAuth(async (user) => {
      return withErrorHandling(async () => {
        const chat = getDataOrThrow(await queryDocumentChat(studySessionId));
        const summaries = getDataOrThrow(
          await queryStudySessionDocumentSummary(studySessionId),
        );
        const summaryData = summaries.reduce((totalSummary, currSummary) => {
          return (totalSummary += currSummary.summary ?? "");
        }, "");

        const documentChat = new DocumentChat(
          chat.embeddingPath,
          summaryData ? summaryData : undefined,
        );

        await documentChat.initializeChat(user.id);

        const messages = (await documentChat.sendMessage(
          chat.threadId,
          message,
        )) as BaseMessage[];

        const newMessagePayload = messages.map(
          (message: BaseMessage) =>
            ({
              role: message instanceof HumanMessage ? "user" : "assistant",
              content: message.content,
              chatId: chat.id,
            }) as DocChatMessageInsert,
        );

        return getDataOrThrow(
          await insertDocChatMessagesMutation(newMessagePayload),
        );
      });
    }),
  );
  revalidatePath(`/study-sessions/${studySessionId}`);
  return messages;
}
