import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AttemptHistory({
  attempts,
}: {
  attempts: { id: string; attemptNumber: number; answerText: string; status: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attempt history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {attempts.length ? (
          attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="rounded-2xl border border-border bg-background/80 px-4 py-3"
            >
              <p className="text-sm font-medium">Attempt {attempt.attemptNumber}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {attempt.answerText}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Attempts you save in this session will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
