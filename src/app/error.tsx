"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CrashFallback from "@/components/CrashFallback";

/**
 * Root route-level error boundary. Catches uncaught render/effect errors in any
 * page below the root layout. Without this, a crash showed a dead page.
 * (Sentry capture hooks in here during the floor's observability step.)
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // TODO(Step 0 — observability): forward to Sentry once wired.
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <CrashFallback
      onReset={reset}
      onSecondary={() => router.push("/")}
      secondaryLabel="Go home"
    />
  );
}
