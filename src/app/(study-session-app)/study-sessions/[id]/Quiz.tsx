"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/utils";
import { MCQ } from "@/service/mcqGenerator";
import { BookCheck } from "lucide-react";
import { useState } from "react";

type Props = { sessionId: string };

const QuizContainer = ({ sessionId }: Props) => {
  const [quizzes, setQuizzes] = useState<MCQ[] | null>(null);

  const handleMCQGenerate = async () => {
    const res = await fetchWithAuth(`/api/study-sessions/${sessionId}/mcq`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res && res.ok) {
      const data = await res.json();
      setQuizzes(data as MCQ[]);
    }
  };

  if (quizzes) {
    return <QuizTaker quizzes={quizzes} />;
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
          <Button onClick={handleMCQGenerate}>Take a new quiz</Button>
        </div>
      </div>
      <div>Recent Quiz</div>
    </div>
  );
};
type QuizOption = "A" | "B" | "C" | "D";

const QuizTaker = ({ quizzes }: { quizzes: MCQ[] }) => {
  const [quizIndex, setQuizIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [currentChoice, setCurrentChoice] = useState<QuizOption | null>(null);

  return (
    <div>
      <p className="mb-4">
        {quizIndex + 1 + ". "}
        {quizzes[quizIndex].question}
      </p>
      {["A", "B", "C", "D"].map((option) => (
        <Card
          onClick={() => {
            setCurrentChoice(option as QuizOption);
            setChoices({
              ...choices,
              [quizzes[quizIndex].question]: option,
            });
          }}
          key={option}
          className={`my-4 h-12 p-0 flex flex-col justify-center cursor-pointer ${currentChoice === option ? "bg-gray-400" : ""}`}
        >
          <CardContent className="pt-0 m-0">
            {option}: {quizzes[quizIndex][option]}
          </CardContent>
        </Card>
      ))}
      <div className="flex flex-row justify-end w-full">
        {quizIndex <= quizzes.length - 1 && (
          <Button
            disabled={!currentChoice}
            onClick={() => {
              setCurrentChoice(null);
              setQuizIndex((prev) => prev + 1);
            }}
          >
            {quizIndex === quizzes.length - 1 ? "Finish" : "Next"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizContainer;
