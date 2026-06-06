# Build Tasks: Career Intelligence — Full Visual Redesign

**Generated:** 2026-06-06
**Brief:** `.design/career-intelligence-redesign/DESIGN_BRIEF.md`
**Tokens:** `tokens.css` (project root — created, ready to link)
**Stack:** Single `index.html` — all CSS, HTML, JS in one file. Panels: `panelS1` (home), `panelS2` (input + loading), `panelS3` (dashboard).
**Git rule:** All work on `staging` branch. Confirm `git branch` before any file edit.

---

> **Build strategy for single-file project:**
> JavaScript logic (showSession, form handlers, API calls, Supabase auth) is preserved as-is.
> CSS is replaced section by section using `tokens.css` as the source of truth.
> HTML structure is updated where needed (new homepage scroll sections).
> Old glassmorphism variables, Syne/DM Sans font references, blue/purple token values — all removed.

---

## Foundation

- [ ] **Link tokens and swap fonts** [Modify `index.html`]
  What: Add `<link rel="stylesheet" href="tokens.css">` to `<head>`. Replace Google Fonts import (remove Syne + DM Sans, add DM Serif Display + Instrument Sans + DM Mono). Remove or gut the old `:root` block — `tokens.css` now owns all custom properties. Remove all glassmorphism variables (`--glass-*`, `--edge`, `--border-soft`) and blue-tinted shadow values. Update any hardcoded colour hex values still in body/reset styles.
  Done when: Page loads with `#FAFAF7` background and Instrument Sans body font. No Syne anywhere. Browser DevTools shows `--accent: #A06820` in computed styles. Glassmorphism variables gone.

- [ ] **Reset global base styles** [Modify `index.html`]
  What: Update `.container` to use `--space-page` gutter. Update `body` to reference `--f-body`, `--ink`, `--leading-normal`. Remove any `font-family: var(--font-head)` references. Ensure `box-sizing: border-box` reset is clean. Check that `.mono` / DM Mono utility class points to `--f-mono`.
  Done when: Body text renders in Instrument Sans at 16px. Container gutters use token values. No Syne font loads in Network tab.

---

## Visual Anchor

- [ ] **Nav redesign** [Modify]
  What: Replace the glassmorphism + Syne nav with clean, warm alternative. Background: `rgba(250,250,247,0.92)` + `backdrop-filter: blur(12px)`. Border-bottom: `1px solid var(--ink-5)`. Wordmark: DM Serif Display 18px (not DM Mono uppercase — that reads like a code label, not a brand). Nav links: Instrument Sans 13px/500, `--ink-3`. CTA button: amber border + amber text + `--accent-soft` background (matches brief's button ghost style). Remove all blue/purple colour references from nav.
  Done when: Nav shows warm cream background, serif wordmark, amber ghost CTA. Sticky behaviour preserved. No blue anywhere in nav.

---

## Homepage — panelS1

- [ ] **Hero section** [Modify]
  What: Replace old hero with large display type layout. Two-column at desktop: left = headline + sub + CTA, right = 3 stacked output preview cards. Headline: DM Serif Display, `--text-display` (40–60px responsive), `--leading-tight`, warm `--ink`. Sub: Instrument Sans 17px, `--ink-3`, `--leading-relaxed`. CTA button: `--accent` background, white text, `--r-lg`. Right column cards: white surface, `--sh-sm`, `--r-xl`, showing direction / matched roles / skills gap with real-looking content (not placeholder lorem). These cards demonstrate the product's output at first glance.
  Done when: Hero renders two-column with large serif headline. Three output cards visible to the right. Single amber CTA. Background is `--bg` (#FAFAF7). No gradient, no illustration, no abstract graphic.

- [ ] **Homepage scroll sections — product demonstration** [New]
  What: Below the hero, add 2–3 scroll sections that show what the user actually gets, styled as marketing material (not software screenshots). Structure: (1) Role matches — show a beautifully presented set of role cards with match scores, as if from real output; (2) Skills gap — show the skills gap map with progress indicators, warm styling; (3) Outreach — show a stylised outreach draft card. Each section: section label in DM Mono uppercase, large Instrument Sans headline, product output visual to one side, explanatory copy to the other. Sections alternate layout direction (left/right) for visual rhythm.
  Done when: Three scroll sections below hero, each showing a distinct product output. Layout alternates. Content feels real and specific, not generic placeholder.

- [ ] **Amber-fill section and final CTA** [New]
  What: One section uses `--accent` or `--surface-warm` as a background fill — breaks the all-white monotony, adds visual warmth and variety. Use this section for the engagement hook: "comes back with you, gets better every time" — showing the daily companion mechanic. Below it: final CTA section, warm background (`--bg`), large serif headline, single amber button. This is the bottom of the homepage.
  Done when: An amber-tinted (or warm surface) section exists on the homepage scroll. It is visually distinct from the white sections above it. Final CTA is below it, visible. Background and text contrast passes WCAG AA.

---

## Input Flow — panelS2

- [ ] **Input form redesign** [Modify]
  What: Replace current multi-field form styling with conversational, single-focus design. Questions in DM Serif Display 28px (`--leading-snug`) — these are the emotional moments. Progress dots (not percentage bar) in amber. Input fields: clean warm border `--ink-5`, large padding (15px 20px), `--r-lg`, full focus ring using `--accent` border + `--sh-accent` box-shadow. Hint text in Instrument Sans 13px `--ink-4`. CTA at bottom uses amber primary button. Remove all blue references (`var(--blue)`, `var(--blue-soft)`, `var(--blue-glow)`).
  Done when: Input questions render in DM Serif Display. Focus ring is amber, not blue. No blue anywhere in input flow. Progress indicator is warm-styled dots. Form submit button is amber.

---

## Loading Screen

- [ ] **Loading screen redesign** [Modify]
  What: Replace the multi-step loading card (blue progress tracker) with a single calm experience. Copy in DM Serif Display **italic** 21px (`--leading-relaxed`) — this is the one moment of editorial warmth in the UI. Animation: slow amber pulse (core dot + expanding ring, 3s ease-in-out loop). Sub-copy in Instrument Sans 13px `--ink-3`. Background: `--bg`. Remove the blue step tracker entirely — no "Step 1 of 4" progress list. Loading screen should feel like stillness, not a system processing. Copy example: "Reading what you've built, and what it says between the lines." (voice/tone session will finalise copy).
  Done when: Loading screen shows serif italic copy, amber pulse animation, no step list, no blue, warm background. Animation is calm and looping. Passes `prefers-reduced-motion` (animation stops, copy still shows).

---

## Dashboard — panelS3

- [ ] **Dashboard layout and direction summary** [Modify]
  What: The first thing the user sees on the dashboard is their direction summary — in DM Serif Display, warm, personal. Not a table of data. Replace the current dashboard header with a personal summary panel: background `--surface`, `--sh-sm`, `--r-xl`, with a DM Mono label ("For [name] · based on what you shared"), DM Serif Display headline showing their direction, Instrument Sans body text reflecting their specific background and goals, and amber tag chips for their matched areas. Remove all blue/purple accent references from dashboard. Sidebar/nav: Instrument Sans 13px `--ink-3` for inactive items, `--ink` for active, amber left-border for current tab.
  Done when: Dashboard opens with direction summary panel in serif display. Sidebar uses warm ink scale. No blue/purple anywhere on dashboard. Personal summary feels warm and specific, not like a data table.

- [ ] **Role cards redesign** [Modify]
  What: Replace blue-accented role cards with warm amber system. Match score: DM Mono, large (`--text-display` size reduced), `--accent` colour — this is a visual element, not a table column. "Strong match" / "Good match" labels: DM Mono uppercase, green or amber. Company/location: Instrument Sans 13px `--ink-3`. Tag pills (Hybrid, contacts found, posted): warm surface `#F7F4EE`, `--ink-2`, `--ink-5` border — no blue pill backgrounds. Card hover: `--sh-md`, amber border highlight (`--accent-mid`). Expand drawer preserved but unstyled blue references replaced. "View & reach out" action: amber ghost button.
  Done when: Role cards have amber match scores, warm tag pills, no blue anywhere. Hover state shows amber border. Drawer expand/collapse works. Match scores are visually prominent.

- [ ] **Skills tab redesign — premium treatment** [Modify]
  What: Skills tab is a competitive differentiator vs Jack & Jill (they don't have this). Design it as a premium moment: (1) Skills you have — clean card list, green checkmarks, DM Mono for skill names, Instrument Sans for "why this matters" copy in `--ink-3`; (2) Skills gap — each gap card shows: skill name (bold), why it matters (warm copy), how to close it (specific resources/actions), and a visual progress bar (`--ink-5` track, `--accent` fill — starts empty, progresses on return visits). Gap priority tags: amber (priority) / green (enhances fit) / `--ink-3` (foundation). Remove blue accent entirely. Progress state on skills makes return visits visually rewarding.
  Done when: Skills tab has two distinct columns (have / gap). Each gap card shows name, why, how, and progress bar. Tags are amber/green, not blue. Progress bars render (start at 0 for new users). Visually premium — feels as important as the roles tab.

---

## Engagement and Momentum

- [ ] **Progress indicators and win moments** [New]
  What: Design the visual system for earned progress — brief, warm, non-intrusive. Three moments: (1) First results loaded — a quiet header moment ("We found your direction. Here's where you're going.") in DM Serif Display; (2) Role applied / outreach sent — a small warm confirmation state on the relevant card (amber checkmark, "Done · nice work." in Instrument Sans 13px); (3) Skill gap closed — progress bar fills, card shows a subtle completion state. No trophy icons, no confetti, no "You did it!" copy. Progress is visual and quiet, not theatrical.
  Done when: Three win states exist as CSS classes that can be toggled by JS. They render correctly without JS (static state for review). Tone is warm acknowledgment, not celebration.

- [ ] **Returning user treatment** [New]
  What: Design the "welcome back" state visible on the dashboard when a returning user loads results (as opposed to first visit). Difference from first visit: (1) Direction summary panel has a different opener ("Welcome back. Here's where things stand."); (2) Any role applied to shows a subtle applied badge; (3) Match scores that improved since last visit show a small amber delta indicator (`+0.4 ↑`). These are CSS classes only at this stage — JS logic to track returning state is a separate build task (Phase 0 / features session).
  Done when: CSS classes exist for returning-user variants of direction summary and role card applied/improved states. They render correctly as static states. Design review confirms they read differently from first-visit state without feeling jarring.

---

## Interactions and States

- [ ] **Button states — all variants** [Modify]
  What: Audit every button in the file and ensure consistent state coverage: (1) Primary amber — default / hover (`--accent-lt`) / pressed (`--accent-dk`) / loading (opacity 0.7 + spinner); (2) Ghost amber — default / hover / pressed; (3) Destructive — red variant for any dangerous actions. All transitions: `--dur-base --ease`. Remove any blue button variants. Ensure all buttons have visible `:focus-visible` ring using `--sh-accent`.
  Done when: All button states render correctly on hover/active. Focus ring is visible and amber. No blue buttons exist anywhere. Loading state on primary CTA shows spinner.

- [ ] **Input field states** [Modify]
  What: Ensure input fields cover: empty (`--ink-5` border) / focused (`--accent` border + `--sh-accent` shadow) / filled (`--ink` border) / error (red border + error message below, `--ink` text). Remove blue focus glow (`--blue-glow`). File upload drop zone: warm border `--ink-5`, hover state becomes `--accent-mid` border + `--accent-soft` background.
  Done when: All field states render. Focus ring is amber. Error state shows red border with inline message. File drop zone has warm hover state. No blue anywhere in form.

---

## Responsive

- [ ] **Tablet breakpoint (768px)** [Modify]
  What: Homepage hero collapses to single column (output cards move below CTA). Homepage scroll sections stack vertically. Dashboard sidebar collapses (tab bar at top or hamburger — preserve existing mobile nav logic). Role card grid goes to 1-column. Input form stays centred, max-width `--prose-max`. Loading screen unchanged (already single-column).
  Done when: At 768px viewport width, no horizontal overflow, no text overlapping, no broken grid layouts. Navigation is usable. Core flows (homepage → input → dashboard) work end to end at tablet width.

---

## Review

- [ ] **Run /design-review against the brief**
  What: Full design review pass measuring built work against the brief. Requires screenshots at desktop (1280px), tablet (768px), and mobile (375px — even if mobile is deferred, check for disasters). Run `/design-review` skill. Review must confirm: no banned patterns (glassmorphism, Syne, blue/purple accents, grain overlays), amber accent used only on interactive elements, typography hierarchy correct, engagement states present, homepage not blank/sparse.
  Done when: `/design-review` outputs a prioritised Must Fix / Should Fix / Could Improve list. All Must Fix items addressed before staging is verified.

---

## Out of Scope (this build)

- Voice and tone finalisation — dedicated `/copywriting` session after design is locked. All copy in this build is directional placeholder.
- JavaScript logic changes — showSession(), form validation, API calls, Supabase auth, Adzuna jobs. Not touched in this build.
- Mobile (375px) — deferred per CLAUDE.md.
- Auth overlay redesign — Phase 2.
- Daily check-in UI — Phase 2.
- Profile tab interactive design — Phase 2.
- Performance fix (90-second runtime) — separate session.
- Next.js migration — after design is locked and reviewed.
- Phase 0 bug fixes (OTP, debug console.log commits) — separate session.
