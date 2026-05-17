import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Compass,
  GraduationCap,
  NotebookPen,
  Sparkles,
  Users,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackendHealthBadge } from "@/features/health/components/BackendHealthBadge";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const principles = [
  "Ask",
  "Think",
  "Try",
  "Hint",
  "Reflect",
  "Improve",
];

const highlights = [
  {
    title: "Student companion",
    description: "Guided conversations, attempt-first learning, and gentle Socratic coaching.",
    icon: BrainCircuit,
  },
  {
    title: "Teacher dashboard",
    description: "Weak topics, misconception signals, and classroom support without guesswork.",
    icon: Users,
  },
  {
    title: "Learning Compass",
    description: "A daily focus engine that turns events into clear next-study priorities.",
    icon: Compass,
  },
  {
    title: "Homework guidance",
    description: "Hints and reflection built around effort, not answer dumping.",
    icon: NotebookPen,
  },
  {
    title: "Growth modules",
    description: "Sports, habits, communication, coding, and creativity beside academics.",
    icon: Sparkles,
  },
  {
    title: "Offline-ready vision",
    description: "Web-first today, designed to extend into local-first student support later.",
    icon: WifiOff,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">
      <header className="rounded-[2rem] border border-white/70 bg-white/80 px-6 py-5 shadow-glass backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-3xl text-foreground">{APP_NAME}</div>
            <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>
          <div className="flex items-center gap-3">
            <BackendHealthBadge />
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-8 pb-12 pt-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
        <div>
          <Badge className="mb-4 rounded-full bg-white/80 px-4 py-2 text-primary">
            Guided learning, not answer dumping
          </Badge>
          <h1 className="max-w-3xl font-display text-5xl leading-tight text-foreground md:text-6xl">
            An AI student companion that helps learners think, practice, and grow.
          </h1>
          <p className="mt-6 max-w-2xl balanced-text text-lg leading-8 text-muted-foreground">
            LearnLoop AI supports Socratic learning, homework guidance, progress reflection,
            daily focus, and teacher insight in one clean learning system.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">See how LearnLoop works</Link>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden bg-slate-950 text-white">
          <CardHeader>
            <Badge className="w-fit rounded-full bg-white/10 text-white">Daily companion flow</Badge>
            <CardTitle className="font-display text-3xl text-white">Think. Try. Reflect. Grow.</CardTitle>
            <CardDescription className="text-slate-300">
              The interface reinforces effort-first learning at every step.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {principles.map((step, index) => (
              <div
                key={step}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
                    0{index + 1}
                  </div>
                  <span className="font-medium">{step}</span>
                </div>
                <GraduationCap className="h-4 w-4 text-slate-300" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="pb-12">
        <div className="mb-6">
          <h2 className="font-display text-3xl">Not answer dumping. Guided learning.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            LearnLoop makes the AI feel like a patient study companion. It nudges a student
            forward with questions, attempts, hints, and check-ins instead of immediately giving
            away the final answer.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="pb-12">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="font-display text-3xl">How it works</CardTitle>
            <CardDescription>
              A learning loop that supports understanding before explanation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {principles.map((step) => (
              <div key={step} className="rounded-2xl border border-border bg-background/80 px-4 py-5">
                <p className="text-sm font-semibold text-primary">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-white">Ready to continue?</CardTitle>
            <CardDescription className="text-slate-300">
              Sign in with Google and enter the right LearnLoop workspace for your role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/login">
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
