ALTER TABLE `tasks` ADD `prepared_content` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `preparation_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `tasks` ADD `resource_links` text;