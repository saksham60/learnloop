import { apiRequest } from "@/lib/api/client";

import type { ProgressAnswer, ProgressAskPayload, ProgressSummary, WeakTopic } from "./types";

export async function askProgressQuestion(payload: ProgressAskPayload) {
  const response = await apiRequest<ProgressAnswer>("/api/v1/progress/ask", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getProgressSummary() {
  const response = await apiRequest<ProgressSummary>("/api/v1/progress/summary", {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getWeakTopics() {
  const response = await apiRequest<WeakTopic[]>("/api/v1/progress/weak-topics", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
