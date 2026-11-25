import { Module } from "@nestjs/common";
import { DrizzleModule } from "@nestjs/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/config/env";
import { relations } from "@/database/schemas/relations";
import { AccountsModule } from "@/modules/accounts/accounts.module";
import { AuthModule } from "@/modules/auth/auth.module";
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
    AuthModule,
    // Dev-only DB inspection endpoint: there is no auth guard yet, so never expose it in production.
    ...(env.NODE_ENV === "production" ? [] : [AccountsModule]),
  ],
})
export class AppModule {}
