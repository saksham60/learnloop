"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { adminNav } from "@/lib/constants";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["school_admin", "platform_admin"]}>
      <AppShell title="Admin Workspace" navItems={adminNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
