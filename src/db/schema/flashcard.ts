import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

export const flashcards = pgTable("flashcard", {
  flash_id: uuid("flash_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "set null",
  }),
});
