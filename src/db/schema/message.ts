import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "./session";

export const messages = pgTable("messages", {
  message_id: uuid("message_id").defaultRandom().primaryKey(),
  session_id: uuid("session_id").references(() => sessions.session_id, {
    onDelete: "cascade",
  }),
  question: text("question"),
  answer: text("answer"),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
