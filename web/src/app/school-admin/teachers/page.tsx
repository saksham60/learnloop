"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useSchoolTeachers } from "@/features/school-admin/hooks/useSchoolAdmin";

export default function SchoolAdminTeachersPage() {
  const teachersQuery = useSchoolTeachers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Teachers"
        title="Teacher roster"
        description="Review approved teachers, the classes they own, and how many students they currently support."
      />
      <PeopleTable
        title="Teachers"
        description="Teacher coverage across this school."
        rows={(teachersQuery.data ?? []) as unknown as Record<string, unknown>[]}
        isLoading={teachersQuery.isLoading}
        error={teachersQuery.error}
        onRetry={() => void teachersQuery.refetch()}
        loadingTitle="Loading teachers"
        loadingDescription="Preparing the teacher roster for this school."
        unavailableTitle="Teacher roster is being connected"
        unavailableDescription="This feature is being connected to the backend."
        columns={[
          { key: "full_name", label: "Teacher" },
          { key: "email", label: "Email" },
          {
            key: "subjects_or_classes",
            label: "Subjects / classes",
            render: (row) =>
              Array.isArray(row.subjects_or_classes) && row.subjects_or_classes.length
                ? row.subjects_or_classes.join(", ")
                : "N/A",
          },
          { key: "assigned_students_count", label: "Assigned students" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
