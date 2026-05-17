"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAskProgressQuestion } from "@/features/progress/hooks/useProgress";
import { isFeatureUnavailableError } from "@/lib/api/errors";

const suggestedQuestions = [
  "What should I study today?",
  "Why is maths my weak area?",
  "Which homework is pending?",
  "Did I improve in science?",
  "Why am I using many hints?",
  "Which sport skill should I practice?",
];

export function AskMyProgress() {
  const [question, setQuestion] = useState(suggestedQuestions[0]);
  const mutation = useAskProgressQuestion();

  async function handleAsk() {
    if (!question.trim()) return;
    try {
      await mutation.mutateAsync({ question: question.trim() });
    } catch (error) {
      if (isFeatureUnavailableError(error)) return;
      toast.error(error instanceof Error ? error.message : "Could not answer that progress question.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask My Progress</CardTitle>
        <CardDescription>
          Ask LearnLoop about your study priorities, weak spots, or improvement trend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuestion(item)}
              className="rounded-full border border-border bg-white px-3 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr,auto]">
          <Input value={question} onChange={(event) => setQuestion(event.target.value)} />
          <Button onClick={handleAsk} disabled={mutation.isPending}>
            Ask
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        {mutation.data?.answer ? (
          <div className="rounded-[1.75rem] border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">Progress answer</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{mutation.data.answer}</p>
          </div>
        ) : null}
        {mutation.error && isFeatureUnavailableError(mutation.error) ? (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-background/80 p-4 text-sm text-muted-foreground">
            This feature is being connected to the backend.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
