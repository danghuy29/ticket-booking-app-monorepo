import postgres from "postgres";
import { env } from "../config/env";
import { createDatabase } from "./database.module";
import { users } from "./schemas/user";

const client = postgres(env.DATABASE_URL, { max: 1 });
const db = createDatabase(client);

await db.transaction(async (tx) => {
  await tx
    .insert(users)
    .values([{ name: "huydang", email: "huydang@gmail.com", phone: "+84123456789" }])
    .onConflictDoNothing();
});

console.log("Seed completed.");
await client.end();
