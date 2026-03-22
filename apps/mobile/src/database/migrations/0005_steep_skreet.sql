CREATE TABLE `collaboration_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`granter_id` text NOT NULL,
	`grantee_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
