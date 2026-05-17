"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PeopleTable } from "@/features/school-admin/components/PeopleTable";
import { useSchoolStudents } from "@/features/school-admin/hooks/useSchoolAdmin";

export default function SchoolAdminStudentsPage() {
  const studentsQuery = useSchoolStudents();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Students"
        title="Student roster"
        description="See school-linked students, teacher coverage, parent links, and approval state."
      />
      <PeopleTable
        title="Students"
        description="Filter-ready student roster for school admins."
        rows={(studentsQuery.data ?? []) as unknown as Record<string, unknown>[]}
        isLoading={studentsQuery.isLoading}
        error={studentsQuery.error}
        onRetry={() => void studentsQuery.refetch()}
        loadingTitle="Loading students"
        loadingDescription="Preparing the student roster for this school."
        unavailableTitle="Student roster is being connected"
        unavailableDescription="This feature is being connected to the backend."
        columns={[
          { key: "full_name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "class_name", label: "Class" },
          { key: "assigned_teachers_count", label: "Assigned teachers" },
          { key: "linked_parents_count", label: "Linked parents" },
          { key: "status", label: "Status" },
          { key: "last_active", label: "Last active" },
        ]}
      />
    </div>
  );
}
