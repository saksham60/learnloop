"use client";

import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExerciseHabitCard } from "@/features/growth/components/ExerciseHabitCard";
import { GrowthActivityCard } from "@/features/growth/components/GrowthActivityCard";
import { SkillPracticeCard } from "@/features/growth/components/SkillPracticeCard";
import { SportsPracticeCard } from "@/features/growth/components/SportsPracticeCard";
import {
  useCompleteGrowthActivity,
  useCreateGrowthActivity,
  useGrowthActivities,
} from "@/features/growth/hooks/useGrowth";
import type { GrowthActivity } from "@/features/growth/types";
import { isFeatureUnavailableError } from "@/lib/api/errors";

const activityOptions = [
  { value: "sports", label: "Sports" },
  { value: "mobility", label: "Mobility" },
  { value: "warm_up", label: "Warm-up" },
  { value: "stamina", label: "Stamina" },
  { value: "posture", label: "Posture" },
  { value: "stretching", label: "Stretching" },
  { value: "communication", label: "Communication" },
  { value: "life_skills", label: "Life skills" },
  { value: "coding", label: "Coding" },
  { value: "creativity", label: "Creativity" },
];

function renderActivityCard(
  activity: GrowthActivity,
  onComplete: (activityId: string) => void,
) {
  if (activity.activity_type === "sports") {
    return <SportsPracticeCard activity={activity} onComplete={onComplete} />;
  }
  if (["mobility", "warm_up", "stamina", "posture", "stretching"].includes(activity.activity_type)) {
    return <ExerciseHabitCard activity={activity} onComplete={onComplete} />;
  }
  if (["communication", "life_skills", "coding", "creativity"].includes(activity.activity_type)) {
    return <SkillPracticeCard activity={activity} onComplete={onComplete} />;
  }
  return <GrowthActivityCard activity={activity} onComplete={onComplete} />;
}

export function GrowthDashboard() {
  const [activityType, setActivityType] = useState(activityOptions[0].value);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const activitiesQuery = useGrowthActivities();
  const createMutation = useCreateGrowthActivity();
  const completeMutation = useCompleteGrowthActivity();

  async function handleCreate() {
    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync({
        activity_type: activityType,
        title: title.trim(),
        description: description.trim() || null,
      });
      setTitle("");
      setDescription("");
      toast.success("Growth activity added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add growth activity.");
    }
  }

  async function handleComplete(activityId: string) {
    try {
      await completeMutation.mutateAsync(activityId);
      toast.success("Growth activity completed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete activity.");
    }
  }

  if (activitiesQuery.isLoading) {
    return <LoadingState title="Loading growth activities" description="Preparing your broader growth plan." />;
  }

  if (activitiesQuery.error) {
    if (isFeatureUnavailableError(activitiesQuery.error)) {
      return (
        <EmptyState
          title="Growth module is being connected"
          description="This feature is being connected to the backend."
        />
      );
    }
    return <ErrorState onRetry={() => void activitiesQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a growth activity</CardTitle>
          <CardDescription>
            Keep this school-friendly with safe categories like mobility, posture, sports, and communication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="growth-type">Activity type</Label>
              <select
                id="growth-type"
                value={activityType}
                onChange={(event) => setActivityType(event.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                {activityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth-title">Title</Label>
              <Input
                id="growth-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Cricket footwork drill"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="growth-description">Description</Label>
            <Textarea
              id="growth-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Keep it short and student-friendly."
            />
          </div>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            Add activity
          </Button>
        </CardContent>
      </Card>

      {activitiesQuery.data?.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {activitiesQuery.data.map((activity) => (
            <div key={activity.id}>{renderActivityCard(activity, handleComplete)}</div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No growth activities yet"
          description="Add your first sports, exercise, communication, or creativity activity to start the module."
        />
      )}
    </div>
  );
}
