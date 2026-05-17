"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignSchoolAdmin,
  createMasterSchool,
  getMasterOverview,
  getMasterSchools,
  getMasterUsers,
  getSchoolAdmins,
  updateMasterSchool,
} from "@/features/master-admin/api";

export function useMasterOverview() {
  return useQuery({ queryKey: ["master", "overview"], queryFn: getMasterOverview });
}

export function useMasterSchools() {
  return useQuery({ queryKey: ["master", "schools"], queryFn: getMasterSchools });
}

export function useCreateMasterSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMasterSchool,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["master", "schools"] });
      void queryClient.invalidateQueries({ queryKey: ["master", "overview"] });
    },
  });
}

export function useUpdateMasterSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, payload }: { schoolId: string; payload: Parameters<typeof updateMasterSchool>[1] }) =>
      updateMasterSchool(schoolId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["master", "schools"] });
    },
  });
}

export function useMasterUsers() {
  return useQuery({ queryKey: ["master", "users"], queryFn: getMasterUsers });
}

export function useSchoolAdmins() {
  return useQuery({ queryKey: ["master", "school-admins"], queryFn: getSchoolAdmins });
}

export function useAssignSchoolAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignSchoolAdmin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["master", "school-admins"] });
      void queryClient.invalidateQueries({ queryKey: ["master", "users"] });
    },
  });
}
