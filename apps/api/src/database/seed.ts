import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/config/env";
import { accounts } from "@/database/schemas/account";
import { relations } from "@/database/schemas/relations";
import { users } from "@/database/schemas/user";

// Development-only credentials for the sample user.
const SEED_EMAIL = "huydang@gmail.com";
const SEED_PASSWORD = "password123";

const db = drizzle({
  connection: { url: env.DATABASE_URL, max: 1 },
  relations,
});

await db.transaction(async (tx) => {
  await tx
    .insert(users)
    .values({ name: "huydang", email: SEED_EMAIL, phone: "+84123456789" })
    .onConflictDoNothing();

  const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.email, SEED_EMAIL));
  if (!user) throw new Error(`Seed user ${SEED_EMAIL} was not created`);

  await tx
    .insert(accounts)
    .values({
      userId: user.id,
      provider: "credential",
      passwordHash: await Bun.password.hash(SEED_PASSWORD),
    })
    .onConflictDoNothing();
});

console.log(`Seed completed. Sign in with ${SEED_EMAIL} / ${SEED_PASSWORD}.`);
await db.$client.end();
