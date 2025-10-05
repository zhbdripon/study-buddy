import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import WebLinkDialogue from "@/components/ui/WebLinkDialogue";
import { Upload } from "lucide-react";

import { getDataOrThrow } from "@/lib/error-utils";
import { queryStudySessions } from "@/app/(study-session-app)/study-sessions/query";
import { SessionCard } from "./SessionCard";

const StudySessions = async () => {
  const studySessions = getDataOrThrow(await queryStudySessions());

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
            <WebLinkDialogue />
            <Button className="mx-2">Youtube Link</Button>
            <Button className="mx-2">Documents</Button>
            <Button className="mx-2">Handwriting</Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 ">
        {studySessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default StudySessions;
