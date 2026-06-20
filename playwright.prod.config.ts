import { defineConfig, devices } from '@playwright/test';

/**
 * Production-build test gate (Step 0).
 *
 * The "this page couldn't load" crash is a React **production-only** error
 * (hydration #418, chunk-load failures). Dev mode masks it. This config builds
 * the app and serves it with `next start`, so the tests run against the exact
 * artefact users get. Run with `npm run test:e2e:prod`.
 *
 * It only picks up `*.prod.spec.ts` files so the dev smoke suite stays separate.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.prod\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
