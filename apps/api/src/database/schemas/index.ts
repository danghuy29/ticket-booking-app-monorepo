// Define tables here (or split into files and re-export them from here).
// Columns are written in camelCase and mapped to snake_case in Postgres
// (see `casing: 'snake_case'` in drizzle.config.ts and database.module.ts).
//
// Example:
//   export const users = pgTable('users', {
//     id: uuid().primaryKey().defaultRandom(),
//     email: text().notNull().unique(),
//     ...timestamps,
//   });
//   export type UserRow = typeof users.$inferSelect;
//
// Then run `bun run db:generate` and `bun run db:migrate`.
export * from "./timestamp";
