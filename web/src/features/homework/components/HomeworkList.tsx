import { EmptyState } from "@/components/common/EmptyState";
import { HomeworkCard } from "@/features/homework/components/HomeworkCard";
import type { HomeworkSummary } from "@/features/homework/types";

export function HomeworkList({ items }: { items: HomeworkSummary[] }) {
  if (!items.length) {
    return (
      <EmptyState
        title="No homework here yet"
        description="When homework is assigned, it will appear here with due dates, hints, and attempt-first support."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <HomeworkCard key={item.id} homework={item} />
      ))}
    </div>
  );
}
