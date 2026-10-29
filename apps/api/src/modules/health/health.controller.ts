import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import type { HealthResponse } from "@ticket/shared";
import { sql } from "drizzle-orm";
import type { Database } from "@/database/database";

@Controller("health")
export class HealthController {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.db.execute(sql`select 1`);
      return { status: "ok", database: "up" };
    } catch {
      throw new ServiceUnavailableException({ status: "error", database: "down" });
    }
  }
}
