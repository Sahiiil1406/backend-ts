import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  address: varchar("address", { length: 255 }),
  phone_no: varchar("phone_no", { length: 20 }),
  father_name: varchar("father_name", { length: 150 }),
  mother_name: varchar("mother_name", { length: 150 }),
  current_class: varchar("current_class", { length: 50 }),
  role: varchar("role", { length: 50 }).notNull().default("student"), // roles: student, teacher, admin
  aadhar_no: varchar("aadhaar_no", { length: 12 }),
  date_of_birth: timestamp("date_of_birth", { withTimezone: true }),
  email_verified: boolean("email_verified").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  last_login_at: timestamp("last_login_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
