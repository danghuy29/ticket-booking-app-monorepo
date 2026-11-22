import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { relations } from "./schemas/relations";

/** Type of the Drizzle database injected with `@InjectDrizzle()` (registered in `app.module.ts`). */
export type Database = PostgresJsDatabase<typeof relations>;
