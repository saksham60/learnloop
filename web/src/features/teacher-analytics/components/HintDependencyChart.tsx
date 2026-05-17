"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassWeakTopic } from "@/features/teacher-analytics/types";

export function HintDependencyChart({ items }: { items: ClassWeakTopic[] }) {
  const derived = items.map((item) => ({
    topic: item.topic,
    dependency: Number((item.risk_score * 0.6 + 1).toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hint dependency</CardTitle>
        <CardDescription>
          A derived classroom signal based on the current weak-topic intensity.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={derived}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="topic" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="dependency"
              stroke="hsl(var(--accent))"
              fill="hsl(var(--accent))"
              fillOpacity={0.18}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
