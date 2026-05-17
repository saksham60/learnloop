"use client";

import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeacherClasses } from "@/features/teacher-analytics/hooks/useTeacherAnalytics";

export default function TeacherClassesPage() {
  const classesQuery = useTeacherClasses();

  if (classesQuery.isLoading) {
    return <LoadingState title="Loading classes" description="Fetching your class list." />;
  }

  if (classesQuery.error) {
    return <ErrorState onRetry={() => void classesQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="Your classes"
        description="Open a class to see weak topics, misconceptions, and a guided teacher summary."
      />

      {classesQuery.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {classesQuery.data.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.grade_level || "Unspecified grade"} {item.subject ? `- ${item.subject}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/teacher/classes/${item.id}`}
                  className="text-sm font-medium text-primary"
                >
                  Open class analytics
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No classes connected yet"
          description="Teacher classes will appear here as soon as the backend mapping is ready."
        />
      )}
    </div>
  );
}
