CREATE TABLE `para_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_user_id` text,
	`name` text NOT NULL,
	`description` text,
	`template_data` text NOT NULL,
	`is_public` integer DEFAULT false,
	`downloads_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shared_areas` (
	`id` text PRIMARY KEY NOT NULL,
	`area_id` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`shared_with_user_ids` text NOT NULL,
	`permissions` text DEFAULT 'read_write',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`subscription_tier` text DEFAULT 'free',
	`ai_usage_count` integer DEFAULT 0,
	`ai_limit_reset` integer,
	`created_at` integer NOT NULL,
	`last_seen_at` integer,
	`display_name` text,
	`bio` text,
	`avatar_url` text,
	`is_discoverable` integer DEFAULT true,
	`last_location` text
);
