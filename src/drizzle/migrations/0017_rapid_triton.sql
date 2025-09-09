CREATE TABLE "doc_flashcards" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doc_flashcard_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"flash_card_id" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doc_flashcards" ADD CONSTRAINT "doc_flashcards_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_flashcard_questions" ADD CONSTRAINT "doc_flashcard_questions_flash_card_id_doc_flashcards_id_fk" FOREIGN KEY ("flash_card_id") REFERENCES "public"."doc_flashcards"("id") ON DELETE cascade ON UPDATE no action;