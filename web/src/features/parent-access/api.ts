import { apiRequest } from "@/lib/api/client";
import {
  approveDemoChildAccessRequest,
  createDemoChildAccessRequest,
  getDemoProfile,
  getDemoParentChildRequests,
  getDemoSchoolChildRequests,
  rejectDemoChildAccessRequest,
} from "@/lib/demo/demo-auth";

import type { ChildAccessRequest, CreateChildAccessRequestPayload } from "@/features/parent-access/types";

export async function getParentChildRequests() {
  const demoProfile = getDemoProfile();
  if (demoProfile?.role === "parent") {
    return getDemoParentChildRequests();
  }

  const response = await apiRequest<ChildAccessRequest[]>("/api/v1/parent/child-requests", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function createParentChildRequest(payload: CreateChildAccessRequestPayload) {
  const demoProfile = getDemoProfile();
  if (demoProfile?.role === "parent") {
    return createDemoChildAccessRequest(payload);
  }

  const response = await apiRequest<ChildAccessRequest>("/api/v1/parent/child-requests", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolChildRequests() {
  const demoProfile = getDemoProfile();
  if (demoProfile?.role === "school_admin" || demoProfile?.role === "school") {
    return getDemoSchoolChildRequests();
  }

  const response = await apiRequest<ChildAccessRequest[]>("/api/v1/school/child-requests", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function approveSchoolChildRequest(requestId: string, studentId?: string | null) {
  const demoProfile = getDemoProfile();
  if (demoProfile?.role === "school_admin" || demoProfile?.role === "school") {
    return approveDemoChildAccessRequest(requestId, studentId);
  }

  const response = await apiRequest<ChildAccessRequest>(`/api/v1/school/child-requests/${requestId}/approve`, {
    method: "POST",
    body: { student_id: studentId ?? null },
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function rejectSchoolChildRequest(requestId: string, reason?: string | null) {
  const demoProfile = getDemoProfile();
  if (demoProfile?.role === "school_admin" || demoProfile?.role === "school") {
    return rejectDemoChildAccessRequest(requestId, reason);
  }

  const response = await apiRequest<ChildAccessRequest>(`/api/v1/school/child-requests/${requestId}/reject`, {
    method: "POST",
    body: { reason: reason ?? null },
    treat404AsUnavailable: true,
  });
  return response.data;
}
