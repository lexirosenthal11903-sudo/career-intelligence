# Career Intelligence — Visual Rebuild Plan & Status

_Snapshot date: 2026-06-21 (end of Session 42 — personalisation locked). Working placeholder name
throughout: **Career Intelligence** (no Lucian, no Arlo). **Next up: TRACK 2, Step A — build.**_

**Canonical design artifacts (the locked soul):**
- `mockups/ci-split.html` — the returning-session shell (resize the divider, close/open the panel).
- `mockups/ci-split-first.html` — the first session / **the click** (conversation full-width).
- `VOICE-IN-UI.md` — the exact advisor copy for every key moment. The build pulls wording from here.

---

## 1. Where we are right now (the honest status)

**The engine is built and stays.** Analysis, job matching (Adzuna/Reed), scoring, accounts/auth,
database, rate-limiting, error tracking — all done in the existing Next.js app. **We are NOT
rebuilding the backend.**

**What we're changing is the front end only** — the layout/structure and the look. The old build
was five separate dashboard tabs with a chat bolted on; it felt fragmented and "not like a mentor."
This session redesigned that into a single, coherent shell.

**The visual is starting fresh** — new structure, new (warm) skin — but on top of the same working
engine. Think: same car, new interior and dashboard.

**Canonical design reference:** `.design/career-intelligence-redesign/mockups/ci-split.html`
(open it, drag the divider, close/open the panel). Everything else this session is in
`mockups/archive/` as the trail.

---

## 2. What we LOCKED this session

1. **The shell = a resizable split workspace** (the VS Code / Claude-artifacts model):
   - **Left:** slim nav (Today · Roles · Your direction · Documents · Profile).
   - **Centre:** the **conversation — always present, never closable** (hard min-width).
   - **Right:** a **closable, resizable panel** that holds whatever's relevant — the roles list, a
     single role (with its contact + outreach + skills *inside* it), your direction, a document.
   - A **draggable divider** sets the balance; the panel has an **× to close**; when closed the
     conversation fills the whole page.
2. **Conversation-first.** The advisor *is* the product; jobs/roles/skills are utilities it brings
   out and you dismiss. Our gravity = "figure out who you are"; jobs orbit that (vs Jack & Jill,
   whose gravity is "fetch jobs").
3. **No separate onboarding or loading screens.** The relationship starts on arrival; learning about
   you, the wait ("give me a minute, I'm reading it properly"), and the **"click"** (direction
   reveal) all happen inside the first conversation. → requires streaming the analysis (already on
   roadmap: Haiku extraction + streaming).
4. **How the materials live (no exhaustive lists):** conversation curates one thing at a time; the
   roles list is the only browsable list (ranked, shallow, filtered by *talking*); **contacts +
   outreach + skills live inside a role**, never as their own tabs; applications = one short
   "Progress" surface.
5. **Progressive disclosure:** nav items/panels earn their way on screen as the relationship deepens
   (no "Progress" before an application exists). No gamification.
6. **Aesthetic:** warm **amber + neutral** palette (our original token system), **Instrument Sans**,
   clean and dense like a real product. **Dropped: green as a theme, serif headers.** (The amber
   system Lexi preferred over the green/serif experiments.)

### Still open (decide during build, don't let them block)
- Final **name** (parked on "Career Intelligence"; one-name decision deferred).
- **Outreach-within-a-role UX** — placement is right, execution needs rework.
- **Contact-email sourcing** — parked for solicitor sign-off; safe MVP = advisor coaches you to find
  the person + drafts the message, we don't scrape/store third-party emails.
- Final **skin polish** (the amber shell is the baseline, not yet pixel-perfect).

---

## 3. How we build it new (the approach)

We keep the existing Next.js app and its API routes, and **replace the front-end shell screen by
screen**, wiring each piece to the APIs that already exist.

- **Split-pane:** use **`react-resizable-panels`** (ships as shadcn/ui `Resizable`). Gives drag,
  min-size on the chat (can never close), collapse on the panel, and remembers the size. We don't
  hand-build drag maths.
- **Tokens:** reconcile our warm amber token set into `globals.css` (one source of truth) before
  building components.
- **APIs already there to wire to:** `analyse` · `chat` · `jobs` · `score` · `results` ·
  `applications` · `save-job` · `extract` · `profile`.

---

## 4. The roadmap — thorough, sequenced, so Lexi never has to think "what's next"

Two tracks, run in order. **Claude guides each step** — at the start of every session: state the
phase, the goal, what "done" looks like, and the model to use. Lexi reacts; she doesn't sequence.

### TRACK 1 — DESIGN (lock the soul before building)

**Phase 0 — "Make it ours" / personalise to Career Intelligence — ✅ DONE (Session 42, 2026-06-21).
_Design, Sonnet normal._**
The shell was locked but generic; this session gave it its voice. What landed:
- **Advisor voice in the real UI — LOCKED.** Exact copy for every key moment written to
  **`.design/career-intelligence-redesign/VOICE-IN-UI.md`** (source of truth the build pulls from):
  first-session opener + wait line, the direction-reveal "**the click**", the "Where we got to" recap,
  role-surfacing lines (+ pass / interested), and the key empty states.
- **The click is now a real screen:** **`mockups/ci-split-first.html`** — the first session as one
  unbroken surface (arrival → share + CV → "give me a minute" wait → the reveal card → bridge to
  roles). No onboarding screen, no loading screen. `ci-split.html` stays the canonical returning view.
- **Warm-amber palette finish confirmed** (the locked token set in both mockups — paper bg, amber
  accent only on primary/lead/active, espresso reserved). No green, no serif.
- **Progressive disclosure shown:** nav surfaces earn their place (Documents greyed pre-use; Roles
  appears "new" at the click).

**Decisions taken in S42 (Lexi):**
- **Branding — the logo/mark AND the final name — deferred to a dedicated identity session** (below).
  The radiant-point mark stays as a working placeholder. The advisor currently speaks as the product
  ("Career Intelligence", no separate Arlo/Meridian name) — `ADVISOR_PERSONA.md` is stale on the name;
  reconcile it in the identity session, not before.
- **Astronomical/identity texture is out of the app shell** — it's landing-page territory. The app
  stays pure warm-amber-on-paper. (`img-moon.jpg` / `img-nebula.jpg` held for the homepage.)

**Phase 0b — Brand & identity session (DESIGN, later — slot before first users). _Design, Sonnet._**
Deferred from S42 on purpose. Scope: the final **name** (one name, the brief is in
`brainstorms/conversation-first-structure.md` §Naming), the **logo/mark** (refine radiant-point vs
alternatives), and the **homepage texture** treatment (where the astronomical imagery lives). Reconcile
`ADVISOR_PERSONA.md`'s name once decided. Not a blocker for the build below — the build uses the
placeholder name and the locked mark.

### TRACK 2 — BUILD (on the locked, personalised design)

**Step A — Design system lock (½ day).** Reconcile warm amber tokens into `globals.css`; capture the
component styles from `ci-split.html` **and `ci-split-first.html`** (nav item, recap card, **reveal /
the-click card**, message bubble, **file-attachment chip**, **wait bubble**, job row, panel tab, chips,
composer, **progressive-disclosure nav states**) as the component inventory. Pull all advisor copy from
**`VOICE-IN-UI.md`** — never invent advisor wording. _Sonnet, normal._

**Step B — Build the shell (1 day).** Next.js: left nav + `react-resizable-panels` split
(chat | closable panel). Static, no data yet. Match `ci-split.html`. _Sonnet, normal._

**Step C — Conversation pane (1 day).** Message list + recap cards + composer + action chips. Wire to
`/api/chat`. _Sonnet, normal._

**Step D — Right-panel contents (1–2 days).** Roles list (wire `/api/jobs` + `/api/score`); a Role
opening in the panel with **contact + outreach draft + skills** sections; Direction view; Documents.
_Sonnet; Opus if state gets hairy._

**Step E — First session, streamed (1–2 days).** Arrival → conversational onboarding → **streaming
analysis into the conversation** (kills the loading screen) → the "click" reveal inline. Wire
`/api/analyse` with streaming. _**Opus, high** — this is the architecture-sensitive step._

**Step F — Progressive disclosure + the emotional moments + polish.** Pills unlock with progress; give
the "click" real weight; reduced-motion; AA contrast pass. _Sonnet; Opus for the reveal moment._

**Then:** share with 3–5 close contacts → real feedback → iterate.

> Reconcile this into `ROADMAP.md` / `REBUILD.md` at the start of the build (don't let the two drift).

---

## 5. Model guidance for tomorrow
- Start on **Sonnet, normal effort** for Steps A–C (mostly mechanical front-end).
- Switch to **Opus, high** for **Step E** (streaming first-session) and any tricky panel state.
- Don't switch models mid-session (breaks the cache) — plan the day so like-work is grouped.
