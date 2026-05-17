"use client";

import { Lightbulb } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HintCard({
  title = "Hint",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50/70">
      <CardHeader>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Lightbulb className="h-5 w-5" />
        </div>
        <CardTitle className="mt-2 text-base text-amber-950">{title}</CardTitle>
        <CardDescription className="text-amber-900/80">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
