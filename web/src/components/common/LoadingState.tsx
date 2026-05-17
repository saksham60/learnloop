import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({
  title = "Loading LearnLoop AI",
  description = "Preparing your workspace...",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="min-h-[240px]">
      <CardContent className="flex h-full flex-col justify-center gap-4 py-10">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="sr-only">
          {title} {description}
        </div>
      </CardContent>
    </Card>
  );
}

