import * as Sentry from "@sentry/nextjs";

/**
 * Server + edge error/perf instrumentation. Dormant until NEXT_PUBLIC_SENTRY_DSN
 * is set in the environment, so this is a no-op (and the build stays green) until
 * Lexi adds the DSN in Vercel.
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      enabled: !!dsn,
      tracesSampleRate: 0.1,
    });
  }
}

// Forwards Next.js server-side request errors to Sentry.
export const onRequestError = Sentry.captureRequestError;
