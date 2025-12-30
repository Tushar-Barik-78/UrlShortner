RENAME TABLE `users_table` TO `shortenerTable`;--> statement-breakpoint
ALTER TABLE `shortenerTable` DROP INDEX `users_table_shortCode_unique`;--> statement-breakpoint
ALTER TABLE `shortenerTable` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `shortenerTable` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `shortenerTable` ADD CONSTRAINT `shortenerTable_shortCode_unique` UNIQUE(`shortCode`);