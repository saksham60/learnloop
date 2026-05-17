"use client";

import { useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { AgentLoopTimeline } from "@/features/student-companion/components/AgentLoopTimeline";
import { AttemptHistory } from "@/features/homework/components/AttemptHistory";
import { HintLadder } from "@/features/homework/components/HintLadder";
import {
  useHomeworkAttempt,
  useHomeworkCoach,
  useHomeworkCoachSteps,
  useHomeworkSubmit,
} from "@/features/homework/hooks/useHomework";
import type { HomeworkDetail } from "@/features/homework/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function HomeworkAttemptPanel({ homework }: { homework: HomeworkDetail }) {
  const defaultQuestion = homework.questions[0];
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    defaultQuestion?.id ?? null,
  );
  const [answerText, setAnswerText] = useState("");
  const [coachPrompt, setCoachPrompt] = useState("");
  const [coachResponse, setCoachResponse] = useState<string | null>(null);
  const [coachRunId, setCoachRunId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attemptHistory, setAttemptHistory] = useState<
    { id: string; attemptNumber: number; answerText: string; status: string }[]
  >([]);

  const selectedQuestion = useMemo(
    () =>
      homework.questions.find((question) => question.id === selectedQuestionId) ?? defaultQuestion,
    [defaultQuestion, homework.questions, selectedQuestionId],
  );

  const attemptMutation = useHomeworkAttempt(homework.id);
  const submitMutation = useHomeworkSubmit(homework.id);
  const coachMutation = useHomeworkCoach();
  const coachStepsQuery = useHomeworkCoachSteps(coachRunId);

  const explanationUnlocked = attemptHistory.length >= 2;

  async function handleSaveAttempt() {
    if (!answerText.trim()) return;

    try {
      const result = await attemptMutation.mutateAsync({
        question_id: selectedQuestion?.id ?? null,
        answer_text: answerText.trim(),
        hints_used: hintsUsed,
      });
      setAttemptHistory((current) => [
        {
          id: result?.attempt_id || `${Date.now()}`,
          attemptNumber: result?.attempt_number || current.length + 1,
          answerText: answerText.trim(),
          status: result?.status || "saved",
        },
        ...current,
      ]);
      setAnswerText("");
      toast.success("Attempt saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save your attempt.");
    }
  }

  async function handleCoach(studentSaidStuck = false) {
    const prompt =
      coachPrompt.trim() ||
      `Question: ${selectedQuestion?.prompt || homework.title}\nStudent attempt: ${
        answerText || "No new attempt provided."
      }`;

    try {
      const result = await coachMutation.mutateAsync({
        homeworkId: homework.id,
        questionId: selectedQuestion?.id,
        userMessage: prompt,
        studentSaidStuck,
      });
      setCoachResponse(result?.response || "LearnLoop returned no coach text.");
      setCoachRunId(result?.run_id || null);
      if (!studentSaidStuck) {
        setHintsUsed((value) => value + 1);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Coach guidance is unavailable right now.",
      );
    }
  }

  async function handleSubmitHomework() {
    try {
      await submitMutation.mutateAsync();
      toast.success("Homework submitted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not submit the homework.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Attempt-first homework</Badge>
              <Badge variant="outline">{homework.status}</Badge>
            </div>
            <CardTitle>{homework.title}</CardTitle>
            <CardDescription>
              {homework.description || "Write an attempt before you ask for more help."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {homework.questions.length ? (
              <div className="flex flex-wrap gap-2">
                {homework.questions.map((question, index) => (
                  <Button
                    key={question.id}
                    type="button"
                    size="sm"
                    variant={selectedQuestionId === question.id ? "default" : "outline"}
                    onClick={() => setSelectedQuestionId(question.id)}
                  >
                    Question {index + 1}
                  </Button>
                ))}
              </div>
            ) : null}

            <div className="rounded-[1.75rem] border border-border bg-background/80 p-5">
              <p className="text-sm font-semibold text-primary">Current question</p>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7">
                {selectedQuestion?.prompt || "This homework item does not have a stored question yet."}
              </p>
            </div>

            <div className="space-y-3">
              <Textarea
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder="Write your answer, working, or first draft here."
                className="min-h-[140px]"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={handleSaveAttempt}
                  disabled={attemptMutation.isPending}
                >
                  Try this
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCoach(false)}
                  disabled={coachMutation.isPending}
                >
                  Need a hint
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void handleCoach(true)}
                  disabled={coachMutation.isPending}
                >
                  I am stuck
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSubmitHomework}
                  disabled={submitMutation.isPending}
                >
                  Submit final answer
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-white p-4">
              <p className="text-sm font-medium">Coach context</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell LearnLoop what you tried, where you are uncertain, or what kind of hint you
                want.
              </p>
              <Textarea
                value={coachPrompt}
                onChange={(event) => setCoachPrompt(event.target.value)}
                placeholder="Example: I know the denominator should match, but I am not sure what to do next."
                className="mt-3 min-h-[110px]"
              />
            </div>
          </CardContent>
        </Card>

        {coachResponse ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Guided Response</CardTitle>
                  <CardDescription>Coaching based on the current homework policy.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7">{coachResponse}</p>
            </CardContent>
          </Card>
        ) : null}

        <AttemptHistory attempts={attemptHistory} />
      </div>

      <div className="space-y-6">
        <HintLadder
          attemptsCount={attemptHistory.length}
          hintsUsed={hintsUsed}
          explanationUnlocked={explanationUnlocked}
        />

        <AgentLoopTimeline
          steps={coachStepsQuery.data}
          title="Coach trace"
          description="LearnLoop checks policy before it returns a homework hint or explanation."
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Why no answer button?</CardTitle>
                <CardDescription>
                  LearnLoop is intentionally designed to protect attempt-first learning.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The primary path here is attempt, hint, reflect, and then explain if needed. That
            helps the student build understanding instead of skipping straight to the final answer.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
