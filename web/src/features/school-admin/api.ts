import { apiRequest } from "@/lib/api/client";

import type {
  ApprovalRequest,
  ManagedClass,
  ManagedParent,
  ManagedStudent,
  ManagedTeacher,
  SchoolAdminOverview,
  SchoolAdminRelations,
} from "@/features/school-admin/types";

export async function getSchoolAdminOverview() {
  const response = await apiRequest<SchoolAdminOverview>("/api/v1/school-admin/overview", {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolAdminApprovals(status?: string) {
  const response = await apiRequest<ApprovalRequest[]>("/api/v1/school-admin/approvals", {
    query: status ? { status } : undefined,
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function approveSchoolRequest(requestId: string, role: "teacher" | "parent") {
  const response = await apiRequest(`/api/v1/school-admin/approvals/${requestId}/approve`, {
    method: "POST",
    body: { role },
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function rejectSchoolRequest(requestId: string, reason?: string) {
  const response = await apiRequest(`/api/v1/school-admin/approvals/${requestId}/reject`, {
    method: "POST",
    body: { reason },
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolStudents() {
  const response = await apiRequest<ManagedStudent[]>("/api/v1/school-admin/students", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolTeachers() {
  const response = await apiRequest<ManagedTeacher[]>("/api/v1/school-admin/teachers", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolParents() {
  const response = await apiRequest<ManagedParent[]>("/api/v1/school-admin/parents", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolClasses() {
  const response = await apiRequest<ManagedClass[]>("/api/v1/school-admin/classes", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function createSchoolClass(payload: {
  name: string;
  code: string;
  grade_level?: string | null;
  teacher_id?: string | null;
  subject_id?: string | null;
}) {
  const response = await apiRequest("/api/v1/school-admin/classes", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolRelations() {
  const response = await apiRequest<SchoolAdminRelations>("/api/v1/school-admin/relations", {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function assignTeacherStudents(payload: {
  teacher_id: string;
  student_ids: string[];
  class_id?: string | null;
  subject_id?: string | null;
}) {
  const response = await apiRequest("/api/v1/school-admin/relations/teacher-students", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function removeTeacherStudents(payload: {
  teacher_id: string;
  student_ids: string[];
}) {
  const response = await apiRequest("/api/v1/school-admin/relations/teacher-students", {
    method: "DELETE",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function assignParentStudents(payload: {
  parent_id: string;
  student_ids: string[];
  relationship?: string | null;
}) {
  const response = await apiRequest("/api/v1/school-admin/relations/parent-students", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function removeParentStudents(payload: {
  parent_id: string;
  student_ids: string[];
}) {
  const response = await apiRequest("/api/v1/school-admin/relations/parent-students", {
    method: "DELETE",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}
