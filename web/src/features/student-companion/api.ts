import { apiRequest } from "@/lib/api/client";
import { isFeatureUnavailableError, isNetworkApiError } from "@/lib/api/errors";

import type {
  AgentRunRequest,
  AgentRunResult,
  AgentStep,
  LearningAttemptPayload,
  LearningChatPayload,
  LearningGuidedResponse,
} from "./types";

const fallbackNotice = "This feature is being connected to the backend.";

async function runSocraticAgentFallback(
  payload: LearningChatPayload,
  fallbackResponse: string,
): Promise<LearningGuidedResponse | null> {
  try {
    const response = await apiRequest<AgentRunResult>("/api/v1/agents/run", {
      method: "POST",
      body: {
        session_id: payload.session_id,
        request_type: "socratic_help",
        user_message: payload.message,
        metadata: {
          attempts_count: payload.attempts_count,
          hints_used: payload.hints_used,
          student_said_stuck: payload.student_said_stuck,
          explain_requested: payload.explain_requested,
        },
      },
      treat404AsUnavailable: true,
    });

    return {
      response: response.data?.response || fallbackResponse,
      decision: "guide",
      source: "fallback",
      fallback_notice: fallbackNotice,
      agent_run_id: response.data?.run_id ?? null,
    };
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return null;
    }
    throw error;
  }
}

async function callLearningEndpoint(
  path: string,
  payload: LearningChatPayload,
  syntheticFallback: LearningGuidedResponse,
) {
  try {
    const response = await apiRequest<LearningGuidedResponse>(path, {
      method: "POST",
      body: payload,
      treat404AsUnavailable: true,
    });
    return {
      ...(response.data ?? {}),
      source: "backend" as const,
    };
  } catch (error) {
    if (isFeatureUnavailableError(error)) {
      const agentFallback = await runSocraticAgentFallback(
        payload,
        syntheticFallback.response || syntheticFallback.hint || syntheticFallback.explanation || "",
      );
      return (
        agentFallback || {
          ...syntheticFallback,
          source: "fallback" as const,
          fallback_notice: fallbackNotice,
        }
      );
    }
    if (isNetworkApiError(error)) {
      return {
        ...syntheticFallback,
        source: "fallback" as const,
        fallback_notice: "LearnLoop could not reach the backend right now. You can keep writing your attempt while it reconnects.",
      };
    }
    throw error;
  }
}

export async function sendLearningChat(payload: LearningChatPayload) {
  return callLearningEndpoint("/api/v1/learning/chat", payload, {
    response:
      "Guided learning chat is still being connected. Start with your own attempt, then come back for the next hint or explanation step.",
    decision: "guide",
  });
}

export async function requestLearningHint(payload: LearningChatPayload) {
  return callLearningEndpoint("/api/v1/learning/hint", payload, {
    hint: "The hint endpoint is still being connected. Write the first step you think is correct, then refine it from there.",
    decision: "hint",
  });
}

export async function requestExplanationAfterEffort(payload: LearningChatPayload) {
  return callLearningEndpoint("/api/v1/learning/explain-after-effort", payload, {
    explanation:
      "Explanation mode is still being connected. Capture one more meaningful attempt, then retry when the backend is ready.",
    decision: "explain",
  });
}

export async function submitLearningAttempt(payload: LearningAttemptPayload) {
  try {
    const response = await apiRequest<LearningGuidedResponse>("/api/v1/learning/attempt", {
      method: "POST",
      body: payload,
      treat404AsUnavailable: true,
    });
    return {
      ...(response.data ?? {}),
      source: "backend" as const,
    };
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return {
        status: "Attempt stored in this session while the backend connection is being finished.",
        source: "fallback" as const,
        fallback_notice: fallbackNotice,
      };
    }
    throw error;
  }
}

export async function runAgent(payload: AgentRunRequest) {
  const response = await apiRequest<AgentRunResult>("/api/v1/agents/run", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function fetchAgentRunSteps(runId: string) {
  try {
    const response = await apiRequest<AgentStep[]>(`/api/v1/agents/runs/${runId}/steps`, {
      treat404AsUnavailable: true,
    });
    return response.data ?? [];
  } catch (error) {
    if (isFeatureUnavailableError(error) || isNetworkApiError(error)) {
      return [];
    }
    throw error;
  }
}
