/**
 * Regression guard for audit #1 — the worst bug found in the 2026-06-22 audit:
 * the Haiku profile call sometimes returns `suggestedDirections` (etc.) as a
 * *stringified* JSON blob, which crashed /api/recap (`.filter is not a function`)
 * and blanked the first-session reveal. normalizeAnalysisResult must coerce these
 * back to real arrays at the write boundary so no consumer can crash.
 *
 * Run: `node --test tests/profile-normalize.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeAnalysisResult, toArray } from "../src/lib/profile-normalize.ts";

test("coerces a JSON-encoded string array back to an array", () => {
  assert.deepEqual(toArray('[{"title":"A","why":"b"}]'), [{ title: "A", why: "b" }]);
});

test("returns [] for unrecoverable prose rather than throwing", () => {
  assert.deepEqual(toArray("not json at all"), []);
});

test("passes real arrays through untouched", () => {
  const arr = [{ title: "X" }];
  assert.equal(toArray(arr), arr);
});

test("normalizeAnalysisResult fixes a stringified suggestedDirections so .filter is safe", () => {
  const result = {
    profile: {
      summary: "hi",
      suggestedDirections: '[{"title":"Behavioural research","why":"because"}]',
      topRoleTitles: '["Junior Analyst"]',
    },
  };
  const out = normalizeAnalysisResult(result);
  assert.ok(Array.isArray(out.profile.suggestedDirections));
  assert.equal(out.profile.suggestedDirections[0].title, "Behavioural research");
  assert.ok(Array.isArray(out.profile.topRoleTitles));
  // The exact crash from /api/recap must no longer be possible.
  assert.doesNotThrow(() => out.profile.suggestedDirections.filter((d) => d.title));
});

test("normalizeAnalysisResult turns malformed JSON into [] (no crash, degrades gracefully)", () => {
  const result = { profile: { suggestedDirections: '[{"title":"A"}]}]' } };
  const out = normalizeAnalysisResult(result);
  assert.deepEqual(out.profile.suggestedDirections, []);
});
