CREATE TABLE `users_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`url` varchar(255) NOT NULL,
	`shortCode` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_table_shortCode_unique` UNIQUE(`shortCode`)
);
