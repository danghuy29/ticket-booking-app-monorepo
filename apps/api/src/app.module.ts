import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [DatabaseModule, HealthModule, UsersModule],
})
export class AppModule {}
