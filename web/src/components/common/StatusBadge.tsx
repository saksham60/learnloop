import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = (status || "unknown").toLowerCase();
  if (["completed", "ready", "success", "active", "submitted"].includes(normalized)) {
    return <Badge variant="success">{status}</Badge>;
  }
  if (["pending", "processing", "in_progress", "scheduled"].includes(normalized)) {
    return <Badge variant="warning">{status}</Badge>;
  }
  if (["failed", "error", "rejected"].includes(normalized)) {
    return <Badge variant="danger">{status}</Badge>;
  }
  return <Badge variant="outline">{status || "Unknown"}</Badge>;
}

