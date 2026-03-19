import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { colleges } from "./college";

export const courses = pgTable("course", {
  course_id: uuid("course_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  desc: varchar("desc", { length: 500 }),
  course_code: varchar("course_code", { length: 50 }),
  college_id: uuid("college_id").references(() => colleges.college_id, {
    onDelete: "set null",
  }),
});
