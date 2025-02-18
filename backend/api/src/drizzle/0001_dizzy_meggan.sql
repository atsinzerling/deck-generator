ALTER TABLE "wordpairs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wordpairs" ALTER COLUMN "last_modified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "decks" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "decks" ALTER COLUMN "last_modified" SET NOT NULL;