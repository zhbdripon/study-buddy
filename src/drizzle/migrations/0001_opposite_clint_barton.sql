CREATE TYPE "public"."quiz_answer" AS ENUM('a', 'b', 'c', 'd');--> statement-breakpoint
CREATE TABLE "doc_chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_chat_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer,
	"document_id" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer,
	"query" text,
	"response" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_note" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"note_content" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_note_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"note_id" integer,
	"document_id" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_quiz" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_quiz_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"document_id" integer,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_quiz_question_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer,
	"pick" "quiz_answer",
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "doc_quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer,
	"question" text,
	"option_a" text,
	"option_b" text,
	"option_c" text,
	"option_d" text,
	"correct_answer" "quiz_answer",
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"meta" json,
	"embedding_path" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "study_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "doc_chat" ADD CONSTRAINT "doc_chat_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_documents" ADD CONSTRAINT "doc_chat_documents_chat_id_doc_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."doc_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_documents" ADD CONSTRAINT "doc_chat_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ADD CONSTRAINT "doc_chat_messages_chat_id_doc_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."doc_chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_note" ADD CONSTRAINT "doc_note_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_note_documents" ADD CONSTRAINT "doc_note_documents_note_id_doc_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."doc_note"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_note_documents" ADD CONSTRAINT "doc_note_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz" ADD CONSTRAINT "doc_quiz_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" ADD CONSTRAINT "doc_quiz_documents_quiz_id_doc_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."doc_quiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" ADD CONSTRAINT "doc_quiz_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_question_result" ADD CONSTRAINT "doc_quiz_question_result_question_id_doc_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."doc_quiz_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" ADD CONSTRAINT "doc_quiz_questions_quiz_id_doc_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."doc_quiz"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_session" ADD CONSTRAINT "study_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;