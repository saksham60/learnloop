"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAssignParentStudents,
  useAssignTeacherStudents,
  useRemoveParentStudents,
  useRemoveTeacherStudents,
  useSchoolParents,
  useSchoolRelations,
  useSchoolTeachers,
} from "@/features/school-admin/hooks/useSchoolAdmin";
import type { ManagedParent, ManagedTeacher } from "@/features/school-admin/types";
import { isFeatureUnavailableError } from "@/lib/api/errors";

function parseIds(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function RelationsWorkspace() {
  const [teacherId, setTeacherId] = useState("");
  const [teacherStudentIds, setTeacherStudentIds] = useState("");
  const [parentId, setParentId] = useState("");
  const [parentStudentIds, setParentStudentIds] = useState("");
  const [relationship, setRelationship] = useState("guardian");

  const teachersQuery = useSchoolTeachers();
  const parentsQuery = useSchoolParents();
  const relationsQuery = useSchoolRelations();
  const assignTeacherMutation = useAssignTeacherStudents();
  const removeTeacherMutation = useRemoveTeacherStudents();
  const assignParentMutation = useAssignParentStudents();
  const removeParentMutation = useRemoveParentStudents();

  const groupedTeacherRelations = useMemo(() => {
    const items = relationsQuery.data?.teacher_students ?? [];
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      (acc[item.teacher_id] ||= []).push(item);
      return acc;
    }, {});
  }, [relationsQuery.data?.teacher_students]);

  const groupedParentRelations = useMemo(() => {
    const items = relationsQuery.data?.parent_students ?? [];
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      (acc[item.parent_id] ||= []).push(item);
      return acc;
    }, {});
  }, [relationsQuery.data?.parent_students]);

  async function handleAssignTeacherStudents() {
    if (!teacherId || !teacherStudentIds.trim()) return;
    try {
      await assignTeacherMutation.mutateAsync({
        teacher_id: teacherId,
        student_ids: parseIds(teacherStudentIds),
      });
      setTeacherStudentIds("");
      toast.success("Students assigned to teacher.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not assign students.");
    }
  }

  async function handleRemoveTeacherStudents() {
    if (!teacherId || !teacherStudentIds.trim()) return;
    try {
      await removeTeacherMutation.mutateAsync({
        teacher_id: teacherId,
        student_ids: parseIds(teacherStudentIds),
      });
      setTeacherStudentIds("");
      toast.success("Teacher-student links removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove links.");
    }
  }

  async function handleAssignParentStudents() {
    if (!parentId || !parentStudentIds.trim()) return;
    try {
      await assignParentMutation.mutateAsync({
        parent_id: parentId,
        student_ids: parseIds(parentStudentIds),
        relationship,
      });
      setParentStudentIds("");
      toast.success("Parent linked to students.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not link parent.");
    }
  }

  async function handleRemoveParentStudents() {
    if (!parentId || !parentStudentIds.trim()) return;
    try {
      await removeParentMutation.mutateAsync({
        parent_id: parentId,
        student_ids: parseIds(parentStudentIds),
      });
      setParentStudentIds("");
      toast.success("Parent links removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove parent links.");
    }
  }

  if (teachersQuery.isLoading || parentsQuery.isLoading || relationsQuery.isLoading) {
    return (
      <LoadingState
        title="Loading relationship workspace"
        description="Preparing teacher, parent, and student links for this school."
      />
    );
  }

  const error = teachersQuery.error ?? parentsQuery.error ?? relationsQuery.error;
  if (error) {
    if (isFeatureUnavailableError(error)) {
      return (
        <EmptyState
          title="Relationship management is being connected"
          description="This feature is being connected to the backend."
        />
      );
    }

    return (
      <ErrorState
        title="We could not load relationship data"
        description="Try again. If the issue persists, the backend may still be warming up."
        onRetry={() => {
          void teachersQuery.refetch();
          void parentsQuery.refetch();
          void relationsQuery.refetch();
        }}
      />
    );
  }

  return (
    <Tabs defaultValue="teacher-students" className="space-y-5">
      <TabsList>
        <TabsTrigger value="teacher-students">Teacher to Students</TabsTrigger>
        <TabsTrigger value="parent-students">Parent to Student</TabsTrigger>
        <TabsTrigger value="class-assignments">Class Assignments</TabsTrigger>
      </TabsList>

      <TabsContent value="teacher-students" className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Assign Students</CardTitle>
            <CardDescription>Select a teacher and add one or many student ids.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-select">Teacher</Label>
              <select
                id="teacher-select"
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                <option value="">Select teacher</option>
                {(teachersQuery.data ?? []).map((teacher: ManagedTeacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-student-ids">Student IDs</Label>
              <Input
                id="teacher-student-ids"
                value={teacherStudentIds}
                onChange={(event) => setTeacherStudentIds(event.target.value)}
                placeholder="Comma-separated student ids"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAssignTeacherStudents}>Assign Students</Button>
              <Button variant="outline" onClick={handleRemoveTeacherStudents}>
                Remove Student
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current teacher assignments</CardTitle>
            <CardDescription>Review which students are linked to which teachers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedTeacherRelations).length ? (
              Object.entries(groupedTeacherRelations).map(([key, items]) => (
                <div key={key} className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="font-medium text-foreground">{items[0]?.teacher_name || "Teacher"}</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {items.map((item) => (
                      <li key={`${item.teacher_id}-${item.student_id}`}>
                        {item.student_name}
                        {item.class_name ? ` | ${item.class_name}` : ""}
                        {item.subject_name ? ` | ${item.subject_name}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <EmptyState
                title="No teacher-student links yet"
                description="Assign students or entire classes to a teacher to populate this view."
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="parent-students" className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Link Parent to Student</CardTitle>
            <CardDescription>Pick a parent and connect one or more students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-select">Parent</Label>
              <select
                id="parent-select"
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                <option value="">Select parent</option>
                {(parentsQuery.data ?? []).map((parent: ManagedParent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-student-ids">Student IDs</Label>
              <Input
                id="parent-student-ids"
                value={parentStudentIds}
                onChange={(event) => setParentStudentIds(event.target.value)}
                placeholder="Comma-separated student ids"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship-type">Relationship</Label>
              <select
                id="relationship-type"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAssignParentStudents}>Link Parent to Student</Button>
              <Button variant="outline" onClick={handleRemoveParentStudents}>
                Remove Link
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current parent links</CardTitle>
            <CardDescription>See linked students for each approved parent account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedParentRelations).length ? (
              Object.entries(groupedParentRelations).map(([key, items]) => (
                <div key={key} className="rounded-2xl border border-border bg-background/70 p-4">
                  <p className="font-medium text-foreground">{items[0]?.parent_name || "Parent"}</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {items.map((item) => (
                      <li key={`${item.parent_id}-${item.student_id}`}>
                        {item.student_name}
                        {item.relationship ? ` | ${item.relationship}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <EmptyState
                title="No parent-student links yet"
                description="Link parents to one or more students after approval."
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="class-assignments">
        <EmptyState
          title="Class assignment tools are available from Classes"
          description="Create classes, assign teachers, and then use teacher-student links for individual or class-based support."
        />
      </TabsContent>
    </Tabs>
  );
}
