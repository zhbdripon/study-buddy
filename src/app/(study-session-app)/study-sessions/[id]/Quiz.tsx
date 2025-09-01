"use client";

import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/utils";

type Props = { sessionId: string };

const Quiz = ({ sessionId }: Props) => {
  const handleMCQGenerate = async () => {
    const response = await fetchWithAuth(
      `/api/study-sessions/${sessionId}/mcq`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response) {
      console.log(response);
    }
  };
  return (
    <div>
      <Button onClick={handleMCQGenerate}>Generate MCQ</Button>
    </div>
  );
};

export default Quiz;
