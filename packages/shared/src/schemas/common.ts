import { z } from "zod";

export const uuidParamSchema = z.uuid();

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** Error body produced by NestJS exceptions. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface HealthResponse {
  status: "ok" | "error";
  database: "up" | "down";
}
