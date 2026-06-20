# Meridian — State of the Product & Rebuild Plan

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
- [ ] Put all 5 tables under version-controlled migrations; confirm RLS is on every table.
- [ ] Install Playwright; write E2E tests for the core flows (new user, returning user, each tab).
- [ ] Add Sentry (errors) + Vercel Analytics (funnel). We can finally see what's happening.
- [ ] Move app state off `sessionStorage` onto the server as the source of truth.
- [ ] Set up enforcement hooks (see Part 5) so tests + branch checks run automatically.
**Done when:** Lexi can't open a broken build, because a broken build can't pass the gate.

### Step 1 — The spine _(the real, shareable v1)_
- [ ] **Advisor memory:** an evolving model of the user, not a one-shot snapshot.
- [ ] **Advisor agency (tool_use):** it can actually update a direction, save a job, change a stage,
      update the profile. When it says "done," something changes.
- [ ] **Conversation-first surface:** the advisor *is* the interface, not a panel in the corner.
- [ ] **Jobs that are right:** fix keyword generation + scoring so seniority and industry are correct.
- [ ] **Kill the childish face;** stage toward the Meridian visual language.
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
