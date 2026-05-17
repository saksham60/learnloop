import { FeatureUnavailableError } from "@/lib/api/errors";
import { getDemoParentDashboardData } from "@/lib/demo/demo-auth";

import type { ParentDashboardData } from "@/features/parent-dashboard/types";

export async function fetchParentDashboard(): Promise<ParentDashboardData> {
  const demo = getDemoParentDashboardData();
  if (demo) {
    return demo;
  }

  throw new FeatureUnavailableError("Parent dashboard is being connected to the backend.");
}
