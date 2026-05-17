"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveSchoolRequest,
  assignParentStudents,
  assignTeacherStudents,
  createSchoolClass,
  getSchoolAdminApprovals,
  getSchoolAdminOverview,
  getSchoolClasses,
  getSchoolParents,
  getSchoolRelations,
  getSchoolStudents,
  getSchoolTeachers,
  rejectSchoolRequest,
  removeParentStudents,
  removeTeacherStudents,
} from "@/features/school-admin/api";

export function useSchoolAdminOverview() {
  return useQuery({
    queryKey: ["school-admin", "overview"],
    queryFn: getSchoolAdminOverview,
  });
}

export function useSchoolAdminApprovals(status?: string) {
  return useQuery({
    queryKey: ["school-admin", "approvals", status ?? "all"],
    queryFn: () => getSchoolAdminApprovals(status),
  });
}

export function useApproveSchoolRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, role }: { requestId: string; role: "teacher" | "parent" }) =>
      approveSchoolRequest(requestId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
  });
}

export function useRejectSchoolRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      rejectSchoolRequest(requestId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
  });
}

export function useSchoolStudents() {
  return useQuery({ queryKey: ["school-admin", "students"], queryFn: getSchoolStudents });
}

export function useSchoolTeachers() {
  return useQuery({ queryKey: ["school-admin", "teachers"], queryFn: getSchoolTeachers });
}

export function useSchoolParents() {
  return useQuery({ queryKey: ["school-admin", "parents"], queryFn: getSchoolParents });
}

export function useSchoolClasses() {
  return useQuery({ queryKey: ["school-admin", "classes"], queryFn: getSchoolClasses });
}

export function useCreateSchoolClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSchoolClass,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin", "classes"] });
      void queryClient.invalidateQueries({ queryKey: ["school-admin", "overview"] });
    },
  });
}

export function useSchoolRelations() {
  return useQuery({ queryKey: ["school-admin", "relations"], queryFn: getSchoolRelations });
}

export function useAssignTeacherStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignTeacherStudents,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
  });
}

export function useRemoveTeacherStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTeacherStudents,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
  });
}

export function useAssignParentStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignParentStudents,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
  });
}

export function useRemoveParentStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeParentStudents,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["school-admin"] });
    },
  });
}
