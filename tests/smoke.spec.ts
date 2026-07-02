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

  // Workspace shell (visual rebuild, Track 2). Both variants must render the left
  // nav brand without an uncaught error — the panel surfaces wire to live APIs.
  for (const { path, name } of [
    { path: '/workspace', name: 'returning split' },
    { path: '/workspace?view=first', name: 'first session' },
  ]) {
    test(`workspace (${name}) renders`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(path);
      await expect(page.getByText('Career Intelligence').first()).toBeVisible({ timeout: 15_000 });
      expect(errors, `Uncaught errors on ${path}: ${errors.join(' | ')}`).toHaveLength(0);
    });
  }

  // First-session "click" (Step E): sending the first message streams /api/analyse
  // into the conversation and reveals the direction inline. We mock the SSE so the
  // flow runs offline (no Anthropic), proving the consumer + reveal wiring.
  test('first session streams the analysis and reveals the direction inline', async ({ page }) => {
    const errors = trackErrors(page);

    const result = {
      profile: {
        summary: "You came in unsure your psychology degree led anywhere — it clearly does.",
        suggestedDirections: [
          { title: 'Behavioural research', why: 'Your dissertation instinct, made into a job.' },
          { title: 'UX research', why: 'The same curiosity, pointed at products.' },
          { title: 'Service design', why: 'Designing what people move through.' },
        ],
      },
    };

    // Discovery (the advisor asks before it tells): one question, then "ready".
    let intakeTurns = 0;
    await page.route('**/api/intake', async (route) => {
      intakeTurns += 1;
      const body = intakeTurns === 1
        ? { ready: false, question: 'Where are you hoping to work?' }
        : { ready: true };
      await route.fulfill({ status: 200, body: JSON.stringify(body) });
    });
    await page.route('**/api/analyse', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: `data: ${JSON.stringify({ event: 'complete', result })}\n\n`,
      });
    });
    await page.route('**/api/save-result', (route) => route.fulfill({ status: 200, body: '{}' }));

    await page.goto('/workspace?view=first');
    const input = page.getByPlaceholder("Tell me what you're thinking…");
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.fill('Just finished a psychology degree and I feel a bit lost.');
    await input.press('Enter');

    // The advisor asks a discovery question before analysing.
    await expect(page.getByText('Where are you hoping to work?')).toBeVisible({ timeout: 15_000 });
    const answer = page.getByPlaceholder('Type your answer…');
    await expect(answer).toBeVisible({ timeout: 10_000 });
    await answer.fill('London, ideally.');
    await answer.press('Enter');

    // The reveal card + its first direction land from the (mocked) stream.
    await expect(page.getByText('where I see this going')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Behavioural research', { exact: true })).toBeVisible();
    // Honesty: the reveal must NOT crown the lead direction "the clearest fit"
    // (removed audit #3 — directions are honestly ordered, not flattered).
    await expect(page.getByText('The clearest fit.')).toHaveCount(0);
    expect(errors, `Uncaught errors on first-session click: ${errors.join(' | ')}`).toHaveLength(0);
  });

  // First session = brand only (Lexi, 2026-06-24): the nav surfaces haven't been
  // earned yet, so they don't appear at all — they'd just be empty tabs. They show
  // up once the user is in the workspace proper.
  test('first session nav shows brand only (no surfaces yet)', async ({ page }) => {
    await page.goto('/workspace?view=first');
    await expect(page.getByText('Career Intelligence').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Roles/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Your direction/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Documents/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Profile/ })).toHaveCount(0);
  });

  // The workspace renders unauthenticated without crashing, and — crucially — the
  // "Where we got to" recap does NOT show for a visitor with no genuine return. The
  // recap is now gated on a real return (>=6h away / new day) so a plain load never
  // reads as "welcome back"; its authenticated genuine-return coverage lives in
  // state-sync.spec.ts ('recap shows on a genuine return but NOT on a same-session refresh').
  test('workspace renders unauthenticated with no spurious recap', async ({ page }) => {
    // Even if /api/recap returns content, the card must stay hidden without a real return.
    await page.route('**/api/recap', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          recap: { greeting: 'Good to pick this back up.', becomingClear: ['x'], doingNext: ['y'] },
        }),
      })
    );
    await page.goto('/workspace');
    await expect(page.getByRole('textbox', { name: 'Message Career Intelligence' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Where we got to')).toHaveCount(0);
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
