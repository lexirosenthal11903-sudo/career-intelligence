# Career Intelligence — Session Playbook

_The operational guide. Every session, in order, with everything you need._
_Read ROADMAP.md for the strategic plan. Read this for how to actually run each session._
_Last updated: 2026-06-11 (Session 22)_

---

## How to use this

Each session below has:
- **What it achieves** — one sentence
- **Read first** — open these files before starting
- **INSIGHTS.md** — which sections apply (read them before you start work)
- **Skills to invoke** — when to use them during the session
- **External resources** — references, tools, or links relevant to this step
- **Done when** — the specific exit criteria. When this is met, the session is complete. Do not continue past it.
- **Output** — what gets created or updated

Work through them in order. Do not skip ahead.

---

## PHASE 0 — Complete the Design

_Goal: Every screen locked before a single line of engineering begins._

### Phase 0 status: 11 of 14 screens locked. 3 remaining.

**Locked ✓** (Sessions 9–13, do not revisit):
Design tokens · Homepage · Dashboard home · Input page · Loading screen · Skills tab · Applications tab · Auth overlay · Roles tab v2 + Role detail · Onboarding bridge

---

### Returning User Experience — LOCKED ✓ (Session 14, 2026-06-10)
**File:** `mockups/returning-user.html` · **Decisions:** `brainstorms/returning-user-session.md` · `SESSION_DECISIONS.md`

**What it achieves:** Designs the first-return screen. Someone coming back after a few days. "Welcome back, here's where we left off." No re-onboarding, no direction re-explanation. This is the retention moment — the design must make returning feel worth it.

**Read first:**
- `ADVISOR_PERSONA.md` — memory rules: what Arlo remembers, what he never re-asks
- `SESSION_DECISIONS.md` — direction card pattern, cross-tab consistency rules
- `brainstorms/career-intelligence-emotional-vision.md` — emotional arc, returning user moment
- `CLAUDE.md` — Design Status (what's locked)

**Key questions to resolve before designing:**
- What does the user see first? Is it the same dashboard, or a distinct "welcome back" moment?
- Does Arlo speak first, or does the screen speak first?
- What's different from a first-time visit? What changed since they were last here?
- If they have activity (saved jobs, skills progress) — how is that surfaced?
- If they have no activity — do they see the same state as first visit?

**Design references:**
- Headspace — returning user feel (calm, "here's where you were")
- Duolingo — streak mechanic as reference for daily return value (don't copy, understand the principle)
- Dayone — private, personal, "your record" register

**Skills:** `/frontend-design` before any mockup · `/verification-before-completion` before ending session

**Done when:** A locked mockup exists that handles at minimum: user with activity (saved jobs, skills started), user with no activity, and the Arlo returning message. Marked LOCKED in `SESSION_DECISIONS.md` and `ROADMAP.md`.

**Output:** `mockups/returning-user.html` + SESSION_DECISIONS.md entry + ROADMAP.md updated

---

### Profile Tab — LOCKED ✓ (Session 15, 2026-06-10)
**File:** `mockups/dashboard-profile.html` · **Decisions:** `brainstorms/profile-tab-session.md` · `SESSION_DECISIONS.md`

**What it achieves:** Mirror screen — shows the user what the product has learned about them. Activity strip + direction card + "What Arlo knows" (background / values / dealbreakers) + CV on file + preferences (auto-save) + account (sign out / start fresh / delete). Profile lives in bottom-left user area, not a nav tab.

---

### Basic Error States — LOCKED ✓ (Session 16, 2026-06-10)

**File:** `mockups/error-states.html` · **Decisions:** `brainstorms/error-states-session.md` · `SESSION_DECISIONS.md` · `ADVISOR_PERSONA.md` (error voice section)

4 states: analysis failure (Arlo owns it, retry button, input preserved) · slow pipeline (loading screen text shift, no separate state) · lost connection (amber banner, silent recovery) · Arlo chat failure (inline copy only, no visual state).

---

### Phase 0 Complete ✓ → Phase 1 begins

---

## PHASE 1 — Foundation Engineering

_Goal: Scaffold Next.js, then build Phase 2 screens — fixing backend bugs as they block progress._

**Order confirmed (Option B, 2026-06-10):** Next.js scaffold first → Phase 2 build begins → backend bugs fixed as they block.
**Do not fix bugs in the old `index.html` frontend.** It is being replaced entirely.

**Skills already installed:** `systematic-debugging` · `zoom-out` · Context7 MCP (global)

---

### Session 5: Next.js Scaffold — DONE (Session 17, 2026-06-10)

Next.js 16 + TypeScript + App Router, no Tailwind. All 9 backend functions ported to `src/app/api/` route handlers (config.js dropped — replaced by `NEXT_PUBLIC_` env vars). Old frontend archived in `legacy/`. Shared libs: `src/lib/supabase.ts`, `src/lib/anthropic.ts`. Build + lint clean, endpoints verified locally and on staging deployment.

**Notes for future sessions:**
- Vercel env keys are "sensitive" type — cannot be pulled locally. Local dev needs keys copied from provider dashboards (Anthropic console, Adzuna, Supabase) if full local testing is required. Staging deployment has everything.
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel (Preview/staging branch). **Production needs the same two vars added before merge to main.**
- Supabase auth (Google OAuth + OTP) is NOT yet rebuilt — that happens with the auth overlay screen in Phase 2. The old OTP bug died with the old frontend; verify fresh when auth is rebuilt.

---

### Session 6: Performance Fix — Pipeline Speed

**What it achieves:** Fixes the ~90-second analysis pipeline that will cause user abandonment. Splits into two calls and adds streaming so users see progress rather than a blank wait.

**Read first:**
- `api/analyse.js` — current implementation
- `api/extract.js` — extraction layer
- `INSIGHTS.md` Section 1 in full — the 90-second pipeline fix plan is detailed here

**INSIGHTS.md sections:**
- Section 1 — "The 90-Second Pipeline Fix [PIPELINE]" — the full approach: extract.js on Haiku, analyse.js on Sonnet, streaming
- Section 3 — "Haiku vs Sonnet Split" — why and how to split
- Section 2b — "Effort Levels" — use extra-high/max effort for this session. The architectural decision affects the whole system.

**Skills to invoke:**
- `/zoom-out` — run first to assess the full impact before touching code
- Use `/goal`: *"Refactor analyse.js to stream progress to the user — done when first token appears within 3 seconds and full result loads within 30 seconds on staging. Sub-agents on Haiku. Do not touch score.js or chat.js."*
- `/deploy-check` — after fix

**External resources:**
- INSIGHTS.md Section 3 has the Haiku/Sonnet split architecture in detail
- Vercel serverless streaming docs — Claude Code can fetch these during the session

**Done when:** First token appears within 3 seconds, full result within 30 seconds on staging. No regression on other endpoints.

**Output:** Refactored api/analyse.js and api/extract.js on staging

---

### Session 7: Codebase Cleanup

**What it achieves:** Removes all known debt before Stage 1 build begins. Clean foundation.

**Read first:**
- `CLAUDE.md` — Live bugs section (the full list)

**Tasks in order:**
1. Remove all `console.log` debug statements from production code
2. Fix "About 60 seconds" copy → correct timing (after pipeline fix is known)
3. Fix input field styling (location, salary, dealbreaker fields) to match design system tokens
4. Rotate GitHub token (was exposed in a session)

**Skills to invoke:**
- `/deploy-check` — after all fixes

**Done when:** No console.log in production code. Copy correct. Input fields match SESSION_DECISIONS.md tokens. GitHub token rotated. `/deploy-check` passes.

**Output:** Clean staging branch ready for merge

---

### Session 8: Next.js Migration Decision

**What it achieves:** Decides whether to migrate to Next.js before Stage 1 build. This is a phase gate — the answer shapes how all Phase 2 engineering is done.

**Read first:**
- `INSIGHTS.md` Section 7 — "Next.js Migration [MIGRATION]"
- `CLAUDE.md` — Architecture note (single index.html context)
- `ROADMAP.md` — Phase 1 migration decision item

**INSIGHTS.md sections:**
- Section 7 — "Next.js Migration" — use `/ultraplan` on the full migration scope. Install Context7 MCP before migration.
- Section 2 — "Git & Parallel Work" — git worktrees for parallel sessions during migration

**Skills to invoke:**
- `/brainstorming` or `/grill-me` to work through the decision with clear tradeoffs
- `/zoom-out` — before committing to either path

**Done when:** Decision locked in `CLAUDE.md`. If yes to migration: migration plan in place before any Phase 2 code is written.

**Output:** Decision documented in `CLAUDE.md` + migration plan if applicable

---

### Session 9: Merge Staging Improvements to Main

**What it achieves:** Ships the backend improvements (score.js, jobs.js, analyse.js) that have been sitting on staging since Session 7.

**Read first:**
- Run `/deploy-check` first. If it fails, fix before merging.

**Skills to invoke:**
- `/deploy-check` — must pass before any merge discussion
- Lexi confirms → merge to main

**Done when:** `/deploy-check` passes, Lexi confirms, staging merged to main. Production is up to date.

**Output:** Updated main branch

---

## PHASE 2 — Visual Redesign (Stage 1 Build)

_Goal: Implement all locked designs. The product looks and feels like the designed version._

---

### Before Phase 2 begins: Install Build Skills + Read Key INSIGHTS.md Sections

Install from `~/Desktop/Claude Code/All Installed Skills/`:
- `tdd` — test-driven for any new logic
- `webapp-testing` — end-to-end flow verification

Read before any Phase 2 session:
- `INSIGHTS.md` Section 4c — "Frontend Build Workflow" (the five-hack stack)
- `INSIGHTS.md` Section 4d — "Claude Design" (if iterating visually before building)
- `INSIGHTS.md` Section 5 — "Design & UX: Protecting the Locked Design System"

---

### Sessions 10–17: Screen Implementation (one session per screen)

For every screen, run the same pattern:

**The Phase 2 screen pattern:**
1. Read the locked mockup file + `SESSION_DECISIONS.md` before touching code
2. If this screen has advisor copy: read `ADVISOR_PERSONA.md` first
3. Build → screenshot (`shot.js`) → check against SESSION_DECISIONS.md → fix → screenshot again
4. Run `/design-guard` — if it passes, the screen is done. Do not iterate further.
5. If copy is involved: run `/persona-check` before staging
6. Run `/deploy-check` before any merge discussion

**Screens in order:**
| Session | Screen | Advisor copy? | Key reference |
|---|---|---|---|
| 10 | Homepage | No | Resend.com (typographic confidence) |
| 11 | Input page | Minimal | Headspace (calm, one thing at a time) |
| 12 | Loading screen | Yes — DM Serif Display italic | "Seen, not processed. Someone thinking about you." |
| 13 | Dashboard home (with hierarchy fix) | No | Headspace (one featured card, space as element) |
| 14 | Roles tab (with interactions) | Yes | Linear (structural clarity) |
| 15 | Auth overlay | No | SESSION_DECISIONS.md |
| 16 | Applications tab | No | SESSION_DECISIONS.md |
| 17 | Profile tab | No | SESSION_DECISIONS.md |

**INSIGHTS.md for all Phase 2 sessions:**
- Section 5 — "Screenshot loop for every screen: build → screenshot → check → correct → screenshot again"
- Section 4c — "Screenshot loop (Puppeteer)" and "Inspiration from full sites"
- Section 3 — "Chrome DevTools for Functional Testing" — test actual functionality, not just visual

**External resources for Phase 2:**
- Reference screenshots already in `.design/career-intelligence-redesign/reference/`
- Resend.com, Linear.app, Headspace — screenshot these at the start of relevant sessions
- 21st.dev — for specific UI components (buttons, inputs, animated elements)
- motionsites.ai — for animation ideas (save for Phase 5 polish pass, not now)
- INSIGHTS.md Section 4c — "Individual components from 21st.dev" and "Inspiration from full sites"

---

### Session 18: Returning User Experience

**What it achieves:** First return after analysis. "Welcome back, here's where we left off." No mention of gap. No re-onboarding.

**Read first:**
- `ADVISOR_PERSONA.md` — memory rules (the returning user rules are specific and important)
- `SESSION_DECISIONS.md`

**Skills:** `/persona-check` → `/design-guard` → `/deploy-check`

---

### Session 19: Advisor Memory Architecture

**What it achieves:** Cross-session persistence. The advisor remembers everything and never re-asks questions. This is the trust mechanic.

**Read first:**
- `ADVISOR_PERSONA.md` — Memory section ("What the advisor remembers forever" + "What the advisor never does")
- `INSIGHTS.md` Section 3 — Sub-agents for memory retrieval
- `INSIGHTS.md` Section 7 — "Cross-Session Advisor Memory (Phase 3)"

**INSIGHTS.md sections:**
- Section 3 — "Sub-Agents" — build a research-agent.md for Supabase auth debugging during this session if needed
- Section 2 — "Agent Risk — The Bike Method" — run supervised before giving write access

**Skills:** `/zoom-out` (before architecture decisions) → `/deploy-check`

---

## PHASE 3a — Make It Real

_Goal: Wire the existing backend to the new frontend. A user can go through the full journey with real data._
_Phase 0 + 1 + 2 complete. All sessions below are the next work to do._

**Model for all Phase 3a sessions:** Switch to Opus (`/model claude-opus-4-8`) — architectural decisions that affect the whole system. Switch back to Sonnet for simple wiring once the pattern is established.

**Skills to reinstall at Phase 3a start (from `~/Desktop/Claude Code/All Installed Skills/`):**
- `systematic-debugging` — for any wiring failures or Supabase/API issues
- `zoom-out` — before any architectural decisions

---

### Session 23: Backend Audit + Hardening ← DO THIS NEXT

**What it achieves:** Brings every API route up to professional engineering standards before any frontend wiring. Fix the foundation before building on it.

**Read first:**
- All API routes in `src/app/api/` — read every file before touching anything
- `src/lib/anthropic.ts` and `src/lib/supabase.ts` — shared libs
- `ADVISOR_PERSONA.md` — Arlo's voice and rules (needed for chat.js system prompt)
- `INSIGHTS.md` Section 1 (pipeline fix), Section 3 (Haiku/Sonnet split), Section 2 (agent risk / auth)

**INSIGHTS.md sections:**
- Section 1 — "The 90-Second Pipeline Fix [PIPELINE]" — streaming + Haiku/Sonnet split for analyse.js
- Section 3 — "Haiku vs Sonnet Split [ALWAYS]"
- Section 2 — "Agent Risk — The Bike Method" — auth at the capability level, not instruction level

**Skills:** `/zoom-out` first (read and assess before touching anything) · `systematic-debugging` if issues arise · `/deploy-check` at the end

**Model:** Switch to Opus for this session — `type /model claude-opus-4-8`

**What to fix, in order:**

1. **Auth middleware** (`src/middleware.ts`)
   - Use `@supabase/ssr` package (the current Next.js App Router approach — NOT `@supabase/auth-helpers-nextjs` which is deprecated)
   - Protect routes: `/api/analyse`, `/api/chat`, `/api/save-job`, `/api/save-result`, `/api/score`, `/api/profile`
   - Public routes (no auth needed): `/api/jobs`, `/api/extract`
   - Redirect unauthenticated users to `/` on dashboard routes
   - Context7 MCP is installed globally — use it to pull live `@supabase/ssr` docs during the session

2. **Rate limiting** on expensive routes (`/api/analyse` and `/api/chat`)
   - ✅ **DOING THIS SESSION (Session 23, 2026-06-11)** — reason: `/api/analyse` is intentionally public (logged-out users must reach their "aha moment" before signing up), so rate limiting is the only abuse guard on the most expensive endpoint.
   - `@upstash/ratelimit` + `@upstash/redis` already installed. Upstash free tier £0 at our scale (10k commands/day; ~2-3 per check). Won't exceed free limit pre-launch.
   - When activating: create Upstash Redis DB → add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `.env.local` and Vercel → add `src/lib/ratelimit.ts` → call in `/api/analyse` + `/api/chat` → return 429 on limit.
   - Limit: 10 analyse calls per user per day, 100 chat calls per user per day (adjust after real usage).

3. **`analyse.js` — fix the 90-second timeout**
   - ✅ **DONE (Session 23, 2026-06-11):** `maxDuration` raised 60 → 120 (the actual timeout bug). ⚠️ Capped at 60s on Vercel Hobby — confirm the plan is Pro.
   - ⏸️ **SSE streaming restructure DEFERRED — to be bundled with Session 25 (loading-screen wiring).**
   - **Audit finding that changes this item:** `extract.js` does NOT use an LLM — it parses PDF/DOCX locally with `unpdf`/`mammoth`. The "Haiku for extraction" split in the original plan was based on a stale assumption and does not apply. The only LLM call in the pipeline is the single Sonnet analysis.
   - **Why deferred:** analyse.js returns a forced **tool-use** result (structured JSON), so partial output can't be shown as readable text — "streaming" here means phase-progress SSE events, not visible tokens. That only delivers value once the loading screen consumes the stream (Session 25). It also changes the response contract (JSON → SSE) and can only be verified end-to-end ("first result in 3s, full in 30s") with the frontend wired. Doing it blind to the consumer risks building it half-right.
   - **When done (in Session 25):** convert analyse.js to a `ReadableStream` SSE response emitting phase events; optionally split into a fast first pass (direction + summary, small token budget) so the user sees their direction within ~3s, then a second pass for skills/companyValues/outreach. Verify on staging. Use `/goal`. Do not touch `score.js`.

4. **`chat.js` — add Arlo persona and user context**
   - Currently a bare passthrough proxy — no system prompt, no persona
   - Add Arlo's system prompt directly from `ADVISOR_PERSONA.md`
   - On each call, read user's direction + CV summary + saved roles from Supabase and inject into the system prompt so Arlo knows who it's talking to
   - Keep the web-search beta header — it's used and correct

5. **Input validation** on all routes
   - Validate required fields before hitting any external API
   - Return 400 with clear error if required input is missing
   - `analyse.js`: cvText or direction must be present
   - `jobs.js`: keywords array must be non-empty

6. **Environment variable validation**
   - Add startup checks — if a required env var is missing, fail fast with a clear error rather than a cryptic runtime crash

**External resources (research during session):**
- `@supabase/ssr` Next.js docs — Context7 MCP will pull these live
- Upstash rate limiting docs — upstash.com/docs/redis/sdks/ratelimit
- Next.js App Router streaming / SSE pattern — Context7 MCP
- Anthropic streaming SDK: `client.messages.stream()` method

**Done when:** All protected routes reject unauthenticated requests. Rate limiting active on analyse + chat. analyse.js streams and returns full result in under 30 seconds. chat.js has Arlo's persona and injects user context. `/deploy-check` passes.

**Output:** Updated API routes committed to staging

---

### Session 24: Supabase Auth Wiring

**What it achieves:** Users can sign up and log in with Google OAuth. Session persists. Profile shows real name.

**Read first:**
- `src/components/AuthModal.tsx` — current UI (Google OAuth button already exists, Supabase wiring missing)
- `ROADMAP.md` Phase 3a — auth items

**What to wire:**
- `AuthModal.tsx` → Supabase Google OAuth (needs Supabase project configured with Google provider)
- Session persistence across visits — user stays logged in
- Profile tab `src/app/dashboard/profile/ProfilePage.tsx` — show real name/email from Supabase session
- Dashboard greeting — show real name when authenticated (replace `userName: null` in `DashboardHome.tsx`)
- Sign out button in Profile → Supabase `signOut()` → redirect to `/`
- Unauthenticated users on `/dashboard/*` → redirect to `/` via middleware

**Pre-session setup (Lexi does this, not Claude):**
- Supabase project → Authentication → Providers → Enable Google → add OAuth credentials
- Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Production env (currently only on Preview/staging)

**Done when:** A real user can sign up with Google, return to the dashboard, and see their name. `/deploy-check` passes.

---

### Session 25: CV Pipeline Wiring

**What it achieves:** Input page sends a real CV, gets real analysis, results saved to Supabase, user lands on onboarding bridge with real direction data.

**Read first:**
- `src/app/input/` — current input page
- `src/app/loading/` — loading screen
- `src/app/onboarding-bridge/` — onboarding bridge
- `src/app/api/analyse/route.ts` — after Session 23 fixes

**What to wire:**
- **Build the analyse.js SSE streaming restructure here** (deferred from Session 23 — see Session 23 item 3 for the full finding and approach). This is where it gets verified end-to-end.
- Input page form → POST `/api/analyse` with CV text + preferences
- Show streaming progress on loading screen (connected to the SSE stream built in this session)
- On completion: save full result to Supabase (`save-result` route)
- Onboarding bridge reads real direction data from Supabase (not hardcoded)
- Analysis error page (`/analysis-error`) wired to handle real API failures

**Done when:** Real CV → real direction → real onboarding bridge. Result saved to Supabase. Loading screen shows streaming progress. `/deploy-check` passes.

---

### Session 26: Jobs + Roles Wiring

**What it achieves:** Roles tab shows real live Adzuna listings based on the user's actual analysis results.

**Read first:**
- `src/app/dashboard/roles/` — current roles pages
- `src/app/api/jobs/route.ts` — already solid, ready to use

**What to wire:**
- Roles tab reads user's `searchKeywords` and `locationSearch` from Supabase (set by analyse.js)
- Calls `/api/jobs` with those keywords → real listings in the Live Listings tab
- Score/rank listings — `/api/score` route
- Interested/Pass actions write to Supabase via `/api/save-job`
- Role type tab (Role types) reads from the user's `suggestedDirections` from analysis results

**Done when:** Real jobs from Adzuna appear in Roles tab, ranked, based on the user's actual profile. Save/pass persists. `/deploy-check` passes.

---

### Session 27: Arlo Chat Wiring

**What it achieves:** Arlo responds to real messages with real intelligence, knows who the user is.

**Read first:**
- `src/app/dashboard/DashboardHome.tsx` — current chat UI
- `src/app/api/chat/route.ts` — after Session 23 persona fix
- `ADVISOR_PERSONA.md` — source of truth for Arlo's voice

**What to wire:**
- All Arlo chat panels across dashboard pages → POST `/api/chat`
- Conversation history read from Supabase at session start, written back after each exchange
- Dashboard home state (`new-roles` / `deadline` / `nothing-new`) derived from real Supabase data: last login timestamp, new matches since last visit, nearest deadline

**Done when:** Arlo responds to real messages. Chat history persists across sessions. Dashboard state is real, not hardcoded. `/deploy-check` passes.

---

### Phase 3a complete → launch review

After all four wiring sessions: decide whether to launch to first users now, or continue to Phase 3b (hand-holding layer + copywriting) first. Lexi's call.

---

## PHASE 3b — The Hand-Holding Layer

_Full plan in `ROADMAP.md`. Plan session-level detail when Phase 3a is complete._

**⚠️ Must do before launch:**
- Product name session (Lexi deferred — flag at start of Phase 3b)
- Homepage copy session — `/copywriting` skill
- UI copy session — `/copywriting` skill
- Advisor voice examples

**Before each Phase 3b feature, run:**
- `/grill-me` — extract decisions before building
- `/brainstorming` — for complex features (CV builder, email integration, contacts finder)
- `/mcp-builder` — for each new external integration

**INSIGHTS.md sections relevant to Phase 3b:**
- Section 3 — "Agent Teams [PHASE3+]" — for advisor memory system
- Section 5 — "The Hierarchy: CLI First, Then API, Then MCP [PHASE3+]" — before adding any new integration
- Section 7 — "Voice Agents with 11 Labs [PHASE3+]" — if voice interface is considered

---

## PHASE 4+ — Future Vision

_See `ROADMAP.md`. Not detailed here yet — too early to plan session-level detail._

---

## Standing resources — always available

### Project skills (`.claude/skills/` — always active)
| Skill | When to invoke |
|---|---|
| `/deploy-check` | Before any merge discussion |
| `/session-handoff` | End of every session |
| `/design-guard` | Before marking any screen done |
| `/persona-check` | Before any advisor copy goes to staging |

### Global skills (suggest at relevant points)
| Skill | When |
|---|---|
| `/grill-me` | Before any major feature session — extracts decisions first |
| `/brainstorming` | Before building anything complex |
| `/frontend-design` | Before any mockup or screen build session |
| `/design-review` | After each screen, before locking |
| `/verification-before-completion` | Before calling any session done |
| `/deploy-check` | Before any merge |
| `/mcp-builder` | When adding a new external integration |
| `/copywriting` | Final copy pass (Phase 5) |

### Key files — when to read them
| File | When |
|---|---|
| `ROADMAP.md` | Start of every session |
| `INSIGHTS.md` | Relevant sections at each phase (tagged [NOW], [PIPELINE], [PHASE2], etc.) |
| `SESSION_DECISIONS.md` | Any design or engineering session |
| `ADVISOR_PERSONA.md` | Any session involving advisor copy or behaviour |
| `brainstorms/career-intelligence-emotional-vision.md` | Product decisions, copy sessions |
| `brainstorms/competitor-research/jack-and-jill/` | Advisor persona deepening sessions |

### External references (confirmed for this project)
| Reference | What it's for |
|---|---|
| Resend.com | Typographic confidence, warmth — homepage and marketing |
| Linear.app | Structural clarity, density — dashboard |
| Craft.do | Section differentiation — content-heavy screens |
| Dayone app | Private, personal, warm register |
| Headspace app | Calm, designed for anxious people — input, loading, home companion |
| Jack & Jill (juno-soul.md) | Advisor character depth model |
| 21st.dev | Individual UI components |
| motionsites.ai | Animation inspiration (Phase 5 only) |

---

## What's already done — do not revisit

- Design tokens — locked in `SESSION_DECISIONS.md`
- Homepage — provisional lock (`mockups/homepage.html`)
- Dashboard home — locked with hierarchy fix (`mockups/dashboard-home.html`)
- Input page — locked (`mockups/input-page.html`)
- Loading screen — locked (`mockups/loading-screen.html`)
- Skills tab — locked (`mockups/dashboard-skills.html`)
- Applications tab — locked (`mockups/dashboard-applications.html`)
- Auth overlay — locked (decisions in `brainstorms/auth-overlay-session.md`)
- Roles tab v2 — locked (`mockups/dashboard-roles-v2.html`)
- Role detail — locked (`mockups/role-detail.html`)
- Onboarding bridge — locked (`mockups/onboarding-bridge.html`)
- Advisor name — Arlo. Icon direction locked. (`ADVISOR_PERSONA.md`)
- Backend improvements — score.js, jobs.js, analyse.js on staging (merge in Phase 1)

---

_Update this file after each session: mark completed steps, add any new sessions that emerge, update "done when" criteria if they change._
