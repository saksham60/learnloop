"use client";

import { useState } from "react";
import { ArrowUpRight, LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AgentLoopTimeline } from "@/features/student-companion/components/AgentLoopTimeline";
import { ChatMessage } from "@/features/student-companion/components/ChatMessage";
import { HintCard } from "@/features/student-companion/components/HintCard";
import { ThinkingStepCard } from "@/features/student-companion/components/ThinkingStepCard";
import {
  useAgentRun,
  useAgentRunSteps,
  useLearningAttempt,
  useLearningChat,
  useLearningExplanation,
  useLearningHint,
} from "@/features/student-companion/hooks/useStudentCompanion";
import type {
  CompanionMessage,
  CompanionMode,
  LearningGuidedResponse,
} from "@/features/student-companion/types";

const modeConfig: Record<
  CompanionMode,
  {
    label: string;
    guidance: string;
  }
> = {
  teach_me_slowly: {
    label: "Teach me slowly",
    guidance: "Starts with a guiding question and a gentle next step.",
  },
  give_me_a_hint: {
    label: "Give me a hint",
    guidance: "Requests a small hint without unlocking a full explanation.",
  },
  check_my_answer: {
    label: "Check my answer",
    guidance: "Save your attempt first, then ask LearnLoop what to improve.",
  },
  i_am_stuck: {
    label: "I am stuck",
    guidance: "Signals that you need a stronger explanation after real effort.",
  },
  explain_after_i_try: {
    label: "Explain after I try",
    guidance: "Unlocks explanation when you have made enough meaningful attempts.",
  },
  revision_mode: {
    label: "Revision mode",
    guidance: "Turns the companion into a recall-and-check revision partner.",
  },
};

function makeMessage(role: CompanionMessage["role"], body: string, label?: string): CompanionMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    body,
    label,
    createdAt: new Date().toISOString(),
  };
}

function pickResponseText(result: LearningGuidedResponse | null) {
  if (!result) return null;
  if (result.explanation) return { label: "Guided Response", text: result.explanation };
  if (result.hint) return { label: "Hint", text: result.hint };
  if (result.response) return { label: "Guided Response", text: result.response };
  if (result.status) return { label: "System", text: result.status };
  return null;
}

function pickSuggestedAction(result: LearningGuidedResponse | null) {
  if (!result?.decision) {
    return "Ask one question, share your own attempt, then use a hint only when you genuinely need the next nudge.";
  }

  if (result.decision === "guide") {
    return "Answer the guiding question in your own words before asking for more help.";
  }
  if (result.decision === "hint") {
    return "Use the hint to complete the next small step, then update your attempt.";
  }
  if (result.decision === "explain") {
    return "Read the explanation, then answer the final check question in your own words.";
  }

  return "Keep working from the last guided response and record your next attempt.";
}

export function CompanionChat() {
  const [mode, setMode] = useState<CompanionMode>("teach_me_slowly");
  const [message, setMessage] = useState("");
  const [attemptText, setAttemptText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [latestResponse, setLatestResponse] = useState<LearningGuidedResponse | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CompanionMessage[]>([
    makeMessage(
      "system",
      "Start by asking a question you are working on. LearnLoop will guide your next step before it explains.",
      "Learning mode",
    ),
  ]);

  const chatMutation = useLearningChat();
  const hintMutation = useLearningHint();
  const explanationMutation = useLearningExplanation();
  const attemptMutation = useLearningAttempt();
  const agentRunMutation = useAgentRun();
  const stepsQuery = useAgentRunSteps(runId);

  const explanationUnlocked = attemptsCount >= 2 || mode === "i_am_stuck";
  const responsePreview = pickResponseText(latestResponse);

  function getOrCreateSessionId() {
    if (sessionId) {
      return sessionId;
    }

    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      const nextSessionId = crypto.randomUUID();
      setSessionId(nextSessionId);
      return nextSessionId;
    }

    return null;
  }

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) return;

    const currentHints = hintsUsed;
    const currentAttempts = attemptsCount;
    const activeSessionId = getOrCreateSessionId();
    setMessages((current) => [...current, makeMessage("student", trimmed)]);
    setMessage("");

    try {
      const payload = {
        session_id: activeSessionId,
        message: trimmed,
        attempts_count: currentAttempts,
        hints_used: currentHints,
        student_said_stuck: mode === "i_am_stuck",
        explain_requested: mode === "explain_after_i_try" || mode === "i_am_stuck",
      };

      let result: LearningGuidedResponse | null = null;
      if (mode === "give_me_a_hint") {
        result = await hintMutation.mutateAsync(payload);
        setHintsUsed((value) => value + 1);
      } else if (mode === "i_am_stuck" || mode === "explain_after_i_try") {
        result = await explanationMutation.mutateAsync(payload);
      } else {
        result = await chatMutation.mutateAsync(payload);
      }

      setLatestResponse(result);
      const nextMessage = pickResponseText(result);
      if (nextMessage) {
        setMessages((current) => [...current, makeMessage("ai", nextMessage.text, nextMessage.label)]);
      }

      if (result?.agent_run_id) {
        setRunId(result.agent_run_id);
      } else if (result?.source !== "fallback") {
        try {
          const agentResult = await agentRunMutation.mutateAsync({
            session_id: activeSessionId,
            request_type: "socratic_help",
            user_message: trimmed,
            metadata: {
              mode,
              attempts_count: currentAttempts,
              hints_used: currentHints,
            },
          });
          setRunId(agentResult?.run_id ?? null);
        } catch {
          setRunId(null);
        }
      } else {
        setRunId(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "LearnLoop could not answer right now.");
    }
  }

  async function handleAttemptSubmit() {
    const trimmed = attemptText.trim();
    if (!trimmed) return;
    const activeSessionId = getOrCreateSessionId();

    try {
      const result = await attemptMutation.mutateAsync({
        session_id: activeSessionId,
        answer: trimmed,
      });
      setAttemptText("");
      setAttemptsCount((value) => value + 1);
      setMessages((current) => [
        ...current,
        makeMessage(
          "system",
          result?.status ||
            "Attempt saved. You can now ask for a hint, choose Explain after I try, or keep refining your answer.",
          "Attempt logged",
        ),
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save that attempt.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student companion"
        title="A guided learning conversation"
        description="This space is designed to nudge a student forward with guided responses, not immediate answer dumping."
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(modeConfig) as [CompanionMode, { label: string; guidance: string }][]
              ).map(([value, item]) => (
                <Button
                  key={value}
                  type="button"
                  variant={mode === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode(value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <CardTitle className="text-lg">{modeConfig[mode].label}</CardTitle>
            <CardDescription>{modeConfig[mode].guidance}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3 rounded-[1.75rem] bg-background/80 p-4">
              {messages.map((entry) => (
                <ChatMessage key={entry.id} message={entry} />
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-end">
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask a question, describe where you are stuck, or request a guided next step."
                className="min-h-[112px]"
              />
              <Button
                type="button"
                size="lg"
                onClick={handleSend}
                disabled={chatMutation.isPending || hintMutation.isPending || explanationMutation.isPending}
              >
                Try this
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Attempt-first</Badge>
                <p className="text-sm text-muted-foreground">
                  Instead of asking for the final answer, write your own attempt here first.
                </p>
              </div>
              <Textarea
                value={attemptText}
                onChange={(event) => setAttemptText(event.target.value)}
                placeholder="Write your attempt, reasoning, or working here."
                className="min-h-[120px]"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={handleAttemptSubmit} disabled={attemptMutation.isPending}>
                  Try this
                </Button>
                <Button type="button" variant="outline" onClick={() => setMode("give_me_a_hint")}>
                  Give me a hint
                </Button>
                <Button type="button" variant="outline" onClick={() => setMode("explain_after_i_try")}>
                  Explain after I try
                </Button>
                <Button type="button" variant="ghost" onClick={() => setMode("i_am_stuck")}>
                  I am stuck
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <AgentLoopTimeline steps={stepsQuery.data} />

          <ThinkingStepCard
            title="Suggested next action"
            description={pickSuggestedAction(latestResponse)}
          />

          {responsePreview ? (
            <HintCard
              title={responsePreview.label}
              description={responsePreview.text}
            />
          ) : null}

          {latestResponse?.fallback_notice ? (
            <Card className="border-amber-200 bg-amber-50/70">
              <CardHeader>
                <CardTitle className="text-base text-amber-950">Backend fallback</CardTitle>
                <CardDescription className="text-amber-900/80">
                  {latestResponse.fallback_notice}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Explanation status</CardTitle>
                  <CardDescription>
                    Explanation unlocks after two meaningful attempts or if the student says they are stuck.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                {explanationUnlocked
                  ? "Explanation is currently unlocked."
                  : "Explanation is still locked. Keep trying or ask for a hint first."}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Attempts logged: {attemptsCount} | Hints used: {hintsUsed}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
