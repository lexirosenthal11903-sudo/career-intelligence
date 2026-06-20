import { test, expect, type Page } from '@playwright/test';

/**
 * Production hydration tests (Step 0) — reproduce the real "this page couldn't
 * load" crash.
 *
 * Two things make this different from the dev smoke suite:
 *   1. It runs against `next start` (a real production build), where React
 *      hydration error #418 actually throws. Dev mode only warns.
 *   2. It watches `console.error`, not just `pageerror`. Hydration mismatches
 *      surface as console errors, so a suite that only listens for pageerror
 *      will go green while the bug is live.
 *
 * Each dashboard page is tested TWICE: once cold (empty sessionStorage, the
 * build-time prerender state) and once as a RETURNING USER (sessionStorage
 * pre-seeded with a completed analysis, before any script runs). The returning
 * state is the one Lexi was in when it broke.
 */

// A realistic completed-analysis payload, matching the shape the dashboard
// pages read from sessionStorage under the "analysis-result" key.
const SEEDED_ANALYSIS = {
  profile: {
    summary:
      'You think in systems but keep being pulled toward people problems. ' +
      'A path that lets you build structure for human outcomes fits you.',
    suggestedDirections: [
      { title: 'Operations & Programme Delivery', why: 'You bring order to ambiguity and like seeing things land.' },
      { title: 'People & Talent', why: 'You read people well and care about how teams actually work.' },
      { title: 'Product Operations', why: 'You sit naturally between the plan and the people executing it.' },
    ],
    topRoleTitles: ['Graduate Operations Analyst', 'Junior Programme Coordinator', 'People Operations Assistant'],
    valuesSignals: ['Autonomy', 'Impact on people', 'Structured environments'],
    companySuggestions: [
      { type: 'Mission-driven scale-ups', why: 'Enough structure to learn, enough room to own things.' },
    ],
    searchKeywords: ['graduate operations', 'programme coordinator', 'people operations'],
  },
};

const DASHBOARD_ROUTES = [
  { path: '/dashboard', name: 'Home' },
  { path: '/dashboard/roles', name: 'Roles' },
  { path: '/dashboard/applications', name: 'Applications' },
  { path: '/dashboard/skills', name: 'Skills' },
  { path: '/dashboard/profile', name: 'Profile' },
];

interface Captured {
  pageErrors: string[];
  consoleErrors: string[];
}

function capture(page: Page): Captured {
  const c: Captured = { pageErrors: [], consoleErrors: [] };
  page.on('pageerror', (e) => c.pageErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') c.consoleErrors.push(msg.text());
  });
  return c;
}

// Hydration #418 / #423 (and chunk-load failures) are the production crashes we
// are hunting. Surface them explicitly so a failure names the real problem.
function hydrationFailures(c: Captured): string[] {
  const all = [...c.pageErrors, ...c.consoleErrors];
  return all.filter((m) =>
    /Minified React error #(418|423|425)|Hydration failed|did not match|hydrat/i.test(m)
  );
}

test.describe('Production dashboard — cold load (build-time prerender state)', () => {
  for (const route of DASHBOARD_ROUTES) {
    test(`"${route.name}" hydrates cleanly cold`, async ({ page }) => {
      const c = capture(page);
      await page.goto(route.path);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(1500); // let hydration + first effects settle
      expect(hydrationFailures(c), `Hydration errors on ${route.path}: ${hydrationFailures(c).join(' | ')}`).toHaveLength(0);
      expect(c.pageErrors, `Uncaught errors on ${route.path}: ${c.pageErrors.join(' | ')}`).toHaveLength(0);
    });
  }
});

test.describe('Production dashboard — returning user (seeded analysis in sessionStorage)', () => {
  for (const route of DASHBOARD_ROUTES) {
    test(`"${route.name}" hydrates cleanly for a returning user`, async ({ page }) => {
      const c = capture(page);
      // Seed BEFORE any page script runs, so the client renders the "with data"
      // state on first paint — exactly the returning-user condition.
      await page.addInitScript((payload) => {
        try {
          sessionStorage.setItem('analysis-result', payload);
        } catch { /* ignore */ }
      }, JSON.stringify(SEEDED_ANALYSIS));
      await page.goto(route.path);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(1500);
      expect(hydrationFailures(c), `Hydration errors on ${route.path}: ${hydrationFailures(c).join(' | ')}`).toHaveLength(0);
      expect(c.pageErrors, `Uncaught errors on ${route.path}: ${c.pageErrors.join(' | ')}`).toHaveLength(0);
    });
  }
});
