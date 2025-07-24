import {
  boolean,
  pgTable,
  text,
  timestamp,
  integer,
  json,
  pgEnum,
  serial,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

// --- Auth Table end ---

// --- Study session start ---

export const studySession = pgTable("study_session", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  meta: json("meta"),
  embeddingPath: text("embedding_path"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docChat = pgTable("doc_chat", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docChatDocuments = pgTable("doc_chat_documents", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => docChat.id),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docChatMessages = pgTable("doc_chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => docChat.id),
  query: text("query"),
  response: text("response"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docQuiz = pgTable("doc_quiz", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docQuizDocuments = pgTable("doc_quiz_documents", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => docQuiz.id),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const quizAnswerEnum = pgEnum("quiz_answer", ["a", "b", "c", "d"]);

export const docQuizQuestions = pgTable("doc_quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => docQuiz.id),
  question: text("question"),
  optionA: text("option_a"),
  optionB: text("option_b"),
  optionC: text("option_c"),
  optionD: text("option_d"),
  correctAnswer: quizAnswerEnum("correct_answer"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docQuizQuestionResult = pgTable("doc_quiz_question_result", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => docQuizQuestions.id),
  pick: quizAnswerEnum("pick"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docNote = pgTable("doc_note", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  noteContent: text("note_content"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const docNoteDocuments = pgTable("doc_note_documents", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => docNote.id),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// --- Types with readonly id ---

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

export type Documents = ReadonlyId<typeof documents.$inferSelect>;
export type DocumentsInsert = Omit<typeof documents.$inferInsert, "id">;

export type DocChat = ReadonlyId<typeof docChat.$inferSelect>;
export type DocChatInsert = Omit<typeof docChat.$inferInsert, "id">;

export type DocChatDocuments = ReadonlyId<typeof docChatDocuments.$inferSelect>;
export type DocChatDocumentsInsert = Omit<
  typeof docChatDocuments.$inferInsert,
  "id"
>;

export type DocChatMessages = ReadonlyId<typeof docChatMessages.$inferSelect>;
export type DocChatMessagesInsert = Omit<
  typeof docChatMessages.$inferInsert,
  "id"
>;

export type DocQuiz = ReadonlyId<typeof docQuiz.$inferSelect>;
export type DocQuizInsert = Omit<typeof docQuiz.$inferInsert, "id">;

export type DocQuizDocuments = ReadonlyId<typeof docQuizDocuments.$inferSelect>;
export type DocQuizDocumentsInsert = Omit<
  typeof docQuizDocuments.$inferInsert,
  "id"
>;

export type DocQuizQuestions = ReadonlyId<typeof docQuizQuestions.$inferSelect>;
export type DocQuizQuestionsInsert = Omit<
  typeof docQuizQuestions.$inferInsert,
  "id"
>;

export type DocQuizQuestionResult = ReadonlyId<
  typeof docQuizQuestionResult.$inferSelect
>;
export type DocQuizQuestionResultInsert = Omit<
  typeof docQuizQuestionResult.$inferInsert,
  "id"
>;

export type DocNote = ReadonlyId<typeof docNote.$inferSelect>;
export type DocNoteInsert = Omit<typeof docNote.$inferInsert, "id">;

export type DocNoteDocuments = ReadonlyId<typeof docNoteDocuments.$inferSelect>;
export type DocNoteDocumentsInsert = Omit<
  typeof docNoteDocuments.$inferInsert,
  "id"
>;
