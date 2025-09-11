"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export const NewFlashCardButton = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        router.push(
          `/study-sessions/${sessionId}?tab=flashcards&page=flashCardView`,
        );
      }}
    >
      Answer some flashcards
    </Button>
  );
};
