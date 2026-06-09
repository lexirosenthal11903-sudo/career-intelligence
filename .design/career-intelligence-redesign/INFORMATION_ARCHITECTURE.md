# Information Architecture: Career Intelligence

**Date:** 2026-06-06
**Status:** Locked — approved before build begins
**Brief:** `DESIGN_BRIEF.md` (same folder)

---

## Decisions Made Before This Document

| Decision | What | Why |
|---|---|---|
| Post-auth gate | Users get results before being asked to sign up | Value first, then commitment. Drop-off is highest before value is shown. |
| Home-first model | Dashboard opens on a personal Home view, not a feature tab | The product is a companion — it surfaces what's relevant now, not a feature inventory |
| Tabs removed | The guided tab sequence (Profile → Skills → Companies → Roles → Next Steps) is replaced | Tabs imply "pick a feature." The Home view guides contextually instead. |
| Companies folded in | No separate Companies tab | Company value matching lives inside role cards, not its own section |
| Next Steps folded in | No separate Next Steps tab | Daily action lives on the Home view |
| Navigation always accessible | Sidebar always visible in the app | Easy navigation once familiar — agreed by Lexi |
| First-visit guidance | Home view itself guides the user — no locked tabs | Contextual surfacing is more personal than enforced sequence |

---

## Site Map

```
Career Intelligence
│
├── Homepage  /
│   ├── Hero (above fold)
│   ├── Product demonstration (scroll sections)
│   ├── Engagement hook / social proof
│   └── Final CTA
│
├── Input flow  /discover
│   ├── Step 1 — Background
│   ├── Step 2 — Direction
│   ├── Step 3 — Goals
│   ├── Step 4 — Preferences
│   └── Loading screen
│
├── Auth modal  (overlay — appears after results load)
│   ├── Sign up (email OTP)
│   └── Sign in (email OTP)
│
└── App — Dashboard  /app
    ├── Home  /app  ← default landing for all visits
    ├── Roles  /app/roles
    ├── Skills  /app/skills
    ├── Outreach  /app/outreach  [Phase 2 — not built yet]
    ├── Applications  /app/applications  [Phase 2]
    └── Profile  /app/profile
```

**Note on URLs:** The current build is a single `index.html` with JS panel switching. URLs above are the target state for the eventual Next.js migration. For now, views are identified by panel + sub-view IDs.

---

## Navigation Model

### Pre-app navigation (Homepage + Input flow)
- **Top nav bar**: wordmark left, "Sign in" link right (returning users only), "Find my direction →" CTA far right
- On input flow: nav collapses — just wordmark + "← Start over" link. Nothing else.
- On loading screen: nav hidden entirely. Full focus on the loading state.

### App navigation (Dashboard — panelS3)
- **Left sidebar** (always visible, desktop): wordmark at top, nav items in the middle, profile at the bottom
- Sidebar width: 220px. Never collapses on desktop.
- **Sidebar items (in order):**
  - Home
  - Roles
  - Skills
  - — (divider)
  - Outreach *(Phase 2 — shown but dimmed with "Coming soon" label)*
  - Applications *(Phase 2 — shown but dimmed)*
- **Sidebar bottom:** User's name + email, "Sign out" link
- **Active state:** Amber left-border on active item. Warm ink for active label. Muted ink-3 for inactive.
- **Mobile navigation** (Phase 2): Bottom tab bar — Home, Roles, Skills, Profile.

### What "guided" means in the new model
The old system locked tabs in sequence (had to complete Profile before accessing Skills etc). The new model is different: the Home view **contextually surfaces** what to do next. First-time users see a gentle prompt on the Home view ("Start with your direction — then we'll find your roles"). There are no locked tabs — the sidebar is always accessible — but the Home view acts as the guide by showing what's most relevant at each stage.

---

## Content Hierarchy

### Homepage

**Above fold — non-negotiable:**
1. Headline (DM Serif Display — the one thing the product does, in human terms)
2. Sub-heading (who it's for, what they get — one sentence)
3. Single CTA — "Find my direction →"
4. Output preview cards (3 cards showing direction / roles / skills — to the right of headline at desktop)

**What successful products do here:** Resend, Linear, and Headspace all follow the same rule — one clear value proposition above fold, the product shown (not described) in the first scroll. The output cards DO this: they show the actual product before the user has even clicked anything.

**Scroll sections (below fold):**
1. **Product demonstration** — styled role cards + skills gap shown as marketing material, not screenshots. Alternating layout (left/right) with explanatory copy. One sentence per section answering: "what do I actually get?"
2. **Warm amber section** — the engagement hook. "Gets better every time you use it." Shows the daily companion mechanic. Amber or warm surface fill — the one section that breaks the white-card rhythm.
3. **Final CTA** — one line headline, one amber button. The last thing before the footer.

**What must NOT be here:** Feature lists, bullet points of "AI-powered" claims, screenshots of the dashboard, any blue/purple, any generic AI imagery.

---

### Input flow

**Priority order:**
1. The current question (DM Serif Display — this is the emotional moment)
2. The input field (large, breathing room around it)
3. Hint text (warm, conversational — never "please fill in this field")
4. Progress indicator (dots — current step, not percentage)
5. CTA ("That feels right →" — not "Next" or "Submit")

**What successful products do here:** Typeform invented "one question at a time" and it remains the benchmark. Superhuman's onboarding acknowledges each answer before moving. The principle: **each question is a conversation beat, not a form field.** The product is learning about the user. That should feel considered, not transactional.

**No back button visible** until step 2. No skip links. No progress percentage ("Step 2 of 4" is fine as a dot indicator, never as "50%").

---

### Loading screen

**Priority order:**
1. The emotional copy (DM Serif Display italic — the product thinking about this specific person)
2. The animation (amber pulse — calm, organic, not frantic)
3. Sub-copy ("This takes about a minute. Worth it." — Instrument Sans 13px, muted)
4. Nothing else

**What successful products do here:** Notion AI and Perplexity both use this moment to build rather than lose trust. The copy IS the experience. A bare spinner is a missed trust-building moment. Otter.ai uses this moment to explain what they're doing. CI's approach: poetic rather than informational. The product is thinking, not processing.

**No progress steps** (removed from old design — they read as a system checklist, not a companion thinking).

---

### Dashboard — Home view

**This is the most important view in the product. Design it first.**

Content priority (top to bottom):
1. **Direction summary** — DM Serif Display. Personal, specific, warm. "I can see you've built X. You're drawn toward Y. Here's where that leads." Reflects back what the user said. Not a data table.
2. **Top role matches** — 3 cards. Condensed versions of full role cards. Match score prominent. "See all roles →" link.
3. **Skills snapshot** — Top 2 skills to close. Progress bars (empty on first visit, filling on return). "View full skills map →" link.
4. **Today's action** — One thing. Not a list. Warm, specific. "Reach out to [name] at [company]. Here's why now." This is the daily companion mechanic made visible.
5. **What's new** (returning visits only) — a quiet "Since your last visit" section at the very top showing: new matching roles, any skills progress. Shown only if something has changed.

**What successful products do here:** Revolut surfaces your most relevant financial data — not all your accounts and all features. Headspace opens on "what do you want to do today?" — the product asks first. Robinhood shows your portfolio change today + one relevant piece of news. The pattern: **show change, surface one action, make it personal.**

---

### Roles view

> ⚠️ SUPERSEDED BY SESSION_DECISIONS.MD (Session 9, 2026-06-08) — the locked Roles tab design differs from the IA below. SESSION_DECISIONS.MD wins.
> Key changes: match scores removed entirely; no filter bar (advisor gathers preferences conversationally); 50/50 split with advisor always present; plain-English 2-line job card descriptions added.

**Priority order (original — see Session 9 for current locked version):**
1. Direction context line (reminds user why these roles) — 1 sentence in warm ink-3
2. Role cards — full list, ranked by fit
3. Each role card: company + title → location/salary → why it matches → plain-English 2-line description → "I'm interested" / "Pass" actions
4. Applied status on cards (if user has marked as applied)

**Removed from old design:** Companies as a separate tab. Company value matching now lives inside each role card as "why this company fits you" — more contextual, less abstract.

---

### Skills view

**Priority order:**
1. Overview — "X skills you have · Y gaps to close" (simple summary, not a data header)
2. Skills gap map — each gap: skill name → why it matters → how to close it → resources → progress bar
3. Skills you have — list with brief "why this is valuable" note
4. Progress indicators — bars that fill as user marks resources completed (Phase 1: manual toggle; Phase 2: auto-tracked)

**This tab is a competitive differentiator vs Jack & Jill** (they don't have this). Design it as a premium feature, not an afterthought. It should feel as important as the roles view.

---

### Profile view

**Priority order:**
1. User's name and summary (their background as the product understood it)
2. CV / background on file (uploaded file name, option to update)
3. Preferences (location, salary, dealbreakers — editable)
4. Direction (their direction as inferred — option to refine)
5. Account (email, sign out)

Profile is functional, not a feature to design prominently. It lives at the bottom of the sidebar and is accessible but not surfaced in the Home view.

---

## User Flows

### Flow 1: New user — first visit (most important)

```
1. Lands on Homepage
2. Reads headline + sees output preview cards
3. Clicks "Find my direction →"
4. Input flow — 4 questions, one at a time
   - Can upload CV or answer without it
5. Loading screen (60-90 seconds)
   - Sees: "Reading what you've built, and what it says between the lines."
6. Dashboard loads — Home view
   - Sees: direction summary (DM Serif Display, personal)
   - Sees: top 3 matched roles
   - Sees: 2 skills to close
   - Sees: today's first action
7. Auth prompt appears — non-blocking overlay after ~10 seconds on dashboard
   - "Save your results and come back anytime"
   - Sign up with email (OTP)
   - Can dismiss and continue browsing (results stay in session)
8. If signed up: results saved, user now has a returning account
9. If dismissed: gentle reminder in sidebar ("Save your results →")
```

**Key principle:** User sees full value (direction + roles + skills) BEFORE any auth prompt. Auth is never a gate to results — only a gate to saving them.

---

### Flow 2: Returning user — signed in

```
1. Visits homepage — sees "Sign in" in nav
2. Clicks Sign in — enters email → OTP → into dashboard
3. Dashboard Home view loads
   - If something changed: "Since your last visit" section at top
     - New roles matched
     - Skills progress (if any)
   - Direction summary (same, unless they've updated)
   - Top roles (updated with latest listings)
   - Today's action (different from last visit)
4. Navigates freely via sidebar
```

---

### Flow 3: Returning user — not signed in (session expired or different device)

```
1. Visits homepage
2. Has option: "Find my direction →" (new session) or "Sign in" (existing account)
3. If they try to start fresh: encouraged to sign in first
   - "Have you used this before? Sign in to access your results."
4. If they sign in: goes to returning flow (Flow 2)
5. If they genuinely don't have an account: full new user flow (Flow 1)
```

---

### Flow 4: User who dismissed auth — wants to save later

```
1. Is on dashboard (unsaved session)
2. Sidebar shows "Save your results →" link at bottom
3. Clicks it → auth modal opens
4. Signs up → results saved to their account
5. Continues as returning user
```

---

## Naming Conventions

| Concept | Label in UI | Not this | Why |
|---|---|---|---|
| The product's analysis output | Direction | "Results" / "Analysis" / "Match" | "Results" sounds like a test. "Direction" is warm and purposeful. |
| The person's career path | Direction | "Career path" / "Track" / "Role match" | Same as above. One word, human. |
| Suggested positions | Roles | "Jobs" / "Opportunities" / "Listings" | "Jobs" = job board. "Opportunities" = corporate. "Roles" is what we actually surface. |
| Skill deficiencies | Skills to close | "Skill gaps" / "Missing skills" / "Weaknesses" | "Gaps" is clinical. "Missing" is negative. "To close" implies action and agency. |
| Daily action | Today's action | "Next steps" / "Tasks" / "To-do" | "Next steps" is generic. "Tasks" is a to-do app. "Today's action" is singular and immediate. |
| The user saving their results | Save your results | "Create account" / "Sign up" / "Register" | "Create account" is about the product. "Save your results" is about the user's value. |
| Applying to a role | Reaching out | "Applying" / "Submitting" | The product drafts outreach, not applications. The language reinforces that this isn't a job board. |
| The analysis waiting time | Loading / thinking | "Processing" / "Analysing" / "Loading" | The copy handles this — avoid using "analysing" or "processing" anywhere. The product is *thinking*, not crunching. |

---

## Component Reuse Map

| Component | Used on | Notes |
|---|---|---|
| Top nav bar | Homepage, Input flow | Collapses on input flow. Hidden on loading. |
| Left sidebar | Dashboard (all views) | Always visible at desktop. Mobile Phase 2. |
| Role card (condensed) | Home view | 3 cards, compact variant |
| Role card (full) | Roles view | Expanded, with drawer for outreach/contact |
| Skills card | Home view (2), Skills view (full list) | Same component, different count |
| Auth modal | After first results load, on "Save" click | One modal, two states: sign up / sign in |
| Direction summary panel | Home view (large), Dashboard nav header (small) | Same data, two visual treatments |
| Progress bar | Skills cards, Sidebar completion | Same component |
| DM Mono label | Role match scores, step indicators, timestamps | Always uppercase, always --text-xs |

---

## Content Growth Plan

| Section | Growth type | Pattern |
|---|---|---|
| Roles | High — live listings update daily via Adzuna | Paginate: show 10, "Load more". Filter by location/type/salary. |
| Skills gap map | Low — defined by analysis, updated when user re-runs | Static per session. Re-run option in profile. |
| Applications (Phase 2) | Medium — user-driven tracking | Chronological list, status filters (Applied / In progress / Heard back) |
| Outreach drafts (Phase 2) | Medium — one per role engaged with | Attached to role cards, not a separate list |

---

## URL Strategy

Target state (Next.js migration — not yet implemented):

| View | URL | Notes |
|---|---|---|
| Homepage | `/` | Public |
| Input flow | `/discover` | Public |
| Dashboard Home | `/app` | Auth required |
| Roles | `/app/roles` | Auth required |
| Role detail | `/app/roles/[id]` | Auth required |
| Skills | `/app/skills` | Auth required |
| Outreach | `/app/outreach` | Phase 2 |
| Profile | `/app/profile` | Auth required |

Current state (single HTML):
- Panel switching: `showSession(1/2/3)`
- Tab switching: `switchTab('home'|'roles'|'skills'|'profile')`
- No real URL changes — browser back button does not work as expected (known limitation of single HTML approach)

---

## What Is Not Covered Here

These require separate sessions before Phase 2 build begins:

- **Voice and tone** — copywriting session required. All copy in this IA is directional placeholder.
- **Daily check-in UX** — Phase 2. The "what did you do today?" flow is emotionally complex and needs its own design pass.
- **Away mode** — Phase 2. "I won't be around for a while" flow.
- **Shareable card** — Phase 2. The "I got a direction" card for sharing.
- **Onboarding for returning users who re-run analysis** — edge case, Phase 2.
- **Mobile navigation** — Phase 2. Bottom tab bar defined but not designed.
