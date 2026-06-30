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

test('autoscroll — a long just-sent message is anchored near the TOP (start visible), not scrolled off', async ({ browser }) => {
  test.skip(!ready, 'Needs Supabase creds in .env.local (seeds the e2e test user).');
  const context = await browser.newContext();
  await context.addCookies(cookies);
  // Returning view (chat) needs a results row; the content doesn't matter here. Clear any
  // conversation persisted by a prior run so the advisor cold-opens deterministically
  // (the test asserts a fresh opener), making this test idempotent.
  const admin = adminClient();
  await admin.from('results').delete().eq('user_id', userId);
  await admin.from('results').insert({ user_id: userId, data: { profile: { summary: 'x', seniorityLevel: 'entry-level' } } });
  await admin.from('conversations').delete().eq('user_id', userId);

  const page = await context.newPage();
  // Instant scrolls (no smooth animation) so the position is deterministic to measure.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 900, height: 620 }); // short enough that a long message exceeds it

  // Mock the advisor so this test spends £0 and gives a STABLE loading window: the opener
  // replies instantly; the long probe send is held ~6s so we can measure the anchored
  // user message before any reply re-anchors the view.
  const MARKER = 'SCROLLPROBESTART';
  await page.route('**/api/chat', async (route) => {
    const body = route.request().postDataJSON() as { messages?: Array<{ content?: string }> };
    const last = body?.messages?.[body.messages.length - 1];
    const isProbe = typeof last?.content === 'string' && last.content.includes(MARKER);
    if (isProbe) await new Promise((r) => setTimeout(r, 6000));
    await route.fulfill({ json: { content: [{ type: 'text', text: isProbe ? 'Got it.' : 'Hello.' }] } });
  });
  // Mock the recap too: £0, and (more importantly) it settles the layout BEFORE the send
  // so the test measures a stable scroll — in real use the recap is long-loaded by the
  // time a user types. A canned short recap.
  await page.route('**/api/recap', async (route) => {
    await route.fulfill({ json: { recap: { greeting: 'Good to see you back.', becomingClear: [], doingNext: [] } } });
  });

  await page.goto('/workspace');
  const composer = page.getByRole('textbox', { name: 'Message Career Intelligence' });
  await expect(composer).toBeVisible({ timeout: 20_000 });
  // Let the recap card AND the advisor's opener render first, so the conversation is fully
  // settled before we send + measure (mirrors a real user, who reads the opener then types).
  await expect(page.getByText('Where we got to')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Hello.', { exact: false })).toBeVisible({ timeout: 10_000 });

  // A message taller than the viewport — without the fix, scroll-to-bottom hides its start.
  const longMessage = `${MARKER} ` + 'This is a deliberately long message about my situation. '.repeat(60);
  await composer.fill(longMessage);
  await composer.press('Enter');

  // The just-sent bubble appears; measure its top relative to its scroll container.
  const marker = page.getByText(MARKER, { exact: false });
  await expect(marker).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(300); // let the anchor scroll settle
  const delta = await marker.evaluate((node) => {
    // Walk up to the scroll container (same rule the hook uses).
    let el: HTMLElement | null = node.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) break;
      el = el.parentElement;
    }
    if (!el) return NaN;
    return node.getBoundingClientRect().top - el.getBoundingClientRect().top;
  });

  // PASS: the START of the message sits near the TOP of the scroll viewport (not above it).
  // Before the fix this delta was a large NEGATIVE (the start scrolled off the top).
  expect(delta).toBeGreaterThanOrEqual(-2);
  expect(delta).toBeLessThan(160);

  await context.close();
});
