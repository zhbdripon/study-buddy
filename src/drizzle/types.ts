import {
  user,
  session,
  account,
  verification,
  studySession,
  document,
  docChat,
  docChatDocument,
  docChatMessage,
  docQuiz,
  docQuizDocument,
  docQuizQuestion,
  docQuizPerformance,
  docNote,
  docNoteDocument,
  documentSummary,
  quizAnswerEnum,
  docFlashCard,
  docFlashCardQuestion,
} from "@/drizzle/schema";

type ReadonlyId<T> = T extends { id: infer U }
  ? Omit<T, "id"> & { readonly id: U }
  : T;

export type User = ReadonlyId<typeof user.$inferSelect>;
export type UserInsert = Omit<typeof user.$inferInsert, "id">;

export type Session = ReadonlyId<typeof session.$inferSelect>;
export type SessionInsert = Omit<typeof session.$inferInsert, "id">;

export type Account = ReadonlyId<typeof account.$inferSelect>;
export type AccountInsert = Omit<typeof account.$inferInsert, "id">;

export type Verification = ReadonlyId<typeof verification.$inferSelect>;
export type VerificationInsert = Omit<typeof verification.$inferInsert, "id">;

export type StudySession = ReadonlyId<typeof studySession.$inferSelect>;
export type StudySessionInsert = Omit<typeof studySession.$inferInsert, "id">;

export type Documents = ReadonlyId<typeof document.$inferSelect>;
export type DocumentsInsert = Omit<typeof document.$inferInsert, "id">;

export type DocChat = ReadonlyId<typeof docChat.$inferSelect>;
export type DocChatInsert = Omit<typeof docChat.$inferInsert, "id">;

export type DocChatDocument = ReadonlyId<typeof docChatDocument.$inferSelect>;
export type DocChatDocumentInsert = Omit<
  typeof docChatDocument.$inferInsert,
  "id"
>;

export type DocChatMessage = ReadonlyId<typeof docChatMessage.$inferSelect>;
export type DocChatMessageInsert = Omit<
  typeof docChatMessage.$inferInsert,
  "id"
>;

export type DocQuiz = ReadonlyId<typeof docQuiz.$inferSelect>;
export type DocQuizInsert = Omit<typeof docQuiz.$inferInsert, "id">;

export type DocQuizDocument = ReadonlyId<typeof docQuizDocument.$inferSelect>;
export type DocQuizDocumentInsert = Omit<
  typeof docQuizDocument.$inferInsert,
  "id"
>;

export type DocQuizOption = (typeof quizAnswerEnum.enumValues)[number];
export type DocQuizQuestion = ReadonlyId<typeof docQuizQuestion.$inferSelect>;
export type DocQuizQuestionInsert = Omit<
  typeof docQuizQuestion.$inferInsert,
  "id"
>;

export type docQuizPerformance = ReadonlyId<
  typeof docQuizPerformance.$inferSelect
>;
export type DocQuizPerformanceInsert = Omit<
  typeof docQuizPerformance.$inferInsert,
  "id"
>;

export type DocNote = ReadonlyId<typeof docNote.$inferSelect>;
export type DocNoteInsert = Omit<typeof docNote.$inferInsert, "id">;

export type DocNoteDocument = ReadonlyId<typeof docNoteDocument.$inferSelect>;
export type DocNoteDocumentInsert = Omit<
  typeof docNoteDocument.$inferInsert,
  "id"
>;

export type DocSummary = ReadonlyId<typeof documentSummary.$inferSelect>;
export type DocSummaryInsert = Omit<typeof documentSummary.$inferInsert, "id">;

export type DocFlashCard = ReadonlyId<typeof docFlashCard.$inferSelect>;
export type DocFlashCardInsert = Omit<typeof docFlashCard.$inferInsert, "id">;

export type DocFlashCardQuestion = ReadonlyId<
  typeof docFlashCardQuestion.$inferSelect
>;
export type DocFlashCardQuestionInsert = Omit<
  typeof docFlashCardQuestion.$inferInsert,
  "id"
>;
