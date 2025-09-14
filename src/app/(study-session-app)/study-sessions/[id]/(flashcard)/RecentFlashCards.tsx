import React from "react";
import { getRecentFlashCards } from "./action";
import { RecentFlashCard } from "./RecentFlashCard";

export const RecentFlashCards = async ({
  sessionId,
}: {
  sessionId: string;
}) => {
  const recentFlashCards = await getRecentFlashCards(parseInt(sessionId));
  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mx-2">
        Recent FlashCards
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentFlashCards.map((flashCard) => (
          <RecentFlashCard key={flashCard.id} flashCard={flashCard} />
        ))}
      </div>
    </div>
  );
};
