"use client";

import { Building2, GraduationCap, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicRegistrationChoice } from "@/features/onboarding/types";

const options: Array<{
  role: PublicRegistrationChoice;
  title: string;
  copy: string;
  badge: string;
  cta: string;
  icon: typeof GraduationCap;
  href: string;
}> = [
  {
    role: "student",
    title: "Student",
    copy:
      "I want to learn, complete homework, track my progress, and use LearnLoop as my learning companion.",
    badge: "No approval required",
    cta: "Continue as Student",
    icon: GraduationCap,
    href: "/onboarding/school?role=student",
  },
  {
    role: "parent",
    title: "Parent",
    copy: "I want to follow my child's learning progress and request access through the school.",
    badge: "Child access requires school approval",
    cta: "Continue as Parent",
    icon: Users,
    href: "/onboarding/school?role=parent",
  },
  {
    role: "school",
    title: "School",
    copy: "I represent a school and want to set up LearnLoop for students, parents, and teachers.",
    badge: "School setup required",
    cta: "Register School",
    icon: Building2,
    href: "/onboarding/school-registration",
  },
];

export function RoleSelectionCards() {
  const router = useRouter();

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <Card key={option.role} className="rounded-[2rem] border-white/70 bg-white/85 shadow-glass">
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CardTitle>{option.title}</CardTitle>
                  <Badge variant="outline">{option.badge}</Badge>
                </div>
                <CardDescription className="text-sm leading-6">{option.copy}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push(option.href)}>
                {option.cta}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
