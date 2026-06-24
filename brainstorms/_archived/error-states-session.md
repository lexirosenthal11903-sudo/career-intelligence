# Error States — Brainstorm
_Status: Complete_

## Summary & Key Decisions

**States and how they're handled:**
1. Analysis failure — full screen. Arlo speaks, owns error, retry button, user input preserved.
2. Slow pipeline — NOT a separate state. Loading screen phrase shifts tone after threshold. Complete timeout → falls to state 1.
3. Lost connection — subtle top banner. "You're offline — I'll reconnect when you're back." Silent recovery, no Arlo message.
4. Arlo chat failure (mid-dashboard) — inline chat message only. Copy decision, no visual state. Goes in ADVISOR_PERSONA.md.

**Mockup scope:** States 1 and 3 only. State 2 = loading screen edit. State 4 = copy only.
**Copy decisions to add to ADVISOR_PERSONA.md:** Error voice for states 1, 3, 4.
**Phase 1 backlog:** Retry logic, never lose user input on API failure.
**Phase 2 QA backlog:** Test analysis across diverse CV types.

## Q&A Log

**Q1: Analysis failure — what happens?**
A: Arlo speaks first, owns the error ("Something went wrong on my end — it's not your CV, it's me"). Single retry button. User input is preserved — retry is instant. Exact phrasing TBD in copy session.
Decision: Arlo owns it + retry + input preserved.
Flag: Engineering must ensure API calls are resilient — retry logic, never lose user input. Phase 1 backlog.

**Q2: Slow API / timeout — distinct state or handled in loading screen?**
A: No distinct "slow" state. Loading screen phrases shift tone after a threshold — "Still working — this one's taking a bit longer than usual." If it times out completely, falls into analysis failure state.
Decision: Slow = loading screen language shift only. Complete timeout = analysis failure state.
Flag: Phase 2 QA — test analysis across diverse CV types (sparse CVs, career changers, non-English backgrounds, unusual paths) to ensure reliability for all users.

**Q3: Lost connection mid-session — full state or subtle banner?**
A: Subtle banner at top of screen. "You're offline — I'll reconnect when you're back." No modal, no panic. Banner fades silently on reconnect — no "you're back online" message. Arlo doesn't speak for this — it's a system state, not an emotional moment.
Decision: Top banner only, silent recovery.

## Open Flags
(things to follow up on — missing info, research needed)
