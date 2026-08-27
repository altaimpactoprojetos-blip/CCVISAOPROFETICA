CREATE TABLE `cells` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`leader` text NOT NULL,
	`neighborhood` text NOT NULL,
	`city` text NOT NULL,
	`day` text NOT NULL,
	`time` text NOT NULL,
	`age_range` text,
	`audience` text,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section` text NOT NULL,
	`key` text NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_section_key_idx` ON `content_items` (`section`,`key`);--> statement-breakpoint
CREATE TABLE `course_modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`title` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `course_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`course_id` integer NOT NULL,
	`lesson_id` integer NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `progress_user_lesson_idx` ON `course_progress` (`email`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`teacher` text,
	`workload` text,
	`audience` text,
	`start_date` text,
	`modality` text,
	`enrollment_status` text DEFAULT 'closed' NOT NULL,
	`certificate_enabled` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_slug_unique` ON `courses` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`event_date` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	`capacity` integer,
	`registration_status` text DEFAULT 'closed' NOT NULL,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `galleries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gallery_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gallery_id` integer NOT NULL,
	`image_url` text NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`gallery_id`) REFERENCES `galleries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`video_url` text,
	`material_url` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ministries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`leader` text,
	`schedule` text,
	`image_url` text,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`day` text NOT NULL,
	`time` text NOT NULL,
	`location` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'novo' NOT NULL,
	`owner_email` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`display_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_roles_email_unique` ON `user_roles` (`email`);