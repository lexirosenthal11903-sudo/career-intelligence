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
- **▶ RETRO-AUDIT past research against the new research standard (Lexi, 2026-06-27)** — `application-effectiveness.md` + `mentorship-research.md` were written BEFORE the 8-point research bar + independent-review step (WORKING-PRACTICES → "Research-grounded building") existed, and both already ground LIVE advisor behaviour (CV/cover-letter; first-session). Same errors we found in outreach (stale facts, off figures, commercial stats as fact) could be baked in now. **Action:** run each through the same pipeline — independent reviewer audit → fix → re-grade. Priority = these two (live); competitor docs lower priority (go stale naturally, assert no grounding facts). **STATUS 2026-06-27:** both audited; live blockers FIXED + pushed (49%→46%, cheating misread, 65/95 folklore removed, distress-signpost added to live prompt). **▶ NEXT SESSION FIRST TASK:** the residual doc-completeness should-fixes — add a formal "Known gaps / lower-confidence areas" section to BOTH `application-effectiveness.md` and `mentorship-research.md`; re-tier a few citations as practitioner/commercial + add an institutional source for the mentorship "refer on" boundary (EMCC/CIPD); add a scope note to both that the product now serves ALL ages/levels (not graduate-only); add review dates. (Known-gaps section is already mandatory at creation for NEW research per the bar point 8 — this is retrofitting the two pre-bar docs.) **Industry coverage rule (set 2026-06-27):** the product caters for ALL, not just graduates (early-career is the go-to-market BEACHHEAD, not the ceiling — Lexi 2026-06-27). Canonical industry/occupation list = National Careers Service job categories + ONS SOC/SIC (all ages + levels), with Prospects kept only as a supplementary graduate lens; the spectrum framework covers the long tail; depth follows real-user demand later.
- **◌ PARK (tooling/QA, needs its own design conversation) — synthetic-persona "co-worker" agents (Lexi, 2026-06-27):** set up agents with different user profiles (varied backgrounds, sectors, confidence levels, life stages) that routinely USE the platform end-to-end and feed back anything they identify (UX friction, weak advisor output, broken flows, missed opportunities). A standing automated dogfooding panel / "co-work" loop, not a one-off eval. Extends the existing 17-persona advisor eval into full-journey usage. Best set up once the core loop is walkable end-to-end (it tests a real flow); becomes a force-multiplier for the build-breadth-first-then-polish approach. Related: `project_test_eval_infra`, webapp-testing.
- ○ **CV build from scratch** — for users with no CV on file. Advisor uses the profile it already knows (values, aspiration, direction, self-knowledge answers) to generate a skeleton CV in the target direction. User fills in the specifics; advisor coaches them through it. Same API architecture as tailoring, different prompt. _(Lexi, 2026-06-24)_
- ○ **"Why am I not hearing back?" diagnosis** — paste role + CV → real reasons + fixes. _Likely killer feature._ ⚠️ Has its own dedicated research thread within the application-effectiveness research session — the failure modes (ATS filter, volume, level mismatch, timing) must be sourced before building so the advisor gives specific, accurate diagnoses rather than guessing. See parking-lot.md.
- **▶ Networking / outreach (BUILDING NEXT — research in progress 2026-06-26)** — warm intros + drafted outreach. ⚠️ The referral reality (research suggests ~30–50% of hires come through referrals — stat to be verified in the research session with UK primary sources) means this is not just a "nice to have" outreach feature — it's one of the highest-leverage things an early-career person can do. The product needs to reflect this honestly. Platform idea: a way to help users CREATE referral relationships, not just draft cold messages.
  - **Grounding:** dedicated UK-2026 outreach research → `research/outreach-research.md`. Pass 1 done + passed the 7-point research bar. Pass 2 (Lexi pushback 2026-06-26): comprehensive industry coverage (24+ sectors), stronger primary/institutional sources, missing edge cases (no-network/low-social-capital — mission-critical — career-changers, international students, regional, accessibility), THEN an independent reviewer agent audits for gaps/errors before any build. _(Lexi raised the need 2026-06-26 — correct call; her completeness pushback upgraded the research standard itself.)_
  - **Sibling idea (PARK — needs its own conversation, Lexi 2026-06-26):** platform guides users to relevant **communities + events** to join (industry meetups, sector networks like The Dots/BECTU/Creative UK, alumni groups, online communities). A warmer, lower-anxiety on-ramp than cold outreach. Discuss depth/scope when the time is right; don't build speculatively.
  - **Shape = contextual + advisor-prompted (Lexi, 2026-06-26), NOT a static panel:**
    1. **Exploring an area with few/no live jobs** → advisor proactively asks if they want suggestions for people to reach out to (outreach becomes the primary route in).
    2. **A specific listed role** → clicking into the role surfaces outreach help for someone relevant to *that* role.
    3. **Direction → roles view** → a gentle reminder they can ask for help with outreach/contacts.
  - GDPR-safe tier only for now: identify the *right kind of person* → deep-link search to find them (no scraping, no invented contacts) → drafted message in the user's voice. Licensed-contact tier later, gated on solicitor opinion.
  - **Slice plan (locked 2026-06-27, Lexi):**
    - **✅ Slice 1 — DONE (`d45acbb`, the GDPR-safe green core, in-chat):** `draft_outreach` advisor tool (mirrors `tailor_cv`/`write_cover_letter`). Advisor probes warm-first ("do you know anyone there, or anyone who's been there?") → names the right *type* of person → generates a clickable LinkedIn people/alumni **deep-link search URL** → co-drafts a short, sector-calibrated message (ask = a 15–20 min conversation, never a job/CV) → `mailto:` click-through when email fits → one follow-up max. Grounded inline in `research/outreach-research.md`. No scraping, no stored third-party data.
    - **✅ Slice 2 — DONE (`f5b8eda`, 2026-06-27):** (a) three role-page / direction entry points, all advisor-led (route a contextual prompt into `draft_outreach`, no backend): few/no live listings → "Ask Arlo who to reach out to"; a specific direction (role detail) → "Help me reach out to someone in X"; direction → roles view → a gentle "not all roles are advertised" nudge. (b) **paste-to-tailor** — `draft_outreach` gained an optional `foundContext` param: when the user pastes a post/profile/bio *they* found, the message opens by referencing something genuine from it. Conversational (no new UI), processed transiently, capped 1500 chars, never stored as a contact. GDPR posture unchanged; pasted text lands in the user's own chat history → flagged for the pending solicitor review.
  - **🔴 Out of scope (legal + contractual + breaks £0):** us monitoring/scraping LinkedIn for posts/people to surface ("this person posted about X — reach out"); buying/enriching contact data; sending on the user's behalf; drafting to multiple contacts at once. The user can do these things a human normally does; we never do the *discovering, fetching, or sending* at machine scale.
  - **Pre-launch (Lexi 2026-06-27):** solicitor review of the outreach feature's data handling — added to the pre-launch non-negotiables alongside ICO registration + privacy policy. Build to the research-locked GDPR-safe standard now; legal sign-off before real users.
- ○ **"I've seen a role I'm interested in"** — user pastes or describes a role they found elsewhere (LinkedIn, a friend, a site); advisor engages with it exactly as it would a matched role: tailoring, outreach, diagnosis, prep. The platform should never require the user to have found the role here. _(Lexi, 2026-06-25)_
- ○ **Paste-a-link — read + scam-check a job from a URL** — the user should be able to paste a job link and not do more work; today the advisor can't open links and asks for the full description (a dead end, worst exactly when checking a dodgy job). Build properly: server-side fetch + readable-text extraction so the advisor reads the listing; **flag scam signals + verify the employer is a real registered company (Companies House)**; graceful fallback for sites that block fetching (LinkedIn especially). ⚠️ Do it properly or not at all (Lexi). Overlaps the Step-3 scam-protection guardrail + networking employer-verify. **Until built**, the "can't open links" reply must at least offer the employer check + scam red-flags, never dead-end (that copy fix is in the live-test sweep). _(Lexi, 2026-06-26)_
- ◌ **PARKED DECISION — company-type suggestions as an outreach-targeting tool** — the analysis ALREADY generates `companySuggestions` ("types of company that suit this person + why") on every run, and CSS exists for it, but the dashboard render was never wired. **Do NOT build it speculatively** — risk is generic/duplicative-of-directions output (anti-persona). Decide WHEN we build outreach: if "target these company types" genuinely sharpens a user's outreach list → finish it here; if not → cut it cleanly, including removing it from the analysis generation so we stop paying advisor tokens for it. _(Lexi + Claude, 2026-06-26)_
- ○ **Internship application windows (timing intelligence)** — for the internship/early-career archetype: tell users WHEN schemes open and close (many big internship/grad schemes open in autumn and close early, rolling) so they apply at the right moment instead of missing the window. Genuinely on-mission (right application, right time). ⚠️ The hard part is the DATA, not the UI — internship deadlines aren't in a clean free API; they're scattered across employer sites. Belongs with the Grounded-knowledge layer (Step 3) for sourcing; £0 constraint applies. _(Lexi, 2026-06-26)_
- ○ **LinkedIn import** — user connects LinkedIn; advisor uses it to fill in the profile (work history, skills, education) and improve the quality of its read. Richer than a CV alone — captures endorsements, tenure, activity. Also the B2B data-export path later. _(Lexi, 2026-06-25; already noted in Step 4 — pulled forward because the user-understanding value is immediate)_
- ○ **Interview prep via the advisor** — role-specific preparation. TWO parts: **(1) Planning** — the likely question types for this role/sector and how to prepare for them (grounded). **(2) Live mock interview (Lexi, 2026-06-27)** — the advisor actually *runs* a mock interview, calibrated to the interview TYPE (competency/behavioural, technical, case, strengths, panel, screening call), asks questions in turn, and gives honest feedback after. This is the mission made real for the interview stage: rehearsal, not just advice. Needs grounding research first (interview formats + what actually works) per the research-grounded standard; pairs naturally with the voice features below (speak your answers as you would in a real interview).
- ○ **Voice input — speak instead of type (Lexi, 2026-06-27)** — a mic button in the advisor chat: the user clicks and speaks, it transcribes into the input (speech-to-text), like dictating. Lowers friction for an anxious user — talking is easier than typing, and articulating out loud is itself useful. Near-term, achievable: the browser's built-in Web Speech API is £0 (no new paid service); a hosted transcription model is the higher-quality fallback if needed. Accessibility win too.
- ○ **Voice conversation — "call" the advisor (Lexi, 2026-06-27; later feature)** — a spoken, back-and-forth conversation with the advisor instead of typing (the Jack & Jill "call Jack" pattern). Real-time speech in + spoken responses out. Higher-effort (real-time voice stack, latency, cost > £0) and pairs especially well with the live mock interview. Park as a later feature; revisit once the core loop is proven. ⚠️ Costs and the £0 rule need a deliberate look before building.
- ○ **New-role alerts** — "spotted something" — genuinely new listings, the daily-companion return mechanic.
- ○ **Stalled-application nudge + optional email reminders** — when a user marks a role "interested" (it moves to Applications) and then nothing happens for a few days, the advisor gently checks in ("you saved the X role a few days back, want to take the next step on it, or let it go?"). On-mission return mechanic and it keeps applications moving instead of stalling. ⚠️ Must be a WARM mentor nudge, never nagging, guilt-tripping, or gamified (no streaks) — our user is anxious. Optional **email reminders** (opt-in only, explicit GDPR consent + an off switch; uses Resend, already in the stack) for users who want them. Design as ONE system with the agenda, decline-pattern detection and the recap ("the advisor remembers and follows up"), not a separate notifier bolted on. _(Lexi, 2026-06-26)_
- ○ **Decline-pattern detection** — notices when you keep passing on a type of role and asks
  conversationally ("you've passed on a few consulting roles — what's putting you off?"), uses it to
  refine direction. Never silently changes direction. _(from S10 brainstorm)_
- ○ **Mentor-session formats** — structured ways the advisor runs a working session (direction deep-dive,
  interview prep, application review, values exploration, CV building from scratch). _(own research+design effort)_
- ○ **Documents folder** — home for tailored CVs + cover letters (after those exist; uploaded CV lives in Profile).
- ◌ **The user's agenda — "what we're working through" (needs a brainstorm before building)** — for the overwhelmed user who offloads many wants at once. TWO linked pieces: **(A) Advisor holds + sequences a multi-topic agenda (behaviour)** — names all their asks back, helps triage urgent-vs-important, works ONE at a time, proactively moves to the next when one's done, never drops the rest. Grounds in the mentorship research (a mentor runs the session agenda); lives in ADVISOR_PERSONA + memory. **(B) A visible "working through" surface (UI)** — the user-facing mirror: to-cover / in-progress / done / parked-to-revisit, so they see progress and nothing's lost. ✓ On-mission (overwhelmed→prioritise→progress = Meraki→Satori→Kavanah). ✓ Return mechanic WITHOUT gamification (value-based progress, not streaks). ⚠️ TRAP: must NOT become a generic to-do/notes app — the advisor OWNS the agenda from the conversation, the user just sees/nudges it. Overlaps the recap card + advisor memory + decline-pattern detection — design as ONE "advisor remembers + runs your agenda" system, not a bolt-on. _(Lexi, 2026-06-26)_

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
- ○ **Employment rights & work law (curated, never AI-generated)** — the advisor will brush against legal questions (unpaid internships that are actually unlawful, worker status & minimum wage, contract types, probation, what an employer can/can't ask). AI-generating this is a liability + a safety risk for an anxious user. Source from **gov.uk + ACAS** primary pages (start: https://www.gov.uk/employment-rights-for-interns), store as facts the advisor retrieves, never invents. Protective, honest register — on-mission and a differentiator. See GROUNDED-KNOWLEDGE-PLAN.md item 8. _(Lexi, 2026-06-26 — from a LinkedIn post on intern pay)_

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
- ○ **Blog / articles page** — a content surface (career advice, the honest data we've researched, AI-and-work pieces). Doubles as SEO + credibility + a soft top-of-funnel. Low priority pre-100-users, but real and worth having documented so it's not lost. Natural fit for repurposing the sourced research (application-effectiveness, AI-and-the-future-of-work) into public, credible articles. _(Lexi, suggested earlier; logged 2026-06-26)_
- ○ **Community / communities** — spaces for users to connect (peers in the same field, same stage, same crossroads). Strong potential return + belonging mechanic and a possible moat. ⚠️ Big undertaking with real flags to think through BEFORE building: (1) **emotional register** — our user is anxious; a community can either reduce isolation OR add social-comparison pressure ("everyone else has a job"), which would fight the calm, no-gamification arc. Must be designed so it reassures, not competes. (2) **Safeguarding + moderation** — vulnerable early-career users need active moderation, reporting, and clear safety rules. (3) **GDPR** — user-to-user visibility of personal data. Phase 4+ at the earliest, after the 1:1 advisor core proves itself. Needs its own strategy/design session. _(Lexi, 2026-06-26)_

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
- **AI & the future of work — research session** _(Lexi, 2026-06-26)._ Credible-source research on how jobs
  have *already* evolved with AI and how they're forecast to keep evolving, by sector. Same primary-source
  discipline as the application-effectiveness research (ONS, OECD, WEF Future of Jobs, government/industry
  bodies, not blog speculation). **Purpose: AI literacy as a candidate-strength lever** — many users are
  anxious their field will be replaced; the advisor should give the honest, sourced picture AND turn it into
  an edge (the roles/skills that grow, how to show AI-literacy on a CV and in interview). On-mission: directly
  strengthens applicants. Feeds Step 2 (stronger candidates) + Step 3 (grounded knowledge / demand data).
  Output: `research/ai-and-the-future-of-work.md`, then advisor-prompt grounding. ⚠️ Honest, not alarmist or
  hype — same two-tier evidence labelling as the other research.
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
