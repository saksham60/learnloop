import { PageHeader } from "@/components/common/PageHeader";
import { ApprovalQueue } from "@/features/approvals/components/ApprovalQueue";

export default function SchoolAdminApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals"
        title="Review teacher and parent requests"
        description="Approve or reject access requests so only the right people enter each school workspace."
      />
      <ApprovalQueue />
    </div>
  );
}
