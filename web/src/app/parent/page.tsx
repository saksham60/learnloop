import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parent"
        title="Follow your child's learning journey"
        description="Parent access is intentionally limited and school-approved. Child progress, homework summaries, and teacher notes will appear here."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Child Progress</CardTitle>
            <CardDescription>Progress summaries will appear here after student linking is complete.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState title="Progress view pending" description="School admins still need to link this parent to a student." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Homework Summary</CardTitle>
            <CardDescription>Approved parent accounts will get a safe summary of pending and completed work.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState title="Homework summary pending" description="This feature is being connected to the backend." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Teacher Notes</CardTitle>
            <CardDescription>School-approved teacher notes will appear here once parent relationships are live.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState title="Teacher notes pending" description="This feature is being connected to the backend." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
