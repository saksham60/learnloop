import { apiRequest } from "@/lib/api/client";
import { getDemoSchoolsList, isDemoModeEnabled } from "@/lib/demo/demo-auth";

import type { School } from "@/features/schools/types";

export async function listSchools(search?: string) {
  if (isDemoModeEnabled()) {
    return getDemoSchoolsList(search);
  }
  const response = await apiRequest<School[]>("/api/v1/schools", {
    query: search ? { q: search } : undefined,
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function searchSchools(query: string) {
  if (isDemoModeEnabled()) {
    return getDemoSchoolsList(query);
  }
  const response = await apiRequest<School[]>("/api/v1/schools/search", {
    query: { q: query },
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
