"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { DocChat } from "@/drizzle/types";
import { toast } from "sonner";
import { getDocumentChat, initializeDocumentChat } from "./action";
import DocumentChat from "./DocumentChat";

const ChatPanel = ({ studySessionId }: { studySessionId: string }) => {
  const [chat, setChat] = useState<DocChat | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      getDocumentChat(parseInt(studySessionId))
        .then((res) => {
          setChat(res);
        })
        .catch((error) => {
          console.log(error);
          toast.message("something went wrong");
        });
    });
  }, [studySessionId]);

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!chat) {
    return (
      <p>
        Start new chat{" "}
        <Button
          onClick={async () => {
            startTransition(async () => {
              const chat = await initializeDocumentChat(
                parseInt(studySessionId),
              );
              toast.message("Document indexed successfully");
              setChat(chat);
            });
          }}
        >
          Add
        </Button>
      </p>
    );
  }

  return <DocumentChat studySessionId={studySessionId} />;
};

export default ChatPanel;
