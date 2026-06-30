/**
 * Guards the autoscroll rule (src/lib/chat-scroll.ts): on a new message, bring its START
 * near the top, clamped so short content stays bottom-anchored. This is the exact rule
 * that regressed ("a long user message's start scrolled off the top on send"), tested
 * without a live chat turn. Run: `node --test tests/chat-scroll.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { anchorScrollTop } from "../src/lib/chat-scroll.ts";

// A container whose visible top is at viewport y=100, currently scrolled to 500, and can
// scroll up to 2000. Helper to vary only the target message's on-screen position.
const base = { scrollTop: 500, containerTop: 100, maxTop: 2000 };

test("long message: anchors its start near the top (below maxTop)", () => {
  // Target message currently sits 800px below the container top (far down the viewport).
  const top = anchorScrollTop({ ...base, targetTop: 100 + 800 });
  // desired = 500 + 800 - 16 = 1284, within [0, 2000] → used as-is (start pulled to top).
  assert.equal(top, 1284);
});

test("short message near the end: clamps to the bottom (stays above the composer)", () => {
  // The message is so far down that anchoring its top would exceed maxTop → clamp to bottom.
  const top = anchorScrollTop({ ...base, targetTop: 100 + 1700 });
  // desired = 500 + 1700 - 16 = 2184 > 2000 → clamped to 2000.
  assert.equal(top, base.maxTop);
});

test("message already above the fold: never scrolls to a negative offset", () => {
  // Target is above the container's visible top (negative delta) and we're near the start.
  const top = anchorScrollTop({ scrollTop: 5, containerTop: 100, maxTop: 2000, targetTop: 40 });
  // desired = 5 + (40 - 100) - 16 = -71 → clamped to 0.
  assert.equal(top, 0);
});

test("custom margin is respected", () => {
  const top = anchorScrollTop({ ...base, targetTop: 100 + 800, margin: 0 });
  assert.equal(top, 1300); // 500 + 800 - 0
});
