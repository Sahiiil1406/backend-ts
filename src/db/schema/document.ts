import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { colleges } from "./college";
import { courses } from "./course";

export const documents = pgTable("documents", {
  document_id: uuid("document_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  course_id: uuid("course_id").references(() => courses.course_id, {
    onDelete: "set null",
  }),
  content_type: varchar("content_type", { length: 100 }),
  url: varchar("url", { length: 500 }),
  college_id: uuid("college_id").references(() => colleges.college_id, {
    onDelete: "set null",
  }),
});
