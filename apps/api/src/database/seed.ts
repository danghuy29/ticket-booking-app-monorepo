import postgres from 'postgres';
import { env } from '../config/env';
import { createDatabase } from './database.module';

const client = postgres(env.DATABASE_URL, { max: 1 });
const db = createDatabase(client);

await db.transaction(async (_tx) => {
  // Insert sample data here, e.g. `await tx.insert(users).values([...])`.
});

console.log('Seed completed.');
await client.end();
