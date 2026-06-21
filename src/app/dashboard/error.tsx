"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import CrashFallback from "@/components/CrashFallback";

/**
 * Dashboard error boundary. A crash in any dashboard tab (Roles, Applications,
 * Profile, Skills, Home) degrades to this instead of a dead "this page couldn't
 * load" screen. Secondary action returns the user to the dashboard home, which
 * renders without depending on a specific tab's data.
 */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <CrashFallback
      onReset={reset}
      onSecondary={() => router.push("/dashboard")}
      secondaryLabel="Back to dashboard"
    />
  );
}
