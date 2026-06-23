import { test, expect, type Cookie } from '@playwright/test';
import { seedAuthCookies, adminClient, getTestUserId } from './helpers/seedAuth';

/**
 * Workspace entry routing — proves the 2026-06-23 fix.
 *
 * The bug: "new vs returning" was decided by account age
 * (lastSignIn - createdAt < 10s), so anyone with an existing account — including
 * the founder — was permanently routed to the returning workspace and could never
 * reach the discovery conversation again. Lexi reported the product "only asks for
 * the CV": she was being sent past discovery because she has an account.
 *
 * The fix routes on whether the user has actually been READ (a row in `results`),
 * not on timing. This logs in as a real seeded user and asserts:
 *   - no analysis  → /workspace shows the first-session discovery opener
 *   - has analysis → /workspace does NOT show it (the returning workspace)
 *
 * No Anthropic spend — pure routing. Runs under test:e2e:prod only.
 */

const OPENER = /work out what you actually want/i;

let cookies: Cookie[];
let userId: string;

test.beforeAll(async () => {
  cookies = await seedAuthCookies();
  userId = await getTestUserId();
});

// Serial: both tests mutate the SAME seeded user's `results` row, so they must not
// run concurrently (fullyParallel is on) or they race each other's setup.
test.describe.configure({ mode: 'serial' });

test('authed user with NO analysis lands in discovery', async ({ browser }) => {
  // Ensure a clean "never been read" state.
  await adminClient().from('results').delete().eq('user_id', userId);

  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  await page.goto('/workspace', { waitUntil: 'domcontentloaded' });

  await expect(
    page.getByText(OPENER),
    'authed user with no results row should reach the discovery opener'
  ).toBeVisible();
  await context.close();
});

test('authed user WITH an analysis lands in the workspace, not discovery', async ({ browser }) => {
  // Give the user a real, minimal analysis row.
  const admin = adminClient();
  await admin.from('results').delete().eq('user_id', userId);
  const { error } = await admin.from('results').insert({
    user_id: userId,
    data: { profile: { summary: 'A test read.', suggestedDirections: [{ title: 'Test direction', why: 'because' }] } },
  });
  expect(error, `seed results insert failed: ${error?.message}`).toBeNull();

  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  await page.goto('/workspace', { waitUntil: 'domcontentloaded' });

  // The discovery opener is unique to the first session — it must NOT appear.
  await expect(page.getByText(OPENER)).toHaveCount(0);
  await context.close();

  // Clean up so a re-run starts fresh.
  await admin.from('results').delete().eq('user_id', userId);
});
