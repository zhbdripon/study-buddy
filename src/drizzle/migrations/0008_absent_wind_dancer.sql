ALTER TABLE "doc_quiz_question_result" RENAME TO "doc_quiz_performance";--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" RENAME COLUMN "option_a" TO "a";--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" RENAME COLUMN "option_b" TO "b";--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" RENAME COLUMN "option_c" TO "c";--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" RENAME COLUMN "option_d" TO "d";--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" RENAME COLUMN "correct_answer" TO "answer";--> statement-breakpoint
ALTER TABLE "doc_quiz_performance" DROP CONSTRAINT "doc_quiz_question_result_question_id_doc_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_quiz_performance" ADD CONSTRAINT "doc_quiz_performance_question_id_doc_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."doc_quiz_questions"("id") ON DELETE cascade ON UPDATE no action;