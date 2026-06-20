import { test, expect } from '@playwright/test';

/**
 * Live-deployment smoke test — the gate that catches a stale/broken deploy.
 *
 * Session 39: Lexi's "this page couldn't load" was NOT a code bug. The staging
 * branch was correct, but the live deployment was behind it and 404'd on
 * /dashboard/roles, /applications, /profile, /skills. Local tests passed because
 * the code was fine. Only a test against the real URL catches this.
 *
 * Every core route must respond 200 on the live site — no 404, no 5xx.
 */

const ROUTES = [
  '/',
  '/input',
  '/dashboard',
  '/dashboard/roles',
  '/dashboard/applications',
  '/dashboard/profile',
  '/dashboard/skills',
];

for (const path of ROUTES) {
  test(`live route ${path} responds 200`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status(), `${path} returned ${res.status()} on the live deployment`).toBe(200);
  });
}

test('live dashboard navigation to Roles does not dead-end', async ({ page }) => {
  await page.goto('/dashboard');
  // Client-side navigation to a route missing from the deploy is what produced
  // "This page couldn't load". Assert the destination actually renders.
  const resp = await page.goto('/dashboard/roles');
  expect(resp?.status(), 'Roles route status on live deploy').toBe(200);
  await expect(page.locator('body')).toBeVisible();
});
