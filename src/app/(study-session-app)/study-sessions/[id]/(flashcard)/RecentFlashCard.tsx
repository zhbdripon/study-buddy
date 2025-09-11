"use client";
import { DocFlashCard } from "@/drizzle/types";
import { useRouter } from "next/navigation";
import React from "react";

export const RecentFlashCard = ({ flashCard }: { flashCard: DocFlashCard }) => {
  const router = useRouter();
  return (
    <div
      onClick={() =>
        router.push(
          `/study-sessions/${flashCard.sessionId}?tab=flashcards&page=flashCardView&itemId=${flashCard.id}`,
        )
      }
      key={flashCard.id}
      className="rounded-lg border p-4 shadow hover:shadow-lg cursor-pointer bg-sidebar"
    >
      <p>Flashcards {flashCard.id + 1}</p>
      <p className="italic text-xs text-muted-foreground">
        Created At: {new Date(flashCard.createdAt).toLocaleString()}
      </p>
    </div>
  );
};
