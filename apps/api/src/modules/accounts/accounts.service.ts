import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import type { Database } from "@/database/database";

@Injectable()
export class AccountsService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  findAll() {
    return this.db.query.accounts.findMany({
      columns: { passwordHash: false },
      with: { user: { columns: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
