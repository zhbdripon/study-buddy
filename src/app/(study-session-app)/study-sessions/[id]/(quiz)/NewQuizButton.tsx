"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNewQuiz } from "./action";

export const NewQuizButton = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      onClick={() => {
        setLoading(true);
        createNewQuiz(parseInt(sessionId))
          .then((data) => {
            router.push(
              `/study-sessions/${sessionId}?tab=quiz&page=quizTaker&itemId=${data.id}`,
            );
          })
          .finally(() => setLoading(false));
      }}
    >
      {loading ? "Generating new quiz" : "Take a new quiz"}
      {loading && <Spinner />}
    </Button>
  );
};
