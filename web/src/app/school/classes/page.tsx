import { PageHeader } from "@/components/common/PageHeader";
import { ClassManagement } from "@/features/school-admin/components/ClassManagement";

export default function SchoolClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School"
        title="Classes"
        description="Create classes and review current class structure for the school."
      />
      <ClassManagement />
    </div>
  );
}
