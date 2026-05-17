import { Layers3, Settings2, Users } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="School workspace"
        description="A lightweight admin foundation for user onboarding, class structure, and future platform settings."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Users" value="-" detail="Role management placeholder" icon={Users} />
        <StatCard title="Classes" value="-" detail="School structure placeholder" icon={Layers3} />
        <StatCard title="Settings" value="-" detail="Org configuration placeholder" icon={Settings2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin foundation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          The backend does not expose dedicated admin management endpoints yet, so these pages are
          structured as production-ready placeholders instead of fake CRUD screens.
        </CardContent>
      </Card>
    </div>
  );
}
