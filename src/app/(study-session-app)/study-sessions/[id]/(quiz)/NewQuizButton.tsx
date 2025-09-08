"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export const NewQuizButton = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        router.push(`/study-sessions/${sessionId}?tab=quiz&quizPage=quizTaker`);
      }}
    >
      Take a new quiz
    </Button>
  );
};
