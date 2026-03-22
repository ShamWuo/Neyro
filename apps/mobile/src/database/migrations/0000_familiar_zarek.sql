CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`health_score` integer DEFAULT 0,
	`last_reviewed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `focus_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`focus_area` text,
	`duration_minutes` integer NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`completed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inbox_items` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`is_processed` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '',
	`parent_type` text NOT NULL,
	`parent_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`deadline` text,
	`outcome` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`parent_id` text,
	`is_folder` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduled_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`start_time` text,
	`duration_minutes` integer NOT NULL,
	`focus` text DEFAULT 'General Focus',
	`notes` text,
	`project_ids` text,
	`is_completed` integer DEFAULT false,
	`notification_id` text,
	`type` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`parent_type` text,
	`parent_id` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`is_completed` integer DEFAULT false,
	`due_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer
);
