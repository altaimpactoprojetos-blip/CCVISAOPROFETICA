CREATE TABLE `media_assets` (
	`key` text PRIMARY KEY NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `events` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `galleries` ADD `event_date` text;--> statement-breakpoint
ALTER TABLE `submissions` ADD `event_id` integer REFERENCES events(id);--> statement-breakpoint
ALTER TABLE `submissions` ADD `registrant_email` text;--> statement-breakpoint
CREATE UNIQUE INDEX `submission_event_email_idx` ON `submissions` (`event_id`,`registrant_email`) WHERE event_id IS NOT NULL AND status != 'cancelado';