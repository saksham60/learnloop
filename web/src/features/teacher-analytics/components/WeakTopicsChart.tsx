"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassWeakTopic } from "@/features/teacher-analytics/types";

export function WeakTopicsChart({ items }: { items: ClassWeakTopic[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weak topics</CardTitle>
        <CardDescription>Higher risk means more support may be needed.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="topic" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="risk_score" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
