import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schemas",
  out: "./src/database/migrations",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: validated at app startup; drizzle-kit runs with Bun which loads .env
    url: process.env.DATABASE_URL!,
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
});
