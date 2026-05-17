"use client";

import type { PropsWithChildren } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { schoolAdminNav } from "@/lib/constants";

export default function SchoolAdminLayout({ children }: PropsWithChildren) {
  return (
    <RoleGate allowedRoles={["school_admin"]}>
      <AppShell title="School Admin Workspace" navItems={schoolAdminNav}>
        {children}
      </AppShell>
    </RoleGate>
  );
}
