/**
 * Unit guard for the Adzuna category mapping — the constraint that stops the
 * jobs search returning off-target noise (a design grad seeing a media lawyer).
 * Run: `node --test tests/adzuna-category.test.mjs`
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mapAdzunaCategory } from "../src/lib/adzunaCategory.ts";

test("design/arts profile → creative-design", () => {
  assert.equal(
    mapAdzunaCategory(["Art & Design", "Galleries"], ["Junior Brand Designer", "Gallery Coordinator"]),
    "creative-design-jobs"
  );
});

test("data/STEM profile → it-jobs", () => {
  assert.equal(
    mapAdzunaCategory(["Data & Analytics"], ["Junior Data Analyst", "Graduate Data Analyst"]),
    "it-jobs"
  );
});

test("finance / family office → accounting-finance", () => {
  assert.equal(mapAdzunaCategory(["Private wealth", "Family office"], []), "accounting-finance-jobs");
});

test("sustainability/climate → energy", () => {
  assert.equal(mapAdzunaCategory(["Sustainability", "Climate policy"], []), "energy-oil-gas-jobs");
});

test("falls back to titles, then keywords", () => {
  assert.equal(mapAdzunaCategory([], [], ["marketing", "content"]), "pr-advertising-marketing-jobs");
});

test("returns null when nothing matches (better unconstrained than wrong)", () => {
  assert.equal(mapAdzunaCategory(["Underwater basket weaving"], ["Widget Whisperer"]), null);
});
