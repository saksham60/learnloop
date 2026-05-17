import Link from "next/link";
import { ArrowRight, CalendarClock, FileQuestion } from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HomeworkSummary } from "@/features/homework/types";
import { formatDate } from "@/lib/utils";

export function HomeworkCard({ homework }: { homework: HomeworkSummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <CardDescription>
              {homework.description || "Attempt-first guided homework support."}
            </CardDescription>
          </div>
          <StatusBadge status={homework.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileQuestion className="h-4 w-4 text-primary" />
            {homework.question_count} questions
          </div>
        </div>
        <div className="rounded-2xl bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4 text-primary" />
            {homework.due_at ? `Due ${formatDate(homework.due_at)}` : "No due date yet"}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-sm text-muted-foreground">Try first, then ask for a hint.</p>
        <Button asChild>
          <Link href={`/student/homework/${homework.id}`}>
            Open
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
