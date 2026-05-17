import { apiRequest } from "@/lib/api/client";
import { isFeatureUnavailableError, isNetworkApiError } from "@/lib/api/errors";

import type {
  StudentDashboardStats,
  StudentEvent,
  StudentFocusSignal,
  StudentSectionResult,
} from "./types";

const dashboardFallback: StudentDashboardStats = {
  pending_homework_count: 0,
  active_focus_count: 0,
  recent_attempts_count: 0,
  source: "fallback",
  fallback_message: "Student dashboard stats are still being connected to the backend.",
};

const eventsFallback: StudentSectionResult<StudentEvent> = {
  items: [],
  source: "fallback",
  fallback_message: "Recent learning events are still being connected to the backend.",
};

const focusFallback: StudentSectionResult<StudentFocusSignal> = {
  items: [],
  source: "fallback",
  fallback_message: "Student focus signals are still being connected to the backend.",
};

const emptyDashboardStats = {
  pending_homework_count: 0,
  active_focus_count: 0,
  recent_attempts_count: 0,
};

export async function fetchStudentDashboardStats(): Promise<StudentDashboardStats> {
  try {
    const response = await apiRequest<Omit<StudentDashboardStats, "source" | "fallback_message">>(
      "/api/v1/students/me/dashboard",
      { treat404AsUnavailable: true },
    );

    return {
      ...(response.data ?? emptyDashboardStats),
      source: "backend",
    };
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return dashboardFallback;
    }
    throw error;
  }
}

export async function fetchStudentEvents(): Promise<StudentSectionResult<StudentEvent>> {
  try {
    const response = await apiRequest<StudentEvent[]>("/api/v1/students/me/events", {
      treat404AsUnavailable: true,
    });

    return {
      items: response.data ?? [],
      source: "backend",
    };
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return eventsFallback;
    }
    throw error;
  }
}

export async function fetchStudentFocusSignals(): Promise<StudentSectionResult<StudentFocusSignal>> {
  try {
    const response = await apiRequest<StudentFocusSignal[]>("/api/v1/students/me/focus", {
      treat404AsUnavailable: true,
    });

    return {
      items: response.data ?? [],
      source: "backend",
    };
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return focusFallback;
    }
    throw error;
  }
}
