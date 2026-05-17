"use client";

import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMasterSchool, useMasterSchools } from "@/features/master-admin/hooks/useMasterAdmin";
import { isFeatureUnavailableError } from "@/lib/api/errors";

export function SchoolManagement() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const schoolsQuery = useMasterSchools();
  const createMutation = useCreateMasterSchool();

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || null,
        contact_email: contactEmail.trim() || null,
        status: "active",
      });
      setName("");
      setCode("");
      setCity("");
      setState("");
      setCountry("");
      setContactEmail("");
      toast.success("School created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create school.");
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Create school</CardTitle>
          <CardDescription>Provision a new school before assigning a school admin.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="school-name">School name</Label>
            <Input id="school-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-code">School code</Label>
            <Input id="school-code" value={code} onChange={(event) => setCode(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-city">City</Label>
            <Input id="school-city" value={city} onChange={(event) => setCity(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-state">State</Label>
            <Input id="school-state" value={state} onChange={(event) => setState(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-country">Country</Label>
            <Input id="school-country" value={country} onChange={(event) => setCountry(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-contact">Contact email</Label>
            <Input id="school-contact" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create school
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
          <CardDescription>Monitor organization rollout and coverage.</CardDescription>
        </CardHeader>
        <CardContent>
          {schoolsQuery.isLoading ? (
            <LoadingState title="Loading schools" description="Preparing platform school coverage." />
          ) : schoolsQuery.error ? (
            isFeatureUnavailableError(schoolsQuery.error) ? (
              <EmptyState
                title="School list is being connected"
                description="This feature is being connected to the backend."
              />
            ) : (
              <ErrorState
                title="We could not load schools"
                description="Try again. If the issue persists, the backend may still be warming up."
                onRetry={() => void schoolsQuery.refetch()}
              />
            )
          ) : schoolsQuery.data?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">School</th>
                    <th className="px-3 py-3 font-medium">Location</th>
                    <th className="px-3 py-3 font-medium">Users</th>
                    <th className="px-3 py-3 font-medium">Classes</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schoolsQuery.data.map((school) => (
                    <tr key={school.id}>
                      <td className="px-3 py-3">
                        <p className="font-medium text-foreground">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.code || "No code"}</p>
                      </td>
                      <td className="px-3 py-3">
                        {[school.city, school.state, school.country].filter(Boolean).join(", ") || "N/A"}
                      </td>
                      <td className="px-3 py-3">{school.user_count}</td>
                      <td className="px-3 py-3">{school.class_count}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={school.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No schools yet" description="Create the first school to start platform onboarding." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
