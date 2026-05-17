import { apiRequest } from "@/lib/api/client";
import { getDemoProfile, getDemoStudentGrowthList } from "@/lib/demo/demo-auth";

import type { GrowthActivity, GrowthActivityPayload, GrowthActivityResult } from "./types";

export async function listGrowthActivities() {
  if (getDemoProfile()) {
    return getDemoStudentGrowthList();
  }
  const response = await apiRequest<GrowthActivity[]>("/api/v1/growth/activities", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function createGrowthActivity(payload: GrowthActivityPayload) {
  const response = await apiRequest<GrowthActivityResult>("/api/v1/growth/activity", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function completeGrowthActivity(activityId: string) {
  const response = await apiRequest<GrowthActivityResult>(`/api/v1/growth/activity/${activityId}/complete`, {
    method: "POST",
    treat404AsUnavailable: true,
  });
  return response.data;
}
