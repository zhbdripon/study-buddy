import {
  queryDocumentChat,
  queryDocumentChatMessages,
  queryStudySessionDocumentSummary,
} from "@/app/(study-session-app)/study-sessions/query";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { DocChatMessage, DocSummary } from "@/drizzle/types";
import { getDataOrThrow } from "@/lib/error-utils";
import { DocumentChat } from "./(chat)/DocumentChat";
import InitializeChatButton from "./(chat)/InitializeChatButton";
import FlashCardContainer from "./(flashcard)";
import QuizContainer from "./(quiz)";
import Summary from "./Summary";
import TabButton from "./TabButton";

const StudySession = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab: string; page?: string; itemId?: string };
}) => {
  const { id: studySessionId } = await params;
  const { tab } = await searchParams;

  const summaries: DocSummary[] = getDataOrThrow(
    await queryStudySessionDocumentSummary(parseInt(studySessionId)),
  );
  const documentChatQuery = await queryDocumentChat(parseInt(studySessionId));
  let messages: DocChatMessage[] = [];

  if (documentChatQuery.success) {
    const chat = documentChatQuery.data;
    const messageQuery = await queryDocumentChatMessages(chat.id);
    if (messageQuery.success) {
      messages = messageQuery.data;
    }
  }

  return (
    <div className="flex flex-row w-full h-svh">
      <div className="flex-1 order-r border-[var(--border)] p-6 h-full overflow-y-auto scrollbar-thin">
        <Tabs value={tab || "summary"} className="w-full">
          <TabsList className="mb-8">
            <TabButton value="summary" label="Summary" />
            <TabButton value="quiz" label="Quiz" />
            <TabButton value="flashcards" label="Flashcards" />
            <TabButton value="resources" label="Resources" />
          </TabsList>
          <TabsContent value="summary">
            <Summary summaries={summaries} />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizContainer
              sessionId={studySessionId}
              searchParams={searchParams}
            />
          </TabsContent>
          <TabsContent value="flashcards">
            <FlashCardContainer
              sessionId={studySessionId}
              searchParams={searchParams}
            />
          </TabsContent>
          <TabsContent value="resources">
            Access your resources here.
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-[450px] p-3 flex-shrink-0 flex h-full border-l border-[var(--border)]">
        {documentChatQuery.success ? (
          <DocumentChat studySessionId={studySessionId} messages={messages} />
        ) : (
          <InitializeChatButton studySessionId={studySessionId} />
        )}
      </div>
    </div>
  );
};

export default StudySession;
