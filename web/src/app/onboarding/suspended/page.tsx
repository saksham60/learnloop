import { EmptyState } from "@/components/common/EmptyState";

export default function SuspendedPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <EmptyState
        title="This account is suspended"
        description="Please contact LearnLoop support or your school administrator for help restoring access."
      />
    </div>
  );
}
