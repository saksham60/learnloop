import { apiRequest } from "@/lib/api/client";

import type { MasterOverview, MasterSchool, MasterUser, SchoolAdminAssignment } from "@/features/master-admin/types";

export async function getMasterOverview() {
  const response = await apiRequest<MasterOverview>("/api/v1/master/overview", {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getMasterSchools() {
  const response = await apiRequest<MasterSchool[]>("/api/v1/master/schools", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function createMasterSchool(payload: {
  name: string;
  code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  contact_email?: string | null;
  status?: "active" | "inactive";
}) {
  const response = await apiRequest("/api/v1/master/schools", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function updateMasterSchool(
  schoolId: string,
  payload: {
    name?: string | null;
    code?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    contact_email?: string | null;
    status?: "active" | "inactive" | null;
  },
) {
  const response = await apiRequest(`/api/v1/master/schools/${schoolId}`, {
    method: "PATCH",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getMasterUsers() {
  const response = await apiRequest<MasterUser[]>("/api/v1/master/users", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolAdmins() {
  const response = await apiRequest<SchoolAdminAssignment[]>("/api/v1/master/school-admins", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function assignSchoolAdmin(payload: { email: string; school_id: string }) {
  const response = await apiRequest<SchoolAdminAssignment>("/api/v1/master/school-admins/assign", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}
