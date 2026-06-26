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

- ✓ **CV tailoring** — tailor the CV to a specific role to beat the ATS. Advisor tool (`tailor_cv`) + `SavedJobDetail` Documents section. Downloadable as PDF. Explains each change. _(2026-06-25)_
- ✓ **Cover letters** — advisor writes it around the person's real angle (`write_cover_letter` tool). Shows in `SavedJobDetail` Cover letter section alongside the tailored CV. Downloadable as PDF. _(2026-06-25)_
- ✓ **Applications folder** — each saved role is a hub (stage + notes + tailored CV + cover letter + future interview prep). Applications nav item + `ApplicationsView` list. _(2026-06-25)_
- **▶ RESEARCH FIRST — application-effectiveness research session** — before building "why am I not hearing back?", outreach, or interview prep, do the research session that grounds ALL of Step 2. Full scope in [parking-lot.md](parking-lot.md) under "Session 2026-06-25 — application-effectiveness research". This session rewrites the CV/cover letter generation prompts AND grounds everything built after it. Do not build the next Step 2 feature until this is done.
- ○ **CV build from scratch** — for users with no CV on file. Advisor uses the profile it already knows (values, aspiration, direction, self-knowledge answers) to generate a skeleton CV in the target direction. User fills in the specifics; advisor coaches them through it. Same API architecture as tailoring, different prompt. _(Lexi, 2026-06-24)_
- ○ **"Why am I not hearing back?" diagnosis** — paste role + CV → real reasons + fixes. _Likely killer feature._ ⚠️ Has its own dedicated research thread within the application-effectiveness research session — the failure modes (ATS filter, volume, level mismatch, timing) must be sourced before building so the advisor gives specific, accurate diagnoses rather than guessing. See parking-lot.md.
- ○ **Networking / outreach** — warm intros + drafted outreach. ⚠️ The referral reality (research suggests ~30–50% of hires come through referrals — stat to be verified in the research session with UK primary sources) means this is not just a "nice to have" outreach feature — it's one of the highest-leverage things an early-career person can do. The product needs to reflect this honestly. Platform idea: a way to help users CREATE referral relationships, not just draft cold messages. See parking-lot.md for the full idea.
- ○ **"I've seen a role I'm interested in"** — user pastes or describes a role they found elsewhere (LinkedIn, a friend, a site); advisor engages with it exactly as it would a matched role: tailoring, outreach, diagnosis, prep. The platform should never require the user to have found the role here. _(Lexi, 2026-06-25)_
- ○ **LinkedIn import** — user connects LinkedIn; advisor uses it to fill in the profile (work history, skills, education) and improve the quality of its read. Richer than a CV alone — captures endorsements, tenure, activity. Also the B2B data-export path later. _(Lexi, 2026-06-25; already noted in Step 4 — pulled forward because the user-understanding value is immediate)_
- ○ **Interview prep via the advisor** — role-specific preparation.
- ○ **Skills shown in context** — surfaced inside a role/direction, not a separate deficit list.
- ○ **New-role alerts** — "spotted something" — genuinely new listings, the daily-companion return mechanic.
- ○ **Decline-pattern detection** — notices when you keep passing on a type of role and asks
  conversationally ("you've passed on a few consulting roles — what's putting you off?"), uses it to
  refine direction. Never silently changes direction. _(from S10 brainstorm)_
- ○ **Mentor-session formats** — structured ways the advisor runs a working session (direction deep-dive,
  interview prep, application review, values exploration, CV building from scratch). _(own research+design effort)_
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

## Future platform extensions (not Step 2 — but real, not dismissed)

- ○ **WhatsApp channel** — the core product stays in the platform, but the user can continue talking to their advisor over WhatsApp when they're on the go. Same memory, same context, different surface. Not a separate product — an access layer. Architecture: Twilio / WhatsApp Business API → webhook → existing `/api/chat`. _(Lexi, 2026-06-25)_

## User archetypes — who the product serves (segmentation, not a feature)

_Our map of the real people who arrive. Drives design, copy, matching, and the advisor eval
(`tests/eval/advisor.eval.mjs` tests the advisor's behaviour against most of these). Captured 2026-06-26
with Lexi. ★ = the advisor has a bright-line rule for this situation, so the eval grades it; the rest are
graded only on global voice/safety rules (their answer *quality* is judged in the human fine-tuning pass)._

- ★ **The lost grad** — no idea what they want. Core lane. Advisor stays non-directive, asks before telling.
- ★ **The career-changer** — one background, wants to move into something else. Must honour the pivot.
- ★ **Aiming too high** — wants a role above their level. Give the path (gateway + bridge), not a flat no.
- ★ **Underselling themselves** — strong background, applying below their level. Nudge them up.
- ★ **Overselling themselves** — wants to inflate/misrepresent their CV. Reality-check; never help them lie. _(Integrity test — guards honest matching, our core differentiator.)_
- ★ **The curious-employed** — has a job, just exploring. No pressure to quit or apply.
- ★ **Wants volume** — "help me apply to as many as possible." Reframe to fewer, stronger. _(Guards the quality-over-quantity thesis.)_
- ★ **The spiraller** — anxious, going in circles. Stop adding info; redirect to one concrete action.
- ★ **In distress / off-topic** — beyond the career lane. Stay in lane, signpost, never play therapist. _(Safety — highest harm if broken.)_
- ★ **Not hearing back** — the silence question (the most asked). 140-reframe first; never a false-confident cause.
- **In a field, unsure which role** — committed to a field, doesn't know the role. (Quality, not a hard rule.)
- **Niche background** — specialised, narrow market (e.g. marine biology). Avoid generic advice.
- **Returning after a gap** — career break (caregiving, illness, redundancy). Never shame the gap.
- **No degree / vocational route** — early-career without a degree. Don't assume university.
- **Visa / sponsorship-constrained** — work eligibility limits what's open. Stay honest about it.
- **The already-decided ("directed")** — knows exactly what they want. Don't trap them in discovery; move to action.

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
**Observability + maturity (the "more professional" items):** Sentry — client DSN IS set in Production
(client errors captured); still to do: alert/email rules + `SENTRY_AUTH_TOKEN` (sourcemaps) + confirm
server-side capture (note: 429s/handled responses aren't exceptions, so they never alert) · Vercel
Analytics · ✓ CI pipeline live (typecheck+build+mock-e2e on push; add lint + unit-via-vitest later) ·
widen test coverage beyond core flows · a true production env separate from staging.
**Quality:** the roles matching/sourcing review (recommendations are still weak — deferred, but it's the
thing users judge hardest, so address before sharing widely). Study **JobCopilot + Jobeefy** for *how they
source and match* jobs; ground our own job data in Step 3 (National Careers Service / LMI). Detail in parking-lot.
