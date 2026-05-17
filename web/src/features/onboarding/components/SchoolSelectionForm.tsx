"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import type { PublicOnboardingRole } from "@/features/onboarding/types";
import { useSchools } from "@/features/schools/hooks/useSchools";
import { isFeatureUnavailableError } from "@/lib/api/errors";

const roleCopy: Record<
  PublicOnboardingRole,
  { title: string; button: string; description: string; approvalStatus: "active" }
> = {
  student: {
    title: "Join as a student",
    button: "Join School",
    description: "Student access is activated after school selection.",
    approvalStatus: "active",
  },
  parent: {
    title: "Continue as a parent",
    button: "Continue to Parent Portal",
    description: "Parent account is active, but child access requires school approval.",
    approvalStatus: "active",
  },
};

export function SchoolSelectionForm({ role }: { role: PublicOnboardingRole }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");

  const schoolsQuery = useSchools(search);
  const onboardingMutation = useSubmitOnboarding();

  async function handleSubmit() {
    if (!selectedSchoolId) {
      toast.error("Select a school before continuing.");
      return;
    }

    try {
      const profile = await onboardingMutation.mutateAsync({
        role,
        school_id: selectedSchoolId,
        approval_status: roleCopy[role].approvalStatus,
        class_grade: role === "student" ? classGrade || null : null,
        section: role === "student" ? section || null : null,
      });

      if (!profile) return;
      router.replace(role === "parent" ? "/parent/child-requests" : "/student");
    } catch (error) {
      if (isFeatureUnavailableError(error)) {
        toast.error("Onboarding is still being connected to the backend.");
        return;
      }
      toast.error(error instanceof Error ? error.message : "Could not complete onboarding.");
    }
  }

  if (schoolsQuery.isLoading) {
    return <LoadingState title="Loading schools" description="Preparing the school directory for onboarding." />;
  }

  if (schoolsQuery.error) {
    return (
      <EmptyState
        title="School directory is being connected"
        description="This feature is being connected to the backend."
      />
    );
  }

  return (
    <Card className="rounded-[2rem] border-white/70 bg-white/85 shadow-glass">
      <CardHeader>
        <CardTitle>{roleCopy[role].title}</CardTitle>
        <CardDescription className="text-sm leading-6">{roleCopy[role].description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="school-search">Search school</Label>
          <Input
            id="school-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by school name, slug, or code"
          />
        </div>

        <div className="space-y-3">
          <Label>Select school</Label>
          <div className="grid gap-3 md:grid-cols-2">
            {schoolsQuery.data?.length ? (
              schoolsQuery.data.map((school) => {
                const active = selectedSchoolId === school.id;
                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => setSelectedSchoolId(school.id)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      active ? "border-primary bg-primary/5" : "border-border bg-background/60 hover:border-primary/40"
                    }`}
                  >
                    <p className="font-medium text-foreground">{school.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[school.city, school.state, school.country].filter(Boolean).join(", ") || "Location coming soon"}
                    </p>
                    {school.code ? <p className="mt-2 text-xs text-muted-foreground">Code: {school.code}</p> : null}
                  </button>
                );
              })
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  title="School not found"
                  description="Request school addition is coming soon. For now, try another search term or ask your school admin to set up LearnLoop."
                />
              </div>
            )}
          </div>
        </div>

        {role === "student" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="class-grade">Class or grade</Label>
              <Input
                id="class-grade"
                value={classGrade}
                onChange={(event) => setClassGrade(event.target.value)}
                placeholder="Grade 7 or 7A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={section}
                onChange={(event) => setSection(event.target.value)}
                placeholder="A"
              />
            </div>
          </div>
        ) : null}

        <Button onClick={handleSubmit} disabled={onboardingMutation.isPending || !selectedSchoolId}>
          {roleCopy[role].button}
        </Button>
      </CardContent>
    </Card>
  );
}
