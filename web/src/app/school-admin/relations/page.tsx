import { PageHeader } from "@/components/common/PageHeader";
import { RelationsWorkspace } from "@/features/relations/components/RelationsWorkspace";

export default function SchoolAdminRelationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relations"
        title="Manage teacher and parent relationships"
        description="Establish who teaches whom, who belongs to which class, and which parents are linked to which students."
      />
      <RelationsWorkspace />
    </div>
  );
}
