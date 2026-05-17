import { submitOnboarding } from "@/features/auth/api";
import type { OnboardingPayload } from "@/features/onboarding/types";

export async function submitRoleOnboarding(payload: OnboardingPayload) {
  return submitOnboarding(payload);
}
