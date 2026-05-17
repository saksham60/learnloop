"use client";

import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSchoolClass, useSchoolClasses } from "@/features/school-admin/hooks/useSchoolAdmin";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function ClassManagement() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const classesQuery = useSchoolClasses();
  const createMutation = useCreateSchoolClass();

  async function handleCreate() {
    if (!name.trim() || !code.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        grade_level: gradeLevel.trim() || null,
      });
      setName("");
      setCode("");
      setGradeLevel("");
      toast.success("Class created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create class.");
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Create class</CardTitle>
          <CardDescription>Set up a class shell before assigning teachers or students.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class name</Label>
            <Input id="class-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="7A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-code">Class code</Label>
            <Input id="class-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="G7-A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-grade">Grade level</Label>
            <Input id="class-grade" value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value)} placeholder="7" />
          </div>
          <div className="md:col-span-3">
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create class
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing classes</CardTitle>
          <CardDescription>Each class shows current ownership and student coverage.</CardDescription>
        </CardHeader>
        <CardContent>
          {classesQuery.isLoading ? (
            <LoadingState title="Loading classes" description="Preparing class coverage for this school." />
          ) : classesQuery.error ? (
            isFeatureUnavailableError(classesQuery.error) ? (
              <EmptyState
                title="Classes are being connected"
                description="This feature is being connected to the backend."
              />
            ) : (
              <ErrorState
                title="We could not load classes"
                description="Try again. If the issue persists, the backend may still be warming up."
                onRetry={() => void classesQuery.refetch()}
              />
            )
          ) : classesQuery.data?.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {classesQuery.data.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-border bg-background/70 p-4">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Code: {item.code} | Grade {item.grade_level || "N/A"}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Students: {item.student_count}</p>
                    <p>Teachers: {item.teachers_count}</p>
                    <p>Class teacher: {item.teacher_name || "Not assigned"}</p>
                    <p>Subject: {item.subject || "Not assigned"}</p>
                    <p>Pending homework: {item.pending_homework_count}</p>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {item.weak_topics_summary || "Weak topics summary will appear here."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No classes yet"
              description="Create the first class to start teacher and student assignment."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
