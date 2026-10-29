import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamp";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phone: text().notNull().unique(),
  ...timestamps,
});

export type UserRow = typeof users.$inferSelect;
