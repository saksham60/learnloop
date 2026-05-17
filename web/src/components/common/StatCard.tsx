import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "bg-amber-50 text-amber-700"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-primary/10 text-primary";

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div className={cn("rounded-2xl p-3", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpRight className="h-4 w-4" />
          <span>{detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}

