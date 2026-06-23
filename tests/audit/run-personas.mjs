/**
 * Persona matching-quality audit (AUDIT-PLAN §4/§5).
 *
 * Feeds each fixture persona's real CV + opening message to the live pipeline
 * (/api/analyse, then /api/jobs + /api/score for one persona) and checks the
 * output against that persona's honesty/seniority contract. Costs a few real
 * Anthropic + Adzuna calls — that's intentional; matching quality can't be
 * judged from mocks.
 *
 * Run: dev server up on :3000, then `node tests/audit/run-personas.mjs`.
 * Writes a JSON + console summary to tests/audit/results/.
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
// Node 23.6+ strips TS types natively, so the .ts fixture imports directly.
import { personas } from "../fixtures/personas.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.AUDIT_BASE || "http://localhost:3000";

async function analyse(persona) {
  const res = await fetch(`${BASE}/api/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvText: persona.cvText, direction: persona.direction }),
  });
  if (!res.ok || !res.body) throw new Error(`analyse HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = null;
  let errored = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      if (!chunk.startsWith("data: ")) continue;
      const ev = JSON.parse(chunk.slice(6));
      if (ev.event === "complete") result = ev.result;
      if (ev.event === "error") errored = ev.message;
    }
  }
  if (errored) throw new Error(`analyse error event: ${errored}`);
  if (!result) throw new Error("no complete event");
  return result;
}

function check(persona, result) {
  const findings = [];
  const p = result.profile || {};
  const directions = Array.isArray(p.suggestedDirections) ? p.suggestedDirections : [];
  const titles = (p.topRoleTitles || []).join(" | ");
  const dirText = directions.map((d) => `${d.title} :: ${d.why}`).join("\n");
  const haystack = `${titles}\n${dirText}`.toLowerCase();

  // 1. Seniority — forbidden senior titles must not appear in directions or role titles.
  for (const bad of persona.expect.forbiddenTitles) {
    if (haystack.includes(bad.toLowerCase())) {
      findings.push({ sev: "FAIL", dim: "seniority", msg: `Forbidden senior title "${bad}" surfaced for an entry-level profile.` });
    }
  }
  // Seniority level field sanity.
  const sl = (p.seniorityLevel || "").toLowerCase();
  if (persona.expect.seniority === "entry" && !/grad|entry|junior/.test(sl)) {
    findings.push({ sev: "WARN", dim: "seniority", msg: `seniorityLevel="${p.seniorityLevel}" — expected graduate/entry.` });
  }

  // 2. Flattery — "clearest fit"/"perfect fit"/"best fit" must not appear in generated why text.
  if (/clearest fit|perfect fit|best fit|ideal fit/.test(dirText.toLowerCase())) {
    findings.push({ sev: "WARN", dim: "honesty", msg: `A direction "why" uses flattery language ("clearest/best fit").` });
  }

  // 3. Stated stretch must not be ranked #1 by default.
  if (persona.expect.statedStretch && directions[0]) {
    const first = `${directions[0].title} ${directions[0].why}`.toLowerCase();
    if (first.includes(persona.expect.statedStretch.toLowerCase())) {
      findings.push({ sev: "WARN", dim: "honesty", msg: `Stated stretch "${persona.expect.statedStretch}" is ranked direction #1 — verify it's genuinely the most-grounded, not flattery.` });
    }
  }

  // 4. Honesty mentions — at least one expected honesty/transferable keyword present.
  const hits = persona.expect.honestyMustMention.filter((k) => haystack.includes(k.toLowerCase()));
  if (hits.length === 0) {
    findings.push({ sev: "WARN", dim: "honesty", msg: `None of the expected honesty keywords [${persona.expect.honestyMustMention.join(", ")}] appear in directions.` });
  }

  // 5. Relationship-driven weighting.
  if (persona.expect.relationshipDriven) {
    const rel = /network|relationship|trust|connection|who you know|introduction/.test(dirText.toLowerCase());
    if (!rel) findings.push({ sev: "FAIL", dim: "honesty", msg: `Relationship-driven field but no direction weights network/trust/relationships in its path-forward.` });
  }

  // 6. Each direction why ≈ 3 sentences (the locked rule).
  directions.forEach((d, i) => {
    const sentences = (d.why || "").split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 3);
    if (sentences.length > 4) findings.push({ sev: "INFO", dim: "voice", msg: `Direction #${i + 1} "${d.title}" why has ${sentences.length} sentences (rule: 3).` });
  });

  // 7. Personalisation — summary must reference the person, not be generic.
  if (!p.summary || p.summary.length < 40) {
    findings.push({ sev: "WARN", dim: "personalisation", msg: `summary missing or very short.` });
  }

  return { findings, snapshot: { seniorityLevel: p.seniorityLevel, topRoleTitles: p.topRoleTitles, directions: directions.map((d) => ({ title: d.title, why: d.why })), summary: p.summary, searchKeywords: p.searchKeywords } };
}

async function jobsAudit(persona, result) {
  // Recruiter filtering + listing seniority for one persona (the art grad).
  const p = result.profile || {};
  const keywords = (p.searchKeywords || []).slice(0, 4);
  const findings = [];
  let jobs = [];
  try {
    const res = await fetch(`${BASE}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, location: p.locationSearch || "london" }),
    });
    const data = await res.json();
    jobs = data.jobs || data.results || [];
  } catch (e) {
    findings.push({ sev: "WARN", dim: "jobs", msg: `jobs fetch failed: ${e.message}` });
    return { findings, jobCount: 0 };
  }
  const recruiterHints = ["recruit", "talent", "staffing", "hays", "reed", "michael page", "robert walters", "adecco", "randstad"];
  const recruiterJobs = jobs.filter((j) => {
    const c = (j.company || j.company_name || "").toLowerCase();
    return recruiterHints.some((h) => c.includes(h));
  });
  if (recruiterJobs.length > 0) {
    findings.push({ sev: "FAIL", dim: "jobs", msg: `${recruiterJobs.length}/${jobs.length} listings are from recruiters (should be filtered): ${recruiterJobs.slice(0, 3).map((j) => j.company || j.company_name).join(", ")}` });
  }
  const seniorJobs = jobs.filter((j) => /\b(senior|head of|director|lead|principal|manager|chief)\b/i.test(j.title || ""));
  if (seniorJobs.length > 0) {
    findings.push({ sev: "WARN", dim: "jobs", msg: `${seniorJobs.length}/${jobs.length} listings look senior for an entry profile: ${seniorJobs.slice(0, 3).map((j) => j.title).join(" / ")}` });
  }
  return { findings, jobCount: jobs.length, sample: jobs.slice(0, 5).map((j) => ({ title: j.title, company: j.company || j.company_name })) };
}

async function main() {
  const out = { ranAt: new Date().toISOString(), base: BASE, personas: [] };
  for (const persona of personas) {
    process.stdout.write(`\n▶ ${persona.id} … `);
    const entry = { id: persona.id, name: persona.name };
    try {
      const result = await analyse(persona);
      const { findings, snapshot } = check(persona, result);
      entry.findings = findings;
      entry.snapshot = snapshot;
      if (persona.id === "art-grad-family-office") {
        const j = await jobsAudit(persona, result);
        entry.jobs = j;
        entry.findings.push(...j.findings);
      }
      const fails = findings.filter((f) => f.sev === "FAIL").length;
      const warns = findings.filter((f) => f.sev === "WARN").length;
      process.stdout.write(`done (${fails} FAIL, ${warns} WARN)`);
    } catch (e) {
      entry.error = e.message;
      process.stdout.write(`ERROR ${e.message}`);
    }
    out.personas.push(entry);
  }
  const path = resolve(__dirname, "results/personas.json");
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(`\n\nWrote ${path}`);

  // Console digest
  console.log("\n=== MATCHING-QUALITY DIGEST ===");
  for (const p of out.personas) {
    console.log(`\n## ${p.id}`);
    if (p.error) { console.log(`  ERROR: ${p.error}`); continue; }
    console.log(`  seniority: ${p.snapshot.seniorityLevel} | roleTitles: ${(p.snapshot.topRoleTitles || []).join(", ")}`);
    (p.snapshot.directions || []).forEach((d, i) => console.log(`  dir${i + 1}: ${d.title}`));
    if (p.jobs) console.log(`  jobs: ${p.jobs.jobCount} returned`);
    if (p.findings.length === 0) console.log("  ✓ no findings");
    p.findings.forEach((f) => console.log(`  [${f.sev}] (${f.dim}) ${f.msg}`));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
