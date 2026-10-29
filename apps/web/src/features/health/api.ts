import { useQuery } from "@tanstack/react-query";
import type { HealthResponse } from "@ticket/shared";
import { api } from "../../lib/api-client";

export const healthKeys = {
  all: ["health"] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: () => api.get<HealthResponse>("/health"),
    retry: false,
  });
}
