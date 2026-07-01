/**
 * Unit guard for the outreach model — the follow-up timing and the advisor context
 * line. The follow-up is the whole differentiator (one gentle chase after a working
 * week of silence, then stop), so its arithmetic is worth pinning.
 * Run: `node --test tests/outreach.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  businessDaysBetween,
  readyForFollowUp,
  formatOutreachForAdvisor,
  isOutreachStatus,
  FOLLOW_UP_AFTER_BUSINESS_DAYS,
} from "../src/lib/outreach.ts";

// A Monday, so we can reason about weekends deterministically.
const MON = new Date("2026-06-01T09:00:00Z"); // 2026-06-01 is a Monday

test("businessDaysBetween excludes weekends", () => {
  // Mon → next Mon is 5 business days (Tue,Wed,Thu,Fri,Mon), the weekend doesn't count.
  const nextMon = new Date("2026-06-08T09:00:00Z");
  assert.equal(businessDaysBetween(MON, nextMon), 5);
});

test("businessDaysBetween is 0 when end precedes start", () => {
  assert.equal(businessDaysBetween(MON, new Date("2026-05-30T09:00:00Z")), 0);
});

test("readyForFollowUp: not until a full working week has passed", () => {
  const entry = { roleTitle: "Analyst", status: "sent", sentAt: MON.toISOString() };
  // 3 business days later (Thursday) — too soon.
  assert.equal(readyForFollowUp(entry, new Date("2026-06-04T09:00:00Z")), false);
  // 5 business days later (next Monday) — the earliest honest nudge.
  assert.equal(readyForFollowUp(entry, new Date("2026-06-08T09:00:00Z")), true);
});

test("readyForFollowUp: only 'sent' with a sentAt is ever a candidate", () => {
  const late = new Date("2026-07-01T09:00:00Z");
  assert.equal(readyForFollowUp({ roleTitle: "A", status: "to_send", sentAt: null }, late), false);
  assert.equal(readyForFollowUp({ roleTitle: "A", status: "replied", sentAt: MON.toISOString() }, late), false);
  assert.equal(readyForFollowUp({ roleTitle: "A", status: "no_reply", sentAt: MON.toISOString() }, late), false);
  assert.equal(readyForFollowUp({ roleTitle: "A", status: "sent", sentAt: null }, late), false);
});

test("FOLLOW_UP_AFTER_BUSINESS_DAYS matches research (5 business days)", () => {
  assert.equal(FOLLOW_UP_AFTER_BUSINESS_DAYS, 5);
});

test("formatOutreachForAdvisor: empty when nothing live", () => {
  assert.equal(formatOutreachForAdvisor([]), "");
  assert.equal(
    formatOutreachForAdvisor([{ roleTitle: "A", status: "replied", sentAt: MON.toISOString() }]),
    ""
  );
});

test("formatOutreachForAdvisor: surfaces the follow-up moment only when due", () => {
  const entry = { roleTitle: "PM", company: "Acme", status: "sent", sentAt: MON.toISOString() };
  const tooSoon = formatOutreachForAdvisor([entry], new Date("2026-06-03T09:00:00Z"));
  assert.match(tooSoon, /PM at Acme: message sent, no reply yet/);
  assert.doesNotMatch(tooSoon, /gentle follow-up/);

  const due = formatOutreachForAdvisor([entry], new Date("2026-06-08T09:00:00Z"));
  assert.match(due, /working week has now passed/);
  assert.match(due, /ONE gentle follow-up/);
});

test("formatOutreachForAdvisor: a to_send draft reads as not sent", () => {
  const line = formatOutreachForAdvisor([{ roleTitle: "Designer", status: "to_send", sentAt: null }]);
  assert.match(line, /Designer: drafted, not sent yet/);
});

test("isOutreachStatus guards the enum", () => {
  assert.equal(isOutreachStatus("sent"), true);
  assert.equal(isOutreachStatus("replied"), true);
  assert.equal(isOutreachStatus("bogus"), false);
  assert.equal(isOutreachStatus(null), false);
});
