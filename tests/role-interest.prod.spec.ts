import { test, expect, type Cookie } from '@playwright/test';
import { seedAuthCookies, adminClient, getTestUserId } from './helpers/seedAuth';

/**
 * Role-interest mentoring flow — automates the structural half of SPEC.md's
 * done-criteria so Lexi never has to QA the mechanism by hand.
 *
 * It drives the REAL /api/chat tool loop (the same advisor live users meet) for
 * the moment someone marks a role interested, and asserts:
 *   1. The advisor opens CURIOUS, not with a document — a question, and NO
 *      tailor_cv / write_cover_letter tool fired on the opening turn (SPEC 1-2).
 *   2. The captured "why" PERSISTS — a durable note lands in profiles.data.memory
 *      after the user says what drew them to the role (SPEC 6).
 *
 * What it deliberately does NOT test: whether the question is GOOD or the tone
 * feels like a mentor. Voice/quality is Lexi's human read — never automatable.
 *
 * Gated exactly like advisor-agency.prod.spec.ts: needs Upstash + Anthropic creds
 * in the server env (present in .env.local, loaded by `next start`). Opt in with
 * E2E_LIVE_DEPS=1 so it costs no Anthropic spend on the pre-commit gate.
 */

let cookies: Cookie[];
let userId: string;

const LIVE_DEPS = process.env.E2E_LIVE_DEPS === '1';
const SKIP_REASON =
  'Needs Upstash + Anthropic creds in the server env — set E2E_LIVE_DEPS=1 against a credentialed server.';

// A weak-fit role, seeded the way SidePanel.handleInterested saves it, so the
// advisor holds the real listing + fit score in buildUserContext.
const WEAK_FIT_JOB = {
  id: 'e2e-investment-analyst-redwood',
  title: 'Investment Analyst',
  company: 'Redwood Capital',
  location: 'London',
  description:
    'Investment Analyst at Redwood Capital. Requires a 2:1 in finance or economics, 2+ years buy-side experience, and strong financial modelling.',
  relevanceReason: 'Limited overlap with their background.',
  relevanceScore: 3,
  status: 'interested',
};

async function seedSavedJob() {
  const admin = adminClient();
  await admin
    .from('saved_jobs')
    .upsert(
      { user_id: userId, job_id: WEAK_FIT_JOB.id, job_data: WEAK_FIT_JOB },
      { onConflict: 'user_id,job_id' }
    );
}

test.beforeAll(async () => {
  if (!LIVE_DEPS) return;
  cookies = await seedAuthCookies();
  userId = await getTestUserId();
});

test('Interested opens curious — a question, and no document tool fires', async ({ browser }) => {
  test.skip(!LIVE_DEPS, SKIP_REASON);
  await seedSavedJob();

  const context = await browser.newContext();
  await context.addCookies(cookies);

  // The exact opener SidePanel.handleInterested dispatches after saving the role.
  const res = await context.request.post('/api/chat', {
    data: {
      messages: [
        { role: 'user', content: `I'm interested in the ${WEAK_FIT_JOB.title} role at ${WEAK_FIT_JOB.company}.` },
      ],
    },
  });
  expect(res.ok(), `chat failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();

  const text = (body.content as Array<{ type: string; text?: string }>)
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');

  // Criteria 1-2: curious-first. The opener must NOT jump to a document — no
  // tailor_cv / write_cover_letter ran (those surface as meridianActions echoes).
  const actions = (body.meridianActions ?? []) as string[];
  const docJump = actions.find((a) => /tailor|cover letter/i.test(a));
  expect(docJump, `Advisor jumped to a document on the opening turn: "${docJump}"`).toBeFalsy();

  // It engages, and it opens a thread rather than closing one — a question.
  expect(text.trim().length, 'Advisor opened with empty text').toBeGreaterThan(0);
  expect(text.includes('?'), `No question in the opener: "${text}"`).toBeTruthy();

  await context.close();
});

test('The "why" persists — a durable note lands in the profile', async ({ browser }) => {
  test.skip(!LIVE_DEPS, SKIP_REASON);
  const admin = adminClient();
  // Start from clean memory so the assertion can't pass on a stale note.
  await admin
    .from('profiles')
    .upsert({ id: userId, data: { memory: [] }, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  const context = await browser.newContext();
  await context.addCookies(cookies);

  // A short mentoring exchange where the user states a distinctive, durable "why".
  const res = await context.request.post('/api/chat', {
    data: {
      messages: [
        { role: 'user', content: `I'm interested in the ${WEAK_FIT_JOB.title} role at ${WEAK_FIT_JOB.company}.` },
        { role: 'assistant', content: 'What drew you to this one?' },
        {
          role: 'user',
          content:
            "Honestly it's the mission. After volunteering at a homelessness charity, I want work that genuinely helps people, that's what matters most to me.",
        },
      ],
    },
  });
  expect(res.ok(), `chat failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  // The route awaits the memory write before responding, so it's already saved.
  const { data, error } = await admin.from('profiles').select('data').eq('id', userId).maybeSingle();
  expect(error, `profile read failed: ${error?.message}`).toBeFalsy();
  const memory = (data?.data?.memory ?? []) as Array<{ note: string }>;
  const hit = memory.some((m) => /mission|helps? people|homelessness|purpose|charit/i.test(m.note));
  expect(hit, `No memory note captured the why. Memory: ${JSON.stringify(memory)}`).toBeTruthy();

  await context.close();
});
