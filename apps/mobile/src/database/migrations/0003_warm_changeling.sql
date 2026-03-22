CREATE TABLE `energy_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`prime_time_start` text NOT NULL,
	`prime_time_end` text NOT NULL,
	`low_energy_start` text,
	`low_energy_end` text,
	`work_days` text DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `scheduled_sessions` ADD `energy_level` text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `scheduled_sessions` ADD `is_prime_time` integer DEFAULT false;