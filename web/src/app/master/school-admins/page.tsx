import { PageHeader } from "@/components/common/PageHeader";
import { SchoolAdminAssignmentPanel } from "@/features/master-admin/components/SchoolAdminAssignmentPanel";

export default function MasterSchoolAdminsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School admins"
        title="Assign school administrators"
        description="Only platform admins can grant school admin access and attach it to a school."
      />
      <SchoolAdminAssignmentPanel />
    </div>
  );
}
