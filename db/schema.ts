import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const listenerSessions = sqliteTable("listener_sessions", {
  sessionId: text("session_id").primaryKey(),
  lastSeen: integer("last_seen").notNull(),
});

export const listeningRooms = sqliteTable("listening_rooms", {
  roomId: text("room_id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  routeFrom: text("route_from").notNull(),
  routeTo: text("route_to").notNull(),
  trackCursor: integer("track_cursor").notNull().default(0),
  playing: integer("playing", { mode: "boolean" }).notNull().default(false),
  positionSeconds: integer("position_seconds").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});
