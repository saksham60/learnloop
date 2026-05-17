"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { teacherNav } from "@/lib/constants";

export default function TeacherLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["teacher"]}>
      <AppShell title="Teacher Workspace" navItems={teacherNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
