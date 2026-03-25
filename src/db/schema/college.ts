import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const colleges = pgTable("college", {
  college_id: uuid("college_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  address: varchar("address", { length: 255 }),
  category: varchar("category", { length: 100 }),
});
