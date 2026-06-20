import { defineConfig, devices } from '@playwright/test';

/**
 * Live-deployment smoke gate.
 *
 * Local tests pass against the code; they cannot catch a STALE or BROKEN
 * deployment (e.g. routes that 404 on the live site because the deploy is
 * behind the branch). This config hits the real deployed URL — no local server.
 *
 * Run with `npm run test:e2e:live`. Override the target with DEPLOY_URL=...
 */
const BASE = process.env.DEPLOY_URL || 'https://career-intelligence-staging.vercel.app';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.live\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  timeout: 30_000,
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
