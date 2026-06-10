# ⚠️ ARCHIVED — DO NOT USE

**This document is superseded and must not be used for any current work.**

It was written as a Base44 platform brief and references the old design system (Syne typeface, glassmorphism, blue/purple gradients) — all of which are now explicitly banned.

**Current authoritative documents:**
- Product spec + architecture → `CLAUDE.md`
- Build sequence → `ROADMAP.md`
- All locked design decisions → `.design/career-intelligence-redesign/SESSION_DECISIONS.md`
- Emotional vision + voice → `brainstorms/career-intelligence-emotional-vision.md`
- Advisor persona → `ADVISOR_PERSONA.md`

---

# Career Intelligence — Full Product Build Spec (B2C) [ARCHIVED]

*Original hand-off brief for Base44. Kept for historical reference only.*

---

## 1. WHAT IT IS

Career Intelligence is a **career intelligence and direction platform for graduates and early-career people who don't yet know what they're looking for.**

- It is **not a job board.**
- It is **not "an AI tool"** (the intelligence is under the hood and never named to the user).
- It is a **daily companion**, not a one-time tool. Return mechanics and compounding value are central.

**Elevator:** Most career tools help you search. They assume you already know what you want. Most people don't — that's where the breakdown happens, before the search even starts. Career Intelligence starts from *who you are*, shows you a direction, then walks the whole search with you, one concrete step at a time.

**Tagline:** "Your career deserves more than a job board."

**Goal of v1:** 100 real users; prove the market exists; good enough that the first users tell others.

---

## 2. THE USER & EMOTIONAL CONTEXT (design for this, always)

The user is at a genuine crossroads — **anxious, uncertain, without a clear direction.** Before they've sent a single application they're already exhausted: by direction confusion, credential anxiety, parental pressure, the fear their degree was "wrong", the question of whether it's too late to pivot. They've scrolled job boards for weeks and feel *more* lost than when they started. They are not looking for more listings. They are looking for someone who gets it.

Every design and copy decision must address this anxiety. The founder is the user — this is personal.

**The emotional target (verbatim from the source docs):**
> "The moment someone lands on this platform, they should feel as though someone capable and calm has taken them by the shoulder and said: 'I've got this.' Not clinical. Not corporate. Not startup-hype. A breath of fresh air."
> "The correct register: *less 'you're going to be okay', more 'you're about to win'.* Users should feel powerful and confident, not consoled."

**The emotional arc (the product's north star) — Meraki → Satori → Kavanah:**
- **Meraki** — the user arrives with their whole self.
- **Satori** — something clicks; the path becomes visible where there was only noise.
- **Kavanah** — they move forward with genuine intention.

Every screen should move the user along this arc.

**Emotional design map (each moment → the feeling to create):**
| Moment | Target feeling |
|---|---|
| Homepage, first 5 seconds | Trusted relief — "how have I not seen this before." Inevitable, not surprising. |
| Input page | The moment of trust. Not a form — a conversation the product honours. |
| Loading screen | Seen, not processed. Someone thinking about *you* specifically. |
| First results (direction) | Satori. "I see you." |
| Daily check-in | Pride. Excited to report back. Momentum. |
| Hard days / employer silence | Never guilt. "You're back — that's what matters. Here's one thing." |
| Returning after absence | Continuity. No mention of the gap. "Welcome back." |
| User gets a job | Celebrate the win, then begin the next chapter. The relationship doesn't end at placement. |

---

## 3. CORE PIPELINE (the spine of the product)

CV / background input → infer **direction** → suggest **role titles** → **live job listings ranked by fit** → **company value matching** → **specific contact at each company** → **personalised outreach draft** → **skills gap map** → **one daily action.**

---

## 4. COMPLETE FEATURE LIST (nothing omitted)

### Phase 1 — build now (the MVP)
1. **Marketing homepage** (see page spec).
2. **Input flow** — 4 questions, one at a time, conversational; with a **CV upload path** and a **no-CV path** (answer without a CV).
3. **CV / background parsing** — extract experience, skills, signals from the uploaded CV or typed answers.
4. **Direction inference** — the product reads the background and reflects back the user's real direction in plain, warm language. This is the Satori moment.
5. **Role suggestions** — suggested role titles based on the direction.
6. **Live job listings ranked by fit** — real listings (Adzuna initially), each with a **match score**.
7. **Match reasoning** — one warm sentence per role: *why* it fits this person.
8. **Company value matching** — "why this company fits you" surfaced inside each role card (not a separate section).
9. **Contact discovery** — a specific named contact at each company ("contact found").
10. **Personalised outreach draft** — a ready-to-send message for each contact (this is the answer to competitors' "intros").
11. **Skills gap map** — each gap shows: skill name → why it matters → how to close it → specific resources/actions → a progress bar. Premium treatment (this is the key differentiator vs competitors).
12. **One daily action ("Today's action")** — a single concrete next step, never a task list. The momentum mechanic. Includes a no-guilt "not today" option.
13. **Dashboard / Home view** — the place the user returns to (see page spec).
14. **Returning-user / "welcome back" state** — continuity, "since you were here" changes, progress.
15. **Progress & momentum** — quiet, earned acknowledgment of movement (skill closed, role applied, new matches). Not gamified, no trophies/confetti.
16. **Auth** — email one-time-code (OTP). **Value-first:** the user sees full results (direction + roles + skills) *before* any signup; auth only gates *saving* them.
17. **"Ask" entry** — a quiet, persistent way to ask the product a question (opens a slide-over). NB: the product **nods and confirms — it is not a real-time chatbot.**

### Phase 2
18. **Daily check-in** — "What did you do today?" The product celebrates the answer. Emotionally complex; deserves its own design.
19. **Away mode** — a conversational moment, not a settings toggle: "I'm going on holiday." → "Enjoy it. I'll be here when you're back." Preserves the relationship through absence; no accumulating guilt.
20. **Self-reflection questionnaire** (the self-knowledge layer) — structured identity prompts (career coaches charge £150/hr for this; nobody does it at scale). Surfaces **gradually over time, never all at once**, only after the product has shown value. May be the most emotionally loaded moment in the product. Seed questions already defined:
    - Who are you without your labels?
    - When have you felt most absorbed in work — what were you doing?
    - What would you work on even if nobody paid you?
    - What is your specific advantage over people who started earlier?
    - Describe your ideal working life at 35 — the texture of the day, not the job title.
21. **Applications tracking** — list of saved/applied roles with status (Applied / In progress / Heard back).
22. **Outreach drafts management** — the drafts, attached to the roles they belong to.
23. **Company response-time + post-application journey map** — after applying, show a realistic time-to-hear-back for that specific company and what to expect next (interviews, tests, assessment centres). Replaces silence with structure.
24. **CV builder** — when opening a suggested role, tailor the CV to that specific role (and pass AI screening); same for cover letters and outreach.
25. **CV creation from scratch** — for users with no CV yet.
26. **Salary / compensation guidance** — at the offer stage: where you should be priced, what to look for.
27. **Shareable card** — an "I found my direction" card the user can share.
28. **Live auto-refreshing job matches** — new matching roles appear automatically; the dashboard always shows current matches, not a static snapshot.
29. **Expand job data sources** — beyond Adzuna (e.g. Reed API + others) for volume and quality.
30. **Industry encyclopaedia / "what's out there"** — show people roles and industries they didn't know existed, *before* they search. An underrated differentiator.
31. **Mobile** — full responsive / mobile experience (desktop is the v1 priority).

### Phase 3
32. **Intelligence flywheel** — the platform gets smarter from its own success data (which outreach got replies, which matches were right). The product that has helped 10,000 people is categorically more valuable than the one that helped 10.
33. **Post-placement / "next chapter"** — the relationship continues after a job: first-90-days support, progression, development.
34. **In-job progression** — once employed, help the user develop skills toward promotion.

### Phase 4 / far future (vision, not build-now)
35. **AI mentor character** — a consistent presence (not a chatbot) that knows the user's journey and speaks to where they are.
36. **Autonomous job applications** — the product applies on the user's behalf with a tailored CV + cover letter per role (huge complexity: legality, site auth, user control).
37. **Universities module** — courses, prices, entry requirements.
38. **International / visa module** — companies that sponsor visas, required legal documentation.

### North-star principle
**The completeness promise:** the user should never need to leave the product for anything in their career journey. Approach carefully so it never becomes overwhelming.

---

## 5. PAGE-BY-PAGE SPEC

### Homepage (marketing)
One job in the first 5 seconds: communicate "this is different" through atmosphere, before a word is read. Structure (follow the layout discipline of Linear.app, translated to warm + light):
- **Nav:** wordmark left ("Career Intelligence"), a few centred anchor links, "Sign in" + an amber primary CTA "Find my direction →" on the right. Sticky, solid warm background (NOT frosted glass).
- **Hero:** left-aligned, large bold headline; sub-line left + a small secondary link right on the same row ("No idea where to start? That's exactly the point →"); amber CTA + a low-pressure reassurance ("Takes about a minute · No CV required").
- **Big product preview:** a clean, solid dashboard-preview image (direction + role matches + skills) sitting in a **soft warm-orange glow on the cream background** (glow starts around the middle of the image and fades to the edges; never a hard dark card, never a glow that touches the very top).
- **Statement line:** "A career companion. Not a job board." (key word in amber), with a one-line follow.
- **Three illustrated pillars:** Direction / Roles / Skills, each with a small isometric line illustration.
- **Feature sections:** Direction → Roles → Skills → "It comes back with you" (the companion mechanic), each = a left heading + right description, then a product visual below.
- **Closing:** one big CTA on a LIGHT background.
- **Footer:** espresso (dark warm brown) — the only heavy-dark block, at the very bottom.

### Input flow ("the moment of trust")
- One question at a time. Each question large and warm. The product **acknowledges each answer quietly before the next appears.** (NB: it nods/confirms; it does not perform live personalisation.)
- 4 questions (placeholder framing): Background · Direction · Goals · Preferences (location, salary, dealbreakers). Plus a **CV upload** option and a **"no CV" path**.
- Progress = simple **dots**, never a percentage, never "Step 2 of 4 = 50%".
- No back button until step 2. No skip links.
- The submit is the *reward* for completing the conversation, not a button to rush through.

### Loading screen ("seen, not processed")
- A single calm, continuous animation (a slow warm pulse — NOT a spinner, NOT a progress %, NOT a step checklist).
- One line of warm, personal copy — the internal monologue of someone thinking about *you* ("Reading what you've built, and what it says between the lines"). This is the **one** place a serif italic may be used for warmth. Copy rotates gently across the wait.
- Currently the analysis can take up to ~90s; the design must make the wait feel intentional, and copy must never say "Analysing" or "Processing".

### Auth (email OTP)
- Appears as a **non-blocking overlay after results are shown** ("Save your results and come back anytime"), or on demand via "Save your results".
- Email field → one-time code. Explain magic-link/OTP simply for users who don't know the term.
- Dismissible; results stay in the session if dismissed (a gentle "Save your results →" remains).

### Dashboard — Home view (the most important screen)
Layout: **left sidebar (nav, dark espresso) + main content + a right rail.**
- **Sidebar:** wordmark top; nav items with icons — Home, Roles, Skills, (Outreach + Applications shown but dimmed "soon"), Profile; user name/email at the bottom. Active item = amber text + amber left-bar + faint amber tint.
- **Top bar:** "Home" + a quiet persistent **"Ask anything"** entry.
- **Greeting** (warm; first-visit vs "Welcome back" differ).
- **Direction panel** (the hero / Satori) — on a warm espresso (dark brown) surface with an amber glow; large, personal, reflects back who they are. The emotional anchor of the screen.
- **Today's action** — a single, prominent warm card: one concrete step + a primary button + a no-guilt "Not today".
- **Top matches** — 3 role cards with **match score rings** (a ring + number + "Match" label, so it never relies on colour alone).
- **Right rail:** "Your progress" (since-last-visit momentum) · "Skills to close" (soft green panel, progress bars) · "Contacts found" (soft clay panel) · *(a calendar slot is reserved here for Phase 2 — do not build an empty calendar in v1).*
- Reading order = the arc: *who you are → the one move today → where it leads → how to get there → who to talk to.*

### Roles view
- Direction context line; full list of roles ranked by match score.
- Each card: company + title → match score (ring) → location/salary → why it matches → company-values fit → contact found → "View & reach out".
- Filters (location, salary, type) — secondary, never dominant. Paginate ("load more").
- Empty state that encourages, never deflates.

### Skills view (the premium differentiator)
- Overview ("X skills you have · Y to close").
- Skills-to-close map: each = name → why it matters → how to close it → resources → progress bar (fills on return).
- Skills you have, with a brief "why this is valuable".
- Must feel as important and premium as the roles view.

### Profile view
- Name + the background as the product understood it; CV on file (update option); preferences (editable); inferred direction (refine option); account (email, sign out). Functional, not flashy; lives at the bottom of the sidebar.

---

## 6. DESIGN — MUST NOT LOOK LIKE AI SLOP (hard requirements)

The single biggest failure mode is looking like a generic AI app. The product must look like something a thoughtful person made for another person — warm, calm, considered, premium *as care* (not as exclusivity).

### Signature look (this is the recognisable brand)
**Warm light throughout, punctuated by espresso (dark warm brown), with honey-gold as the signature accent.** Not cold, not corporate, not the generic blue/purple SaaS look, not Claude's cream-and-coral.

### Colour tokens (use these exact values)
```
Base / neutrals
--bg:        #FAF8F3   /* airy warm cream page background */
--surface:   #FFFFFF   /* cards */
--line:      #EDE7DB   /* warm light borders */
--ink:       #211A12   /* primary text (warm near-black) */
--ink-2:     #5A4F3E   /* secondary text */
--ink-3:     #938876   /* captions / hints */

Espresso (structure / grounding — sidebar, dark bands, footer)
--deep:      #2A2014
--deep-2:    #3A2E1C
--on-deep:   #F2EADC   /* text on espresso */
--on-deep-2: #BCAC8E
--gold-on-dark: #F0A24E /* amber on espresso */

Signature gold (opportunity / action / scores / active)
--gold:        #A85E16  /* AA-safe: use for text, links, buttons, small UI */
--gold-bright: #DD8A2C  /* lively pops only: score rings, tints (NOT small text) */
--gold-tint:   #FFF2DD  /* soft wash for the "Today" card */

Supporting — soft, light (variation without a rainbow)
--green:   #2F7B53  (text) / #3E9B6B (bars)  --green-tint: #E9F4ED   /* growth: skills, progress */
--clay:    #B5532F  (text) / #E0744F (accents) --clay-tint: #FCEDE5   /* connection: contacts */
```
**Colour rule:** amber appears only on interactive/score/active elements — never as a big surface fill. Each dashboard section has a soft colour identity (espresso = direction, gold = roles/today, green = skills, clay = contacts) via gentle tinted cards + a small coloured icon, so the eye is drawn to sections and it feels inviting, but calm. Green for positive states (with a label/shape too, never colour alone).

### Typography
- **Instrument Sans** for everything (headlines big/tight/heavy; body 16px; UI). Weights 400/500/600/700.
- **DM Mono** for data only: match scores, small labels, timestamps.
- A serif (DM Serif Display) is allowed in **one place only**: the loading-screen line. Nowhere else.

### Layout & components
- Generous whitespace; rounded cards (≈18–20px radius); soft warm-tinted shadows.
- Dashboard = sidebar + main + right rail (content max-width with balanced side margins — don't run a thin column down the centre, don't stretch edge-to-edge).
- Match score = ring + number + label. Skills = progress bars. Friendly line icons. Soft tinted section panels.
- Motion: subtle and purposeful. Scroll-reveal = gentle fade + slight rise. Hover = small lift. 150–200ms ease. **Animate only transform & opacity.** No stagger-on-everything.

### References to emulate (named, specific)
Resend (typographic warmth) · Linear (structural clarity, the homepage layout pattern) · Craft.do (section differentiation) · Day One (private, personal, warm) · **Headspace (calm + colourful, designed for anxious people — the model for "inviting but not overstimulating")** · Sunsama (calm daily companion) · Monarch (warm, friendly cards).

### BANNED — never use any of these (this is what "AI slop" means here)
- Glassmorphism / frosted-glass panels
- Gradient *meshes* / blobby multi-colour gradients; blue or purple gradients
- Grain / noise overlays
- Dark mode or near-black (#181B28-type) interfaces; cold greys
- Marquee / ticker scrolling bars
- Section numbers (01 02 03) used as visual hierarchy
- Stagger animations on every element; rotating gears/fans; animated SVG watermarks
- Syne, Space Grotesk, or Inter as default fonts; DM Mono on every label
- Generic AI / abstract imagery, stock-photo energy, rainbow palettes, pastel-washed everything
- Cliché "AI-powered" badges or robot/sparkle iconography
- "Precision + craft + bespoke + considered" clustered in copy

### Accessibility (required)
WCAG AA minimum for all text/background pairs · visible keyboard focus states (warm/amber outline) · `prefers-reduced-motion` degrades all animation to instant · never convey information by colour alone · always render light (ignore the OS dark-mode preference).

---

## 7. VOICE & TONE

- Always **"I" and "you"** — a relationship between two people.
- **Warm AND economical.** Short sentences. Never a wall of text. Less, but more meaningful.
- **Reflects back what the user actually said** — proves it listened; names specifics (what they've done, their direction).
- **Direct without being clinical; honest without flattery.**
- **Reframes outdated gatekeeping** where relevant ("In a traditional world, banking required a maths degree. Now you can come from any background — you just need to close the gaps.").
- **Shows, asks, waits.** Never lectures.
- Test: *could a trusted mentor who just read your CV say this out loud?*
- Emotional mode: **investigate, listen, then respond with data and a path.** Not cheerleading, not therapy.

### Never say / never do
- "We'll get you a job" / "Guaranteed" (until data proves it)
- Statistics it doesn't have
- "AI-powered" (intelligence is under the hood, never named to the user)
- Generic advice that could apply to anyone (specificity is the whole promise)
- Flattery ("You're amazing!")
- Urgency that exploits anxiety (no countdown timers, no "act now")
- "We understand how you feel" as boilerplate (prove it by being specific)
- Anything that reads like it was written by a generic AI

---

## 8. UI NAMING CONVENTIONS (use these labels)
| Concept | Use | Not |
|---|---|---|
| The analysis output | **Direction** | Results / Analysis / Match |
| Suggested positions | **Roles** | Jobs / Opportunities / Listings |
| Skill deficiencies | **Skills to close** | Skill gaps / Missing skills |
| Daily action | **Today's action** | Next steps / Tasks / To-do |
| Saving results | **Save your results** | Create account / Register |
| Applying | **Reaching out** | Applying / Submitting |
| The wait | the product is **thinking** | Processing / Analysing |

---

## 9. DATA, INTEGRATIONS & FUNCTIONAL REQUIREMENTS
- **CV upload + parsing** (PDF/doc), plus a no-CV typed path.
- **AI inference** for: direction, role titles, match scoring + reasoning, company-values fit, skills gap (+how/resources), outreach drafts. (Use the strongest available large language model.)
- **Live job data:** Adzuna to start; architect to add more sources (Reed, etc.). Matches should refresh, not be a one-time snapshot.
- **Contact discovery** per company (name + role). ⚠ Legal/GDPR review of contact discovery is outstanding — flag in any investor/advisor context.
- **Email OTP auth.**
- **Secure, encrypted storage** of user data; auto-deletion policy (e.g. 90 days).
- **Performance:** the end-to-end analysis must feel fast; if it's long, split work (quick extraction first, deeper intelligence after) and stream, so the user isn't staring at a 90-second wait.

---

## 10. OUT OF SCOPE FOR THIS B2C BUILD
- **B2B** (employer intelligence, university licensing) — a future Phase-4 upside only; it has value *because of* what B2C accumulates (user data, success stories, proof). Do not build or claim it now.
- The far-future items in Phase 4 (autonomous applications, AI mentor character, universities/international modules) — vision, not v1.

---

*End of brief. Build it warm, calm, specific, and unmistakably human — for an anxious 22-year-old who needs to feel someone capable has them. Not a job board. Not an AI tool. A companion that helps them win.*
