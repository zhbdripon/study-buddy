import { getRecentQuizzes } from "./action";
import RecentQuizCard from "./RecentQuizCard";

export const RecentQuiz = async ({ sessionId }: { sessionId: string }) => {
  const quizzes = await getRecentQuizzes(parseInt(sessionId));

  if (!quizzes || quizzes.length === 0) {
    return <div>Your recent quizzes will be listed below</div>;
  }

  return (
    <>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mx-2">
        Recent Quizzes
      </h4>
      <div className="flex flex-row flex-wrap">
        {quizzes?.map((quiz) => (
          <RecentQuizCard key={quiz.id} quiz={quiz} sessionId={sessionId} />
        ))}
      </div>
    </>
  );
};
