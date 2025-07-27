import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getStudySessionDocumentSummary } from "./action";

const StudySession = async ({ params }: { params: { id: string } }) => {
  const { id: studySessionId } = await params;
  const summaries = await getStudySessionDocumentSummary(
    parseInt(studySessionId),
  );

  return (
    <div className="flex flex-row w-full h-svh">
      <div className="flex-1 order-r border-[var(--border)] p-6 h-full">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            {summaries.map((data) => (
              <div
                key={data.id}
                className="prose dark:prose-invert lg:prose-md"
              >
                <Markdown remarkPlugins={[remarkGfm]}>{data.summary}</Markdown>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="quiz">Take your quiz here.</TabsContent>
          <TabsContent value="flashcards">
            Review your flashcards here.
          </TabsContent>
          <TabsContent value="resources">
            Access your resources here.
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-96 flex-shrink-0 h-full border-l border-[var(--border)]">
        chat
      </div>
    </div>
  );
};

export default StudySession;
