/**
 * Crash-test route — exists only to verify the dashboard error boundary
 * actually catches a render crash (so the floor's "a broken page can't reach
 * Lexi" guarantee is tested, not assumed).
 *
 * It throws ONLY when NEXT_PUBLIC_ENABLE_CRASH_TEST === "1", which is inlined at
 * build time. In real production builds the flag is unset, so this route renders
 * a harmless placeholder and no user can ever trigger the throw. The E2E prod
 * config builds with the flag on.
 *
 * `force-dynamic` keeps it out of the static prerender, so the throw happens at
 * request time (where the error boundary catches it) rather than at build time.
 */
export const dynamic = "force-dynamic";

export default function CrashTestPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_CRASH_TEST === "1") {
    throw new Error("Intentional crash-test error (dashboard boundary check)");
  }
  return <div data-testid="crash-test-disabled">Crash test disabled.</div>;
}
