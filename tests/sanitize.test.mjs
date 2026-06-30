/**
 * Unit guard for the em-dash sanitiser — the deterministic backstop for the
 * "no em dashes" voice rule the model keeps breaking.
 * Run: `node --test tests/sanitize.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripDashes, stripTimeOfDay, applyName } from "../src/lib/sanitize.ts";

test("stripTimeOfDay: 'this morning' becomes 'today' (the reported 10pm bug)", () => {
  assert.equal(stripTimeOfDay("Can you start it this morning?"), "Can you start it today?");
});

test("applyName: substitutes the {NAME} token with the resolved name", () => {
  assert.equal(applyName("Welcome back, {NAME}.", "Alexandra"), "Welcome back, Alexandra.");
});

test("applyName: a preferred name (Lexi) renders verbatim, never shortened by the model", () => {
  assert.equal(applyName("Good to see you, {NAME}.", "Lexi"), "Good to see you, Lexi.");
});

test("applyName: no name -> the token and its address punctuation are tidied away", () => {
  assert.equal(applyName("Welcome back, {NAME}.", ""), "Welcome back.");
  assert.equal(applyName("Hi {NAME}, good to see you.", null), "Hi, good to see you.");
});

test("applyName: no name, token at the START -> no stranded leading comma/colon", () => {
  assert.equal(applyName("{NAME}, welcome back.", ""), "Welcome back.");
  assert.equal(applyName("{NAME}: here is where we are.", null), "Here is where we are.");
});

test("applyName: text without the token is returned untouched", () => {
  assert.equal(applyName("Good to see you again.", "Alexandra"), "Good to see you again.");
});

test("stripTimeOfDay: tonight/this evening/this afternoon all neutralise to today", () => {
  assert.equal(stripTimeOfDay("read it tonight"), "read it today");
  assert.equal(stripTimeOfDay("let's pick it up this evening"), "let's pick it up today");
  assert.equal(stripTimeOfDay("have a go this afternoon"), "have a go today");
});

test("stripTimeOfDay: capitalises at the start of a sentence", () => {
  assert.equal(stripTimeOfDay("This morning, make a start."), "Today, make a start.");
  assert.equal(stripTimeOfDay("Good morning, Sam."), "Hello, Sam.");
});

test("stripTimeOfDay: leaves neutral and unrelated text untouched", () => {
  assert.equal(stripTimeOfDay("make a start today"), "make a start today");
  assert.equal(stripTimeOfDay("a morning person"), "a morning person");
});

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
