"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import type { PublicOnboardingRole } from "@/features/onboarding/types";
import { useSchools } from "@/features/schools/hooks/useSchools";
import { isFeatureUnavailableError } from "@/lib/api/errors";
import { getPostAuthDestination } from "@/features/role-gate/utils";

const roleCopy: Record<
  PublicOnboardingRole,
  { title: string; button: string; description: string; approvalStatus: "active" | "pending_approval" }
> = {
  student: {
    title: "Join as a student",
    button: "Join School",
    description: "Students get immediate access after picking the right school.",
    approvalStatus: "active",
  },
  teacher: {
    title: "Request teacher access",
    button: "Request Teacher Access",
    description: "Your request will be reviewed by the school admin before LearnLoop opens the teacher workspace.",
    approvalStatus: "pending_approval",
  },
  parent: {
    title: "Request parent access",
    button: "Request Parent Access",
    description: "Share a few child details so the school admin can verify and link the right student.",
    approvalStatus: "pending_approval",
  },
};

export function SchoolSelectionForm({ role }: { role: PublicOnboardingRole }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [childClass, setChildClass] = useState("");
  const [relationship, setRelationship] = useState("guardian");

  const schoolsQuery = useSchools(search);
  const onboardingMutation = useSubmitOnboarding();
  const selectedSchool = useMemo(
    () => schoolsQuery.data?.find((school) => school.id === selectedSchoolId) ?? null,
    [schoolsQuery.data, selectedSchoolId],
  );

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
        grade_level: role === "student" ? gradeLevel || null : null,
        parent_request:
          role === "parent"
            ? {
                child_name: childName || null,
                child_email: childEmail || null,
                child_class: childClass || null,
                relationship: relationship || null,
              }
            : null,
      });

      if (!profile) return;
      router.replace(getPostAuthDestination(profile));
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
          <div className="space-y-2">
            <Label htmlFor="grade-level">Class or grade</Label>
            <Input
              id="grade-level"
              value={gradeLevel}
              onChange={(event) => setGradeLevel(event.target.value)}
              placeholder="7A or Grade 7"
            />
          </div>
        ) : null}

        {role === "parent" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="child-name">Child name</Label>
              <Input
                id="child-name"
                value={childName}
                onChange={(event) => setChildName(event.target.value)}
                placeholder="Student name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-email">Child email</Label>
              <Input
                id="child-email"
                value={childEmail}
                onChange={(event) => setChildEmail(event.target.value)}
                placeholder="Optional student email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-class">Child class or grade</Label>
              <Input
                id="child-class"
                value={childClass}
                onChange={(event) => setChildClass(event.target.value)}
                placeholder="Optional class"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <select
                id="relationship"
                value={relationship}
                onChange={(event) => setRelationship(event.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parent-note">Context</Label>
              <Textarea
                id="parent-note"
                value={selectedSchool ? `${selectedSchool.name} selected for parent access request.` : ""}
                readOnly
                className="min-h-[96px]"
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
