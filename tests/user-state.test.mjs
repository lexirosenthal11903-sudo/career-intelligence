/**
 * Drift guard for the single source of truth (src/lib/user-state.ts). These assert the
 * behaviour the whole STATE-SYNC-AUDIT consolidation rests on: the board formatters and
 * the name resolver, so a future change can't silently re-introduce advisor-vs-screen drift.
 * Run: `node --test tests/user-state.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveDisplayName,
  firstName,
  isClosedStage,
  formatBoardForAdvisor,
  formatBoardForRecap,
} from "../src/lib/user-state.ts";

test("resolveDisplayName: preferredName always wins over the formal signup name", () => {
  assert.equal(resolveDisplayName("Lexi", "Alexandra Rosenthal"), "Lexi");
});

test("resolveDisplayName: falls back to the first name when no preferred name", () => {
  assert.equal(resolveDisplayName("", "Alexandra Rosenthal"), "Alexandra");
  assert.equal(resolveDisplayName(null, "Tom Hardy"), "Tom");
});

test("resolveDisplayName: ignores an email-like signup name", () => {
  assert.equal(resolveDisplayName(null, "lexi@example.com"), "");
});

test("firstName: takes the first token only", () => {
  assert.equal(firstName("Alexandra Rosenthal"), "Alexandra");
  assert.equal(firstName(""), "");
});

test("isClosedStage: rejected and archive are closed, live stages are not", () => {
  assert.equal(isClosedStage("rejected"), true);
  assert.equal(isClosedStage("archive"), true);
  assert.equal(isClosedStage("offer"), false);
  assert.equal(isClosedStage("applied"), false);
});

test("formatBoardForAdvisor: includes closed stages and the board-is-truth instruction", () => {
  const line = formatBoardForAdvisor([
    { title: "Data Analyst", company: "Acme", stage: "offer" },
    { title: "Marketing Coordinator", company: "Beta", stage: "rejected" },
  ]);
  assert.match(line, /Data Analyst at Acme: has an OFFER/);
  assert.match(line, /Marketing Coordinator at Beta: didn't get it/);
  assert.match(line, /only source of truth/i);
});

test("formatBoardForAdvisor: empty board returns empty string", () => {
  assert.equal(formatBoardForAdvisor([]), "");
});

test("formatBoardForRecap: drops closed stages so a rejection isn't 'where we got to'", () => {
  const out = formatBoardForRecap([
    { title: "Data Analyst", company: "Acme", stage: "interview" },
    { title: "Marketing Coordinator", company: "Beta", stage: "rejected" },
    { title: "Ops Associate", company: "Gamma", stage: "archive" },
  ]);
  assert.match(out, /Data Analyst at Acme: at interview stage/);
  assert.doesNotMatch(out, /Marketing Coordinator/); // rejected, excluded
  assert.doesNotMatch(out, /Ops Associate/);          // archived, excluded
});
