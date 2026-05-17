import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { GrowthActivity } from "@/features/growth/types";

export function GrowthActivityCard({
  activity,
  onComplete,
}: {
  activity: GrowthActivity;
  onComplete?: (activityId: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{activity.title}</CardTitle>
            <CardDescription className="capitalize">
              {activity.activity_type.replaceAll("_", " ")}
            </CardDescription>
          </div>
          <StatusBadge status={activity.status} />
        </div>
      </CardHeader>
      <CardContent>
        {onComplete ? (
          <Button
            variant={activity.status === "completed" ? "outline" : "default"}
            disabled={activity.status === "completed"}
            onClick={() => onComplete(activity.id)}
          >
            {activity.status === "completed" ? "Completed" : "Mark complete"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
