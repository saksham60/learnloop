"use client";

import { Activity, LoaderCircle, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useBackendHealth } from "@/features/health/hooks/useBackendHealth";

export function BackendHealthBadge() {
  const healthQuery = useBackendHealth();

  if (healthQuery.isLoading) {
    return (
      <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1.5">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        Checking backend
      </Badge>
    );
  }

  if (healthQuery.error || healthQuery.data?.source === "fallback") {
    return (
      <Badge variant="warning" className="gap-2 rounded-full px-3 py-1.5">
        <TriangleAlert className="h-3.5 w-3.5" />
        Backend warming up
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-2 rounded-full px-3 py-1.5">
      <Activity className="h-3.5 w-3.5" />
      Backend healthy
    </Badge>
  );
}
