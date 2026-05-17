import { BookCheck, Users } from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import type { ClassAnalytics } from "@/features/teacher-analytics/types";

export function ClassOverview({ analytics }: { analytics?: ClassAnalytics | null }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Students"
        value={analytics?.student_count ?? 0}
        detail="Classroom participation footprint"
        icon={Users}
      />
      <StatCard
        title="Homework sets"
        value={analytics?.homework_count ?? 0}
        detail="Assignments created for this class"
        icon={BookCheck}
      />
    </div>
  );
}
