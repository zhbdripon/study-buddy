import { BookCheck } from "lucide-react";
import { QuizTaker } from "./QuizTaker";
import { NewQuizButton } from "./NewQuizButton";
import { QuizResults } from "./QuizResult";
import { RecentQuiz } from "./RecentQuiz";

const QuizContainer = async ({
  sessionId,
  searchParams,
}: {
  sessionId: string;
  searchParams: { page?: string; itemId?: string };
}) => {
  const params = await searchParams;
  const quizPage = params?.page;
  const quizId = params?.itemId;

  if (quizPage === "quizTaker") {
    return <QuizTaker sessionId={sessionId} />;
  }

  if (quizPage === "results" && quizId) {
    console.log("Rendering QuizResults with quizId:", searchParams);
    return <QuizResults quizId={quizId} />;
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
          <NewQuizButton sessionId={sessionId} />
        </div>
      </div>
      <RecentQuiz sessionId={sessionId} />
    </div>
  );
};

export default QuizContainer;
