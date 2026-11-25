import { z } from "zod";
import type { UserDto } from "./user";

// Normalise before validating: `pipe` runs the email check on the trimmed, lowercased string.
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z.object({
  password: z.string().min(8).max(128),
  email: emailSchema,
  name: z.string().trim().min(1).max(100),
  phone: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  // No length rule: the minimum only applies when choosing a password. The max bounds hashing cost.
  password: z.string().min(1).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResponseDto {
  accessToken: string;
  /** Access token lifetime in seconds (e.g. 900). */
  expiresIn: number;
  user: UserDto;
}
