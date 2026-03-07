ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "device_type" varchar(20);--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "browser" varchar(60);--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "os" varchar(60);--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "country" varchar(60);--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "city" varchar(60);--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "referer" text;--> statement-breakpoint
ALTER TABLE "kreditor"."loan_applications" ADD COLUMN "language" varchar(20);