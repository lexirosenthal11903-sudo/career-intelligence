# Engaged, Focused Mentor — Brainstorm
_Status: Complete (grill resolved 2026-06-29) — ready to build on Opus._

## Summary & Key Decisions

The two behaviours are **one loop**: holding the thread *creates* the parked/open thread that the proactive
return-opener later reopens. Both are grounded in `mentorship-research.md` + the new
`task-focus-and-switching-research.md` (two corroborating passes).

**Behaviour 1 — Proactive check-in on return**
- **Knows what's open by reading the transcript** (source of truth; no separate "open thread" parsing).
- **Speaks first on a MEANINGFUL return** (first visit of the day / after a gap), **not every login**. Stays
  quiet on same-session navigation. ("New day vs same session" is free from `conversations.updated_at`.)
- **Content adapts:** open thread → reopen it ("you were weighing the visa — where'd that land?"); no open thread
  → low-pressure progress check-in + one next thing; **length varies** with how much there genuinely is.
- Root-cause fixes needed: `useArloChat.ts` must call an opener on return-with-history (today it only does so for
  brand-new users); the `initiate` API path must be fed the recent transcript (today it gets profile facts only,
  NOT the conversation — so it literally can't see the visa thread).

**Behaviour 2 — Hold the thread (LOCKED as-is)**
- **Hold RELATIONALLY, not structurally:** always *know* where we were; never *force* back; *offer* it back as a
  real choice; user decides; hold the parked alternative. Never ignore a switch; never immediately redirect.
- **Read avoidance vs genuine need** from 4 text-visible signals (timing / specificity / reason / pattern) +
  sustain-talk vs change-talk. **When unsure → ask gently** ("what's making this feel urgent right now?") and
  **follow the switch while explicitly holding the thread** (the safe default). Never label avoidance; name the
  pattern, not the pathology. Resist the advisor's own "righting reflex".
- **Close threads with an implementation intention** — a specific when/where/what, tied to a value, ONE thing.
- **Follow up with "how did things go with X?" — never "did you do X?"** (shame → disengagement). Ban the latter.
- **Parking-lot discipline:** name the parked item when parking it; **return proactively at the seam** between
  topics; never park-and-forget (the one trust-destroying failure mode).

**Storage decision (revisits Q1) — Light durable capture via the EXISTING memory mechanism**
- When the advisor parks a thread, it writes ONE note through `remember`/`update_profile` ("Parked: salary
  expectations — return after the CV") and **clears it once genuinely resolved**. Already surfaces in
  `buildUserContext`. **No new data structure, no user-facing task list** — just the existing invisible memory used
  for an open loop. Fixes the "fell out of the ~20-turn transcript window → silently lost" failure.

**Multiple open/parked threads on return — research splits BY MOMENT (Lexi: "what does the research suggest"):**
- **Return opener (re-entry):** lead with **ONE** thread (most significant / most alive). Grounded in Clutterbuck
  contracting + MI + "one concrete next thing, never a to-do list" + psychological safety (never make an anxious
  user feel behind) + Ovsiankina ("this is still with you", not a backlog). Opening with a list = the to-do-app /
  overwhelm failure the anxiety register forbids.
- **At a natural seam / before winding down:** parking-lot discipline applies — surface what's still open and give
  each a home (the held threads resurface here, NOT dropped — silent drop is the one trust-destroying failure).
- So it's not either/or: opener = one; seam/close = surface remaining. Both behaviours, different moments. The
  held threads live as durable memory notes between moments.

**Guardrails baked in (follow from locked rules, not asked):** regulated-domain reopen (the visa example) obeys
persona §5 (inform + signpost gov.uk / regulated adviser, never advise/assert eligibility); distress threads
follow §5 signposting, never a breezy reopen; first-return uses the seeded first-session transcript; the opener
never fires if the user has already started typing (no racing their message).

**Cost (Sonnet 4.6, advisor's model):** the return-opener adds ~1 extra advisor turn per meaningful return ≈
1.3–2.4¢/call (cached/uncached), ~once/day/active user → ~$40–70/mo worst case at 100 daily-active. Same order as
one normal chat turn. Confirm with `count_tokens` at build.

**Guardrail — NOT in this slice:** cross-session "avoidance pattern" surfacing to the user needs a qualified
practitioner to advise on framing for an anxious cohort first. Log to FEATURE-ROADMAP as practitioner-gated.

**Doc actions:** add the Behaviour-2 rules + the "how did it go" form (banning "did you do it") to
ADVISOR_PERSONA.md; log the parking-lot + return-opener slice and the practitioner-gated pattern feature in
FEATURE-ROADMAP.md; note the storage/state work in REBUILD.md.

**Verification (gap caught by the completeness gate, 2026-06-29):** the two behaviours need eval coverage or they
regress silently. Add eval personas: (a) **return with an unresolved thread** → advisor must proactively reopen
the right one (and obey regulated/distress guardrails if applicable); (b) **return after a clean close** → advisor
must NOT manufacture a thread / must keep it short or quiet; (c) **mid-task topic-switch** → advisor must hold
relationally (acknowledge + offer + bookmark), never ignore and never force-redirect. `npm run eval:advisor`
green is part of self-verify before Lexi sees it.

## Q&A Log

**Q1 — How does the advisor know what thread to pick up on return?**
→ **Read the transcript.** On return, feed the last ~15-20 turns into the opener call; the model reads what was left hanging and decides whether to reopen. No new data structure, can't drift, avoids the to-do-app feel. (Source of truth = the real conversation.)

**Q2 — When does the advisor speak first on return vs stay quiet?** (Lexi pushed back on "only when unfinished" — rightly; answer must be research-led, not opinion.)
→ **Speak first on a MEANINGFUL return (first visit of the day / after a gap), not every login.** Grounded in: Clutterbuck progress-making phase (active over time); momentum-without-pressure principle (regular low-pressure check-ins build progress, framed as care); "proactive but not overbearing" + "would a mentor say this or stay quiet" (not every page-open). Content adapts: open thread → reopen it; no thread → low-pressure progress check-in + one next thing; length varies with how much there genuinely is. "New day vs same session" is free from `conversations.updated_at`.

**Q3 — How hard does the advisor hold the thread when the user switches mid-task?**
→ Base shape: **name it, offer the either/or, follow the user's lead** (psychological-safety + adaptive-dial + GROW-not-slavish). BUT Lexi extended it, and it exposed a research gap:
  - A mentor wants to understand **WHY** the user is switching (abrupt switch = possible avoidance, esp. for anxious users who "make urgent decisions but don't know what they want").
  - Help them **learn to finish** the task they're on — unless there's a genuine urgent deadline.
  - If they do move on: **benchmark/bookmark** where they were, check if they want to return later, and **follow it up at the right time** (this feeds straight back into Behaviour 1 — the switch *creates* the open thread the return-opener later reopens).
→ **Decision deferred pending research** (below). Lexi's standing instruction reinforced: research-ground every behaviour answer; if research is thin, do MORE research — do not fill gaps with assumption.

**RESEARCH DONE → `research/task-focus-and-switching-research.md` (691 lines, Buckets F–I, to the bar).** Key findings:
- **Hold the thread RELATIONALLY, not structurally** (the central principle): always *know* where the conversation was; *never force* back (structural control = wrong); *offer* the thread back as a genuine option; user chooses; hold the parked alternative for later. Never ignore a switch; never immediately redirect (activates defensiveness). [MI rolling-with-resistance / GROW / ICF — framework-certain]
- **Avoidance vs genuine need, readable in text** (4 signals): timing (right after a commitment Q = avoidance / natural break = genuine), specificity (vague = avoidance / concrete+named+external = genuine), reason given (none / clear), session pattern (recurs at commitment moments / unusual). When ambiguous → ask gently ("what's making this feel urgent right now?"); never label avoidance, name the pattern not the pathology. [synthesised from MI sustain-talk + Steel 2007 + Pychyl — design principle, NOT a validated instrument]
- **Safe default when unsure: follow the switch but explicitly hold the thread.** Costs nothing if legitimate; gently names it without pressure if avoidance.
- **Follow-through without gamification:** (a) close each thread with an *implementation intention* — specific when/where/what tied to a value, ONE thing [Gollwitzer & Sheeran 2006, d≈0.65 — verify before quoting]; (b) follow up "**how did things go with X?**" never "**did you do X?**" (shame → disengagement). Relational memory, not incentives.
- **Parking-lot discipline:** name + acknowledge the parked item at the moment of parking; return PROACTIVELY at the seam between topics (don't wait to be asked); surface unaddressed items before session close. **Failure mode: parking and never returning — even once destroys trust.** [practitioner consensus — Kaner et al. 2007]

## Open Flags
- **Engineering (from research):** "parked topics + their intended return point must be STORED, not held in prompt context only." → tension with Q1 (transcript-only). A thread parked a while ago can fall out of the ~20-turn window we send → we'd silently fail to return → the one trust-destroying failure mode. Decision raised to Lexi (Q5).
- **GUARDRAIL — do NOT build now:** cross-session "avoidance pattern" surfacing ("I notice this comes up when we hit a commitment") is high-value but **needs a qualified practitioner to advise on framing for an anxious cohort before building** — could illuminate or could feel exposing. Log to FEATURE-ROADMAP as practitioner-gated, do not build in this slice.
- Whole-translation gap (carried from parent): no study tested these techniques via a text AI with an anxious cohort — grounded hypothesis, not proven.

---

## Grounding (from code read, before grill)

**Two behaviours in one slice:**
1. Proactive check-in on return — advisor speaks first, picks up an unresolved thread.
2. Hold-the-thread — when the user switches topic mid-task, the advisor gently guides them to use the time well (never controlling).

**Root cause (confirmed + extended):**
- `useArloChat.ts:117-119` — on return WITH history, loads transcript + "New session" divider, then stops. Never calls `initiate()`. (Confirmed.)
- `route.ts:188-197` — the `initiate` path sends ONLY a synthetic "[person just opened]" message. It does NOT pass the prior transcript. It gets `buildUserContext` (profile facts, saved roles, durable `memory` notes) but not the conversation itself. So even calling `initiate()` on return wouldn't pick up the visa thread — the advisor never sees it.
- Durable memory exists: `profiles.memory` = array of `{note}` via `update_profile`/`remember`. But "open/unresolved thread" is not a distinct concept today.

**The central decision:** how does a returning advisor know what's unresolved — (a) feed it the recent transcript, or (b) store an explicit open-thread note?
