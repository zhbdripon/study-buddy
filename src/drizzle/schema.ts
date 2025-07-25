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

const timestampFields = {
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
};

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  ...timestampFields,
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestampFields,
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
  ...timestampFields,
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestampFields,
});

// --- Auth Table end ---

// --- Study session start ---

export const studySession = pgTable("study_session", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  ...timestampFields,
});

export const document = pgTable("documents", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  meta: json("meta"),
  embeddingPath: text("embedding_path"),
  ...timestampFields,
});

export const docChat = pgTable("doc_chat", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  ...timestampFields,
});

export const docChatDocument = pgTable("doc_chat_documents", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => docChat.id),
  documentId: integer("document_id").references(() => document.id),
  ...timestampFields,
});

export const docChatMessage = pgTable("doc_chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => docChat.id),
  query: text("query"),
  response: text("response"),
  ...timestampFields,
});

export const docQuiz = pgTable("doc_quiz", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  ...timestampFields,
});

export const docQuizDocument = pgTable("doc_quiz_documents", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => docQuiz.id),
  documentId: integer("document_id").references(() => document.id),
  ...timestampFields,
});

export const quizAnswerEnum = pgEnum("quiz_answer", ["a", "b", "c", "d"]);

export const docQuizQuestion = pgTable("doc_quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => docQuiz.id),
  question: text("question"),
  optionA: text("option_a"),
  optionB: text("option_b"),
  optionC: text("option_c"),
  optionD: text("option_d"),
  correctAnswer: quizAnswerEnum("correct_answer"),
  ...timestampFields,
});

export const docQuizQuestionResult = pgTable("doc_quiz_question_result", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => docQuizQuestion.id),
  pick: quizAnswerEnum("pick"),
  ...timestampFields,
});

export const docNote = pgTable("doc_note", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySession.id),
  noteContent: text("note_content"),
  ...timestampFields,
});

export const docNoteDocument = pgTable("doc_note_documents", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => docNote.id),
  documentId: integer("document_id").references(() => document.id),
  ...timestampFields,
});

export const documentSummary = pgTable("doc_summary", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => document.id),
  summary: text("summary"),
  entire_doc_summary: boolean("entire_doc_summary").notNull(),
  page_start: integer("page_start"),
  page_end: integer("page_end"),
  chapter: text("chapter"),
  section: text("section"),
  ...timestampFields,
});
