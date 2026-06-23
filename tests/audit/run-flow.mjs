/**
 * Runtime flow audit — drives the real UI to catch what code review can't:
 * console errors, dead nav items, blank states, and key-state screenshots.
 *
 * Unauth path: first-session workspace (the new-user "click" shell).
 * Authed path: returning workspace via seedAuthCookies — clicks every nav item,
 * records console errors and whether each click changed the view.
 *
 * Run: dev server up on :3000, then `node tests/audit/run-flow.mjs`.
 * Screenshots + findings → tests/audit/results/.
 */
import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { seedAuthCookies } from "../helpers/seedAuth.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(__dirname, "results/shots");
mkdirSync(SHOTS, { recursive: true });
const BASE = "http://localhost:3000";
const findings = [];
const add = (sev, dim, msg) => findings.push({ sev, dim, msg });

function attachConsole(page, label) {
  page.on("console", (m) => {
    if (m.type() === "error") {
      const t = m.text();
      // Ignore known-noisy dev-only warnings.
      if (/Download the React DevTools|hydration|Adzuna credentials/i.test(t)) return;
      add("WARN", "console", `[${label}] console error: ${t.slice(0, 160)}`);
    }
  });
  page.on("pageerror", (e) => add("FAIL", "runtime", `[${label}] page crash: ${String(e).slice(0, 160)}`));
}

async function run() {
  const browser = await chromium.launch();

  // ---- Unauth: first-session workspace ----
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    attachConsole(page, "first");
    await page.goto(`${BASE}/workspace?view=first`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    // The "E" avatar bug: an avatar showing a letter before we know the user.
    const avatars = await page.locator('[class*="av"]').allTextContents();
    const strayInitials = avatars.map((a) => a.trim()).filter((a) => /^[A-Z]$/.test(a));
    if (strayInitials.length) add("FAIL", "first-session", `Avatar shows a stray initial before auth: ${[...new Set(strayInitials)].join(", ")} (the "E" bug).`);
    // In-app wordmark consistency.
    const bodyText = await page.locator("body").innerText();
    if (/Career Intelligence/.test(bodyText)) add("WARN", "branding", `In-app text still says "Career Intelligence" while the landing page says "Meridian".`);
    await page.screenshot({ path: resolve(SHOTS, "first-arrival.png"), fullPage: true });
    await ctx.close();
  }

  // ---- Authed: returning workspace, click every nav item ----
  {
    let cookies;
    try {
      cookies = await seedAuthCookies();
    } catch (e) {
      add("WARN", "harness", `Could not seed auth (skipping authed pass): ${e.message}`);
      await browser.close();
      finish();
      return;
    }
    const ctx = await browser.newContext();
    await ctx.addCookies(cookies);
    const page = await ctx.newPage();
    attachConsole(page, "returning");
    await page.goto(`${BASE}/workspace`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: resolve(SHOTS, "returning-home.png"), fullPage: true });

    // Click each left-nav item; record whether the visible content changed.
    const navLabels = ["Roles", "Your direction", "Documents", "Profile", "Today"];
    for (const label of navLabels) {
      const btn = page.locator(`nav button:has-text("${label}")`).first();
      const exists = await btn.count();
      if (!exists) { add("WARN", "nav", `Nav item "${label}" not found.`); continue; }
      const disabled = await btn.isDisabled().catch(() => false);
      const before = await page.locator("body").innerText();
      await btn.click({ timeout: 3000 }).catch(() => add("WARN", "nav", `Nav item "${label}" click failed.`));
      await page.waitForTimeout(700);
      const after = await page.locator("body").innerText();
      if (!disabled && before === after) {
        add("WARN", "nav", `Clicking "${label}" produced no visible change (possible dead nav item).`);
      }
      await page.screenshot({ path: resolve(SHOTS, `nav-${label.replace(/\s+/g, "-").toLowerCase()}.png`) });
    }
    await ctx.close();
  }

  await browser.close();
  finish();
}

function finish() {
  const path = resolve(__dirname, "results/flow.json");
  writeFileSync(path, JSON.stringify({ ranAt: new Date().toISOString(), findings }, null, 2));
  console.log("\n=== RUNTIME FLOW DIGEST ===");
  if (!findings.length) console.log("  ✓ no findings");
  findings.forEach((f) => console.log(`  [${f.sev}] (${f.dim}) ${f.msg}`));
  console.log(`\nScreenshots → ${SHOTS}`);
  console.log(`Wrote ${path}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
