import { EmptyState } from "@/components/common/EmptyState";

export default function ParentPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <EmptyState
        title="Parent view is planned next"
        description="LearnLoop already reserves a route for the future parent experience. This space will connect once the parent workflow is ready."
      />
    </div>
  );
}
