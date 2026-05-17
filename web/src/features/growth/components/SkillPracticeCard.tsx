import type { GrowthActivity } from "@/features/growth/types";
import { GrowthActivityCard } from "@/features/growth/components/GrowthActivityCard";

export function SkillPracticeCard(props: {
  activity: GrowthActivity;
  onComplete?: (activityId: string) => void;
}) {
  return <GrowthActivityCard {...props} />;
}
