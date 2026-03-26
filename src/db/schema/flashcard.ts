import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const flashcards = pgTable("flashcard", {
  flash_id: uuid("flash_id").defaultRandom().primaryKey(),
  question: varchar("question", { length: 255 }).notNull(),
  answer: text("answer").notNull(),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "set null",
  }),
});
