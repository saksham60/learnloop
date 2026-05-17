import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Users"
        title="User roles and onboarding"
        description="This view is ready for future role-change and approval actions once the backend exposes them."
      />
      <EmptyState
        title="User management is not wired yet"
        description="The admin route is in place, but role-change actions are waiting for backend support."
      />
    </div>
  );
}
