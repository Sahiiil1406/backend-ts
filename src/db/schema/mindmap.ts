import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { courses } from "./course";
import { users } from "./user";

export const mindmaps = pgTable("mindmaps", {
  mindmap_id: uuid("mindmap_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }),
  course_id: uuid("course_id").references(() => courses.course_id, {
    onDelete: "set null",
  }),
  user_id: uuid("user_id").references(() => users.user_id, {
    onDelete: "set null",
  }),
});
