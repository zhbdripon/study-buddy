"use client";

import { Button } from "@/components/ui/button";
import React, { useTransition } from "react";
import { initializeDocumentChat } from "../action";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

const InitializeChatButton = ({
  studySessionId,
}: {
  studySessionId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex w-full h-full justify-center items-center">
      <Button
        onClick={async () => {
          startTransition(async () => {
            const chat = await initializeDocumentChat(parseInt(studySessionId));
            if (chat) {
              toast.message("Document indexed successfully");
            } else {
              toast.error("Failed to initialize chat");
            }
          });
        }}
      >
        {isPending ? (
          <span className="flex flex-row items-center gap-2">
            Initializing... <Spinner />
          </span>
        ) : (
          "Initialize Chat"
        )}
      </Button>
    </div>
  );
};

export default InitializeChatButton;
