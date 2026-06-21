import { test, expect, type Cookie } from '@playwright/test';
import { seedAuthCookies, adminClient, getTestUserId } from './helpers/seedAuth';

/**
 * Advisor agency + memory — proves the Session 41 spine.
 *
 * The product's claim is "when Arlo says done, something changed." This drives
 * the real /api/chat tool loop end to end: a message that should make Arlo use
 * its `remember` tool, then asserts the durable note actually landed in the
 * user's profile (profiles.data.memory). It also proves Arlo initiates — opens
 * the conversation unprompted.
 *
 * Gated, like profile-roundtrip, on: the 20260612_profiles.sql migration being
 * applied (memory lives in profiles.data) AND ANTHROPIC_API_KEY in the server's
 * env (loaded from .env.local by `next start`). Runs under test:e2e:prod only —
 * never the pre-commit gate — so it costs no Anthropic spend per commit.
 */

let cookies: Cookie[];
let userId: string;

test.beforeAll(async () => {
  cookies = await seedAuthCookies();
  userId = await getTestUserId();
});

test('Arlo initiates — opens the conversation unprompted', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies(cookies);

  const res = await context.request.post('/api/chat', { data: { initiate: true } });
  expect(res.ok(), `initiate failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  const body = await res.json();
  const text = (body.content as Array<{ type: string; text?: string }>)
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');
  expect(text.trim().length, 'Arlo opened with empty text').toBeGreaterThan(0);

  await context.close();
});

test('Arlo remembers — a durable fact persists to the profile', async ({ browser }) => {
  const admin = adminClient();
  // Start from a clean memory so the assertion can't pass on a stale note.
  await admin
    .from('profiles')
    .upsert({ id: userId, data: { memory: [] }, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  const context = await browser.newContext();
  await context.addCookies(cookies);

  // A concrete, quotable fact with a distinctive proper noun the model will keep.
  const res = await context.request.post('/api/chat', {
    data: {
      messages: [
        {
          role: 'user',
          content:
            'One thing to hold on to for next time: I will only ever work in the town of Llanfairpwll. Please remember that.',
        },
      ],
    },
  });
  expect(res.ok(), `chat failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  // The route awaits the memory write before responding, so it's already saved.
  const { data, error } = await admin.from('profiles').select('data').eq('id', userId).maybeSingle();
  expect(error, `profile read failed: ${error?.message}`).toBeFalsy();
  const memory = (data?.data?.memory ?? []) as Array<{ note: string }>;
  const hit = memory.some((m) => /llanfairpwll/i.test(m.note));
  expect(hit, `No memory note captured the fact. Memory: ${JSON.stringify(memory)}`).toBeTruthy();

  await context.close();
});
