import { test, expect, type Page } from '@playwright/test';

/**
 * Regression for Session 39's real crash: a stored analysis whose
 * `profile.suggestedDirections` is a STRING (older schema), not an array.
 *
 * Roles / Profile / Applications / Role-detail called `.map`/`.find` on it and
 * the whole page died with "TypeError: ... .map is not a function", caught by
 * the error boundary as "Something went wrong on my end." Home/Skills survived
 * because they used Array.isArray. This seeds the bad shape and asserts every
 * page renders its real content instead of the crash fallback.
 */

// A completed analysis with the malformed field, plus a couple of other fields
// degraded the same way, to be thorough.
const MALFORMED_ANALYSIS = {
  profile: {
    summary: 'You think in systems but are drawn to people problems.',
    suggestedDirections: 'Operations, People & Talent, Product Operations', // <-- string, not array
    topRoleTitles: ['Graduate Operations Analyst', 'People Operations Assistant'],
    valuesSignals: 'Autonomy and impact', // <-- string, not array
    searchKeywords: ['graduate operations'],
  },
};

const ROUTES = [
  { path: '/dashboard/roles', name: 'Roles' },
  { path: '/dashboard/profile', name: 'Profile' },
  { path: '/dashboard/applications', name: 'Applications' },
  { path: '/dashboard/roles/operations', name: 'Role detail' },
];

function trackMapCrash(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

for (const route of ROUTES) {
  test(`"${route.name}" survives a malformed (string) suggestedDirections`, async ({ page }) => {
    const errors = trackMapCrash(page);
    await page.addInitScript((payload) => {
      try { sessionStorage.setItem('analysis-result', payload); } catch { /* ignore */ }
    }, JSON.stringify(MALFORMED_ANALYSIS));

    await page.goto(route.path);
    await page.waitForTimeout(2000);

    // The error boundary must NOT have caught a render crash.
    await expect(
      page.getByText('Something went wrong on my end.'),
      `${route.path} fell into the error boundary`
    ).toHaveCount(0);

    const mapCrash = errors.filter((e) => /is not a function|map is not a function/i.test(e));
    expect(mapCrash, `${route.path} threw: ${mapCrash.join(' | ')}`).toHaveLength(0);
  });
}
