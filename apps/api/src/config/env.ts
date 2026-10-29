import { z } from "zod";

// Bun loads `.env` automatically, so process.env is populated before this runs.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173")
    .transform((value) => value.split(",").map((origin) => origin.trim())),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
