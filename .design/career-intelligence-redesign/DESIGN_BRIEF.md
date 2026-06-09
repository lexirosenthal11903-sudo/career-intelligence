# Design Brief: Career Intelligence — Full Visual Redesign

**Date**: 2026-06-06
**Status**: ⚠️ PARTIALLY SUPERSEDED — use SESSION_DECISIONS.md for all confirmed decisions

> This brief captures the design intent and direction. However, every specific decision (colours, typography, component rules, banned patterns) was confirmed or overridden in the design sessions logged in `SESSION_DECISIONS.md`. When there is any conflict between this brief and SESSION_DECISIONS.md, **SESSION_DECISIONS.md always wins**.

**Phase**: Design session. No code touches visual design until this brief is confirmed.

---

## The Problem

The user arrives already exhausted — not from the job search, but from not knowing what to search for. They've spent weeks on job boards and feel more lost than when they started. Every tool they've tried has felt clinical, corporate, or like it's processing them rather than seeing them.

The current CI design is part of this problem. Blue/purple gradients, glassmorphism, Syne typeface — it reads as another AI product in a crowded field of AI products. It does not communicate "someone who gets it." It communicates "startup dashboard."

The visual redesign must correct this from the first pixel.

---

## The Solution

An interface that communicates trusted relief before a word is read.

The product is a daily companion, not a tool. The design must feel like something a thoughtful person made specifically for someone at a crossroads — warm, calm, unhurried, and completely devoid of the signals that say "AI product." When someone lands on the homepage, the atmosphere of the page — its colour, its space, its typography — should do the emotional work of saying: *you're in competent hands.*

The emotional arc the design serves: **Meraki → Satori → Kavanah.** Arrive with your whole self. Something clicks. Move forward with intention.

---

## Experience Principles

1. **Warm before clever** — Every design decision resolves in favour of warmth over technical sophistication. If a component looks impressive but reads as cold or corporate, it fails. If it looks simple but feels human, it works. The product earns trust through atmosphere, not features.

2. **Breathing room is the message** — White space is not empty space. It communicates that the product is unhurried, that it has thought about the user before they arrived, that it won't overwhelm. A page with too much on it tells the user their anxiety was right. A page with space tells them it's handled.

3. **Specificity over decoration** — The product's core promise is that it sees you specifically, not users in general. The design reinforces this: no stock-photo energy, no generic illustrations, no abstract AI imagery. Wherever there is content — cards, results, copy — it should feel like it was made for this person. Design choices that feel personal beat design choices that feel polished.

---

## Aesthetic Direction

**Philosophy**: Editorial warmth — the intersection of Resend's typographic confidence, Dayone's private-and-personal atmosphere, and Headspace's emotional design for anxious people. The product should feel like a considered publication made by one person for another person — not a platform.

**Tone**: Warm, unhurried, trustworthy.

**Colour approach — LOCKED (updated 2026-06-06 session):**

The palette is built around a near-neutral background so the amber accent pops cleanly as a contemporary, warm element. Previous approach (warm bg + warm accent) read as artisan/vintage — wrong. This is clean + warm.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#FAFAF7` | Page background — nearly neutral, barely warm. Warmth comes from type + accent, not background tint. |
| `--surface` | `#FFFFFF` | Card surfaces — pure white for lift against near-neutral bg |
| `--surface-warm` | `#F5F2EA` | Secondary surfaces — warm depth, used sparingly |
| `--ink` | `#1A1610` | Primary text — warm near-black (brown undertone, not blue-black) |
| `--ink-2` | `#48402C` | Secondary text — warm brown-grey |
| `--ink-3` | `#877860` | Tertiary text — muted warm |
| `--ink-4` | `#C4B898` | Placeholder / disabled |
| `--ink-5` | `#E4DCC8` | Borders, dividers — warm, subtle |
| `--accent` | `#A06820` | Amber — **used only on interactive elements**. Buttons, scores, tags, focus rings. Not on surfaces. |
| `--accent-lt` | `#B87C2A` | Hover state |
| `--accent-dk` | `#7A5018` | Pressed / active state |
| `--accent-soft` | `rgba(160,104,32,0.08)` | Tinted backgrounds (badges, tags) |
| `--accent-mid` | `rgba(160,104,32,0.16)` | Medium tint (borders, dividers on accent elements) |
| `--green` | `#3A7050` | Success / positive signals |
| `--green-soft` | `rgba(58,112,80,0.09)` | Success backgrounds |
| `--red` | `#9A3028` | Error |
| `--red-soft` | `rgba(154,48,40,0.08)` | Error backgrounds |

**Why amber on neutral:** Amber is warm and distinctive — different from Claude (#D97757, brighter orange), different from any job board, different from the current blue/purple. On near-neutral white, it reads contemporary and trustworthy. The warmth is specific and controlled, not a general tint across everything. Colour psychology research: muted amber/ochre (lower saturation) triggers psychological grounding for anxious users without overstimulating.

**Contrast verified:** --accent on white: 4.73:1 ✓ AA. --ink on --bg: 18.4:1 ✓ AAA. Full token file: `tokens.css` in project root.

**Prohibited colours:** Blue/purple gradients, cool greys, near-black (#181B28 family), pastel anything, bright orange, bright green, warm-on-warm combinations that read vintage.

**Typography approach — LOCKED:**

The current Syne typeface is on the banned AI design patterns list — immediately removed. Cormorant Garamond (mentioned in older docs) is a luxury/editorial serif — DG Air territory, wrong for CI.

New system (LOCKED 2026-06-06):

| Role | Font | Weights | Where it lives |
|------|------|---------|----------------|
| Display | **DM Serif Display** | Regular, Italic | Hero headline, input questions, loading copy. **3 moments only.** |
| Body / UI | **Instrument Sans** | 400, 500, 600, 700 | Everything else — nav, cards, CTAs, body, buttons, captions |
| Data / Mono | **DM Mono** | 400 | Match scores, step labels, timestamps, metadata. Never for body or headings. |

Google Fonts import: `DM+Serif+Display:ital@0;1&Instrument+Sans:wght@400;500;600;700&DM+Mono:wght@400`

Typography scale:
- Display (hero): DM Serif Display, 40–60px responsive, line-height 1.1, letter-spacing -0.01em
- Input questions: DM Serif Display, 28px, line-height 1.28
- Loading copy: DM Serif Display italic, 21px, line-height 1.5
- Section headers: Instrument Sans 600, 20px, letter-spacing -0.02em
- Body: Instrument Sans 400, 16px, line-height 1.6
- Large body: Instrument Sans 400, 17–18px, line-height 1.72
- Small / label: Instrument Sans 500, 13px
- Mono label: DM Mono 400, 11px, uppercase, letter-spacing 0.10em

Note: DM Serif Display italic is used ONLY for loading screen copy — where the product is "thinking about" the user. This is the one moment of editorial warmth in an otherwise clean UI. Using it anywhere else dilutes the effect.

**Motion approach**: Subtle and purposeful. No stagger animations on lists. No entrance animations on every element. State transitions at 200ms ease-out. The loading screen gets a single continuous animation — calm, not frantic. Page transitions: simple 150ms opacity fade. Motion should feel like the product breathing, not performing.

**Anti-references — what this must NOT look like:**

- The current CI design (blue/purple, Syne, glassmorphism, cool background)
- Any other AI career tool: Otta, Jobscan, Rezi, Kickresume — all have job-board DNA
- Jack & Jill: their interface is described as "glitchy and difficult to get started with" — the opposite energy
- LinkedIn: flat corporate blue, network-obsessed, grid-heavy
- Notion: neutral to the point of personality-less, too productivity-app
- Anything with: grain/noise overlays, gradient meshes, dark mode, section numbers as hierarchy, marquee scrolling, DM Mono on every label, rotating animations

---

## Existing Patterns to Replace

The current design system is being replaced in full. Nothing is carried forward except spacing scale and border-radius tokens (these are functional, not aesthetic).

| Element | Current | New |
|---------|---------|-----|
| Background | `#EEF0F8` (cool periwinkle) | `#F8F5F0` (warm off-white) |
| Heading font | Syne | Fraunces |
| Body font | DM Sans | Plus Jakarta Sans |
| Primary accent | Blue `#3B5BDB` | Clay `#B85C38` |
| Secondary accent | Purple `#6741D9` | None — single accent system |
| Text (dark) | Cool near-black `#181B28` | Warm near-black `#1C1814` |
| Glassmorphism | Used throughout | Removed entirely |

Spacing scale (keep): 4px base unit, existing `--sp-` tokens.
Border radius (keep): `--r-sm: 6px`, `--r-md: 10px`, `--r-lg: 16px`, `--r-xl: 24px`.

---

## Page-by-Page Design Intent

### Homepage (panelS1) — "Trusted relief"

The homepage has one job in the first 5 seconds: communicate that this is different from every other tool they've tried, without explaining why. The atmosphere does it.

**Visual richness — critical direction (added 2026-06-06):**
The homepage must not look blank or sparse. Minimal ≠ empty. The design should feel inviting, not daunting — like walking into a warm room, not an empty corridor. This is achieved through:
- Large, confident display type that commands the screen — the headline IS the visual
- **Scroll sections with styled product output** — show what the user gets, but as marketing material not software screenshots. Think: beautifully presented result cards (direction summary, role match, skills gap) in a feature section, well lit, with real-feeling content. Not a dashboard screenshot. See how Linear presents its UI in marketing.
- **An amber-background section** — at least one scroll section uses `--accent` or `--surface-warm` as a section fill. Breaks the all-white monotony, creates visual variety, adds warmth without adding clutter.
- **Typography as visual** — where illustration isn't available, let the words do visual work. Large pull-quotes from the emotional copy. Bold headline pairings that read like a composition, not a paragraph.

**Section structure (scroll sections below the hero):**
1. Hero — large display type, single CTA, small visual flourish (3 output preview cards, minimal, to right of headline)
2. Product demonstration — what you actually get, shown visually as styled output cards
3. Social proof / moment — one emotional trust signal (a result quote, or a data point if available)
4. Engagement hook — shows the daily companion mechanic: "comes back with you, gets better over time"
5. Final CTA — warm, direct

**Original direction (still applies):**
- Background: `--bg` near-neutral, full viewport
- Hero headline in DM Serif Display — large, unhurried. Something that could be the opening line of a letter, not a slogan.
- No dark sections. No gradient backgrounds. Warmth from typography and amber accent, not visual effects.
- No generic AI imagery, no abstract graphics, no stock photos.

### Input Page (panelS2) — "The moment of trust"

The user has decided to try something. The design must honour that decision.

- Questions appear one at a time — not a form. Each question has breathing room.
- The product acknowledges each answer quietly (subtle state feedback) before the next appears
- Background remains `--bg`. No mode change from homepage — continuity.
- No progress bar with a percentage. No "Step 2 of 4." One thing at a time.
- The submit action is the reward for completing the conversation, not a button they're clicking through to get to results.

### Loading Screen — "Seen, not processed"

90 seconds is too long (technical fix is separate). The design makes the wait feel intentional.

- Copy in Fraunces italic — the internal monologue of someone thinking about you. NOT system status. NOT "Analysing your data." Something like: "Reading what you've built, and what it says between the lines."
- A single continuous animation — calm, organic. Not a spinning gear. Not a progress percentage. Think: a slow pulse, a quiet breath.
- Warm background, no visual complexity. This is a moment of stillness.

### Dashboard (panelS3) — "I see you"

The Satori moment. The path becomes visible.

- The first thing the user sees is their direction summary — in DM Serif Display, warm, personal. Not a table of data.
- Role cards: clean, well-spaced. Relevance score is a visual element, not a column in a table.
- Skills gap: structured and clear, but never clinical. Each skill has a "why it matters" line in warm ink-3, not a bullet list.
- Navigation: minimal. The product doesn't show the user everything at once.

**Engagement / momentum design (added 2026-06-06):**
The dashboard must visually communicate that this gets better over time — it is a companion, not a one-time tool. Design choices that reinforce this:
- Match scores should look like something worth coming back to improve
- Skills gap map shows progress visually (closed vs open gaps) — even a first visit shows "here is where you are, here is where you're going"
- Returning user state differs from first visit — "welcome back" treatment, summary of what's changed since they were last here
- Daily check-in mechanic (Phase 2) must be designed as a desirable feature, not a chore. The hook: "What did you do today?" — the product celebrates the answer.
- Each win (application sent, skill closed, new role match) is a design moment — brief, warm, never over-the-top. Not badge/trophy gamification. Earned acknowledgment.
- Design the skills tab to feel as premium as the role listings — this is a competitive differentiator vs Jack & Jill and must look it.

---

## Component Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| Nav bar | Redesign | Remove glassmorphism, warm background, Fraunces wordmark |
| Hero section | Redesign | New typography, remove gradient, warm bg |
| Input form | Redesign | Progressive reveal, conversational, warm surfaces |
| Loading screen | Redesign | New copy, new animation, warm bg |
| Role cards | Redesign | Remove blue accent, clay accent, warm surfaces |
| Skills section | Redesign | Remove bullet lists, add hierarchy, warm tones |
| Auth overlay | New design | Not yet built to spec |
| Daily check-in | Future | Phase 2 — not in scope for this session |
| Profile tab | Future | Phase 2 — not in scope for this session |

---

## Key Interactions

- **CTA button**: default (clay bg, white text) → hover (clay-lt bg, 200ms) → pressed (clay-dk) → loading (opacity 0.7, spinner)
- **Input fields**: empty (warm border `--ink-5`) → focused (clay border `--accent`, no glow) → filled (ink border) → error (red border + message below)
- **Role cards**: default → hover (subtle shadow lift, 200ms) → expanded (outreach panel opens below, not modal)
- **Loading screen**: enter → continuous animation → results fade in (150ms opacity)

---

## Responsive Behaviour

Desktop is the current priority. Mobile deferred per CLAUDE.md.

| Breakpoint | Key changes |
|------------|-------------|
| Desktop 1280px+ | Full layout, two-column dashboard |
| Tablet 768px | Single column, nav collapses |
| Mobile 375px | Deferred — not in scope for this session |

---

## Accessibility Requirements

- Contrast: WCAG AA minimum. Clay `#B85C38` on white `#FFFFFF` = 4.6:1 — passes AA for large text. Verify all combinations before build.
- Warm near-black `#1C1814` on `#F8F5F0` = high contrast — passes easily.
- Keyboard: input flow and CTA must be fully keyboard navigable
- Focus indicators: visible, warm-toned (clay outline, 2px, 2px offset)
- No colour-only information signals

---

## Voice & Tone — Standing Note

**A voice and tone session is required before any copy is written for build.** The emotional register and principles are established (see CLAUDE.md and brainstorms/career-intelligence-emotional-vision.md). The actual written copy needs a dedicated `/copywriting` session once this design brief is confirmed and tokens are locked.

All copy in this brief is placeholder/directional only.

---

## Competitor Context

**Jack & Jill (jackandjill.ai):** London-based, 200,000+ users, $20M seed (Oct 2025). Their product is conversational AI with employer network access. Their weaknesses: 20-minute onboarding before results, stale listings, glitchy interface. Their agent infrastructure is sophisticated — they define named agent personalities (Juno, Joe, James etc.) to prevent generic AI output. Their agent-builder framework has been downloaded and saved at `brainstorms/competitor-research/jack-and-jill/`.

**Key differentiator CI should design for:** J&J don't do skills gap analysis with specific build steps. CI's skills tab is a genuine competitive advantage — design it as a premium moment, not a secondary feature. The skills gap map should feel as important as the role listings.

**Impressive competitor feature (flagged for discussion):** J&J offer direct introductions to hiring managers through their employer network. CI doesn't have this (and shouldn't claim to until it does). CI's outreach draft feature is the answer — it gives users everything they need to make the cold approach themselves. Design the outreach section to feel powerful and specific, not like a template generator.

---

## Out of Scope

- Mobile design — deferred per CLAUDE.md
- Daily check-in UI — Phase 2
- Profile tab interactive design — Phase 2
- Auth overlay beyond basic redesign — Phase 2
- Any copy finalisation — requires dedicated voice/tone session
- Next.js migration — separate decision, after design is locked
- Dark mode — prohibited
