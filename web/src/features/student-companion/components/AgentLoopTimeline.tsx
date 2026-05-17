"use client";

import { motion } from "framer-motion";
import { Check, Compass, Eye, Sparkles, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentStep } from "@/features/student-companion/types";
import { cn } from "@/lib/utils";

const defaultStages = [
  { key: "PLAN", title: "Plan", description: "Identify the safest next teaching move.", icon: Compass },
  { key: "ACT", title: "Act", description: "Pick tools or the next guided response path.", icon: Wand2 },
  { key: "OBSERVE", title: "Observe", description: "Look at the attempt, hints, and latest signals.", icon: Eye },
  { key: "REFLECT", title: "Reflect", description: "Check whether the response still supports learning.", icon: Sparkles },
];

export function AgentLoopTimeline({
  steps,
  title = "Agent loop",
  description = "A subtle view of how LearnLoop structures each response.",
}: {
  steps?: AgentStep[];
  title?: string;
  description?: string;
}) {
  const completed = new Set(steps?.map((step) => step.step_name.toUpperCase()) ?? []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {defaultStages.map((stage, index) => {
          const Icon = stage.icon;
          const isDone = completed.has(stage.key);
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3",
                isDone ? "border-primary/30 bg-primary/5" : "border-border bg-background/70",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                  isDone ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{stage.title}</p>
                  {isDone ? <Badge className="rounded-full bg-primary/10 text-primary">Observed</Badge> : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{stage.description}</p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
