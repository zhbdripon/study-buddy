"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocQuizOption, DocQuizQuestion } from "@/drizzle/types";
import { fetchWithAuth } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

type QuizQuestionWithAnswer = DocQuizQuestion & {
  chosenOption?: DocQuizOption;
};

export const QuizTaker = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<QuizQuestionWithAnswer[]>([]);
  const [questionsIndex, setQuestionIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [currentChoice, setCurrentChoice] = useState<DocQuizOption | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const quizIdFromParams = searchParams.get("itemId");

  const fetchQuestions = useCallback(async () => {
    const res = await fetchWithAuth(
      `/api/study-sessions/${sessionId}/quiz/${quizIdFromParams}/question`,
    );
    if (res && res.ok) {
      const data = await res.json();
      setQuestions(data as QuizQuestionWithAnswer[]);
    }
  }, [sessionId, quizIdFromParams]);

  const createNewQuiz = useCallback(async () => {
    const res = await fetchWithAuth(`/api/study-sessions/${sessionId}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res && res.ok) {
      const data = await res.json();
      setQuestions(data as QuizQuestionWithAnswer[]);
    }
  }, [sessionId]);

  useEffect(() => {
    startTransition(async () => {
      if (questions.length === 0 && quizIdFromParams) {
        await fetchQuestions();
      } else if (questions.length === 0) {
        await createNewQuiz();
      }
    });
  }, [quizIdFromParams, sessionId, fetchQuestions, createNewQuiz]); // Added fetchQuestions and createNewQuiz to dependencies to avoid warnings

  const saveAnswer = async () => {
    if (!currentChoice) return;
    const question = questions[questionsIndex];
    const answer = currentChoice;

    const res = await fetchWithAuth(
      `/api/study-sessions/${sessionId}/quiz/${question.quizId}/question/${question.id}/answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer }),
      },
    );

    if (res && res.ok) {
      console.log("Answer saved successfully");
    } else {
      console.error("Failed to save answer");
    }
  };

  const saveQuizAsCompleted = async () => {
    const question = questions[questionsIndex];
    return await fetchWithAuth(
      `/api/study-sessions/${sessionId}/quiz/${question.quizId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isCompleted: true }),
      },
    );
  };

  const handleQuizNext = async () => {
    const question = questions[questionsIndex];
    if (currentChoice) {
      await saveAnswer();
    }

    if (questionsIndex === questions.length - 1) {
      saveQuizAsCompleted()
        .then((res) => {
          if (res && res.ok) {
            setQuestionIndex(0);
            setChoices({});
            setCurrentChoice(null);
            router.push(
              `/study-sessions/${sessionId}?tab=quiz&quizPage=results&quizId=${question.quizId}`,
            );
          }
        })
        .catch((error) => {
          console.error("Failed to mark quiz as completed", error);
        });

      return;
    }

    // Move to the next question
    setCurrentChoice(null);
    setQuestionIndex((prev) => prev + 1);
  };

  if (isPending && !quizIdFromParams) {
    return <div>Generating quiz...</div>;
  }

  if (isPending && quizIdFromParams && questions.length === 0) {
    return <div>Loading quiz...</div>;
  }

  if (!questions || questions.length === 0) {
    return <div>No questions available.</div>;
  }

  if (questions[questionsIndex].chosenOption) {
    setQuestionIndex((prev) => prev + 1);
  }

  return (
    <div>
      <p className="mb-4">
        {questionsIndex + 1 + ". "}
        {questions[questionsIndex].question}
      </p>
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
            {questionsIndex === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        )}
      </div>
    </div>
  );
};
