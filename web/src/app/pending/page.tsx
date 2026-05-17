"use client";

import Link from "next/link";

import { PendingApprovalCard } from "@/features/auth/components/PendingApprovalCard";
import { Button } from "@/components/ui/button";

export default function PendingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <PendingApprovalCard />
      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
