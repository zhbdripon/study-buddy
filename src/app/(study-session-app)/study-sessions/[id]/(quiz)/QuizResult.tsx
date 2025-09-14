"use client";
import { Card, CardContent } from "@/components/ui/card";
import { QuizData } from "./action";
import { Button } from "@/components/ui/button";

export const QuizResults = ({ quizData }: { quizData: QuizData }) => {
  const { questions } = quizData;
  return (
    <div>
      <div className="mb-4 w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold">Quiz {quizData.id}</h2>
        <p className="">Here are your quiz results:</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => {
            window.history.back();
          }}
        >
          Go back
        </Button>
      </div>
      {questions.map((result) => (
        <Card key={result.id} className="my-4">
          <CardContent>
            <p className="font-bold">{result.question}</p>
            <p>
              {result?.chosenOption && (
                <span>
                  Answered: <b>{result[result.chosenOption]}</b>
                </span>
              )}
            </p>
            {result.chosenOption !== result.answer && (
              <p>
                Correct: <b>{result[result.answer]}</b>
              </p>
            )}

            {result.chosenOption === result.answer ? (
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
