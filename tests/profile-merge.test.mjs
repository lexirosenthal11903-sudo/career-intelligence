/**
 * Guards STATE-SYNC-AUDIT #13: update_profile must ADD newly-mentioned values/deal-breakers,
 * never replace the list (which silently dropped everything else the person had told us).
 * Run: `node --test tests/profile-merge.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeList } from "../src/lib/merge-list.ts";

test("adds a new item without dropping the existing ones (the data-loss bug)", () => {
  assert.deepEqual(
    mergeList(["autonomy", "good team"], ["remote work"]),
    ["autonomy", "good team", "remote work"]
  );
});

test("dedupes case-insensitively, keeps the existing casing/order", () => {
  assert.deepEqual(mergeList(["Autonomy"], ["autonomy", "Pay"]), ["Autonomy", "Pay"]);
});

test("trims blanks and ignores empty incoming", () => {
  assert.deepEqual(mergeList(["autonomy"], ["  ", ""]), ["autonomy"]);
});

test("an empty incoming list leaves the existing list intact", () => {
  assert.deepEqual(mergeList(["autonomy", "impact"], []), ["autonomy", "impact"]);
});

test("caps length so the list can't grow unbounded", () => {
  const existing = Array.from({ length: 20 }, (_, i) => `v${i}`);
  assert.equal(mergeList(existing, ["new"]).length, 20);
  assert.equal(mergeList(existing, ["new"]).includes("new"), false); // already full
});
