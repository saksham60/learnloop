"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { masterNav } from "@/lib/constants";

export default function MasterLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["platform_admin"]}>
      <AppShell title="Platform Admin Workspace" navItems={masterNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
