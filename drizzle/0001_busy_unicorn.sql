CREATE TABLE `listening_rooms` (
	`room_id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`route_from` text NOT NULL,
	`route_to` text NOT NULL,
	`track_cursor` integer DEFAULT 0 NOT NULL,
	`playing` integer DEFAULT false NOT NULL,
	`position_seconds` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
