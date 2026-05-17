import { apiRequest } from "@/lib/api/client";
import { fetchAgentRunSteps } from "@/features/student-companion/api";
import {
  getDemoProfile,
  getDemoTeacherClassAnalytics,
  getDemoTeacherClassesList,
  getDemoTeacherMisconceptions,
  getDemoTeacherWeakTopics,
} from "@/lib/demo/demo-auth";

import type {
  ClassAnalytics,
  ClassMisconception,
  ClassWeakTopic,
  TeacherClass,
  TeacherInsightResponse,
} from "./types";

export async function listTeacherClasses() {
  if (getDemoProfile()) {
    return getDemoTeacherClassesList();
  }
  const response = await apiRequest<TeacherClass[]>("/api/v1/teachers/me/classes", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getClassAnalytics(classId: string) {
  if (getDemoProfile()) {
    return getDemoTeacherClassAnalytics(classId);
  }
  const response = await apiRequest<ClassAnalytics>(`/api/v1/teachers/classes/${classId}/analytics`, {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getClassWeakTopics(classId: string) {
  if (getDemoProfile()) {
    return getDemoTeacherWeakTopics(classId);
  }
  const response = await apiRequest<ClassWeakTopic[]>(`/api/v1/teachers/classes/${classId}/weak-topics`, {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}

export async function getClassMisconceptions(classId: string) {
  if (getDemoProfile()) {
    return getDemoTeacherMisconceptions(classId);
  }
  const response = await apiRequest<ClassMisconception[]>(
    `/api/v1/teachers/classes/${classId}/misconceptions`,
    {
      treat404AsUnavailable: true,
    },
  );
  return response.data ?? [];
}

export async function requestTeacherInsight(classId: string) {
  const response = await apiRequest<TeacherInsightResponse>("/api/v1/agents/run", {
    method: "POST",
    body: {
      request_type: "teacher_insight",
      user_message: "Summarize the current class risks, weak topics, and misconceptions.",
      metadata: { class_id: classId },
    },
    treat404AsUnavailable: true,
  });
  return response.data;
}

export { fetchAgentRunSteps };
