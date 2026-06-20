import { defineConfig, devices } from '@playwright/test';

/**
 * Step 0 — the engineering floor. These tests are the gate: a broken build
 * should not reach Lexi. Run with `npm run test:e2e`.
 *
 * The webServer block boots `next dev` automatically and reuses an already
 * running dev server locally, so the tests are one command.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
