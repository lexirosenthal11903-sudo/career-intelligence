import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side error/perf instrumentation. Dormant until NEXT_PUBLIC_SENTRY_DSN
 * is set, so nothing is sent (and no console noise) until the DSN is configured.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
