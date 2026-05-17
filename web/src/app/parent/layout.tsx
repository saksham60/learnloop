"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { parentNav } from "@/lib/constants";

export default function ParentLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["parent"]}>
      <AppShell title="Parent Workspace" navItems={parentNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
