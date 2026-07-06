# SPEC — The Grounding Layer (occupation/skills matching + company facts)

_Agreed 2026-07-06 (Session 53, written on Fable 5 — the reasoning session; build happens on Sonnet/Opus).
**No code this session.** Previous spec (Roles-vs-Applications IA, shipped + QA-passed S49) archived at
`archive/SPEC-roles-vs-applications-ia-2026-07-01.md`._

> **Inputs (all read this session):** `research/job-matching-quality-research.md` (verification top-up DONE
> 2026-07-06 — §1/§2/§3 clusters now 🟢; OECD §4 + rsif specifics still 🟡), `research/company-factual-grounding-research.md`
> (22/25 claims 3-0), `research/interview-prep-research.md` (§13 hard rules), `research/application-effectiveness.md`
> (tier system + prompt briefs), `GROUNDED-KNOWLEDGE-PLAN.md` (the £0 architecture this spec turns into a contract),
> `MISSION.md`.
>
> **Mission + mentor check (stated per CLAUDE.md rule 7):** grounding serves fewer-stronger-applications directly
> (honest matching, real skills gaps, real adjacency, employer-specific prep). It gives the advisor facts to TEACH
> from — it never authors the user's answers, story, or "why". CV/cover letters stay the permitted
> draft-with-explanation deliverables. PASS.

---

## The principle (the whole spec in three lines)

1. **AI for judgment and voice; real data for facts.** Anywhere the advisor states a fact — a skill a role needs,
   an adjacent role, an employer's process — that fact comes from a grounded record with a source, never the
   model's memory.
2. **The honest fallback is a peer, not an edge case.** 99.85% of UK employers publish nothing; a large share of
   matching questions have no perfect answer. The no-data path is designed with the same care as the data path.
3. **£0, hard line.** Every source below is free and openly licensed. No paid APIs, no scraping.

---

## Subsystem A — Occupation & skills grounding (powers matching, gaps, stepping-stones)

### A1. Data (ingest once, script-refreshable)

| Source | Use | Licence / attribution (verified 2026-07-06) |
|---|---|---|
| **ESCO** (JSON-LD/CSV download) | Canonical taxonomy: occupations ↔ skills (essential + optional) | Free, EUPL 1.2 + Apache 2.0; self-hostable — no EU-uptime dependency |
| **O*NET related_occupations** | Ready adjacency graph: **10 primary + 10 supplemental per occupation**, quality-ranked (Primary-Short = 5 most related, expert-reviewed) | **CC BY 4.0** — credit exactly: "O*NET Resource Center by U.S. Department of Labor, Employment and Training Administration" |
| **ESCO↔O*NET crosswalk** (free CSV, ESCO portal) | Bridge: every ESCO occupation → ≥1 O*NET occupation | Free; use the *standard* version (exact/narrow/broad/close), not enhanced |
| **National Careers Service profiles** | Curated UK-title layer + entry routes | OGL — free commercial reuse with attribution |
| **LMI for All** (slice 5) | Real UK salaries + demand by occupation | Free API, needs registration (Lexi action) |

- **Storage:** `data/grounding/*.json` in-repo, produced by `scripts/build-grounding/` ingest scripts (checked in,
  re-runnable). Emit **trimmed normalized records** (only fields we use: id, preferred + alt labels, essential
  skills, optional skills, related-occupation ids with rank tier, NCS title/route where mapped) — not the raw dumps.
- **UK-title rule (ONS-verified constraint):** SOC↔ISCO/ESCO bridging is lossy and many-to-many. Crosswalked titles
  are NEVER presented as exact. The NCS curated layer owns user-facing UK titles; ESCO/O*NET own the machinery
  underneath. When a crosswalk is ambiguous, keep all candidates and let skill-overlap disambiguate.

### A2. Lookup API — `src/lib/grounding.ts`

Pure, deterministic, unit-testable functions over the JSON (no LLM anywhere in this file):

- `findOccupation(titleOrText)` → best ESCO occupation(s) for a role title (label + alt-label match; fuzzy later).
- `getSkillsForRole(occupationId)` → `{essential[], optional[], source}`.
- `getAdjacentRoles(occupationId, userSkills?)` → ranked adjacent occupations, each with
  `{sharedSkills[], newSkills[], rankSource: "onet-primary-short" | "onet" | "skill-overlap"}`.
- `crosswalkTitle(occupationId)` → UK-facing title(s) + NCS profile link, flagged `approximate: true` when lossy.

**Adjacency scoring (the engine):** blend of (a) the O*NET related-occupations graph (crosswalked; Primary-Short
outranks the rest) and (b) **weighted skill-overlap** over ESCO skills (essential ×2, optional ×1, Jaccard-style)
— evidence: skill overlap predicts real transitions (PLOS ONE 2021, 76% classifier accuracy on 8M job ads; 🟢
verified, Australian data — mechanism transfers, never quote the figure to users). When the user's own skills are
supplied, rank by *their* overlap, not the generic one — a stepping-stone is a role that **reuses what this person
already has**. Every adjacency result must carry its `sharedSkills` — that list IS the explanation.

### A3. Advisor wiring (facts in, judgment out)

- **Tools, not blanket injection:** add advisor tools `lookup_role_facts(roleTitle)` and
  `get_adjacent_roles(roleTitle)` returning the grounded records; auto-inject the grounded record only for the
  active role on role-detail surfaces (token discipline). The advisor reasons and coaches OVER the record and
  says where facts come from in its own voice; it never asserts a skill/adjacency/salary that isn't in the record.
- **Skills gaps become grounded:** the Skills surface lists only skills present in the grounded record for the
  target role, split essential/optional, with the user's overlap computed — no invented gaps.
- **Stepping-stones become grounded:** the pathway/gateway feature draws from `getAdjacentRoles`, and the advisor's
  framing is the mentor move: "adjacent because it reuses X, Y, Z you already have — and here's what would be new."
- **Honest-matching rules (encode in prompt + eval, from the research):** breadth before narrowing; surface
  non-obvious skill-adjacent paths; never label a stated (prestige) desire "the clearest fit"; set honest
  expectations — even the best matching systems are imperfect (benchmarks 🟢-verified; the "minority of the time"
  framing is our inference — keep it out of user-facing copy). Cold-start is our core case (🟢): thin CV → the
  discovery conversation supplies the signal, never padding or guessing.

---

## Subsystem B — Company-factual grounding (per-employer, reused across the loop)

One capability — `src/lib/company-grounding.ts` — consumed by interview prep, CV tailoring, outreach, and
"why am I not hearing back?". The four-layer cascade (research §6, 🟢). Try top-down; **always return which layer
answered** so the advisor can signal calibrated confidence:

| Layer | Source | Fires when | Register the advisor uses |
|---|---|---|---|
| 1 | Curated official frameworks (`data/grounding/frameworks/*.json`): Civil Service Success Profiles (OGL — the 9 behaviours + assessment methods), NHS VBR (**sector methodology, never "this trust's process"** — refuted-claim guard), published systems (Amazon LPs, EY strengths) | Public sector / named-framework employer | High: "this is their published framework" |
| 2 | On-demand fetch of the employer's OWN careers/assessment page, cached with `fetchedAt` | Named large/grad-scheme employer with a published process | High: cite the page + date |
| 3 | User pastes their real invite/process email (`foundContext` pattern) | Any employer — offer it whenever 1–2 miss | High for THIS vacancy |
| 4 | Sector-generic process data (encode `interview-prep-research.md` §3 matrix as JSON) + calibrated confidence | The SME/no-data majority — **the majority case, built first-class** | Calibrated: "typical for this sector — check your invite" |

API: `resolveEmployerGrounding({company, sector?, pastedInvite?})` → `{layer, facts, sources[], fetchedAt?, confidence}`.

- **Never (Layer 0):** scraping Glassdoor/Indeed review text — ruled out on contractual (Ryanair v PR Aviation)
  + ICO/GDPR grounds (🟢). Solicitor opinion required before ANY review-site data use (existing flag stands).
- **Freshness policy (required):** Layer-2 cache carries `fetchedAt`; re-fetch when older than 60 days or on user
  request; frameworks (Layer 1) are stable, reviewed at the research review dates.
- **Confidence register:** calibrated beats bluffing AND over-hedging (🟢, direction only). The advisor states
  provenance in one natural line, never a disclaimer stack (no-over-honesty rule). Layer→register mapping above is
  data the prompt receives, not vibes.
- **Mentor boundary (non-negotiable):** grounding supplies the employer's *machinery* — behaviours, stages,
  formats. The user's ANSWERS, story and "why" are coached in their own words, never authored (interview-prep
  §13 rules 2–3 carry over verbatim).

---

## Build slices (each shippable, in order — Sonnet, normal effort; escalate only if genuinely stuck)

1. **ESCO ingest + `grounding.ts` + grounded skills-for-role** wired into the Skills surface. _(Done: ingest
   script committed; unit tests over the lookup; Skills tab lists only grounded skills with source; no advisor
   prompt change beyond the tool.)_
2. **Adjacency engine + grounded stepping-stones** wired into pathway/gateway roles. _(Done: `getAdjacentRoles`
   deterministic + unit-tested; every surfaced adjacent role names ≥1 shared skill; advisor explains adjacency
   from `sharedSkills` only.)_
3. **Company cascade Layers 1 + 4** (frameworks JSON + sector matrix JSON) wired into interview prep — this also
   closes the S50 live-test gap ("is named-employer prep factual or made up?"). _(Done: Civil Service prep names
   only real behaviours from data; unknown SME gets sector register + paste-your-invite offer, zero fabricated
   process; quick ~5-persona subset check, NOT the full eval.)_
4. **Layer 2 employer-page fetch + freshness**, reused by CV tailoring + outreach framing. _(Done: fetch, cache
   with date, cited in output; re-fetch policy tested.)_
5. **LMI for All salaries** everywhere money is mentioned. _(Blocked on free registration — Lexi, when slice starts.)_

**Attribution (ship with slice 1):** a source/attribution note (footer or about page) carrying the O*NET CC BY
credit line (exact wording above), ESCO notice, OGL statement. Legally required, cheap, and it *is* the trust story.

## Done criteria (objective — self-verified before Lexi sees anything)

1. Every fact-bearing advisor claim in the touched surfaces traces to a grounded record (spot-checked via the
   persona harness extended with grounded-truth expectations — the £0 eval from the research).
2. `grounding.ts` + `company-grounding.ts` are pure and deterministic: same input → same output, unit-tested, no
   LLM calls inside.
3. Crosswalked titles always flagged approximate; UK-facing titles come from the NCS layer.
4. Cascade always reports its layer; Layer-4 answers never name a specific employer's process.
5. No new paid dependency; no review-site data anywhere; attribution page live.
6. All green before review: unit, e2e, tsc 0, lint 0, shot.js on touched surfaces; advisor-prompt changes get the
   ~5-persona subset only (cost rule 2).

## Explicitly out of scope

- Semantic/embedding search (structured lookup suffices for a curated set; free local embeddings ONLY if fuzzy
  matching proves genuinely inadequate — decide then, not now).
- The regulated/high-harm curated corpus (employment rights, visas, scams — GROUNDED-KNOWLEDGE-PLAN's Step-3
  guardrail cluster). Same architecture, own session; the inform-don't-advise principle is already in the persona.
- Review-site data in any form (pending solicitor opinion — likely never).
- Quoting research figures (76%, Recall@10, OECD numbers) to users — they ground OUR design, not user copy.
- B2B anything.

## Open items carried

- Finish the two 🟡 verifications (OECD §4 figures; rsif.2020.0898 specifics) in any later cheap pass — neither is
  load-bearing for this architecture.
- Company-factual research open questions §1–4 (Glassdoor official API? aggregator ToS? Layer-2 hit-rate across top
  UK grad employers?) — fold into slice 4's prep, not before.
- LMI for All registration (Lexi, at slice 5).
