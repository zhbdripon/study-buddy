import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocSummary } from "@/drizzle/types";
import { getStudySessionDocumentSummary } from "./action";
import ChatPanel from "./ChatPanel";
import Quiz from "./Quiz";
import Summary from "./Summary";

const StudySession = async ({ params }: { params: { id: string } }) => {
  const { id: studySessionId } = await params;
  const summaries: DocSummary[] = await getStudySessionDocumentSummary(
    parseInt(studySessionId),
  );

  return (
    <div className="flex flex-row w-full h-svh">
      <div className="flex-1 order-r border-[var(--border)] p-6 h-full overflow-y-auto scrollbar-thin">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <Summary summaries={summaries} />
          </TabsContent>
          <TabsContent value="quiz">
            <Quiz sessionId={studySessionId} />
          </TabsContent>
          <TabsContent value="flashcards">
            Review your flashcards here.
          </TabsContent>
          <TabsContent value="resources">
            Access your resources here.
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-[450px] p-3 flex-shrink-0 flex h-full border-l border-[var(--border)]">
        <ChatPanel studySessionId={studySessionId} />
      </div>
    </div>
  );
};

export default StudySession;
