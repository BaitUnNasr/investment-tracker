CREATE TABLE `branches` (
	`id` varchar(36) NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`city` varchar(100),
	`phone` varchar(20),
	`is_active` boolean DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `branches_id` PRIMARY KEY(`id`),
	CONSTRAINT `branches_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `client_fund_units` (
	`id` varchar(36) NOT NULL,
	`transaction_id` varchar(36) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`fund_type` enum('TEF','TGF') NOT NULL,
	`nav_date` date NOT NULL,
	`nav_value` decimal(12,4) NOT NULL,
	`investment_amount` decimal(12,2) NOT NULL,
	`units` decimal(18,6) NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `client_fund_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`client_code` varchar(20) NOT NULL,
	`branch_id` varchar(36) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`address` text,
	`is_active` boolean DEFAULT true,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_client_code_unique` UNIQUE(`client_code`)
);
--> statement-breakpoint
CREATE TABLE `fund_allocation_settings` (
	`id` varchar(36) NOT NULL,
	`fund_type` enum('TEF','TGF','PROPERTY') NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`updated_at` datetime NOT NULL,
	`updated_by` varchar(36),
	CONSTRAINT `fund_allocation_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `fund_allocation_settings_fund_type_unique` UNIQUE(`fund_type`)
);
--> statement-breakpoint
CREATE TABLE `investment_accounts` (
	`id` varchar(36) NOT NULL,
	`account_number` varchar(30) NOT NULL,
	`client_id` varchar(36) NOT NULL,
	`scheme_type` enum('RTD','DSTD','LTD') NOT NULL,
	`weekly_amount` decimal(12,2) NOT NULL,
	`start_date` date NOT NULL,
	`maturity_date` date,
	`status` enum('active','matured','closed') DEFAULT 'active',
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `investment_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `investment_accounts_account_number_unique` UNIQUE(`account_number`)
);
--> statement-breakpoint
CREATE TABLE `investment_transactions` (
	`id` varchar(36) NOT NULL,
	`account_id` varchar(36) NOT NULL,
	`transaction_date` date NOT NULL,
	`trans_id` varchar(20),
	`trans_type` varchar(10),
	`rc_vc_no` varchar(20),
	`amount` decimal(12,2) NOT NULL,
	`direction` enum('credit','debit') NOT NULL,
	`narration` text,
	`installment_number` int,
	`created_at` datetime NOT NULL,
	CONSTRAINT `investment_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nav_data` (
	`id` varchar(36) NOT NULL,
	`fund_type` enum('TEF','TGF') NOT NULL,
	`nav_date` date NOT NULL,
	`nav_value` decimal(12,4) NOT NULL,
	`uploaded_at` datetime NOT NULL,
	`uploaded_by` varchar(36),
	CONSTRAINT `nav_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `client_fund_units` ADD CONSTRAINT `client_fund_units_transaction_id_investment_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `investment_transactions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_fund_units` ADD CONSTRAINT `client_fund_units_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_branch_id_branches_id_fk` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fund_allocation_settings` ADD CONSTRAINT `fund_allocation_settings_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investment_accounts` ADD CONSTRAINT `investment_accounts_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `investment_transactions` ADD CONSTRAINT `investment_transactions_account_id_investment_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `investment_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `nav_data` ADD CONSTRAINT `nav_data_uploaded_by_user_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `cfu_client_idx` ON `client_fund_units` (`client_id`);--> statement-breakpoint
CREATE INDEX `cfu_transaction_idx` ON `client_fund_units` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `clients_branch_idx` ON `clients` (`branch_id`);--> statement-breakpoint
CREATE INDEX `inv_accounts_client_idx` ON `investment_accounts` (`client_id`);--> statement-breakpoint
CREATE INDEX `inv_txn_account_idx` ON `investment_transactions` (`account_id`);--> statement-breakpoint
CREATE INDEX `inv_txn_date_idx` ON `investment_transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `nav_fund_date_idx` ON `nav_data` (`fund_type`,`nav_date`);