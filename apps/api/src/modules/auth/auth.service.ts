import { PasswordHasher } from "@nestjs/authentication";
import { ConflictException, Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import type { RegisterInput, UserDto } from "@ticket/shared";
import type { Database } from "@/database/database";
import { uniqueViolationConstraint } from "@/database/errors";
import { accounts } from "@/database/schemas/account";
import { users } from "@/database/schemas/user";
import { toUserDto } from "@/modules/users/users.mapper";

const conflictMessages: Record<string, string> = {
  users_email_unique: "Email already registered",
  users_phone_unique: "Phone number already registered",
};

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle() private readonly db: Database,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register({ name, email, phone, password }: RegisterInput): Promise<UserDto> {
    // Hash before the transaction so scrypt (~100ms) doesn't hold a connection open.
    const passwordHash = await this.passwordHasher.hash(password);

    try {
      const user = await this.db.transaction(async (tx) => {
        const [user] = await tx.insert(users).values({ name, email, phone }).returning();
        if (!user) throw new Error("INSERT ... RETURNING returned no row");
        await tx.insert(accounts).values({ userId: user.id, provider: "credential", passwordHash });
        return user;
      });
      return toUserDto(user);
    } catch (error) {
      // The unique constraints are the source of truth: a SELECT-first check races with
      // concurrent sign-ups, and would miss `phone`.
      const constraint = uniqueViolationConstraint(error);
      const message = constraint ? conflictMessages[constraint] : undefined;
      if (message) throw new ConflictException(message);
      throw error;
    }
  }
}
