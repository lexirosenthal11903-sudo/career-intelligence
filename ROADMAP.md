# Career Intelligence — Master Roadmap

_Last updated: Session 9, 2026-06-08_
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

## → Phase 0: Design (CURRENT — in progress)

_Goal: Every screen designed and locked before a single line of engineering begins._

### Done ✓
- ✓ Design language — tokens, colour, typography, component rules (`SESSION_DECISIONS.md`)
- ✓ Homepage — direction locked (provisional; final polish after dashboard complete)
- ✓ Dashboard home — provisionally locked (known issue: visual hierarchy, equal weight — must fix)
- ✓ Roles tab — locked (`mockups/dashboard-roles.html`)
- ✓ Advisor persona foundation — `ADVISOR_PERSONA.md` created

### In progress
- ✓ **Input page** — LOCKED (Session 10, 2026-06-09). Chat UI. `mockups/input-page.html`
- ✓ **Loading screen** — LOCKED (Session 10, 2026-06-09). Text only, 4 phrases. `mockups/loading-screen.html`
- ✓ **Dashboard home hierarchy fix** — LOCKED (Session 10, 2026-06-09). Direction as hero, hierarchy fixed.

### Still to do before engineering
- **Advisor name + icon session** — do not name the advisor without a dedicated session. Too important to decide quickly.
- **Features roadmap review** — once all screens are designed, review the full parking lot and assign everything to a phase. This session produces the sequenced feature list for Stage 1.

---

## Phase 1: Foundation Engineering

_Goal: Fix all known blockers before any new work is built on top of them._

- [ ] Fix Sign-in OTP failure ("Load failed") — **critical blocker: returning users cannot come back**
- [ ] Remove debug console.log commits from codebase
- [ ] Fix "About 60 seconds" copy — actual time is ~90s
- [ ] Input field styling (location, salary, dealbreaker) to match design system
- [ ] Fix overscroll showing faint colour on aggressive pull
- [ ] Rotate GitHub token (was exposed in session — Lexi deferred)
- [ ] Merge staging backend improvements (score.js, jobs.js, analyse.js — ready and waiting)
- [ ] Performance fix: split the ~90s analysis into two calls (Haiku for extraction, Sonnet for intelligence) + add streaming so the user sees progress rather than a blank wait
- [ ] Next.js migration decision — assess whether to rebuild the frontend in Next.js before Stage 1. Timing: after design is locked, before build begins. (Recommended: yes — single index.html will become unmanageable at scale)

---

## Phase 2: Visual Redesign (Stage 1 Build)

_Goal: Implement all locked designs. The product looks and feels like the designed version._

- [ ] Implement homepage redesign
- [ ] Implement input page redesign
- [ ] Implement loading screen
- [ ] Implement dashboard home (with hierarchy fix applied)
- [ ] Implement Roles tab (full interaction: interested/pass, advisor responds, live updates)
- [ ] Implement sidebar navigation
- [ ] Auth overlay redesign (sign in / sign up)
- [ ] Applications tab — basic pipeline view (Saved / Preparing / Applied / Interview / Offer)
- [ ] Profile tab — interactive (preferences, CV on file, direction summary)
- [ ] Returning user experience (first return after analysis — "Welcome back, here's where we left off")
- [ ] Advisor memory architecture — cross-session persistence (never re-asks questions)

---

## Phase 3: The Hand-Holding Layer

_Goal: Every job the user saves becomes a full guided journey. This is the product's core promise._

- [ ] **Per-job CV builder** — tailors the user's CV to the specific role
- [ ] **Per-job cover letter builder** — personalised to the role and the user's story
- [ ] **Contacts finder** — people at the target company worth reaching out to (LinkedIn integration); fallback to careers email or company email
- [ ] **Interview prep** — company-specific questions, assessment centre guidance, what to expect at each stage for that specific company
- [ ] **Company research layer** — values, culture, recent news, how they align with what the user has told us
- [ ] **Full application pipeline tracking** — Saved → Preparing → Applied → Interview → Offer/Rejection, per job
- [ ] **Email inbox integration** — Gmail/Outlook OAuth (read-only). Advisor automatically detects interview invites, rejections, offers, assessment bookings. Updates pipeline without user having to log anything. Prompt: "I saw you heard back from Innocent Drinks — want to start preparing?" Privacy: "I only read emails from companies you've applied to." Explicit opt-in, revocable.
- [ ] **Calendar integration** — Google/Outlook Calendar. Detects interview dates from emails, schedules prep reminders, tracks deadlines. "Your Innocent Drinks interview is in 3 days — let's prepare."
- [ ] **Daily check-in mechanic** — "What did you do today?" The advisor celebrates small progress. One next step. Momentum strip.
- [ ] **Away mode** — user tells the advisor they won't be around. Advisor acknowledges and waits. On return: continuity, no re-onboarding, no guilt.

---

## Phase 4: Intelligence & Data Depth

_Goal: The product knows more than the user has told it. It brings external intelligence to the search._

- [ ] **LinkedIn integration** — contact discovery for outreach. Find the right person at a target company. (Note: LinkedIn API is restricted — may require web-based approach rather than formal API)
- [ ] **Glassdoor data** — company culture scores, real salary ranges, actual interview questions asked at that company, difficulty ratings. Feeds company research and interview prep.
- [ ] **Reed API** — expand job sources beyond Adzuna (more volume, better UK coverage)
- [ ] **Additional job sources** — Indeed, company direct career pages, graduate-specific boards
- [ ] **Companies House (UK)** — legal company info, headcount, financials, founding year. Adds credibility to company research.
- [ ] **Self-knowledge questionnaire** — the 5 identity questions (Who are you without your labels? When have you felt most absorbed? etc.) surfaced gradually over time in conversation, never as a form
- [ ] **Skills gap map** — interactive, not static. Progress bars update as user closes gaps.
- [ ] **WhatsApp / SMS notifications** — push urgent moments to where the user actually is. "Your interview is tomorrow at 9am."

---

## Phase 5: Growth & Polish

_Goal: The product is ready for scale. Design is perfect. Copy is final. Mobile works._

- [ ] **Advisor character session** — name, icon, full backstory (Juno-model from Jack & Jill reference). This gives the advisor a specific personality, not just rules.
- [ ] **Voice examples session** — 20–30 sample advisor messages across all key moments. The voice reference for all future copy.
- [ ] **Landing page copy session** — final homepage copy, including Meraki/Satori/Kavanah as narrative element. Three words displayed on the landing page.
- [ ] **Full animation pass** — micro-interactions, transitions, scroll-reveal, reduced-motion support
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
