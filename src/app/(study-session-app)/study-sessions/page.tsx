"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import WebLinkDialogue from "@/components/ui/WebLinkDialogue";
import { Upload } from "lucide-react";

import { StudySession } from "@/drizzle/types";
import { getFormattedDateAndTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addURL, getStudySessions } from "./action";

const StudySessions = () => {
  const router = useRouter();
  const [studySession, setStudySession] = useState<StudySession[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getStudySessions();
      setStudySession(data);
    });
  }, []);

  async function handleWebUrlResource(url: string): Promise<void> {
    toast("Indexing your document, please wait...", {
      duration: 5000,
      description:
        "This may take a few minutes depending on the document size.",
    });
    await addURL(url)
      .then((studySessionId: number) => {
        router.push(`/study-sessions/${studySessionId}`);
        toast.success("Document indexed successfully!");
      })
      .catch((error) => {
        console.error("Error indexing document:", error);
        toast.error("Failed to index the document. Please try again.");
      });
  }

  return (
    <div className="p-6">
      <Card className="border-dashed border-4 p-8">
        <CardContent>
          <div className="flex flex-col justify-center items-center mb-4">
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-[var(--border)]">
              <Upload size={64} />
            </div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
              Upload Your Study Materials
            </h3>
            <p className="leading-7  text-[16px]">
              Add your Documents (PDF, TXT, DOC), Web link, Youtube or
              Handwriting
            </p>
          </div>
          <div className="flex justify-center">
            <WebLinkDialogue onURLAdd={handleWebUrlResource} />
            <Button className="mx-2">Youtube Link</Button>
            <Button className="mx-2">Documents</Button>
            <Button className="mx-2">Handwriting</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 ">
        {isPending && <p>Loading...</p>}
        {studySession.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => router.push(`/study-sessions/${session.id}`)}
          >
            <CardHeader>{session.name}</CardHeader>
            <CardFooter>
              <blockquote className="mt-6 border-l-2 pl-6 italic text-xs text-muted-foreground">
                {"created at:" +
                  getFormattedDateAndTime(new Date(session.createdAt))}
              </blockquote>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudySessions;
