# Conversation-First Structure (Meridian) — Brainstorm
_Status: In progress_  ·  _Started 2026-06-21 (Session 41)_

## The problem we're solving
Current build is a dashboard with a chat bolted on. Lexi's verdict after a real run:
"too many tabs… doesn't feel cohesive… the whole structure needs reworking, it's not
meeting the feeling I want." Per-tab conversations fragment the relationship; Arlo
re-greets on every tab. This matches the REBUILD thesis: a dashboard-with-side-chat
can't feel like a mentor — the fix is conversation-first.

## North star (do not lose)
Meraki → Satori → Kavanah. Arrive whole → the click (the path becomes visible) → move
with intention. The advisor is the product; listings are a utility. Voice: warm,
economical, "I"/"you". Emotion delivered = grounded hope. Lexi is the user.

## Summary & Key Decisions
- **Core metaphor (LOCKED): a real mentor session.** Arlo opens → you talk → at the right
  moment Arlo brings something out to look at *together* → you return to talking. The
  conversation is the constant; "sources" (roles, skills, an application) are summoned when
  relevant and then recede. You are NOT both staring at a dashboard the whole time.
- **Front door (LOCKED): Arlo speaks first (option A) grounded in 1–2 real things (B underneath).**
  Specific, earned opener — "whoever made this gets me." Never hollow chat. No competitor does this.

## Q&A Log
**Q1 — the daily open / front door.** → Agreed A-over-B-over-C: Arlo initiates with something
specific, grounded in the day's real items. Lexi's framing: like sitting with a mentor — they
start the session, you chat, then they put out sources to look at *together*, but you're not both
looking at them the whole time. Showing is episodic, inside the relationship.

**Q2 — how Arlo surfaces "sources."** → Agreed: **A (inline cards in the conversation) as default,
B (focused surface, Arlo beside it) only for document-like work** (CV tailoring, full role breakdown,
cover letter). C (hand-off to a destination tab) is dead — it's what broke the feeling. No tabs; a
conversation that *contains* things. Lexi: makes sense, but needs to see it visually to judge the balance.

**Q3 — what survives as a "place."** → Proposed collapsing 5 tabs to conversation + 1 persistent thing.
Lexi pushed back, correctly, on 3 points: (a) "ask Arlo for everything" = memory burden on the user, a
mentor wouldn't do that; (b) organising around Applications betrays the thesis — **the process in the
middle is the point**, not jumping to the application; (c) she's visual — pure back-and-forth conversation
gets tedious, she needs to *see* where she is. → My synthesis: **the "shared desk" — a conversation over
one living "path" map** (arc-shaped: who you are / what you're building / what you're pursuing), always
visible (no memory burden), co-created live by Arlo (not a dashboard), centred on the arc not the funnel.

**Q4 — does the shared-desk model land?** → Lexi unsure, needs to see it. Also interested in an alternative:
**mentor as the main screen, a split-screen comes in at relevant points then recedes** (≈ Q2 option B as the
*primary* mode) — but worried it could disrupt flow. **Genuinely undecided — this fork can only be judged
visually.**

## DECISION POINT: two contenders, must be seen
- **Contender 1 — "Shared desk":** conversation + a persistent, always-visible living *path* map (arc-shaped,
  co-created by Arlo). Visual & glanceable; risk = relapsing into dashboard-feel.
- **Contender 2 — "Conversation-main + on-demand split":** full conversation as the only persistent surface;
  a focused panel slides in at relevant moments, then recedes to pure conversation. Clean & immersive;
  risk = disrupts flow, and the "where am I?" glanceability is weaker.
- **Next action: build both as static mockups (real tokens + locked refs), screenshot-iterate, then Lexi reacts.**

## Locked principles (independent of which contender wins)
1. Arlo speaks first, grounded in 1–2 real things. 2. Mentor-session metaphor — talk, then look at sources
together, then back to talking. 3. Showing is episodic, inside the relationship — no living-in-tabs.
4. Organise by the **arc** (Meraki→Satori→Kavanah), not the application funnel — the middle is centred.
5. One shared relationship + memory, never per-tab fragments. 6. Roles & Skills dissolve into the
conversation as things Arlo surfaces; they are not destinations.

## Elevated visual direction (Lexi, Session 41) — for the mockups
The current build is flat / basic / amateur (Lexi's words) — it must look like a real, premium product.
Target: **sleek, modern, alive.** Specific wants:
- **Astronomical/astrological textural imagery** (the locked Meridian visual language — moon/nebula as
  abstract texture). Specific reference, not generic noise — keep.
- **Frosted/glass surfaces + depth** — Lexi wants this. ⚠️ TENSION: generic glassmorphism + noise overlays
  are on the global AI-slop ban list. Resolution: execute the *intent* via **named references + restraint**
  (frosted the way Linear / Arc / visionOS do it — sparing, structural), never the generic purple-glass look.
- **Animation / motion that brings it to life** — purposeful micro-interactions referenced to Linear /
  Vercel / Resend; NOT stagger-everything AI animation.
- **NO AI jargon** (most important to Lexi) — Arlo's voice only; zero "AI-powered / seamless / leverage".
- **Token license:** challenge/extend the current tokens where the elevated direction needs it (add motion,
  elevation, blur/texture tokens). Keep the palette + type — they're good.

## Naming — REOPENED (Session 41, before the visual identity is baked)
- **Decision: ONE name.** Lexi (correct): when the mentor IS the product, two names (platform + advisor)
  is redundant and dilutes. Precedent: Pi, Claude — one name that's both the product and the someone you
  talk to. So the old "platform = Meridian + advisor = Arlo" split is dropped.
- **Brief for the one name:** must work as **brand AND the someone you address** → person-like/warm presence
  (not a cold concept-noun); **ownable** (distinctive, trademarkable, domain available); quietly carries
  guidance/orientation/celestial meaning without being a generic dictionary word.
- **"Meridian" reassessed:** concept is on-thesis (navigation/orientation + astronomy) and elegant as a
  wordmark, BUT (a) extremely common business name → trademark/domain hard, not ownable; (b) under the
  one-name lens it's a *weak companion name* — "Hey Meridian" feels like addressing a building, not a mentor.
  NOT yet committed. Validate before baking into the visual identity.
- **Illustrative directions (not final):** warm+star (Lyra, Vega, Wren); guidance concept (Lodestar,
  Wayfinder — Polynesian celestial navigation, on-thesis); from the arc (Satori). Needs a real pass with
  say-it-out-loud test + domain/trademark check per name.
- **Next-session order: naming pass (curated shortlist + domain/TM check → pick ONE) → THEN mockups.**

## Open Flags
- **The whole structural fork is now a visual question.** Build mockups of Contender 1 and Contender 2
  (elevated visual direction above) before any more decisions or engineering. `frontend-design` /
  `design-flow` with named references. Screenshot-iterate before showing Lexi. Static only — no wiring.
- **Glassmorphism/texture vs the AI-slop ban** — reconcile via references + restraint (see above). Confirm
  with Lexi against real pixels.

## LOCKED — Interaction model (Session 41, 2026-06-21)
**The VS Code / Claude-artifacts paradigm IS the model** (Lexi's own framing, confirmed against the
`lucian-architecture.html` prototype). Conversation is the unmistakable main event; structured surfaces
(roles, a role's detail, progress) **open to the side based on relevance, are readable/optionally
interactive, and close** — "for information," the talk is home. This resolves the Contender 1 vs 2 fork
in favour of **Contender 2 (conversation-main + on-demand side surfaces).** Contender 1's always-on
path panel is dropped as the default.

### Confirmed architecture (how all "materials" live — answers the exhaustive-list worry)
- **Conversation = curated:** Lucian surfaces ONE right thing at a time; never a list here.
- **"Your roles" = the only browsable list,** summoned on demand, ranked, shallow (top ~5 + load more),
  **filtered by talking** not filter walls.
- **Contacts + outreach + skills are NOT top-level tabs** — they live INSIDE a role/direction, because
  that's the only place they mean anything. This is the move that kills tab-city.
- **Applications = one short "Progress" surface,** short by design (quality over quantity).
- Reference prototype: `mockups/lucian-architecture.html` (interactive — click "Your roles" / a role).

### LOCKED — Progressive disclosure (Lexi, S41)
Surfaces/pills **earn their way onto the screen as the relationship deepens** — no "Progress" before an
application exists, no "Your roles" before the first analysis. Right for the anxious user (nothing
overwhelming up front) AND makes return feel like compounding value — with **no gamification**.

### LOCKED — No separate onboarding / loading screens (S41)
The inherited funnel (homepage → input form → loading page → reveal-bridge → app) is **a SaaS shell
bolted in front of a chat.** Kill it: the relationship starts on arrival; learning-about-you, the wait
("give me a minute, I'm reading it properly"), and the **"click"** (direction reveal) all happen INSIDE
the first conversation as one unbroken surface. Homepage exists only to convert a stranger.
**Engineering implication:** the analysis must STREAM into the conversation (no 90s curtain) — already on
roadmap (Haiku extraction + streaming). Fix the cause, don't decorate the symptom.

## PARKED — Contact discovery & outreach legality (S41, needs solicitor sign-off)
Trigger: Jobcopilot's model (aggregate hiring-manager emails from public sources; position as
user-driven/candidate-led sending). Co-founder read:
- **Sending side** (candidate-led, not automated mass-mail) = sound framing; sidesteps CAN-SPAM/PECR
  mass-email rules. [likely]
- **Sourcing side** (scraping/storing public personal data) = the real risk; **UK/EU GDPR does NOT exempt
  public data** — still needs a lawful basis (legitimate interest + balancing test) and possibly Art 14
  notice. [certain] A privacy-policy paragraph doesn't resolve this.
- **Safe MVP decision:** Lucian as **coach, not scraper** — identifies the right *kind* of person, helps
  the user find them on LinkedIn themselves, drafts the message; we do NOT harvest/store third-party
  emails. ~90% of the value, fraction of the exposure.
- **Full "here's their email" version** = good, but gated behind the **solicitor's opinion already on the
  pre-launch list** (CLAUDE.md). Do not build the scraping version before that.

## OPEN — Outreach-within-roles UX needs rework (S41)
Lexi: placement (inside the role) is right, execution is thin — "massively needs work." Pending her
steer on which is weakest: draft quality / the contact / the send flow. Then go deep on that one.

## Aesthetic — still open (decoupled from structure)
Structure is now locked; **skin is a separate, reversible, later decision.** Directions explored this
session: dark astronomical triptych (`lucian-shared-desk` / `-conversation-split`), editorial "Letter"
(`fresh-a-letter`), warm "Daylight" (`fresh-b-daylight`, used as working skin for flow/arch prototypes).
Do NOT let skin indecision block structure/build. Fresh-eyes build brief saved at
`brainstorms/fresh-build-brief.md` (run in a TRULY cold chat — no project memory — or it just echoes us).
