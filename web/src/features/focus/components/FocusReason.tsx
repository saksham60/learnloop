import { ArrowRight } from "lucide-react";

export function FocusReason({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
      <span>{reason}</span>
    </div>
  );
}
