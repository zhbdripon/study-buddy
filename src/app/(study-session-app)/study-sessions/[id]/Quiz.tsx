"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocQuiz, DocQuizOption, DocQuizQuestion } from "@/drizzle/types";
import { fetchWithAuth } from "@/lib/utils";
import { BookCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

const QuizContainer = ({ sessionId }: { sessionId: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizPage = searchParams.get("quizPage");
  const quizId = searchParams.get("quizId");

  if (quizPage === "quizTaker") {
    return <QuizTaker sessionId={sessionId} />;
  }

  if (quizPage === "results" && quizId) {
    return <QuizResults sessionId={sessionId} quizId={quizId} />;
  }

  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          <BookCheck size={70} />
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Knowledge Quiz
          </h2>
          <p>Test your understanding and track your progress</p>
        </div>
        <div className="m-4">
          <Button
            onClick={() => {
              router.push(
                `/study-sessions/${sessionId}?tab=quiz&quizPage=quizTaker`,
              );
            }}
          >
            Take a new quiz
          </Button>
        </div>
      </div>
      <RecentQuiz sessionId={sessionId} />
    </div>
  );
};

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
  const quizIdFromParams = searchParams.get("quizId");

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

  if (isPending) {
    return <div>Generating quiz...</div>;
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

export type QuizResult = {
  id: string;
  quizId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  a: string;
  b: string;
  c: string;
  d: string;
};

export const QuizResults = ({
  sessionId,
  quizId,
}: {
  sessionId: string;
  quizId: string;
}) => {
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchQuizResults = useCallback(async () => {
    const res = await fetchWithAuth(
      `/api/study-sessions/${sessionId}/quiz/${quizId}/result`,
    );
    if (res && res.ok) {
      const data = await res.json();
      setResults(data as QuizResult[]);
    }
  }, [sessionId, quizId]);

  useEffect(() => {
    startTransition(() => {
      fetchQuizResults();
    });
  }, [sessionId, quizId, fetchQuizResults]);

  return (
    <div>
      Total Questions: {results?.length} <br />
      Correct Answers:{" "}
      {results?.filter((r) => r.userAnswer === r.correctAnswer).length} <br />
      {isPending && <div>Loading...</div>}
      {results?.map((result) => (
        <Card key={result.id} className="my-4">
          <CardContent>
            <p className="font-bold">{result.question}</p>
            <p>
              Answered: <b>{result[result.userAnswer]}</b>
            </p>
            {result.userAnswer !== result.correctAnswer && (
              <p>
                Correct: <b>{result[result.correctAnswer]}</b>
              </p>
            )}

            {result.userAnswer === result.correctAnswer ? (
              <p className="text-green-600 font-bold">Correct</p>
            ) : (
              <p className="text-red-600 font-bold">Incorrect</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const RecentQuiz = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quizzes, setQuizzes] = useState<DocQuiz[] | null>(null);

  const fetchRecentQuizzes = useCallback(async () => {
    const res = await fetchWithAuth(`/api/study-sessions/${sessionId}/quiz`);
    if (res && res.ok) {
      const data = await res.json();
      setQuizzes(data as DocQuiz[]);
    }
  }, [sessionId]);

  useEffect(() => {
    startTransition(async () => {
      await fetchRecentQuizzes();
    });
  }, [sessionId, fetchRecentQuizzes]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!quizzes || quizzes.length === 0) {
    return <div>No recent quizzes found.</div>;
  }

  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mx-2">
        Recent Quizzes
      </h4>
      <div className="flex flex-row flex-wrap">
        {quizzes?.map((quiz) => (
          <div
            key={quiz.id}
            className="border p-4 m-2 cursor-pointer rounded-md bg-sidebar w-xs"
            onClick={() => {
              if (quiz.isCompleted) {
                router.push(
                  `/study-sessions/${sessionId}?tab=quiz&quizPage=results&quizId=${quiz.id}`,
                );
              } else {
                router.push(
                  `/study-sessions/${sessionId}?tab=quiz&quizPage=quizTaker&quizId=${quiz.id}`,
                );
              }
            }}
          >
            <p>Quiz {quiz.id}</p>
            <p>Status: {quiz.isCompleted ? "Completed" : "Pending"}</p>
            <p className="italic text-xs text-muted-foreground">
              Created At: {new Date(quiz.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default QuizContainer;
