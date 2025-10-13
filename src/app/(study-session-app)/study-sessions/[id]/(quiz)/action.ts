"use server";
import { DocQuiz, DocQuizOption, DocumentMeta } from "@/drizzle/types";
import { documentTypes } from "@/lib/constants";
import { getDataOrThrow } from "@/lib/error-utils";
import { generateMCQ } from "@/service/mcqGenerator";
import { queryDocuments, queryStudySessionDocumentSummary } from "../../query";
import {
  insertQuizAnswerMutation,
  insertQuizMutation,
  insertQuizQuestionsMutation,
  updateQuizMutation,
} from "./mutation";
import {
  queryQuiz,
  queryQuizQuestion,
  queryQuizQuestions,
  QuizDataQuestion,
} from "./query";

export type QuizData = {
  id: number;
  isCompleted: boolean;
  questions: QuizDataQuestion[];
};

export const getQuizData = async (quizId: number): Promise<QuizData> => {
  const questions = await getDataOrThrow(await queryQuizQuestions(quizId));

  if (questions.length === 0) {
    throw Error("No questions found for the quiz");
  }

  return {
    id: questions[0].quizId,
    isCompleted: questions[0].isCompleted,
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      a: q.a,
      b: q.b,
      c: q.c,
      d: q.d,
      answer: q.answer,
      chosenOption: q.chosenOption ?? undefined,
    })),
  } as QuizData;
};

export async function createNewQuiz(studySessionId: number) {
  const document = getDataOrThrow(await queryDocuments(studySessionId))[0];
  const summary = getDataOrThrow(
    await queryStudySessionDocumentSummary(studySessionId),
  )[0].summary;
  const documentMeta = document?.meta as DocumentMeta;

  if (
    document &&
    summary &&
    (documentMeta.type === documentTypes.webUrl ||
      documentMeta.type === documentTypes.youtube)
  ) {
    const mcq = await generateMCQ(documentMeta, summary, 10);

    const quiz = getDataOrThrow(
      await insertQuizMutation({
        sessionId: studySessionId,
      }),
    );

    const quizPayload = mcq.map((question) => ({
      quizId: quiz.id,
      question: question.question,
      a: question.a,
      b: question.b,
      c: question.c,
      d: question.d,
      answer: question.answer,
    }));

    const questions = getDataOrThrow(
      await insertQuizQuestionsMutation(quizPayload),
    );

    return {
      id: quiz.id,
      isCompleted: false,
      questions: questions.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        question: q.question,
        a: q.a,
        b: q.b,
        c: q.c,
        d: q.d,
        answer: q.answer,
        chosenOption: null,
        isCompleted: false,
      })),
    } as QuizData;
  } else {
    throw new Error("No document or summary found for the session");
  }
}

export async function saveQuizAnswer(
  studySessionId: number,
  questionId: number,
  answer: DocQuizOption,
) {
  const question = getDataOrThrow(
    await queryQuizQuestion(studySessionId, questionId),
  );

  return getDataOrThrow(
    await insertQuizAnswerMutation({
      questionId: question.id,
      chosenOption: answer,
    }),
  );
}

export async function markQuizAsCompleted(quizId: number): Promise<DocQuiz> {
  const quiz = await getDataOrThrow(await queryQuiz(quizId));

  const updatedQuiz = await getDataOrThrow(
    await updateQuizMutation(quiz.id, { isCompleted: true }),
  );

  return updatedQuiz;
}
