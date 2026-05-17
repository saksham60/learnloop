import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

export default function AdminClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Classes"
        title="School class structure"
        description="Use this placeholder to expand into class creation, grade grouping, and subject structure later."
      />
      <EmptyState
        title="Class administration is planned next"
        description="This page is intentionally present so the admin shell is complete without pretending unsupported APIs exist."
      />
    </div>
  );
}
