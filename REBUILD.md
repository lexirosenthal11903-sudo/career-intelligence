# Career Intelligence — State of the Product & Rebuild Plan

> **Name note (2026-06-23):** "Meridian" was **dropped**. The product speaks as "Career Intelligence"
> (working name; final TBD at the identity session). Older "Meridian rename" items below are abandoned —
> read them as historical only.

_Created 2026-06-20 (Session 38). Author: Claude (technical co-founder), reviewed with Lexi._
_This document is the new single source of truth. Where it conflicts with ROADMAP.md, CLAUDE.md,
INSIGHTS.md, or PLAYBOOK.md, **this wins** until those are consolidated into it._
_Confidence tags: (verified) = read in code · (inferred) = strong reasoning, not directly confirmed ·
(unverified) = could not check from the repo and must be checked live._

---

## Why this document exists

After 37 build sessions there are zero real users, the product is broken when Lexi opens it, and
the existing docs describe a product that is more finished than the one that exists. This is the
reset: an honest audit of what is actually true, a rebuild sequenced so the foundations come first,
and a change to how we work so Lexi stops being the one who finds every bug.

**One-line verdict:** the product is a fragile shell around a generic job-board search. The two
things that would make it *ours* (an advisor with memory and agency) and *trustworthy* (tests, a
real data layer, error visibility) were both skipped. Everything else is a symptom of those two gaps.

---

## ✅ BUILT 2026-06-29 (Session 43b) — advisor↔board alignment (Lexi's live-test findings)

Root cause Lexi spotted: two tables drift. `saved_jobs` (advisor context + nav count read it) has no `stage`;
`saved_applications` (the board) does. Verified: tsc + lint + build green; 19/19 tests; `eval:advisor` all hard
rules held (29 personas); one review agent (zero findings). **Pushed to staging.**
- **Advisor reads the real board.** `buildUserContext` (`/api/chat`) now also reads `saved_applications` and tells the
  advisor where each application ACTUALLY stands (offer / interview / "didn't get it" / set aside), as the source of
  truth over its memory — so it stops confabulating an offer that isn't on the board. Salary (`salaryFloor/Ceiling`)
  now surfaced too, so it never re-asks what it already holds.
- **Nav count = live applications only.** `useNavProgress` count + Recent now read `/api/applications` and exclude
  closed stages (rejected/archive) — a closed role drops out of the badge and Recent, matching the board.
- **Why-closed note.** `set_application_stage` gained an optional `reason`; for rejected/archive it merges
  `closeReason` into `job_data` (never clobbers the user's notes). The saved-role detail shows a "Why this closed"
  section so the user can remind themselves. Prep (tailored CV / cover letter) is already retained for closed roles —
  only Remove deletes it.
- **STILL DEFERRED (rejection-path stability + voice beat, next):** mistimed/garbled rejection care, the wrong-role
  `set_application_stage` fuzzy match, and the "error + green action log" race. Needs systematic debugging with logs.

## ✅ BUILT 2026-06-29 (Session 43) — the rejection moment, done properly (state model + bugs)

Fixes the rejection path the Session-42 live test caught, grounded in `research/rejection-state-model-research.md`
(three forks researched, Lexi decided each). Verified: tsc + lint + production build green; 19/19 unit tests;
`eval:advisor` all hard rules held; one 3-agent `/code-review` (8 findings, all fixed). **Awaiting Lexi's go to push.**
- **Real `rejected` outcome.** New stage `rejected` (kept as a real record, never auto-deleted). Advisor sets it on a
  definite no (prompt: NOT `archive`; the human reply and the stage change go together in one turn). Added to the
  `set_application_stage` enum + the `/api/applications` PATCH `VALID_STAGES` (was out of sync) + advisor-tools VALID.
- **Quiet Closed area.** `ApplicationsView` splits the active board from a collapsed "Closed" group (`CLOSED_STAGES`
  = rejected + archive). `STAGE_LABELS` gained both (fixes the bug where archive mislabelled as "Saved"); soft labels
  ("Not this time" / "Set aside") — never the bare word "Rejected". Legacy `/dashboard/applications` softened to match.
- **Transient-failure robustness** (`/api/chat`): the tool loop now retries once (400ms backoff) on a 5xx/429, and
  only swallows a TRANSIENT failure into a warm holding line when an action already committed this turn — a non-transient
  4xx still surfaces. Fixes the root cause: a committed stage move stranded behind a cold error with no acknowledgement.
- **Ask-why on remove + reason-routed Live-roles hide.** Removing a saved role nudges the advisor (`askAdvisor`) to ask
  once, conversationally, why (non-blocking — the remove already happened). A genuine "not for me" → `hide_role_from_live`
  (new tool) → `profiles.data.hiddenRoles[]` → the Live-roles feed drops it (exact title+company, or title-only when the
  advisor didn't capture a company). "Just tidying" → nothing changes. Item-level ONLY; down-weighting similar roles +
  the aggregate funnel stat are deferred to Step 3 (a single negative carrying more weight is the filter-bubble harm).
  Shared `lib/role-key.ts` canonicaliser (server + client can't drift).
- **Ride-alongs:** stale "✓ In Applications" badge now re-reads on `ci:application-changed`; chat auto-scroll wrapped in
  double-rAF so a tall new reply doesn't land short; name-shortening tightened (never invent a nickname like "Alex").
- **Deferred (logged):** down-weight similar roles + aggregate funnel stat (Step 3); pre-existing em-dash UI copy sweep
  (several `—` in unchanged empty-state strings — not introduced here); the outcomes VOICE tuning (separate beat).

## ✅ SHIPPED 2026-06-29 (Session 42) — Theme A: the advisor drives state + holds you through it

The advisor now changes the user's application state from conversation and the whole UI reflects it live, holds
them through outcomes (offer / interview / rejection), and can navigate them — but only when they ask. Grounded in
`research/rejection-care-and-navigation-research.md` (rejection care, feedback-routing, navigation discipline).
- **A1 — live state + nav bridge.** `save_job` + `set_application_stage` (`lib/advisor-tools.ts`) emit a new
  `application-changed` signal → `useArloChat` dispatches `ci:application-changed` → the Applications list, the
  saved-role detail (`SidePanel`), and the left-nav count/Recent (`useNavProgress`) all re-read live. The advisor
  write already worked; the gap was UI reflection + the nav (which also needed `save_job` to write
  `status:'interested'`, matching a UI save, or chat-saved roles never counted).
- **Navigation — user-requested only.** New `open_surface` advisor tool + `ci:open-surface` → `WorkspaceShell`.
  A state change NEVER moves the user (Nielsen User-Control & Freedom); the advisor opens a surface only on an
  explicit "show me my X". Surface list shared via `lib/surfaces.ts` so tool + workspace can't drift.
- **A2 — outcome acknowledgement** (offer = genuine well done, never gamified; interview = prep; applied = steadying)
  carried in the `set_application_stage` tool result + the prompt/persona.
- **A3 — rejection care:** light fixed arc (acknowledge → normalise → ask about feedback, never "paste the email"
  → turn forward); distress still escalates via §5. Persona "Outcomes" section + prompt; +2 eval personas.
- **Ride-alongs:** unsave/remove a role (two-step, clears both tables); direction #1 → equal weight; dead scroll hint
  + its CSS/icon removed.
- **Verified:** tsc + lint + production build green; 19/19 unit tests; `eval:advisor` all hard rules held;
  3-agent `/code-review` run → fixes applied (stage-matcher blank-title guard, unsave `response.ok` check, silent-load
  null guard, nav event+status fix, DELETE body guards, shared surfaces constant). **Lexi to live-test on staging.**

## ✅ SHIPPED 2026-06-29 — Engaged, focused mentor (proactive return + holding the thread)

The advisor now initiates on a meaningful return and holds the thread when the user switches mid-task.
Grilled + research-grounded (`research/task-focus-and-switching-research.md`), specced in
`brainstorms/engaged-focused-mentor.md`, behaviour in `ADVISOR_PERSONA.md` → "The engaged, focused mentor".
- **`profiles.data.openThreads[]`** (new, invisible, clearable) — parked unresolved threads that survive the
  ~20-turn transcript window. Helpers `addOpenThread` / `resolveOpenThread` (`lib/profile.ts`). No migration —
  it's another key in the existing `profiles.data` jsonb.
- **Two new advisor tools** (`lib/advisor-tools.ts`): `note_open_thread`, `resolve_open_thread` (silent, no
  user-facing echo). Surfaced in `buildUserContext` as an OPEN THREADS block with pick-one / never-list-back guidance.
- **Return-opener:** `chat/route.ts` initiate path now accepts `resume:true` + the recent transcript (was
  profile-facts-only — the root cause it couldn't see the visa thread). `useArloChat.ts` fires the resume-opener
  on a meaningful return (`isMeaningfulReturn`: new day or ~6h+ gap via `conversations.updated_at`), suppressed
  if the user has already started typing (`userEngagedRef`).
- **Prompt + persona:** returning-visit opening rules, hold-the-thread (relational, avoidance-read, "how did it
  go" not "did you do it"), parking discipline. Regulated/distress reopens obey the existing §5 rules.
- **Verified:** tsc + lint clean; 3 new eval personas (return-two-threads / clean-close / topic-switch);
  `eval:advisor` run after the prompt change. **Not built (practitioner-gated):** cross-session avoidance-pattern surfacing.

## ▶ CURRENT BUILD QUEUE — Session 41+ (graduated from parking-lot 2026-06-22, Lexi signed off)

_After the first live test. Step 1 spine items above are largely done; these are the post-live-test
fixes + the job-stability architecture. Build order, all on `staging`:_

> **▶ STEP 1 "FEEL ALIVE" — now grounded (2026-06-24 research session).** The advisor-runs-a-session
> rebuild is no longer guesswork: it's specced in **`research/first-session-arc-spec.md`** (the build
> checklist is at the bottom), grounded in **`research/mentorship-research.md`** and the new
> "Mentorship grounding" section of **`ADVISOR_PERSONA.md`**. Key build items: advisor **initiates on
> load** (orient/contract), add **`directionClarity`** to the profile to drive an adaptive directive↔
> non-directive dial, add the **"how do you feel about this direction"** beat, **de-emphasise roles as
> the landing surface**, and **close each first session on one concrete action**. **Pre-launch
> safeguarding (Lexi):** a distress-signpost surface + terms line — sits with the ICO/privacy items.

1. **Job persistence + daily-new-roles** _(Opus — architecture)._ Persist each user's matched jobs in a
   new `matched_jobs` table keyed by a keyword-hash. Server-read on load (stable across logins); refresh
   the set ONLY when direction/keywords change (`analysis-changed`). On top of the stable set, a
   **real per-day detection** pass surfaces 1–2 genuinely new listings not already seen (24h gate),
   **plus** an on-demand "show me more roles" the user can trigger. New-user initial set capped to ~5–8
   strong roles (not ~22). Needs a new Supabase migration (Lexi runs it).
2. ✅ **"Already interested" bug — RESOLVED (verified 2026-06-26).** Root cause was: `handleInterested`
   (`SidePanel.tsx`) saves the job before `askAdvisor`, so `buildUserContext` (`chat/route.ts`) already
   sees it saved → advisor says "you've already done that." Fixed at the prompt level (not by reordering):
   the handoff message is forward-looking ("I've just said I'm interested… what should we do about it?"),
   AND `buildUserContext` tells the advisor a just-saved job is a fresh decision being confirmed right now,
   never "already done that." Confirmed both are in place.
3. **Saved-job detail page** (J&J reference: breadcrumb, job card, "show details", activity log,
   "write a note", interview-prep nudge). Fixes the dead saved-job click + nav Recent → opens the role.
4. **CV upload saves to Profile** (source identity). Tailored CVs/cover letters → Documents later.
5. **Advisor honest-matching pass** _(raised by Lexi live-testing 2026-06-22; see memory
   `feedback-honest-matching`)._ The "clearest fit" direction-card label is removed (it asserted an
   unearned verdict). Still to do, as a focused pass: tighten `analyse`/`chat` prompts so the advisor
   (a) never manufactures fit by cherry-picking the CV, (b) orders/labels directions by genuine
   groundedness not by what the user wishes for, (c) for relationship/trust-driven fields (family
   office, luxury, hospitality) weights network + interpersonal + trust-building as much as
   courses/reading, and (d) keeps listings accurate. **Recruiter filtering:** strip recruitment-agency
   listings from `jobs`/`reed` results (Lexi wants them out; prompt already bans agencies from company
   suggestions but live listings don't filter). Honesty is the product's differentiator — high-stakes,
   worth doing carefully (consider `/grill-me` on what "honest realism" means first).

6. **Anonymous-auth migration — the sign-up carry-forward fix** _(Opus, architecture; PLAN FIRST, Lexi
   approves before any code)._ Replace the hand-rolled sessionStorage CV/result bridge with Supabase's
   built-in **anonymous sign-ins + link-to-permanent-account** (the industry-standard deferred-registration
   pattern). Every visitor gets a real anonymous account on landing, so CV + transcript + directions persist
   server-side from second one; on signup we attach the email to the account they already have, so nothing
   is "carried forward". **Fixes the root cause found 2026-06-26** (advisor saw an empty account on in-place
   signup: the analysis result was never server-saved on that path, and the CV flush raced the first context
   build; full writeup in AUDIT-REPORT "Live-test feedback" A/B). **Keeps the no-commitment try-before-signup
   flow — Lexi's hard constraint.** GDPR obligations to build alongside: a privacy-notice line covering
   pre-account data, cookie consent covers the anon token, **auto-delete abandoned anonymous accounts
   (30–90 days)**, CAPTCHA/rate-limit on anonymous sign-ins, and solicitor sign-off (rides the existing
   contact-discovery legal question). Standard pattern, confirmed legal with these duties handled.
   **Full plan (verified vs Supabase docs, awaiting Lexi's approval): `docs/plans/anonymous-auth-migration.md`.**
7. **Live-test sweep (2026-06-26)** — the voice/UI/design fixes + bugs from Lexi's full-flow walk, full list
   in **AUDIT-REPORT-2026-06-22.md → "Live-test feedback"**. The *quick sweep* (no auth dependency, ships
   first): em dashes removed, over-honesty softened platform-wide, opening + sign-in-gate copy, "+" file
   button, input textarea wrap, drop the direction-1 orange highlight, no London assumption, scam dead-end
   copy. Plus regulated-domain eval personas. The continuity bugs (A/B) are fixed by item 6.

**Locked product decisions (confirmed 2026-06-22):**
- Jobs are **stable** for returning users — never reshuffle on login; only change on direction/keyword change.
- **Daily-new-roles:** real per-day detection of genuinely new listings + on-demand "show more".
- **New-user role cap:** ~5–8 strong roles initially.
- **CV homes:** uploaded CV → Profile; tailored CVs / cover letters → Documents.

---

## PART 1 — Honest current state

### What genuinely works
- (verified) Next.js App Router structure is sound; API routes are organised and auth-gated at the
  middleware layer for protected endpoints.
- (verified) The analysis pipeline runs: CV in → two Claude calls → structured profile + directions.
- (verified) Auth works (Google OAuth + email OTP via Supabase).
- (verified) The visual token system in `src/app/globals.css` is clean — no stray hex values.
- (verified) Problem validation is real: 3/3 interviews flagged the core pain unprompted.

### What's broken or missing — by domain, ranked

**A. Product & architecture (the core problem)**
1. (verified) **Advisor has no memory and no agency.** `chat/route.ts` pastes a frozen snapshot of
   the last analysis into the prompt. It cannot change a direction, save a job, or update a profile.
   It does not learn over time. This is why it feels like "a dashboard with a chatbot."
2. (verified) **Jobs are a keyword search, not intelligence.** `jobs/route.ts` queries Adzuna with
   analysis keywords; weak keywords → weak jobs. If scoring fails, every job silently shows as
   "Possible fit." Location defaults to London. This is the "wrong seniority/industry" complaint.
3. (verified) **App state lives in the browser tab** (`sessionStorage`, 10 components). New device or
   cleared tab = state gone. Wrong foundation for a "daily companion that remembers you," and a prime
   suspect for the random "couldn't load" crashes.

**B. Engineering floor (missing entirely)**
4. (verified) **Zero tests. Playwright is not even installed** — despite the roadmap claiming it is.
   This is why Lexi is the test suite.
5. (verified) **Database schema is not in the repo.** 5 tables, only 2 have migration files. No
   source of truth for the data model; it has already broken once.
6. (verified) **Zero production visibility.** No Sentry, no analytics. If it breaks for a user or they
   drop off, neither of us will know.

**C. Security**
7. (verified) **"Delete account" misses the `profiles` table** — incomplete GDPR erasure.
8. (verified/unverified) **Dashboard pages are not server-gated** (middleware only guards `/api/*`,
   contradicting its own comment). Data isolation depends entirely on Supabase RLS, which **cannot be
   confirmed** for 3 of 5 tables because their schema isn't in the repo. Must be verified before any
   real user signs up — this is the line between "private" and "anyone can read anyone's CV."
9. (per docs) GitHub token still exposed and unrotated — live risk.

**D. Legal & compliance**
10. ICO registration not done; privacy policy and terms are stubs. All block a real launch.

**E. Design & UX**
11. (verified) **Structural, not visual.** Dashboard-with-side-chat can't feel like a mentor. The
    fix is conversation-first, and it comes with the spine rebuild.
12. (verified) **Arlo's smiley-face SVG reads childish.** Remove now, not Phase 4.
13. (verified) Brand still says "Career Intelligence" in-app; "Meridian" rename not built.

**F. Observability & cost**
14. (verified) Chat uses Sonnet + web-search beta; analyse uses 2× Sonnet; score uses Haiku. Costs
    are reasonable but **unmonitored** — no spend visibility.

**G. Documentation & repo organisation**
15. (verified) **2,623 lines across 5 overlapping "source of truth" docs** that conflict and
    overclaim. Two separate root audit files + two audit prompts. Parking-lot ideas in 3 places.
16. (verified) **91 MB of design assets (151 PNGs) committed in the code repo.** Bloats every clone.
17. (verified) Dead `legacy/` folder (old single-file product) still present.

### The trust gap (root cause of "going in circles")
The roadmap says Playwright is "in the stack" (it isn't) and that conversation history is wired
through the chat route (it isn't). **Decisions have been made off documents describing the hoped-for
product, not the real one.** Fixing this is non-negotiable: one source of truth, and it must be true.

---

## PART 2 — The rebuild, sequenced

**Principle: floor before spine, spine before body.** We do not launch a stripped product. We launch
the spine plus a few things done excellently; the breadth returns fast because it finally attaches to
something load-bearing.

### Step 0 — The engineering floor _(nothing real is built on sand)_
- [x] Put all 5 tables under version-controlled migrations; confirm RLS is on every table.
      _(S40: migrations for profiles/results/saved_jobs added in `supabase-migrations/`;
      `verify_rls.sql` + README. ⬜ Lexi to run them in Supabase SQL Editor + run verify_rls.sql.)_
- [x] Install Playwright; write E2E tests for the core flows. _(Done S38–39: `test:e2e`,
      `test:e2e:prod`, `test:e2e:live`.)_
- [x] Add Sentry (errors) + Vercel Analytics (funnel). _(S40: wired, dormant until a Sentry
      DSN is set. ⬜ Lexi to create a Sentry project + add `NEXT_PUBLIC_SENTRY_DSN` to activate.)_
- [x] Move app state off `sessionStorage` onto the server as the source of truth.
      _(S40: `src/lib/analysisResult.ts` — server-first, all 7 read sites converted.)_
- [x] Set up enforcement hooks (see Part 5). _(S40: `.claude/settings.json` — SessionStart
      branch check + pre-commit e2e gate. Live next session / after `/hooks` reload.)_
- [x] **Fix deployment:** one stable auto-updating URL. _(S40: production branch → `staging`;
      stable URL `career-intelligence-xi.vercel.app`. Fixed the first build failure —
      `NEXT_PUBLIC_SUPABASE_URL` was missing from the Production env; added it.)_
**Done when:** Lexi can't open a broken build, because a broken build can't pass the gate.
**Step 0 status:** built + verified locally; **Lexi's two remaining clicks** = run migrations
in Supabase, and (optional) add the Sentry DSN.

### Step 1 — The spine _(the real, shareable v1)_
- [x] **Profiles fix (S41):** live `profiles` table now keyed on `id` with a `data jsonb` column
      (migration `20260612_profiles.sql` — ⬜ **re-run in Supabase SQL Editor**); `/api/profile` and
      `/api/chat` rekeyed via `src/lib/profile.ts`. Profile feature + advisor memory now actually work.
- [x] **Advisor memory + agency, one tool_use system (S41):** `src/lib/advisor-tools.ts` — `remember`,
      `update_profile`, `update_direction`, `save_job`, `set_application_stage`. Server-side tool loop in
      `chat/route.ts`. Memory = the `remember` tool writing to `profiles.data.memory`, read back by
      `buildUserContext`. "Done" changes real DB state, echoed visibly in the chat (`meridianActions`).
- [x] **Advisor initiates (S41):** `useArloChat` fires an opener (`initiate`) on first load with no prior
      conversation — the advisor opens, doesn't wait.
- [x] **Jobs that are right (S41):** seniority-aware Adzuna search (`what_exclude` for entry-level) +
      nationwide default instead of forced London; RolesPage passes seniority + real location.
- [x] **Kill the childish face + begin Meridian rename (S41):** advisor smiley avatar replaced with an
      abstract meridian mark across every dashboard panel + input; wordmark "Career Intelligence" →
      "Meridian" in nav, all dashboard sidebars, and page title.
- [ ] **Conversation-first surface:** the advisor *is* the interface, not a panel in the corner. _(Deferred —
      big design thread, separate from this build session.)_
- [ ] **Staged rebrand follow-up:** hero/loading/error/404/crash faces still smileys (marketing surfaces,
      tied to the deferred homepage redesign); advisor keeps the "Arlo" name per the S37 decision until the
      pre-university-pitch rebrand.
**Done when:** 3–5 real people go through it and the "click" (Meraki → Satori) lands for someone who isn't Lexi.

### Step 2 — The body grows back _(on a real spine)_
Skills, applications pipeline, company research, CV tailoring, cover letters — each advisor-driven and
memory-aware. Features that "already exist elsewhere" feel different because the advisor does them *for*
the user, knowing everything about them.

### Step 3+ — Intelligence, integrations, B2B
Self-auditing intelligence loop, Glassdoor/Reed/salary depth, email/calendar, then the university wedge.
All require the spine to exist first.

---

## PART 3 — Design direction
- **Keep:** the token system, palette, type. It's competent; a from-scratch repaint is not the priority.
- **Change (structural):** move to conversation-first. This is the real redesign and it's bundled with Step 1.
- **Remove now:** the smiley-face SVG. It undermines the serious-mentor positioning.
- **Supersede:** the 30 HTML mockups are reference artifacts; the React build is the truth. Homepage v3 stays shelved.
- **Stage:** full "Meridian" visual rebrand (astronomical texture, no face) — begin the rename in the rebuild, finish before the university pitch.

---

## PART 4 — File & repo reorganisation
- [ ] **Consolidate docs into this file + a slim CLAUDE.md.** Archive ROADMAP/INSIGHTS/PLAYBOOK content
      that is still useful into clearly-dated reference, delete the overclaiming parts. One parking lot.
- [ ] **Get the 91 MB of design assets out of the code repo** (separate location or gitignored).
- [ ] **Delete `legacy/`** (it's in git history if ever needed).
- [ ] **Merge the two root audit files** into Part 1 of this doc, then remove them.
- [ ] **Fix the document hierarchy** — remove references to stale files (`tokens.css`, `BASE44_HANDOVER.md`).

---

## PART 5 — How we work now (the upgrade)
1. **Enforced hooks, not promises.** Session-start hook runs `git branch` + surfaces the plan. A hook
   runs Playwright before any "done"/commit. The harness runs these whether Claude remembers or not.
2. **Tests are the gate.** No flow is "done" until its test passes. Lexi tests last, not first.
3. **One source of truth.** This document. It must always be true; overclaiming is a bug.
4. **Batch sessions.** Agree the session list upfront, build autonomously, push once, Lexi reviews at the end.
5. **Slim CLAUDE.md** to the load-bearing rules; everything else lives here.

---

## PART 6 — Open decisions for Lexi (to refine together)
1. **How conversation-first?** Full chat-first product, or conversation-led with the dashboard one click away?
2. **Timeline & appetite:** how many sessions before sharing with 3–5 contacts? (Recommend: Step 0 + Step 1 only.)
3. **Paid services:** OK to add Sentry (free tier) now? Any budget ceiling for tools?
4. **Rename now or staged?** Begin "Meridian" rename during the rebuild, or hold until pre-launch?
5. **Reorg appetite:** comfortable deleting `legacy/` and moving design assets out of the repo?

---

---

## PART 7 — Strategic direction & positioning _(the north star — do not lose this)_

### The emotional arc (permanent)
**Meraki → Satori → Kavanah.** Arrive with your whole self → something clicks → move forward with
intention. Every design and product decision moves the user along this arc.
- **Meraki** (Greek): pour your whole self in. You arrive wholeheartedly.
- **Satori** (Japanese): the sudden clarity. The path becomes visible where there was only noise.
- **Kavanah** (Hebrew): intention of the heart. Forward motion with meaning, not just motion.

### Who the user is
Someone at a genuine crossroads — exhausted *before* they've applied, by direction confusion,
credential anxiety, parental pressure, "was my degree wrong," "is it too late to pivot." Scrolling
job boards for weeks and feeling more lost. **Not looking for more listings — looking for someone who
gets it.** Lexi is this user; the product is lived experience, not desk research. That conviction is
the rarest asset we have.

### The founding truth & the promise
The primary job is **orientation, not job search**. You must help someone know what they want before
anything else is useful. The "click" is: *"this is where I could be, and this is how I get there."*
The emotion delivered is **grounded hope** — realistic, achievable, specific hope with a path. Not
cheerleading, not therapy. The hidden tagline: *"whoever made this gets me."*

### The emotional arc, moment by moment (design targets)
| Moment | Emotional target |
|---|---|
| Homepage, first 5 sec | **Trusted relief.** "How have I not seen this before" — inevitable, not surprising. Not AI slop. |
| Input page | **The moment of trust.** Not a form — a conversation. Questions one at a time. |
| Loading | **Seen, not processed.** Someone is thinking about *you*. |
| First direction | **Satori.** "I see you." The path becomes visible. |
| Daily return | **Pride.** Eager to report back, like telling a coach your win. |
| Hard days / silence | **Never guilt.** "You're back — that's what matters. Here's one thing." |
| After absence | **Continuity.** No gap mentioned. "Welcome back." |
| 3 months in | Someone who knows your journey and speaks to exactly where you are. |
| Day they get the job | **A new chapter, not the end** — evaluate the offer, celebrate, first-90-days. |

### Voice — permanent principles
Always "I" and "you." Warm AND economical — short sentences, never walls of text. Reflects back what
the user actually said (proves it listened). Direct without being clinical, honest without flattery.
**Reframes modern reality** ("in a traditional world you'd have needed X; now you can come from any
background — you just need to close the gaps"). Never tells — shows, asks, waits. Test for every line:
*could a trusted mentor who just read your CV say this out loud?*

### What it must NEVER be or say
Never: clinical / corporate / "an AI" · a job board to manage · disappointed in you · gamified
(no streaks/badges/points) · overwhelming. Never say: "we'll get you a job" / "guaranteed" · stats we
don't have · "AI-powered" · generic advice · flattery · urgency/countdown language · anything that
reads like ChatGPT · "we understand how you feel" as boilerplate. **Claims grow only with evidence.**

### Company vision & the flywheel
Stay independent. Become the modern LinkedIn — essential through genuine value, not network lock-in.
**Compounding intelligence is a founding principle, not a roadmap item:** every success, every outreach
that landed, every right-fit role makes the next person's experience better. The product that's helped
10,000 is categorically more valuable than the one that's helped 10. Design every decision with the
flywheel in mind.

### The evolution path (B2C → B2B)
1. **Now (B2C):** self-discovery + mentorship as the core. Prove the click happens.
2. **Phase 4 (B2B wedge):** university careers offices pay; graduates use free. Builds a validated,
   direction-aware talent pool. Pitch: "we make your careers office more effective, not replace it."
   Target 3–5 smaller universities first via LinkedIn outreach + one free pilot cohort. **Validate one
   conversation before building anything for universities.**
3. **Phase 5+ (employer network):** with that talent pool, warm introductions to employers — the
   Jack & Jill network model, but with a moat: our candidates are self-aware and prepared.
**B2C must prove itself before B2B is pursued. Do not raise B2B before Phase 4.**

### Outstanding strategic flags
- **GDPR on contact discovery** — solicitor opinion outstanding; gates the contacts feature.
- **Ethical boundary of emotional support** — how far into emotional territory should the advisor go?
  Needs a written design principle. It holds space; it is not a therapist.
- **Dad (Anthony / Vesper Investments)** is a strategic investor + advisor, not just family. Vesper
  verdict was WATCHLIST (5.8/10); four blockers: no technical co-founder, no validated route to market,
  AI-velocity risk (no proprietary data yet), unresolved GDPR. The flywheel + this rebuild address two.

---

## PART 8 — Competitor intelligence _(the landscape, captured)_

**Our lane in one line:** everyone else assumes you know what you want. We serve the person who
doesn't — discovery + mentorship first, application second. The advisor is the product; listings are a
utility. **Never pitch "we find you jobs."**

### Jack & Jill AI — the funded one
AI recruiting marketplace. "Jack" = free job-seeker agent; "Jill" = employer recruiter tool. Fleet of
named agents (Juno, Joe, James…). **~200,000 users, $20M funded (Anthropic/Lovable-backed), 60+ PRs/wk.**
Matches seekers to employers via a ~20-min conversation + warm intros to hiring managers. **They own the
"I know what I want" market.** They open-sourced their agent-persona framework (the Juno "soul" model is
our reference for advisor character). _Our edge:_ they assume direction; we create it. We are upstream of
them — our 6-month user becomes their candidate.

### Jobeefy.app — the feature benchmark
Canadian job-search copilot, solo/small team, ~12 weeks ahead of us, built in public. **Utility-first,
no emotional personality, streak gamification (wrong register), FAQ-bot not a companion.** Their feature
set is our build checklist for the "body": ATS resume scorer, resume tailoring + version history,
LaTeX/ATS-safe PDF export, AI cover letters (tone control), LinkedIn optimizer, text + voice mock
interviews (STAR-scored), application Kanban, insights/funnel dashboard, live jobs (30-min refresh),
salary insights, saved searches + alerts, auto-apply queue. Pricing: free tier (strict limits) → $9.99 →
$19.99 (most popular) → $29 CAD/mo; voice mocks priced as paid add-ons ("no fake unlimited"). _Our edge:_
direction discovery, values matching, Arlo, a far higher design bar, UK-first. _Adopt the execution
quality of their tools; reject their register._

### Perplexity Computer — the premium autonomous agent
$200/mo autonomous agent; job applications is one template. LinkedIn OAuth → role matching → CV tailoring
→ cover letters → tracking, executed async in a cloud sandbox (Claude Opus core + multi-model routing —
the "never show the seams" pattern we already use). **Fails undirected users completely** ("vague
instructions produce poor outcomes"), no emotional intelligence, no discovery layer, $200/mo rules out our
market. _Not a competitor — a potential future integration our user graduates into._ Their landing page
(serif headline, single-input hero, feature-card grid, plain-English loading checklist) is a useful
homepage reference alongside Resend/Linear/Craft.

### Apt AI — noted
Documented during Session 32 audit as a competitor to monitor. _(Detail in the Session 32 audit file;
fold the relevant notes here when we consolidate.)_

### Validated problem signal (3/3 interviews, May 2026)
Direction confusion · application silence as the specific wound · motivation collapse/avoidance · human
contact understood as the answer but inaccessible · LinkedIn broken and everyone knows it · users already
compensating with workarounds + AI tools. **17 interviews remain** — restarting these is the cheapest,
highest-value validation available and has been stalled for a month.

---

## PART 9 — The complete feature catalogue _(nothing left out, mapped to the rebuild)_

_Every feature discussed across ROADMAP, the emotional vision, and brainstorms — organised by where it
sits in the spine-first sequence. Phase tags preserved. This supersedes the scattered lists._

### Step 1 — The spine (the real v1)
- Conversation-first advisor surface; advisor **initiates**, doesn't wait (the "feels like a mentor" fix)
- Advisor **memory** (evolving model of the user) + **agency** (tool_use: update direction, save job,
  change stage, update profile, mark skill)
- **Direction refinement** — reject a direction ("not marketing"), it updates everywhere; direction is
  mutable state, not static output
- **Jobs that are right** — sector- + seniority-aware keyword strategy, location/salary in search,
  honest "fit" not scores, relevance reasons worth reading
- **CV tailoring per job** (real document, not tips) · **Cover letter per job** (Arlo writes, user approves)
- Kill the childish face; begin the Meridian rename

### Step 2 — The body grows back (advisor-driven, memory-aware)
- **Per-job application journey** (progressive disclosure): CV builder · contact finder · cover letter ·
  application tracker · interview prep · company research · post-application guidance
- **Application focus mode** — click "next step" → focused work surface, advisor on the right
- **Skills gap map** — interactive, in-progress/done states, CV auto-updates on completion
- **ATS-aware guidance** — contextual, honest, never a keyword score
- **Follow-up email writer** · **company research layer** · **full pipeline tracking**
- **Daily check-in / coaching questions** — one self-discovery question per session (return mechanic,
  no completion pressure); source: reflection questionnaire synthesis session
- **Self-knowledge layer** — the 5 identity questions ("who are you without your labels?" …) surfaced
  gradually, never as a form. Privacy of a diary, attentiveness of a conversation. Earned, not the entry point.
- **Restart behaviour** decision · **implicit/explicit away mode** · **company response-time / silence map**
- **Industry encyclopaedia** — show what exists before you search (interviewees couldn't search for the
  unknown) · **CV creation from scratch** · **live/auto-refreshing job matches**

### Step 3+ — Intelligence & data depth (Phase 4)
- **Platform intelligence & self-audit loop** — monitors tone, data accuracy, logic across role-based
  audit personas + 5 user archetypes
- **Direction evolution tracking** — "in June you were unsure; now you know" (Satori proof over time)
- **Email alerts for new matches** (Resend, opt-in) · **Monitor & Alert** ("Arlo spotted something")
- **Email inbox integration** (Gmail/Outlook read-only — auto-detect invites/rejections/offers) ·
  **Calendar integration** · **WhatsApp/SMS** for urgent moments
- **LinkedIn OAuth import** (friction reduction vs CV upload) · **contacts / industry intelligence page**
  (⚠️ GDPR sign-off first) · **Glassdoor** (interview process, culture, salary, real questions) ·
  **Companies House** · **Reed + additional sources** (CharityJob, Prospects) · **UK salary benchmarks**
  (Adzuna extraction → ONS ASHE fallback) · **offer evaluation** (salary, red flags) ·
  **application tracker export** (Google Sheets)

### Step 4+ — Growth, polish & future vision (Phase 5–6+)
- **Advisor character elevation** (full backstory, Rive animation) · **design elevation pass** (Figma) ·
  **page transitions & animations** · **voice interview practice** (Web Speech API MVP → Whisper/TTS) ·
  **Arlo-only conversation mode** · **mobile** (deferred until desktop proven) · **shareable direction card**
- **Blog / SEO content** (UK early-career clusters) · **funnel analytics** (gated to 10+ apps) ·
  **MarketingSkills plugin** · **performance audit**
- **Future vision:** university career-portal integrations · **in-job progression** (develop, get
  promoted) · **international users** (visa sponsorship, legal docs) · **autonomous job applications**
  (auto-apply — legal + product session first, not before Phase 6) · **B2B employer + university
  licensing** · **freelance/contract track** · **Masters applications** · **promotion/internal-move
  tracking** · **AI workflow digest** (WAT automation side-project) · **Google Drive/Dropbox** CV
  versioning · **"avoidance mode" onboarding** for users who've given up
- **Parking lot:** full Opus four-perspective audit before university outreach · per-company
  response-time tracker

### Explicitly decided NOT to build
Streaks/gamification · bring-your-own-API-key · ATS keyword score as the primary metric · CV
watermarking · credit-based/opaque pricing · multi-agent exposure to the user (Arlo is one person) ·
async-first execution (our users need real-time reassurance).

---

## Document consolidation note
This file now carries the audit, the rebuild sequence, the strategy, the competitor landscape, and the
full feature catalogue. As agreed, ROADMAP.md / INSIGHTS.md / PLAYBOOK.md get reduced to dated reference
or folded in here; CLAUDE.md slims to load-bearing rules enforced by hooks. ADVISOR_PERSONA.md and the
emotional-vision brainstorm stay as the canonical voice/emotion sources — linked, not duplicated.

---

_Next: refine Part 6 with Lexi, then turn Step 0 into a concrete task list and begin._
