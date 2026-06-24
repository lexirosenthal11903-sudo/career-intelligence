# Applications Tab — Brainstorm
_Status: Complete_

## Summary & Key Decisions
(fills in as we go)

## Q&A Log

**Q1: What is the primary job of the Applications tab?**
A: Progress tracker, not a list. "What do I need to do next?" — not a duplicate of Roles.

**Q2: Where do saved jobs live?**
A: Roles tab. Saved = passive interest. Applications = active pursuit. These are two different intents. SESSION_DECISIONS.md confirms: Roles tab shows saved cards with green "Saved" badge.

**Decision:** A job moves from Roles → Applications via an explicit user action ("I'm applying" or equivalent). Not automatic.

**Q3: Should "Saved" be a stage in the Applications pipeline?**
A: No. Saved lives on Roles tab. Applications pipeline = 4 stages: Preparing → Applied → Interview → Offer. Plus Closed (rejected/expired) and Withdrawn (user opted out).

**Q4: How do we handle multi-stage processes (tests, multiple interview rounds)?**
A: Fixed pipeline stages + checklist inside each card. "Interview" stays one stage but supports sub-tasks. Arlo can help populate them ("This company typically has a two-stage process — want me to add that?"). No custom sub-stages in v1.

**Q5: Auto-closing when a listing expires?**
A: Yes — platform polls Adzuna, flags application as Closed when listing disappears. Engineering concern for Phase 1.

**Q6: Closing date urgency?**
A: Two-layer approach:
- 7 days out: closing date on card turns amber (passive visual cue)
- 3 days out: Arlo proactively flags it in his panel
- Expired: card auto-moves to Closed
Withdrawn = separate state for when the user opts out (distinct from rejected).

**Q9: Layout — list or kanban?**
A: List view (Option A). Kanban looks right in theory but Arlo gets squeezed. This product is about knowing what to do next, not visualising a pipeline. Stage filter at top, one card per application.

**Additional decisions:**
- Arlo panel is collapsible on every tab (global dashboard shell decision). Collapsed = full-width content. Toggle icon on edge restores. Conversation preserved.
- Application focus/work mode (when user clicks "next step") = separate screen, separate design session. Parked.

**Q11: How does the user move a card between stages?**
A: Button on the card ("Mark as applied", "Move to Interview") — not drag-and-drop. Arlo can also do it conversationally. Both routes work.

**Q10: How does a job move from Roles → Applications?**
A: One tap on "I'm applying" button on saved Roles cards. Promotes to Preparing stage. No confirmation modal. Arlo acknowledges and suggests a first step. Visual detail resolved when Roles tab mockup is revisited.

**Q7: What does an application card show?**
A: Company name, role title, closing date, current stage, one next action. The "next action" is key — every card answers "what do I do next?" Arlo populates this.

**Q8: Does Arlo reset when switching tabs?**
A: No. One continuous conversation — Arlo shifts focus naturally per tab but never resets mid-session. Exception: returning after a full day away = natural fresh opening. Tab-switching resets would break the "daily companion" promise.

**Q12: Where do Closed and Withdrawn applications live?**
A: "Archive" pill at the end of the stage filter. Not prominent — not actionable. Both Closed and Withdrawn live there, labelled to distinguish them.

**Q13: Empty state?**
A: Arlo fills the gap with a contextual message — not a blank screen or generic empty state copy. Left side shows a quiet empty state; Arlo explains what to do and how to get started.

---

## Summary & Key Decisions

1. Applications tab = progress tracker. Primary question answered: "what do I do next?"
2. Saved jobs live on Roles tab. Applications = active pursuit only.
3. Pipeline stages: Preparing → Applied → Interview → Offer. Plus Archive (Closed + Withdrawn).
4. Auto-close when listing expires (engineering, Phase 1).
5. Cards show: company, role, closing date, current stage, one next action.
6. Closing urgency: amber at 7 days, Arlo flags at 3 days, auto-archive on expiry.
7. Multi-stage processes handled via checklist inside the card, not custom sub-stages.
8. Arlo does not reset per tab — one continuous conversation, focus shifts naturally.
9. Layout: list view with stage filter (Option A). Arlo gets full half-panel.
10. Arlo panel is collapsible globally across all tabs.
11. Jobs move Roles → Applications via one-tap "I'm applying" button. No confirmation.
12. Stage moves via button on card or conversationally through Arlo.
13. Empty state: Arlo fills it with contextual guidance.
14. Platform intelligence principle: every action feeds learning back into user profile and platform. Design all Phase 1 schemas with this in mind.

**Q14: Should the platform predict or infer dates — e.g. "expected reply in 10 days"?**
A: No. The platform only surfaces confirmed, factual information. Dates must be user-entered or pulled from a verified source (e.g. Adzuna listing). No predicted reply dates, no inferred timelines, no "company X typically responds in N days" — that is a future feature requiring aggregate platform data. Not v1. If it isn't confirmed, it doesn't appear on a card.
**Corollary for Arlo:** Arlo can offer advice framed as suggestion ("second rounds at companies like this tend to be case-based") but must never state predictions as facts ("they'll reply by Friday").

## Open Flags

- Application focus/work mode (when user clicks "next step") — dedicated design session after Applications tab is locked
- Arlo collapse toggle — design as part of dashboard shell spec, applies to all tabs
- "I'm applying" button visual — resolve when Roles tab mockup is revisited
- Platform intelligence schema — flag explicitly in Phase 1 Supabase schema session
