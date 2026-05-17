import { PageHeader } from "@/components/common/PageHeader";
import { ClassManagement } from "@/features/school-admin/components/ClassManagement";

export default function SchoolAdminClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="Build and manage classes"
        description="Create classes, review current coverage, and prepare class teacher or subject teacher assignment."
      />
      <ClassManagement />
    </div>
  );
}
