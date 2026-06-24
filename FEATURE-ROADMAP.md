# Feature Roadmap — everything we're building, feature by feature

> **⭐ THIS IS THE MAP. Lexi can open this one file and see the whole road.** Every feature idea lands
> here the moment it's raised — nothing stays only in a conversation. Detailed rationale for any item
> lives in [parking-lot.md](parking-lot.md). If something you remember isn't here, tell me and it goes in.

**How we build (set 2026-06-24 — full detail in [CLAUDE.md](CLAUDE.md) "How We Build"):** breadth-first.
Get the whole product walkable end-to-end at "good enough" BEFORE polishing voice/copy/recommendations.
*Building* (features = progress) and *fine-tuning* (feel = endless) stay separate; polish happens once,
later, deliberately. **Current focus: freeze first-session polish → build Step 2 (the candidate-strength
loop).**

**How to read this:** grouped by the four plan steps, in build order. Status: **✓ done** · **▶ now /
in progress** · **○ planned**. Fix backlog: [AUDIT-REPORT-2026-06-22.md](AUDIT-REPORT-2026-06-22.md);
technical build state: [REBUILD.md](REBUILD.md). Supersedes the archived `ROADMAP.md`.

**The test for every feature** (from [MISSION.md](MISSION.md)): does it help someone send **fewer,
stronger applications and actually get a response / a foot in the door**? If not, it's not the priority.

---

## Step 1 — Make it feel alive (the new-user flow)

The advisor reacts, is present, and reads you properly before it tells you anything.

- ✓ **Discovery conversation before the reveal** — the advisor asks before it tells (no cold form).
- ✓ **Probe for substance when input is thin** — no CV / vague answers → draws out modules, work
  experience, projects so the read is useful, not generic. _(2026-06-23)_
- ✓ **Route to discovery by whether you've been read** — not account age; fixes "it only asks for the CV"
  for anyone with an account. _(2026-06-23)_
- ✓ **Advisor fills profile gaps casually in conversation** — asks for what's missing (values,
  deal-breakers, aspiration, working style) one at a time, never a second intake. _(2026-06-23)_
- ✓ **First-session arc — the advisor runs a session** — initiates, reads how clear you are
  (directionClarity dial), reflects, invites exploration; roles earned-in, not pushed. _(2026-06-24)_
- ✓ **One continuous page + conversation survives sign-in** — no page jumps, in-place sign-in, no
  dead-ends; reveal card stays when the conversation continues. _(2026-06-24)_
- ✓ **Use the person's name** — once known (CV or told), used naturally, not every line. _(2026-06-24)_
- ✓ **Low-effort first moments** — opening questions are no-thinking; no parroting; deeper asks deferred
  until trust is built. _(2026-06-24)_ ← **FROZEN for polish: voice/copy fine-tuning happens later.**
- ○ **Drag-and-drop CV upload** — drop a file onto the conversation, not only the + button.
- ○ **Advisor calibrates to the person's situation** — employed/passive vs unemployed/active seeker → pace
  + expectations differ; never guilt-trip a busy person. _(from S10 brainstorm)_
- ○ **Away-mode (implicit)** — read last-login + context signals, adjust the welcome (no guilt, warm
  re-engagement after a gap). Explicit "I'll be away" = later. _(from S10 brainstorm)_
- ○ **"Start fresh, keep the memory"** — a light session reset that doesn't wipe what the advisor knows.

**Cross-cutting principle (every surface):** *dual interaction* — the advisor path (tell it, it acts) AND
a direct path (click/drag/edit yourself) always both available. The advisor is a guide, never a gatekeeper.

## Step 2 — The candidate-strength loop (the heart of the mission)

Turn spray-and-pray into fewer, stronger applications + a foot in the door. _Architecture-heavy — plan on Opus._

- ○ **CV tailoring** — tailor the CV to a specific role to beat the ATS (the #1 reason for silence).
- ○ **Cover letters** — advisor writes it around the person's real angle; user approves.
- ○ **"Why am I not hearing back?" diagnosis** — paste role + CV → real reasons + fixes. _Likely killer feature._
- ○ **Networking / outreach** — warm intros + drafted outreach (most roles go through referral).
- ○ **Interview prep via the advisor** — role-specific preparation.
- ○ **Skills shown in context** — surfaced inside a role/direction, not a separate deficit list.
- ○ **New-role alerts** — "spotted something" — genuinely new listings, the daily-companion return mechanic.
- ○ **Decline-pattern detection** — notices when you keep passing on a type of role and asks
  conversationally ("you've passed on a few consulting roles — what's putting you off?"), uses it to
  refine direction. Never silently changes direction. _(from S10 brainstorm)_
- ○ **Mentor-session formats** — structured ways the advisor runs a working session (direction deep-dive,
  interview prep, application review, values exploration). _(own research+design effort)_
- ○ **Documents folder** — home for tailored CVs + cover letters (after those exist; uploaded CV lives in Profile).

## Ongoing fixes & smaller features (chipped between the big steps)

Source: [AUDIT-REPORT-2026-06-22.md](AUDIT-REPORT-2026-06-22.md) batches + the 2026-06-23 review.

- ○ **Profile edit pass** — directly editable Profile (the "mirror"), mentor-primary but never trapping a
  fact: **replace CV on file** (simple swap, not the whole input flow) · **change registered email** ·
  edit preferences / deal-breakers.
- ○ **Account menu** (bottom-left name/email) — Profile · Previous chats · Settings · Sign out (not a jump
  straight to Profile).
- ○ **View previous chats** — a real history view (partial support already exists; lives in the account menu).
- ○ **Saved / Applications board** — view saved roles, remove a role, per-role actions (interview prep /
  tailoring / outreach). _(Audit Batch B)_
- ○ **Saved-job detail page** — breadcrumb, job card, activity log, notes, interview-prep nudge.
- ○ **Direction detail view** + **click a direction → filtered roles** / role filter. _(Audit Batch C)_
- ○ **"Today" digest** on the home surface.
- ○ **Logo coverage** — clean company-name → logo across roles.
- ○ **Progression view** — "how far you've come" (direction clarifying, CVs tailored, foot-in-door actions).
  ⚠️ Must stay momentum, **never gamification** (no streaks/points/badges — locked rule).
- ○ **Tech debt: lint cleanup** — ~36 pre-existing `react-hooks/set-state-in-effect` errors; a small pass.
  Once done, add the lint gate to CI.
- ○ **Unit tests in CI** — the `.mjs` unit tests (`profile-normalize`, `adzuna-category`) import `.ts`
  directly, so they need a TS test runner (vitest) before CI can run them; they run locally for now.

## Step 3 — Grounded knowledge layer

Make the facts real so the product is credible, not guessing. Plan: [GROUNDED-KNOWLEDGE-PLAN.md](GROUNDED-KNOWLEDGE-PLAN.md).

- ○ Fact-check salaries / skills / routes against free authoritative data (£0 constraint).
- ○ Niche-industry coverage — serve users in small / non-standard fields well.
- ○ "What makes a good mentor" research — credibility grounding for the advisor.

## Step 4 — B2B (universities first, only after the candidate loop works)

- ○ LinkedIn OAuth import · application-tracker export · offer evaluation · progress-data-for-employers (GDPR-safe).

---

## Mentorship work — where it stands (Lexi asks)

- ✓ **"How mentors run sessions" research — DONE.** `research/mentorship-research.md` → grounds the
  first-session arc + ADVISOR_PERSONA "Mentorship grounding". This is *already shaping the build.*
- ○ **Mentorship market + credibility + business-model strategy session — PARKED, not started.** The big
  strategy/research session (is there a real UK gap? how do we prove AI advice is credible? all business-
  model options? go-to-market?). Fully scoped in [parking-lot.md](parking-lot.md). Runs when Lexi signals.

## Not features — sessions to run when Lexi signals (not builds)

- **Strategy/research:** the mentorship strategy session above (the big one) · Jack & Jill teardown ·
  niche-industry users. _Detail in [parking-lot.md](parking-lot.md)._
- **Design:** Advisor identity / visual register + the product's final name (speaks as "Career Intelligence";
  "Meridian" dropped) · homepage redesign.
- **B2B-era idea — advisor "vouch" / digital sponsorship:** an evidence-grounded, selective reference the
  advisor can give an employer (real work done, verified certs, sustained engagement — never a guess,
  never a score). Converges with B2B verified-progress-data + the progression view. Consent/GDPR-gated.
  Do not build now; folds into the mentorship-strategy + credibility session. _(Lexi, 2026-06-24)_

## Pre-launch non-negotiables (before ANY real user — even close contacts)

_Real users mean real CVs = real personal data, so the legal + safety floor is not optional._

**Legal / data:** ICO registration · privacy policy + terms · working account deletion in Profile ·
GitHub token rotation (live security risk) · safeguarding/distress-signpost surface + terms line.
**Config:** REED_API_KEY in Vercel · Logo.dev keys in Vercel · run the recap + matched_jobs SQL migrations.
**Observability + maturity (the "more professional" items):** activate Sentry (DSN + alert rule — currently
dormant, no error visibility) · Vercel Analytics + `SENTRY_AUTH_TOKEN` (sourcemaps) · CI pipeline
(auto-run tests on push) · widen test coverage beyond core flows · a true production env separate from staging.
**Quality:** the roles matching/sourcing review (recommendations are still weak — deferred, but it's the
thing users judge hardest, so address before sharing widely). Study **JobCopilot + Jobeefy** for *how they
source and match* jobs; ground our own job data in Step 3 (National Careers Service / LMI). Detail in parking-lot.
