import { redirect } from "next/navigation";

export default function PendingRedirectPage() {
  redirect("/onboarding/pending-approval");
}
