import { test, expect } from '@playwright/test';

/**
 * Proves the dashboard error boundary catches a render crash in production
 * instead of showing a dead page. The /dashboard/crash-test route throws when
 * built with NEXT_PUBLIC_ENABLE_CRASH_TEST=1 (the prod E2E build sets it).
 *
 * Done when: a crashing segment degrades to Arlo's "Something went wrong on my
 * end" fallback with a working "Try again" — never a blank/dead page.
 */
test('dashboard error boundary renders a graceful fallback on crash', async ({ page }) => {
  await page.goto('/dashboard/crash-test');

  // The boundary's fallback (CrashFallback) must be on screen.
  await expect(page.getByText('Something went wrong on my end.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to dashboard' })).toBeVisible();
});
