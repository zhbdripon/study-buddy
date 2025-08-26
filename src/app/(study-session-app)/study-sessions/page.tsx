"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import WebLinkDialogue from "@/components/ui/WebLinkDialogue";
import { Upload } from "lucide-react";

import { StudySession } from "@/drizzle/types";
import { fetchWithAuth, getFormattedDateAndTime } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addURL, getStudySessions } from "./action";

const StudySessions = () => {
  const router = useRouter();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getStudySessions();
      setStudySessions(data);
    });
  }, []);

  async function handleWebUrlResource(url: string): Promise<void> {
    toast("Analyzing your document, please wait...", {
      duration: 5000,
      description:
        "This may take a few minutes depending on the document size.",
    });
    await addURL(url)
      .then((studySessionId: number) => {
        router.push(`/study-sessions/${studySessionId}`);
        toast.success("Document summarized successfully!");
      })
      .catch((error) => {
        console.error("Error analyzing document:", error);
        toast.error("Failed to analyzing the document. Please try again.");
      });
  }

  const handleRemoveStudySession = (session: StudySession) => {
    setStudySessions((prev) => prev.filter((item) => item.id !== session.id));
  };

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
        {studySessions.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => router.push(`/study-sessions/${session.id}`)}
          >
            <CardHeader className="flex justify-between">
              <label className="text-ellipsis">{session.name}</label>
              <StudySessionDDMenu
                session={session}
                onSessionDelete={() => handleRemoveStudySession(session)}
              />
            </CardHeader>
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

const StudySessionDDMenu = ({
  session,
  onSessionDelete,
}: {
  session: StudySession;
  onSessionDelete: () => void;
}) => {
  const deleteStudySession = async () => {
    const res = await fetchWithAuth(`/api/study-sessions/${session.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical
          className="p-2 size-8 text-muted-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteStudySession()
                .then((res) => {
                  if (res && res.ok) {
                    onSessionDelete();
                    toast(`Study session has been deleted`);
                  } else {
                    toast.message("Couldn't delete study session");
                  }
                })
                .catch(() => {
                  toast.message("Couldn't delete study session");
                });
            }}
          >
            Delete
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
