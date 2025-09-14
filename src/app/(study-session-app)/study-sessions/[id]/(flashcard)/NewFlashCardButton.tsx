"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { createFlashCard } from "./action";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export const NewFlashCardButton = ({ sessionId }: { sessionId: string }) => {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        setLoading(true);
        createFlashCard(parseInt(sessionId)).then((res) => {
          router.push(
            `/study-sessions/${sessionId}?tab=flashcards&page=flashCardView&itemId=${res.id}`,
          );
          setLoading(false);
        });
      }}
    >
      {loading ? "Generating new flashcards" : "Answer Some FlashCards"}
      {loading && <Spinner />}
    </Button>
  );
};
