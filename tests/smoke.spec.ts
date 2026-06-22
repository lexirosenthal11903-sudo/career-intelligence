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

    // The reveal card + its first direction land from the (mocked) stream.
    await expect(page.getByText('where I see this going')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Behavioural research', { exact: true })).toBeVisible();
    await expect(page.getByText('The clearest fit.')).toBeVisible();
    expect(errors, `Uncaught errors on first-session click: ${errors.join(' | ')}`).toHaveLength(0);
  });

  // Progressive disclosure (Step F): on the first session a surface earns its place —
  // Roles is flagged "new" (just unlocked), Documents is locked (disabled), and the
  // nav note stands in for the count/Recent that only a returning user has earned.
  test('first session nav shows progressive-disclosure states', async ({ page }) => {
    await page.goto('/workspace?view=first');
    const roles = page.getByRole('button', { name: /Roles/ });
    await expect(roles).toBeVisible({ timeout: 15_000 });
    await expect(roles.getByText('new')).toBeVisible();
    await expect(page.getByRole('button', { name: /Documents/ })).toBeDisabled();
    await expect(page.getByText('more of this fills in as we talk')).toBeVisible();
  });

  for (const route of DASHBOARD_ROUTES) {
    test(`dashboard tab "${route.name}" (${route.path}) loads`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(route.path);
      // Every dashboard page renders the sidebar brand link when it renders at
      // all — its absence means the page crashed before paint.
      await expect(
        page.getByRole('link', { name: 'Meridian' }).first()
      ).toBeVisible({ timeout: 15_000 });
      expect(
        errors,
        `Uncaught errors on ${route.path}: ${errors.join(' | ')}`
      ).toHaveLength(0);
    });
  }
});
