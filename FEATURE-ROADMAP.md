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

> **⏳ FABLE-WINDOW PRIORITY (set 2026-07-04, Lexi — "do everything that needs Fable while we have it").**
> Fable 5 = our highest *reasoning* quality; spend it ONLY on design/architecture/research-synthesis where
> getting the thinking right once saves huge downstream rework — never on mechanical build (Sonnet/Opus).
> ⚠️ Check the actual access window: notes say the free-on-Pro/Max period ended ~2026-06-22, so it may
> already be paid — confirm before assuming a free window. **Sequencing rule for each:** `deep-research` skill
> GATHERS the facts → **Fable** reasons over them + writes the SPEC → build on Sonnet/Opus from the spec.
> **Order (do these as dedicated Fable design sessions, each after its research):**
> 1. **Job-role MATCHING quality + CV/cover-letter WIRING** (the research-first item under Step 2 below). Defines
>    the core of the product; compounds across everything. Research first, then Fable turns it into the design.
> 2. **The unified memory layer** (time-aware + emotional recall — the "advisor carries a memory" item + the
>    moat note under Step 2). The differentiator Jack & Jill can't copy; complex, many interdependencies.
> 3. **Job-persistence + daily-new-roles architecture** ([REBUILD.md](REBUILD.md) build-queue #1). Schema +
>    refresh-logic design with real trade-offs (this is the "how live jobs are chosen / new each day" question).

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
- ✅ **Proactive, focused mentor — the advisor engages, it doesn't just wait (Lexi, 2026-06-29; HIGH). BUILT 2026-06-29.**
  Grilled + research-grounded (`research/task-focus-and-switching-research.md`), specced in
  `brainstorms/engaged-focused-mentor.md`, behaviour in `ADVISOR_PERSONA.md` ("The engaged, focused mentor").
  Two behaviours, one loop (holding a thread creates the parked thread the return-opener reopens):
  1. **Proactive check-in on return.** On a meaningful return (new day / ~6h+ gap, not every login), the advisor
     speaks first, reading the recent transcript + durable open threads, and picks up the SINGLE most significant
     unresolved one (never a backlog, never mentions the gap). `useArloChat` now fires a resume-opener;
     `chat/route.ts` initiate path receives the transcript; suppressed if the user's already typing.
  2. **Hold the thread.** On a mid-task topic-switch the advisor holds relationally — acknowledge, offer a choice,
     follow their lead; reads avoidance-vs-need; closes on a specific next action; follows up "how did it go" not
     "did you do it". Parked threads stored in `profiles.data.openThreads` (invisible, clearable) via two new
     tools (`note_open_thread` / `resolve_open_thread`). Eval personas added (return / clean-close / topic-switch).
  - **Future (NOT built — practitioner-gated):** surfacing a cross-session *avoidance pattern* to the user
    ("I notice this comes up when we hit a commitment"). High value but needs a qualified practitioner to advise
    on framing for an anxious cohort before building (`task-focus-and-switching-research.md` gap 7).
- ○ **"Start fresh, keep the memory"** — a light session reset that doesn't wipe what the advisor knows.

**Cross-cutting principle (every surface):** *dual interaction* — the advisor path (tell it, it acts) AND
a direct path (click/drag/edit yourself) always both available. The advisor is a guide, never a gatekeeper.

## Step 2 — The candidate-strength loop (the heart of the mission)

Turn spray-and-pray into fewer, stronger applications + a foot in the door. _Architecture-heavy — plan on Opus._

- ✓ **CV tailoring** — tailor the CV to a specific role to beat the ATS. Advisor tool (`tailor_cv`) + `SavedJobDetail` Documents section. Downloadable as PDF. Explains each change. _(2026-06-25)_
- ✓ **Cover letters** — advisor writes it around the person's real angle (`write_cover_letter` tool). Shows in `SavedJobDetail` Cover letter section alongside the tailored CV. Downloadable as PDF. _(2026-06-25)_
- ✓ **Applications folder** — each saved role is a hub (stage + notes + tailored CV + cover letter + future interview prep). Applications nav item + `ApplicationsView` list. _(2026-06-25)_
- **▶ ROLE-INTEREST = a mentoring conversation, not document output (Lexi, 2026-06-27 — governs the whole of Step 2's behaviour; HIGH priority).** Today, marking a role "interested" jumps straight to "tailor your CV + write a cover letter." That is a job-dashboard reflex, not mentoring, and it is exactly what the product must not be. The right behaviour: when someone shows interest, the advisor gets curious FIRST and builds a *plan* with them before any document: (1) **why this one** — what actually appealed (role, company, mission, salary, a stepping stone); (2) **honest alignment** — how well it really fits them (ties to honest-matching, our differentiator); (3) **gaps / what they might be missing** to be competitive; (4) **the company** — what they do, what they value; (5) **the application process** — what it involves, timing. The CV / cover letter / outreach / prep are steps *inside* that plan, produced when the plan calls for them, not the opening move. ⚠️ **Must be paced and adaptive, NOT an interrogation** — one genuine question first ("what drew you to this one?"), then read the room (anxious user). Reuses the first-session "adaptive dial". 🔑 **The captured "why" feeds future recommendations** — this is the compounding moat Jack & Jill can't match for someone who doesn't know what they want. Folds into the agenda/memory system (item below) and the role-interest bugs (parking-lot 2026-06-27 PM #4). **Design before build — grill Lexi first.**
- ○ **Advisor carries a memory of what the user has done** — it should never re-ask for things it already has (e.g. it asked the user to paste the job description for a role it already holds the full listing for). The advisor's context must include the user's saved roles + their details, drafts made, outreach sent, and the captured "why". Root cause of the "advisor forgets / re-asks" bugs. Part of the one memory layer, not a separate feature. _(Lexi, 2026-06-27)_ **(Partial fix shipped 2026-06-27: the advisor now holds recently-saved roles' description + relevance, so it stops re-asking for a JD. The full layer is still the build.)** 🔑 **Prior-art map differentiator (2026-06-27): make memory TIME-AWARE ("it's been six weeks since that interview — news?") and EMOTIONAL ("you seemed anxious about the skills gap last month — has that shifted?"). Pi/ChatGPT do time-aware recall; NOBODY combines time-aware + emotional + professional memory in a career context. This dual-track return is the moat — store "when" + the felt state, surface only as hedged prompts, never stale-confident.**
- ○ **Recap card — fix the fake greeting + change the format** — the "where we got to" card still shows
  placeholder "Ellie" copy (a hard blocker before sharing) AND uses a summary-block format that the best
  returning-user products (NAVRYN, Reflection.app) deliberately avoid. **Prior-art map (2026-06-27): switch
  to a re-entry SHAPE — one specific observation + one open question + one piece of unfinished business
  (≤3 elements), future-facing, arc-level not just last-session.** Part of the memory/return system. _(Prior-art map)_
- ○ **Outreach saved per role + a cross-role "people I've reached out to" log** — drafted outreach messages persist on the role's hub (today the UI says "saved here once you're happy" but nothing actually stores them), AND a single view across all roles of everyone the user has approached, so they can track it all. Pairs with the stalled-application/follow-up nudge (Feature B) and the agenda/memory system — build as ONE memory layer. _(Lexi, 2026-06-27)_
- ○ **Advisor can open a tab/surface on request** — "show me the roles tab" should open it. Today the advisor can only open Documents (after tailoring a CV); the data flow is one-way (panel → chat). Add a chat → panel signal so the advisor can drive the workspace with the user. Small build, makes the advisor feel agentic. _(Lexi, 2026-06-27)_
- **▶ RESEARCH FIRST — application-effectiveness research session** — before building "why am I not hearing back?", outreach, or interview prep, do the research session that grounds ALL of Step 2. Full scope in [parking-lot.md](parking-lot.md) under "Session 2026-06-25 — application-effectiveness research". This session rewrites the CV/cover letter generation prompts AND grounds everything built after it. Do not build the next Step 2 feature until this is done.
- **▶ RESEARCH FIRST — job-role MATCHING quality + CV/cover-letter WIRING architecture (Lexi, 2026-07-03; HIGH).** Distinct from the application-effectiveness research above (which covers generation *prompts*). Lexi wants a full-scope research pass on **(a) how roles are matched to a person** — what actually makes a match high-quality and honest (fit signals, weighting, ranking, what the best products do), so we're not guessing; and **(b) how CVs and cover letters should be *wired and produced* end-to-end** for the most effective real-world outcomes (response rates, ATS + human readers), i.e. the architecture and flow, not just the prompt. Grade against the research bar, independent-reviewer audit, THEN build/change any matching or generation behaviour. **Do not "improve" matching or CV/letter quality by feel before this is done.** Note: the 2026-07-03 CV-id correctness bug fix (documents stored under a synthetic `chat-<slug>` id instead of the role's canonical id) is a *plumbing* fix and is NOT gated by this research — it ships independently.
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
- ✓ **DONE (2026-06-28, commit `a9435dc`) — Interview prep + conversational mock via the advisor.** Grounded
  in `research/interview-prep-research.md` §13. The advisor PLANS (format-first, never a generic top-10; STAR
  for competency, self-knowledge for strengths, structured thinking for technical/case; named-employer prep
  from published frameworks) AND RUNS A MOCK in chat (one question, real follow-ups, no mid-answer coaching,
  one concrete fix after, NEVER a score or empty praise; proactive reasonable adjustments; validate-then-act
  for nerves; integrity line on covert live AI). Entry: "Prep me for this role" + "Run a mock interview" chips
  under the saved job in Applications. Eval +2 personas (planning / mock) pass. **Still to come (parked, see
  the video-studio sub-bullet above):** the focused mock SURFACE, voice answers, then the webcam record/rewatch
  studio. The conversational mock proves demand first.
  - **✅ SHIPPED (2026-07-03, S50) — interview prep now lives IN the application.** Closes the per-application-
    artifacts gap: prep is no longer chat-only. Grounded in the 2026-07-03 prior-art scan (Prentus per-role
    questions, Big Interview saved answers, the "short editable sheet not a transcript/dashboard" pattern) and
    specced in `brainstorms/interview-prep-artifact.md`. Built all three pieces: (1) 5–8 **likely questions** for
    the role, (2) the user's **editable answers**, advisor-**seeded** first (never a blank box — the anti-homework
    rule), (3) a short **"focus for this interview"** note the advisor writes after a mock. New `save_interview_prep`
    advisor tool files a `documents` row `type: 'interview_prep'` under the role's **canonical** id (reuses the
    CV/cover-letter path + `ensureApplicationSaved`); merge logic (`lib/interview-prep.ts`, unit-tested) makes
    re-saving safe — a later focus note never wipes the user's edited answers. `PrepSection` in the app detail
    renders it live (`ci:prep-changed`); users edit answers via `PATCH /api/documents`. Deliberately NOT saved:
    transcripts, scores, filler counts (anxiety fuel + gamification). Also fixed in the same slice: **Remove from
    applications** now deletes the role's documents (CV/cover/prep) instead of orphaning them. Verified: 83/83 unit
    tests, lint + tsc + build clean, quick advisor eval green (a false-positive gamification regex was tightened).
    **Fast-follow (○):** none required — saved STAR answers were included in this slice.
  - ◌ **PARK / LATER PHASE — "Focused interview mode": a video mock-interview studio (Lexi, 2026-06-28).**
    A dedicated focused surface (the right panel goes full mock): "Start interview" → a question appears on
    screen → the user answers to their webcam, seeing themselves → it RECORDS each answer → they rewatch their
    takes → the platform evaluates the performance. Like Big Interview / Yoodli / Google Interview Warmup.
    Real value, on-mission (rehearsal, not advice), and aligned with the rise of async video interviews (§ research).
    **Why it is LATER, not now (Claude's honest POV):** (1) breadth-first — it's deep polish on ONE step before
    the candidate loop is even walkable; at 0 users the conversational mock proves the idea, the studio is the
    gold-plated version; (2) **£0 + storage** — video files are large; storing them is a real recurring cost we
    don't have, breaks the £0 rule; (3) **GDPR/privacy is serious** — recording users' faces is sensitive,
    near-biometric, and our data handling already needs solicitor review (outreach) — video raises the bar a lot;
    (4) **"evaluate the video" is the hard/expensive part** — cheap+honest = transcribe the audio and evaluate
    CONTENT (STAR, specificity) + delivery proxies (pace, filler words, length); evaluating VISUALS (eye contact,
    body language) is costly, contested, and risks penalising neurodivergent/EAL candidates — directly against
    our honest/inclusive stance (research says feedback on "clarity not accent"). **Staged path:** (a) NOW =
    conversational mock in chat (this build); (b) NEXT increment = a *focused* mock surface (one question at a
    time, no video) + voice answers (Web Speech API, £0) the advisor evaluates; (c) LATER PHASE = webcam record +
    rewatch + evaluation, gated on PROVEN mock demand + a £0/storage answer + solicitor sign-off on storing video.
    Detail in [parking-lot.md](parking-lot.md).
- ○ **Company-specific intelligence (cross-cutting — Lexi, 2026-06-27)** — make prep, CV tailoring, outreach
  and "why am I not hearing back?" specific to the actual *company*, not just the role/sector. ⚠️ **Glassdoor
  ruled out as a source:** its public/free API is dead (enterprise-partnership only since 2024, undisclosed
  pricing, owned by Recruit Holdings — breaks £0); scraping it is off the table because it violates their terms
  AND our own locked never-scrape principle (outreach research, GDPR). The £0, in-rules route instead: (1)
  **ground the advisor in employers' own published material** for big named employers (Amazon Leadership
  Principles, EY strengths process, Civil Service Success Profiles — public + authoritative); (2) **the
  user-paste pattern we already built** (outreach Slice 2 `foundContext`) — user pastes a Glassdoor review / a
  "what to expect" thread they found, advisor uses it transiently, GDPR-clean (lives in their own chat); (3)
  named UK careers per-employer guides (targetjobs, Prospects employer hubs). A **licensed data feed** is a
  Phase 3/4 question only if it earns its place. Recommendation: don't chase Glassdoor — published frameworks +
  user-paste gets ~80% of the value at £0. First lands inside interview prep; reuse across the other Step 2 tools.
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

- **✅ TAB / IA CLEANUP — SHIPPED 2026-06-29 (research-grounded; verified by live QA).** The "make the
  candidate-strength loop walkable" batch. Grounded in a Teal/Huntr/Simplify/LinkedIn prior-art sweep
  (saved = first stage of one pipeline; list-with-stage-pill beats Kanban at 1–5 applications; per-job doc
  hub + global library). All four observations done:
  1. ✅ **Applications count badge** — neutral, not amber. Also fixed: ALL count badges were amber (locked-rule
     violation) → now neutral. `--accent` reserved for primary button / user bubbles / active nav only.
  2. ✅ **Saved = Applications unified** — one stage-based board. Interested lands at a new first stage **"Saved"**
     ("hasn't started until you start it"). Stages: Saved → Preparing → Applied → Interview → Offer, aligned across
     the API, `save_job` and `set_application_stage` advisor tools. "Recent" opens a role INSIDE Applications
     (preselected), never a separate "saved" surface. Stage pill per row (Saved = ghost, live = filled, Offer = green).
  3. ✅ **"Roles" → "Live roles".**
  4. ✅ **CV/cover-letter home** — per-job hub primary + Documents as the all-files library (now shows cover letters
     too, was CVs-only). Both surfaces read the same `documents` rows.
  - Also fixed in-batch: Applications rows were rendering unstyled; stage changes now propagate from the detail
    view to the list pill + a present-tense "Now: <stage>" activity line.
  - **Still open (logged, NOT done this batch):** account menu popover (below), archive the dead `/dashboard/*`
    (below). A full DATED stage-move activity timeline (needs stored events) is a separate feature. Minor: the
    role-detail "✓ Interested — tracked in Applications" wording vs the card's "✓ In Applications" (left as-is).

- **✅ THEME A + cheap ride-alongs — SHIPPED 2026-06-29 (Session 42; research-grounded; tsc/lint/build/19 tests/eval
  all green; 3-agent code review + fixes applied).** "The advisor drives state + holds you through it."
  - ✅ **A1 — advisor drives Applications from conversation, live.** `save_job` + `set_application_stage` now emit a
    `application-changed` signal; the Applications list, the saved-role detail, AND the left-nav count/Recent all
    re-read live (no close-and-reopen). Verified the write already worked; the gap was UI reflection + nav. Also:
    advisor `save_job` now writes `status:'interested'` so chat-saved roles count in the nav (they never did before).
  - ✅ **Navigation bridge (Lexi's refinement) — user-requested only.** New `open_surface` advisor tool: the advisor
    opens a surface ONLY when the user asks ("show me my applications"); a state change NEVER yanks them to a tab
    (Nielsen User-Control; `research/rejection-care-and-navigation-research.md` §3). Shared `src/lib/surfaces.ts` so
    the tool + workspace can't drift.
  - ✅ **A2 — outcome acknowledgement.** Stage moves carry emotional weight (Offer = genuine, specific well done, never
    gamified; Interview = encouragement + prep; Applied = a steadying word), via the tool result + persona/prompt.
  - ✅ **A3 — rejection / didn't-get-it care.** Light fixed arc (acknowledge → normalise → *ask if they got any
    feedback*, never "paste the email" since ~83% get none → turn forward). Distress still escalates via §5. Grounded
    in the research note; +2 eval personas (rejection-no-feedback, offer-no-gamification).
  - ✅ **Ride-alongs:** #4 unsave/remove a role (two-step, reuses danger pattern, clears both tables) · #11 direction
    #1 highlight → equal weight (honest-matching) · #13 dead "don't scroll endlessly" hint removed (+ dead CSS/icon).
  - **Still open from the themes (NOT this batch):** B-#5 filter by stage · B-#6 offer/decline sections · B-#7 fuller
    per-application hub · C-#8 overlay scrollbar · C-#9 collapsible sidebar · C-#10 click-a-direction-opens · C-#12 per-day feed.

- **▶ SESSION 43 LIVE-TEST FINDINGS (Lexi + Claude-in-Chrome, 2026-06-29) — 5/6 again; rejection MESSAGE path still weak.**
  The state model (Closed area, ask-why x2, hide, no-tab-yank, auto-scroll, name) all PASS. Root cause of the rest =
  **two tables drift:** `saved_jobs` (advisor context + nav count read this) has no `stage`; `saved_applications` (the
  board) does. Addressed in the **alignment batch** (advisor reads the real board stages + salary; nav count = live
  apps only; why-closed note). **DEFERRED to the rejection-path stability + voice beat (next):**
  - 🔴 **Rejection care mistimed/garbled** — on a definite no, the care landed two turns late, pivoted to an offer
    first, and leaked instruction text ("acknowledge the IT Career Switch no properly"). The arc exists but isn't
    sequenced first; the long WEIGHT guidance in the tool result is being parroted. Needs prompt-stability work + logs.
  - 🔴 **Wrong-role stage match** — saving "Event Content Coordinator" threw a spurious "Moved 'Trainee Business
    Analyst' → rejected". `set_application_stage` fuzzy substring matcher hit the wrong saved row (or the model
    mis-fired the tool). Tighten matching + investigate with real logs.
  - 🔴 **"Something went wrong" + a green action log together** — the error path and a committed action shown at once.
    Transient retry helped but didn't fully close it; reproduce with logs (likely a non-transient mid-loop error).

- **✅ SESSION 43 (2026-06-29) — addressed the Session-42 findings below (built, awaiting Lexi's live test).**
  Real `rejected` stage + quiet Closed area (soft "Not this time" label, archive mislabel fixed); transient-failure
  robustness in the tool loop (the rejection bug's root cause); conversational ask-why on remove + reason-routed
  Live-roles hide (`hide_role_from_live`, item-level only); stale "In Applications" badge; chat auto-scroll; the "Alex"
  name slip. Grounded in `research/rejection-state-model-research.md`. Deferred: down-weight-similar + funnel stat (Step
  3), outcomes VOICE tuning (separate beat). Full receipts in REBUILD.md "BUILT 2026-06-29 (Session 43)".

- **▶ SESSION 42 LIVE-TEST FINDINGS (Claude-in-Chrome, 2026-06-29) — 5/6 passed; ADDRESSED in Session 43 (above).**
  The live test caught what the headless gate could not. Receipts:
  - 🔴 **BUG (priority) — rejection path.** "I didn't get that role, they didn't say why" → advisor returned a
    generic error ("Something went wrong on my end") with NO care, AND underneath still acted: archived the role and
    the pill reset from "Interview" to "Saved". Two causes: (1) **likely a transient Anthropic API error mid-tool-loop**
    — an earlier round's `set_application_stage('archive')` had already committed, then a later `callClaude` round
    returned non-OK, so the side effect persisted while the user got an error and no acknowledgement (robustness flaw:
    a partial tool action with no caring reply). (2) **`STAGE_LABELS` has no `archive` entry**, so an archived role's
    pill falls back to "Saved" (confirmed in `SidePanel.tsx`). Plus a design gap: rejection auto-maps to `archive`,
    which DISCARDS the "applied/interviewed then rejected" signal — we may need a real `rejected`/`unsuccessful`
    stage, not archive (intelligence value — see below). FIRST item of the next batch.
  - 🔴 **BUG — advisor called Lexi "Alex"** unprompted (she never said so; likely shortened a formal account name, or
    hallucinated). Prompt already says ask before shortening — adherence/voice gap.
  - 🔴 **BUG — chat does not auto-scroll** to the newest message when she types (pre-existing; reconfirmed live).
  - 🔴 **BUG — stale "✓ In Applications" badge in Live roles.** After removing a role from Applications, its Live-roles
    card still shows "✓ In Applications" (the RolesList `inApps`/interested set loads once, doesn't listen for
    `ci:application-changed`). Fix: refresh it on the event, like the other surfaces.
  - 🟡 **FEATURE (intelligence) — ask WHY on remove/reject.** When a user removes an application or doesn't get a role,
    the mentor should (gently) ask why — that's exactly the data that sharpens what roles it puts forward next.
    Compounding-intelligence principle: every action feeds the platform's understanding. Pairs with the rejection fix.
  - 🟡 **DESIGN Q — should removing from Applications also remove/flag it in Live roles?** Circumstantial (they may
    just be tracking-tidying, or genuinely not interested). Lexi: "assuming it has to be circumstantial." Decide with
    the ask-why data — a "not interested" reason could hide it from Live roles; a "tidying" reason keeps it.
  - 🟣 **VOICE (fine-tune pass) — offer enthusiasm too flat.** On the offer, the mentor was measured but "did not
    express much enthusiasm." Pairs with the rejection-voice tuning as one "outcomes voice" beat (build vs fine-tune:
    do the voice tuning in a deliberate pass, not interleaved).

- **▶ NEXT-SESSION CANDIDATES — Lexi end-of-session idea dump (2026-06-29).** Captured verbatim; grill +
  group into batches next session. Several cluster into themes (noted). ⚠️ A few already partly exist — verify
  before rebuilding.
  - **THEME A — the advisor drives state + holds you through it (on-mission; the advisor IS the product):**
    1. **Advisor updates Applications from conversation** — tell the mentor "I got an interview for X" and it
       moves the stage for you, no manual click. ⚠️ **`set_application_stage` tool ALREADY EXISTS** — likely
       already works; VERIFY live first, then make it reliable. Generalises to EVERYTHING: confirm something in
       chat → the advisor updates the right place AND/OR navigates you to the correct tab to show you. (The
       advisor→navigation bridge does NOT exist yet — that's the build.)
    2. **Advisor acknowledges stage changes** — on moving to Applied/Interview/Offer the mentor reacts
       (esp. Offer = genuine "well done", not gamified). Warm, earned, never streaky ([[feedback_no_gamification]]).
    3. **Rejection / didn't-get-it care** — mentor offers to read the rejection email, comforts, and turns it
       into prep for the next one. Maps to the emotional arc "hard days — never guilt". High-value differentiator.
  - **THEME B — Applications IA depth:**
    4. **Unsave / remove a saved role** — currently NO way to remove one, it's there forever. (DELETE APIs exist;
       needs UI.) Real gap, probably first.
    5. **Filter applications by stage** — "all Preparing", "all Applied", etc.
    6. **Offer / Decline sections** — once a role is an offer or a rejection it moves into its own area within
       Applications (one for offers, maybe one for declines). Open Q: does the user even need to see declines, or
       quietly archive? (Lexi unsure — lean: don't dwell on failure, per the arc.)
    7. **Fuller per-application hub** — rethink the format so EVERYTHING for a role lives under its application
       (the tailored CV done for that role stored there, etc.). Extends the per-job hub shipped today.
  - **THEME C — nav / direction / polish:**
    8. **Scrollbar always visible** — it should appear on scroll, not sit there permanently (overlay-scrollbar behaviour).
    9. **Collapsible left sidebar** (Jack & Jill pattern) — an icon to collapse/reopen the left nav.
    10. **Click a suggested direction → it opens** (direction detail / filtered roles). _Existed in the superseded
        platform; already logged as "Direction detail view + click a direction" (audit Batch C) — reinforced._
    11. **Direction #1 black highlight → make all directions equal weight.** Supports [[feedback_honest_matching]]
        (don't assert an unearned "clearest fit"). Lexi unsure — settle in a design beat.
    12. **Daily roles arrive as a per-day feed** (Jack & Jill) — see new roles "come in on that day". Pairs with
        the already-logged real per-day new-roles detection.
    13. **Dead "don't scroll endlessly" hint under Live roles** — it's static and does nothing; make it functional or remove.

- ○ **Documents-blank after Tailor CV — BUG (Lexi, 2026-06-29; fixed this session).** Two tailor-CV writers
  disagreed: the chat/advisor path saved `type:'tailored_cv'` (+ a `changes` column); the side-panel button saved
  `type:'cv_tailored'` (+ `metadata`); DocumentsView only read `cv_tailored`/`metadata`. Tailoring via chat was
  invisible. Unified the type + column shape.
- ○ **Preferred name — advisor asks what to call you (Lexi, 2026-06-29; small build this session).** The account
  name from signup ("Alexandra") was leaking as a cold formal address. The advisor should ask early ("what should
  I call you?"), store it, and recap + chat should use the preferred name over the signup name.
- ○ **Profile edit pass** — directly editable Profile (the "mirror"), mentor-primary but never trapping a
  fact: **replace CV on file** (simple swap, not the whole input flow) · **change registered email** ·
  edit preferences / deal-breakers.
- ○ **Account menu** (bottom-left name/email) — Profile · Previous chats · Settings · Sign out (not a jump
  straight to Profile). **Prior-art map (2026-06-27): build to the ChatGPT/Vercel popover pattern — ≤4 items,
  upward popover, one separator, no nested flyouts. Don't invent it. Next small build after the redesign.**
- ○ **Archive the legacy `/dashboard/*` surface** — the live product is entirely `/workspace`; `/dashboard/*`
  (DashboardHome, roles, roles/[id], applications, skills, profile) only links to itself and is a dead
  duplicate (skills now live inside the role detail). Walk each page together, confirm superseded, then move
  to `archive/` (preserve git history). ⚠️ Nothing wiped until reviewed page-by-page. _(Prior-art map, 2026-06-27)_
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
- ✓ **DONE (2026-06-28, commit `0fd24b1`) — Role-interest e2e spec automates SPEC criteria 1-2 + 6.**
  `tests/role-interest.prod.spec.ts` proves, against the real advisor: interested → a question + no doc tool
  fires; a stated "why" → a note persists to `profiles.data.memory`. Both green. Also fixed a latent
  `getTestUserId` pagination bug (default 50/page missed the seeded user on a busy project) — unblocks
  `advisor-agency.prod.spec.ts` too. Gated `E2E_LIVE_DEPS=1`, pennies/run. **Still Lexi's alone:** the
  qualitative feel (is the question GOOD, does it read like a mentor). Original note for context: the harness
  already EXISTS (`tests/`: smoke, workspace-routing, advisor-agency.prod, seedAuth helper, prod/live configs,
  CI mock-e2e). `advisor-agency.prod.spec.ts` already proves the hard half of the role-interest "why" memory:
  it drives the real `/api/chat` tool loop and asserts a `remember` fact lands in `profiles.data.memory`. So
  this is NOT from-scratch — **add one `role-interest.prod.spec.ts` mirroring it**: POST "I'm interested in
  [role]" → assert the reply opens with a question and does NOT jump to a CV/cover-letter offer (criteria 1-2);
  then POST a turn stating a "why" → assert a memory note capturing it persists (criterion 6). Gated behind
  `E2E_LIVE_DEPS=1` against a credentialed server (Upstash + Anthropic), pennies/run, never per-commit.
  **What it does NOT do:** judge whether the question is GOOD or the tone feels like a mentor — that stays
  Lexi's human read (voice/quality is never automatable). **Value:** it catches the single most likely failure
  mode (advisor not calling `remember`) without Lexi being the QA — serves `feedback_self_verify_no_retest`.
  **TRIGGER (Claude raises it proactively):** strong case to add NOW since it guards the riskiest part of the
  feature just shipped; otherwise bundle with the next workspace-flow build. Related: parked synthetic-persona
  "co-worker" dogfooding panel (Step 2) + `[[project_test_eval_infra]]` + `webapp-testing`. _(Lexi + Claude, 2026-06-28)_

## Step 3 — Grounded knowledge layer

Make the facts real so the product is credible, not guessing. Plan: [GROUNDED-KNOWLEDGE-PLAN.md](GROUNDED-KNOWLEDGE-PLAN.md).

- ○ Fact-check salaries / skills / routes against free authoritative data (£0 constraint).
- ○ Niche-industry coverage — serve users in small / non-standard fields well.
- ○ "What makes a good mentor" research — credibility grounding for the advisor.
- ○ **Employment rights & work law (curated, never AI-generated)** — the advisor will brush against legal questions (unpaid internships that are actually unlawful, worker status & minimum wage, contract types, probation, what an employer can/can't ask). AI-generating this is a liability + a safety risk for an anxious user. Source from **gov.uk + ACAS** primary pages (start: https://www.gov.uk/employment-rights-for-interns), store as facts the advisor retrieves, never invents. Protective, honest register — on-mission and a differentiator. See GROUNDED-KNOWLEDGE-PLAN.md item 8. _(Lexi, 2026-06-26 — from a LinkedIn post on intern pay)_
- ○ **RESEARCH/ARCHITECTURE — widen live-job sources beyond Adzuna + Reed (£0).** From a LinkedIn post Lexi flagged (2026-06-29; most of it was affiliate spam — Kickresume, "$68–80/hr", a ChatGPT book — ignored). The one real signal: several remote-job boards expose free JSON/RSS feeds we could aggregate to broaden listings at zero cost — **Remote OK** (`remoteok.com/api`, public JSON), **We Work Remotely** (per-category RSS), **Remotive** (`remotive.com/api/remote-jobs`, public JSON), **Himalayas** (`himalayas.app/jobs/api`). Investigation only — verify each feed is live, ToS-permitted, and dedupes cleanly against Adzuna/Reed; assess fit (these skew remote/tech, our users are broader UK early-career). **Does NOT change positioning** — the advisor is the product; listings are a utility ([[project_mission_northstar]]). Lower priority than Step 2; logged so it isn't lost. _(Lexi, 2026-06-29)_

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
**⚠ Anthropic API billing (operational, exposed 2026-06-30):** the API credit balance ran dry mid-session, which
takes the LIVE advisor down (every chat call 400s "credit balance too low") AND blocks the eval. Two gaps to close:
(1) keep a credit buffer + turn on a low-balance alert in the Anthropic console; (2) the product should detect this
specific billing error and show a calm "the advisor's briefly unavailable, back shortly" state, not a generic
"say that again" that implies retrying will work. Top up at console.anthropic.com → Plans & Billing (no redeploy needed).

**Observability + maturity (the "more professional" items):** Sentry — client DSN IS set in Production
(client errors captured); still to do: alert/email rules + `SENTRY_AUTH_TOKEN` (sourcemaps) + confirm
server-side capture (note: 429s/handled responses aren't exceptions, so they never alert) · Vercel
Analytics · ✓ CI pipeline live (typecheck+build+mock-e2e on push; add lint + unit-via-vitest later) ·
widen test coverage beyond core flows · a true production env separate from staging.
**Quality:** the roles matching/sourcing review (recommendations are still weak — deferred, but it's the
thing users judge hardest, so address before sharing widely). Study **JobCopilot + Jobeefy** for *how they
source and match* jobs; ground our own job data in Step 3 (National Careers Service / LMI). Detail in parking-lot.

---

## Session 44 live-test findings (2026-06-29) — the board must be the single source of truth

Lexi's live test surfaced a cluster: the advisor's *narrative* (recap card, memory, parked threads) drifts
from the *real board* (`saved_applications`), and surfaces read different tables. Root causes confirmed in code.

- ✓ **Wrong-role stage match** — `set_application_stage` silently picked the first of several substring
  matches; now tiers by exactness + asks on genuine ambiguity (shared `roleKey` dedup). _(fixed S44)_
- ✓ **Error + green action-log race** — a committed stage change behind a cold error; now any committed
  action returns a warm line (logged for monitoring), and non-JSON upstream bodies no longer crash. _(fixed S44)_
- ✓ **Rejected role still in Live roles + "In Applications" badge** — `set_application_stage` now also syncs
  `saved_jobs.job_data.status` (closed → 'passed' = drops out of Live roles + badge clears; live → 'interested').
  Re-reads live on `ci:application-changed`. _(fixed S44)_
- ✓ **Advisor asserts outcomes not on the board** — added a "the board is the truth about outcomes" rule to the
  chat prompt; made the recap board-aware (reads `saved_applications`, excludes closed stages, won't re-open a
  rejected role) and bust the recap cache on any stage change. _(fixed S44)_
- ○ **Known minor (logged from S44 review, low-risk):** the closed-stage set is duplicated across SidePanel +
  advisor-tools + recap (centralise into one shared constant); `saved_jobs` sync is a non-atomic read-modify-write
  (a same-user two-surface race could clobber a field); advisor-saved-only roles aren't in the live feed so their
  status sync is a no-op there (no symptom, but note it).
- ✓ **Advisor assumed time of day ("start it this morning" at 10pm)** — it has no clock; prompt rule added to
  chat + recap: never say morning/tonight/good evening unless the user stated the time, say "today" instead. _(fixed S44)_
- ✓ **Closed role STILL in Live roles for pre-existing data** — the S44 write-side `saved_jobs` sync only covered
  future closes; `/api/save-job` now also reconciles on READ (forces 'passed' for any closed application), so roles
  closed before the fix self-heal. _(fixed S44)_
- ○ **New live jobs over time (the return mechanic) — NOT built yet.** Suggest fresh matched roles as time passes so
  there's a reason to come back (value, not gamification). Core to "daily companion". Step 2/return mechanics.
- ○ **Live jobs expiring / closed to applications — NOT handled.** Adzuna/Reed listings go stale. Need to detect
  expired or no-longer-accepting listings and stop surfacing them (or mark them clearly), so we never send someone
  to a dead advert. Consider on the Roles/Live-listings layer (Step 3 sourcing).
- ▶ **Name shortened to "Alex" then denied** — recap card (separate surface) used "Alex" though her name is
  Alexandra; chat advisor then denied saying it (true from its view → reads as gaslighting). Need a
  deterministic name guard on every surface + cross-surface awareness. May also be stale stored `preferredName`.
- ▶ **Autoscroll on send still broken** — every send needs a manual scroll. Effect keyed on `[allMsgs,
  isLoading]`; rapid state changes preempt the rAF scroll. Fix to scroll reliably on the user's own send.
- ○ **Scroll up to read earlier conversation** — no way to see history above the current thread.
- ○ **Recap "Earlier / Today" framing confusing** — design/copy of where the recap card sits in the timeline.
- ○ **Advisor forgot prior info** (the master's) — durable facts not always captured; review `remember` reliability.
- ○ **Career-coaching research** — we researched mentorship, not career coaching; scope what else to consider.
- ○ **Sycophancy guardrail (voice)** — the line between pleasing the user and genuinely building momentum/
  productivity. Make it a first-class voice principle + an eval check (belongs in the deferred voice pass).

### Session 44e — live walk-through QA findings (2026-06-30)
Full QA pass (Claude-in-Chrome). PASS: no-phantom-outcomes, closed-role-leaves-Live-roles, time-of-day, salary
visible. FAILs + fixes:
- ✓ **Rejected direction did nothing** (the QA's #1: a broken core-loop promise). Root cause: the advisor didn't
  call `update_direction`, and even when it does the tool emitted no client signal. Fixed: prompt now records the
  reaction the moment they say it (then explores why); `update_direction` emits `profile-changed`; DirectionView
  re-reads live. e2e proves the rejected direction drops off without a reload. _(fixed S44e)_
- ✓ **Name sync stale** — Profile showed "You go by Lexi" but the nav + recap card still said "Alexandra" mid-
  session. Fixed: `update_profile` emits `profile-changed` (nav + Profile re-read live) and busts the recap cache;
  prompt now acknowledges the name in the reply instead of silently saving it. _(fixed S44e)_
- ○ **Autoscroll: own message scrolls off the top** — scroll-to-bottom hides the start of a long user message;
  it's also briefly behind the suggestion chips. Needs a careful pass (anchor the new user message near the top of
  the viewport on send), verified against scroll positions. Deferred so it isn't rushed and regressed again.
- ✓ **Autoscroll: own message scrolls off the top** — FIXED S45. A user turn now anchors the new message's start
  near the viewport top (clamped so short messages still land above the composer). Pure `anchorScrollTop` +
  deterministic Playwright scroll-position test. _(fixed S45)_
- ✓ **Count mismatch** — FIXED S45. Nav count + panel now derive from ONE `liveRoles` set in `usePanelJobs`
  (passed/hidden/score filters applied once); removed SidePanel's duplicate saved-state loader. _(fixed S45)_

### Session 45 — live walk-through QA findings (2026-06-30)
Full QA pass (Claude-in-Chrome). **All 5 PASS**: nav-count-matches-panel, pass-a-role-both-counts-drop,
saved-role-badge-once, autoscroll-long-message-readable, update_profile-doesn't-drop-values (the #13 merge fix).
One observation to fix:
- ✓ **Cold error shown on a SUCCESSFUL tool action.** Telling the advisor a second value: it saved correctly
  (the value persisted AND "✓ Updated your profile" echoed), but the chat reply was the cold fallback "Something
  went wrong on my end". Root cause confirmed: the tool COMMITTED, then the model's final turn ended with no
  usable text (empty / whitespace), and the route returned that empty content as a clean 200 — the client's
  `join("") || ERROR_MSG` then rendered the cold error next to the success echo. The route's warm-recovery
  guards only covered `!response.ok` + thrown exceptions, never an empty 200. Fixed S46 (51b77cf):
  `src/lib/chat-reply.ts` `ackForSilentCommit` returns a warm "Done, I've got that for you." only when the model
  went silent AND an action committed this turn; real replies + genuinely empty (nothing committed) turns are
  untouched. Reproduced first with `tests/chat-reply.test.mjs` (6 unit tests modelling the client reduction);
  56/56 green, tsc 0, lint 0, £0. _(logged S45, fixed S46)_

### Session 47 — outreach tracking shipped + IA finding
- ✅ **Outreach tracking — SHIPPED & live-QA passed (2026-07-01, commit a3dd545).** The candidate-loop outreach
  step was one-time (advisor drafted, nothing saved). Now: `outreach` table (migration 20260701, per-role, GDPR
  posture unchanged — no named third party); draft_outreach persists; `/api/outreach` GET/PATCH; self-report
  status chips (To send / Sent / They replied / No reply) in the role's "Reaching out" section; `set_outreach_status`
  advisor tool; advisor context surfaces the ONE follow-up due after 5 business days (research §5). Prior-art
  grounded (Teal/Huntr/folk/Clay): per-role not cross-role CRM, honest self-report (no inbox), one gentle
  follow-up owned by the advisor. Live QA (Data Analyst · Sagacity): all 4 steps PASS, no bugs.
- ✅ **IA finding → DECIDED (Session 48 design session, 2026-07-01): "one record, two lenses" — build pending,
  contract in `SPEC.md`.** Evidence pass (Teal/Huntr/Simplify/Otta/LinkedIn + codebase map) showed the industry
  invariant: one record per role from the moment of interest; preparation never advances stage, but prep requires
  the record to exist. Lexi locked both forks: (1) **prep auto-saves, never auto-advances** — drafting outreach /
  tailoring a CV quietly saves the role into Applications at stage "Saved" if absent, never moves an existing
  stage; (2) **evaluate + handoff link** — after save the live-role detail keeps company/fit/description + the
  reach-out door and one quiet "In your applications" link; ALL tracking (outreach thread + chips, CV, cover
  letter, notes, stage) lives in the application detail. Status chips leave the live-role view entirely.
  Rejected: hard promotion, merged mega-card, no-promotion templates. Known gap logged, out of scope: live-role
  view thin on real COMPANY info → grounded-knowledge track (Step 3). Done criteria in SPEC.md; the superseded
  role-interest spec moved to `archive/SPEC-role-interest-mentoring-2026-06-27.md`.

### Session 46 — found while shipping the fix
- ✓ **Flaky e2e: `state-sync.spec.ts:50` (rejected-direction drop) — was a real cache bug.** SidePanel
  intermittently rendered a rejected direction because the `/api/profile` GET it makes had no `Cache-Control`, so
  the browser's heuristic cache could serve a stale copy of the user's profile (and it leaked private data into a
  cache). Not test noise — the exact "advisor says done, screen shows the old thing" drift the state-sync work
  targets. Fixed S46 (fcc2b6b): `src/lib/api-response.ts` `jsonNoStore` applied to every authenticated per-user GET
  (profile, results, applications, documents, matched-jobs, save-job, recap). Per-route helper chosen over a
  middleware header so each route keeps its own auth semantics. Previously-intermittent suite now 4/4 green on
  repeat runs; 56/56 unit, tsc 0, lint 0, £0. _(logged + fixed S46)_
