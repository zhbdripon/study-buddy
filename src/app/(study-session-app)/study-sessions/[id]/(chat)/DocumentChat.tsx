"use client";

import { ChangeEventHandler, useState } from "react";

import { Chat } from "@/components/ui/chat";

import { Message } from "@/components/ui/chat-message";
import { DocChatMessage } from "@/drizzle/types";
import { toast } from "sonner";
import { sendChatMessage } from "../action";

export const DocumentChat = ({
  studySessionId,
  messages,
}: {
  studySessionId: string;
  messages: DocChatMessage[];
}) => {
  const [messagesState, setMessagesState] = useState<Message[]>(messages);
  const [chatInputValue, setChatInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setChatInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    const newMessage = chatInputValue;

    setIsGenerating(true);
    setChatInputValue("");
    setMessagesState((prev) => [
      ...prev,
      {
        id: Number.MAX_SAFE_INTEGER,
        role: "user",
        content: newMessage,
      } as Message,
    ]);

    const mergeNewMessage = (
      prevMessages: Message[],
      newMessages: Message[],
    ): Message[] => {
      const copyPrevMessage = [...prevMessages];
      copyPrevMessage.pop();
      return [...copyPrevMessage, ...newMessages];
    };

    sendChatMessage(parseInt(studySessionId), newMessage)
      .then((newMessages) => {
        setMessagesState((prevMessage) =>
          mergeNewMessage(prevMessage, newMessages),
        );
      })
      .catch(() => {
        toast.message("Something went wrong");
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const stop = () => {
    // TODO: implement query stop
  };

  return (
    <Chat
      messages={messagesState}
      input={chatInputValue}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isGenerating}
      stop={stop}
    />
  );
};
