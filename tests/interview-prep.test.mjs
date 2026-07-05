/**
 * Unit guard for mergePrepQuestions. MENTOR, not vending machine (CLAUDE.md principle 7):
 * the advisor supplies the question, the coaching ("testing") and the structure ("scaffold")
 * — NEVER the answer. The user's own answer (`a`) is preserved across regeneration and is
 * never supplied by the incoming (advisor) set. Also guards the focus-note-only path.
 * Run: `node --test tests/interview-prep.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergePrepQuestions } from "../src/lib/interview-prep.ts";

test("no incoming questions (focus-note-only call) → keep the existing set untouched", () => {
  const existing = [{ q: "Why this company?", testing: "Do they get us?", scaffold: "S->T->A->R", a: "My real answer" }];
  assert.deepEqual(mergePrepQuestions(existing, []), existing);
});

test("incoming supplies question + coaching + scaffold, answer starts empty (never authored)", () => {
  const out = mergePrepQuestions([], [{ question: "Tell me about a project", testing: "Can you own work?", scaffold: "Situation -> Task -> Action -> Result" }]);
  assert.deepEqual(out, [{ q: "Tell me about a project", testing: "Can you own work?", scaffold: "Situation -> Task -> Action -> Result", a: "" }]);
});

test("the incoming set has NO answer field — a stray one is ignored, answer stays the user's", () => {
  // Even if some future/rogue input carried an "answer", merge must not adopt it.
  const out = mergePrepQuestions([], [{ question: "Q?", testing: "t", scaffold: "sc", answer: "AI-WRITTEN, MUST BE IGNORED" }]);
  assert.equal(out[0].a, "");
});

test("regeneration preserves the USER's own answer, refreshes coaching + scaffold", () => {
  const existing = [{ q: "Why this company?", testing: "old", scaffold: "old", a: "The answer I carefully wrote" }];
  const incoming = [{ question: "Why this company?", testing: "new coaching", scaffold: "new structure" }];
  assert.deepEqual(mergePrepQuestions(existing, incoming), [
    { q: "Why this company?", testing: "new coaching", scaffold: "new structure", a: "The answer I carefully wrote" },
  ]);
});

test("answer preservation matches question case- and whitespace-insensitively", () => {
  const existing = [{ q: "Why  This  Company?", testing: "t", scaffold: "sc", a: "kept" }];
  const incoming = [{ question: "why this company?", testing: "t2", scaffold: "sc2" }];
  assert.equal(mergePrepQuestions(existing, incoming)[0].a, "kept");
});

test("empty-question entries are dropped", () => {
  const out = mergePrepQuestions([], [{ question: "  ", testing: "x", scaffold: "y" }, { question: "Real?", testing: "t", scaffold: "sc" }]);
  assert.deepEqual(out, [{ q: "Real?", testing: "t", scaffold: "sc", a: "" }]);
});

test("a genuinely revised question set replaces old questions (no stale carryover of a)", () => {
  const existing = [{ q: "Old question", testing: "t", scaffold: "sc", a: "old answer" }];
  const incoming = [{ question: "New question", testing: "t", scaffold: "sc" }];
  assert.deepEqual(mergePrepQuestions(existing, incoming), [{ q: "New question", testing: "t", scaffold: "sc", a: "" }]);
});

test("sanitise is applied to advisor text (em dashes stripped), never to the user's answer", () => {
  const strip = (s) => s.replace(/—/g, "-");
  const existing = [{ q: "A - B", testing: "t", scaffold: "sc", a: "my answer — with a dash I chose" }];
  const out = mergePrepQuestions(existing, [{ question: "A — B", testing: "x — y", scaffold: "z" }], strip);
  assert.equal(out[0].q, "A - B");
  assert.equal(out[0].testing, "x - y");
  assert.equal(out[0].a, "my answer — with a dash I chose"); // user's own text untouched
});
