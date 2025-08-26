ALTER TABLE "doc_chat" DROP CONSTRAINT "doc_chat_session_id_study_session_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_chat_documents" DROP CONSTRAINT "doc_chat_documents_chat_id_doc_chat_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_chat_documents" DROP CONSTRAINT "doc_chat_documents_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_chat_messages" DROP CONSTRAINT "doc_chat_messages_chat_id_doc_chat_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_note" DROP CONSTRAINT "doc_note_session_id_study_session_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_note_documents" DROP CONSTRAINT "doc_note_documents_note_id_doc_note_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_note_documents" DROP CONSTRAINT "doc_note_documents_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_quiz" DROP CONSTRAINT "doc_quiz_session_id_study_session_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" DROP CONSTRAINT "doc_quiz_documents_quiz_id_doc_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" DROP CONSTRAINT "doc_quiz_documents_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" DROP CONSTRAINT "doc_quiz_questions_quiz_id_doc_quiz_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_quiz_question_result" DROP CONSTRAINT "doc_quiz_question_result_question_id_doc_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_session_id_study_session_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_summary" DROP CONSTRAINT "doc_summary_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "doc_chat" ADD CONSTRAINT "doc_chat_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_documents" ADD CONSTRAINT "doc_chat_documents_chat_id_doc_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."doc_chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_documents" ADD CONSTRAINT "doc_chat_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_chat_messages" ADD CONSTRAINT "doc_chat_messages_chat_id_doc_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."doc_chat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_note" ADD CONSTRAINT "doc_note_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_note_documents" ADD CONSTRAINT "doc_note_documents_note_id_doc_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."doc_note"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_note_documents" ADD CONSTRAINT "doc_note_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz" ADD CONSTRAINT "doc_quiz_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" ADD CONSTRAINT "doc_quiz_documents_quiz_id_doc_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."doc_quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_documents" ADD CONSTRAINT "doc_quiz_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_questions" ADD CONSTRAINT "doc_quiz_questions_quiz_id_doc_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."doc_quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_quiz_question_result" ADD CONSTRAINT "doc_quiz_question_result_question_id_doc_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."doc_quiz_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_session_id_study_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."study_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_summary" ADD CONSTRAINT "doc_summary_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;