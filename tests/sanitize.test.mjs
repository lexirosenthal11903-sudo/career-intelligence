/**
 * Unit guard for the em-dash sanitiser — the deterministic backstop for the
 * "no em dashes" voice rule the model keeps breaking.
 * Run: `node --test tests/sanitize.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripDashes } from "../src/lib/sanitize.ts";

test("spaced em dash becomes a comma", () => {
  assert.equal(
    stripDashes("the work you liked best had people in it — not spreadsheets."),
    "the work you liked best had people in it, not spreadsheets."
  );
});

test("numeric range keeps a hyphen, not a comma", () => {
  assert.equal(stripDashes("a 15–20 minute chat"), "a 15-20 minute chat");
  assert.equal(stripDashes("140—290 applications"), "140-290 applications");
});

test("en dash between words becomes a comma", () => {
  assert.equal(stripDashes("warm first – cold later"), "warm first, cold later");
});

test("no double comma when text already had one", () => {
  assert.equal(stripDashes("first, second — third"), "first, second, third");
});

test("does not strand a comma before a full stop", () => {
  assert.equal(stripDashes("that's the whole point —."), "that's the whole point.");
});

test("leaves ordinary hyphens and clean text untouched", () => {
  assert.equal(stripDashes("early-career, low-key, ready-to-send"), "early-career, low-key, ready-to-send");
  assert.equal(stripDashes("no dashes here at all"), "no dashes here at all");
});

test("handles empty / undefined safely", () => {
  assert.equal(stripDashes(""), "");
  assert.equal(stripDashes(undefined), undefined);
});

test("strips multiple em dashes in one reply", () => {
  assert.equal(
    stripDashes("Stop thinking — do one thing — then come back."),
    "Stop thinking, do one thing, then come back."
  );
});
