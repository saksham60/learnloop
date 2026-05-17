"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useSchoolStudents } from "@/features/school-admin/hooks/useSchoolAdmin";

export default function SchoolStudentsPage() {
  const studentsQuery = useSchoolStudents();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School"
        title="Students"
        description="Monitor active students, class grouping, and current parent or teacher coverage."
      />
      <PeopleTable
        title="Student roster"
        description="Students linked to this school."
        rows={studentsQuery.data ?? []}
        isLoading={studentsQuery.isLoading}
        error={studentsQuery.error}
        onRetry={() => void studentsQuery.refetch()}
        columns={[
          { key: "full_name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "class_name", label: "Class" },
          { key: "assigned_teachers_count", label: "Assigned teachers" },
          { key: "linked_parents_count", label: "Linked parents" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
