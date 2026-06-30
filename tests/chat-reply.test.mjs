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

test("FIX: silent turn after a committed action → warm ack, never the cold error", () => {
  const replacement = ackForSilentCommit([], 1, ACK);
  assert.deepEqual(replacement, [{ type: "text", text: ACK }]);
  assert.equal(clientText(replacement), ACK);
  assert.notEqual(clientText(replacement), ERROR_MSG);
});

test("whitespace-only text also counts as silent", () => {
  const replacement = ackForSilentCommit([{ type: "text", text: "   \n" }], 2, ACK);
  assert.deepEqual(replacement, [{ type: "text", text: ACK }]);
});

test("a real reply is never overridden, even with a committed action", () => {
  const real = [{ type: "text", text: "Saved that — want me to line up roles next?" }];
  assert.equal(ackForSilentCommit(real, 1, ACK), null);
  assert.equal(clientText(real), "Saved that — want me to line up roles next?");
});

test("no action committed → not our case; model's own (empty) content stands", () => {
  // A genuinely empty turn with nothing committed is the client's error to surface;
  // we only rescue committed actions.
  assert.equal(ackForSilentCommit([], 0, ACK), null);
});

test("hasText: detects usable text, ignores empty/non-text blocks", () => {
  assert.equal(hasText([{ type: "text", text: "hi" }]), true);
  assert.equal(hasText([{ type: "text", text: "  " }]), false);
  assert.equal(hasText([{ type: "tool_use", name: "x" }]), false);
  assert.equal(hasText([]), false);
  assert.equal(hasText(undefined), false);
});
