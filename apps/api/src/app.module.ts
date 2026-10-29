import { Module } from "@nestjs/common";
import { DrizzleModule } from "@nestjs/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "./config/env";
import * as schema from "./database/schemas";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [
    DrizzleModule.forRoot({
      drizzle,
      connection: env.DATABASE_URL,
      schema,
      casing: "snake_case",
    }),
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
