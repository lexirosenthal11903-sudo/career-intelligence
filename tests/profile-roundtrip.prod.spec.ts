import { test, expect, type Cookie } from '@playwright/test';
import { seedAuthCookies } from './helpers/seedAuth';

/**
 * Profile round-trip — proves the Session 41 `profiles` fix.
 *
 * Before the fix, /api/profile keyed on a `user_id` + `data` shape that does not
 * exist in the live table (it's keyed on `id`), so every PATCH/GET silently
 * failed in production and the profile feature — plus the advisor's memory of
 * what the user values — never worked. This logs in as a real seeded user,
 * writes profile data, and reads it back to prove it persists.
 */

let cookies: Cookie[];

test.beforeAll(async () => {
  cookies = await seedAuthCookies();
});

test('profile PATCH persists and GET reads it back', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies(cookies);

  // A value unique to this run, so a green result can't be a stale read.
  const aspiration = `lead a small team — run ${Date.now()}`;

  const patch = await context.request.patch('/api/profile', {
    data: { values: ['autonomy', 'impact'], aspiration },
  });
  expect(patch.ok(), `PATCH failed: ${patch.status()} ${await patch.text()}`).toBeTruthy();

  const patched = (await patch.json()).profile;
  expect(patched.aspiration).toBe(aspiration);
  expect(patched.values).toContain('autonomy');
  // Completeness must recompute, proving the merge path ran (not a no-op write).
  expect(patched.profileCompleteness).toBeGreaterThan(0);

  const get = await context.request.get('/api/profile');
  expect(get.ok(), `GET failed: ${get.status()}`).toBeTruthy();
  const read = (await get.json()).profile;
  expect(read.aspiration).toBe(aspiration);
  expect(read.values).toEqual(expect.arrayContaining(['autonomy', 'impact']));

  await context.close();
});
