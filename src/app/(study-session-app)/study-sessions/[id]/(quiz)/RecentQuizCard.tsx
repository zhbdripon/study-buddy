"use client";
import React from "react";
import { RecentQuiz } from "./action";
import { useRouter } from "next/navigation";

const RecentQuizCard = ({
  quiz,
  sessionId,
}: {
  quiz: RecentQuiz;
  sessionId: string;
}) => {
  const router = useRouter();
  return (
    <div
      key={quiz.id}
      className="border p-4 m-2 cursor-pointer rounded-md bg-sidebar w-xs"
      onClick={() => {
        if (quiz.isCompleted) {
          router.push(
            `/study-sessions/${sessionId}?tab=quiz&page=results&itemId=${quiz.id}`,
          );
        } else {
          router.push(
            `/study-sessions/${sessionId}?tab=quiz&page=quizTaker&itemId=${quiz.id}`,
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
  );
};

export default RecentQuizCard;
