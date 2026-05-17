import { PageHeader } from "@/components/common/PageHeader";
import { OverviewCards } from "@/features/school-admin/components/OverviewCards";

export default function SchoolPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="School"
        title="School overview"
        description="Review school operations, parent-child requests, students, and current class coverage."
      />
      <OverviewCards />
    </div>
  );
}
