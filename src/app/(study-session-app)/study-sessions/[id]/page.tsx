import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStudySessionDocumentSummary } from "./action";

const StudySession = async ({ params }: { params: { id: string } }) => {
  const { id: studySessionId } = await params;
  const summaries = await getStudySessionDocumentSummary(
    parseInt(studySessionId),
  );

  return (
    <div className="flex flex-row w-full">
      <div className="grow-1 border-r border-[var(--border)] p-6 h-svh">
        <Tabs defaultValue="summary" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            {summaries.map((data) => (
              <div className="w-full" key={data.id}>
                {data.summary}
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
      <div className="w-96">chat</div>
    </div>
  );
};

export default StudySession;
