import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HintLadder({
  attemptsCount,
  hintsUsed,
  explanationUnlocked,
}: {
  attemptsCount: number;
  hintsUsed: number;
  explanationUnlocked: boolean;
}) {
  const steps = [
    {
      label: "Attempt",
      active: attemptsCount >= 1,
      description: "Write your own attempt before you request help.",
    },
    {
      label: "Hints",
      active: hintsUsed >= 1,
      description: "Use short nudges first. LearnLoop keeps hints limited on purpose.",
    },
    {
      label: "Explain",
      active: explanationUnlocked,
      description: "Full explanation opens after enough effort or when you say you are stuck.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hint ladder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.label}
            className={cn(
              "rounded-2xl border px-4 py-3",
              step.active ? "border-primary/30 bg-primary/5" : "border-border bg-background/80",
            )}
          >
            <div className="flex items-center gap-2">
              <p className="font-medium">{step.label}</p>
              {step.active ? (
                <Badge className="rounded-full bg-primary/10 text-primary">Ready</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
