import { DrizzleQueryError } from "drizzle-orm";
import postgres from "postgres";

const UNIQUE_VIOLATION = "23505";

/** Name of the unique constraint a failed query violated (e.g. `users_email_unique`), if any. */
export function uniqueViolationConstraint(error: unknown): string | undefined {
  if (!(error instanceof DrizzleQueryError)) return undefined;
  const cause = error.cause;
  if (!(cause instanceof postgres.PostgresError) || cause.code !== UNIQUE_VIOLATION) {
    return undefined;
  }
  return cause.constraint_name;
}
