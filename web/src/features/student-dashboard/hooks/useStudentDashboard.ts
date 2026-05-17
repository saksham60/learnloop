"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchStudentDashboardStats,
  fetchStudentEvents,
  fetchStudentFocusSignals,
} from "@/features/student-dashboard/api";

export function useStudentDashboardStats() {
  return useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: fetchStudentDashboardStats,
  });
}

export function useStudentEvents() {
  return useQuery({
    queryKey: ["student", "events"],
    queryFn: fetchStudentEvents,
  });
}

export function useStudentFocusSignals() {
  return useQuery({
    queryKey: ["student", "focus-list"],
    queryFn: fetchStudentFocusSignals,
  });
}
