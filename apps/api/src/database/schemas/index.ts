// One file per table, re-exported from here. Relations live in `relations.ts`, which imports this
// file, so do NOT re-export `relations.ts` here (it would be a circular import).
// Columns are written in camelCase and mapped to snake_case in Postgres by `snakeCase.table`
// (Drizzle v1 sets casing per table; there is no global `casing` option any more).
//
// Example:
//   export const users = snakeCase.table("users", {
//     id: uuid().primaryKey().defaultRandom(),
//     email: text().notNull().unique(),
//     ...timestamps,
//   });
//   export type UserRow = typeof users.$inferSelect;
//
// Then run `bun run db:generate` and `bun run db:migrate`.

export * from "./account";
export * from "./refresh-token";
export * from "./session";
export * from "./timestamp";
export * from "./user";
