import { test, expect, type Cookie } from '@playwright/test';
import { seedAuthCookies, adminClient, getTestUserId } from './helpers/seedAuth';
import { keywordHash } from '../src/lib/job-set';

/**
 * STATE-SYNC client-surface pass — proves the UI now agrees with what the advisor knows
 * (STATE-SYNC-AUDIT #2/#3/#5). Seeds the e2e test user (NOT real user data) with a preferred
 * name, a salary range, two directions where one is rejected, then drives the real workspace
 * and asserts the rendered surfaces. This is the "drift test" the audit asked for: a red test
 * if any of these regress, instead of the founder catching it live.
 *
 * Runs locally against `next dev` (webServer in playwright.config.ts); only needs Supabase
 * creds from .env.local, no Anthropic spend.
 */

// Both tests seed the SAME e2e test user (preferredName, directionFeedback), so they must
// NOT run in parallel or they clobber each other's state mid-assertion. Serial = correct.
test.describe.configure({ mode: 'serial' });

let cookies: Cookie[];
let userId: string;
let ready = false; // skip gracefully where Supabase creds / .env.local aren't present (CI)

test.beforeAll(async () => {
  try {
    cookies = await seedAuthCookies();
    userId = await getTestUserId();
  } catch {
    return; // ready stays false -> the test skips
  }
  const admin = adminClient();
  // Fresh analysis with two directions; "Consulting" will be the rejected one.
  await admin.from('results').delete().eq('user_id', userId);
  await admin.from('results').insert({
    user_id: userId,
    data: {
      profile: {
        summary: 'A psychology graduate exploring people-focused work.',
        seniorityLevel: 'entry-level',
        suggestedDirections: [
          { title: 'Behavioural research', why: 'fits your psychology background' },
          { title: 'Consulting', why: 'analytical breadth' },
        ],
      },
    },
  });
  ready = true;
});

test('Profile + Direction + nav reflect the preferred name, salary, and a rejected direction', async ({ browser }) => {
  test.skip(!ready, 'Needs Supabase creds in .env.local (seeds the e2e test user).');
  const context = await browser.newContext();
  await context.addCookies(cookies);

  // Seed via the REAL API: preferred name, salary range, and a rejected direction.
  const patch = await context.request.patch('/api/profile', {
    data: {
      preferredName: 'Lexi',
      salaryFloor: 30000,
      salaryCeiling: 45000,
      directionFeedback: [{ direction: 'Consulting', status: 'rejected', at: new Date().toISOString() }],
    },
  });
  expect(patch.ok(), `profile PATCH failed: ${patch.status()} ${await patch.text()}`).toBeTruthy();

  const page = await context.newPage();
  await page.goto('/workspace');

  // #3 — the nav shows the preferred name "Lexi", not the formal signup name "E2E Test User".
  await expect(page.getByText('Lexi').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('E2E Test User')).toHaveCount(0);

  // #3 + #5 — Profile surface: "You go by Lexi" and the salary range are visible.
  await page.getByRole('button', { name: 'Profile' }).click();
  await expect(page.getByText('You go by Lexi')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('£30,000 to £45,000')).toBeVisible();

  // #2 — Direction surface (scoped to the side panel): the kept direction shows, the
  // rejected one is gone. Scoped because the seeded chat transcript also mentions them.
  await page.getByRole('button', { name: 'Your direction' }).click();
  const side = page.getByTestId('side');
  await expect(side.getByText('Behavioural research')).toBeVisible({ timeout: 10_000 });
  await expect(side.getByText('Consulting')).toHaveCount(0);

  await context.close();
});

test('advisor changes propagate LIVE via ci:profile-changed (no reload)', async ({ browser }) => {
  test.skip(!ready, 'Needs Supabase creds in .env.local (seeds the e2e test user).');
  const context = await browser.newContext();
  await context.addCookies(cookies);

  // Start with NO direction feedback, so both directions show.
  await context.request.patch('/api/profile', { data: { directionFeedback: [], preferredName: 'Sam' } });

  const page = await context.newPage();
  await page.goto('/workspace');
  await page.getByRole('button', { name: 'Your direction' }).click();
  const side = page.getByTestId('side');
  await expect(side.getByText('Consulting')).toBeVisible({ timeout: 20_000 });

  // The advisor rejects a direction + sets a new preferred name (what update_direction /
  // update_profile write), then the same signal those tools now emit fires.
  await context.request.patch('/api/profile', {
    data: {
      preferredName: 'Lexi',
      directionFeedback: [{ direction: 'Consulting', status: 'rejected', at: new Date().toISOString() }],
    },
  });
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('ci:profile-changed')));

  // The rejected direction drops off WITHOUT a reload, and the nav name updates live.
  await expect(side.getByText('Consulting')).toHaveCount(0, { timeout: 10_000 });
  await expect(side.getByText('Behavioural research')).toBeVisible();
  await expect(page.getByText('Lexi').first()).toBeVisible({ timeout: 10_000 });

  await context.close();
});

test('#1 badge — an advisor-saved role (synthetic id) shows "In Applications" ONCE on the matching live listing', async ({ browser }) => {
  test.skip(!ready, 'Needs Supabase creds in .env.local (seeds the e2e test user).');
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const admin = adminClient();

  // A deterministic profile so the persisted matched_jobs set is used VERBATIM (its
  // keyword hash matches what the client computes) — the test never falls back to a live
  // Adzuna/Reed fetch. keywordHash is the SAME function the hook uses (shared lib).
  const profile = {
    summary: 'A marketing graduate looking for an assistant role.',
    seniorityLevel: 'entry-level',
    searchKeywords: ['marketing assistant'],
    locationSearch: 'london',
    topRoleTitles: ['Marketing Assistant'],
  };
  await admin.from('results').delete().eq('user_id', userId);
  await admin.from('results').insert({ user_id: userId, data: { profile } });

  // Clean any prior saved/matched rows for this user so the assertion is unambiguous.
  await admin.from('saved_jobs').delete().eq('user_id', userId);
  await admin.from('saved_applications').delete().eq('user_id', userId);

  // The LIVE listing as it sits in matched_jobs — a real numeric id.
  const liveRole = {
    id: 987654,
    title: 'Marketing Assistant',
    company: 'Brightwave',
    location: 'London',
    salary: 'Not listed',
    relevanceScore: 8,
    description: 'An entry-level marketing assistant role.',
    applyUrl: 'https://example.com/jobs/987654',
  };
  const replace = await context.request.post('/api/matched-jobs', {
    data: { action: 'replace', keywordHash: keywordHash(profile), jobs: [liveRole] },
  });
  expect(replace.ok(), `matched-jobs replace failed: ${replace.status()} ${await replace.text()}`).toBeTruthy();

  // The SAME role saved by the advisor with a SYNTHETIC id (chat-<slug>), which never
  // equals the live numeric id. The badge must still match it — via roleKey, not id
  // (STATE-SYNC-AUDIT #1). This is the exact mismatch that used to break the badge.
  const save = await context.request.post('/api/save-job', {
    data: {
      jobId: 'chat-marketing-assistant',
      jobData: { id: 'chat-marketing-assistant', title: 'Marketing Assistant', company: 'Brightwave', status: 'interested' },
    },
  });
  expect(save.ok(), `save-job failed: ${save.status()} ${await save.text()}`).toBeTruthy();

  const page = await context.newPage();
  await page.goto('/workspace');
  await page.getByRole('button', { name: 'Live roles' }).click();
  const side = page.getByTestId('side');

  // The live Brightwave row appears exactly once, and carries the "In Applications" badge
  // (matched across the synthetic/live id gap). Once = no phantom duplicate of the saved role.
  await expect(side.getByText('Marketing Assistant')).toHaveCount(1, { timeout: 20_000 });
  await expect(side.getByText('✓ In Applications')).toHaveCount(1);

  await context.close();
});
