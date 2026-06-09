# Design Session — Confirmed Decisions Log

**Session date:** 2026-06-07
**Mode:** Opus. Co-founder-led, reference-grounded, screen by screen.
**Rule:** Nothing in DESIGN_BRIEF / IA / tokens was previously confirmed with Lexi. Everything is a proposal until confirmed *in this log*.

**Tooling note:** Playwright MCP was configured but not connected this session (tools never loaded). Method used instead: rendered comparison mockups in our own tokens, opened in Lexi's IDE, annotated with the real product each option is based on. Show → react → synthesise → confirm preserved.

---

## Global Decisions (all 8 confirmed)

1. **Wordmark text** — "Career Intelligence" (build placeholder; real name unresolved, swap later). Treatment TBD on Screen 1.
2. **Serif register** — DM Serif Display used **sparingly, 3 moments only**: hero headline, input questions, loading copy. Italic variant reserved for loading copy only. Everything else Instrument Sans. (Typeface identity itself to be visually confirmed on Screen 1.)
3. **Dark mode** — Always render light. `<meta name="color-scheme" content="light">` + `color-scheme: light` on `:root`. Never honour `prefers-color-scheme: dark`.
4. **Font loading** — Weights: DM Serif Display 400 + 400 italic; Instrument Sans 400/500/600/700; DM Mono 400. `font-display: swap`. Fallbacks: serif→Georgia, body→system-ui, mono→ui-monospace. Google Fonts failure degrades to fallbacks with no layout shift.
5. **Animation performance** — `transform` and `opacity` ONLY. Never animate width/height/top/left/margin/padding. Fixed constraint, whole session.
6. **Scroll behaviour** — Homepage: whole page scrolls. Dashboard: sidebar fixed, main column scrolls internally. Overscroll background locked to `--bg` (fixes the open overscroll-colour-seam bug by design).
7. **Browser targets** — Chrome, Safari, Firefox latest. Drop frosted-glass nav (glassmorphism banned) — solid warm nav instead. `-webkit-` prefixes where needed.
8. **Z-index** — content 0, sticky nav 10, sidebar 20, modals 100, auth overlay 200, toasts/errors 300. Tokenised.

---

## Palette & Type — REVISED IN SESSION (supersedes brief/tokens)

- **Background** — cooled off the cream to kill Claude resemblance. `--bg #F7F6F3`, `--surface #FFFFFF`, `--surface-2 #F1F0EB` (cool light panel, replaces warm cream `#F5F2EA`).
- **Borders/neutrals cooled** — `--ink-5 #E6E3DC`, `--ink-4 #BDB7AC`, `--ink-3 #837B6D`.
- **Amber accent** — `--accent #B05E16` (warm-deep; warmer than old #A06820, passes AA 4.71:1). On dark espresso use brighter `--accent-on-dark #D4803A` (5.96:1 on espresso). Vivid #BF6B1A REJECTED (fails AA 3.94).
- **Espresso browns (Lexi's pick, now core palette)** — `--deep #211A11`, `--deep-2 #2E2417`. Used for: dashboard sidebar, dark contrast bands, footer. Amber glows against them — this pairing is the identity.
- **Gradients ALLOWED (rule):** single-hue tonal fades + soft glows in our own colours only (espresso→deep fade, amber radial glow). BANNED: gradient meshes, blue/purple, multi-colour AI gradients. Used sparingly: behind product shot, on espresso bands/footer.
- **Typography — SERIF DROPPED.** Display headlines now **Instrument Sans 700**, tight tracking (-.03em), large. DM Serif Display reserved for **ONE moment only: loading screen copy** ("thinking about you"). This supersedes the brief's 3-serif-moments rule and global decision #2.
- **Motion taste:** scroll-reveal = opacity 0→1 + translateY(18px)→0, ~0.7s ease `cubic-bezier(.25,.1,.25,1)`, IntersectionObserver, reduced-motion = instant. Hover lifts on cards/CTA (translateY). Exact specs locked in animation pass.

## Dashboard — Component Language (confirmed)
File: `mockups/dashboard-language-board.html`.
- Shell: espresso sidebar (220px, fixed) + cream workspace. Active nav = amber text + amber left-bar + faint amber tint. Profile bottom of sidebar.
- Match score: **ring + number + "Match" label** (not colour-only — accessibility). Number is the hero, ring supports.
- Colour rule: amber ONLY on action/score/active/links. Espresso = sidebar + dark elements. Green (+dot+label) = positive (e.g. Applied).
- Cards white + cooled border + hover lift. Pills = accent-soft. Buttons: primary amber / secondary outline / ghost link.
- **Direction panel = OPTION B (espresso hero)** — the "I see you" Satori element on warm dark with amber glow. The emotional peak; ties to homepage espresso identity. File: `mockups/dashboard-direction-panel-options.html`.

## Refinements parked (fine-tune later, not now)
- Espresso gradient *style* on the direction panel (Lexi: doesn't love the current gradient type) — tune in visual-polish/animation pass.

## Screen Decisions

### Screen 1 — Homepage — DIRECTION LOCKED (provisional, pending dashboard) ✓
Current file: `mockups/homepage.html` (organised 2026-06-07; was compare-08).
- **Hero gradient (settled):** SOLID dashboard card (no dissolve/mask). Warm-orange glow is BACKGROUND ONLY — starts ~middle of the dashboard, blooms down + to the edges, NEVER touches the top. Cream base → warm-orange glow (the role-swap of Linear's black→white glow). `radial-gradient(135% 27% at 50% 96%, rgba(197,110,32,.26)…)` over `--bg`.
- Nav links = scroll-to-section (anchors). "No idea where to start?" badge → input flow.
- Refinements deferred (Lexi: "can be refined and tweaked"): see Deferred list below.

v7 corrections (still apply):
- **Closing CTA section = LIGHT.** ONLY the footer is espresso. (Brown = footer only.)
- **Statement = black + orange ONLY** (no grey/brown-grey continuation). Hierarchy via size+weight.
- **Illustrations = isometric 3D line-art** (the style Lexi liked), redrawn for clarity: layered stack+marker (direction), one amber cube among grey (fit), rising iso-bars to dashed target (gap). On light bg.
- **Gradients:** only the soft amber radial glow behind the hero. Footer flat espresso. No espresso gradients.
- OPEN small decisions: nav links scroll-to-section vs pages (lean scroll); hero badge-link → input flow.
Earlier v6 corrections still apply:
- **Brown/espresso ONLY at the bottom** (closing CTA + footer = one continuous block). NO brown mid-page section.
- **Mid-page warmth = subtle amber radial glow** (Lexi prefers over brown gradients). The v5 bottom-fade gradient was broken — removed.
- **No repeated banners:** the daily-companion message is its own FEATURE section (distinct visual: today's action + welcome-back); the closing is a SINGLE CTA.
- **Illustrations = clear metaphors** (Fig 0.1 dots→arrow=direction; 0.2 overlapping circles+check=fit; 0.3 rising steps to target=close the gap). On light bg.
- 4 feature sections: Direction, Roles, Skills, Companion. Linear pattern (heading L + desc R + mono subnav, big visual below).
- Hero left-aligned, 76px headline; subhead-left + "No idea where to start?" badge-link right (same row); CTA + reassurance.
- Big dashboard shot, strong shadow, amber glow behind (clean, no fade).
- Feature visuals still get real detail after dashboard is designed.

Structure detail (still applies):
- **Nav:** wordmark left ("Career Intelligence", Instrument Sans 700), centred anchor links, Sign in + amber CTA pill right. Sticky, subtle blur, 64px, 1px cooled border.
- **Hero:** LEFT-aligned (changed from centred). Mono eyebrow tagline, big sans headline, secondary reassurance link top-right, subhead, amber CTA + "takes a minute / no CV" reassurance. Soft amber glow behind.
- **Big product shot:** full-width dashboard preview (espresso sidebar + direction panel + role cards + skills) with amber glow — doubles as dashboard preview, will sharpen after Screen 4.
- **Statement line:** "A career companion. Not a job board." ("Not" in amber).
- **3 pillars row:** Direction / Roles / Skills cards.
- **3 feature sections:** alternating, middle one on a tonal tint panel (no hard dividers).
- **Espresso engagement band:** "It comes back with you" — gradient + amber glow, amber chips.
- **Final CTA** (light) + **espresso footer** (4-col, gradient).
- All copy COPY TBD. Homepage gets final polish after core product locked.

---

## Session 8 — 2026-06-08 — Dashboard Home View

### OVERRIDES from previous session decisions

The following decisions from the dashboard component language board are SUPERSEDED:

- ~~Espresso sidebar~~ → **Sidebar is now white** (`--bg #FFFFFF`), active nav item = amber soft tint. Espresso removed from dashboard entirely.
- ~~Direction panel = Option B (espresso hero)~~ → **Direction card is now cream** (`--cream #F5F3EE`), clean and neutral. No espresso, no amber card. Plain uppercase label + body text.
- ~~Amber left-border accent on cards~~ → **BANNED** — Lexi confirmed this reads as AI-generic. Never use left-border colour accents on cards again.
- ~~Amber/yellow featured card for direction~~ → Also tried and rejected. Same reasoning — reads AI. Cream only.

### Dashboard Home — PROVISIONALLY LOCKED (layout only)

**File:** `mockups/dashboard-home.html`

**Layout:** 50/50 split within main content area.
- Left (opportunities): white background, scrollable, contains direction + today + explore
- Right (advisor/mentor): cream background (`#F5F3EE`), contains persistent chat UI

**The product metaphor (confirmed):** "Sitting with your mentor, looking at your opportunities together." The mentor is equally important to — or more important than — the opportunities panel. This is not a chatbot widget. It is half the product.

**Left column — confirmed:**
- Time-aware greeting: "Good afternoon · Sunday, 8 June" + "Welcome back, Lexi." at 38px
- Direction card: cream card, no amber, label "YOUR DIRECTION" in small uppercase grey, body text 15px/1.8
- Today section: section label → 24px bold action → 15px body → amber primary button + ghost "Not today"
- Explore section: three cream cards (label + subtitle + number) linking to tabs
- Momentum strip: green dot + "Day 5 of your search — you've been consistent." — at bottom, below scroll

**Right column (mentor) — confirmed:**
- Background: `--cream #F5F3EE` (NOT gradient, NOT white, NOT espresso)
- Header: avatar + "Your advisor" + "Here with you" (green status dot)
- Messages: white bubbles (AI) + amber bubbles (user), on cream background
- Input: white card, amber send button

**Headspace = confirmed reference** for the companion/home screen emotional register. Study how Headspace uses one featured card, one action, space, and warm colour. Not Crextio (a work tool — wrong register).

**Known open issue — NOT resolved:**
> Visual hierarchy: everything on the home screen currently carries equal visual weight. There is no clear primary > secondary > tertiary reading order. The direction card, the today section, and the explore section all read at the same level. This needs to be addressed in the next design session before this screen is fully locked.

**Parked, not decided:**
- Streak/momentum mechanic — confirmed as a product gap, implementation TBD
- Interactivity bridge between left and right panels (clicking "Draft message" should trigger mentor response)
- Whether mentor panel gets any warm visual treatment beyond plain cream

### Design Language — Established (applies to all remaining screens)

These rules now apply to every dashboard screen unless explicitly overridden:

| Element | Value |
|---|---|
| Background | `#FFFFFF` white |
| Cream / panel surface | `#F5F3EE` |
| Cream-2 / hover | `#EDEBE5` |
| Line / border | `rgba(0,0,0,.07)` |
| Ink / primary text | `#1A1610` |
| Ink-2 / body | `#5A5040` |
| Ink-3 / muted | `#9E9080` |
| Gold / amber action | `#A85E16` |
| Gold-b / amber bright | `#DD8A2C` |
| Font | Instrument Sans 400/500/600/700 |
| Mono | DM Mono 400/500 |
| Border radius | 14px cards |
| Greeting scale | 38px, weight 700 |
| Body text | 15px, line-height 1.75-1.8 |
| Section labels | 11px, uppercase, tracked, ink-3 |
| Primary button | Amber `#A85E16`, 12px padding v, 24px h |

### Next design session — priority order

1. ~~**Roles tab**~~ — ✓ LOCKED (Session 9)
2. **Input page** — entry point for every user. Cannot build blind.
3. **Loading screen** — "thinking about you specifically" moment.
4. **Fix home view hierarchy** — address the equal-weight issue before final lock.
5. Skills tab, Profile tab, Auth overlay — can be done alongside early engineering.
6. Applications, error states, empty states, animation pass — last.

---

## Session 9 — 2026-06-08 — Roles Tab

### Roles Tab — LOCKED ✓

**File:** `mockups/dashboard-roles.html`

**Layout:** Same 50/50 shell as dashboard-home. Advisor panel always present on the right. This is a non-negotiable structural rule — the advisor never disappears on any screen.

**Left column — confirmed:**
- Direction card (cream): "YOUR DIRECTION" label → direction title (26px bold) → "X roles matched to you, ranked by fit. Why these?" — simple, no paragraph explanation (that belongs in the advisor)
- Sort control: "Most relevant" dropdown — minimal, top-right of list
- Job list: clean cards, scrollable, load more at bottom
- **No filter bar** — seniority inferred from CV; work type and contract type gathered conversationally by advisor and applied live

**Job card structure — confirmed:**
- Title + saved/status badge (if applicable)
- Company · Location · Salary · Date posted (one meta line)
- 2–3 tag pills (role type, contract)
- Plain-English 2-line description — written as a trusted friend would describe the role, not HR copy
- "I'm interested" (amber primary) + "Pass" (outlined) — separated from description by a subtle divider
- Saved cards: no action buttons, green "Saved" badge only

**Match score — REMOVED.** The ordering communicates rank. The advisor explains individual fit. A number without context felt algorithmic, not mentor-like.

**Right column (advisor) — confirmed for Roles tab:**
- Same cream panel as dashboard-home — identical header, messages, input
- Opening message proactively: introduces the roles, mentions the descriptions, offers to explain any title in plain terms
- Advisor asks rather than tells — every message ends with either a question or an open invitation
- When user clicks "I'm interested": advisor acknowledges, offers next steps (CV, contacts, cover letter) conversationally — not as buttons
- When user clicks "Pass": advisor asks why — uses that to refine future matches
- Work type / contract type: if not already set, advisor asks conversationally; updates results live; never re-asks

**Key product principle confirmed:**
The advisor and job list work side by side. The card gives enough context to make an interested/pass decision. The advisor provides meaning, context, next steps, and the human element. Neither panel works without the other.

**Advisor persona:** See `ADVISOR_PERSONA.md` at project root — created Session 9. Name and icon TBD in dedicated session.

---

## Session 10 — 2026-06-09 — Input Page + Loading Screen + Dashboard Home Hierarchy

### Input Page — LOCKED ✓

**File:** `mockups/input-page.html`

**Format:** Conversational chat interface — NOT a form or step-based slides. Advisor speaks first in white bubbles. User replies via chat input at the bottom. Upload card appears inline in the message flow.

**Structure:**
- Nav: "Career Intelligence" wordmark left, "← Start over" ghost right
- Background: `--bg #F7F6F3` (matches loading screen — consistent onboarding context)
- Chat frame: max-width 620px, centred
- Advisor bubbles: white (`--surface`), `border-radius: 4px 16px 16px 16px`, soft shadow, max-width 420px
- User bubbles: amber (`--gold #A85E16`), `border-radius: 16px 4px 16px 16px`, white text, max-width 380px
- Upload card: inline in message flow, dashed border, max-width 380px, 14px radius
- Input bar: fixed at bottom of chat frame, white card, amber send button

**3-step flow (JavaScript state machine):**
1. Background — CV upload (primary) or typed text (equal-dignity fallback via "Either works." amber link)
2. Direction — where they're heading, even if vague
3. Practical — location + work restrictions in one natural-language field
After step 3: input bar hides, "Find my direction →" amber button appears

**Opening sequence (timed):**
- 300ms: "I'm going to ask you a few things — two or three, that's it."
- 1200ms: "Let's start with your CV. Upload it and I'll read it, or just tell me about yourself below." + upload card

**Acknowledgments between steps:**
- After background: "Got what I need."
- After direction: "That helps."
(Placeholder copy — final wording in Phase 5 copywriting session)

**Advisor identity:** Deliberate placeholder. No name, no avatar. Copy does the work. Identity decided in dedicated session (see ROADMAP.md Phase 0 remaining items).

**Amber rule:** ONLY on "Either works." link and send button. Nowhere else on this screen.

---

### Loading Screen — LOCKED ✓

**File:** `mockups/loading-screen.html`

**Format:** Text only. No animation except slow crossfade between phrases. No orb, no progress bar, no spinner.

**Background:** `--bg #F7F6F3` — same warm off-white as input page. Consistent onboarding context.

**Typography:** DM Serif Display italic, 30px — reserved use. "About a minute." in Instrument Sans 500 13px below.

**Advisor icon:** Deliberate dashed-circle placeholder. Replaced in Session 3 (advisor identity session).

**4 phrases with timed crossfade (14s intervals, last stays):**
1. "I'm taking a minute with this — it's worth doing properly."
2. "Reading what you've built, and what it says between the lines."
3. "Finding the roles where someone like you would actually do well."
4. "Almost there." *(progress indicator — no bar needed)*

**Phase 1 upgrade:** Phrases become personalised using keywords from user input. Architecture decision (template vs. Haiku-generated) made in Phase 1 engineering session.

---

### Dashboard Home Hierarchy — LOCKED ✓

**File:** `mockups/dashboard-home.html`

**Hierarchy fix applied:**
- Direction card: `.direction-title` element at 20px/700 extracted from body paragraph — reads as clear hero
- Direction card padding increased: `28px 28px` (was `24px 26px`)
- Direction card shadow added: `box-shadow: 0 2px 16px rgba(0,0,0,.055)` — lifts above page
- Direction body text reduced: 14px (was 15px) — headline contrast increased
- Today section: 24px action text — secondary, punchy, below direction
- Explore section: tertiary, explore cards at bottom

**Reading order now:** Direction (hero) → Today (action) → Explore (navigation) ✓
