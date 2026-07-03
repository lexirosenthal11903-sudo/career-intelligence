/**
 * Unit guard for mergePrepQuestions — the decision behind "save_interview_prep is safe to
 * call again": a later focus-note write must never wipe answers the USER has edited, and a
 * focus-note-only call must never drop the question set. (SPEC — interview-prep-artifact.)
 * Run: `node --test tests/interview-prep.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergePrepQuestions } from "../src/lib/interview-prep.ts";

test("no incoming questions (focus-note-only call) → keep the existing set untouched", () => {
  const existing = [{ q: "Why this company?", a: "My real answer" }];
  assert.deepEqual(mergePrepQuestions(existing, []), existing);
});

test("incoming answers are used when provided", () => {
  const out = mergePrepQuestions([], [{ question: "Tell me about a project", answer: "Seeded draft" }]);
  assert.deepEqual(out, [{ q: "Tell me about a project", a: "Seeded draft" }]);
});

test("blank incoming answer keeps the user's existing edited answer (never wiped)", () => {
  // The advisor re-saves the question set (e.g. after a mock) with no answer text; the
  // user's own answer must survive.
  const existing = [{ q: "Why this company?", a: "The answer I carefully wrote" }];
  const incoming = [{ question: "Why this company?", answer: "" }];
  assert.deepEqual(mergePrepQuestions(existing, incoming), [
    { q: "Why this company?", a: "The answer I carefully wrote" },
  ]);
});

test("question match is case- and whitespace-insensitive when preserving an answer", () => {
  const existing = [{ q: "Why  This  Company?", a: "kept" }];
  const incoming = [{ question: "why this company?" }];
  assert.deepEqual(mergePrepQuestions(existing, incoming), [{ q: "why this company?", a: "kept" }]);
});

test("empty-question entries are dropped", () => {
  const out = mergePrepQuestions([], [{ question: "  ", answer: "orphan" }, { question: "Real?", answer: "" }]);
  assert.deepEqual(out, [{ q: "Real?", a: "" }]);
});

test("a genuinely revised question set replaces old questions (no stale carryover)", () => {
  const existing = [{ q: "Old question", a: "old answer" }];
  const incoming = [{ question: "New question", answer: "new" }];
  assert.deepEqual(mergePrepQuestions(existing, incoming), [{ q: "New question", a: "new" }]);
});

test("sanitise is applied to advisor text (em dashes stripped) but the shape is preserved", () => {
  const strip = (s) => s.replace(/—/g, "-");
  const out = mergePrepQuestions([], [{ question: "A — B", answer: "x — y" }], strip);
  assert.deepEqual(out, [{ q: "A - B", a: "x - y" }]);
});
