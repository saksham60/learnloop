"use client";

import { GraduationCap, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicOnboardingRole } from "@/features/onboarding/types";

const options: Array<{
  role: PublicOnboardingRole;
  title: string;
  copy: string;
  badge: string;
  cta: string;
  icon: typeof GraduationCap;
}> = [
  {
    role: "student",
    title: "Student",
    copy: "I want to learn, practice, complete homework, and track my progress.",
    badge: "No approval required",
    cta: "Continue as Student",
    icon: GraduationCap,
  },
  {
    role: "teacher",
    title: "Teacher",
    copy: "I want to assign homework, review attempts, and guide students.",
    badge: "School approval required",
    cta: "Continue as Teacher",
    icon: ShieldCheck,
  },
  {
    role: "parent",
    title: "Parent",
    copy: "I want to follow my child's learning progress.",
    badge: "School approval required",
    cta: "Continue as Parent",
    icon: Users,
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
              <Button
                className="w-full"
                onClick={() => router.push(`/onboarding/school?role=${option.role}`)}
              >
                {option.cta}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
