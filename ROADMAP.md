# Career Intelligence — Master Roadmap

_Last updated: Session 22, 2026-06-11_
_This is the single source of truth for sequencing. Read this at the start of every session._
_When Lexi has an idea: add it to the right phase. Never dismiss, never do out of sequence._

---

## How to use this document

- **Current phase** is marked with → 
- **Done items** marked with ✓
- **Every session starts here** — confirm which phase we're in and what the focus is
- **New ideas go in the right phase** — not the parking lot unless truly unsequenced
- **Never skip phases** — each one unblocks the next

---

## Phase 0: Design — COMPLETE ✓

_Goal: Every screen designed and locked before a single line of engineering begins._

### Done ✓
- ✓ Design language — tokens, colour, typography, component rules (`SESSION_DECISIONS.md`)
- ✓ Homepage — LOCKED (Session 18, 2026-06-11). `mockups/homepage-v2.html`. Three features, fit labels, flat bg, correct nav. Copywriting session pending Phase 5.
- ✓ Dashboard home — provisionally locked (known issue: visual hierarchy, equal weight — must fix)
- ✓ Roles tab — locked (`mockups/dashboard-roles-v2.html` + `mockups/role-detail.html`) — redesigned Session 13
- ✓ Advisor persona foundation — `ADVISOR_PERSONA.md` created

### In progress
- ✓ **Input page** — LOCKED (Session 10, 2026-06-09). Chat UI. `mockups/input-page.html`
- ✓ **Loading screen** — LOCKED (Session 10, 2026-06-09). Text only, 4 phrases. `mockups/loading-screen.html`
- ✓ **Dashboard home hierarchy fix** — LOCKED (Session 10, 2026-06-09). Direction as hero, hierarchy fixed.

### Still to do before engineering
- **Advisor name + icon session** — do not name the advisor without a dedicated session. Too important to decide quickly.
- **Features roadmap review** — once all screens are designed, review the full parking lot and assign everything to a phase. This session produces the sequenced feature list for Stage 1.

### Missing screens — must be designed before Phase 2 builds them
All of these need dedicated design sessions. None can be built before they are locked.
- [x] **Skills tab** — LOCKED (Session 13, 2026-06-10). Direction card anchor + "Before you apply" + "Worth building" sections. Certifications require certificate evidence. Framing: trajectory, not deficit. See `SESSION_DECISIONS.md` + `mockups/dashboard-skills.html`.
- [x] **Profile tab** — LOCKED (Session 15, 2026-06-10). Mirror screen: activity strip + direction card + "What Arlo knows" (background/values/dealbreakers) + CV on file + preferences + account. Profile moved to bottom-left user area, not a nav tab. See `mockups/dashboard-profile.html` + `SESSION_DECISIONS.md`.
- [x] **Applications tab** — LOCKED (Session 12, 2026-06-10). List view + Arlo half-panel. Stages: Preparing → Applied → Interview → Offer + Archive. Cards show: role, company, stage badge, next action, closing date, assessment deadline (where applicable), collapsible timeline. Arlo does not reset per tab. Collapsible globally. See `brainstorms/applications-tab-session.md` + `mockups/dashboard-applications.html`.
- [x] **Auth overlay** — LOCKED (Session 11, 2026-06-10). Decisions: two states (new/returning), Google OAuth + email OTP, Arlo surfaces save prompt before overlay opens, overlay is clean UI only, OTP email via Resend. See `brainstorms/auth-overlay-session.md`.
- [x] **Onboarding bridge screen** — LOCKED (Session 13, 2026-06-10). Direction card + roles inside card + Arlo note + CTA. See `mockups/onboarding-bridge.html`.
- [x] **Returning user experience** — LOCKED (Session 14, 2026-06-10). Priority stack (interview prep → deadline → new roles → contacts → next step on saved role → skills → direction refinement). Total active days momentum strip. Arlo always opens with "What did you get up to?" See `brainstorms/returning-user-session.md` + `mockups/returning-user.html`.
- [x] **Basic error states** — LOCKED (Session 16, 2026-06-10). Analysis failure (Arlo owns it, retry, input preserved) + slow pipeline (loading screen text shift) + lost connection (amber banner, silent recovery) + Arlo chat failure (inline copy only). See `mockups/error-states.html` + `SESSION_DECISIONS.md`.

---

## Phase 1: Foundation Engineering — PARTIALLY COMPLETE ✓

_Goal: Fix all known blockers before any new work is built on top of them. Architecture must be right before any Phase 2 component is written._

### Architecture
- [x] **Next.js migration** ✓ DONE (Session 17) — Next.js App Router + TypeScript. All 9 API functions ported to `src/app/api/`. Legacy frontend in `legacy/`.
- [ ] **Reconcile tokens.css with SESSION_DECISIONS.md** — still stale. Before Phase 3 build begins: create a single `tokens.css` that matches SESSION_DECISIONS.md exactly. Every Phase 3 component uses it.
- [x] **Project architecture scaffold** ✓ — folder structure and CSS module conventions established across all Phase 2 screens.
- [ ] **Advisor memory schema (Supabase)** — three tables needed: activity log (roles saved/passed, timestamps), conversation history (user + advisor messages), user profile snapshot (direction, preferences, CV summary). Also enables pgvector for future semantic memory. Phase 3 prerequisite.
- [ ] **Advisor tool_use API design** — advisor reads and writes user data via defined tools (update_application_status, save_job, add_note, update_direction, update_preferences, mark_skill_progress). Phase 3 prerequisite.

### Legal & compliance — must complete before any user data is collected
- [ ] **ICO registration** — legally required before processing any real UK user data. Free, 20 minutes. ico.org.uk/registration. Do this in Phase 1, not at launch.
- [ ] **Privacy policy** — stub page exists at `/privacy` (Session 20). Must be replaced with real policy before first real user signs up. Draft using a template, have a solicitor review. Covers: data collected, retention (90 days), right to deletion, what we do with CV data.
- [ ] **Terms of service** — stub page exists at `/terms` (Session 20). Must be replaced with real terms before launch. Draft + solicitor review required.
- [ ] **Right to deletion** — implement a user-facing delete account button. Confirm Supabase 90-day deletion works end-to-end. Test it.
- [ ] **Contact discovery legal opinion (before Phase 3 only)** — surfacing specific people at companies is legally ambiguous under UK GDPR. Solicitor opinion required before Phase 3 contact discovery feature is built. Not a launch blocker — a Phase 3 blocker.

### Bug fixes (pre-existing, must fix before Phase 2 deploys over them)
- [ ] Fix Sign-in OTP failure ("Load failed") — **critical blocker: returning users cannot come back**
- [ ] Add Google OAuth — "Continue with Google" as primary auth option alongside email OTP (Supabase supports this; auth overlay design locked in Phase 0)
- [ ] Remove debug console.log commits from codebase
- [ ] Rotate GitHub token (was exposed in session — Lexi has deferred, must not defer past Phase 1)
- [ ] Merge staging backend improvements (score.js, jobs.js, analyse.js — ready and waiting)
- [ ] Performance fix: split the ~90s analysis into two calls (Haiku for extraction, Sonnet for intelligence) + add streaming so the user sees progress rather than a blank wait

### Note: stale items removed
The following Phase 1 items predated the current design system and are now superseded by locked designs — they no longer need fixing as separate tasks (Phase 2 build will implement the correct versions):
- ~~"About 60 seconds" copy~~ — replaced by loading screen design (LOCKED Session 10)
- ~~Input field styling~~ — replaced by input page design (LOCKED Session 10)
- ~~Overscroll colour~~ — will be addressed in Phase 2 implementation

### Testing plan — must exist before Phase 2 deploys anything
- [ ] **Define the testing protocol before Phase 2 begins.** Write `QA_CHECKLIST.md` — the list of flows that must pass before anything ships. Minimum: end-to-end happy path (new user, full analysis), OTP sign-in (returning user), job results load, no console errors.
- [ ] **Playwright automated testing** — Playwright MCP is already connected. Before Phase 2 build begins: write Playwright scripts for each QA_CHECKLIST flow so they run automatically, without Lexi manually clicking through anything. Every Phase 2 deploy runs these before it is considered done. Reinstall `/webapp-testing` skill at Phase 2 start — it handles this setup.

### Product name — must resolve before launch
- [ ] **Product name session** — "Career Intelligence" is the working name. Cannot launch without a real name. Needs a dedicated creative session: options, stress-test, decision. Assign this to Phase 1 so it is resolved before Phase 2 ships anything publicly.

---

## Phase 2: Visual Redesign (Stage 1 Build) — COMPLETE ✓

_Goal: Implement all locked designs. The product looks and feels like the designed version._

### Analytics — set up before Phase 2 goes live
- [ ] **Vercel Analytics** — zero config, already in the stack, cookie-free, GDPR-safe. Set up before first user lands. Minimum metrics: input flow completion rate + 7-day return rate. Those two numbers tell you if the product is working.
- [ ] **Plausible** (Phase 3) — add when granular funnel data is needed.

### ⚠️ Arlo upgrade — do this before building more screens
_Arlo appears on every screen. Upgrading him after 10 screens are built means updating 10 places. Do this session after dashboard home is built and before continuing._
- [ ] **Arlo character elevation session** — redesign Arlo as a proper SVG illustration (not the current hand-coded approximation). Reference generation: Leonardo.ai (free tier). Animation: Rive (rive.app, free solo plan). Session produces: locked Arlo asset + smooth expression morphing (CSS `d` property transitions or Rive). Then update all built screens at once before continuing.

### Screen implementations
_All Phase 2 screens ship before any user is let in — no 2a/2b split. Phase 2 complete = natural launch review checkpoint._
- [x] Implement homepage redesign
- [x] Implement input page redesign (from locked mockup)
- [x] Implement loading screen (from locked mockup)
- [x] Implement dashboard home — built Session 19. Three returning-user states (new-roles / deadline / nothing-new) exist in code, defaulting to new-roles. **Phase 3 task:** wire state to real data — last-login timestamp + new match count + nearest deadline. See `DashboardHome.tsx` comment: `// Phase 3: derive from real data`.
- [x] Implement Roles tab — built Session 13/19. `src/app/dashboard/roles/`
- [x] Implement sidebar navigation — shared across all dashboard pages
- [x] Implement Auth overlay — built Session 19. `src/components/AuthModal.tsx`. Google OAuth button present; Supabase OTP wired in Phase 3.
- [x] Implement Applications tab — built Session 19. `src/app/dashboard/applications/`
- [x] Implement Profile tab — built Session 19. `src/app/dashboard/profile/`
- [x] Implement Skills tab — built Session 19. `src/app/dashboard/skills/`
- [x] Implement role detail page — `src/app/dashboard/roles/[id]/`. Role type cards in Roles tab now link here. Live listings link deep-links to filtered listings tab.
- [x] Implement onboarding bridge — `src/app/onboarding-bridge/`. Inline feedback chat: if user says "something doesn't feel right", direction card stays visible and Arlo opens a chat on the same page ("What doesn't feel right to you?"). User can share as much as they want. Arlo signals readiness to move on. Phase 3: wire feedback to real re-analysis.
- [ ] Implement implicit away mode — Phase 3: advisor checks last login timestamp, calibrates tone: 1–3 days normal, 4–7 days patient, 7+ days warm re-engagement.
- [x] Implement error states — built Session 19. Analysis failure: `/analysis-error`. Offline banner: `src/components/OfflineBanner.tsx` wired to dashboard layout.
- [ ] Advisor tool_use implementation — advisor reads and writes user data via defined tools (update_application_status, save_job, add_note, update_direction, update_preferences, mark_skill_progress). API designed in Phase 1.
- [ ] Advisor memory implementation — activity log, conversation history, profile snapshot. Schema designed in Phase 1.

### Phase 2 complete → QA session → launch review
_When all screen implementations are done: dedicated QA session first. Lexi walks every screen and flow, notes observations and fixes needed. Only after QA is signed off: decide whether to launch to first 100 users or continue to Phase 3._
- [x] **Engineer-led QA audit (Session 20, 2026-06-11)** — 66 issues found and resolved across two commits:
  - Broken flows: Dashboard Later/Not today buttons wired; footer links fixed (/privacy + /terms stub pages created, Contact = mailto); Skills resource links use real external URLs (Microsoft Learn, Coursera, Mode Analytics, Forage)
  - CSS token pass: 3 new tokens added (`--accent-dark`, `--green`/`--green-soft`, `--danger`/`--danger-dark`) to globals.css; all hardcoded hex values replaced across every CSS module — no bare hex values remain
  - 15 additional fixes from earlier in session (loading screen redirect, CTA wiring, Arlo send buttons, 404 page, dynamic role title, aiBubble gap, empty state, double-send prevention, inline restart confirm, profile buttons, stale dates)
  - Engineering standards updated in CLAUDE.md + INSIGHTS.md to prevent recurrence
- [x] **Lexi's own walkthrough (Session 21, 2026-06-11)** — walkthrough complete. Fixes shipped:
  - Later/Not today: now fades out instead of snapping (was read as "nothing happened")
  - Profile Delete account: inline confirmation added (was dead — did nothing)
  - Profile Restart: inline confirmation + copy updated ("Your analysis restarts. Applications you're tracking stay safe.")
  - Dashboard greeting: no longer hardcoded to "Welcome back, Lexi" — generic until Phase 3 auth
  - Cookie consent banner: added to root layout (GDPR required)
  - Parking lot additions: daily/weekly Arlo planning (Phase 3); restart behaviour revisit (Phase 3)
  - Phase 5 polish observations logged: transitions, card design, loading Arlo animation, skills ordering, applications prep, live listings order
- [x] **Launch review checkpoint** — walkthrough signed off Session 21. Decision: continue to Phase 3a (make the product real) before launch. Phase 3b optional before launch — Lexi decides after 3a is done.

---

## Phase 3a: Make It Real — COMPLETE ✓

_Goal: Wire the existing backend to the new frontend. A user can go through the full journey with real data. This is the minimum working product._

**What this phase is not:** it's not a prototype, and it's not building new features. It's connecting the pipes. The API functions already exist in `src/app/api/`. Phase 3a makes the new frontend use them.

**Before first build session:**
- [x] **Backend audit + hardening — DONE (Session 23, 2026-06-11).** Auth middleware (@supabase/ssr cookie sessions), Arlo persona + user-context in chat.js, Upstash rate limiting on /api/analyse (10/IP/day), input validation, env fail-fast, /api/analyse open to unauthenticated users (try-before-signup). SSE streaming deferred to Session 25 (Hobby plan = 60s cap; streaming only valuable bundled with loading-screen wiring). Full detail in PLAYBOOK.md Session 23.

**Auth — COMPLETE ✓ (Session 24, 2026-06-12):**
- [x] Wire Google OAuth via Supabase to `AuthModal.tsx` — primary auth path
- [x] Wire email OTP via Supabase (signInWithOtp + verifyOtp) — secondary auth path
- [x] Auth callback route `/auth/callback` — new users → /input, returning → /dashboard
- [x] Basic session persistence — user stays logged in across visits (via @supabase/ssr middleware)
- [x] Sign out wired in Profile tab — Supabase signOut() → redirect to /
- [x] Real name shown in Dashboard greeting (from Google profile or email prefix)
- [x] Real email shown in Profile account section

**Core pipeline — COMPLETE ✓ (Sessions 25–26, 2026-06-12):**
- [x] Wire input page → `/api/analyse` → SSE stream → loading screen → onboarding bridge with real data
- [x] Save analysis results to Supabase on completion (`results` table, fire-and-forget)
- [x] Wire Adzuna job listings to Roles tab — real listings, scored by Claude, filter pills, Load more
- [x] Fix 90s pipeline: split into two parallel calls (~25s average, within 60s Hobby cap). See INSIGHTS.md section 1.

**Arlo chat — COMPLETE ✓ (Session 27, 2026-06-13):**
- [x] Wire all Arlo chat panels → `/api/chat` with real Claude responses
- [x] Conversation history per page (home/roles/skills/applications) stored in Supabase `conversations` table
- [x] User context injected on every call (direction, CV summary, saved roles, values) — Arlo never re-asks
- [x] Unauthenticated result persistence fix: re-calls save-result on dashboard load if result wasn't saved

**Phase 3a remaining — COMPLETE ✓ (2026-06-13):**
- [x] **Wire dashboard direction card to real analysis data** — reads `profile.suggestedDirections[0]` from sessionStorage. Fallback state for users who haven't run analysis.
- [x] **Rate limiting on /api/chat** — 100 messages/user/day via Upstash, keyed by user ID. Fails open in local dev.
- [x] **Run conversations SQL migration** — executed in Supabase dashboard. `conversations` table live with RLS.
- [x] **Add Vercel Production env vars** — `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Production and Preview.

**⚠️ Must happen before any real user signs up — non-negotiable:**
- [ ] **ICO registration** — legally required before processing any real UK user data. £40/year, 20 minutes at ico.org.uk/registration. Lexi has been deferring — this is now overdue.
- [ ] **GitHub token rotation** — a session token was exposed in an earlier session. Must be rotated before production. This is a live security risk.
- [ ] **Real privacy policy** — replace stub at `/privacy`. Draft from template, solicitor review. Covers: data collected, retention (90 days), right to deletion, CV data handling.
- [ ] **Real terms of service** — replace stub at `/terms`. Draft + solicitor review.
- [ ] **Right to deletion** — the delete button in Profile navigates away but does not actually delete Supabase data. Wire the actual deletion call.
- [ ] **Sentry error tracking** — zero visibility into production errors right now. Sentry free tier, ~20 minutes to install. Without it, silent failures will go unnoticed.
- [ ] **Vercel Analytics** — already in the stack, cookie-free, GDPR-safe, zero-config. Must be enabled before first user lands. Minimum metrics to watch: analysis completion rate + 7-day return rate.
- [ ] **Upstash env vars in Vercel** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` must be added to Vercel Production env to activate rate limiting.

**Phase 3a complete ✓ (2026-06-13) → launch review** — Lexi's decision: launch now or continue to Phase 3b first.

---

## → Phase 3b: Intelligence Quality + Data Wiring — CURRENT

_Goal: The product works well for every user, not just the obvious cases. Intelligence is honest and results are genuinely tailored._

---

### Session A: Pipeline Intelligence — Analysis, Scoring, and Niche Coverage

**What it achieves:** The single most important quality session. Makes the analysis and job results genuinely tailored to every user regardless of sector or seniority — not just those in mainstream commercial roles.

**Why this matters now:** A user with a niche background (arts management, environmental policy, social enterprise, academic-adjacent, creative industries) will currently see weak or irrelevant results. The first 100 users will include people from all kinds of backgrounds. If the product fails them, they don't come back and they don't tell others.

**What to audit and improve:**

**1. Analysis prompt quality**
- Read 3–5 real CVs of different types (commercial, niche, career-changer, recent graduate with no experience, postgrad academic) and run each through the current pipeline. Look at the directions, keywords, and summary. Are they genuinely specific or could they apply to anyone?
- Improve: the `suggestedDirections` prompt should force specificity anchored to what the CV actually shows — e.g. "You've spent three years doing X" must be verifiably true from the CV, not inferred generically
- Improve: the `valuesSignals` should be observations that could only be written about this specific person, not observations that could apply to any ambitious graduate
- Improve: `summary` — should pass the "could this be sent to a different user unchanged?" test. If it could, it's not specific enough.

**2. Keyword generation — sector-aware strategy**
Current: flat list of 5–8 keywords, same format regardless of sector.

Improve with sector-aware branching:
- **Commercial/consulting/finance:** standard job titles + function terms
- **Creative/media/entertainment:** rights, licensing, content, format-specific terms (documentary, broadcast, publishing)
- **Charity/NGO/social sector:** programme, impact, fundraising, community, advocacy — search Guardian Jobs + CharityJob via Reed API
- **Public sector/policy:** policy, research, civil service, local government — search Civil Service Jobs
- **Academic-adjacent:** research, think tank, knowledge, publishing — different source mix
- **Technology:** product, engineering, data, growth — standard Adzuna coverage is good here

The analysis already extracts `extractedSectors` — use it to shape the search strategy, not just the scoring.

**3. Seniority-aware search (not just scoring)**
Currently seniority only affects post-search scoring. Improve the search itself:
- If `seniorityLevel` is graduate/entry/early-career: append "graduate", "junior", "assistant" as additional search terms
- If senior: suppress junior/assistant terms from the keyword mix
- The scoring already handles mismatches as a safety net; the search should reduce the problem upstream

**4. Location and salary in search**
Currently neither is passed to Adzuna. Fix:
- Pass `locationSearch` as the Adzuna location parameter (currently defaults to London regardless)
- If user expressed remote preference: search with location=`remote` or UK-wide
- Salary floor: filter out listings clearly below the user's floor (where salary data is available)

**5. Reed API as second job source**
Reed API has a free tier and is significantly stronger than Adzuna for:
- Charity and third sector
- Healthcare and social care
- Public sector
- More mid-senior UK roles

Implementation: when the analysis identifies a niche sector, run a parallel Reed search alongside Adzuna. Deduplicate by job title + company. Score all results together.

**6. Scoring relevance reason — more depth**
Currently one sentence. Improve to 2–3 sentences that explain:
- What in this specific person's background applies
- What the role actually requires
- Why the fit exists (not just that it does)
This appears on the job card and is the thing that makes a user decide whether to click. Make it worth reading.

**7. Direction validation against real job availability**
After generating 3 directions, quick-check Adzuna (and Reed where applicable) to see if each direction has at least 5–10 live listings. If a direction is very thin, flag it in the result so the UI can handle it appropriately ("This direction is less active right now — we'll update when more roles come in"). Don't suppress it — be honest.

**8. Surface `companySuggestions` in the UI**
The analysis generates "types of company that suit this person, with why" — this is currently generated and discarded. It should appear somewhere in the dashboard (e.g. a "Company types that fit you" section in the Roles tab or direction card). Good content being wasted.

**Read first:**
- `/api/analyse/route.ts` — full analysis prompt
- `/api/score/route.ts` — scoring logic
- `/api/jobs/route.ts` — Adzuna search implementation
- `ADVISOR_PERSONA.md` — ensure any new Arlo copy in relevance reasons matches voice

**Skills:** `/grill-me` before building — extract decisions about keyword strategy and sector logic. `/systematic-debugging` if pipeline issues arise. `/deploy-check` after.

**Done when:** 3 real CVs of different types run through the pipeline, each producing genuinely specific directions and results. Niche-sector user sees at least 5 relevant listings. Seniority-appropriate roles dominate results for junior profiles. Reed API wired. `/deploy-check` passes.

---

### Session B: Real Data Wiring (Applications + Skills + Direction Card)

**What it achieves:** The three dashboard tabs that still show placeholder data become real.

**What to wire:**

**Direction card on dashboard home:**
- Currently shows hardcoded "Operations and strategy in early-stage companies." 
- Must read `summary` and `suggestedDirections[0].title` from Supabase result on load
- Direction card body should come from the first suggested direction's `why` field

**Skills tab:**
- Currently 100% hardcoded demo data
- Skills strengths should come from `result.skills.strengths`
- Skills gaps should come from `result.skills.gaps` (includes tier, why, howToBuild, resource URLs)
- The existing `BEFORE_APPLY` and `WORTH_BUILDING` sections in the design map to the gap `tier` field
- Resources are already in the data — wire to the existing resource link UI

**Applications tab:**
- Currently 100% hardcoded (Bloom & Wild, Monzo, Deloitte don't exist)
- Need a `saved_applications` Supabase table: `user_id`, `job_id`, `job_data` (jsonb), `stage`, `created_at`
- "Interested" jobs from Roles tab should be startable as applications
- Stage progression (Preparing → Applied → Interview → Offer) writes to Supabase
- Empty state when user has no applications yet

**Done when:** Dashboard direction card shows real data. Skills tab shows real skills gaps from analysis. Applications tab has real Supabase persistence. `/deploy-check` passes.

---

### Phase 3b: The Hand-Holding Layer

_The product's core promise: every job the user saves becomes a full guided journey._

**Copy and product voice — must do before launch:**
- [ ] **⚠️ Product name session** — "Career Intelligence" is a working title. Cannot launch without a real name. Dedicated creative session: options, stress-test, decision. Lexi is not ready for this yet — flag at start of Phase 3b.
- [ ] **Homepage copy session** — final homepage copy, including the Meraki/Satori/Kavanah narrative. Currently placeholder. Use `/copywriting` skill.
- [ ] **UI copy session** — all non-advisor copy: auth overlay, onboarding prompts, button labels, empty states, error messages, nav labels. Placeholder copy is in place — this session makes it final. Use `/copywriting` skill.
- [ ] **Advisor voice examples** — 20–30 sample Arlo messages across all key moments. The voice reference for all future copy.

**Product philosophy for this phase — Arlo does it, doesn't just guide.**
Arlo doesn't tell the user what to write. It writes it. CV built and tailored for each specific job. Cover letter written, not prompted. Email opened pre-filled, user clicks send. Every step of every application handled — the user provides intent and approval, Arlo provides execution. This is what separates the product from every other career tool.

- [ ] **Per-job CV builder** — Arlo generates a tailored CV for each specific role. Not tips or guidance — an actual document, ready to download or send. Based on the user's full profile + the job description.
- [ ] **Per-job cover letter builder** — Arlo writes the cover letter. User reviews and approves. One-click: opens the user's email client with the cover letter pre-filled and the company's application email in the To field. User clicks send.
- [ ] **Contacts finder** — moved to explicit entry above with legal warning
- [ ] **Interview prep** — company-specific questions, assessment centre guidance, what to expect at each stage for that specific company
- [ ] **One-way video interview prep** — increasingly standard at graduate level. Arlo explains the format, coaches the user through pacing, eye contact, handling blank time. Potentially integrates with voice mode: Arlo asks questions aloud, user practises speaking answers back. Needs a design + product session before build.
- [ ] **Company research layer** — values, culture, recent news, how they align with what the user has told us
- [ ] **Full application pipeline tracking** — Saved → Preparing → Applied → Interview → Offer/Rejection, per job
- [ ] **Email inbox integration** — Gmail/Outlook OAuth (read-only). Advisor automatically detects interview invites, rejections, offers, assessment bookings. Updates pipeline without user having to log anything. Prompt: "I saw you heard back from Innocent Drinks — want to start preparing?" Privacy: "I only read emails from companies you've applied to." Explicit opt-in, revocable.
- [ ] **Calendar integration** — Google/Outlook Calendar. Detects interview dates from emails, schedules prep reminders, tracks deadlines. "Your Innocent Drinks interview is in 3 days — let's prepare."
- [ ] **Daily Arlo coaching questions** — Arlo asks one self-discovery question per session, drawn from a curated bank, to deepen the user's profile and self-understanding over time. Separate from the main chat — feels like a coaching moment, not a form. User can answer, skip, or say "not today." Answers feed silently into direction refinement and role recommendations. Questions surface naturally — when there's not much else happening on the dashboard, or at the start of a session. This is a core return mechanic: a reason to open the product even when there are no new listings.
  - **Question bank source:** `personal_reflection_questionnaire.docx` at `/Users/Lexi/Desktop/Files/Dad/personal_reflection_questionnaire.docx`. Needs a dedicated synthesis session before build: review all questions, remove confrontational framing, reword to match Arlo's voice, filter for relevance, sequence by depth (lighter → deeper over time). Lexi's draft answers in that file are for context only — ignore them for the product.
  - **Design session required before build** — how and where does the coaching question appear? (Arlo panel on dashboard home? A dedicated coaching moment between sessions?) Needs product + design pass.
- [ ] **Restart behaviour design decision** — current copy: "Your analysis restarts. Applications you're tracking stay safe." Decision to revisit in Phase 3 when real data exists: exactly what gets cleared (direction, roles feed, skills gap) vs what stays (applications, saved roles, conversation history). The current split is a reasonable default but needs validation once the data model is real. Lexi flagged 2026-06-11.
- [ ] **Daily check-in mechanic** — "What did you do today?" The advisor celebrates small progress. One next step. Momentum strip.
- [ ] **Explicit away mode** — user optionally tells the advisor they'll be away. Advisor acknowledges, waits, resumes with continuity on return. Nice-to-have; implicit away mode (Phase 2) handles most cases.
- [ ] **Contacts finder** — ⚠️ requires solicitor opinion on UK GDPR contact discovery before this feature is built. Do not begin until legal clearance obtained. Find the right person at a target company; fallback to careers email.

---

## Phase 4: Intelligence & Data Depth

_Goal: The product knows more than the user has told it. It brings external intelligence to the search._

- [ ] **Platform intelligence & audit loop** — A continuous internal monitoring system that audits its own outputs and flags quality issues automatically. Moved from Phase 6+ — requires Phase 3 to be live (real API calls, real Arlo conversations) before it can audit anything meaningful. Needs a dedicated planning session before build. Key components: self-auditing AI layer (monitors tone, data accuracy, logic); role-based audit personas — Engineer (API errors, pipeline failures), Designer (visual regressions, token drift), Product (feature quality, edge cases); 5 user archetypes — Anxious Graduate, Career Switcher, Underconfident Achiever, Direction-Seeker, Almost Ready. Governance: who actions each finding type.

- [ ] **LinkedIn integration** — contact discovery for outreach. Find the right person at a target company. Onboarding is CV-only — LinkedIn is never part of the initial flow. Optional later feature. (Note: LinkedIn API is restricted — v1 approach likely OAuth for basic profile data or user-initiated; not in onboarding)
- [ ] **Glassdoor data** — company culture scores, real salary ranges, actual interview questions asked at that company, difficulty ratings. Feeds company research and interview prep.
- [ ] **Reed API** — ✅ moved to Phase 3b Session A (Pipeline Intelligence). Already incorporated into niche-sector strategy above.
- [ ] **Additional job sources** — Indeed, company direct career pages, graduate-specific boards (after Reed is proven)
- [ ] **Companies House (UK)** — legal company info, headcount, financials, founding year. Adds credibility to company research.
- [ ] **Self-knowledge questionnaire** — the 5 identity questions (Who are you without your labels? When have you felt most absorbed? etc.) surfaced gradually over time in conversation, never as a form
- [ ] **Skills gap map** — interactive, not static. Progress bars update as user closes gaps.
- [ ] **WhatsApp / SMS notifications** — push urgent moments to where the user actually is. "Your interview is tomorrow at 9am."

---

## Phase 5: Growth & Polish

_Goal: The product is ready for scale. Design is perfect. Mobile works._

- [ ] **Advisor character elevation** — full backstory, name finalised, icon elevated beyond current SVG approximation (see Arlo upgrade note in Phase 2). Juno-model from Jack & Jill reference.
- [ ] **Design elevation pass** — not a redesign. Systematically elevate every screen: depth, shadow hierarchy, spacing rhythm, typographic fine-tuning. Session per screen or grouped by component type.
- [ ] **Page transitions & animations** — Next.js App Router + Framer Motion (or CSS View Transitions API). Key moments: page-to-page fade/slide, Arlo message appear, direction card reveal, role cards loading, progress bar animation in Skills. Reference: Linear's transitions. Reduced-motion always supported.
- [ ] **Full animation pass** — micro-interactions across all components: button lifts, card hovers, input focus states, send button press. One sweep after page transitions are done.
- [ ] **Mobile design and build** — deferred until desktop is proven. Do not raise until Lexi raises it.
- [ ] **Error states and empty states** — designed and built for every screen
- [ ] **Shareable card** — user can share their direction / a milestone (optional, depends on traction)
- [ ] **Performance audit** — Lighthouse scores, Core Web Vitals, load time optimisation

---

## Future Vision (Phase 6+)

_These are real ideas. They require Phase 3–5 to be proven before they're worth building._

- University career portal integrations — sync with uni-exclusive job boards for student users
- In-job progression module — once employed, platform helps the user develop, grow, aim for promotion
- International users — visa sponsorship filtering, legal documentation guidance
- Autonomous job applications — product applies on the user's behalf with tailored CV and cover letter (enormous complexity; legal/ethical questions; only if demand is proven)
- B2B: employer intelligence and university licensing — only after B2C is proven. Do not pursue before Phase 4.
- Google Drive / Dropbox — store and version tailored CVs and cover letters
- "Avoidance mode" users — a distinct onboarding for users who know they should be searching but aren't. Meets them differently.

---

## Parking lot (ideas without a phase yet)

- Response time tracker per company — "Innocent Drinks typically responds within 2 weeks." Build from aggregated data over time. Phase 4–5.
- Industry encyclopaedia — show users what exists before they search. Multiple interviewees couldn't search for what they didn't know existed. Phase 4.
- CV creation from scratch — for users who don't have a CV yet. Phase 3.
- Live job updates — dashboard always shows current matches, not a static snapshot. Phase 2–3.

### Ideas from Session 16 (2026-06-10) — LinkedIn article on AI recruitment crisis

Context: article surfaced that graduates are competing ~500:1 for roles, parents paying £30k for career coaches to "beat AI recruitment systems". Product already addresses this philosophically (quality over volume, direction first). Three concrete additions:

**Phase 3 — ATS awareness in CV and application guidance**
Arlo should flag when a user's CV is unlikely to pass automated screening for a specific role. Not keyword stuffing — genuine signal: "This job description uses 'stakeholder management' three times. Your CV doesn't use that phrase. That matters for automated screening." Subtle, specific, honest.

**Phase 3 — One-way video interview prep**
Increasingly standard at the graduate level. Arlo can coach users through the specific format: how to pace yourself, how to treat a camera, what companies are looking for, how to handle blank time. Not currently in scope anywhere — needs a design session before build.

**Phase 5 — Positioning: "The £30k career coach, at a price anyone can afford"**
This is the strongest single-line pitch for what this product actually is. Save for the landing page copy session and fundraising narrative. Do not use prematurely — product must be good enough first.

**Phase 2 polish — Retry icon in error-states.html**
SVG arc approach failed at small render size (arc appears as full circle). During Phase 2 build, replace with a proper icon from Heroicons, Phosphor, or Lucide rather than hand-coding SVG paths.

**Phase 5 — Applications card overflow menu (•••)**
Replace the current Archive ghost button with a proper `•••` overflow menu per card. Actions: Archive, Go back a stage, Mark as rejected, Delete. Lexi's idea from Session 19. Current ghost button is the interim solution. "Go back a stage" added Session 19 as the undo path for accidental stage advances.

**Phase 4 — Platform intelligence & audit loop** — moved to Phase 4 (see above). Requires Phase 3 to be live before it can run meaningfully.

**Phase 3 — Arlo interaction frequency setting**
Some users want Arlo to prompt them with new ideas and conversation unprompted; others want to drive the conversation themselves. Add a preference (profile settings or via conversation with Arlo): "How active should Arlo be?" — three levels: proactive (Arlo initiates), responsive (Arlo only replies), quiet (notifications off). Needs a design pass before build. Consider whether this lives in profile preferences or purely in Arlo conversation.

**Phase 2 polish — Arlo notification badge when hidden**
When Arlo is hidden and generates a new message, show a small badge/dot on the Arlo toggle icon so the user knows something is waiting. Works like an unread count. Simple: badge number or a plain dot. Design pass needed — must not feel intrusive.

**Phase 3 — Unauthenticated / empty profile state**
Currently undesigned. When a user runs results without saving (continues without signing up), they have no account and cannot access the dashboard. Two things needed: (1) what does the profile tab look like for an authenticated user who hasn't completed their profile yet? (2) Does an unauthenticated user see a dashboard at all, or are they directed to save first? Decision needed before Phase 3 auth build. Lexi flagged 2026-06-11.

---

## Document hierarchy — which file wins

When documents conflict, this order decides:

1. `SESSION_DECISIONS.md` — wins on all visual/design decisions
2. `CLAUDE.md` — wins on architecture, git workflow, product decisions
3. `ADVISOR_PERSONA.md` — wins on all advisor copy and behaviour
4. `brainstorms/career-intelligence-emotional-vision.md` — wins on emotional intent and voice
5. `ROADMAP.md` (this file) — wins on sequencing and phase assignment
6. `DESIGN_BRIEF.md` — informational only, superseded by SESSION_DECISIONS.md
7. `tokens.css` — stale, must be reconciled with SESSION_DECISIONS.md before Phase 2
8. `BASE44_HANDOVER.md` — archived, do not use
9. `TASKS.md` — outdated, will be refreshed for Phase 2

---

## Skills by phase

Skills are installed from `~/Desktop/Claude Code/All Installed Skills/` when a phase begins. Never skip this step.
Built-in project skills live in `.claude/skills/` — always available, no install needed.

**Every phase (built-in, always active):**
- `/session-handoff` — run at the end of every session. Produces a handoff block to paste into the next session. If context >60%, compact first.
- `/deploy-check` — mandatory before any merge discussion. Never skip.

**Phase 0 (design — current):**
- `/design-guard` — run before marking any screen locked. This is the exit condition for every design session. If it passes, the screen is done — stop iterating.
- `/persona-check` — run before any advisor copy or chat output is approved. Required before any advisor text goes to staging.
- `/design-review` — run after each screen is designed before marking it locked
- `/verification-before-completion` — run before calling any design session done
- `/frontend-design` — use if building new mockup screens

**Phase 1 (bug fixes / foundation):**
- Reinstall `/systematic-debugging` — for OTP fix and any hard-to-diagnose bugs
- Reinstall `/zoom-out` — before touching architecture or making broad changes
- Use `/goal` for bug fixes with objective criteria (e.g. OTP fix, pipeline speed). See `INSIGHTS.md` section 3.

**Phase 2 (visual redesign build):**
- Reinstall `/tdd` — test-driven for any new logic
- Reinstall `/webapp-testing` — end-to-end flow verification
- `/verification-before-completion` — before any PR or staging deploy
- Read `INSIGHTS.md` sections 4c (frontend build workflow) and 4d (Claude Design) before Phase 2 build begins

**Phase 3+ (features):**
- `/brainstorming` — before designing any major new feature (CV builder, contacts, email integration, etc.)
- `/grill-me` — stress-test any complex product decision before committing to it
- `/mcp-builder` — for each new external integration (email OAuth, LinkedIn, Glassdoor, etc.)
- Read `INSIGHTS.md` section 5 (CLI vs MCP hierarchy) before adding any new external connection

---

## Session discipline

**At the start of every session:**
1. Read `CLAUDE.md` → START HERE block
2. Read `ROADMAP.md` → confirm current phase and session focus
3. Read `PLAYBOOK.md` → find the current session, confirm what to do and what skills to invoke
4. Read `INSIGHTS.md` → find sections tagged with the current phase, surface any relevant guidance
5. State: "We're in Phase [X]. Today's session is [Y]. Skills: [what to invoke]. From INSIGHTS.md: [relevant guidance]."

**At the end of every session:**
- Run `/session-handoff` — produces a handoff block. Compact first if context >60%.

**When Lexi has an idea mid-session:**
1. "Good idea — that's a Phase [X] feature. I'm adding it to the roadmap."
2. Add it to the right phase in this file.
3. "Right now we're focused on [current task]. We'll get to [idea] in Phase [X]."

**Never:**
- Skip phases
- Start Phase 2 work while Phase 0 is incomplete
- Add an idea to "the parking lot" without assigning it a phase
