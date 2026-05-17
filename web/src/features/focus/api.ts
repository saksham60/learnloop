import { apiRequest } from "@/lib/api/client";
import { getDemoProfile, getDemoStudentFocus } from "@/lib/demo/demo-auth";

import type { FocusArea, FocusRefreshPayload } from "./types";

export async function getTodayFocus() {
  if (getDemoProfile()) {
    return getDemoStudentFocus();
  }
  const response = await apiRequest<FocusArea[]>("/api/v1/focus/today", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function refreshFocus(payload: FocusRefreshPayload) {
  if (getDemoProfile()) {
    return getDemoStudentFocus();
  }
  const response = await apiRequest<FocusArea[]>("/api/v1/focus/refresh", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
