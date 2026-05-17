import { apiRequest } from "@/lib/api/client";

import type { School } from "@/features/schools/types";

export async function listSchools(search?: string) {
  const response = await apiRequest<School[]>("/api/v1/schools", {
    query: search ? { q: search } : undefined,
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function searchSchools(query: string) {
  const response = await apiRequest<School[]>("/api/v1/schools/search", {
    query: { q: query },
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
