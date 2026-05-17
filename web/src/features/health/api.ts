import { apiRequest } from "@/lib/api/client";
import { isFeatureUnavailableError, isNetworkApiError } from "@/lib/api/errors";

import type { BackendHealthPayload, BackendHealthState } from "./types";

const unavailableHealthState: BackendHealthState = {
  status: "unavailable",
  service: "learnloop-backend",
  source: "fallback",
  message: "The backend is warming up or temporarily unreachable.",
};

export async function fetchBackendHealth(): Promise<BackendHealthState> {
  try {
    const response = await apiRequest<BackendHealthPayload>("/api/v1/health", {
      auth: false,
      treat404AsUnavailable: true,
      cache: "no-store",
    });

    return {
      ...(response.data ?? {
        status: "unknown",
        service: "learnloop-backend",
      }),
      source: "backend",
      message: response.message,
    };
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return unavailableHealthState;
    }
    throw error;
  }
}
