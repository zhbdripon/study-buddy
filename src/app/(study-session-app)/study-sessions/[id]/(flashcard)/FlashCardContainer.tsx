import React from "react";
import { FileQuestionMark } from "lucide-react";
import { NewFlashCardButton } from "./NewFlashCardButton";
import { RecentFlashCards } from "./RecentFlashCards";
import { FlashCardView } from "./FlashCardView";

const FlashCardContainer = async ({
  sessionId,
  searchParams,
}: {
  sessionId: string;
  searchParams: { page?: string; itemId?: string };
}) => {
  const params = await searchParams;
  const page = params?.page;
  const itemId = params?.itemId;
  console.log("FlashCardContainer params:", page, page === "flashCardsView");
  if (page === "flashCardView") {
    return <FlashCardView sessionId={sessionId} flashCardId={itemId} />;
  }

  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          <FileQuestionMark size={70} />
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            FlashCards
          </h2>
          <p>Popular self evaluation method</p>
        </div>
        <div className="m-4">
          <NewFlashCardButton sessionId={sessionId} />
        </div>
      </div>
      <RecentFlashCards sessionId={sessionId} />
    </div>
  );
};

export default FlashCardContainer;
