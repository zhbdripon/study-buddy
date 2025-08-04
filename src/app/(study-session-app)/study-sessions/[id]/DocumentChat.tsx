"use client";

import { ChangeEventHandler, useEffect, useState, useTransition } from "react";

import { type Message } from "@/components/ui/chat-message";

import { Chat } from "@/components/ui/chat";

import { DocChatMessage } from "@/drizzle/types";
import { getChatMessages, sendChatMessage } from "./action";
import { toast } from "sonner";

const DocumentChat = ({ studySessionId }: { studySessionId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInputValue, setChatInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    startTransition(() => {
      getChatMessages(parseInt(studySessionId)).then(
        (messages: DocChatMessage[]) => {
          setMessages(messages);
        },
      );
    });
  }, [studySessionId]);

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setChatInputValue(e.target.value);
  };

  const handleSubmit = async () => {
    const newMessage = chatInputValue;

    setIsGenerating(true);
    setChatInputValue("");
    setMessages([
      ...messages,
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
      .then((newMessages: Message[]) => {
        setMessages((prevMessage) => mergeNewMessage(prevMessage, newMessages));
      })
      .catch((error) => {
        console.log(error);
        toast.message("Something went wrong");
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const stop = () => {
    // TODO: implement query stop
  };

  if (isPending) {
    return <p>Loading...</p>;
  }

  return (
    <Chat
      messages={messages}
      input={chatInputValue}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isGenerating}
      stop={stop}
    />
  );
};

export default DocumentChat;
