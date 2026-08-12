import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const listenerSessions = sqliteTable("listener_sessions", {
  sessionId: text("session_id").primaryKey(),
  lastSeen: integer("last_seen").notNull(),
});
