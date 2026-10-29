import { Global, Inject, Injectable, Module, OnApplicationShutdown } from "@nestjs/common";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schemas";

export const PG_CLIENT = Symbol("PG_CLIENT");
export const DB = Symbol("DB");

export type Database = PostgresJsDatabase<typeof schema>;

/** Shorthand for `@Inject(DB)` — injects the Drizzle database instance. */
export const InjectDb = () => Inject(DB);

export function createDatabase(client: postgres.Sql): Database {
  return drizzle(client, { schema, casing: "snake_case" });
}

@Injectable()
class DatabaseShutdown implements OnApplicationShutdown {
  constructor(@Inject(PG_CLIENT) private readonly client: postgres.Sql) {}

  async onApplicationShutdown() {
    await this.client.end({ timeout: 5 });
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      useFactory: () => postgres(env.DATABASE_URL, { max: 10 }),
    },
    {
      provide: DB,
      inject: [PG_CLIENT],
      useFactory: (client: postgres.Sql) => createDatabase(client),
    },
    DatabaseShutdown,
  ],
  exports: [DB],
})
export class DatabaseModule {}
