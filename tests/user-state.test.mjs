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
  displayNameForUI,
  firstName,
  isClosedStage,
  formatBoardForAdvisor,
  formatBoardForRecap,
  activeDirections,
} from "../src/lib/user-state.ts";
import { roleKey, isInApplications } from "../src/lib/role-key.ts";

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

test("displayNameForUI: preferred wins, else full name kept (not just first name)", () => {
  assert.equal(displayNameForUI("Lexi", "Alexandra Rosenthal"), "Lexi");
  assert.equal(displayNameForUI("", "Alexandra Rosenthal"), "Alexandra Rosenthal");
  assert.equal(displayNameForUI(null, ""), "");
});

test("activeDirections: a rejected direction drops off the page", () => {
  const dirs = [{ title: "Behavioural research" }, { title: "Consulting" }, { title: "UX research" }];
  const feedback = [{ direction: "consulting", status: "rejected" }, { direction: "UX research", status: "preferred" }];
  const out = activeDirections(dirs, feedback).map((d) => d.title);
  assert.deepEqual(out, ["Behavioural research", "UX research"]);
});

test("activeDirections: no feedback returns all (and same array)", () => {
  const dirs = [{ title: "A" }, { title: "B" }];
  assert.deepEqual(activeDirections(dirs, []).map((d) => d.title), ["A", "B"]);
  assert.deepEqual(activeDirections(dirs, undefined).map((d) => d.title), ["A", "B"]);
});

test("isInApplications: matches a UI-saved role by live id", () => {
  const ids = new Set(["12345"]);
  assert.equal(isInApplications({ id: 12345, title: "Data Analyst", company: "Acme" }, ids, new Set()), true);
  assert.equal(isInApplications({ id: 99999, title: "Other", company: "X" }, ids, new Set()), false);
});

test("isInApplications: matches an advisor-saved role by roleKey when ids differ", () => {
  // Advisor saved 'Data Analyst at Acme' under a synthetic chat-<slug> id; the live
  // listing has a numeric id, so only the roleKey can connect them.
  const keys = new Set([roleKey("Data Analyst", "Acme")]);
  assert.equal(isInApplications({ id: 555, title: "Data Analyst", company: "Acme" }, new Set(), keys), true);
  assert.equal(isInApplications({ id: 555, title: "Data Analyst", company: "Beta" }, new Set(), keys), false);
});
