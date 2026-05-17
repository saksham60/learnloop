import { apiRequest } from "@/lib/api/client";

import type { FocusArea, FocusRefreshPayload } from "./types";

export async function getTodayFocus() {
  const response = await apiRequest<FocusArea[]>("/api/v1/focus/today", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function refreshFocus(payload: FocusRefreshPayload) {
  const response = await apiRequest<FocusArea[]>("/api/v1/focus/refresh", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
