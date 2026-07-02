/**
 * Unit guard for applicationExistsFor — the decision behind "prep auto-saves, never
 * auto-advances" (SPEC — one record, two lenses). A prep action (tailor CV, draft
 * outreach) must create the application ONLY if the role isn't already tracked under
 * EITHER a live-listing id OR a synthetic chat-<slug> id — otherwise it would spawn a
 * duplicate row and (worse) could reset a stage that has already moved on.
 * Run: `node --test tests/application-exists.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { applicationExistsFor } from "../src/lib/role-key.ts";

test("no applications → does not exist (prep should create)", () => {
  assert.equal(applicationExistsFor([], "chat-analyst-acme", "Analyst", "Acme"), false);
});

test("matches on exact job_id (UI-saved under a listing id)", () => {
  const apps = [{ job_id: "12345", job_data: { title: "Data Analyst", company: "Globex" } }];
  // Same listing id → already tracked, even if the title/company we pass differs.
  assert.equal(applicationExistsFor(apps, "12345", "Anything", "Else"), true);
});

test("matches on roleKey when the id differs (advisor-saved vs listing id)", () => {
  // Saved under a synthetic chat id; a prep action arrives with the listing id but the
  // SAME title+company. Must resolve to the existing record, not create a duplicate.
  const apps = [{ job_id: "chat-product-analyst-acme", job_data: { title: "Product Analyst", company: "Acme" } }];
  assert.equal(applicationExistsFor(apps, "99999", "Product Analyst", "Acme"), true);
});

test("roleKey match is case- and whitespace-insensitive", () => {
  const apps = [{ job_id: "chat-x", job_data: { title: "Product  Analyst", company: "ACME" } }];
  assert.equal(applicationExistsFor(apps, "n/a", "product analyst", "acme"), true);
});

test("different role → does not exist (a genuinely new prep target creates)", () => {
  const apps = [{ job_id: "chat-analyst-acme", job_data: { title: "Analyst", company: "Acme" } }];
  assert.equal(applicationExistsFor(apps, "chat-designer-initech", "Designer", "Initech"), false);
});

test("missing company on both sides still matches by title", () => {
  const apps = [{ job_id: "chat-analyst", job_data: { title: "Analyst" } }];
  assert.equal(applicationExistsFor(apps, "other-id", "Analyst", ""), true);
});

test("null/absent job_data is handled without throwing", () => {
  const apps = [{ job_id: "x", job_data: null }, { job_id: "y" }];
  assert.equal(applicationExistsFor(apps, "z", "Analyst", "Acme"), false);
});
