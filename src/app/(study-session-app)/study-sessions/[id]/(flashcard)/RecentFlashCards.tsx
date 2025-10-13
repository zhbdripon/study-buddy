import { getDataOrThrow } from "@/lib/error-utils";
import { RecentFlashCard } from "./RecentFlashCard";
import { queryRecentFlashCards } from "./query";

export const RecentFlashCards = async ({
  sessionId,
}: {
  sessionId: string;
}) => {
  const recentFlashCards = await getDataOrThrow(
    await queryRecentFlashCards(parseInt(sessionId)),
  );

  if (!recentFlashCards || recentFlashCards.length === 0) {
    return (
      <div className="flex justify-center gap-y-8">
        You haven&apos;t created any flashcards yet.
      </div>
    );
  }

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mx-2 mb-2">
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
