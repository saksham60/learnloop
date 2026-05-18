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

function buildDemoHomeworkCoachResponse(payload: HomeworkCoachInput): HomeworkCoachResult {
  const normalizedMessage = payload.userMessage.toLowerCase();

  if (payload.homeworkId === "homework-photosynthesis") {
    if (payload.studentSaidStuck) {
      return {
        run_id: null,
        selected_agent: "demo_homework_coach",
        response:
          "Start with the inputs and the output. A plant takes in water and carbon dioxide, then uses sunlight to make glucose and release oxygen. Which part of that process would you like to rewrite in your own words first?",
        observation_count: 0,
      };
    }

    if (normalizedMessage.includes("sunlight")) {
      return {
        run_id: null,
        selected_agent: "demo_homework_coach",
        response:
          "Focus on sunlight as the energy source. It does not become food itself, but it helps the plant convert water and carbon dioxide into glucose. Can you now explain that in one short sentence?",
        observation_count: 0,
      };
    }

    return {
      run_id: null,
      selected_agent: "demo_homework_coach",
      response:
        "Try a simple structure: first list what the plant needs, then state what it makes. What two things go in, and what food-related thing comes out?",
      observation_count: 0,
    };
  }

  return {
    run_id: null,
    selected_agent: "demo_homework_coach",
    response:
      "Start with one clear step you already know, then name the exact part that feels uncertain. I will guide the next step from there.",
    observation_count: 0,
  };
}

function buildDemoHomeworkDetail(homeworkId: string): HomeworkDetail | null {
  const summary = getDemoStudentHomeworkList().find((item) => item.id === homeworkId);
  if (!summary) return null;

  if (homeworkId === "homework-photosynthesis") {
    return {
      id: summary.id,
      title: summary.title,
      description: summary.description,
      status: summary.status,
      due_at: summary.due_at,
      questions: [
        {
          id: "demo-question-photosynthesis-1",
          prompt: "What does a plant need in order to make its own food?",
          order_index: 0,
        },
        {
          id: "demo-question-photosynthesis-2",
          prompt: "Write the process of photosynthesis in your own words using two short sentences.",
          order_index: 1,
        },
        {
          id: "demo-question-photosynthesis-3",
          prompt: "Why is sunlight important in this process?",
          order_index: 2,
        },
      ],
    };
  }

  return {
    id: summary.id,
    title: summary.title,
    description: summary.description,
    status: summary.status,
    due_at: summary.due_at,
    questions: [
      {
        id: `${summary.id}-question-1`,
        prompt: summary.description || `Work through ${summary.title} step by step.`,
        order_index: 0,
      },
    ],
  };
}

export async function listHomework() {
  if (getDemoProfile()) {
    return getDemoStudentHomeworkList();
  }
  const response = await apiRequest<HomeworkSummary[]>("/api/v1/homework");
  return response.data ?? [];
}

export async function getHomework(homeworkId: string) {
  if (getDemoProfile()) {
    return buildDemoHomeworkDetail(homeworkId);
  }
  const response = await apiRequest<HomeworkDetail>(`/api/v1/homework/${homeworkId}`);
  return response.data;
}

export async function submitHomeworkAttempt(homeworkId: string, payload: HomeworkAttemptPayload) {
  if (getDemoProfile()) {
    return {
      attempt_id: `demo-attempt-${Date.now()}`,
      attempt_number: 1,
      status: payload.answer_text.trim() ? "saved" : "draft",
    } satisfies HomeworkAttemptResult;
  }
  const response = await apiRequest<HomeworkAttemptResult>(`/api/v1/homework/${homeworkId}/attempt`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function submitHomework(homeworkId: string) {
  if (getDemoProfile()) {
    return {
      id: homeworkId,
      status: "submitted",
    } satisfies HomeworkSubmitResult;
  }
  const response = await apiRequest<HomeworkSubmitResult>(`/api/v1/homework/${homeworkId}/submit`, {
    method: "POST",
  });
  return response.data;
}

export async function getHomeworkAnalytics(homeworkId: string) {
  if (getDemoProfile()) {
    return {
      class_id: "class-green-7a",
      student_count: 2,
      homework_count: 1,
      summary: `Demo analytics placeholder for ${homeworkId}.`,
    } satisfies HomeworkAnalytics;
  }
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
  if (getDemoProfile()) {
    return buildDemoHomeworkCoachResponse(payload);
  }
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
