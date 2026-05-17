import Link from "next/link";
import { ArrowRight, Compass, MessageSquareQuote, NotebookTabs, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackendHealthBadge } from "@/features/health/components/BackendHealthBadge";

const pillars = [
  {
    title: "Guided thinking",
    description: "Students are encouraged to think, try, and reflect before they receive a full explanation.",
    icon: MessageSquareQuote,
  },
  {
    title: "Learning Compass",
    description: "Daily focus areas are driven by events and signals rather than vague motivation prompts.",
    icon: Compass,
  },
  {
    title: "Homework support",
    description: "LearnLoop helps with hints, attempts, and revision flow instead of direct answer dumping.",
    icon: NotebookTabs,
  },
  {
    title: "Whole-student growth",
    description: "Academics, habits, sports, communication, coding, and creativity live in one platform.",
    icon: Sparkles,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <div className="max-w-3xl">
        <BackendHealthBadge />
        <h1 className="font-display text-5xl leading-tight">Why LearnLoop AI exists</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          LearnLoop AI is built around one idea: students learn better when an AI helps them think
          through the next step instead of replacing the thinking altogether.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card key={pillar.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-2">{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <Button asChild>
          <Link href="/login">
            Continue with Google
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
