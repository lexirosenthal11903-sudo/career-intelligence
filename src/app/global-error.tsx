"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import CrashFallback from "@/components/CrashFallback";

/**
 * Last-resort boundary: catches errors thrown in the root layout itself, where
 * the normal error.tsx can't reach. It replaces the whole document, so it must
 * render its own <html>/<body>. Navigation uses window.location because the
 * Next router context is part of what failed.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <CrashFallback
          onReset={reset}
          onSecondary={() => { window.location.href = "/"; }}
          secondaryLabel="Go home"
        />
      </body>
    </html>
  );
}
