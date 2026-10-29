import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env";
import * as schema from "./schemas";
import { users } from "./schemas/user";

const db = drizzle({
  connection: { url: env.DATABASE_URL, max: 1 },
  schema,
  casing: "snake_case",
});

await db.transaction(async (tx) => {
  await tx
    .insert(users)
    .values([{ name: "huydang", email: "huydang@gmail.com", phone: "+84123456789" }])
    .onConflictDoNothing();
});

console.log("Seed completed.");
await db.$client.end();
