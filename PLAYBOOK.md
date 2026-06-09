# Career Intelligence — Session Playbook

_The operational guide. Every session, in order, with everything you need._
_Read ROADMAP.md for the strategic plan. Read this for how to actually run each session._
_Last updated: 2026-06-09_

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

---

### Session 1: Grill-Me — Input Page + Loading Screen Content
**Status: NEXT SESSION**

**What it achieves:** Extracts the content decisions for both screens from Lexi's head. What does the input page ask, in what order, and how? What does the loading screen communicate while the analysis runs? These decisions must be made before design begins.

**Read first:**
- `brainstorms/career-intelligence-emotional-vision.md` — especially the emotional arc table (what each moment should make the user feel)
- `ADVISOR_PERSONA.md` — the loading screen copy is advisor-voice copy
- `CLAUDE.md` — Design Status section (what's locked, what's not)

**INSIGHTS.md sections:**
- Section 1 — "User Journey Extraction [NOW]" — explains why this session matters and what to extract
- Section 4 — "Grill Me Skill" — how the skill works and what output to expect

**Skills to invoke:**
- `/grill-me` — run at the start of the session. Let it ask one question at a time. Do not rush it.
- Target output: a document in `brainstorms/` covering: input page question sequence + emotional register for each step, loading screen copy direction + what the screen communicates, and any decisions about format/structure.

**External resources:**
- Headspace app (confirmed reference for home/companion screens) — screenshot it or open it before the session. The input flow and loading experience should feel like this register: calm, warm, one thing at a time.
- `brainstorms/competitor-research/` — Jack & Jill's approach to onboarding is worth reviewing. They ask very few questions.

**Done when:** A brainstorm doc exists in `brainstorms/` with locked decisions on: what the input page asks + in what order + how it asks them, and what the loading screen shows + what it communicates emotionally.

**Output:** New file in `brainstorms/` — e.g. `brainstorms/input-and-loading-decisions.md`

---

### Session 2: Design — Input Page + Loading Screen + Home Hierarchy Fix
**Status: After Session 1**

**What it achieves:** Designs the two remaining screens and fixes the known equal-weight hierarchy issue on the dashboard home. After this session, Phase 0 is complete.

**Read first:**
- Brainstorm output from Session 1
- `.design/career-intelligence-redesign/SESSION_DECISIONS.md` — full token table and design rules
- `.design/career-intelligence-redesign/mockups/dashboard-home.html` — for the hierarchy fix

**INSIGHTS.md sections:**
- Section 5 — "Design & UX: Protecting the Locked Design System" — screenshot loop discipline
- Section 4c — "Frontend Build Workflow" — the five-hack stack for non-AI-looking design
- Section 4d — "Claude Design" — if you want to iterate visually before building, use Claude Design for this session. Design in Claude Design, export as HTML, bring into Claude Code.

**Skills to invoke:**
- `/frontend-design` — invoke before building any mockup. Always.
- `/design-guard` — run after each screen is finished. This is the exit condition. If it passes, the screen is locked. Do not iterate further after it passes.
- `/verification-before-completion` — run at the end of the session before calling it done.

**External resources:**
- `.design/career-intelligence-redesign/reference/` — Linear screenshots already saved here
- Headspace (input page emotional register — calm, one question at a time, no form feeling)
- Resend.com (typographic confidence, warmth)
- `.design/tools/shot.js` — `node shot.js <file> <out.png>` for screenshots during iteration

**Done when:** `/design-guard` passes on all three screens (input page, loading screen, dashboard home with hierarchy fix). All three marked LOCKED in `SESSION_DECISIONS.md` and `ROADMAP.md`.

**Output:** Updated mockup files + Session 3 entry added to `SESSION_DECISIONS.md` + ROADMAP.md Phase 0 marked complete

---

### Session 3: Advisor Name + Icon
**Status: After Session 2**

**What it achieves:** Names the advisor. This is not a minor decision — the name shapes the entire emotional register of the product. Do not skip this or decide quickly.

**Read first:**
- `ADVISOR_PERSONA.md` — especially the "Character depth" and "Open questions" sections
- `brainstorms/competitor-research/jack-and-jill/juno-soul.md` — how Jack & Jill defined Juno as a specific person with a backstory. This is the model.
- `brainstorms/competitor-research/jack-and-jill/agent-builder-skill.md` — their SOUL.md framework for giving an agent a real character

**INSIGHTS.md sections:**
- Section 1 — "Advisor Persona Depth [NOW]" — run a grill-me session specifically on the advisor persona

**Skills to invoke:**
- `/grill-me` — for the name and character session
- `/persona-check` — after any name/character decisions are made, check they're consistent with ADVISOR_PERSONA.md

**External resources:**
- Jack & Jill's Juno: Oxford Statistics + English Literature background. A specific person, not a concept. This is the model to follow — give the advisor a real backstory.
- Think: what kind of person would a 22-year-old trust implicitly with their career anxiety? Not a career coach. Not a recruiter. Someone closer. Define that person.

**Done when:** Name confirmed by Lexi. Character notes added to `ADVISOR_PERSONA.md`. Name does not appear in any user-facing copy until the product is closer to launch — this session is about internal definition.

**Output:** Updated `ADVISOR_PERSONA.md` with name, character notes, backstory draft

---

### Session 4: Features Roadmap Review
**Status: After all design locked**

**What it achieves:** Reviews every idea in the parking lot, assigns everything to a phase. Produces a clean, sequenced feature list for Stage 1.

**Read first:**
- `ROADMAP.md` — full document
- `brainstorms/career-intelligence-emotional-vision.md` — parking lot section

**Skills to invoke:**
- `/brainstorming` — if new ideas surface that need exploring before assigning

**Done when:** Every parking lot item is assigned to a phase in `ROADMAP.md`. No unsequenced ideas remain.

**Output:** Updated `ROADMAP.md` with all items assigned

---

## PHASE 1 — Foundation Engineering

_Goal: Fix all known blockers before any new work is built on top of them._

---

### Before Phase 1 begins: Install Engineering Skills

Before any engineering session, install these from `~/Desktop/Claude Code/All Installed Skills/`:
- `systematic-debugging` — for diagnosing hard bugs (OTP, pipeline issues)
- `zoom-out` — before any architectural decision or broad change

Say: "We're starting Phase 1 — install systematic-debugging and zoom-out." I will do it.

---

### Session 5: OTP Sign-In Bug Fix

**What it achieves:** Fixes the returning user "Load failed" OTP failure. Currently blocks all returning users from coming back.

**Read first:**
- `CLAUDE.md` — Live bugs section
- `api/` directory — auth-related files

**INSIGHTS.md sections:**
- Section 1 — "OTP Sign-In Bug [NOW]" — use `/goal` with objective criteria
- Section 3 — "/goal Usage" — how to set up the goal correctly

**Skills to invoke:**
- `/systematic-debugging` — start here to diagnose root cause before touching code
- Use `/goal` to drive the fix: *"Fix the returning user OTP sign-in failure — done when a returning user can successfully authenticate end-to-end on staging."*
- `/deploy-check` — run after the fix before discussing merge

**Done when:** A returning user can complete OTP authentication end-to-end on staging. `/deploy-check` passes.

**Output:** Fixed auth flow on staging branch

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

## PHASE 3 — The Hand-Holding Layer

_Full plan in `ROADMAP.md`. Sessions will be planned when Phase 2 is complete._

**Before each Phase 3 feature, run:**
- `/grill-me` — to extract decisions before building
- `/brainstorming` — for complex features (email integration, contacts finder)
- `/mcp-builder` — for each new external integration (email OAuth, LinkedIn, Glassdoor)

**INSIGHTS.md sections relevant to Phase 3:**
- Section 3 — "Agent Teams [PHASE3+]" — for advisor memory system
- Section 5 — "The Hierarchy: CLI First, Then API, Then MCP [PHASE3+]" — before adding any new integration
- Section 7 — "Voice Agents with 11 Labs [PHASE3+]" — if voice interface considered
- Section 2 — "Git & Parallel Work [PHASE3+]" — git worktrees for parallel sessions

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
- Homepage mockup — provisional lock, do not redesign
- Dashboard home mockup — provisional lock (hierarchy fix in Session 2)
- Roles tab mockup — fully locked (Session 9)
- Advisor persona foundations — `ADVISOR_PERSONA.md` created
- Backend improvements — score.js, jobs.js, analyse.js on staging (merge in Session 9)

---

_Update this file after each session: mark completed steps, add any new sessions that emerge, update "done when" criteria if they change._
