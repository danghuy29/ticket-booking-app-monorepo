import type { ApiErrorBody } from "@ticket/shared";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    const message = body?.message;
    super(Array.isArray(message) ? message.join(", ") : (message ?? `Request failed (${status})`));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get<T>(path: string) {
    return apiFetch<T>(path);
  },
  post<T>(path: string, body: unknown) {
    return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
  },
};
