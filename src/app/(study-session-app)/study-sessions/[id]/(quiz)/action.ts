"use server";
import {
  db,
  docQuiz,
  docQuizPerformance,
  docQuizQuestion,
  document,
  documentSummary,
  studySession,
  user,
} from "@/drizzle";
import { DocQuizOption } from "@/drizzle/types";
import { auth } from "@/lib/auth";
import { documentType } from "@/lib/constants";
import { MCQGenerator, QuizQuestionFromAI } from "@/service/mcqGenerator";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export type RecentQuiz = {
  id: number;
  sessionId: number;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
};

export async function getRecentQuizzes(
  studySessionId: number,
): Promise<RecentQuiz[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw Error("Session not found");
  }

  try {
    return await db
      .select({
        id: docQuiz.id,
        sessionId: docQuiz.sessionId,
        createdAt: docQuiz.createdAt,
        updatedAt: docQuiz.updatedAt,
        isCompleted: docQuiz.isCompleted,
      })
      .from(docQuiz)
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(eq(studySession.id, studySessionId))
      .orderBy(desc(docQuiz.createdAt))
      .execute();
  } catch (error) {
    console.log(error);
    return Promise.reject("Failed to fetch quizzes");
  }
}

export type QuizDataQuestion = {
  id: number;
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  answer: string;
  chosenOption?: DocQuizOption;
};

export type QuizData = {
  id: number;
  isCompleted: boolean;
  questions: QuizDataQuestion[];
};

export const getQuizData = async (sessionId: number, quizId: number) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw Error("Session not found");
  }

  try {
    const questions = await db
      .select({
        id: docQuizQuestion.id,
        quizId: docQuizQuestion.quizId,
        question: docQuizQuestion.question,
        a: docQuizQuestion.a,
        b: docQuizQuestion.b,
        c: docQuizQuestion.c,
        d: docQuizQuestion.d,
        answer: docQuizQuestion.answer,
        chosenOption: docQuizPerformance.chosenOption,
        isCompleted: docQuiz.isCompleted,
      })
      .from(docQuizQuestion)
      .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
      .leftJoin(
        docQuizPerformance,
        eq(docQuizPerformance.questionId, docQuizQuestion.id),
      )
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(eq(docQuiz.id, quizId))
      .execute();

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
  } catch (error) {
    console.log(error);
    return Promise.reject("Failed to fetch quiz question");
  }
};

export async function createNewQuiz(studySessionId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw Error("User not found");
  }

  try {
    const query = await db
      .select({
        id: document.id,
        summary: documentSummary.summary,
        documentMeta: document.meta,
      })
      .from(studySession)
      .innerJoin(document, eq(studySession.id, document.sessionId))
      .innerJoin(documentSummary, eq(documentSummary.documentId, document.id))
      .execute();

    const documentData = query[0];
    const summary = documentData?.summary;
    const documentMeta = documentData?.documentMeta as {
      type: string;
      url: string;
    };

    if (documentData && summary && documentMeta.type === documentType.webUrl) {
      const mcqGen = new MCQGenerator(summary, documentMeta.url);
      await mcqGen.initialize();
      const mcq: QuizQuestionFromAI[] = await mcqGen.generateMcq(10);

      const quiz = await db
        .insert(docQuiz)
        .values({
          sessionId: studySessionId,
        })
        .returning({ id: docQuiz.id })
        .then((res) => res[0]);

      const questions = await db
        .insert(docQuizQuestion)
        .values(
          mcq.map((question) => ({
            quizId: quiz.id,
            question: question.question,
            a: question.a,
            b: question.b,
            c: question.c,
            d: question.d,
            answer: question.answer,
          })),
        )
        .returning({
          id: docQuizQuestion.id,
          question: docQuizQuestion.question,
          a: docQuizQuestion.a,
          b: docQuizQuestion.b,
          c: docQuizQuestion.c,
          d: docQuizQuestion.d,
          answer: docQuizQuestion.answer,
        });

      return {
        id: quiz.id,
        isCompleted: false,
        questions,
      } as QuizData;
    } else {
      throw new Error("No document or summary found for the session");
    }
  } catch (error) {
    console.log(error);
    return Promise.reject("Failed to create a new quiz");
  }
}

export async function saveQuizAnswer(
  studySessionId: number,
  questionId: number,
  answer: DocQuizOption,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw Error("Session not found");
  }

  try {
    const question = await db
      .select({
        id: docQuizQuestion.id,
        quizId: docQuizQuestion.quizId,
      })
      .from(docQuizQuestion)
      .innerJoin(docQuiz, eq(docQuiz.id, docQuizQuestion.quizId))
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(
        and(
          eq(docQuizQuestion.id, questionId!),
          eq(studySession.id, studySessionId!),
        ),
      )
      .execute()
      .then((res) => res[0]);

    if (!question) {
      throw Error("Question not found");
    }

    await db
      .insert(docQuizPerformance)
      .values({
        questionId: question.id,
        chosenOption: answer,
      })
      .execute();
  } catch (error) {
    console.error("Error inserting quiz performance:", error);
    return Promise.reject("Failed to save quiz answer");
  }
}

export async function markQuizAsCompleted(
  studySessionId: number,
  quizId: number,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw Error("Session not found");
  }

  try {
    const quiz = await db
      .select()
      .from(docQuiz)
      .innerJoin(studySession, eq(studySession.id, docQuiz.sessionId))
      .innerJoin(user, eq(user.id, studySession.userId))
      .where(and(eq(docQuiz.id, quizId), eq(studySession.id, studySessionId)))
      .execute();

    if (quiz.length === 0) {
      throw Error("Quiz not found");
    }

    await db
      .update(docQuiz)
      .set({ isCompleted: true })
      .where(eq(docQuiz.id, quizId));
    return Promise.resolve();
  } catch (error) {
    console.error("Error marking quiz as completed:", error);
    return Promise.reject("Failed to mark quiz as completed");
  }
}
