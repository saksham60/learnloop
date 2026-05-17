"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { studentNav } from "@/lib/constants";

export default function StudentLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["student"]}>
      <AppShell title="Student Workspace" navItems={studentNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
