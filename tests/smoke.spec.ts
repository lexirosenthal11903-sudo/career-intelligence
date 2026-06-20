import { test, expect, type Page } from '@playwright/test';

/**
 * Ground-truth smoke tests (Step 0).
 *
 * Goal: surface the "this page couldn't load" crashes automatically. Every core
 * route must render its real content with no uncaught client error — tested
 * UNAUTHENTICATED, because the dashboard is not auth-gated and that is exactly
 * the surface where the reported crashes live.
 *
 * These are deliberately shallow: they prove a page renders without dying. Flow
 * tests (auth, full analysis) come next, against a seeded test account.
 */

const DASHBOARD_ROUTES = [
  { path: '/dashboard', name: 'Home' },
  { path: '/dashboard/roles', name: 'Roles' },
  { path: '/dashboard/applications', name: 'Applications' },
  { path: '/dashboard/skills', name: 'Skills' },
  { path: '/dashboard/profile', name: 'Profile' },
];

// Capture uncaught client errors so a crashing page fails loudly.
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test.describe('Core routes render without crashing (unauthenticated)', () => {
  test('homepage renders', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Uncaught errors on /: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('input page renders', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/input');
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `Uncaught errors on /input: ${errors.join(' | ')}`).toHaveLength(0);
  });

  for (const route of DASHBOARD_ROUTES) {
    test(`dashboard tab "${route.name}" (${route.path}) loads`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(route.path);
      // Every dashboard page renders the sidebar brand link when it renders at
      // all — its absence means the page crashed before paint.
      await expect(
        page.getByRole('link', { name: 'Career Intelligence' }).first()
      ).toBeVisible({ timeout: 15_000 });
      expect(
        errors,
        `Uncaught errors on ${route.path}: ${errors.join(' | ')}`
      ).toHaveLength(0);
    });
  }
});
