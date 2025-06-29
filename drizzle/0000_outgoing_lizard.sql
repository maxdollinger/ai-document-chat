CREATE TABLE `assistant` (
	`assistant_id` text PRIMARY KEY NOT NULL,
	`vector_store_id` text NOT NULL,
	`thread_id` text NOT NULL,
	`name` text NOT NULL
);
