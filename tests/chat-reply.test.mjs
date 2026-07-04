/**
 * Guards the "cold error on a successful action" fix (src/lib/chat-reply.ts).
 *
 * Reproduces the Session 45 live-test find: a tool action commits this turn, then
 * the model's final turn ends with NO usable text. The client computes
 * `content.filter(text).map(text).join("") || ERROR_MSG`, so empty content shows
 * the cold error next to the success echo. `ackForSilentCommit` substitutes a warm
 * acknowledgement instead — but only in that one case.
 *
 * Run: `node --test tests/chat-reply.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasText, ackForSilentCommit } from "../src/lib/chat-reply.ts";

const ACK = "Done, I've got that for you.";
const ERROR_MSG = "Something went wrong on my end — say that again?";

// The exact client-side reduction from useArloChat.ts: what the user actually sees.
const clientText = (content) =>
  (content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("") || ERROR_MSG;

test("REPRO: empty final content + a committed action would show the cold error", () => {
  // The model committed update_profile on round 1, then returned end_turn with no
  // words on round 2. Before the fix, the route passed this straight through.
  const emptyContent = [];
  assert.equal(
    clientText(emptyContent),
    ERROR_MSG,
    "the unfixed path strands a success behind the cold error"
  );
});

test("FIX: silent turn after a committed action → warm ack that NAMES the action", () => {
  const replacement = ackForSilentCommit([], ["Saved interview prep for Data Analyst at Sagacity"], ACK);
  assert.deepEqual(replacement, [{ type: "text", text: "Done. Saved interview prep for Data Analyst at Sagacity." }]);
  assert.notEqual(clientText(replacement), ERROR_MSG);
});

test("a leading tick and trailing full stop are cleaned before naming", () => {
  const replacement = ackForSilentCommit([], ["✓ Updated your profile."], ACK);
  assert.deepEqual(replacement, [{ type: "text", text: "Done. Updated your profile." }]);
});

test("multiple committed actions are all named", () => {
  const replacement = ackForSilentCommit([], ["Tailored CV for X", "Saved interview prep for X"], ACK);
  assert.deepEqual(replacement, [{ type: "text", text: "Done. Tailored CV for X; Saved interview prep for X." }]);
});

test("actions present but unusable (empty after cleaning) → generic fallback line", () => {
  const replacement = ackForSilentCommit([], ["✓", "  "], ACK);
  assert.deepEqual(replacement, [{ type: "text", text: ACK }]);
});

test("whitespace-only text also counts as silent", () => {
  const replacement = ackForSilentCommit([{ type: "text", text: "   \n" }], ["Saved a role"], ACK);
  assert.deepEqual(replacement, [{ type: "text", text: "Done. Saved a role." }]);
});

test("a real reply is never overridden, even with a committed action", () => {
  const real = [{ type: "text", text: "Saved that, want me to line up roles next?" }];
  assert.equal(ackForSilentCommit(real, ["Saved a role"], ACK), null);
  assert.equal(clientText(real), "Saved that, want me to line up roles next?");
});

test("no action committed → not our case; model's own (empty) content stands", () => {
  // A genuinely empty turn with nothing committed is the client's error to surface;
  // we only rescue committed actions.
  assert.equal(ackForSilentCommit([], [], ACK), null);
});

test("hasText: detects usable text, ignores empty/non-text blocks", () => {
  assert.equal(hasText([{ type: "text", text: "hi" }]), true);
  assert.equal(hasText([{ type: "text", text: "  " }]), false);
  assert.equal(hasText([{ type: "tool_use", name: "x" }]), false);
  assert.equal(hasText([]), false);
  assert.equal(hasText(undefined), false);
});
