"use client";

import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHomeworkList } from "@/features/homework/hooks/useHomework";

export default function TeacherHomeworkPage() {
  const homeworkQuery = useHomeworkList();

  if (homeworkQuery.isLoading) {
    return <LoadingState title="Loading homework" description="Gathering assignments and statuses." />;
  }

  if (homeworkQuery.error) {
    return <ErrorState onRetry={() => void homeworkQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homework"
        title="Assignments"
        description="Review created homework and open the new homework form when you need another set."
        action={
          <Button asChild>
            <Link href="/teacher/homework/new">New homework</Link>
          </Button>
        }
      />

      {homeworkQuery.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {homeworkQuery.data.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>
                      {item.description || "Teacher-created assignment"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.question_count} questions
                  {item.due_at ? ` · due ${new Date(item.due_at).toLocaleString()}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No homework created yet"
          description="Use the new homework form to create the first assignment."
        />
      )}
    </div>
  );
}
