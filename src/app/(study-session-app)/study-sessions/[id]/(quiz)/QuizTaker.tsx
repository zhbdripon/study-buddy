"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { DocQuizOption } from "@/drizzle/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { QuizData, markQuizAsCompleted, saveQuizAnswer } from "./action";

export const QuizTaker = ({
  sessionId,
  quizData,
}: {
  sessionId: string;
  quizData: QuizData;
}) => {
  const router = useRouter();
  const { questions, id: quizId } = quizData;
  const [questionsIndex, setQuestionIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [currentChoice, setCurrentChoice] = useState<DocQuizOption | null>(
    null,
  );

  const handleQuizComplete = async (quizId: number) => {
    await markQuizAsCompleted(quizId)
      .then(() => {
        setQuestionIndex(0);
        setChoices({});
        setCurrentChoice(null);
        router.replace(
          `/study-sessions/${sessionId}?tab=quiz&page=results&itemId=${quizId}`,
        );
      })
      .catch(() => {
        toast.error("Failed to mark quiz as completed");
      });
  };

  const handleQuizNext = async () => {
    const question = questions[questionsIndex];

    if (currentChoice) {
      setSavingAnswer(true);
      const insertedAnswer = await saveQuizAnswer(
        parseInt(sessionId),
        question.id,
        currentChoice,
      )
        .then((res) => res)
        .catch(() => {
          toast.error("Failed to save quiz answer");
        })
        .finally(() => {
          setSavingAnswer(false);
        });

      if (!insertedAnswer) {
        return;
      }
    }

    if (questionsIndex === questions.length - 1) {
      await handleQuizComplete(quizId);
      return;
    }

    // Move to the next question
    setCurrentChoice(null);
    setQuestionIndex((prev) => prev + 1);
  };

  if (quizData && quizData.isCompleted) {
    return (
      <div className="flex flex-col items-center gap-y-2">
        <h2>Quiz Completed</h2>
        <p>Your results have been saved.</p>
        <Button
          onClick={() =>
            router.replace(
              `/study-sessions/${sessionId}?tab=quiz&page=results&itemId=${quizId}`,
            )
          }
        >
          View Results
        </Button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <div>No questions available.</div>;
  }

  if (questions[questionsIndex].chosenOption) {
    let allQuestionsAnswered = true;
    for (let i = questionsIndex + 1; i < questions.length; i++) {
      if (!questions[i].chosenOption) {
        setQuestionIndex(i);
        allQuestionsAnswered = false;
        break;
      }
    }

    if (allQuestionsAnswered) {
      handleQuizComplete(quizId);
      return null;
    }
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-start mb-4">
        <p className="w-[90%]">
          {questionsIndex + 1 + ". "}
          {questions[questionsIndex].question}
        </p>
        <p>
          {questionsIndex + 1}/{questions.length}
        </p>
      </div>
      {["a", "b", "c", "d"].map((option) => (
        <Card
          onClick={() => {
            setCurrentChoice(option as DocQuizOption);
            setChoices({
              ...choices,
              [questions[questionsIndex].question]: option,
            });
          }}
          key={option}
          className={`my-4 h-12 p-0 flex flex-col justify-center cursor-pointer ${currentChoice === option ? "bg-gray-400" : ""}`}
        >
          <CardContent className="pt-0 m-0">
            {option}. {questions[questionsIndex][option]}
          </CardContent>
        </Card>
      ))}
      <div className="flex flex-row justify-end w-full">
        {questionsIndex <= questions.length - 1 && (
          <Button disabled={!currentChoice} onClick={handleQuizNext}>
            {savingAnswer ? (
              <>
                Saving <Spinner />
              </>
            ) : questionsIndex === questions.length - 1 ? (
              "Finish"
            ) : (
              "Next"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
