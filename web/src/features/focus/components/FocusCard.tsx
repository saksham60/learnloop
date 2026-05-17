import { Clock3, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FocusReason } from "@/features/focus/components/FocusReason";
import type { FocusArea } from "@/features/focus/types";

export function FocusCard({ item }: { item: FocusArea }) {
  const estimatedMinutes = item.estimated_minutes ?? Math.max(10, Math.min(35, Math.round(item.score * 2)));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description || "This focus area was surfaced from recent learning signals."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Priority score</span>
            <span className="font-medium">{item.score.toFixed(1)}</span>
          </div>
          <Progress value={Math.min(item.score * 10, 100)} />
        </div>
        <FocusReason reason={item.recommended_action || "Review the latest mistakes and practice one targeted question."} />
        <div className="flex items-center justify-between rounded-2xl bg-background/80 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="h-4 w-4 text-primary" />
            <span>{estimatedMinutes} min</span>
          </div>
          <Button size="sm">
            <Play className="h-4 w-4" />
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
