"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useSchoolTeachers } from "@/features/school-admin/hooks/useSchoolAdmin";

export default function SchoolTeachersPage() {
  const teachersQuery = useSchoolTeachers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School"
        title="Teachers"
        description="Review approved teachers and the student coverage each teacher is responsible for."
      />
      <PeopleTable
        title="Teacher roster"
        description="Teachers assigned to this school."
        rows={teachersQuery.data ?? []}
        isLoading={teachersQuery.isLoading}
        error={teachersQuery.error}
        onRetry={() => void teachersQuery.refetch()}
        columns={[
          { key: "full_name", label: "Teacher" },
          { key: "email", label: "Email" },
          {
            key: "subjects_or_classes",
            label: "Subjects / classes",
            render: (row) => Array.isArray(row.subjects_or_classes) ? row.subjects_or_classes.join(", ") || "Not assigned" : "Not assigned",
          },
          { key: "assigned_students_count", label: "Assigned students" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
