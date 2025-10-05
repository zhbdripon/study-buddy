import { BookCheck } from "lucide-react";
import { NewQuizButton } from "./NewQuizButton";
import { QuizResults } from "./QuizResult";
import { QuizTaker } from "./QuizTaker";
import { RecentQuiz } from "./RecentQuiz";
import { getQuizData, QuizData } from "./action";

const QuizContainer = async ({
  sessionId,
  searchParams,
}: {
  sessionId: string;
  searchParams: { page?: string; itemId?: string; tab?: string };
}) => {
  const params = await searchParams;
  const quizPage = params?.page;
  const quizId = params?.itemId;
  const tab = params?.tab;
  let quizData: QuizData | undefined = undefined;

  if (quizId && tab === "quiz") {
    quizData = await getQuizData(parseInt(quizId));

    if (quizPage === "quizTaker" && quizData) {
      return <QuizTaker sessionId={sessionId} quizData={quizData} />;
    }

    if (quizPage === "results" && quizData) {
      return <QuizResults quizData={quizData} />;
    }
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
