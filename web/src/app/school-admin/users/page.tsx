"use client";

import { useMemo } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useSchoolParents, useSchoolStudents, useSchoolTeachers } from "@/features/school-admin/hooks/useSchoolAdmin";

export default function SchoolAdminUsersPage() {
  const studentsQuery = useSchoolStudents();
  const teachersQuery = useSchoolTeachers();
  const parentsQuery = useSchoolParents();

  const rows = useMemo(() => {
    return [
      ...(studentsQuery.data ?? []),
      ...(teachersQuery.data ?? []),
      ...(parentsQuery.data ?? []),
    ];
  }, [parentsQuery.data, studentsQuery.data, teachersQuery.data]);

  const error = studentsQuery.error ?? teachersQuery.error ?? parentsQuery.error;
  const isLoading = studentsQuery.isLoading || teachersQuery.isLoading || parentsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Users"
        title="All school users"
        description="A combined view of students, teachers, and parents inside this school."
      />
      <PeopleTable
        title="School users"
        description="Cross-role directory for quick audits."
        rows={rows as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          void studentsQuery.refetch();
          void teachersQuery.refetch();
          void parentsQuery.refetch();
        }}
        loadingTitle="Loading school users"
        loadingDescription="Combining student, teacher, and parent records for this school."
        unavailableTitle="School user directory is being connected"
        unavailableDescription="This feature is being connected to the backend."
        columns={[
          { key: "full_name", label: "Name" },
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Role",
            render: (row) => String(row.role ?? row.requested_role ?? "N/A").replaceAll("_", " "),
          },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}
