import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const sessions = pgTable("session", {
  session_id: uuid("session_id").defaultRandom().primaryKey(),
  desc: varchar("desc", { length: 500 }),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 150 }),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
