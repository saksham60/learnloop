import { apiRequest } from "@/lib/api/client";
import {
  getDemoProfile,
  getDemoStudentFocus,
  getDemoStudentGrowthList,
  getDemoStudentHomeworkList,
} from "@/lib/demo/demo-auth";

import type { ProgressAnswer, ProgressAskPayload, ProgressSummary, WeakTopic } from "./types";

function buildDemoProgressSummary(): ProgressSummary {
  const homework = getDemoStudentHomeworkList();
  const focus = getDemoStudentFocus();
  const growth = getDemoStudentGrowthList();

  const pendingHomework = homework.filter((item) => item.status !== "submitted").length;
  const completedHomework = homework.filter((item) => item.status === "submitted").length;
  const topicLines =
    focus.map((item) => `- General/${item.title}: score=${Math.max(0, 1 - Math.min(item.score / 10, 1)).toFixed(1)}, attempts=0, hints=0`) ||
    [];

  return {
    summary: [
      `Pending homework: ${pendingHomework}`,
      `Completed homework: ${completedHomework}`,
      "Focus areas:",
      ...(focus.length ? focus.map((item) => item.title) : ["No active focus areas."]),
      "Topic performance:",
      ...(topicLines.length ? topicLines : ["- No topic performance data available."]),
      "Growth recommendations:",
      ...(growth.length
        ? growth.slice(0, 2).map((item) => `Practice ${item.title.toLowerCase()} after study time.`)
        : ["No growth recommendations available."]),
    ].join("\n"),
  };
}

function buildDemoWeakTopics(): WeakTopic[] {
  return getDemoStudentFocus().map((item) => ({
    subject: "General",
    topic: item.title,
    score: Math.max(0, 1 - Math.min(item.score / 10, 1)),
  }));
}

function buildDemoProgressAnswer(question: string): ProgressAnswer {
  const summary = buildDemoProgressSummary().summary;
  const lower = question.toLowerCase();
  const focus = getDemoStudentFocus();
  const homework = getDemoStudentHomeworkList();
  const growth = getDemoStudentGrowthList();

  let answer =
    "Your current demo progress summary is ready. Start with your active focus areas and open homework, then use one short growth activity after study time.";

  if (lower.includes("what should i study")) {
    answer =
      homework.length > 0
        ? `Start with ${homework[0].title}. After that, review ${focus[0]?.title || "your top focus area"}.`
        : `Start with ${focus[0]?.title || "your top focus area"} today.`;
  } else if (lower.includes("weak")) {
    answer =
      focus.length > 0
        ? `Your strongest current learning signals point to ${focus[0].title}. That is the best place to improve next.`
        : "No weak topic signals are available in the current demo profile.";
  } else if (lower.includes("homework")) {
    answer =
      homework.length > 0
        ? `You currently have ${homework.length} pending homework item(s). Next up: ${homework[0].title}.`
        : "You do not have any pending homework right now in this demo profile.";
  } else if (lower.includes("sport") || lower.includes("skill") || lower.includes("practice")) {
    answer =
      growth.length > 0
        ? `A good next growth activity is ${growth[0].title}.`
        : "No growth activity is suggested right now in this demo profile.";
  }

  return {
    answer,
    summary_used: summary,
  };
}

export async function askProgressQuestion(payload: ProgressAskPayload) {
  if (getDemoProfile()) {
    return buildDemoProgressAnswer(payload.question);
  }
  const response = await apiRequest<ProgressAnswer>("/api/v1/progress/ask", {
    method: "POST",
    body: payload,
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getProgressSummary() {
  if (getDemoProfile()) {
    return buildDemoProgressSummary();
  }
  const response = await apiRequest<ProgressSummary>("/api/v1/progress/summary", {
    treat404AsUnavailable: true,
  });
  return response.data;
}

export async function getWeakTopics() {
  if (getDemoProfile()) {
    return buildDemoWeakTopics();
  }
  const response = await apiRequest<WeakTopic[]>("/api/v1/progress/weak-topics", {
    treat404AsUnavailable: true,
  });
  return response.data ?? [];
}
