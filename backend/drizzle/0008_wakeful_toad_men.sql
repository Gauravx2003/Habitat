CREATE TABLE "mess_issue_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_url" text NOT NULL,
	"public_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "mess_issue_attachments" ADD CONSTRAINT "mess_issue_attachments_issue_id_mess_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."mess_issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mess_issue_attachments" ADD CONSTRAINT "mess_issue_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;