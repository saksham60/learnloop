import { apiRequest } from "@/lib/api/client";
import { fetchAgentRunSteps } from "@/features/student-companion/api";
import { getDemoProfile, getDemoStudentHomeworkList } from "@/lib/demo/demo-auth";

import type {
  HomeworkAnalytics,
  HomeworkAttemptPayload,
  HomeworkAttemptResult,
  HomeworkCoachInput,
  HomeworkCoachResult,
  HomeworkCreatePayload,
  HomeworkCreateResult,
  HomeworkDetail,
  HomeworkSubmitResult,
  HomeworkSummary,
} from "./types";

export async function listHomework() {
  if (getDemoProfile()) {
    return getDemoStudentHomeworkList();
  }
  const response = await apiRequest<HomeworkSummary[]>("/api/v1/homework");
  return response.data ?? [];
}

export async function getHomework(homeworkId: string) {
  const response = await apiRequest<HomeworkDetail>(`/api/v1/homework/${homeworkId}`);
  return response.data;
}

export async function submitHomeworkAttempt(homeworkId: string, payload: HomeworkAttemptPayload) {
  const response = await apiRequest<HomeworkAttemptResult>(`/api/v1/homework/${homeworkId}/attempt`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function submitHomework(homeworkId: string) {
  const response = await apiRequest<HomeworkSubmitResult>(`/api/v1/homework/${homeworkId}/submit`, {
    method: "POST",
  });
  return response.data;
}

export async function getHomeworkAnalytics(homeworkId: string) {
  const response = await apiRequest<HomeworkAnalytics>(`/api/v1/homework/${homeworkId}/analytics`, {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function createHomework(payload: HomeworkCreatePayload) {
  const response = await apiRequest<HomeworkCreateResult>("/api/v1/homework", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function requestHomeworkCoach(payload: HomeworkCoachInput) {
  const response = await apiRequest<HomeworkCoachResult>("/api/v1/agents/run", {
    method: "POST",
    body: {
      request_type: "homework_help",
      user_message: payload.userMessage,
      metadata: {
        homework_id: payload.homeworkId,
        question_id: payload.questionId,
        student_said_stuck: payload.studentSaidStuck ?? false,
      },
    },
  });
  return response.data;
}

export { fetchAgentRunSteps };
