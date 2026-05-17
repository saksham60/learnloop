import { StatusBadge } from "@/components/common/StatusBadge";

export function ProcessingStatus({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={status} />
      <span className="text-sm text-muted-foreground">Processing state</span>
    </div>
  );
}
