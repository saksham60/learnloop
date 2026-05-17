import { apiRequest } from "@/lib/api/client";
import {
  approveDemoApproval,
  assignDemoParentRelation,
  assignDemoTeacherRelation,
  createDemoSchoolClass,
  getDemoSchoolAdminData,
  rejectDemoApproval,
  removeDemoParentRelation,
  removeDemoTeacherRelation,
} from "@/lib/demo/demo-auth";

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
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.overview;

  const response = await apiRequest<SchoolAdminOverview>("/api/v1/school-admin/overview", {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolAdminApprovals(status?: string) {
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.approvals;

  const response = await apiRequest<ApprovalRequest[]>("/api/v1/school-admin/approvals", {
    query: status ? { status } : undefined,
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function approveSchoolRequest(requestId: string, role: "teacher" | "parent") {
  if (getDemoSchoolAdminData()) {
    approveDemoApproval(requestId, role);
    return { id: requestId, status: "active" };
  }

  const response = await apiRequest(`/api/v1/school-admin/approvals/${requestId}/approve`, {
    method: "POST",
    body: { role },
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function rejectSchoolRequest(requestId: string, reason?: string) {
  if (getDemoSchoolAdminData()) {
    rejectDemoApproval(requestId, reason);
    return { id: requestId, status: "rejected" };
  }

  const response = await apiRequest(`/api/v1/school-admin/approvals/${requestId}/reject`, {
    method: "POST",
    body: { reason },
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolStudents() {
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.students;

  const response = await apiRequest<ManagedStudent[]>("/api/v1/school-admin/students", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolTeachers() {
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.teachers;

  const response = await apiRequest<ManagedTeacher[]>("/api/v1/school-admin/teachers", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolParents() {
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.parents;

  const response = await apiRequest<ManagedParent[]>("/api/v1/school-admin/parents", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getSchoolClasses() {
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.classes;

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
  if (getDemoSchoolAdminData()) {
    return createDemoSchoolClass(payload);
  }

  const response = await apiRequest("/api/v1/school-admin/classes", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getSchoolRelations() {
  const demo = getDemoSchoolAdminData();
  if (demo) return demo.relations;

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
  if (getDemoSchoolAdminData()) {
    assignDemoTeacherRelation(payload);
    return { status: "assigned" };
  }

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
  if (getDemoSchoolAdminData()) {
    removeDemoTeacherRelation(payload);
    return { status: "removed" };
  }

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
  if (getDemoSchoolAdminData()) {
    assignDemoParentRelation(payload);
    return { status: "assigned" };
  }

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
  if (getDemoSchoolAdminData()) {
    removeDemoParentRelation(payload);
    return { status: "removed" };
  }

  const response = await apiRequest("/api/v1/school-admin/relations/parent-students", {
    method: "DELETE",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}
