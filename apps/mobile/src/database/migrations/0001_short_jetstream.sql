CREATE TABLE `classification_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`original_content` text NOT NULL,
	`ai_suggestion` text NOT NULL,
	`user_action` text DEFAULT 'accepted' NOT NULL,
	`correction_type` text,
	`final_destination` text,
	`final_target_id` text,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`pattern` text NOT NULL,
	`action` text NOT NULL,
	`confidence` integer DEFAULT 1,
	`is_enabled` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `areas` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `focus_sessions` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `inbox_items` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `inbox_items` ADD `ai_context` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `resources` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `scheduled_sessions` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `user_id` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `user_id` text;