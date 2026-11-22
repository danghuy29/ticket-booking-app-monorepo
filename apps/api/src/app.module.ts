import { Module } from "@nestjs/common";
import { DrizzleModule } from "@nestjs/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/config/env";
import { relations } from "@/database/schemas/relations";
import { HealthModule } from "@/modules/health/health.module";
import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [
    DrizzleModule.forRoot({
      drizzle,
      connection: env.DATABASE_URL,
      relations,
    }),
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
