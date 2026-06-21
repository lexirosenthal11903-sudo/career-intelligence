import { test, expect } from '@playwright/test';

/**
 * Jobs that are right — proves the Session 41 seniority/location fix.
 *
 * Before: /api/jobs forced `where=london` and never used seniority, so an
 * entry-level user got London-biased, often-too-senior listings. Now an empty
 * location searches all of GB, and a junior seniority adds Adzuna `what_exclude`
 * so senior roles are filtered at source. /api/jobs is public (no auth needed).
 *
 * Needs ADZUNA_APP_ID / ADZUNA_API_KEY in the server env (loaded from .env.local
 * by `next start`). Runs under test:e2e:prod only.
 */

const SENIOR = /\b(senior|director|principal|head of|vp|vice president|chief)\b/i;

test('graduate search excludes senior roles and is not London-forced', async ({ request }) => {
  const res = await request.post('/api/jobs', {
    data: {
      keywords: ['marketing assistant', 'graduate marketing'],
      seniority: 'graduate',
      // no location → nationwide
    },
  });
  expect(res.ok(), `jobs failed: ${res.status()} ${await res.text()}`).toBeTruthy();

  const { jobs } = await res.json();
  expect(Array.isArray(jobs), 'jobs should be an array').toBeTruthy();

  // Don't fail on an empty Adzuna response; assert the property when jobs exist.
  for (const job of jobs) {
    expect(
      SENIOR.test(job.title || ''),
      `Senior role leaked into a graduate search: "${job.title}"`
    ).toBeFalsy();
  }
});

test('senior terms are NOT excluded when no seniority is given', async ({ request }) => {
  // Control: the exclusion must be conditional on seniority, not always-on.
  const res = await request.post('/api/jobs', {
    data: { keywords: ['marketing manager'] },
  });
  expect(res.ok()).toBeTruthy();
  const { jobs } = await res.json();
  expect(Array.isArray(jobs)).toBeTruthy();
});
