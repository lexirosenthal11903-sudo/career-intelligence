# Returning User Experience — Brainstorm
_Status: Complete_
_Date: 2026-06-10_

## Summary & Key Decisions

**The returning user experience is not a separate screen.** Same dashboard shell always. What changes: the featured action in the left column + Arlo's opening message.

**First visit (post onboarding bridge):** Arlo gently introduces the platform through natural prompts. No tour, no modal. "Here are your roles — start with the top one."

**Every return:** Featured action (highest priority item from the stack) + Arlo always speaks + "what did you get up to?" check-in.

**Priority stack (featured action slot — top item wins):**
1. Active application in-flight (interview, assessment, offer, drafted application)
2. Deadline urgency on a saved role
3. New role matches
4. New contacts
5. Next step on a saved role
6. New skill
7. Direction refinement

**Rules:**
- One primary action only — never mix "prep your interview" with "apply to new jobs"
- Timestamp content, never the gap
- Momentum strip = total active days (cumulative, never resets)
- Secondary items live in Arlo's message, not in the UI
- Away mode: parked for Phase 2

**Three mockup states:** new roles available · deadline urgency · nothing new (falls back to saved role)

## Q&A Log

### Q8: Daily check-in + momentum strip + secondary items + away mode
**Check-in:** Yes — Arlo asks "what did you get up to?" on return. This preserves the "proud to report back" emotional beat from the vision doc. It's a question, not a form. Arlo asks once, records the answer, uses it.

**Momentum strip:** Do NOT use a streak (creates guilt when broken — the Duolingo problem). Track **total active days** instead — cumulative, can only go up, never resets. "12 active days into your search." On return the wording softens: "Good to have you back. 12 active days." No mention of gap. Progress can never regress.

**Secondary items:** No secondary list UI element. Left column stays clean. Multiple new things are surfaced by Arlo conversationally in his opening message: "3 new roles since you were last here — and one of your saved roles closes in 2 days." Intelligence lives in Arlo, not in more UI.

**Away mode:** PARKED for Phase 2. Too many edge cases to design well now. Lexi flagged: when user told Arlo they were going away, the return should include "how was your time off?" — warm re-entry. Design when we know the full away mode interaction pattern.

### Q7: Full priority stack — confirmed + updated
**Decision:** Complete priority stack for the featured action slot (final):
1. **Active application — anything in-flight** — interview coming up, assessment centre, offer to evaluate, application drafted but not submitted. Depth on what's moving beats breadth of new applications. This whole tier ranks above finding new roles.
2. **Deadline urgency** — saved (not yet applied) job closing soon
3. **New role matches** — fresh roles since last visit
4. **New contacts** — someone worth reaching out to at a saved company
5. **Next step on a saved role** — saved but nothing done with it yet
6. **New skill worth building**
7. **Direction refinement** — Arlo has a question or wants to check in

**Key principle:** One primary action only. The featured slot picks the single most important thing. Don't mix "prep for your interview" with "here are new jobs to apply to" — conflicting priorities overwhelm. Secondary items surface through Arlo conversationally, not as competing UI actions.

**Arlo always speaks:** The right panel is never passive. Even when the left column has a clear featured action, Arlo's opening message is required. Arlo gives context, warmth, and the "what did you get up to?" check-in. Non-negotiable.

### Q6: Empty state — what does the featured action show when nothing is new?
**Decision:** Arlo pulls from what's in progress. Priority stack when nothing new:
1. Deadline urgency — job closing soon, application deadline approaching
2. Application in progress — CV drafted, application started but not submitted
3. Next step on a saved role — "You saved Bloom & Wild's ops role — ready to start preparing?"
4. Direction refinement / open question from Arlo

Arlo can always find something worth saying. The product is never empty-handed.

### Q5: Timestamps — surface time or not?
**Decision:** Timestamp the content, never the gap. "3 new roles since your last visit" = good (creates anticipation). "You were last here 6 days ago" = bad (creates guilt). Time appears on new content only.

### Q4: How are multiple new things structured in the left column?
**Decision:** Option A — one featured primary action gets the headline treatment ("2 new roles matched — one of them's really strong"), then a compact secondary list of other new items below. Arlo handles detail and depth in the right panel. The left column must change between visits — a static left column would make returns feel repetitive fast. The left column signals "something happened."

### Q3: Time elapsed — does the experience change?
**Decision:** UI structure stays the same regardless of time away. Arlo's tone shifts:
- 1–3 days: Normal continuation. "Here's what's new."
- 4–7 days: Warmer re-entry. "Good to have you back. Here's where we are."
- 7+ days: NOT "nothing to catch up on" — instead: excitement about what happened. "Things have moved while you were away — let's get into it." Surfaces everything new, presented without overwhelm.

**Pacing by user maturity:**
- New users: 1–2 actions surfaced per session. Slower build. Don't throw the product at them.
- Regular daily users: more active, multiple things can be presented.
- The platform calibrates to engagement level over time — not a fixed cap.

**Key principle:** Overwhelm comes from *presentation*, not *volume*. You can surface 4 things without it feeling like a to-do list if Arlo frames it right.

### Q2: What's the primary draw to return?
**Decision:** Both new content AND Arlo. "What's new" is a priority stack:
1. New role matches (trumps everything — surface prominently when available)
2. New contacts worth reaching out to (relevant to saved roles)
3. New skills or something worth building toward
4. Arlo always has something — even when nothing is new, Arlo can reference what the user has done or prompt a next step

The draw can't be fragile (only new roles). The durable draw is Arlo — always has something worth saying. New roles are a bonus that take priority when available.

### Q1: First dashboard visit — continuation of Satori or new energy?
**Decision:** The onboarding bridge is the reveal. The dashboard is the workspace. First visit energy = "stepping in" — Arlo orients the user to what's available without a formal demo. Arlo gradually introduces features and how to engage through natural prompts, not a product tour or modal walkthrough. "Here's what I found. Start with the top role — it's less obvious than it sounds." Then subsequent messages introduce capabilities as relevant.

## Open Flags
(things to follow up on — missing info, people to ask, research needed)

## Parking Lot
- **Social signal feature (Phase 3):** If a user has saved a role, surface relevant public signals about that company — someone posting about working there, a funding announcement, a news story. Arlo brings it up proactively. Lexi flagged this mid-session as something she liked about the draft Arlo message: "You saved three roles before — the Bloom & Wild ops position... There's a person there worth reaching out to directly."
