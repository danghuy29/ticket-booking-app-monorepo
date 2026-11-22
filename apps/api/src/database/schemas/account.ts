import { sql } from "drizzle-orm";
import { check, pgEnum, snakeCase, text, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "@/database/schemas/user";
import { timestamps } from "./timestamp";

export const authProvider = pgEnum("auth_provider", ["credential", "google", "github"]);

export const accounts = snakeCase.table(
  "accounts",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: authProvider().notNull(),
    // null for credential; the provider's user id (`sub`) for Google/GitHub.
    providerAccountId: text(),
    // Only credential accounts have a password.
    passwordHash: text(),
    ...timestamps,
  },
  (t) => [
    // One Google/GitHub account belongs to one user.
    unique("accounts_provider_provider_account_id_unique").on(t.provider, t.providerAccountId),
    // At most one account of each provider per user. `user_id` first so it also serves as the
    // index for lookups by user and for the cascade from `users`.
    unique("accounts_user_id_provider_unique").on(t.userId, t.provider),
    check(
      "accounts_provider_shape_check",
      sql`(${t.provider} = 'credential' and ${t.providerAccountId} is null and ${t.passwordHash} is not null)
       or (${t.provider} <> 'credential' and ${t.providerAccountId} is not null and ${t.passwordHash} is null)`,
    ),
  ],
);

export type AccountRow = typeof accounts.$inferSelect;
