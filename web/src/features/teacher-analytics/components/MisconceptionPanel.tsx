import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassMisconception } from "@/features/teacher-analytics/types";

export function MisconceptionPanel({ items }: { items: ClassMisconception[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Common misconceptions</CardTitle>
        <CardDescription>Signals that can shape the next revision plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={`${item.class_id}-${item.misconception}`} className="rounded-2xl border border-border bg-background/80 px-4 py-3">
              <p className="font-medium">{item.misconception}</p>
              <p className="mt-1 text-sm text-muted-foreground">Signals seen: {item.signal_count}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No misconceptions are available for this class yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
