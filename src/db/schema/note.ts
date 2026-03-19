import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { courses } from "./course";
import { users } from "./user";

export const notes = pgTable("notes", {
  notes_id: uuid("notes_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  notes_url: varchar("notes_url", { length: 500 }),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "set null",
  }),
  course_id: uuid("course_id").references(() => courses.course_id, {
    onDelete: "set null",
  }),
});
