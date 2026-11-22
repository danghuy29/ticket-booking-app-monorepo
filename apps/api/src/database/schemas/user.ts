import { sql } from "drizzle-orm";
import { check, pgEnum, snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamp";

export const userRole = pgEnum("user_role", ["customer", "admin"]);

export const users = snakeCase.table(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    // Login identifier. Stored lowercase (normalised by the shared zod schema; enforced below).
    email: text().notNull().unique(),
    emailVerifiedAt: timestamp({ withTimezone: true }),
    // Nullable: users signing up with Google/GitHub have no phone number.
    phone: text().unique(),
    role: userRole().notNull().default("customer"),
    disabledAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [check("users_email_lowercase_check", sql`${t.email} = lower(${t.email})`)],
);

export type UserRow = typeof users.$inferSelect;
