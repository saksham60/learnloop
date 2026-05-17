"use client";

import { EmptyState } from "@/components/common/EmptyState";

export function PendingApprovalCard() {
  return (
    <EmptyState
      title="Your LearnLoop AI access is pending"
      description="Your account exists, but your school role is still being confirmed. Once approval is complete, your workspace will appear automatically."
      actionLabel="Back to home"
      onAction={() => {
        window.location.href = "/";
      }}
    />
  );
}
