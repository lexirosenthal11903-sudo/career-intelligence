# Prior-Art Map — Career Intelligence

_Created 2026-06-27. The reference doc that runs the **four questions** (WORKING-PRACTICES §9) across
every feature: (1) has this been solved well? (2) who does it best + what exactly to copy? (3) how does
ours compare? (4) what do we keep / change / layer on top to make it ours._

**How to read this.** This is a **map we read together, not a to-do list.** Two non-negotiable principles
govern it: **copying is the start line, not the finish** (every replicated pattern is still measured
against our research + mission + the advisor differentiator), and **understand before changing — nothing
built gets wiped as a side effect of this doc.** Where what we have is already good, the map says *keep*.

**Sequence:** everything **already built first** (the priority — clean up what exists), then everything
**planned**, then the one **flagged finding** (the legacy `/dashboard` surface). Research was fanned out
across three subagents (advisor/discovery · documents/jobs · outreach/account/structure) and graded against
our research bar before entering here. Sources are listed per cluster at the bottom of each section.

**The cross-cutting finding** that recurs in almost every feature below: **the entire industry optimises for
volume** — application counts, autofill, streaks, unlimited trackers, cold-email sequences, "beat the ATS"
panic. That is the right product for someone who knows what they want. It is the wrong product for someone
who doesn't. Our positioning ("fewer, stronger applications", no gamification, the advisor is the product)
is not just a tone difference — it requires **actively removing the volume incentives** the best tools are
built around. That is the through-line of our differentiation.

---

# PART 1 — ALREADY BUILT (the priority)

---

## 1. Onboarding / first-session discovery

**Solved well?** Partially. The mechanics of reducing blank-slate friction are well understood. The specific
problem of opening a relationship with a user who is anxious AND directionless (not just unfamiliar with the
tool) is underserved — most products assume a stated goal on arrival.

**Who does it best + what to copy:**
- **Headspace** — asks "why are you here?" before "what do you want?" (inward before outward). Presents 4–5
  resonant options to react to rather than a blank box, killing cold-start terror.
- **Woebot / Wysa** — open with a feeling-check before a topic-check ("how are you doing right now?"). A
  constrained-but-warm opener is less frightening to an anxious user than an infinite free-text field.
- **CareerVillage COACH** (built for early-career, goal-less users) — "respond to questions with more
  questions to help focus the conversation." Direct confirmation the right opening move is to *slow down*.
- **NAVRYN** — "here's what I noticed about you" framing, but earned through conversation, not a 78-question
  quiz (their quiz is the anti-pattern for an anxious consumer).

**How ours compares:** Strong, and already aligned with the best of these. `/api/intake` runs a real
conversational discovery (`INTAKE_SYSTEM`): low-effort questions first, reflect-a-concrete-detail-back on
turn 1, "not sure" is explicitly a fine answer, caps at 2–3 questions, reads direction-clarity live. We
already do inward-before-outward and the constrained-warm opener instinctively. We do **not** yet do
Headspace's "react to 4–5 options" pattern at the very first prompt (we open with free text + the opener
copy).

**Keep / change / layer:**
- **Keep:** the discovery conversation, low-effort ordering, reflect-back, "not sure is fine", the clarity dial.
- **Change (small, candidate):** consider offering Woebot-style react-to-these tiles ("I don't know what I
  want yet / I have a vague idea / I know but not how to get there") as an *optional* on-ramp for someone who
  freezes at a blank box. Test, don't assume — our free-text opener may already be warm enough.
- **Layer (ours):** the inference-and-reflection loop ("from what you've said, it sounds like X") earned
  through conversation. No career tool does this; it's the advisor showing it *read* you.
- **Flag — bad for our user:** psychometric/RIASEC quizzes before trust exists. We correctly avoid these.

---

## 2. The advisor (conversational coaching, memory, agentic actions, honesty)

**Solved well?** In pieces, by different products. **Nobody** combines emotional memory + professional
memory + honest calibration + in-chat actions in a career context. That combination is our whitespace.

**Who does it best + what to copy:**
- **Pi (Inflection)** — best conversational-coaching *feel*: questions branch from what the user actually
  said; persistent memory referenced naturally ("last month you mentioned…") without making a show of it.
  Weakness: Pi never *does* anything. It's the reference for tone + memory surface, not capability.
- **ChatGPT memory ("Dreaming", 2026)** — background synthesis across all past conversations, injected
  invisibly each session; **time-aware** ("you were applying to X in March — heard back?"). Copy: memory is
  invisible unless it creates value; surface stale facts only as *hedged prompts*, never as confident claims.
- **Woebot / Wysa** — best honesty model: distinguish inference from reflection from data; say the "this is
  not therapy / not a recruiter" line **once**, early, never at every turn.
- **Replika** (cautionary) — copy the design decision (memory extracted automatically from conversation, not
  a profile form) but heed the warning: memory *regression* (forgetting what it knew) is a trust catastrophe.

**How ours compares:** Genuinely strong and already differentiated. `advisor-prompt.ts` +
`advisor-tools.ts` give the advisor 10 real tools (remember, update_profile/direction, tailor_cv,
write_cover_letter, draft_outreach, set_application_stage, revise_directions…), so unlike Pi it *acts*.
`buildUserContext` already assembles name, values, deal-breakers, aspiration, evolving `memory[]`, saved
roles, and a directive↔non-directive "dial" — so it speaks specifically and adjusts to how settled the user
is. Honesty is already a core stance (honest-matching, no over-narrated caveats). **Gap vs best-in-class:**
our memory is mostly *fact recall*, not yet **time-aware** ("it's been six weeks since that interview —
news?") and not yet *emotional* continuity ("you seemed anxious about the skills gap last month — shifted?").

**Keep / change / layer:**
- **Keep:** the tool suite, the context builder, the dial, the honesty stance. This is ahead of the market.
- **Change:** make memory **time-aware** — store and surface "when" so the advisor can reference elapsed time.
  This is the single highest-leverage upgrade and lands with the role-interest memory layer.
- **Layer (ours, the moat):** dual-track return — *emotional* memory ("has that anxiety shifted?") alongside
  *professional* memory ("three applications, no replies — let's look"). This combination exists nowhere.
- **Flag — bad for our user:** BetterUp's "what coaching style do you prefer?" dial — metacognitive pressure
  for an anxious 22-year-old. We correctly infer the dial instead of asking.

---

## 3. CV tailoring

**Solved well?** Yes, heavily — and heavily mythologised. **Flag the ATS myth explicitly:** "75% of CVs
never reach a human" came from a 2012 sales pitch by a now-bankrupt vendor. In 2026 only ~8% of recruiters
enable automated content rejection; modern ATS use semantic matching, not keyword counting, and stuffing
*penalises* you. The real wins are: clean parse (single column, standard fonts, no tables/sidebars),
authentic language matching the JD, and quantified achievements.

**Who does it best + what to copy:**
- **Teal** — side-by-side JD/CV editor with a live match score that updates as you edit. Cleanest UX in market.
- **Rezi** — single-column, standard-font template doctrine (88%+ parse rates); score broken into dimensions
  (content / formatting / keyword coverage / ATS compatibility) not one black-box number.
- **StandOut CV (UK)** — the most UK-aware: A4, two-page default, personal statement on top, British English,
  no photo. US tools (Rezi, Jobscan) get this wrong; the "one-page rule" is US-centric and wrong for the UK.

**How ours compares:** Built and wired (`/api/tailor-cv` + `TailorCVModal`, stored in `documents`). We
rewrite the CV against the JD with Sonnet and return 3–4 change explanations — the *explanation* is good and
not something self-serve tools do conversationally. We do **not** show a live side-by-side score, and we
haven't audited our tailoring against the UK-format conventions or the ATS-myth correction.

**Keep / change / layer:**
- **Keep:** advisor-led tailoring with plain-English change explanations; storage in Documents.
- **Change:** frame any score as **"alignment with this role"**, never "ATS optimisation" (don't feed the
  myth). Ground our tailoring rules in UK CV conventions + the real parse/quantify wins (needs a short
  grounding check per the research standard).
- **Layer (ours):** the advisor decides *when* tailoring is worth it (only for a strong-match role), so it
  feels purposeful, not the mechanical default. Store the *tailoring rationale* alongside the doc — it's
  interview prep too ("why did you emphasise this?").

---

## 4. Cover letters

**Solved well?** Yes, as one-click generation — but **whether they're read is sector-dependent**: UK
graduate/professional-services roles (law, finance, consulting) still weight them; startups/tech largely
ignore them. An honest tool says so rather than always generating.

**Who does it best + what to copy:** **Jobscan** (one-click from CV + JD already in system, no re-entry);
**Enhancv** (three-paragraph structure: role-anchored open → 2–3 mapped experiences → intent close);
**Teal** (visual consistency with the CV = coherent package). **StandOut CV** for UK conventions (shorter
than US, no salary, British register).

**How ours compares:** Tool exists (`write_cover_letter`, Sonnet). Generation works; UI surfacing is partial
and **persistence is missing** (generated on demand, not yet stored in Documents like tailored CVs are).

**Keep / change / layer:**
- **Keep:** generation from data already captured; the three-paragraph skeleton as default.
- **Change:** **persist cover letters in Documents** (parity with tailored CVs); only generate after the
  advisor confirms the role is worth pursuing; tell the user honestly when a letter matters for the sector.
- **Layer (ours):** the advisor's synthesis inflects the letter — if it knows the user is pivoting
  (marketing→UX), the letter addresses the transition directly. Self-serve tools can't; they lack the context.

---

## 5. Roles matching / job listings

**Solved well?** Yes for "know what you want" search; poorly for "ranked, curated, direction-aware,
volume-suppressed."

**Who does it best + what to copy:** **Otta / Welcome to the Jungle** — behavioural + preference matching,
ranked feed not keyword search; Otta's original move (a *small curated daily set*, not a firehose) is the
closest existing thing to "fewer, better." **Bright Network / Milkround** — UK graduate-specific (monitor as
competitors). **LinkedIn** — biggest graph but noisy, engagement-optimised; "Easy Apply" actively fuels the
volume problem we reject.

**How ours compares:** Built (`/api/jobs`, `/api/matched-jobs`, `/api/score`; Adzuna live, Reed pending the
env key). We rank by fit with a relevance reason, mark new roles, and honest-matching keeps seniority/realism
in check. We're already closer to Otta's curate-don't-firehose stance than most. We don't yet **group roles
by direction** or hard-cap the set as a deliberate quality signal.

**Keep / change / layer:**
- **Keep:** fit-ranking + relevance reason + honest matching + seniority guards.
- **Change:** deliberately **cap the set** (a small curated list) and explain the match in the advisor's
  voice rather than leaning on a percentage.
- **Layer (ours):** **group by direction** — if the advisor has established 2–3 directions, roles cluster
  under each rather than blending into one feed. No existing tool does this; it's native to advisor-led.

---

## 6. Applications tracking

**Solved well?** Yes structurally (Kanban is the standard) — but every tracker is **built to reward volume**.

**Who does it best + what to copy:** **Huntr** — Kanban pipeline (Saved→Preparing→Applied→Interview→Offer),
documents stored **on the application card**, contacts per card (a CRM, not a list). **Teal** — the CV
version you submitted is pulled up from the card (critical for learning when an interview lands). The
architectural lesson worth copying: **documents live against the application, not in a separate folder.**

**How ours compares:** Built (`ApplicationsPage` + `/api/applications`, stages
preparing→applied→interview→offer→archive; advisor moves stages via `set_application_stage`). Solid. But our
documents currently live in a **separate Documents store**, not on the application card (Huntr's
architecture is better for "what did I send to Company X?").

**Keep / change / layer:**
- **Keep:** the pipeline + advisor-driven stage moves.
- **Change:** consider linking documents (tailored CV / letter) **to the application card** à la Huntr; and
  hold the line on **no volume metrics** ("you've applied to 47 jobs!" is exactly what we don't build).
- **Layer (ours):** **advisor stage-gating as a quality gate** — "you haven't tailored your CV for this one
  yet" / "no cover letter here" before it moves to Applied. Turns the pipeline into preparation, not tallying.

---

## 7. Outreach / warm intros

**Solved well?** The *volume* version is highly polished (Hunter, Lemlist) — and almost entirely **the wrong
model for us.** Every tool here optimises for cold email at scale. Hard GDPR + values conflict.

**Who does it best + what to copy (carefully):** **LinkedIn warm-intro mechanics** — mutual-connection
mentions lift reply rates; <3-sentence messages outperform; activity-triggered outreach (their post/
promotion) is the best cold path. **Lemlist's "why this specific person" forced field** — a good anti-spam
gate. The **2–3 sentence hard constraint**.

**GDPR red flags (UK, 2026):** under UK GDPR + the Data (Use and Access) Act (in force 19 Jun 2026), when a
user contacts someone using personal data we surface, the **user is the controller, we're the processor** —
the chain must be transparent. ICO is explicit that mass messaging without a specific role in mind is likely
unlawful (a UK agency was fined £130k for LinkedIn scraping + unsolicited outreach). **The safe lane:** the
user finds the person themselves (we deep-link a LinkedIn search, never scrape), we draft only, we store no
recipient data, one contact per company at a time.

**How ours compares:** Built exactly to the safe lane already (`draft_outreach`): we generate a deep-link
search the user opens themselves, never scrape, never persist a contact; the prompt enforces a small specific
ask (15-min chat, never "look at my CV"), UK register, one follow-up, sector calibration — all grounded in
`research/outreach-research.md`. This is **ahead of best-in-class on ethics** by design. (Foundation pass
today also fixed the dead search link when a user has already pasted a specific person.)

**Keep / change / layer:**
- **Keep:** essentially all of it — this is a model of doing outreach the right way. Keep the "why this person"
  intent, the 2–3 sentence discipline, the warm-path surfacing.
- **Change:** nothing structural. (Solicitor review of data handling is already on the pre-launch list.)
- **Layer (ours):** the advisor frames *why* — "the strongest intros explain a genuine reason to talk, not
  that you want a job." Absent from every sales tool because they're built for B2B volume, not an anxious
  early-career person building real relationships.

---

## 8. Account control / account menu

**Solved well?** Yes — fully standardised. Deviating costs usability for zero product gain.

**Who does it best + what to copy:** **ChatGPT / Vercel** are the right reference (single-user consumer, no
workspace switching): avatar trigger, **≤4-item upward popover** (Profile/Settings → in-product · Help ·
Log out, one separator, no nested flyouts). Linear/Notion/Slack add workspace-switching we don't need.

**How ours compares:** Sub-standard — and the proof that prompted this whole map. `LeftNav` is a single
button that **jumps straight to the Profile tab**; there is no popover menu. (Foundation pass today fixed the
**text overflow**; the menu itself is still a known gap.)

**Keep / change / layer:**
- **Keep:** bottom-left anchor, avatar + (now-truncated) name.
- **Change:** build the **popover menu** following the ChatGPT/Vercel pattern: Profile / Settings / Previous
  chats / Sign out. A small, known build — **don't invent it.** (Deferred from the foundation pass *to right
  after this map*, per the agreement — it's exactly a "match best-in-class" build.)
- **Layer (ours):** none. This is pure convention; just match it.

---

## 9. Documents store

**Solved well?** Yes (Teal, Huntr). **What nobody does:** store documents *with the rationale* for how they
were tailored.

**Who does it best + what to copy:** **Teal** — master-plus-derived versioning with "update available"
sync (add a new job once, it flags all derived CVs); name by context not "v7." **Huntr** — documents stored
on the application card.

**How ours compares:** Built (`DocumentsView` + `/api/documents`) — stores tailored CVs with metadata (job
title, company, change summary). Good. Cover-letter persistence is missing (see §4). No master/derived
syncing yet.

**Keep / change / layer:**
- **Keep:** per-job storage with the change summary (we already capture rationale-ish metadata — ahead here).
- **Change:** add cover letters; consider Teal-style "update available" syncing if users accumulate many CVs.
- **Layer (ours):** store the advisor's **tailoring rationale** as first-class content — it doubles as
  interview prep ("why did you apply / emphasise this?"). No competitor does this.

---

## 10. Profile / settings

**Solved well?** Yes — Notion/Linear set the IA standard.

**Who does it best + what to copy:** **Notion / Linear** — full-page modal, left-sidebar nav, **two groups**
(personal account above a divider; product settings below); user data (name/email/delete) always top.
Notion's **account-deletion flow** (two-step, explicit "what's deleted + when", "I understand this is
permanent") is the GDPR gold standard.

**How ours compares:** Built (`ProfilePage` + SidePanel `ProfileView`): email, CV on file, values,
deal-breakers, aspiration, salary, advisor `memory[]`, account deletion (`/api/delete-account` is correct
per the foundation audit). Functional and reasonably organised; not yet the clean two-group IA, and the CV
"replace" path was weak (foundation pass added composer re-upload today).

**Keep / change / layer:**
- **Keep:** the fields, the working deletion, the memory display.
- **Change:** adopt the two-group IA but **rename to user-language** — "You" / "Your career profile," not
  "My account" (matches our warm, direct voice). Match Notion's deletion-confirmation pattern exactly.
- **Layer (ours):** the **Memory** section (what the advisor remembers, editable/deletable per item) — both a
  GDPR right-to-rectification feature and a trust-builder. No competitor has it.

---

## 11. Recap card ("where we got to")

**Solved well?** **No** — the weakest category across the whole market. Most apps dump full history, do
nothing, or generate a generic summary. None solve emotional re-orientation for an anxious returning user.

**Who does it best + what to copy:** **NAVRYN** — a *re-entry question*, not a recap statement ("last time
you tried pausing before responding — how did that work?"): future-facing, pulls the user forward.
**Reflection.app** — synthesise across the *whole* relationship, not just the last session. **Day One** —
progress framing ("six weeks ago you didn't know where to start; since then you've done X, Y, Z").

**How ours compares:** Built but **blocked** (`useRecap` + `/api/recap`): real per-user generation exists,
but the greeting is still **fake "Ellie" placeholder copy** — confirmed must-be-real before sharing with
anyone. Structurally it's a summary block, which is exactly the pattern the best products *avoid*.

**Keep / change / layer:**
- **Keep:** real per-user server-side generation, cached.
- **Change:** **fix the fake greeting (blocker).** Drop the summary-block format for NAVRYN's shape: **one
  specific observation + one open question + one piece of unfinished business** (three elements, max).
- **Layer (ours):** dual-track again — emotional continuity ("you seemed uncertain last time — different
  now?") beside professional ("two applications pending — news?"). Never dump raw history at an anxious user.

---

## 12. Direction cards / direction detail

**Solved well?** Partially (Kickresume Career Map, FuturU) — but all present roles as confident lists/maps
with statistical fit, none reflect the user's *own words* back, none acknowledge uncertainty.

**Who does it best + what to copy:** **Kickresume** — card anatomy (title + seniority band + salary +
one-line summary) + a have/need skills strip (green matched, grey gaps). **FuturU** — a *living* fit that
updates as the user adds info (copy the principle — cards are "provisional, may shift" — not a literal score).

**How ours compares:** Built (`DirectionView` + `RoleDetailPage`): cards with title + why-it-fits, max 4 by
design, editable via `revise_directions`, feedback tracked. We **already** do the differentiator nobody else
does — a human "why this fits you" — but it's not yet consistently reflecting the user's *exact words* back,
nor flagging honest uncertainty on weaker directions.

**Keep / change / layer:**
- **Keep:** ≤4 directions, the why-it-fits, editability, feedback tracking.
- **Change:** add Kickresume's skills have/need strip; frame cards as **provisional** ("based on what you've
  told me so far") — no fixed score (gamification rule).
- **Layer (ours, the moat):** every card's "why I suggested this" written in advisor voice reflecting the
  user's **own words**, and **honest about uncertainty** ("I'm less sure about this one — you wanted creative
  but also said structure helps you focus; this sits at that edge"). That honesty is the product.

---

## 13. Skills-in-role (skills gap)

**Solved well?** **No strong consumer product exists** — Degreed/Cornerstone/LinkedIn Learning Hub are
enterprise B2B. Genuine whitespace.

**Who does it best + what to copy:** **Jobscan/Teal "missing keywords"** is the closest (per-JD, not
directional). **LinkedIn's Skills Graph** is the best public data for "what does role X require."

**How ours compares:** Live data exists in the analysis `skillGaps`, and in the live `/workspace` it's
correctly surfaced **inside the role detail** (not a separate tab). That placement is good. (Note: the
*legacy* `/dashboard/skills` SkillsPage — see Part 3 — is a dead duplicate.)

**Keep / change / layer:**
- **Keep:** skills shown in-context inside a role, not as a standalone competency dashboard.
- **Change:** make gaps **direction-level** (the pattern across a direction's roles), not single-JD, and pair
  each gap with a concrete free closure route (course/project/cert + time estimate).
- **Layer (ours):** only surface gaps **once a direction is worth pursuing** — timing is the differentiator;
  a gap analysis on arrival is a self-assessment exercise an anxious user doesn't need.

---

# PART 2 — PLANNED (map before we build)

---

## 14. Role-interest mentoring flow (next build — SPEC first)

**This is the heart, and it's a redesign of current behaviour.** Today, "I'm interested" jumps toward CV +
cover letter (a job-dashboard reflex). The intended behaviour: the advisor gets curious first and builds a
*plan* (why this one → honest alignment → gaps → the company → the process), with documents as steps inside
the plan. **No direct prior art** — this is the advisor differentiator applied to the moment of interest.
The closest references are the coaching-conversation feel (Pi) and BetterUp's "actions emerge from the
conversation, not a menu." **Gets a grilled, agreed `SPEC.md` before any code** (this session, Part C).

## 15. Interview prep (planned)

**Solved well?** Yes, split three ways: delivery coaching (**Yoodli** — filler words, pace), content coaching
(**Final Round AI / CleverPrep** — STAR, role-specific banks), live practice (**Pramp** — turn-based).
**Copy:** Yoodli's post-session metrics card; **Final Round AI's interview-type selector** (behavioural /
technical / case / strengths — the clearest precedent for "calibrated to type"); CleverPrep's JD-intake →
personalised question set; Pramp's turn-based loop. **Do NOT build:** live "stealth" assist during real
interviews — ethically toxic, and several firms now rescind offers for it. Our lane is preparation.
**Layer (ours):** the advisor **runs the debrief** as a coaching conversation ("you avoided that twice —
here's what you said vs meant; try again"), not a metrics dashboard. Needs grounding research first (interview
formats + what works) per the research standard.

## 16. CV building from scratch (not built)

We don't build a CV from zero today (upload/paste only). If we add it: study **Reactive Resume**
(open-source, worth reading the implementation), single-column ATS-safe defaults (Rezi), UK conventions
(StandOut CV). Lower priority than the candidate-strength loop; flagged so it's on the map, not lost.

## 17. Grounded-knowledge layer (planned, Step 3)

The fact-checking/retrieval layer (`GROUNDED-KNOWLEDGE-PLAN.md`). Prior art = standard RAG over primary
sources (gov.uk, NCS, ONS). Not a feature users see directly; it's how salaries/skills/routes stop being
guessed. The proper run-time fix for research freshness (vs a swarm of refresh agents).

---

# PART 3 — FLAGGED FINDING (decide together, nothing touched yet)

## The legacy `/dashboard/*` surface

**Finding (verified in code this session):** the live product is entirely `/workspace` (the
conversation-first split-pane shell). Every entry point — homepage CTAs, auth callback, AuthModal — routes to
`/workspace`. The older multi-page `/dashboard/*` surface (`DashboardHome`, `/dashboard/roles`,
`/roles/[id]`, `/applications`, `/skills`, `/profile`) **only links to itself**; `/workspace` never links to
it. Skills now live *inside* the role detail in the SidePanel, so `/dashboard/skills` is a dead duplicate
(its cert-upload input and `.doc` handling were the two Tier-3 fixes I deliberately **skipped** this session).

**Why it matters:** it's parallel, drifting code — two implementations of roles/applications/skills/profile.
Bugs fixed in one don't reach the other; it's a maintenance tax and a source of confusion.

**The decision (together, not now):** **archive** `/dashboard/*` (move to `archive/`, preserve git history)
once we confirm nothing still depends on it — **or** consciously keep a piece if it serves something
`/workspace` doesn't. ⚠️ Per our rule, **nothing gets wiped until you understand it and agree, page by page.**
Recommended: a short dedicated cleanup pass after the role-interest redesign, where we walk each dashboard
page together and confirm it's superseded before archiving.

---

## Sources

**Advisor / discovery cluster:** BetterUp AI Coach; NAVRYN (persistent-memory coaching); Pi (Inflection);
Woebot, Wysa (clinical honesty); Headspace onboarding; CareerVillage COACH; ChatGPT Memory "Dreaming"
(OpenAI, 2026); Replika (2026 rebuild, cautionary); Reflection.app; Day One; NN/g onboarding research.

**Documents / jobs cluster:** Teal HQ; Rezi; Jobscan; StandOut CV (UK); Reactive Resume (open-source);
Huntr; JobHuntr; Welcome to the Jungle / Otta; Bright Network, Milkround (UK); LinkedIn; ATS-myth corrections
(Interview Guys, Enhancv, TieTalent, KraftCV); UK-vs-US CV format guides.

**Outreach / account / structure cluster:** LinkedIn; Hunter.io; Lemlist; Overloop; UK ICO recruitment
guidance + Data (Use and Access) Act 2025 (in force 19 Jun 2026); Yoodli; Final Round AI; CleverPrep; Pramp;
Google Interview Warmup (retired Apr 2026); Linear, Notion, Slack, ChatGPT, Vercel (account/settings IA);
Kickresume Career Map; FuturU.

_Full per-feature source links live in the three subagent research reports (this session's transcript).
Grade against the research bar before any of these becomes a build rule — primary/institutional sources only
for hard rules; 2+ independent sources for anything load-bearing._
