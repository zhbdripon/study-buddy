import { Card, CardContent } from "@/components/ui/card";
import { getQuizResult } from "./action";

export const QuizResults = async ({ quizId }: { quizId: string }) => {
  const quizResults = await getQuizResult(quizId);

  return (
    <div>
      {quizResults.map((result) => (
        <Card key={result.id} className="my-4">
          <CardContent>
            <p className="font-bold">{result.question}</p>
            <p>
              {result?.userAnswer && (
                <span>
                  Answered: <b>{result[result.userAnswer]}</b>
                </span>
              )}
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
