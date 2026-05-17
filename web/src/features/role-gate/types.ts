import type { UserProfile } from "@/features/auth/types";

export type RouteDecision =
  | { kind: "loading" }
  | { kind: "redirect"; href: string }
  | { kind: "allow" }
  | { kind: "forbidden" };

export type RouteProfile = UserProfile | null | undefined;
