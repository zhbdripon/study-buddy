CREATE TYPE "public"."chat_participant" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TABLE "doc_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer,
	"summary" text,
	"entire_doc_summary" boolean NOT NULL,
	"page_start" integer,
	"page_end" integer,
	"chapter" text,
	"section" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doc_chat" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat_documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat_documents" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_note" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_note" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_note_documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_note_documents" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_question_result" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_question_result" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_session" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "study_session" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ADD COLUMN "role" "chat_participant" NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ADD COLUMN "parent_message_id" integer;--> statement-breakpoint
ALTER TABLE "study_session" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_summary" ADD CONSTRAINT "doc_summary_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ADD CONSTRAINT "doc_chat_messages_parent_message_id_doc_chat_messages_id_fk" FOREIGN KEY ("parent_message_id") REFERENCES "public"."doc_chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" DROP COLUMN "query";--> statement-breakpoint
ALTER TABLE "doc_chat_messages" DROP COLUMN "response";