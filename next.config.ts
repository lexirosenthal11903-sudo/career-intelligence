import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// withSentryConfig adds error monitoring + (when SENTRY_AUTH_TOKEN/org/project are
// set) source-map upload. Without those it no-ops the upload, so the build stays
// green until Lexi finishes the Sentry setup. silent keeps build logs clean.
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
