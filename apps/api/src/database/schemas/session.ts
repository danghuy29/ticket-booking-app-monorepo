import { index, snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { accounts } from "@/database/schemas/account";
import { users } from "@/database/schemas/user";
import { timestamps } from "./timestamp";

export const sessions = snakeCase.table(
  "sessions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // The login method that created this session; removing it signs these sessions out.
    accountId: uuid()
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    // Absolute expiry: refreshing never extends a session past it.
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    lastUsedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    userAgent: text(),
    ...timestamps,
  },
  (t) => [
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_account_id_idx").on(t.accountId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ],
);

export type SessionRow = typeof sessions.$inferSelect;
