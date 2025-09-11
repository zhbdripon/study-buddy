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
      <h3 className="scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0">
        Recent FlashCards
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentFlashCards.map((flashCard) => (
          <RecentFlashCard key={flashCard.id} flashCard={flashCard} />
        ))}
      </div>
    </div>
  );
};
