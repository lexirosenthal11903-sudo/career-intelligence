import { test, expect, type Page } from '@playwright/test';

/**
 * First-session arc (Step 1 "feel alive", arc spec 2026-06-24).
 *
 * The advisor RUNS a session: it diagnoses how settled the person is
 * (directionClarity), then runs the beats calibrated to that read —
 *   feelings beat (always) → roles, earned in (calibrated) → close on one action.
 *
 * Mocked end to end (no Anthropic, no auth — the first session is pre-auth), so the
 * test proves the WIRING + calibration: that the dial actually changes the beats.
 */

type Clarity = 'lost' | 'mixed' | 'directed';

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

const NEXT_ACTION: Record<Clarity, string> = {
  lost: 'have a think about a time the people-side of something went well because of you.',
  mixed: 'jot down which part of your week you would happily do more of.',
  directed: 'find one brand campaign you admired this year, and why.',
};

function resultFor(clarity: Clarity) {
  return {
    profile: {
      summary: 'You came in unsure your degree led anywhere — it clearly does.',
      directionClarity: clarity,
      nextAction: NEXT_ACTION[clarity],
      suggestedDirections: [
        { title: 'Behavioural research', why: 'Your dissertation instinct, made into a job.' },
        { title: 'UX research', why: 'The same curiosity, pointed at products.' },
        { title: 'Service design', why: 'Designing what people move through.' },
      ],
    },
  };
}

// Drive the first session from arrival → reveal, with intake + analyse mocked to a
// given clarity. Returns once the reveal card is on screen.
async function runToReveal(page: Page, clarity: Clarity) {
  let intakeTurns = 0;
  await page.route('**/api/intake', async (route) => {
    intakeTurns += 1;
    const body =
      intakeTurns === 1
        ? { ready: false, question: 'How clear are you on what you’re after?', directionClarity: clarity }
        : { ready: true, directionClarity: clarity };
    await route.fulfill({ status: 200, body: JSON.stringify(body) });
  });
  await page.route('**/api/analyse', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      body: `data: ${JSON.stringify({ event: 'complete', result: resultFor(clarity) })}\n\n`,
    });
  });
  await page.route('**/api/save-result', (route) => route.fulfill({ status: 200, body: '{}' }));

  await page.goto('/workspace?view=first');
  const input = page.getByPlaceholder("Tell me what you're thinking…");
  await expect(input).toBeVisible({ timeout: 15_000 });
  await input.fill('Just finished my degree and not totally sure what is next.');
  await input.press('Enter');

  // The advisor asks before it tells — the calibrating question lands.
  await expect(page.getByText('How clear are you on what you’re after?')).toBeVisible({ timeout: 15_000 });
  const answer = page.getByPlaceholder('Type your answer…');
  await expect(answer).toBeVisible({ timeout: 10_000 });
  await answer.fill('honestly not sure.');
  await answer.press('Enter');

  await expect(page.getByText('where I see this going')).toBeVisible({ timeout: 15_000 });
}

// Post-reveal is now ONE message (Lexi, 2026-06-24): an invitation to explore, not a
// stack of asks. The directed variant adds a roles line; lost/mixed never push roles.
const EXPLORE = /Do any of these feel like you/;
const DIRECTED_ROLES = /show you what these look like as real roles/;

test.describe('First-session arc — the advisor runs a session', () => {
  test('LOST user: one exploration message, roles not pushed', async ({ page }) => {
    const errors = trackErrors(page);
    await runToReveal(page, 'lost');

    // ONE message that invites exploration and permits not-knowing.
    await expect(page.getByText(EXPLORE)).toBeVisible();
    // Roles are NOT pushed for an unsure user.
    await expect(page.getByText(DIRECTED_ROLES)).toHaveCount(0);
    // Chips carry the FEELING forward — roles are not the lead for an unsure user.
    await expect(page.getByRole('button', { name: 'None of these quite fit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show me the first few roles' })).toHaveCount(0);

    expect(errors, `Uncaught errors (lost): ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('continuing pre-auth opens sign-in IN PLACE, not the landing page', async ({ page }) => {
    await runToReveal(page, 'directed');

    // Replying to the reveal as a logged-out user must NOT navigate to the homepage
    // (the old "/?signup=required" bug). The auth modal opens over the conversation.
    await page.getByRole('button', { name: 'Show me the first few roles' }).click();
    await expect(page.getByRole('heading', { name: 'Save your results.' })).toBeVisible({ timeout: 10_000 });
    // Still on the workspace — the conversation is behind the modal, not gone.
    expect(new URL(page.url()).pathname).toBe('/workspace');
    // The reveal card stays put behind the modal (no reformat / dead end).
    await expect(page.getByText(EXPLORE)).toBeVisible();
    // "Maybe later" dismisses without a dead end — the reveal + pills are still there.
    await page.getByRole('button', { name: 'Maybe later' }).click();
    await expect(page.getByRole('button', { name: 'Show me the first few roles' })).toBeVisible();
  });

  test('DIRECTED user: exploration message offers roles + roles chip', async ({ page }) => {
    const errors = trackErrors(page);
    await runToReveal(page, 'directed');

    await expect(page.getByText(EXPLORE)).toBeVisible();
    // A directed user is offered roles within the same single message.
    await expect(page.getByText(DIRECTED_ROLES)).toBeVisible();
    // Roles ARE the lead chip for a directed user.
    await expect(page.getByRole('button', { name: 'Show me the first few roles' })).toBeVisible();

    expect(errors, `Uncaught errors (directed): ${errors.join(' | ')}`).toHaveLength(0);
  });
});
