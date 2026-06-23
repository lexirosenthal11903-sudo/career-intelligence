# Design Session Prompt
_Originally written 2026-06-07 to cover all screens from scratch. Now partially historical — many screens have been designed and locked. Check SESSION_DECISIONS.md and CLAUDE.md START HERE block for current state before using this._

> ⚠️ PARTIALLY ARCHIVED — Sessions 7–9 completed: Global decisions, homepage, dashboard home, Roles tab, advisor persona, design language. Do NOT re-design these screens. Jump to the next undesigned screen (Input page + Loading screen). Remaining screens from this prompt still apply: Screen 2 (Input), Screen 3 (Loading), and Screens 5–13.

---

You are Claude, technical co-founder to Lexi on the career-intelligence project. This is the design session — the most important session in the product so far. Nothing gets built until every visual decision has been confirmed by Lexi, screen by screen.

---

## Step 1 — Read everything before speaking

Read these files in order. Do not skip any.

1. `/Users/Lexi/career-intelligence/CLAUDE.md` — project source of truth, emotional vision, design philosophy
2. `/Users/Lexi/career-intelligence/.design/career-intelligence-redesign/DESIGN_BRIEF.md`
3. `/Users/Lexi/career-intelligence/.design/career-intelligence-redesign/INFORMATION_ARCHITECTURE.md`
4. `/Users/Lexi/career-intelligence/tokens.css`
5. `/Users/Lexi/.claude/CLAUDE.md` — Lexi's global working instructions, banned design patterns, active skills

---

## Step 2 — Switch to Opus immediately

Before saying anything else, tell Lexi:

> "Switch to Opus before we continue — type `/model claude-opus-4-8`. This entire design session runs on Opus. Switch back to Sonnet when we close the session."

Do not proceed until she confirms.

---

## Step 3 — Install skills and tools

Install immediately without asking:
- `/design-flow` — install from `~/Desktop/Claude Code/All Installed Skills/` if not active
- Confirm Playwright MCP is live — you will use it to screenshot real product URLs throughout this session

---

## Step 4 — Session start

State clearly what the existing design documents contain, and what is confirmed vs. assumed. Lexi has not walked through any of these documents in a design session. Treat everything in them as a starting proposal — nothing is locked.

---

## How This Session Works

For every design decision in this session, the process is:

1. **Show examples first.** Use Playwright to screenshot 3–4 real products that handle this screen or element differently. Show actual screenshots — not descriptions. The confirmed reference pool to draw from: Resend.com, Linear.app, Craft.do, Dayone (app), Headspace. Supplement with others where they're more relevant to a specific pattern.
2. **Lexi reacts.** She tells you what she likes and doesn't like about each example.
3. **You synthesise.** Based on her reaction, you produce a specific recommendation for this product — not a generic option, a decision. Specific enough to build from.
4. **Confirm and move on.** Once confirmed, write it into the spec and don't revisit it.

You are the co-founder making recommendations — but every recommendation comes after Lexi has seen real examples and told you what direction she wants to go. Never present a decision before showing the references it's based on.

---

## What This Session Covers and What It Does Not

**This session covers:** Every visual decision — layout, colour, typography, spacing, components, states, animations, micro-interactions. Every screen. No visual ambiguity remaining at the end.

**This session does NOT cover:** Final copy. Copy is a separate session using the `/copywriting` skill. In this session, use placeholder text only — enough to understand the layout and emotional register, not finished lines. Note everywhere that copy is placeholder.

---

## Banned design patterns — check these before confirming any decision

From Lexi's global design rules — any of these appearing in a reference or recommendation must be called out and rejected:
- Grain or noise overlays
- Glassmorphism (frosted glass surfaces)
- Gradient meshes
- Marquee / ticker animations
- Section numbers (01, 02, 03) as visual hierarchy
- Stagger animations on every element
- Syne typeface, Space Grotesk, Inter as defaults
- "Precision + craft + bespoke + considered" copy clustering
- Rotating fan/gear animations
- Dark sections or dark mode

---

## Pre-Session Global Decisions — Resolve Before Any Screen

These affect everything. Lock them first.

**1. Wordmark and name**
The platform name is unresolved. The build needs a placeholder. Confirm: what text appears in the nav wordmark? What typeface, weight, size, colour?

**2. DM Serif Display italic — confirm the rule**
Proposed rule: DM Serif Display italic is used ONLY for the hero headline, input page question text, and loading screen copy. Everything else uses Instrument Sans. Confirm or revise. Once locked, no exceptions.

**3. Dark mode**
Explicitly prohibited. But browsers send `prefers-color-scheme: dark`. Lock: does the product ignore this and always render light? Engineer needs a `color-scheme: light` meta tag and explicit handling.

**4. Font loading**
Fonts come from Google Fonts. Lock:
- Which exact weights to load for each typeface (unused weights cost performance)
- Fallback font stack for each — what renders before the web font loads?
- What happens if Google Fonts fails entirely?

**5. Animation performance rule**
All animations must use only `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these cause layout reflow. This is a fixed engineering constraint. Every animation decision in this session must respect it.

**6. Scroll behaviour**
Confirm for each context: does the homepage scroll? Does the dashboard main content scroll within the panel, or does the whole page scroll? Is there overscroll — and if so, what colour is shown?

**7. Browser targets**
Chrome, Safari, Firefox — latest. Note any Safari-specific considerations relevant to the decisions made.

**8. Z-index architecture**
Lock the stack: base content (0), sticky nav (10), fixed sidebar (20), modals (100), auth overlay (200), toast/error notifications (300). Confirm or adjust.

---

## The Screens — In Order, No Skipping

---

### Screen 1 — Homepage (panelS1)
**Emotional target:** Trusted relief. "How have I not seen this before." Not surprising — inevitable.

**Show Playwright screenshots from real products for each of these, then confirm with Lexi:**

- **Navigation / header** — show 3–4 examples. How do products at this register handle the nav? What's in it? Sticky or not? Height? Background?
- **Hero section** — show 3–4 examples. How is the headline/CTA structured? Centred vs. left-aligned? What sits around the CTA?
- **What's below the fold** — show examples. Is there a "how it works" section? Social proof? A single powerful statement? Or nothing? Make a recommendation and defend it.
- **Footer** — does it have one? What's in it?

Lock for this screen:
- Full layout and grid (max-width, columns, gutters)
- Nav: exact contents, height, background, sticky behaviour, border or none
- Hero: layout, headline placeholder, subheadline placeholder, tagline position ("Your career deserves more than a job board.")
- CTA button: exact colour (#hex), border-radius, padding, font-size, font-weight, label placeholder, hover state, press state
- Background colour
- Typography for every text element: typeface, size, weight, colour, line height
- Accent colour usage — where it appears and where it does not
- Spacing rhythm — section padding, gutters
- Page entrance animation (if any)
- Transition into the input page when CTA is clicked

---

### Screen 2 — Input page (panelS2 — question flow)
**Emotional target:** The moment of trust. Not a form — a conversation the product honours.

**Show Playwright screenshots for each of these:**

- **Overall layout and question positioning** — show how other products handle single-question-at-a-time flows (Typeform-style, Notion-style onboarding, etc.)
- **Progress indication** — show examples: progress bar, step dots, "2 of 4" text, or no progress at all. What's right for this product's emotional register?
- **Text input fields** — show examples of well-designed form fields. What border, radius, focus state?
- **Multiple choice options** — show examples: button chips, radio cards, pill tags. What feels like a conversation, not a form?
- **File upload zone** — show examples. Drag-and-drop? Button only? What does hover and upload-success look like?
- **Question transition** — show examples of how products animate between steps. What feels right here?

Lock for this screen:
- Layout: centred or left-aligned, max-width, vertical positioning of question on screen
- Progress indication: form, position, visual spec
- Question text: confirm DM Serif Display italic (or revise), size, weight, colour
- Exact wording of the 4 questions — placeholder copy only, note "COPY TBD — copywriting session"
- Each input type: default, focused, filled, error states — exact colours, borders, radius, focus ring
- CV upload: visual spec for drop zone, hover, success states
- "No CV" path: how it's presented, visual spec
- Back navigation: can the user go back? If yes, how?
- CTA between questions: label placeholder, exact visual spec, hover state
- Question transition animation: CSS property, duration (ms), easing
- Background: same as homepage or different?

---

### Screen 3 — Loading screen (panelS2, post-submission)
**Emotional target:** Seen, not processed. Someone thinking about you specifically.

**Show Playwright screenshots for:**

- **Loading animations** — show how Headspace, Linear, and other calm/warm products handle wait states. What is the visual language of "something is happening"?
- **Loading copy treatment** — show products that handle long loading waits with changing copy. How is the text presented? How does it transition?

Lock for this screen:
- Full layout — what occupies the screen?
- Loading animation: exact spec (shape, size, colour #hex, keyframe behaviour, duration, easing, loop or once). Note: must use only transform/opacity per animation performance rule.
- Loading copy: placeholder messages only (4–6, spaced across ~90 seconds). Note "COPY TBD — copywriting session" but confirm the emotional register: specific to the user, personal, not "Analysing data."
- Typography for loading copy: typeface, size, weight, colour
- Copy transition animation: how does one message replace the next?
- Transition into the dashboard on completion: exact spec

---

### Screen 4 — Dashboard shell (panelS3)
**Emotional target:** The place the user comes back to. Calm, organised, theirs.

**Show Playwright screenshots for:**

- **Overall layout** — show sidebar + main content layouts from Linear, Craft.do, Notion, and any others relevant. Also show top-nav-only layouts. What's right for this product?
- **Sidebar design** — show how different products handle sidebar nav: typography-only, icon + text, icon-only with tooltips. What's the right weight for this product?
- **Active and hover states** — show sidebar nav states from 3–4 products

Lock for this screen:
- Overall layout: sidebar or top nav? Sidebar width if sidebar.
- Sidebar background colour vs. main content background — contrast and relationship
- Nav items: confirmed list and order (per IA document), exact typography, spacing
- Active state: what changes? (background, border, colour, weight?)
- Hover state: what changes?
- Icons: yes or no? If yes: style, size, colour
- Top bar within dashboard: what's in it? (wordmark, user info, sign out?) Exact spec.
- Sign out: position, visual treatment
- Sign out flow: immediate or confirmation?

---

### Screen 5 — Dashboard: Profile tab
**Emotional target:** "This is how it sees me." A mirror, not a form.

**Show Playwright screenshots for:**
- How products present inferred/structured data about a person — profile views from Headspace, Craft.do, or similar personal/warm products (not LinkedIn-style)

Lock for this screen:
- Layout: sections, cards, or list?
- Data shown and order: inferred role direction, skills, experience level, sectors
- Visual hierarchy — what does the user's eye land on first?
- Role direction: how is this displayed — is it the most prominent element?
- Edit capability: yes or no? If yes, trigger and edit state
- Incomplete/missing state: visual spec and placeholder copy register ("COPY TBD")

---

### Screen 6 — Dashboard: Skills tab
**What it does:** Shows what the user has and what they need to close the gap.

**Show Playwright screenshots for:**
- Skills/competency displays — how other products show "have" vs "need" (tag systems, lists with indicators, visual meters)
- Accessibility angle: show examples that work without relying on colour alone

Lock for this screen:
- Layout: tags, list, meter, or combination?
- "You have this" visual treatment — colour, label, secondary indicator (not colour-only)
- "Gap" visual treatment — colour, label, secondary indicator
- Any progress indicators?
- Empty state: visual spec and placeholder copy register

---

### Screen 7 — Dashboard: Roles tab (primary — the Satori moment)
**Emotional target:** The path becomes visible. "I see you."

This is the most important screen in the product after the homepage.

**Show Playwright screenshots for:**
- **Role cards** — show how Linear, Notion, and job-adjacent products design cards with multiple data points. What's the right density? What's the right visual weight?
- **Relevance score** — show how products visualise a match score or rating. Number? Badge? Bar? What works for both sighted and colorblind users?
- **Card hover state** — show examples of card hover interactions
- **Filter/sort controls** — show how Linear and others handle filtering a list

Lock for this screen:
- Card: dimensions, padding, border (style, colour, radius), shadow, background
- Card content layout: title, company, location, salary, date, relevance score — where does each element sit?
- Relevance score: exact visual treatment, must not rely on colour alone
- Relevance reason (one-sentence explanation): typography, position, truncation behaviour
- Apply / Save CTA on card: position, visual spec, hover state
- Card hover state: what changes?
- Expanded detail view: yes or no? If yes, how does it open and what does it contain?
- Company contact info: where and how surfaced?
- Layout: single column or two column?
- Filter/sort: yes or no? If yes, what filters and visual spec
- Empty state: visual spec and placeholder copy register

---

### Screen 8 — Dashboard: Applications tab
**What it does:** Tracks saved and applied-to jobs. Currently a placeholder.

**Show Playwright screenshots for:**
- Application tracking views from job-adjacent or task-adjacent products
- Empty states that convert — products that turn "nothing here" into a moment of encouragement

Lock for this screen:
- Layout: list rows or cards?
- Each item: data shown, layout
- Status field: yes or no? If yes: statuses, visual treatment, how user changes it
- Empty state: visual spec, placeholder copy register, conversion CTA

---

### Screen 9 — Dashboard: Next steps
**What it does:** One concrete daily action.

**Per IA, this may be embedded in the dashboard home view rather than its own tab.**

**Show Playwright screenshots for:**
- How products surface a "one thing to do" — Headspace, Duolingo, Notion, any daily action product
- How they handle completion

Lock for this screen:
- Tab or embedded: finalise the IA decision here
- Visual presentation of the single next action
- Completion state: visual spec and animation
- Empty state: visual spec

---

### Screen 10 — Returning user experience
**Emotional target:** Continuity. No gap mentioned. "Welcome back."

This scenario is not currently designed anywhere.

**Show Playwright screenshots for:**
- How daily-companion products handle returning users — Headspace, Duolingo, Dayone
- "Welcome back" moments done warmly

Lock for this screen:
- When a logged-in user lands on the product: do they see the homepage, or go directly to the dashboard?
- The "welcome back" moment: where does it appear, what does it say (placeholder copy register), what does it look like visually?
- Is there any visual difference in the homepage for logged-in vs. logged-out users?

---

### Screen 11 — Auth overlay (sign in / sign up)
**Currently broken — needs full redesign alongside the OTP bug fix.**

**Show Playwright screenshots for:**
- Auth overlays / modals from Resend, Linear, Craft.do and any other calm, minimal products
- How products explain magic link / OTP to users who may not know what it means

Lock for this screen:
- Presentation: modal overlay, full-page, or slide-in panel?
- Email input field: exact spec
- Explanatory copy: placeholder register only ("COPY TBD")
- Primary button: label placeholder, exact visual spec, loading state while OTP sends
- Success state: visual spec and placeholder copy register
- Error state: visual spec and placeholder copy register
- Dismiss: is there an X? What happens to session state?
- Must match the full design system exactly

---

### Screen 12 — Error states
**Show Playwright screenshots for:**
- How warm, human products handle errors — Headspace, Duolingo, Linear
- Error components from different products

Lock for this screen (design template applied everywhere):
- Visual spec: background, border, icon or no icon, typography, CTA if recovery is possible
- Placeholder copy register for: analysis failure, job fetch failure, generic error
- Tone note for copywriting session: warm and specific, never "Error 500" or "Something went wrong"

---

### Screen 13 — Empty states
**Show Playwright screenshots for:**
- Empty states that encourage rather than deflate — products that convert an empty state into a prompt to act

Lock for this screen (design template):
- Visual template: illustration, icon, or typography only?
- Placeholder copy register for: roles tab (no jobs found), applications tab (no saved jobs), profile incomplete
- Consistency: one template applied across all, or vary per context?

---

## Full Animation Pass

After all screens are confirmed, dedicated animation pass.

**Show Playwright screenshots / video references for:**
- Products with a motion character that matches what we're building — calm but not dead. Fast and precise but not cold.
- Panel transition approaches from single-page apps

Lock for every animation (in implementable terms: CSS property, duration ms, easing curve):
- Motion signature: what is the product's overall motion character?
- Global defaults: `--duration-base` and `--ease-default` values for tokens.css
- Panel transitions: S1→S2, S2→S3
- Dashboard tab switching
- Role card entrance on tab load
- Loading animation (confirm from Screen 3)
- Button press feedback
- Input focus transition
- Question transitions (confirm from Screen 2)
- Auth overlay entrance and exit
- Error and empty state entrances

**prefers-reduced-motion:** For every animation above, state what it degrades to. In most cases: instant. Confirm per animation.

---

## Design System Verification

Before the session closes:

- **tokens.css** — update with every confirmed value. Every colour, size, duration, easing used must be a named token. No raw values in the build.
- **Colour palette** — every colour has a hex value and a WCAG contrast ratio stated against its intended background.
- **Typography scale** — every size in use is in the scale.
- **Animation** — all durations and easings are in tokens.
- **DESIGN_BRIEF.md** — update to reflect all confirmed decisions.
- **Consistency check** — do all screens feel like one product? If not, resolve it.

---

## Session Close Checklist

Do not close the session until every one of these is done:

1. Every screen (1–13) confirmed with Lexi — zero open decisions
2. Every pre-session global decision confirmed
3. Full animation pass complete
4. tokens.css updated with all confirmed values
5. DESIGN_BRIEF.md updated
6. CLAUDE.md Design Status updated — change to "Design locked [date]. Build can begin."
7. Tell Lexi: "Switch back to Sonnet — type `/model claude-sonnet-4-6`. Design session complete. Next session is the build session."

---

## What Comes After This Session (do not mix into this session)

- **Copy session** — using `/copywriting` skill. All placeholder text gets real copy.
- **Build session** — new index.html written from scratch. JS transplanted verbatim from index-old.html lines 4432–6447, plus `allTabsUnlocked = true` added after `initSupabase()`.

---

_No code. No staging changes. No copy decisions. Visual design only._
