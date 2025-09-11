"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocFlashCardQuestion } from "@/drizzle/types";
import { fetchWithAuth } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { isNumber } from "remeda";

type ResultInstance = Record<string, { answer: string; isCorrect: boolean }>;

export const FlashCardView = ({
  sessionId,
  flashCardId,
}: {
  sessionId: string;
  flashCardId?: string;
}) => {
  const [flashCards, setFlashCards] = useState<DocFlashCardQuestion[]>([]);
  const [currentFlashCardId, setCurrentFlashCardId] = useState<number | null>(
    null,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ResultInstance>({});
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );

  const fetchFlashCards = useCallback(
    async (flashCardId) => {
      const res = await fetchWithAuth(
        `/api/study-sessions/${sessionId}/flashcard/${flashCardId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (res && res.ok) {
        const data = await res.json();
        setCurrentFlashCardId(parseInt(flashCardId));
        setFlashCards(data as DocFlashCardQuestion[]);
      }
    },
    [flashCardId],
  );

  const createNewFlashCard = useCallback(async () => {
    const res = await fetchWithAuth(
      `/api/study-sessions/${sessionId}/flashcard`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res && res.ok) {
      const data = await res.json();
      setFlashCards(data as DocFlashCardQuestion[]);
      setCurrentFlashCardId(data[0]?.flashCardId);
    }
  }, [sessionId]);

  useEffect(() => {
    startTransition(async () => {
      if (flashCards.length === 0 && flashCardId) {
        await fetchFlashCards(flashCardId);
      } else if (flashCards.length === 0) {
        await createNewFlashCard();
      }
    });
  }, [flashCardId, sessionId, fetchFlashCards, createNewFlashCard]);

  if (currentIndex >= flashCards.length && flashCards.length > 0) {
    return (
      <FlashCardResult
        sessionId={sessionId}
        result={result}
        onRestart={() => {
          setCurrentIndex(0);
          setResult({});
        }}
        onCreateNew={createNewFlashCard}
      />
    );
  }

  const flashCard = flashCards[currentIndex];

  if (isPending && !flashCard && !flashCardId) {
    return <div>Generating...</div>;
  }

  if (isPending || !flashCard) {
    return <div>Loading...</div>;
  }

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
      {isNumber(currentFlashCardId) && (
        <div className="flex justify-between mb-2 px-4">
          <p className="text-lg font-semibold text-center">
            Flashcard {currentFlashCardId + 1}
          </p>
          <p>
            {currentIndex + 1} / {flashCards.length}
          </p>
        </div>
      )}
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
  onRestart,
  onCreateNew,
}: {
  result: ResultInstance;
  sessionId: string;
  onRestart: () => void;
  onCreateNew: () => void;
}) => {
  const router = useRouter();

  const numberOfCorrect = Object.keys(result).reduce(
    (acc, cur) => (acc += result[cur].isCorrect ? 1 : 0),
    0,
  );

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">Session Complete!</h2>
      <p className="mb-4">
        Your Results: {numberOfCorrect}/{Object.keys(result).length}
      </p>
      <ul className="mb-4">
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
      <Button onClick={onRestart}>Restart Session</Button>
      <Button className="mt-2" onClick={onCreateNew}>
        Create New Flashcard
      </Button>
      <Button
        className="mt-2"
        onClick={() => {
          router.push(`/study-sessions/${sessionId}?tab=flashcards`);
        }}
      >
        Recent Flashcards
      </Button>
    </div>
  );
};
