"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlashCardData } from "./action";

type ResultInstance = Record<string, { answer: string; isCorrect: boolean }>;

export const FlashCardView = ({
  sessionId,
  flashcardData,
}: {
  sessionId: string;
  flashcardData: FlashCardData;
}) => {
  const flashCards = flashcardData.questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<ResultInstance>({});
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );

  if (currentIndex >= flashCards.length && flashCards.length > 0) {
    return <FlashCardResult sessionId={sessionId} result={result} />;
  }

  const flashCard = flashCards[currentIndex];

  const commonClasses =
    "bg-sidebar absolute w-full h-full flex items-center justify-center rounded-2xl shadow-xl backface-hidden";

  function handleNextCard(isCorrect: boolean, answer: string) {
    setShowAnswer(false);
    setResult((prev) => ({
      ...prev,
      [flashCard.question]: {
        isCorrect,
        answer,
      },
    }));
    setSlideDirection("right");
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }

  return (
    <div className="w-full h-96 perspective cursor-pointer">
      <div className="flex justify-between mb-2 px-4">
        <p className="text-lg font-semibold text-center">
          Flashcard {flashcardData.id + 1}
        </p>
        <p>
          {currentIndex + 1} / {flashCards.length}
        </p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: slideDirection === "right" ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideDirection === "right" ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full"
        >
          <motion.div
            className="relative w-full h-full"
            initial={false}
            animate={{ rotateY: showAnswer ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: "preserve-3d" }}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {/* Front (Question) */}
            <div className={commonClasses}>
              <p className="text-lg font-semibold text-center px-4">
                {flashCard.question}
              </p>
            </div>
            {/* Back (Answer) */}
            <div
              className={`${commonClasses} backface-hidden`}
              style={{ transform: "rotateY(180deg)" }}
            >
              <div>
                <p className="text-lg font-semibold text-center px-4">
                  Answer: {flashCard.answer}
                </p>
                <div className="mt-4 flex justify-center gap-4 items-center">
                  <p>My answer was: </p>
                  {["correct", "incorrect"].map((status, idx) => (
                    <Button
                      key={idx}
                      variant={status === "correct" ? "outline" : "destructive"}
                      size="sm"
                      onClick={(e) => {
                        const isCorrect = status === "correct";
                        e.stopPropagation();
                        handleNextCard(isCorrect, flashCard.answer);
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <blockquote className="mt-2 pl-6 text-xs">
        {showAnswer
          ? "Evaluate your answer to continue"
          : "Click on the card to see the answer"}
      </blockquote>
    </div>
  );
};

const FlashCardResult = ({
  result,
  sessionId,
}: {
  result: ResultInstance;
  sessionId: string;
}) => {
  const router = useRouter();

  const numberOfCorrect = Object.keys(result).reduce(
    (acc, cur) => (acc += result[cur].isCorrect ? 1 : 0),
    0,
  );

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-2">Session Complete!</h2>
      <p className="mb-2">
        Your Results: {numberOfCorrect}/{Object.keys(result).length}
      </p>
      <Button
        className="mb-4"
        variant="link"
        onClick={() => {
          router.push(`/study-sessions/${sessionId}?tab=flashcards`);
        }}
      >
        Go Back
      </Button>
      <ul>
        {Object.entries(result).map(
          ([question, { isCorrect, answer }], idx) => (
            <li key={idx} className="mb-2">
              <Card>
                <CardContent>
                  <p>Question: {question}</p>
                  <p>Answer: {answer}</p>
                  <span
                    className={isCorrect ? "text-green-500" : "text-red-500"}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </CardContent>
              </Card>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};
