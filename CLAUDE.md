# Career Intelligence — Project Instructions

## Role

Claude Code is technical co-founder. Lexi is the non-technical founder. This means:
- Make decisions, challenge assumptions, and direct the work — don't present lists of options when a recommendation is appropriate
- When options are genuinely necessary, present a maximum of two — never more
- Challenge any request that contradicts a previous confirmed decision — never silently comply
- Honest pushback is always expected. Never agree just to agree. If something is the wrong approach, say so before starting.
- Proactively flag when a repeated workflow pattern should become a skill
- One thing at a time. Complete it properly before moving to the next.

## Session Discipline — Non-Negotiable

**Before touching any file:**
1. Run `git branch` and confirm `* staging` is active
2. If not on staging: stop, say so, do not proceed
3. Never touch `main` without explicit instruction from Lexi — not a suggestion, not a hint, explicit instruction

**Build vs design sessions are separate.** Design must be locked before build begins. Never make unrequested design changes during a build session.

**Never run more than one build thread at a time. Never guess at what needs changing** — ask for a screenshot or specific feedback first.

## Claude Code Workflow Rules — Standing Instructions
_Full context: `INSIGHTS.md` — read before any complex session._

1. **Start in plan mode.** Shift+Tab before touching any file. Read, reason, get approval — then execute.
2. **Haiku for sub-tasks.** Sub-agents, `/goal` tasks, research — all default to Haiku unless reasoning demands Sonnet.
3. **`/goal` for bug fixes.** Specify: what to fix, what done looks like (objective criteria), which files not to touch.
4. **Never skip `/deploy-check`.** Required before any merge discussion. No exceptions.
5. **Compact at 60% context.** `/compact` with: "keep all API integration and design token decisions from SESSION_DECISIONS.md."
6. **Run `/session-handoff` at end of every session.** Compact first if context >60%.
7. **Don't switch models mid-session.** Model switches break the cache entirely.
8. **Sessions idle >1 hour break the cache.** If stepping away: session handoff → `/clear` → paste summary into new session.
9. **CLAUDE.md max 200 lines.** If it grows past 200, prune before the next session.

## The Product

**Meridian** is a career intelligence platform for graduates and early-career individuals who don't know what they're looking for. Not a job board. Not an AI tool.

**The user:** Someone at a genuine crossroads — anxious, uncertain, without a clear direction. They need to understand themselves before they can search at all. Emotional context is anxiety. Every design and copy decision must address this.

**Core pipeline:** CV/background input → infer direction → suggest role titles → live job listings ranked by fit → company value matching → specific contact → personalised outreach draft → skills gap map → 3 daily actions.

**The product is a daily companion, not a one-time tool.** Return mechanics and compounding value are central.

**Goal:** 100 users. Proof the market exists. Product good enough that first users tell others.

## Emotional Arc & Voice

**The arc — permanent north star:** Meraki → Satori → Kavanah.
User arrives with their whole self. Something clicks — the path becomes visible. They move forward with genuine intention. Every decision should move the user along this arc.

**Voice:** Warm, direct, economical. Always "I" and "you." Reflects back what the user actually said. Never "AI-powered", never cheerleading, never generic advice that could apply to anyone.

**Full voice guide + memory rules:** `ADVISOR_PERSONA.md` — source of truth for all advisor behaviour.
**Full emotional vision + parking lot:** `brainstorms/career-intelligence-emotional-vision.md`

**Design references (confirmed):** Resend.com, Linear.app, Craft.do, Dayone, Headspace. Perplexity Computer — homepage structure only (hero → feature grid → CTA layout). Never copy Perplexity aesthetics directly.
**Never use for this project:** Aman, bulthaup — those are DG Air Conditioning references. Wrong register entirely.

## Design Status

**⚠️ Arlo → Meridian override (Session 36, 2026-06-20):** All references to "Arlo" in locked screens are superseded. The advisor has no face, no character name. Advisor panel header = "Meridian". Visual language = astronomical photography as abstract texture. Homepage redesign locked to Perplexity structure. Rebrand design session (37) must complete before any build touches advisor UI.

**Phase 0 — Design. In progress. Do not start engineering until all screens are locked.**

### Locked ✓ (all sessions to date)
- **Design tokens** — `.design/career-intelligence-redesign/SESSION_DECISIONS.md` (source of truth)
- **Homepage** — `mockups/homepage-v2.html` — LOCKED (Session 18, 2026-06-11). Three feature sections: direction / roles that fit / every day. Nav: Log in + Sign up. Fit labels (Strong fit / Good fit) not scores. Copywriting session pending (Phase 5).
- **Dashboard home** — `mockups/dashboard-home.html` — LOCKED (hierarchy fixed Session 10)
- **Input page** — `mockups/input-page.html` — LOCKED (Session 10). Chat UI, Arlo intro sequence.
- **Loading screen** — `mockups/loading-screen.html` — LOCKED (Session 10). Text only, 4 phrases, Arlo 56px.
- **Skills tab** — `mockups/dashboard-skills.html` — LOCKED (Session 13). Direction card + strengths + Before you apply + Worth building. Trajectory framing, not deficit.
- **Applications tab** — `mockups/dashboard-applications.html` — LOCKED (Session 12). Stage filter + application cards + Arlo panel. Stages: Preparing → Applied → Interview → Offer → Archive.
- **Auth overlay** — LOCKED (Session 11). Google OAuth + email OTP. Arlo surfaces save prompt before overlay opens.
- **Roles tab v2** — `mockups/dashboard-roles-v2.html` — LOCKED (Session 13). Tab switcher: Role types / Live listings. Filter pills by role type + Passed. Interested/Pass actions. Post-interest state.
- **Role detail** — `mockups/role-detail.html` — LOCKED (Session 13). Brief + honest picture + salary (UK) + what it rewards + listings link. Arlo personalises on right.
- **Onboarding bridge** — `mockups/onboarding-bridge.html` — LOCKED (Session 13). Arlo → direction card (with roles inside) → Arlo note → CTA.
- **Returning user experience** — `mockups/returning-user.html` — LOCKED (Session 14, 2026-06-10). Three states: new roles / deadline urgency / nothing new. Priority stack in SESSION_DECISIONS.md.
- **Profile tab** — `mockups/dashboard-profile.html` — LOCKED (Session 15, 2026-06-10). Mirror screen. Activity strip + direction card + "What Arlo knows" (background/values/dealbreakers) + CV on file + preferences + account. Profile lives in bottom-left user area, not a nav tab.
- **Basic error states** — `mockups/error-states.html` — LOCKED (Session 16, 2026-06-10). Analysis failure + slow pipeline + lost connection + Arlo chat failure. Arlo error voice locked in `ADVISOR_PERSONA.md`.

### Phase 0 complete ✓ — All screens locked. Phase 1 engineering begins next.

### Key design rules (override anything older)
- Sidebar: white. Direction card: cream. Amber ONLY on: primary button, user chat bubbles, active nav.
- Left-border colour accents on cards = BANNED. Amber/yellow featured card = BANNED.
- Espresso brown ONLY at the bottom (closing CTA + footer as one block). Never mid-page.
- Advisor panel = cream (#F5F3EE). Advisor present on every screen — it is half the product. Panel header: "Meridian". No face, no character name.
- Full token table: `SESSION_DECISIONS.md`

## Design Build Discipline — non-negotiable

1. **Screenshot-iterate before showing Lexi.** Use `.design/tools/shot.js`. Iterate until it's as close as it can be. Lexi is never the first to spot obvious bugs.
2. **Screenshots from shot.js are YOUR OWN observations — never Lexi's.** When `shot.js` returns an image, you took that screenshot autonomously. Never say "looking at the screenshot you sent" or "the screenshot you provided" — that is wrong. Say "looking at this" or "I can see" and describe what you observe in your own voice.
3. **Apply the user-emotion + information lens while iterating.** Is everything clear? Is anything repeated? Is every element necessary? How does an anxious 22-year-old feel looking at this?
4. **Espresso/dark-brown at the bottom only.** Mid-page warmth = subtle amber radial glow only.
5. **Match named references faithfully — with a parity check.** Screenshot the reference AND the mockup. Verify the specific attribute actually matches before showing Lexi.
6. **Cross-check every proposal against source documents unprompted.** Before saying anything "aligns," re-read: emotional vision, SESSION_DECISIONS.md, ADVISOR_PERSONA.md, parking lot. Surface contradictions.
7. **Purposeful and curated — less but more meaningful.** Every element earns its place. Never show the same information twice.

## Technical Architecture

**Target stack (Phase 2 onwards):** Next.js (App Router) · Vercel · Supabase (auth, database, encrypted storage, 90-day deletion) · Vercel API routes · Anthropic API (claude-sonnet-4-6) · Adzuna · Resend

**Current stack (legacy — do not build on top of):** Single `index.html` · Vercel `/api/` serverless. The old frontend is being replaced in Phase 2. Backend `api/` functions port to Next.js API routes with minimal changes.

**API endpoints (carry over to Next.js):** analyse.js · chat.js · config.js · extract.js · jobs.js · profile.js · save-job.js · save-result.js · score.js

**Outstanding performance issue:** ~90s pipeline will cause abandonment. Fix: Haiku for extraction + Sonnet for intelligence + streaming. See `INSIGHTS.md` section 1. Fix during Phase 2 build when analyse.js is ported.

**Context7 MCP:** Installed globally. Active in every session. Pulls live Next.js/React docs — prevents deprecated API suggestions. No action needed.

## Git Workflow

- `main` — production. Never push directly. Never merge without explicit instruction from Lexi.
- `staging` — all work happens here. Workflow: commit → verify on staging preview → Lexi confirms → merge to main.
- **Before any merge discussion:** run `/deploy-check`. Always.
- GitHub token was exposed in a session — needs rotation. Lexi deferred.

## ⚠️ START HERE — Session Continuity (updated 2026-06-20)

**We are in Phase 3b. Session 37 begins next.**

**Session 36 COMPLETE ✓ (2026-06-20):**
- ✓ Product name: **Meridian** — locked
- ✓ Advisor identity resolved: "Arlo" retired — no face, no character name
- ✓ Advisor panel header: "Meridian"
- ✓ Visual language: astronomical photography as abstract texture (not illustration)
- ✓ Key image references identified: moon surface B&W (extreme close-up) + nebula amber/rust
- ✓ Homepage structure: Perplexity Computer layout (hero → feature grid → CTA), Meridian execution
- ✓ University licensing confirmed as Phase 4 B2B path (careers offices, 24/7 direction support)

**Standing instructions (Sessions 35–36):**
- Run audit agent at start of every session before Lexi tests anything
- Batch working: agree full list upfront → build autonomously → push once → Lexi tests
- Design session before build session — never mix them

**Next action (Session 37 — DESIGN session):**
1. Finalise astronomical imagery references with Lexi
2. Design new Meridian homepage (Perplexity structure, Meridian brand, astronomical texture)
3. Design advisor panel — no face, "Meridian" header, cream panel
4. Lock all designs → Session 38 builds them

**Session priority order (next 4 sessions):**
1. Session 37: Meridian homepage + advisor panel design (design only)
2. Session 38: Build rebrand — replace all Arlo/Career Intelligence references, build new homepage
3. Session 39: Direction refinement feature
4. Session 40: CV tailoring + cover letter
→ Launch gate review after Session 40

**At the start of every session:**
1. Run `git branch` — confirm `* staging` is active before touching anything
2. Read `ROADMAP.md` — confirm current phase and today's focus
3. Check `INSIGHTS.md` — find sections tagged with the current phase
4. State: "We're in Phase [X], Session [Y]. Today's focus is [Z]."

**⚠️ Challenge before building — standing instruction:**
Before writing any code in response to Lexi describing a problem or idea: state your understanding of the problem, ask 1-2 clarifying questions, confirm. Never interpret and immediately act. This is a co-founder role — engage first, build second.

**⚠️ Action needed:** Add `REED_API_KEY` to Vercel Production + Preview env vars. Value in `.env.local`. Without this, Reed returns nothing in deployment.

**Master roadmap:** `ROADMAP.md` — single source of truth for sequencing.
**Session-by-session guide:** `PLAYBOOK.md` — read the current session entry before starting work.

## Document Map

| Situation | Read these |
|---|---|
| Start of any session | `CLAUDE.md` → `ROADMAP.md` → `PLAYBOOK.md` (current session) → `INSIGHTS.md` (relevant tagged sections) |
| Design work | + `SESSION_DECISIONS.md` + `ADVISOR_PERSONA.md` |
| Engineering / build work | + `SESSION_DECISIONS.md` + `tokens.css` (once reconciled with SESSION_DECISIONS.md) |
| Writing advisor copy | + `ADVISOR_PERSONA.md` + `brainstorms/career-intelligence-emotional-vision.md` |
| Product decisions | + `brainstorms/career-intelligence-emotional-vision.md` + `ROADMAP.md` |
| Pipeline / sub-agents / model costs | + `INSIGHTS.md` sections 2b, 3, 5 |
| Context management / session discipline | + `INSIGHTS.md` section 2 |
| End of session | Run `/session-handoff`. Compact first if context >60%. |
| Merging to main | Run `/deploy-check`. Always. |
| **Document conflicts** | SESSION_DECISIONS.md > CLAUDE.md > ADVISOR_PERSONA.md > DESIGN_BRIEF.md |
| **Do not use** | `BASE44_HANDOVER.md` (archived) · `tokens.css` (stale until reconciled) |

## Current Phase

**Phase 3a — COMPLETE ✓ (2026-06-14). Phase 3b begun.**

**Phase 0 — Design. COMPLETE ✓** All screens locked (Session 16, 2026-06-10).

**Phase 1 — Foundation Engineering. PARTIALLY COMPLETE ✓**
- ✓ Next.js scaffold (Session 17)
- ✓ Session 23: Backend hardening — auth middleware, Arlo persona, rate limiting, input validation

**Phase 2 — Visual Redesign. COMPLETE ✓** Sessions 19–21, 2026-06-11.

**Phase 3a — Session 24 COMPLETE ✓ (2026-06-12):**
- ✓ Google OAuth wired via Supabase → AuthModal.tsx
- ✓ Email OTP wired to Supabase (signInWithOtp + verifyOtp)
- ✓ Auth callback route `/auth/callback` — new users → /input, returning → /dashboard
- ✓ Session persistence via @supabase/ssr middleware (already in place from Session 23)
- ✓ Sign out wired in Profile (Supabase signOut → redirect to /)
- ✓ Real name/email shown in Dashboard greeting and Profile tab
- ✓ HomepageNav auto-opens signin modal on ?signin=required redirect

**Phase 3a — Session 25 COMPLETE ✓ (2026-06-12):**
- ✓ InputChat: real file extraction via /api/extract, all inputs saved to sessionStorage
- ✓ analyse/route.ts: SSE streaming (enrichOnly branch unchanged)
- ✓ LoadingScreen: SSE consumer — phrase cycling for UX, saves result on complete
- ✓ OnboardingBridgePage: reads real direction + summary + role titles from sessionStorage
- ✓ save-result called fire-and-forget on complete — `results` table recreated with correct schema (CASCADE drop fixed schema mismatch from previous session)

**Phase 3a — Session 26 COMPLETE ✓ (2026-06-12):**
- ✓ Adzuna real job listings in Roles tab (RolesPage reads sessionStorage → /api/results → /api/jobs → /api/score)
- ✓ /api/results endpoint created (GET latest analysis from Supabase)
- ✓ Pipeline architectural fix: two parallel Anthropic calls (~700 + ~1,100 tokens each), Vercel Hobby safe
- ✓ LoadingScreen: redirect to /analysis-error on stream close without complete event
- ✓ Auth callback: respects ?next param for all users (not just returning)
- ✓ AuthModal: redirectTo prop — overrides isNewUser routing for both OAuth and OTP
- ✓ OnboardingBridgePage: checks auth before navigating; opens auth modal with redirectTo=/dashboard
- ✓ "Continue without saving" → /dashboard; /dashboard accessible without auth
- ✓ Jobs: shorter keywords (1-3 words, mixed role/industry/function), fallback search if < 5 results
- ✓ Jobs: score < 4 filtered out, industry-aware scoring, cross-domain collision detection
- ✓ Jobs: 5 shown initially, Load more +5
- ✓ Filter pills: simplified to All + Passed only
- ✓ Input textarea: auto-expands, resets height after send
- ✓ INSIGHTS.md: standing rule on Anthropic token budgets + call architecture

**Phase 3a — COMPLETE ✓ (2026-06-14):**
- ✓ Session 27: Arlo chat wired to /api/chat, conversation history per page in Supabase `conversations` table
- ✓ Session 27: Unauthenticated result persistence fix — re-calls save-result on dashboard load
- ✓ Session 27 follow-up: Rate limiting on /api/chat (100 msg/user/day, Upstash)
- ✓ Session 27 follow-up: Dashboard direction card reads real analysis data
- ✓ Session 27 follow-up: Vercel Production env vars added (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY)
- ✓ Conversations SQL migration run in Supabase dashboard

**Phase 3b — Session 28 COMPLETE ✓ (2026-06-14):**
- ✓ Analysis prompts: specificity rules, sector-aware + seniority-aware keyword strategy
- ✓ Scoring: relevanceReason expanded to 2-3 sentences
- ✓ Reed API: `/api/reed` wired, runs in parallel with Adzuna for all profiles
- ✓ companySuggestions surfaced in direction card on dashboard home

**Phase 3b — Session 29 COMPLETE ✓ (2026-06-15):**
- ✓ Skills tab: reads real data from sessionStorage (`analysis-result`) + /api/results fallback; real auth in sidebar
- ✓ Applications tab: reads from /api/applications; stage changes PATCH /api/applications; empty state links to Roles
- ✓ /api/applications route: GET/PATCH/DELETE for saved_applications table
- ✓ save-job extended: when status=interested, also upserts to saved_applications (stage: preparing)
- ✓ saved_applications table created in Supabase (SQL migration run)
- ✓ Critical bug: sessionStorage key mismatch fixed across all tabs (all now use 'analysis-result')
- ✓ Critical bug: profile call max_tokens raised 1200→1600; required field order fixed so searchKeywords generates before suggestedDirections
- ✓ Critical bug: suggestedDirections now generates before summary/valuesSignals (3-sentence limit on why)
- ✓ Seniority: ALL role-title keywords must be prefixed junior/graduate/assistant for entry-level profiles; senior roles score 1-2 (not 3); fallback removed
- ✓ Dashboard direction card: reads sessionStorage outside auth check (works for unauthenticated users)
- ✓ Dashboard direction card: shows all 3 directions as "Directions worth exploring" (not single verdict)
- ✓ Sign-in gate on Interested button: redirects to signup (not signin) with ?next=/dashboard/roles
- ✓ HomepageNav: reads ?next= param, passes as redirectTo to AuthModal; handles ?signup=required
- ✓ Job caching: results cached in sessionStorage for 30min so listing count is stable across navigates
- ✓ Role card descriptions: first sentence only (not truncated with ellipsis)
- ✓ Real auth (name/email) in Skills, Applications, Roles sidebar
- ✓ Debug console.logs removed

**Phase 3b — Session 30 COMPLETE ✓ (2026-06-16):**
- ✓ Strategic repositioning discussion — see ROADMAP.md strategic context block
- ✓ OTP: show error state instead of silently failing when signInWithOtp errors
- ✓ Profile sidebar: replace hardcoded Lexi/lexi@email.com with real auth data
- ✓ RoleDetailPage: fully rewritten — reads real direction from sessionStorage (slug match); Arlo wired to /api/chat via useArloChat; shows direction title + why + ask-Arlo prompts + other directions
- ✓ ProfilePage: Arlo wired to /api/chat via useArloChat (removed fake timeout response)
- ✓ DashboardHome: all hardcoded placeholder content removed (Bloom & Wild, logistics role, 12 active days, fake counts)

**Phase 3b — Session 31 COMPLETE ✓ (2026-06-16):**
- ✓ Post-audit bug fix pass (commit bd6f07e): Applications loading, direction card labels, Arlo bubble spacing, sidebar email truncation, Profile preference defaults, Arlo system prompt (no fake UI actions), login modal copy, Interested button error logging, middleware session refresh for /api/applications + /api/results

**Phase 3b — Session 32 COMPLETE ✓ (2026-06-18):**
- ✓ Fix: Arlo unauthenticated chat sign-in button (commit 2daa8db)
- ✓ Chrome audit prompt written — `research/audit-prompt.md`
- ✓ Full product audit completed — `career_intelligence_audit_18jun2026.md`
- ✓ Competitive analysis: Apt AI documented

**✓ Direction concept RESOLVED (Session 33, 2026-06-18):**
"Directions" stays as the word. Directions = what the user *could become* — not a verdict, Arlo's observation. Onboarding bridge intro line (locked): "I've been looking at what you shared — here's where I see this going." UI label: "DIRECTIONS WORTH EXPLORING" across all tabs (never "YOUR DIRECTION"). Full detail in ADVISOR_PERSONA.md "Direction framing" section.

**⚠️ STRATEGIC CONTEXT (added Session 30, 2026-06-16):**
- Competitive: Jack & Jill AI ($20M funded) owns the "I know what I want" market. Our lane: people who don't know yet.
- The advisor is the product. Job listings are a utility. Never pitch "we find you jobs."
- Evolution path: B2C self-discovery → university partnerships (Phase 4) → employer network (Phase 5+)
- University angle: careers offices are the B2B wedge. Don't build for them yet — have ONE conversation first.
- Full context in ROADMAP.md strategic context block.

**Pre-launch non-negotiables (Lexi to handle — not deferred to build sessions):**
- ⬜ Add `REED_API_KEY` to Vercel Production + Preview env vars
- ⬜ ICO registration (ico.org.uk/registration, £40/year)
- ⬜ GitHub token rotation (live security risk)
- ⬜ Real privacy policy + terms of service
- ⬜ Wire actual user deletion in Profile tab
- ⬜ Sentry error tracking + Vercel Analytics

**Skills installed:** `systematic-debugging` · `zoom-out` · Context7 MCP (global)

## Professional Engineering Standards

_Applies from the first line of Stage 1 engineering._

- **Tokens are the contract.** `color: var(--accent)` not `color: #A85E16`. Every visual value uses a token. Full token table in `globals.css`. Never introduce a new hex value — add a token first.
- **Token reference (Session 20, 2026-06-11):** `--accent-dark` (#8F4F10 — hover on accent buttons) · `--green` (#3E9B6B — match/success states) · `--green-soft` (rgba(62,155,107,0.1) — badge backgrounds) · `--danger` (#C0392B — urgent/deadline) · `--danger-dark` (#A93226 — danger hover)
- **CSS handles appearance. JS handles behaviour. They never mix.**
- **Every interactive element must have an onClick or href before shipping.** No dead buttons. No `href="#"`. Use `disabled` with a tooltip for things that are coming in a future phase.
- **WCAG AA minimum.** Verified text contrast. Visible focus states. Reduced-motion respected.
- **Clean commits.** One concern per commit. No debug console.log. Descriptive messages.
- **No dead code.** Leave the codebase cleaner than you found it.
- **Error states exist before engineering begins.** Never invented on the fly.
- At the start of every engineering session: install systematic-debugging and zoom-out skills from `~/Desktop/Claude Code/All Installed Skills/`.

## Permanent Product Decisions

- Platform name: **Meridian** — locked Session 36, 2026-06-20. All "Career Intelligence" references in product/copy replace with Meridian.
- Mobile: deferred. Desktop first. Do not raise mobile unless Lexi raises it.
- GDPR: solicitor's opinion on contact discovery outstanding. Flag proactively.
- Merge to main: only on explicit instruction from Lexi, after staging is verified.
- Design sessions and build sessions are separate — never mix them.
- B2C must prove itself before B2B is pursued. Do not raise B2B before Phase 4.
- **Quality over quantity** — the product's goal is fewer, better applications. Never optimise for volume or activity metrics. Every feature should help users spend more time preparing, which produces better outcomes. Applies to skills, applications, outreach, and Arlo's behaviour equally.
- **No gamification** — no streaks, points, badges, or leaderboards. Wrong register for an anxious early-career user. The return mechanic is value: new roles matched, direction clarifying, Arlo remembering.
