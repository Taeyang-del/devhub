CREATE TABLE `codeScreenshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`snippetId` int,
	`projectId` int,
	`imageUrl` text,
	`imageKey` text,
	`theme` varchar(50) DEFAULT 'dark',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `codeScreenshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `codeSnippets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`code` text NOT NULL,
	`language` varchar(50) NOT NULL,
	`tags` text,
	`stars` int DEFAULT 0,
	`views` int DEFAULT 0,
	`visibility` enum('public','private') DEFAULT 'public',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `codeSnippets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`actorId` int NOT NULL,
	`type` enum('star','follow','comment') NOT NULL,
	`targetType` enum('project','snippet','profile') NOT NULL,
	`targetId` int,
	`message` text,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectStars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectStars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`readmeContent` text,
	`repositoryUrl` varchar(255),
	`liveUrl` varchar(255),
	`thumbnailUrl` text,
	`thumbnailKey` text,
	`techStack` text,
	`tags` text,
	`stars` int DEFAULT 0,
	`views` int DEFAULT 0,
	`featured` boolean NOT NULL DEFAULT false,
	`visibility` enum('public','private') DEFAULT 'public',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `snippetStars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`snippetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `snippetStars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFollows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userFollows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`avatarUrl` text,
	`avatarKey` text,
	`bio` text,
	`location` varchar(255),
	`website` varchar(255),
	`github` varchar(255),
	`twitter` varchar(255),
	`linkedin` varchar(255),
	`skills` text,
	`followers` int DEFAULT 0,
	`following` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `codeScreenshots` ADD CONSTRAINT `codeScreenshots_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `codeScreenshots` ADD CONSTRAINT `codeScreenshots_snippetId_codeSnippets_id_fk` FOREIGN KEY (`snippetId`) REFERENCES `codeSnippets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `codeScreenshots` ADD CONSTRAINT `codeScreenshots_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `codeSnippets` ADD CONSTRAINT `codeSnippets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectStars` ADD CONSTRAINT `projectStars_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projectStars` ADD CONSTRAINT `projectStars_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `snippetStars` ADD CONSTRAINT `snippetStars_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `snippetStars` ADD CONSTRAINT `snippetStars_snippetId_codeSnippets_id_fk` FOREIGN KEY (`snippetId`) REFERENCES `codeSnippets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFollows` ADD CONSTRAINT `userFollows_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userFollows` ADD CONSTRAINT `userFollows_followingId_users_id_fk` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD CONSTRAINT `userProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;