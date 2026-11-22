import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  // The index re-exports every table; pointing at the folder would read each table twice.
  schema: "./src/database/schemas/index.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: validated at app startup; drizzle-kit runs with Bun which loads .env
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
