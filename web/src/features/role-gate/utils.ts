import type { RouteDecision } from "@/features/role-gate/types";
import type { UserProfile } from "@/features/auth/types";
import { approvalDestinations, roleDestinations, type AppRole } from "@/lib/constants";

export function getPostAuthDestination(profile: UserProfile): string {
  if (profile.role === "pending") {
    return "/onboarding/role";
  }

  const approvalDestination = approvalDestinations[profile.approval_status];
  if (approvalDestination) {
    return approvalDestination;
  }

  return roleDestinations[profile.role];
}

export function evaluateRoleAccess(profile: UserProfile | null | undefined, allowedRoles: AppRole[]): RouteDecision {
  if (!profile) {
    return { kind: "loading" };
  }

  if (profile.role === "pending") {
    return { kind: "redirect", href: "/onboarding/role" };
  }

  const approvalDestination = approvalDestinations[profile.approval_status];
  if (approvalDestination) {
    return { kind: "redirect", href: approvalDestination };
  }

  if (!allowedRoles.includes(profile.role)) {
    return { kind: "forbidden" };
  }

  return { kind: "allow" };
}
