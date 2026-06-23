# Feature Roadmap — everything we're building, feature by feature

_The single list. Created 2026-06-23 because the feature-by-feature plan had been split across
START-HERE (the 4 steps), parking-lot (which feature per step), and REBUILD (technical detail) —
so it was impossible to see the whole thing in one place._

**How to read this:** features are grouped by the four plan steps from [START-HERE.md](START-HERE.md),
in roughly the order we'll build them. Status: **✓ done** · **▶ next / in progress** · **○ planned**.
Detail and rationale for parked items live in [parking-lot.md](parking-lot.md); the fix backlog is
[AUDIT-REPORT-2026-06-22.md](AUDIT-REPORT-2026-06-22.md); technical build state is [REBUILD.md](REBUILD.md).
This supersedes the archived `ROADMAP.md` as the feature list — don't plan from that one.

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
- ▶ **Advisor reacting + feeling present** — initiates, responds to what you do, doesn't wait to be asked.
- ○ **"Start fresh, keep the memory"** — a light session reset that doesn't wipe what the advisor knows.

## Step 2 — The candidate-strength loop (the heart of the mission)

Turn spray-and-pray into fewer, stronger applications + a foot in the door. _Architecture-heavy — plan on Opus._

- ○ **CV tailoring** — tailor the CV to a specific role to beat the ATS (the #1 reason for silence).
- ○ **Cover letters** — advisor writes it around the person's real angle; user approves.
- ○ **"Why am I not hearing back?" diagnosis** — paste role + CV → real reasons + fixes. _Likely killer feature._
- ○ **Networking / outreach** — warm intros + drafted outreach (most roles go through referral).
- ○ **Interview prep via the advisor** — role-specific preparation.
- ○ **Skills shown in context** — surfaced inside a role/direction, not a separate deficit list.
- ○ **New-role alerts** — "spotted something" — genuinely new listings, the daily-companion return mechanic.
- ○ **Mentor-session formats** — structured ways the advisor runs a working session with you.
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

## Step 3 — Grounded knowledge layer

Make the facts real so the product is credible, not guessing. Plan: [GROUNDED-KNOWLEDGE-PLAN.md](GROUNDED-KNOWLEDGE-PLAN.md).

- ○ Fact-check salaries / skills / routes against free authoritative data (£0 constraint).
- ○ Niche-industry coverage — serve users in small / non-standard fields well.
- ○ "What makes a good mentor" research — credibility grounding for the advisor.

## Step 4 — B2B (universities first, only after the candidate loop works)

- ○ LinkedIn OAuth import · application-tracker export · offer evaluation · progress-data-for-employers (GDPR-safe).

---

## Not features — sessions to run when Lexi signals (not builds)

- **Strategy/research:** Mentorship market + business model + credibility (the big one) · Jack & Jill teardown ·
  niche-industry users. _Detail in [parking-lot.md](parking-lot.md)._
- **Design:** Advisor identity / visual register + the product's final name (currently speaks as "Career Intelligence"; "Meridian" was dropped) · homepage redesign.

## Pre-launch non-negotiables (Lexi's, not build-session work)

REED_API_KEY in Vercel · ICO registration · GitHub token rotation · privacy policy + terms · real user
deletion in Profile · Sentry error tracking + Vercel Analytics · `SENTRY_AUTH_TOKEN` in Vercel (sourcemaps).
