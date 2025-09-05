ALTER TABLE "doc_quiz" ADD COLUMN "is_completed" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" DROP COLUMN "is_completed";