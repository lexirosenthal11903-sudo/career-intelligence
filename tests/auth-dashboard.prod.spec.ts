import { test, expect, type Page, type Cookie } from '@playwright/test';
import { seedAuthCookies } from './helpers/seedAuth';

/**
 * THE reproduction: authenticated dashboard tabs in production.
 *
 * Lexi reported Roles / Applications / Profile show "This page couldn't load"
 * ONLY when logged in. The unauthenticated smoke + hydration suites pass, so the
 * crash is data/auth-dependent. This logs in as a real seeded user and loads
 * every tab, failing loudly on any uncaught error or hydration failure.
 */

let cookies: Cookie[];

test.beforeAll(async () => {
  cookies = await seedAuthCookies();
});

const ROUTES = [
  { path: '/dashboard', name: 'Home' },
  { path: '/dashboard/roles', name: 'Roles' },
  { path: '/dashboard/applications', name: 'Applications' },
  { path: '/dashboard/skills', name: 'Skills' },
  { path: '/dashboard/profile', name: 'Profile' },
];

function capture(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  return { pageErrors, consoleErrors };
}

test.describe('Authenticated dashboard tabs load without crashing', () => {
  for (const route of ROUTES) {
    test(`"${route.name}" (${route.path}) loads for a logged-in user`, async ({ page, context }) => {
      await context.addCookies(cookies);
      const c = capture(page);
      await page.goto(route.path);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(2500); // let auth + data fetches + scoring settle

      const hydration = [...c.pageErrors, ...c.consoleErrors].filter((m) =>
        /Minified React error #(418|423|425)|Hydration failed|did not match/i.test(m)
      );
      expect(hydration, `Hydration errors on ${route.path}: ${hydration.join(' | ')}`).toHaveLength(0);
      expect(c.pageErrors, `Uncaught errors on ${route.path}: ${c.pageErrors.join(' | ')}`).toHaveLength(0);
    });
  }
});
