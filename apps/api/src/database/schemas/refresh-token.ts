import { type AnyPgColumn, index, snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessions } from "@/database/schemas/session";
import { timestamps } from "./timestamp";

export const refreshTokens = snakeCase.table(
  "refresh_tokens",
  {
    id: uuid().primaryKey().defaultRandom(),
    sessionId: uuid()
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    // SHA-256 of the opaque token; the raw token is never stored.
    tokenHash: text().notNull().unique(),
    // Idle expiry (7 days), capped at sessions.expiresAt.
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    // Set when the token is rotated. Presenting a used token again = reuse → revoke the session.
    usedAt: timestamp({ withTimezone: true }),
    // Unique also gives the index Postgres needs for `set null` when the cleanup job deletes rows.
    replacedById: uuid()
      .unique()
      .references((): AnyPgColumn => refreshTokens.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [
    index("refresh_tokens_session_id_idx").on(t.sessionId),
    index("refresh_tokens_expires_at_idx").on(t.expiresAt),
  ],
);

export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
